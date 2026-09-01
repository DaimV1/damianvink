/** Doorbuiging van een balk onder een puntlast op afstand a. mm, N, N/mm² intern. */

export type BeamEndCondition = "ss" | "cant";

/**
 * Twee statisch bepaalde gevallen. Voor scharnier-scharnier wordt a gemeten
 * vanaf het linker steunpunt; voor uitkraging vanaf de inklemming.
 */
export const BEAM_END_CONDITIONS: {
  id: BeamEndCondition;
  label: string;
  labelEn: string;
}[] = [
  {
    id: "ss",
    label: "Vrij opgelegd (scharnier – scharnier)",
    labelEn: "Simply supported (pinned – pinned)",
  },
  { id: "cant", label: "Uitkraging (ingeklemd – vrij)", labelEn: "Cantilever (fixed – free)" },
];

export type DeflectionResult = {
  deltaAtLoad: number;
  deltaMax: number;
  xMax: number;
};

/**
 * Puntlast P op afstand a langs een balk met lengte L, buigstijfheid E·I.
 * Scharnier-scharnier: standaard balkformules (Roark), a en b = L-a vanaf
 * de steunpunten. Uitkraging: het maximum ligt altijd bij het vrije uiteinde.
 */
export function computeDeflection({
  end,
  L,
  a,
  E,
  I,
  P,
}: {
  end: BeamEndCondition;
  L: number;
  a: number;
  E: number;
  I: number;
  P: number;
}): DeflectionResult | null {
  if (!(L > 0) || !(E > 0) || !(I > 0) || !(P > 0)) return null;
  if (!(a >= 0) || a > L) return null;

  if (end === "cant") {
    const deltaAtLoad = (P * a ** 3) / (3 * E * I);
    const deltaMax = (P * a ** 2 * (3 * L - a)) / (6 * E * I);
    return { deltaAtLoad, deltaMax, xMax: L };
  }

  const b = L - a;
  const deltaAtLoad = (P * a ** 2 * b ** 2) / (3 * E * I * L);
  const aLong = Math.max(a, b);
  const bShort = Math.min(a, b);
  const xLongFromNear = Math.sqrt((aLong * (aLong + 2 * bShort)) / 3);
  const deltaMax = (P * bShort * (L ** 2 - bShort ** 2) ** 1.5) / (9 * Math.sqrt(3) * L * E * I);
  const xMax = a >= b ? xLongFromNear : L - xLongFromNear;
  return { deltaAtLoad, deltaMax, xMax };
}

export function copyLine(r: DeflectionResult, endLabel: string, a: number) {
  return `δ(x=${fmtDotComma(a, 0)}) = ${fmtDotComma(r.deltaAtLoad, 3)} mm, δ_max = ${fmtDotComma(r.deltaMax, 3)} mm bij x = ${fmtDotComma(r.xMax, 0)} mm (${endLabel})`;
}

export function fmtDotComma(n: number, digits: number) {
  return n.toFixed(digits).replace(".", ",");
}
