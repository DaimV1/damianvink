export type Material = "staal" | "alu" | "rvs" | "hoogsterkte";
export type Kind = "haaks" | "scherp";

export const MATERIALS: { id: Material; label: string }[] = [
  { id: "staal", label: "Staal" },
  { id: "alu", label: "Aluminium" },
  { id: "rvs", label: "RVS" },
  { id: "hoogsterkte", label: "Hoogsterkte (S355 / CorTen)" },
];

export const KINDS: { id: Kind; label: string }[] = [
  { id: "haaks", label: "Haaks (90°)" },
  { id: "scherp", label: "Scherp" },
];

/** Discrete thicknesses that appear in the 247 tables (mm). */
export const THICKNESSES = [0.63, 0.8, 0.88, 0.9, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12] as const;

const RI_HAAKS: Record<Material, Record<number, number | null>> = {
  staal: {
    0.8: 1.39,
    1: 1.4,
    1.25: 1.42,
    1.5: 1.65,
    2: 1.88,
    2.5: 2.41,
    3: 2.75,
    4: 3.02,
    5: 3.62,
    6: 4.62,
    8: 8,
    10: 8,
    12: 7.83,
  },
  alu: {
    0.8: null,
    1: 1.27,
    1.25: null,
    1.5: 1.47,
    2: 1.67,
    2.5: 2.11,
    3: 2.5,
    4: 3.3,
    5: 4.07,
    6: 5.34,
    8: 8.12,
    10: 18.89,
    12: null,
  },
  rvs: {
    0.8: 1.56,
    1: 1.58,
    1.25: 1.57,
    1.5: 1.9,
    2: 2.22,
    2.5: 2.94,
    3: 3.75,
    4: 4.48,
    5: 7.82,
    6: 11.91,
    8: 11.64,
    10: 15,
    12: null,
  },
  hoogsterkte: {
    0.8: null,
    1: null,
    1.25: null,
    1.5: null,
    2: null,
    2.5: null,
    3: null,
    4: null,
    5: null,
    6: null,
    8: 8,
    10: 8.23,
    12: 7.02,
  },
};

const RI_SCHERP: Record<Material, Record<number, number | null>> = {
  staal: {
    0.8: 1.41,
    1: 1.35,
    1.25: 1.27,
    1.5: 1.19,
    2: 1.3,
    2.5: 1.73,
    3: 2.51,
    4: 2.24,
    5: 2.45,
    6: 3.08,
    8: 4.74,
  },
  alu: {
    0.8: null,
    1: 1.28,
    1.25: null,
    1.5: 1.12,
    2: 1.22,
    2.5: 1.61,
    3: 2.86,
    4: 2.48,
    5: 2.7,
    6: 3.53,
    8: 4.33,
  },
  rvs: {
    0.8: 1.72,
    1: 1.62,
    1.25: 1.52,
    1.5: 1.42,
    2: 1.59,
    2.5: 2.17,
    3: 3.73,
    4: 3.28,
    5: 5.44,
    6: 8.78,
    8: null,
  },
  hoogsterkte: {},
};

type Ws = { w: number | null; s: number | null };
type Wx = { w: number | null; x: number | null };

const BL_HAAKS_STAAL_ALU: Record<number, Ws> = {
    0.63: { w: 8, s: 5.6 },
    0.8: { w: 8, s: 5.7 },
    0.88: { w: 8, s: 5.8 },
    0.9: { w: 8, s: 5.8 },
    1: { w: 8, s: 5.9 },
    1.25: { w: 8, s: 6.1 },
    1.5: { w: 10, s: 7.5 },
    2: { w: 12, s: 9.1 },
    2.5: { w: 16, s: 12 },
    3: { w: 16, s: 12.4 },
    4: { w: 24, s: 17.7 },
    5: { w: 30, s: 22.6 },
    6: { w: 40, s: 29.6 },
    8: { w: 60, s: 43 },
    10: { w: null, s: 44 },
    12: { w: null, s: 56.5 },
  };
const BL_HAAKS_RVS: Record<number, Ws> = {
    0.63: { w: null, s: null },
    0.8: { w: 8, s: 5.7 },
    0.88: { w: null, s: null },
    0.9: { w: null, s: null },
    1: { w: 8, s: 5.9 },
    1.25: { w: 8, s: 6.1 },
    1.5: { w: 10, s: 7.6 },
    2: { w: 12, s: 9.2 },
    2.5: { w: 16, s: 12.1 },
    3: { w: 20, s: 15.12 },
    4: { w: 24, s: 17.9 },
    5: { w: 40, s: 29.2 },
    6: { w: 60, s: 41.8 },
    8: { w: null, s: 43.1 },
    10: { w: null, s: 57 },
    12: { w: null, s: null },
  };
