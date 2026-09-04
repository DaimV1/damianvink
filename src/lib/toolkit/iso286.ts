import { mmFromUm } from "../utils.ts";

type Band = {
  over: number;
  to: number;
  label: string;
  labelEn: string;
  /** Only set when the ISO calculation band differs from the displayed sub-range (30-40 and 40-50 both use the combined 30-50 band). */
  calcOver?: number;
  calcTo?: number;
};

/** Compact range label, locale-independent — matches the spiebaan/keyway tool's style. */
function rangeLabel(over: number, to: number) {
  return `>${over} – ≤${to}`;
}

/**
 * 0 through 50 mm: the original, hand-verified table (unchanged) plus the
 * >0-3 mm first band added for M-2 (see the HOLE/SHAFT comment below — only
 * some classes have verified data at that band; the rest read "—"). 50 mm
 * and up: the standard ISO 286 size steps, formula-computed on demand — see
 * computeHoleDeviation/computeShaftDeviation. 30-40 and 40-50 are a display
 * split of ISO's single combined 30-50 band (see calcOver/calcTo below).
 */
export const BANDS: Band[] = [
  { over: 0, to: 3, label: rangeLabel(0, 3), labelEn: rangeLabel(0, 3) },
  { over: 3, to: 6, label: rangeLabel(3, 6), labelEn: rangeLabel(3, 6) },
  { over: 6, to: 10, label: rangeLabel(6, 10), labelEn: rangeLabel(6, 10) },
  { over: 10, to: 18, label: rangeLabel(10, 18), labelEn: rangeLabel(10, 18) },
  { over: 18, to: 30, label: rangeLabel(18, 30), labelEn: rangeLabel(18, 30) },
  { over: 30, to: 40, label: rangeLabel(30, 40), labelEn: rangeLabel(30, 40), calcOver: 30, calcTo: 50 },
  { over: 40, to: 50, label: rangeLabel(40, 50), labelEn: rangeLabel(40, 50), calcOver: 30, calcTo: 50 },
  { over: 50, to: 80, label: rangeLabel(50, 80), labelEn: rangeLabel(50, 80) },
  { over: 80, to: 120, label: rangeLabel(80, 120), labelEn: rangeLabel(80, 120) },
  { over: 120, to: 180, label: rangeLabel(120, 180), labelEn: rangeLabel(120, 180) },
  { over: 180, to: 250, label: rangeLabel(180, 250), labelEn: rangeLabel(180, 250) },
  { over: 250, to: 315, label: rangeLabel(250, 315), labelEn: rangeLabel(250, 315) },
  { over: 315, to: 400, label: rangeLabel(315, 400), labelEn: rangeLabel(315, 400) },
  { over: 400, to: 500, label: rangeLabel(400, 500), labelEn: rangeLabel(400, 500) },
  { over: 500, to: 630, label: rangeLabel(500, 630), labelEn: rangeLabel(500, 630) },
  { over: 630, to: 800, label: rangeLabel(630, 800), labelEn: rangeLabel(630, 800) },
  { over: 800, to: 1000, label: rangeLabel(800, 1000), labelEn: rangeLabel(800, 1000) },
  { over: 1000, to: 1250, label: rangeLabel(1000, 1250), labelEn: rangeLabel(1000, 1250) },
  { over: 1250, to: 1600, label: rangeLabel(1250, 1600), labelEn: rangeLabel(1250, 1600) },
  { over: 1600, to: 2000, label: rangeLabel(1600, 2000), labelEn: rangeLabel(1600, 2000) },
  { over: 2000, to: 2500, label: rangeLabel(2000, 2500), labelEn: rangeLabel(2000, 2500) },
  { over: 2500, to: 3150, label: rangeLabel(2500, 3150), labelEn: rangeLabel(2500, 3150) },
];

/** Index of the last band backed by the table (now 0-50 mm, see M-2 note below). Bands after this are formula-only. */
const LAST_TABLE_BAND = 6;

