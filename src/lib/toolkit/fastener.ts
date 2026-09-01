export type FitSeries = "fijn" | "middel" | "grof";
export type Strength = "8.8" | "10.9" | "12.9";

export type FastenerRow = {
  d: number;
  p: number;
  tap: number;
  hole: { fijn: number; middel: number; grof: number };
  sw: number;
  k: number;
  s: number;
  dk: number;
  ma?: { "8.8": number; "10.9": number; "12.9": number };
  fv?: { "8.8": number; "10.9": number; "12.9": number };
};

/** ISO 262 voorkeur + 14/18/22. Doorlaat ISO 273. Moment VDI 2230-1 A1, μ=0,14. */
export const FASTENERS: FastenerRow[] = [
  {
    d: 3,
    p: 0.5,
    tap: 2.5,
    hole: { fijn: 3.2, middel: 3.4, grof: 3.6 },
    sw: 5.5,
    k: 2,
    s: 2.5,
    dk: 5.5,
  },
  {
    d: 4,
    p: 0.7,
    tap: 3.3,
    hole: { fijn: 4.3, middel: 4.5, grof: 4.8 },
    sw: 7,
    k: 2.8,
    s: 3,
    dk: 7,
    ma: { "8.8": 3.3, "10.9": 4.8, "12.9": 5.6 },
    fv: { "8.8": 4300, "10.9": 6300, "12.9": 7400 },
  },
  {
    d: 5,
    p: 0.8,
    tap: 4.2,
    hole: { fijn: 5.3, middel: 5.5, grof: 5.8 },
    sw: 8,
    k: 3.5,
    s: 4,
    dk: 8.5,
    ma: { "8.8": 6.5, "10.9": 9.5, "12.9": 11.2 },
    fv: { "8.8": 7000, "10.9": 10300, "12.9": 12000 },
  },
  {
    d: 6,
    p: 1,
    tap: 5,
    hole: { fijn: 6.4, middel: 6.6, grof: 7 },
    sw: 10,
    k: 4,
    s: 5,
    dk: 10,
    ma: { "8.8": 11.3, "10.9": 16.5, "12.9": 19.3 },
    fv: { "8.8": 9900, "10.9": 14500, "12.9": 17000 },
  },
  {
    d: 8,
    p: 1.25,
    tap: 6.8,
    hole: { fijn: 8.4, middel: 9, grof: 10 },
    sw: 13,
    k: 5.3,
    s: 6,
    dk: 13,
    ma: { "8.8": 27.3, "10.9": 40.1, "12.9": 46.9 },
    fv: { "8.8": 18100, "10.9": 26600, "12.9": 31100 },
  },
  {
    d: 10,
    p: 1.5,
    tap: 8.5,
    hole: { fijn: 10.5, middel: 11, grof: 12 },
    sw: 16,
    k: 6.4,
    s: 8,
    dk: 16,
    ma: { "8.8": 54, "10.9": 79, "12.9": 93 },
    fv: { "8.8": 28800, "10.9": 42200, "12.9": 49400 },
  },
  {
    d: 12,
    p: 1.75,
    tap: 10.2,
    hole: { fijn: 13, middel: 14, grof: 15 },
    sw: 18,
    k: 7.5,
    s: 10,
    dk: 18,
    ma: { "8.8": 93, "10.9": 137, "12.9": 160 },
    fv: { "8.8": 41900, "10.9": 61500, "12.9": 72000 },
  },
  {
    d: 14,
    p: 2,
    tap: 12,
    hole: { fijn: 15, middel: 16, grof: 17 },
    sw: 21,
    k: 8.8,
    s: 12,
    dk: 21,
    ma: { "8.8": 148, "10.9": 218, "12.9": 255 },
    fv: { "8.8": 57500, "10.9": 84400, "12.9": 98800 },
  },
  {
    d: 16,
    p: 2,
    tap: 14,
    hole: { fijn: 17, middel: 18, grof: 19 },
    sw: 24,
    k: 10,
    s: 14,
    dk: 24,
    ma: { "8.8": 230, "10.9": 338, "12.9": 395 },
    fv: { "8.8": 78800, "10.9": 115700, "12.9": 135400 },
  },
  {
    d: 18,
    p: 2.5,
    tap: 15.5,
    hole: { fijn: 19, middel: 20, grof: 21 },
    sw: 27,
    k: 11.5,
    s: 14,
    dk: 27,
    ma: { "8.8": 329, "10.9": 469, "12.9": 549 },
    fv: { "8.8": 99000, "10.9": 141000, "12.9": 165000 },
  },
  {
    d: 20,
    p: 2.5,
    tap: 17.5,
    hole: { fijn: 21, middel: 22, grof: 24 },
    sw: 30,
    k: 12.5,
    s: 17,
    dk: 30,
    ma: { "8.8": 464, "10.9": 661, "12.9": 773 },
    fv: { "8.8": 127000, "10.9": 181000, "12.9": 212000 },
  },
  {
    d: 22,
    p: 2.5,
    tap: 19.5,
    hole: { fijn: 23, middel: 24, grof: 26 },
    sw: 34,
    k: 14,
    s: 17,
    dk: 33,
    ma: { "8.8": 634, "10.9": 904, "12.9": 1057 },
    fv: { "8.8": 158000, "10.9": 225000, "12.9": 264000 },
  },
  {
    d: 24,
    p: 3,
    tap: 21,
    hole: { fijn: 25, middel: 26, grof: 28 },
    sw: 36,
    k: 15,
    s: 19,
    dk: 36,
    ma: { "8.8": 798, "10.9": 1136, "12.9": 1329 },
    fv: { "8.8": 183000, "10.9": 260000, "12.9": 305000 },
  },
];

export function lookupFastener(d: number) {
  return FASTENERS.find((row) => row.d === d) ?? null;
}

export function fmtPitch(n: number) {
  return n.toFixed(n % 1 === 0 ? 0 : 2).replace(".", ",").replace(/0$/, "");
}

export function fmtNm(n: number) {
  return n.toLocaleString("nl-NL", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 1,
    maximumFractionDigits: 1,
  });
}

export function fmtForce(n: number) {
  return n.toLocaleString("nl-NL");
}