const BL_HAAKS_HS: Record<number, Ws> = {
    0.63: { w: null, s: null },
    0.8: { w: null, s: null },
    0.88: { w: null, s: null },
    0.9: { w: null, s: null },
    1: { w: null, s: null },
    1.25: { w: null, s: null },
    1.5: { w: 12, s: 8.7 },
    2: { w: 16, s: 11.5 },
    2.5: { w: null, s: null },
    3: { w: 24, s: 16.8 },
    4: { w: 30, s: 21.7 },
    5: { w: 40, s: 28.7 },
    6: { w: 40, s: 29.35 },
    8: { w: 60, s: 53.2 },
    10: { w: null, s: 55 },
    12: { w: null, s: 56.5 },
  };
const BL_SCHERP_STAAL_ALU: Record<number, Ws> = {
    0.63: { w: 10, s: 9.7 },
    0.8: { w: 10, s: 9.8 },
    0.88: { w: 10, s: 9.9 },
    0.9: { w: 10, s: 9.9 },
    1: { w: 10, s: 10 },
    1.25: { w: 10, s: 10.15 },
    1.5: { w: 10, s: 10.3 },
    2: { w: 12, s: 12.4 },
    2.5: { w: 16, s: 15.25 },
    3: { w: 24, s: 21.3 },
    4: { w: 24, s: 22 },
    5: { w: 30, s: 22.6 },
    6: { w: 40, s: 29.55 },
    8: { w: 60, s: 42.35 },
  };
const BL_SCHERP_RVS: Record<number, Ws> = {
    0.63: { w: null, s: null },
    0.88: { w: null, s: null },
    0.9: { w: null, s: null },
    0.8: { w: 10, s: 9.9 },
    1: { w: 10, s: 10.1 },
    1.25: { w: 10, s: 10.2 },
    1.5: { w: 10, s: 10.4 },
    2: { w: 12, s: 12.45 },
    2.5: { w: 16, s: 15.35 },
    3: { w: 24, s: 21.5 },
    4: { w: 24, s: 22.2 },
    5: { w: 40, s: 29.2 },
    6: { w: 60, s: 41.8 },
    8: { w: null, s: null },
  };
const BL_SCHERP_HS: Record<number, Ws> = {
    0.63: { w: null, s: null },
    0.8: { w: null, s: null },
    0.88: { w: null, s: null },
    0.9: { w: null, s: null },
    1: { w: null, s: null },
    1.25: { w: null, s: null },
    1.5: { w: 12, s: 11.9 },
    2: { w: 12, s: 12.3 },
    2.5: { w: null, s: null },
    3: { w: 24, s: 21.15 },
    4: { w: 30, s: 21.9 },
    5: { w: 40, s: 28.7 },
    6: { w: 40, s: 29.35 },
    8: { w: 60, s: 42.4 },
  };

const ZX_HAAKS_STAAL_ALU: Record<number, Wx> = {
    0.63: { w: 8, x: 7.8 },
    0.8: { w: null, x: 8.15 },
    0.88: { w: 8, x: 8.3 },
    0.9: { w: 8, x: 8.3 },
    1: { w: 8, x: 8.5 },
    1.25: { w: 8, x: 8.95 },
    1.5: { w: 8, x: 10.65 },
    2: { w: 12, x: 13.8 },
    2.5: { w: 16, x: 18.8 },
    3: { w: 16, x: 20.1 },
    4: { w: 24, x: 26.15 },
    5: { w: 30, x: 34.65 },
    6: { w: 40, x: 42.9 },
    8: { w: 60, x: 63 },
    10: { w: null, x: 65 },
    12: { w: null, x: 79 },
  };
const ZX_HAAKS_RVS: Record<number, Wx> = {
    0.63: { w: null, x: null },
    0.8: { w: 8, x: 8.35 },
    0.88: { w: null, x: null },
    0.9: { w: null, x: null },
    1: { w: 8, x: 8.7 },
    1.25: { w: 8, x: 9.15 },
    1.5: { w: 10, x: 10.95 },
    2: { w: 12, x: 14.2 },
    2.5: { w: 16, x: 19.45 },
    3: { w: 20, x: 24.75 },
    4: { w: 24, x: 27.4 },
    5: { w: 40, x: 44.1 },
    6: { w: 60, x: 63.2 },
    8: { w: null, x: 66.3 },
    10: { w: null, x: 84 },
    12: { w: null, x: null },
  };
const ZX_HAAKS_HS: Record<number, Wx> = {
    0.63: { w: null, x: null },
    0.8: { w: null, x: null },
    0.88: { w: null, x: null },
    0.9: { w: null, x: null },
    1: { w: null, x: null },
    1.25: { w: null, x: null },
    1.5: { w: 12, x: 12.3 },
    2: { w: 12, x: 13.4 },
    2.5: { w: null, x: null },
    3: { w: 24, x: 23.45 },
    4: { w: 30, x: 31.8 },
    5: { w: 40, x: 40.4 },
    6: { w: 40, x: 41.15 },
    8: { w: 60, x: 70.4 },
    10: { w: null, x: 76 },
    12: { w: null, x: 79 },
  };