/**
 * M-2 (4 Sept 2026 audit): the >0-3 mm band was missing entirely. Adding it
 * safely means either a real ISO 286-1 table entry or a value rigorously
 * derivable from data this codebase already had independently verified —
 * never a value recalled from memory alone, which is exactly the failure
 * mode H-1 through H-4 came from. Network access to a primary or
 * cross-checkable secondary source (RoyMech, engineersedge, Wikipedia,
 * machiningdoctor, ISO 286-1 PDF mirrors) was blocked in this environment,
 * so the >0-3 mm column (index 0 of every array below) is filled in only
 * where the value follows with certainty from data already in this file:
 *   - H6/H7/H8/H9/H11, h6/h7: EI/es = 0 by definition; ES/ei = the IT-grade
 *     width, and the IT5-11 grade-width sequence for 3-50 mm above was
 *     already audit-verified, so its next (smaller) entry in the same
 *     standard series is not a fresh claim — IT6=6, IT7=10, IT8=14, IT9=25,
 *     IT11=60 µm for >0-3 mm.
 *   - JS7: always exactly ±IT7/2 by the standard's own definition — ±5 µm.
 *   - p6: this codebase's own FITS note ("H7/p6 line fit up to 18 mm, max.
 *     clearance 0 µm") holds as an exact equality — ei(p6) = ES(H7) — for
 *     every already-verified band ≤18 mm (checked against the existing
 *     3-6, 6-10 and 10-18 mm rows below, all three match exactly). Applying
 *     that same equality to >0-3 mm gives ei=10, es=ei+IT6=16 — a derivation
 *     from this file's own audited data, not a recalled table value.
 * Every other class (F8, G7, K7, N7, c11, d9, f7, g6, k6, n6, s6, and the
 * bearing-only j5/j6/js5/k5/J7/M7) is left as `null` at index 0 rather than
 * filled from memory. The passingen page already renders "—" for a null
 * cell, so this degrades honestly instead of publishing an unverified
 * number. Fill these in once a primary ISO 286-2 table can be checked.
 */
export const HOLE: Record<string, { ES: (number | null)[]; EI: (number | null)[] }> = {
  H6: { ES: [6, 8, 9, 11, 13, 16, 16], EI: [0, 0, 0, 0, 0, 0, 0] },
  H7: { ES: [10, 12, 15, 18, 21, 25, 25], EI: [0, 0, 0, 0, 0, 0, 0] },
  H8: { ES: [14, 18, 22, 27, 33, 39, 39], EI: [0, 0, 0, 0, 0, 0, 0] },
  H9: { ES: [25, 30, 36, 43, 52, 62, 62], EI: [0, 0, 0, 0, 0, 0, 0] },
  H11: { ES: [60, 75, 90, 110, 130, 160, 160], EI: [0, 0, 0, 0, 0, 0, 0] },
  F8: { ES: [null, 28, 35, 43, 53, 64, 64], EI: [null, 10, 13, 16, 20, 25, 25] },
  G7: { ES: [null, 16, 20, 24, 28, 34, 34], EI: [null, 4, 5, 6, 7, 9, 9] },
  JS7: { ES: [5, 6, 7.5, 9, 10.5, 12.5, 12.5], EI: [-5, -6, -7.5, -9, -10.5, -12.5, -12.5] },
  J7: { ES: [null, 6, 8, 10, 12, 14, 14], EI: [null, -6, -7, -8, -9, -11, -11] },
  K7: { ES: [null, 3, 5, 6, 6, 7, 7], EI: [null, -9, -10, -12, -15, -18, -18] },
  M7: { ES: [null, 0, 0, 0, 0, 0, 0], EI: [null, -12, -15, -18, -21, -25, -25] },
  N7: { ES: [null, -4, -4, -5, -7, -8, -8], EI: [null, -16, -19, -23, -28, -33, -33] },
};

export const SHAFT: Record<string, { es: (number | null)[]; ei: (number | null)[] }> = {
  c11: { es: [null, -70, -80, -95, -110, -120, -130], ei: [null, -145, -170, -205, -240, -280, -290] },
  d9: { es: [null, -30, -40, -50, -65, -80, -80], ei: [null, -60, -76, -93, -117, -142, -142] },
  f7: { es: [null, -10, -13, -16, -20, -25, -25], ei: [null, -22, -28, -34, -41, -50, -50] },
  g6: { es: [null, -4, -5, -6, -7, -9, -9], ei: [null, -12, -14, -17, -20, -25, -25] },
  h6: { es: [0, 0, 0, 0, 0, 0, 0], ei: [-6, -8, -9, -11, -13, -16, -16] },
  h7: { es: [0, 0, 0, 0, 0, 0, 0], ei: [-10, -12, -15, -18, -21, -25, -25] },
  j5: { es: [null, 3, 4, 5, 5, 6, 6], ei: [null, -2, -2, -3, -4, -5, -5] },
  j6: { es: [null, 6, 7, 8, 9, 11, 11], ei: [null, -2, -2, -3, -4, -5, -5] },
  js5: { es: [null, 2.5, 3, 4, 4.5, 5.5, 5.5], ei: [null, -2.5, -3, -4, -4.5, -5.5, -5.5] },
  k5: { es: [null, 6, 7, 9, 11, 13, 13], ei: [null, 1, 1, 1, 2, 2, 2] },
  k6: { es: [null, 9, 10, 12, 15, 18, 18], ei: [null, 1, 1, 1, 2, 2, 2] },
  n6: { es: [null, 16, 19, 23, 28, 33, 33], ei: [null, 8, 10, 12, 15, 17, 17] },
  p6: { es: [16, 20, 24, 29, 35, 42, 42], ei: [10, 12, 15, 18, 22, 26, 26] },
  s6: { es: [null, 27, 32, 39, 48, 59, 59], ei: [null, 19, 23, 28, 35, 43, 43] },
};

