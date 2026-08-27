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