const ZX_SCHERP_STAAL_ALU: Record<number, Wx> = {
    0.63: { w: 10, x: 18 },
    0.8: { w: 10, x: 18.25 },
    0.88: { w: 10, x: 18.4 },
    0.9: { w: 10, x: 18.4 },
    1: { w: 10, x: 18.6 },
    1.25: { w: 10, x: 19 },
    1.5: { w: 10, x: 19.4 },
    2: { w: 12, x: 20.65 },
    2.5: { w: 16, x: 25.8 },
    3: { w: 16, x: 34.95 },
    4: { w: 24, x: 36.5 },
    5: { w: 30, x: 40.4 },
    6: { w: 40, x: 42.9 },
    8: { w: 60, x: 62.2 },
  };
const ZX_SCHERP_RVS: Record<number, Wx> = {
    0.63: { w: null, x: null },
    0.8: { w: 10, x: 18.6 },
    0.88: { w: null, x: null },
    0.9: { w: null, x: null },
    1: { w: 10, x: 19 },
    1.25: { w: 10, x: 19.4 },
    1.5: { w: 10, x: 19.8 },
    2: { w: 12, x: 21.15 },
    2.5: { w: 16, x: 26.55 },
    3: { w: 20, x: 36.05 },
    4: { w: 24, x: 37.6 },
    5: { w: 40, x: 44.1 },
    6: { w: 60, x: 63.2 },
    8: { w: null, x: null },
  };
const ZX_SCHERP_HS: Record<number, Wx> = {
    0.63: { w: null, x: null },
    0.8: { w: null, x: null },
    0.88: { w: null, x: null },
    0.9: { w: null, x: null },
    1: { w: null, x: null },
    1.25: { w: null, x: null },
    1.5: { w: 12, x: 18.95 },
    2: { w: 12, x: 20.15 },
    2.5: { w: null, x: null },
    3: { w: 24, x: 33.75 },
    4: { w: 30, x: 35.45 },
    5: { w: 40, x: 40.35 },
    6: { w: 40, x: 41.15 },
    8: { w: 60, x: 60 },
  };

function beenlengte(material: Material, kind: Kind) {
  if (kind === "haaks") {
    if (material === "rvs") return BL_HAAKS_RVS;
    if (material === "hoogsterkte") return BL_HAAKS_HS;
    return BL_HAAKS_STAAL_ALU;
  }
  if (material === "rvs") return BL_SCHERP_RVS;
  if (material === "hoogsterkte") return BL_SCHERP_HS;
  return BL_SCHERP_STAAL_ALU;
}

function zBuiging(material: Material, kind: Kind) {
  if (kind === "haaks") {
    if (material === "rvs") return ZX_HAAKS_RVS;
    if (material === "hoogsterkte") return ZX_HAAKS_HS;
    return ZX_HAAKS_STAAL_ALU;
  }
  if (material === "rvs") return ZX_SCHERP_RVS;
  if (material === "hoogsterkte") return ZX_SCHERP_HS;
  return ZX_SCHERP_STAAL_ALU;
}

export type KantenRow = {
  t: number;
  material: Material;
  kind: Kind;
  ri: number | null;
  w: number | null;
  s: number | null;
  x: number | null;
  zw: number | null;
  thickPlate: boolean;
};

export function lookupKanten(
  t: number,
  material: Material,
  kind: Kind,
): KantenRow | null {
  if (!Number.isFinite(t)) return null;
  const riTable = kind === "haaks" ? RI_HAAKS[material] : RI_SCHERP[material];
  const bl = beenlengte(material, kind);
  const zx = zBuiging(material, kind);
  const hasRi = Object.prototype.hasOwnProperty.call(riTable, t);
  const hasBl = Object.prototype.hasOwnProperty.call(bl, t);
  const hasZx = Object.prototype.hasOwnProperty.call(zx, t);
  if (!hasRi && !hasBl && !hasZx) return null;
  const ws = hasBl ? bl[t] : { w: null, s: null };
  const z = hasZx ? zx[t] : { w: null, x: null };
  return {
    t,
    material,
    kind,
    ri: hasRi ? riTable[t] : null,
    w: ws.w,
    s: ws.s,
    x: z.x,
    zw: z.w,
    thickPlate: t === 10 || t === 12,
  };
}

export const KANTEN_SOURCE =
  "https://247tailorsteel.com/nl/aanleverspecificaties/richtlijnen-voor-kanten";

export function dashMm(n: number | null) {
  if (n == null) return "—";
  return String(n).replace(".", ",");
}

export function copyLine(row: KantenRow) {
  const mat =
    row.material === "hoogsterkte"
      ? "hoogsterkte"
      : row.material === "rvs"
        ? "RVS"
        : row.material === "alu"
          ? "alu"
          : "staal";
  return `Ri=${dashMm(row.ri)} mm, w=${dashMm(row.w)} mm, s=${dashMm(row.s)} mm, ${dashMm(row.t)} mm ${mat} ${row.kind}`;
}

export const RI_T_HAAKS = [0.8, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12] as const;
export const RI_T_SCHERP = [0.8, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8] as const;
export const BL_T_SCHERP = [0.63, 0.8, 0.88, 0.9, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8] as const;
