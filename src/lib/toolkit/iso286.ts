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
 * 3 through 50 mm: the original, hand-verified table (unchanged). 50 mm and up:
 * the standard ISO 286 size steps, formula-computed on demand — see
 * computeHoleDeviation/computeShaftDeviation. 30-40 and 40-50 are a display
 * split of ISO's single combined 30-50 band (see calcOver/calcTo below).
 */
export const BANDS: Band[] = [
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

/** Index of the last band backed by the original hand-verified table (3-50 mm). Bands after this are formula-only. */
const LAST_TABLE_BAND = 5;

export const HOLE: Record<string, { ES: number[]; EI: number[] }> = {
  H6: { ES: [8, 9, 11, 13, 16, 16], EI: [0, 0, 0, 0, 0, 0] },
  H7: { ES: [12, 15, 18, 21, 25, 25], EI: [0, 0, 0, 0, 0, 0] },
  H8: { ES: [18, 22, 27, 33, 39, 39], EI: [0, 0, 0, 0, 0, 0] },
  H9: { ES: [30, 36, 43, 52, 62, 62], EI: [0, 0, 0, 0, 0, 0] },
  H11: { ES: [75, 90, 110, 130, 160, 160], EI: [0, 0, 0, 0, 0, 0] },
  F8: { ES: [28, 35, 43, 53, 64, 64], EI: [10, 13, 16, 20, 25, 25] },
  G7: { ES: [16, 20, 24, 28, 34, 34], EI: [4, 5, 6, 7, 9, 9] },
  JS7: { ES: [6, 7.5, 9, 10.5, 12.5, 12.5], EI: [-6, -7.5, -9, -10.5, -12.5, -12.5] },
  J7: { ES: [6, 8, 10, 12, 14, 14], EI: [-6, -7, -8, -9, -11, -11] },
  K7: { ES: [3, 5, 6, 6, 7, 7], EI: [-9, -10, -12, -15, -18, -18] },
  M7: { ES: [0, 0, 0, 0, 0, 0], EI: [-12, -15, -18, -21, -25, -25] },
  N7: { ES: [-4, -4, -5, -7, -8, -8], EI: [-16, -19, -23, -28, -33, -33] },
};

export const SHAFT: Record<string, { es: number[]; ei: number[] }> = {
  c11: { es: [-70, -80, -95, -110, -120, -130], ei: [-145, -170, -205, -240, -280, -290] },
  d9: { es: [-30, -40, -50, -65, -80, -80], ei: [-60, -76, -93, -117, -142, -142] },
  f7: { es: [-10, -13, -16, -20, -25, -25], ei: [-22, -28, -34, -41, -50, -50] },
  g6: { es: [-4, -5, -6, -7, -9, -9], ei: [-12, -14, -17, -20, -25, -25] },
  h6: { es: [0, 0, 0, 0, 0, 0], ei: [-8, -9, -11, -13, -16, -16] },
  h7: { es: [0, 0, 0, 0, 0, 0], ei: [-12, -15, -18, -21, -25, -25] },
  j5: { es: [3, 4, 5, 5, 6, 6], ei: [-2, -2, -3, -4, -5, -5] },
  j6: { es: [6, 7, 8, 9, 11, 11], ei: [-2, -2, -3, -4, -5, -5] },
  js5: { es: [2.5, 3, 4, 4.5, 5.5, 5.5], ei: [-2.5, -3, -4, -4.5, -5.5, -5.5] },
  k5: { es: [6, 7, 9, 11, 13, 13], ei: [1, 1, 1, 2, 2, 2] },
  k6: { es: [9, 10, 12, 15, 18, 18], ei: [1, 1, 1, 2, 2, 2] },
  n6: { es: [16, 19, 23, 28, 33, 33], ei: [8, 10, 12, 15, 17, 17] },
  p6: { es: [20, 24, 29, 35, 42, 42], ei: [12, 15, 18, 22, 26, 26] },
  s6: { es: [27, 32, 39, 48, 59, 59], ei: [19, 23, 28, 35, 43, 43] },
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

function itWidth(D: number, grade: number): number | null {
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

function computeHoleDeviation(id: string, band: Band): { ES: number; EI: number } | null {
  const parsed = parseClassId(id);
  if (!parsed) return null;
  const { letter, grade } = parsed;
  if (letter === "JS") {
    const D = geoMeanD(band);
    const IT = itWidth(D, grade);
    return IT == null ? null : { ES: IT / 2, EI: -IT / 2 };
  }
  if (!FORMULA_HOLE_LETTERS.has(letter)) return null;
  const D = geoMeanD(band);
  const IT = itWidth(D, grade);
  if (IT == null) return null;
  const EI = letter === "H" ? 0 : Math.round(deviationMagnitude(letter.toLowerCase() as "g" | "f" | "d", D));
  return { ES: EI + Math.round(IT), EI };
}

function computeShaftDeviation(id: string, band: Band): { es: number; ei: number } | null {
  const parsed = parseClassId(id);
  if (!parsed) return null;
  const { letter, grade } = parsed;
  if (letter === "js") {
    const D = geoMeanD(band);
    const IT = itWidth(D, grade);
    return IT == null ? null : { es: IT / 2, ei: -IT / 2 };
  }
  if (!FORMULA_SHAFT_LETTERS.has(letter)) return null;
  const D = geoMeanD(band);
  const IT = itWidth(D, grade);
  if (IT == null) return null;
  const es = letter === "h" ? 0 : -Math.round(deviationMagnitude(letter as "g" | "f" | "d", D));
  return { es, ei: es - Math.round(IT) };
}

/** Hole limit deviations for `id` (e.g. "H7") at `bandIdx`: table lookup for 3-50 mm, formula beyond. */
export function holeDeviationAt(id: string, bandIdx: number): { ES: number; EI: number } | null {
  const band = BANDS[bandIdx];
  if (!band) return null;
  if (bandIdx <= LAST_TABLE_BAND) {
    const row = HOLE[id];
    return row ? { ES: row.ES[bandIdx], EI: row.EI[bandIdx] } : null;
  }
  return computeHoleDeviation(id, band);
}

/** Shaft limit deviations for `id` (e.g. "g6") at `bandIdx`: table lookup for 3-50 mm, formula beyond. */
export function shaftDeviationAt(id: string, bandIdx: number): { es: number; ei: number } | null {
  const band = BANDS[bandIdx];
  if (!band) return null;
  if (bandIdx <= LAST_TABLE_BAND) {
    const row = SHAFT[id];
    return row ? { es: row.es[bandIdx], ei: row.ei[bandIdx] } : null;
  }
  return computeShaftDeviation(id, band);
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
