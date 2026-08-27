import { mmFromUm } from "@/lib/utils";

export const BANDS = [
  { over: 3, to: 6, label: "boven 3 t/m 6" },
  { over: 6, to: 10, label: "boven 6 t/m 10" },
  { over: 10, to: 18, label: "boven 10 t/m 18" },
  { over: 18, to: 30, label: "boven 18 t/m 30" },
  { over: 30, to: 40, label: "boven 30 t/m 40" },
  { over: 40, to: 50, label: "boven 40 t/m 50" },
] as const;

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

export type FitKind = "los" | "overgang" | "lijn" | "vast";

export const FITS = [
  {
    id: "H11/c11",
    hole: "H11",
    shaft: "c11",
    kind: "los" as FitKind,
    use: "Ruime speling. Plaatwerk, ruwe montage, geverfde of vuile vlakken.",
  },
  {
    id: "H9/d9",
    hole: "H9",
    shaft: "d9",
    kind: "los" as FitKind,
    use: "Ruime looppassing. Poelies, ringen, onderdelen die makkelijk moeten lopen.",
  },
  {
    id: "H8/f7",
    hole: "H8",
    shaft: "f7",
    kind: "los" as FitKind,
    use: "Looppassing. Glijassen en lagers die met speling moeten draaien.",
  },
  {
    id: "H7/g6",
    hole: "H7",
    shaft: "g6",
    kind: "los" as FitKind,
    use: "Nauwkeurig glijden. Weinig speling, nog met de hand te verschuiven.",
  },
  {
    id: "H7/h6",
    hole: "H7",
    shaft: "h6",
    kind: "los" as FitKind,
    use: "Centrumpassing. Schuiven met minimale speling; locatie van stilstaande delen.",
  },
  {
    id: "H7/k6",
    hole: "H7",
    shaft: "k6",
    kind: "overgang" as FitKind,
    use: "Overgang. Tikken met hamer; centreren waar speling of lichte klemming mag.",
  },
  {
    id: "H7/n6",
    hole: "H7",
    shaft: "n6",
    kind: "overgang" as FitKind,
    use: "Stevige overgang. Meestal klemming; persen of tikken.",
  },
  {
    id: "H7/p6",
    hole: "H7",
    shaft: "p6",
    kind: "lijn" as FitKind,
    use: "Lichte perspassing. Tot 18 mm max. speling 0 µm (lijnpassing mogelijk). Daarboven altijd overmaat.",
  },
  {
    id: "H7/s6",
    hole: "H7",
    shaft: "s6",
    kind: "vast" as FitKind,
    use: "Perspassing. Pers of krimp; niet bedoeld om los te nemen.",
  },
] as const;

export function bandIndex(d: number) {
  return BANDS.findIndex((b) => d > b.over && d <= b.to);
}

export function kindLabel(minC: number, maxC: number): { kind: FitKind; text: string } {
  if (minC >= 0 && maxC >= 0) return { kind: "los", text: "Los — altijd speling" };
  if (maxC < 0) return { kind: "vast", text: "Vast — altijd overmaat" };
  if (maxC === 0 && minC < 0)
    return { kind: "lijn", text: "Vast — tot lijnpassing (max. 0 µm)" };
  return { kind: "overgang", text: "Overgang — speling of klemming" };
}

export function computeFit(d: number, fitId: string) {
  const fit = FITS.find((f) => f.id === fitId);
  const i = bandIndex(d);
  if (!fit || i < 0) return null;
  const hole = HOLE[fit.hole];
  const shaft = SHAFT[fit.shaft];
  const ES = hole.ES[i];
  const EI = hole.EI[i];
  const es = shaft.es[i];
  const ei = shaft.ei[i];
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
