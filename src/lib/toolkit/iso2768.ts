/** ISO 2768:1989 general tolerances. Over lower, up to and including upper. */
export type LinearClass = "f" | "m" | "c" | "v";
export type FormClass = "H" | "K" | "L";

export const LINEAR_CLASSES: { id: LinearClass; label: string }[] = [
  { id: "f", label: "f — fijn" },
  { id: "m", label: "m — gemiddeld" },
  { id: "c", label: "c — grof" },
  { id: "v", label: "v — zeer grof" },
];

export const FORM_CLASSES: { id: FormClass; label: string }[] = [
  { id: "H", label: "H" },
  { id: "K", label: "K" },
  { id: "L", label: "L" },
];

export type Band = {
  label: string;
  /** Inclusive lower bound, used for 0,5 ≤ L. */
  from?: number;
  /** Exclusive lower bound ("over"). */
  over: number | null;
  /** Inclusive upper bound. Null = no upper. */
  to: number | null;
};

export function inBand(L: number, b: Band) {
  if (b.from != null && L < b.from) return false;
  if (b.over != null && L <= b.over) return false;
  if (b.to != null && L > b.to) return false;
  return true;
}

export function bandIndex(L: number, bands: readonly Band[]) {
  return bands.findIndex((b) => inBand(L, b));
}

export const LINEAR_BANDS: Band[] = [
  { from: 0.5, over: null, to: 3, label: "0,5 t/m 3" },
  { over: 3, to: 6, label: "boven 3 t/m 6" },
  { over: 6, to: 30, label: "boven 6 t/m 30" },
  { over: 30, to: 120, label: "boven 30 t/m 120" },
  { over: 120, to: 400, label: "boven 120 t/m 400" },
  { over: 400, to: 1000, label: "boven 400 t/m 1000" },
  { over: 1000, to: 2000, label: "boven 1000 t/m 2000" },
  { over: 2000, to: 4000, label: "boven 2000 t/m 4000" },
];

export const LINEAR: Record<LinearClass, (number | null)[]> = {
  f: [0.05, 0.05, 0.1, 0.15, 0.2, 0.3, 0.5, null],
  m: [0.1, 0.1, 0.2, 0.3, 0.5, 0.8, 1.2, 2.0],
  c: [0.2, 0.3, 0.5, 0.8, 1.2, 2.0, 3.0, 4.0],
  v: [null, 0.5, 1.0, 1.5, 2.5, 4.0, 6.0, 8.0],
};

export const RADII_BANDS: Band[] = [
  { from: 0.5, over: null, to: 3, label: "0,5 t/m 3" },
  { over: 3, to: 6, label: "boven 3 t/m 6" },
  { over: 6, to: null, label: "boven 6" },
];

export const RADII: Record<LinearClass, number[]> = {
  f: [0.2, 0.5, 1.0],
  m: [0.2, 0.5, 1.0],
  c: [0.4, 1.0, 2.0],
  v: [0.4, 1.0, 2.0],
};

export const ANGULAR_BANDS: Band[] = [
  { over: null, to: 10, label: "t/m 10" },
  { over: 10, to: 50, label: "boven 10 t/m 50" },
  { over: 50, to: 120, label: "boven 50 t/m 120" },
  { over: 120, to: 400, label: "boven 120 t/m 400" },
  { over: 400, to: null, label: "boven 400" },
];

export const ANGULAR: Record<LinearClass, string[]> = {
  f: ["1°", "0°30′", "0°20′", "0°10′", "0°5′"],
  m: ["1°", "0°30′", "0°20′", "0°10′", "0°5′"],
  c: ["1°30′", "1°", "0°30′", "0°15′", "0°10′"],
  v: ["3°", "2°", "1°", "0°30′", "0°20′"],
};

export const STRAIGHT_BANDS: Band[] = [
  { over: null, to: 10, label: "t/m 10" },
  { over: 10, to: 30, label: "boven 10 t/m 30" },
  { over: 30, to: 100, label: "boven 30 t/m 100" },
  { over: 100, to: 300, label: "boven 100 t/m 300" },
  { over: 300, to: 1000, label: "boven 300 t/m 1000" },
  { over: 1000, to: 3000, label: "boven 1000 t/m 3000" },
];