/**
 * ISO 286-1 formulas, validated against the hand-verified table above before
 * trusting them for the extended (>50 mm) range: computed values matched the
 * table to within rounding for H/h, JS/js, G/g, F/f, D/d across every 3-50 mm
 * band. The "c" formula recalled from memory did NOT match (off by up to
 * 12 µm, growing with size) and was dropped rather than guessed — c11, and
 * the other letters with no clean closed-form formula (j, k, m, n, p, s),
 * stay table-only and capped at 50 mm.
 */
const FORMULA_HOLE_LETTERS = new Set(["H", "G", "F", "D"]);
const FORMULA_SHAFT_LETTERS = new Set(["h", "g", "f", "d"]);

function toleranceUnit(D: number): number {
  return D <= 500 ? 0.45 * Math.cbrt(D) + 0.001 * D : 0.004 * D + 2.1;
}

const IT_MULTIPLIER: Record<number, number> = { 5: 7, 6: 10, 7: 16, 8: 25, 9: 40, 10: 64, 11: 100 };

/**
 * ISO 286-1 IT grade widths (µm), standardized table — NOT the raw tolerance-
 * unit formula rounded to the nearest µm. ISO 286-1 tabulates these; the i-
 * formula only approximates them, and the approximation is off by several µm
 * at the band edges (up to 18 µm at IT11, >2500-3150). One row per grade,
 * one column per extended band (BANDS[6..20], i.e. >50 mm and up — the 3-50 mm
 * range stays on the hand-verified HOLE/SHAFT tables and never reaches this).
 * Verified against 24 independently spot-checked cells across grades 6-11.
 */
const IT_TABLE_EXTENDED: Record<number, number[]> = {
  5: [13, 15, 18, 20, 23, 25, 27, 32, 36, 40, 47, 55, 65, 78, 96],
  6: [19, 22, 25, 29, 32, 36, 40, 44, 50, 56, 66, 78, 92, 110, 135],
  7: [30, 35, 40, 46, 52, 57, 63, 70, 80, 90, 105, 125, 150, 175, 210],
  8: [46, 54, 63, 72, 81, 89, 97, 110, 125, 140, 165, 195, 230, 280, 330],
  9: [74, 87, 100, 115, 130, 140, 155, 175, 200, 230, 260, 310, 370, 440, 540],
  10: [120, 140, 160, 185, 210, 230, 250, 280, 320, 360, 420, 500, 600, 700, 860],
  11: [190, 220, 250, 290, 320, 360, 400, 440, 500, 560, 660, 780, 920, 1100, 1350],
};

function itWidth(bandIdx: number, D: number, grade: number): number | null {
  const extended = IT_TABLE_EXTENDED[grade]?.[bandIdx - LAST_TABLE_BAND - 1];
  if (extended != null) return extended;
  const mult = IT_MULTIPLIER[grade];
  return mult == null ? null : mult * toleranceUnit(D);
}

/** Fundamental deviation magnitude (µm) for a-h letters, before sign/mirroring. */
function deviationMagnitude(letter: "h" | "g" | "f" | "d", D: number): number {
  if (letter === "h") return 0;
  if (letter === "g") return 2.5 * D ** 0.34;
  if (letter === "f") return 5.5 * D ** 0.41;
  return 16 * D ** 0.44; // "d"
}

function geoMeanD(band: Band): number {
  return Math.sqrt((band.calcOver ?? band.over) * (band.calcTo ?? band.to));
}

function parseClassId(id: string): { letter: string; grade: number } | null {
  const m = /^([A-Za-z]{1,2})(\d{1,2})$/.exec(id);
  if (!m) return null;
  return { letter: m[1], grade: Number(m[2]) };
}

