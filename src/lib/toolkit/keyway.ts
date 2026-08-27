export const KEYWAYS = [
  { over: 6, to: 8, b: 2, h: 2, t1: 1.2, t2: 1.0, depthTol: 0.1 },
  { over: 8, to: 10, b: 3, h: 3, t1: 1.8, t2: 1.4, depthTol: 0.1 },
  { over: 10, to: 12, b: 4, h: 4, t1: 2.5, t2: 1.8, depthTol: 0.1 },
  { over: 12, to: 17, b: 5, h: 5, t1: 3.0, t2: 2.3, depthTol: 0.1 },
  { over: 17, to: 22, b: 6, h: 6, t1: 3.5, t2: 2.8, depthTol: 0.1 },
  { over: 22, to: 30, b: 8, h: 7, t1: 4.0, t2: 3.3, depthTol: 0.2 },
  { over: 30, to: 38, b: 10, h: 8, t1: 5.0, t2: 3.3, depthTol: 0.2 },
  { over: 38, to: 44, b: 12, h: 8, t1: 5.0, t2: 3.3, depthTol: 0.2 },
  { over: 44, to: 50, b: 14, h: 9, t1: 5.5, t2: 3.8, depthTol: 0.2 },
  { over: 50, to: 58, b: 16, h: 10, t1: 6.0, t2: 4.3, depthTol: 0.2 },
  { over: 58, to: 65, b: 18, h: 11, t1: 7.0, t2: 4.4, depthTol: 0.2 },
  { over: 65, to: 75, b: 20, h: 12, t1: 7.5, t2: 4.9, depthTol: 0.2 },
  { over: 75, to: 85, b: 22, h: 14, t1: 9.0, t2: 5.4, depthTol: 0.2 },
  { over: 85, to: 95, b: 25, h: 14, t1: 9.0, t2: 5.4, depthTol: 0.2 },
  { over: 95, to: 110, b: 28, h: 16, t1: 10.0, t2: 6.4, depthTol: 0.2 },
] as const;

export function lookupKeyway(d: number) {
  return KEYWAYS.find((row) => d > row.over && d <= row.to) ?? null;
}

export type WidthFit = "P9" | "N9" | "JS9" | "H9" | "D10";

const WIDTH_BANDS = [
  { over: 0, to: 3, it9: 25, it10: 40, P: -6, N: -4, D: 20 },
  { over: 3, to: 6, it9: 30, it10: 48, P: -12, N: -8, D: 30 },
  { over: 6, to: 10, it9: 36, it10: 58, P: -15, N: -10, D: 40 },
  { over: 10, to: 18, it9: 43, it10: 70, P: -18, N: -12, D: 50 },
  { over: 18, to: 30, it9: 52, it10: 84, P: -22, N: -15, D: 65 },
] as const;

export function widthBand(b: number) {
  return WIDTH_BANDS.find((row) => b > row.over && b <= row.to) ?? null;
}

/** Spleet = gatbasis. Waarden in µm volgens ISO 286-2. */
export function keyWidthTol(b: number, fit: WidthFit): { ES: number; EI: number; label: string } | null {
  const band = widthBand(b);
  if (!band) return null;
  if (fit === "H9") return { ES: band.it9, EI: 0, label: "H9" };
  if (fit === "JS9") {
    const half = band.it9 / 2;
    return { ES: half, EI: -half, label: "JS9" };
  }
  if (fit === "P9") return { ES: band.P, EI: band.P - band.it9, label: "P9" };
  if (fit === "N9") return { ES: band.N, EI: band.N - band.it9, label: "N9" };
  return { ES: band.D + band.it10, EI: band.D, label: "D10" };
}
