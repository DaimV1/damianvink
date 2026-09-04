/**
 * Theoretical pneumatic cylinder force. F = p·A, gauge pressure.
 * ISO 15552 / ISO 6432 basic piston-rod diameters (not oversized rods).
 * No friction, no Festo/SMC type code.
 */
import { computeBuckling, END_CONDITIONS } from "./knik.ts";

/** 1 bar (gauge) = 0,1 N/mm². */
export const BAR_N_PER_MM2 = 0.1;

export type SeriesId = "iso15552" | "iso6432";
export type StrokeDir = "uit" | "in";

export type CylinderRow = {
  series: SeriesId;
  bore: number;
  rod: number;
};

/** ISO 15552 profile cylinders, basic rod. Ø 32–320 mm. */
export const ISO_15552: readonly CylinderRow[] = [
  { series: "iso15552", bore: 32, rod: 12 },
  { series: "iso15552", bore: 40, rod: 16 },
  { series: "iso15552", bore: 50, rod: 20 },
  { series: "iso15552", bore: 63, rod: 20 },
  { series: "iso15552", bore: 80, rod: 25 },
  { series: "iso15552", bore: 100, rod: 25 },
  { series: "iso15552", bore: 125, rod: 32 },
  { series: "iso15552", bore: 160, rod: 40 },
  { series: "iso15552", bore: 200, rod: 40 },
  { series: "iso15552", bore: 250, rod: 50 },
  { series: "iso15552", bore: 320, rod: 63 },
];

export const ISO_6432: readonly CylinderRow[] = [
  { series: "iso6432", bore: 8, rod: 4 },
  { series: "iso6432", bore: 10, rod: 4 },
  { series: "iso6432", bore: 12, rod: 6 },
  { series: "iso6432", bore: 16, rod: 6 },
  { series: "iso6432", bore: 20, rod: 8 },
  { series: "iso6432", bore: 25, rod: 10 },
];

/** Mini first (Ø8–25), then profile (Ø32–320). Bore is the result; series follows. */
export const CATALOG: readonly CylinderRow[] = [...ISO_6432, ...ISO_15552];

export function pistonAreaMm2(bore: number) {
  return (Math.PI * bore * bore) / 4;
}

export function annulusAreaMm2(bore: number, rod: number) {
  return pistonAreaMm2(bore) - pistonAreaMm2(rod);
}

export function forceN(pBar: number, areaMm2: number) {
  return pBar * BAR_N_PER_MM2 * areaMm2;
}

export function forcesAt(row: CylinderRow, pBar: number) {
  const A = pistonAreaMm2(row.bore);
  const Aann = annulusAreaMm2(row.bore, row.rod);
  return {
    A,
    Aann,
    F_uit: forceN(pBar, A),
    F_in: forceN(pBar, Aann),
  };
}

/** Theoretical piston Ø (mm) so F_uit ≥ need. Retract needs a larger bore. */
export function minPistonMm(needN: number, pBar: number) {
  if (!(needN > 0) || !(pBar > 0)) return null;
  const A = needN / (pBar * BAR_N_PER_MM2);
  return Math.sqrt((4 * A) / Math.PI);
}

export function availableN(row: CylinderRow, pBar: number, dir: StrokeDir) {
  const f = forcesAt(row, pBar);
  return dir === "uit" ? f.F_uit : f.F_in;
}

/**
 * First catalog bore whose theoretical force (no friction) covers F·S
 * in the chosen direction.
 */
export function sizeCylinder({
  loadN,
  pBar,
  S,
  dir,
}: {
  loadN: number;
  pBar: number;
  S: number;
  dir: StrokeDir;
}): CylinderRow | null {
  if (!(loadN > 0) || !(pBar > 0) || !(S > 0)) return null;
  const need = loadN * S;
  return CATALOG.find((row) => availableN(row, pBar, dir) >= need - 1e-9) ?? null;
}

/**
 * Free-air volume for one double-acting cycle (extend + retract).
 * Shop approximation: (p + 1) bar absolute, 1 bar ≈ normaaldruk.
 * A in mm², s in mm → liters.
 */
export function cycleLiters(row: CylinderRow, pBar: number, strokeMm: number) {
  if (!(strokeMm > 0) || !(pBar >= 0)) return null;
  const { A, Aann } = forcesAt(row, pBar);
  return ((A + Aann) * strokeMm * (pBar + 1)) / 1e6;
}