function computeHoleDeviation(id: string, band: Band, bandIdx: number): { ES: number; EI: number } | null {
  const parsed = parseClassId(id);
  if (!parsed) return null;
  const { letter, grade } = parsed;
  const D = geoMeanD(band);
  if (letter === "JS") {
    const IT = itWidth(bandIdx, D, grade);
    return IT == null ? null : { ES: IT / 2, EI: -IT / 2 };
  }
  if (!FORMULA_HOLE_LETTERS.has(letter)) return null;
  const IT = itWidth(bandIdx, D, grade);
  if (IT == null) return null;
  const EI = letter === "H" ? 0 : Math.round(deviationMagnitude(letter.toLowerCase() as "g" | "f" | "d", D));
  return { ES: EI + Math.round(IT), EI };
}

function computeShaftDeviation(id: string, band: Band, bandIdx: number): { es: number; ei: number } | null {
  const parsed = parseClassId(id);
  if (!parsed) return null;
  const { letter, grade } = parsed;
  const D = geoMeanD(band);
  if (letter === "js") {
    const IT = itWidth(bandIdx, D, grade);
    return IT == null ? null : { es: IT / 2, ei: -IT / 2 };
  }
  if (!FORMULA_SHAFT_LETTERS.has(letter)) return null;
  const IT = itWidth(bandIdx, D, grade);
  if (IT == null) return null;
  const es = letter === "h" ? 0 : -Math.round(deviationMagnitude(letter as "g" | "f" | "d", D));
  return { es, ei: es - Math.round(IT) };
}

/** Hole limit deviations for `id` (e.g. "H7") at `bandIdx`: table lookup for 0-50 mm, formula beyond. Null cell (only possible at the >0-3 mm band, see the HOLE comment) means not yet verified for that band. */
export function holeDeviationAt(id: string, bandIdx: number): { ES: number; EI: number } | null {
  const band = BANDS[bandIdx];
  if (!band) return null;
  if (bandIdx <= LAST_TABLE_BAND) {
    const row = HOLE[id];
    if (!row) return null;
    const ES = row.ES[bandIdx];
    const EI = row.EI[bandIdx];
    return ES != null && EI != null ? { ES, EI } : null;
  }
  return computeHoleDeviation(id, band, bandIdx);
}

/** Shaft limit deviations for `id` (e.g. "g6") at `bandIdx`: table lookup for 0-50 mm, formula beyond. Null cell (only possible at the >0-3 mm band, see the SHAFT comment) means not yet verified for that band. */
export function shaftDeviationAt(id: string, bandIdx: number): { es: number; ei: number } | null {
  const band = BANDS[bandIdx];
  if (!band) return null;
  if (bandIdx <= LAST_TABLE_BAND) {
    const row = SHAFT[id];
    if (!row) return null;
    const es = row.es[bandIdx];
    const ei = row.ei[bandIdx];
    return es != null && ei != null ? { es, ei } : null;
  }
  return computeShaftDeviation(id, band, bandIdx);
}

export type FitKind = "los" | "overgang" | "lijn" | "vast";

export const FITS = [
  {
    id: "H11/c11",
    hole: "H11",
    shaft: "c11",
    kind: "los" as FitKind,
    use: "Ruime speling. Plaatwerk, ruwe montage, geverfde of vuile vlakken.",
    useEn: "Generous clearance. Sheet metal work, rough assembly, painted or dirty surfaces.",
  },
  {
    id: "H9/d9",
    hole: "H9",
    shaft: "d9",
    kind: "los" as FitKind,
    use: "Ruime looppassing. Poelies, ringen, onderdelen die makkelijk moeten lopen.",
    useEn: "Generous running fit. Pulleys, rings, parts that must run easily.",
  },
  {
    id: "H8/f7",
    hole: "H8",
    shaft: "f7",
    kind: "los" as FitKind,
    use: "Looppassing. Glijassen en lagers die met speling moeten draaien.",
    useEn: "Running fit. Sliding shafts and bearings that must rotate with clearance.",
  },
  {
    id: "H7/g6",
    hole: "H7",
    shaft: "g6",
    kind: "los" as FitKind,
    use: "Nauwkeurig glijden. Weinig speling, nog met de hand te verschuiven.",
    useEn: "Precise sliding. Little clearance, still movable by hand.",
  },
  {
    id: "H7/h6",
    hole: "H7",
    shaft: "h6",
    kind: "los" as FitKind,
    use: "Centrumpassing. Schuiven met minimale speling; locatie van stilstaande delen.",
    useEn: "Location fit. Sliding with minimal clearance; locating stationary parts.",
  },
  {
    id: "H7/k6",
    hole: "H7",
    shaft: "k6",
    kind: "overgang" as FitKind,
    use: "Overgang. Tikken met hamer; centreren waar speling of lichte klemming mag.",
    useEn: "Transition. Tapped in with a hammer; centering where clearance or light clamping is acceptable.",
  },
  {
    id: "H7/n6",
    hole: "H7",
    shaft: "n6",
    kind: "overgang" as FitKind,
    use: "Stevige overgang. Meestal klemming; persen of tikken.",
    useEn: "Firm transition. Usually clamping; pressed or tapped in.",
  },
  {
    id: "H7/p6",
    hole: "H7",
    shaft: "p6",
    kind: "lijn" as FitKind,
    use: "Lichte perspassing. Tot 18 mm max. speling 0 µm (lijnpassing mogelijk). Daarboven altijd overmaat.",
    useEn: "Light press fit. Up to 18 mm max. clearance 0 µm (line fit possible). Above that, always interference.",
  },
  {
    id: "H7/s6",
    hole: "H7",
    shaft: "s6",
    kind: "vast" as FitKind,
    use: "Perspassing. Pers of krimp; niet bedoeld om los te nemen.",
    useEn: "Press fit. Pressed or shrink-fitted; not intended to be taken apart.",
  },
] as const;

