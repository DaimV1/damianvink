export type LinearClass = "f" | "m" | "c" | "v";
export type FormClass = "H" | "K" | "L";

const NONE = null;

/** ISO 2768-1 linear ± mm. Bands: 0,5–3 | 3–6 | 6–30 | 30–120 | 120–400 | 400–1000 | 1000–2000 | 2000–4000 */
export const LINEAR = {
  f: [0.05, 0.05, 0.1, 0.15, 0.2, 0.3, 0.5, NONE],
  m: [0.1, 0.1, 0.2, 0.3, 0.5, 0.8, 1.2, 2.0],
  c: [0.2, 0.3, 0.5, 0.8, 1.2, 2.0, 3.0, 4.0],
  v: [NONE, 0.5, 1.0, 1.5, 2.5, 4.0, 6.0, 8.0],
} as const;

export const LINEAR_LABELS = [
  "0,5 tot 3",
  "meer dan 3 tot 6",
  "meer dan 6 tot 30",
  "meer dan 30 tot 120",
  "meer dan 120 tot 400",
  "meer dan 400 tot 1000",
  "meer dan 1000 tot 2000",
  "meer dan 2000 tot 4000",
] as const;

/** Radii and chamfer heights ± mm. Bands: 0,5–3 | 3–6 | >6. f/m share, c/v share. */
export const RADIUS = {
  fm: [0.2, 0.5, 1.0],
  cv: [0.4, 1.0, 2.0],
} as const;

export const RADIUS_LABELS = ["0,5 tot 3", "meer dan 3 tot 6", "meer dan 6"] as const;

export type AngleTol = { deg: number; min: number };

export const ANGULAR: Record<LinearClass, AngleTol[]> = {
  f: [
    { deg: 1, min: 0 },
    { deg: 0, min: 30 },
    { deg: 0, min: 20 },
    { deg: 0, min: 10 },
    { deg: 0, min: 5 },
  ],
  m: [
    { deg: 1, min: 0 },
    { deg: 0, min: 30 },
    { deg: 0, min: 20 },
    { deg: 0, min: 10 },
    { deg: 0, min: 5 },
  ],
  c: [
    { deg: 1, min: 30 },
    { deg: 1, min: 0 },
    { deg: 0, min: 30 },
    { deg: 0, min: 15 },
    { deg: 0, min: 10 },
  ],
  v: [
    { deg: 3, min: 0 },
    { deg: 2, min: 0 },
    { deg: 1, min: 0 },
    { deg: 0, min: 30 },
    { deg: 0, min: 20 },
  ],
};

export const ANGULAR_LABELS = [
  "tot 10",
  "meer dan 10 tot 50",
  "meer dan 50 tot 120",
  "meer dan 120 tot 400",
  "meer dan 400",
] as const;

export const STRAIGHTNESS = {
  H: [0.02, 0.05, 0.1, 0.2, 0.3, 0.4],
  K: [0.05, 0.1, 0.2, 0.4, 0.6, 0.8],
  L: [0.1, 0.2, 0.4, 0.8, 1.2, 1.6],
} as const;

export const STRAIGHTNESS_LABELS = [
  "tot 10",
  "meer dan 10 tot 30",
  "meer dan 30 tot 100",
  "meer dan 100 tot 300",
  "meer dan 300 tot 1000",
  "meer dan 1000 tot 3000",
] as const;

export const PERPENDICULARITY = {
  H: [0.2, 0.3, 0.4, 0.5],
  K: [0.4, 0.6, 0.8, 1.0],
  L: [0.6, 1.0, 1.5, 2.0],
} as const;

export const SYMMETRY = {
  H: [0.5, 0.5, 0.5, 0.5],
  K: [0.6, 0.6, 0.8, 1.0],
  L: [0.6, 1.0, 1.5, 2.0],
} as const;

export const FORM_RANGE_LABELS = [
  "tot 100",
  "meer dan 100 tot 300",
  "meer dan 300 tot 1000",
  "meer dan 1000 tot 3000",
] as const;

export const RUNOUT: Record<FormClass, number> = { H: 0.1, K: 0.2, L: 0.5 };

function linearIndex(L: number): number | null {
  if (L < 0.5) return null;
  if (L <= 3) return 0;
  if (L <= 6) return 1;
  if (L <= 30) return 2;
  if (L <= 120) return 3;
  if (L <= 400) return 4;
  if (L <= 1000) return 5;
  if (L <= 2000) return 6;
  if (L <= 4000) return 7;
  return null;
}

function radiusIndex(L: number): number | null {
  if (L < 0.5) return null;
  if (L <= 3) return 0;
  if (L <= 6) return 1;
  return 2;
}

function angularIndex(L: number): number | null {
  if (L < 0.5) return null;
  if (L <= 10) return 0;
  if (L <= 50) return 1;
  if (L <= 120) return 2;
  if (L <= 400) return 3;
  return 4;
}

function straightIndex(L: number): number | null {
  if (L < 0.5) return null;
  if (L <= 10) return 0;
  if (L <= 30) return 1;
  if (L <= 100) return 2;
  if (L <= 300) return 3;
  if (L <= 1000) return 4;
  if (L <= 3000) return 5;
  return null;
}

function formRangeIndex(L: number): number | null {
  if (L < 0.5) return null;
  if (L <= 100) return 0;
  if (L <= 300) return 1;
  if (L <= 1000) return 2;
  if (L <= 3000) return 3;
  return null;
}

export function belowMinimum(L: number) {
  return L < 0.5;
}

export function designation(linear: LinearClass, form: FormClass) {
  return `ISO 2768-${linear}${form}`;
}

export function fmtAngle(tol: AngleTol) {
  if (tol.deg > 0 && tol.min > 0) return `${tol.deg}°${String(tol.min).padStart(2, "0")}′`;
  if (tol.deg > 0) return `${tol.deg}°`;
  return `0°${tol.min}′`;
}

export type Iso2768Result = {
  L: number;
  linear: LinearClass;
  form: FormClass;
  callout: string;
  linearIndex: number | null;
  radiusIndex: number | null;
  angularIndex: number | null;
  straightIndex: number | null;
  formRangeIndex: number | null;
  linearTol: number | null;
  radiusTol: number | null;
  angularTol: AngleTol | null;
  straightness: number | null;
  perpendicularity: number | null;
  symmetry: number | null;
  runout: number;
};

export function lookupIso2768(
  L: number,
  linear: LinearClass,
  form: FormClass,
): Iso2768Result | null {
  if (!Number.isFinite(L) || belowMinimum(L)) return null;
  const li = linearIndex(L);
  const ri = radiusIndex(L);
  const ai = angularIndex(L);
  const si = straightIndex(L);
  const fi = formRangeIndex(L);
  const radiusTable = linear === "f" || linear === "m" ? RADIUS.fm : RADIUS.cv;
  return {
    L,
    linear,
    form,
    callout: designation(linear, form),
    linearIndex: li,
    radiusIndex: ri,
    angularIndex: ai,
    straightIndex: si,
    formRangeIndex: fi,
    linearTol: li == null ? null : LINEAR[linear][li],
    radiusTol: ri == null ? null : radiusTable[ri],
    angularTol: ai == null ? null : ANGULAR[linear][ai],
    straightness: si == null ? null : STRAIGHTNESS[form][si],
    perpendicularity: fi == null ? null : PERPENDICULARITY[form][fi],
    symmetry: fi == null ? null : SYMMETRY[form][fi],
    runout: RUNOUT[form],
  };
}