export const STRAIGHT: Record<FormClass, number[]> = {
  H: [0.02, 0.05, 0.1, 0.2, 0.3, 0.4],
  K: [0.05, 0.1, 0.2, 0.4, 0.6, 0.8],
  L: [0.1, 0.2, 0.4, 0.8, 1.2, 1.6],
};

export const PERP_BANDS: Band[] = [
  { over: null, to: 100, label: "t/m 100" },
  { over: 100, to: 300, label: "boven 100 t/m 300" },
  { over: 300, to: 1000, label: "boven 300 t/m 1000" },
  { over: 1000, to: 3000, label: "boven 1000 t/m 3000" },
];

export const PERP: Record<FormClass, number[]> = {
  H: [0.2, 0.3, 0.4, 0.5],
  K: [0.4, 0.6, 0.8, 1.0],
  L: [0.6, 1.0, 1.5, 2.0],
};

export const SYMM: Record<FormClass, number[]> = {
  H: [0.5, 0.5, 0.5, 0.5],
  K: [0.6, 0.6, 0.8, 1.0],
  L: [0.6, 1.0, 1.5, 2.0],
};

export const RUNOUT: Record<FormClass, number> = {
  H: 0.1,
  K: 0.2,
  L: 0.5,
};

function pick<T>(L: number, bands: readonly Band[], values: readonly T[]): { i: number; value: T | null } {
  const i = bandIndex(L, bands);
  if (i < 0) return { i: -1, value: null };
  const value = values[i];
  return { i, value: value ?? null };
}

export function designation(linear: LinearClass, form: FormClass) {
  return `ISO 2768-${linear}${form}`;
}

export type Iso2768Hit = {
  ok: true;
  designation: string;
  linearClass: LinearClass;
  formClass: FormClass;
  linear: number | null;
  linearBand: number;
  radii: number | null;
  radiiBand: number;
  angular: string | null;
  angularBand: number;
  straightness: number | null;
  straightBand: number;
  perpendicularity: number | null;
  perpBand: number;
  symmetry: number | null;
  symmBand: number;
  runout: number;
};

export type Iso2768Result = { ok: false } | Iso2768Hit;

export function lookupIso2768(L: number, linear: LinearClass, form: FormClass): Iso2768Result {
  if (!Number.isFinite(L) || L < 0.5) return { ok: false };
  const lin = pick(L, LINEAR_BANDS, LINEAR[linear]);
  const rad = pick(L, RADII_BANDS, RADII[linear]);
  const ang = pick(L, ANGULAR_BANDS, ANGULAR[linear]);
  const str = pick(L, STRAIGHT_BANDS, STRAIGHT[form]);
  const perp = pick(L, PERP_BANDS, PERP[form]);
  const sym = pick(L, PERP_BANDS, SYMM[form]);
  return {
    ok: true,
    designation: designation(linear, form),
    linearClass: linear,
    formClass: form,
    linear: lin.value,
    linearBand: lin.i,
    radii: rad.value,
    radiiBand: rad.i,
    angular: ang.value,
    angularBand: ang.i,
    straightness: str.value,
    straightBand: str.i,
    perpendicularity: perp.value,
    perpBand: perp.i,
    symmetry: sym.value,
    symmBand: sym.i,
    runout: RUNOUT[form],
  };
}

export function fmtTol(n: number) {
  return n.toLocaleString("nl-NL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
}

export function fmtPlusMinus(n: number | null) {
  if (n == null) return "—";
  return `±${fmtTol(n)}`;
}

export function fmtForm(n: number | null) {
  if (n == null) return "—";
  return fmtTol(n);
}

export function parseLengthMm(
  raw: string,
): { status: "empty" } | { status: "invalid" } | { status: "ok"; mm: number } {
  const t = raw.trim().replace(",", ".");
  if (t === "") return { status: "empty" };
  if (!/^\d+(\.\d+)?$/.test(t)) return { status: "invalid" };
  const mm = Number.parseFloat(t);
  if (!Number.isFinite(mm)) return { status: "invalid" };
  return { status: "ok", mm };
}
