export const GROOVE = {
  radial: {
    1.8: { t: 1.3, b: 2.4, C: 1.5 },
    2.65: { t: 2.0, b: 3.6, C: 2.0 },
    3.55: { t: 2.8, b: 4.7, C: 2.5 },
    5.3: { t: 4.3, b: 7.0, C: 3.0 },
    7: { t: 5.8, b: 9.3, C: 4.0 },
  },
  axial: {
    1.8: { t: 1.3, b: 2.6, C: null },
    2.65: { t: 2.0, b: 3.8, C: null },
    3.55: { t: 2.7, b: 5.0, C: null },
    5.3: { t: 4.2, b: 7.2, C: null },
    7: { t: 5.7, b: 9.7, C: null },
  },
  hydro: {
    1.8: { t: 1.5, b: 2.4, C: 1.3 },
    2.65: { t: 2.3, b: 3.4, C: 1.5 },
    3.55: { t: 3.1, b: 4.5, C: 2.0 },
    5.3: { t: 4.7, b: 6.8, C: 2.9 },
    7: { t: 6.2, b: 8.9, C: 3.6 },
  },
} as const;

export const ORING_LABELS = {
  radial: "Radiaal, statisch",
  axial: "Axiaal, statisch (flens)",
  hydro: "Radiaal, hydrauliek (dynamisch)",
} as const;

export const ORING_LABELS_EN = {
  radial: "Radial, static",
  axial: "Axial, static (flange)",
  hydro: "Radial, hydraulic (dynamic)",
} as const;

export type OringKind = keyof typeof GROOVE;

export const D2_OPTIONS = [
  { value: 1.8, label: "1,80 mm (A)", labelEn: "1.80 mm (A)" },
  { value: 2.65, label: "2,65 mm (B)", labelEn: "2.65 mm (B)" },
  { value: 3.55, label: "3,55 mm (C)", labelEn: "3.55 mm (C)" },
  { value: 5.3, label: "5,30 mm (D)", labelEn: "5.30 mm (D)" },
  { value: 7, label: "7,00 mm (E)", labelEn: "7.00 mm (E)" },
] as const;

export function squeeze(d2: number, t: number) {
  return Math.round(((d2 - t) / d2) * 100);
}