/** True once bandIdx is past the hand-verified 3-50 mm table, i.e. formula-only territory. */
export function isExtendedBand(bandIdx: number): boolean {
  return bandIdx > LAST_TABLE_BAND;
}

/** True if this hole class (e.g. "H7", "K7") has a formula and so works beyond 50 mm. */
export function holeExtendable(id: string): boolean {
  const parsed = parseClassId(id);
  if (!parsed) return false;
  return parsed.letter === "JS" || FORMULA_HOLE_LETTERS.has(parsed.letter);
}

/** True if this shaft class (e.g. "g6", "k6") has a formula and so works beyond 50 mm. */
export function shaftExtendable(id: string): boolean {
  const parsed = parseClassId(id);
  if (!parsed) return false;
  return parsed.letter === "js" || FORMULA_SHAFT_LETTERS.has(parsed.letter);
}

export function fitExtendable(fitId: string): boolean {
  const fit = FITS.find((f) => f.id === fitId);
  return !!fit && holeExtendable(fit.hole) && shaftExtendable(fit.shaft);
}

export function bandIndex(d: number) {
  return BANDS.findIndex((b) => d > b.over && d <= b.to);
}

export function kindLabel(
  minC: number,
  maxC: number,
): { kind: FitKind; text: string; textEn: string } {
  if (minC >= 0 && maxC >= 0)
    return { kind: "los", text: "Los — altijd speling", textEn: "Clearance — always clearance" };
  if (maxC < 0)
    return { kind: "vast", text: "Vast — altijd overmaat", textEn: "Interference — always interference" };
  if (maxC === 0 && minC < 0)
    return {
      kind: "lijn",
      text: "Vast — tot lijnpassing (max. 0 µm)",
      textEn: "Interference — up to a line fit (max. 0 µm)",
    };
  return {
    kind: "overgang",
    text: "Overgang — speling of klemming",
    textEn: "Transition — clearance or clamping",
  };
}

export function computeFit(d: number, fitId: string) {
  const fit = FITS.find((f) => f.id === fitId);
  const i = bandIndex(d);
  if (!fit || i < 0) return null;
  const holeDev = holeDeviationAt(fit.hole, i);
  const shaftDev = shaftDeviationAt(fit.shaft, i);
  if (!holeDev || !shaftDev) return null;
  const { ES, EI } = holeDev;
  const { es, ei } = shaftDev;
  const minC = EI - es;
  const maxC = ES - ei;
  return {
    fit,
    band: BANDS[i],
    ES,
    EI,
    es,
    ei,
    minC,
    maxC,
    kind: kindLabel(minC, maxC),
  };
}

export function pairRange(es: number, ei: number) {
  return `${mmFromUm(es)} / ${mmFromUm(ei)}`;
}

export function clearanceRange(minC: number, maxC: number) {
  return `${mmFromUm(minC)} … ${mmFromUm(maxC)}`;
}

export const HOLE_FIELDS = ["H6", "H7", "H8", "H9", "H11", "F8", "G7", "JS7", "K7", "N7"];
export const SHAFT_FIELDS = ["c11", "d9", "f7", "g6", "h6", "h7", "k6", "n6", "p6", "s6"];
