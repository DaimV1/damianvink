export const BRACKET_DEFAULTS = { span: 120, thickness: 8, load: 400 };
export const SPAN_RANGE = { min: 40, max: 200 };
export const THICKNESS_RANGE = { min: 3, max: 20 };
export const LOAD_RANGE = { min: 0, max: 2000 };
export const WIDTH_MM = 40;
export const ELASTIC_MODULUS_MPA = 210000;
export const YIELD_MPA = 235;

/** Rectangular Euler–Bernoulli cantilever with a point load at its free end.
 * Units: N, mm, N/mm². No bolt, weld, shear or self-weight calculation.
 * Beyond yield / small deflection, values are extrapolations, not predictions.
 */
export function calculateBracket(span: number, thickness: number, load: number) {
  if (![span, thickness, load].every(Number.isFinite) || span <= 0 || thickness <= 0 || load < 0) {
    throw new RangeError("Expected positive dimensions and a nonnegative finite load");
  }
  const inertia = (WIDTH_MM * thickness ** 3) / 12;
  const stress = (6 * load * span) / (WIDTH_MM * thickness ** 2);
  const deflection = (load * span ** 3) / (3 * ELASTIC_MODULUS_MPA * inertia);
  return {
    stress,
    deflection,
    beyondYield: stress >= YIELD_MPA,
    largeDeflection: deflection / span > 0.05,
    shortBeam: span / thickness < 10,
  };
}

/** Normalized elastic curve: fixed end at u=0, free end at u=1. */
export function deflectionFraction(u: number) {
  return (u * u * (3 - u)) / 2;
}