/**
 * Fixed–free (kDesign 2,1, per knik.ts) — the conservative default when the
 * actual mounting (clevis, trunnion, foot) isn't known. Exposed rod length
 * ≈ stroke; any guide/bearing length inside the head isn't subtracted. Rod
 * assumed hardened/ground steel (E ≈ 210 000 N/mm²) regardless of body
 * material. Indicative worst case, push (F_uit) direction only — for a known
 * mounting and length, use the general Euler-knik tool.
 */
/** Single source of truth: knik.ts's END_CONDITIONS "fc" (fixed-free) kDesign — the same value the Euler-knik tool now uses for its own fixed-free case. */
export const ROD_BUCKLING_K_DESIGN = END_CONDITIONS.find((c) => c.id === "fc")!.kDesign;
export const ROD_STEEL_E = 210000;
/** Conservative generic steel yield, matching knik.ts's own "staal" entry — deliberately low, not a specific hardened-rod-steel grade. */
export const ROD_STEEL_RP02 = 235;
/** Pneumatic rod buckling is conventionally checked at 3.5-5, not "any S above 1". */
export const ROD_BUCKLING_MIN_SAFETY = 3.5;

export type RodBucklingResult = ReturnType<typeof computeBuckling> & {
  /** True when λ is below the Euler validity limit: F_cr above is capped at the squash load (A·Rp0.2), not a real Euler value. */
  belowEulerLimit: boolean;
  /** S below this is a real concern even if S ≥ 1 — see ROD_BUCKLING_MIN_SAFETY. */
  belowRecommendedSafety: boolean;
};

/**
 * Buckling length = stroke + rod protrusion into the mounting (guide/bearing
 * length inside the head is not stroke). No protrusion figure is known here,
 * so this stays a worst-case default (protrusion = 0) unless the caller
 * supplies one.
 */
export function rodBucklingCheck(
  rodMm: number,
  strokeMm: number,
  pushForceN: number,
  protrusionMm = 0,
): RodBucklingResult | null {
  if (!(rodMm > 0) || !(strokeMm > 0)) return null;
  const I = (Math.PI * rodMm ** 4) / 64;
  const A = (Math.PI * rodMm ** 2) / 4;
  const L = strokeMm + Math.max(0, protrusionMm);
  const raw = computeBuckling({ L, k: ROD_BUCKLING_K_DESIGN, E: ROD_STEEL_E, I, A, F: pushForceN });
  if (!raw) return null;

  // Euler only applies above the slenderness limit λ = π√(E/Rp0.2); below it
  // the rod squashes before it buckles, and the Euler formula overestimates
  // the real capacity — sometimes by a large factor. Cap F_cr at the squash
  // load (A·Rp0.2) in that regime instead of publishing the (unsafe) Euler
  // number, per lambdaLimit() in knik.ts.
  const lambdaLim = Math.PI * Math.sqrt(ROD_STEEL_E / ROD_STEEL_RP02);
  const belowEulerLimit = raw.lambda < lambdaLim;
  const squashLoad = A * ROD_STEEL_RP02;
  const Fcr = belowEulerLimit ? Math.min(raw.Fcr, squashLoad) : raw.Fcr;
  const sigmaCr = Fcr / A;
  const safety = pushForceN > 0 ? Fcr / pushForceN : null;

  return {
    ...raw,
    Fcr,
    sigmaCr,
    safety,
    belowEulerLimit,
    belowRecommendedSafety: safety != null && safety < ROD_BUCKLING_MIN_SAFETY,
  };
}

export function seriesLabel(series: SeriesId) {
  return series === "iso15552" ? "ISO 15552" : "ISO 6432";
}

export function copyLine({
  row,
  pBar,
  loadN,
  S,
  dir,
  F_uit,
  F_in,
}: {
  row: CylinderRow;
  pBar: number;
  loadN: number;
  S: number;
  dir: StrokeDir;
  F_uit: number;
  F_in: number;
}) {
  const p = fmtDot(pBar, 2);
  const s = fmtDot(S, 2);
  const load = fmtDot(loadN, 0);
  const uit = fmtDot(F_uit, 0);
  const inn = fmtDot(F_in, 0);
  const side = dir === "uit" ? "uitgaan" : "binnenhalen";
  return `Ø${row.bore}/${row.rod} ${seriesLabel(row.series)} · ${p} bar · F_uit ${uit} N · F_in ${inn} N · last ${load} N · S=${s} · ${side}`;
}

function fmtDot(n: number, digits: number) {
  return n.toFixed(digits).replace(".", ",").replace(/,00$/, "");
}
