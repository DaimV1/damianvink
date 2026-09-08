export type BoltCount = 2 | 4 | 6;

export const BRACKET_DEFAULTS = {
  span: 120,
  load: 400,
  bolts: 4 as BoltCount,
};

export const SPAN_RANGE = { min: 40, max: 200 };
export const LOAD_RANGE = { min: 50, max: 2000 };
export const BOLT_OPTIONS: BoltCount[] = [2, 4, 6];

/** Fixed shelf width (mm) — the demo only varies span, load and bolt count. */
const PLATE_WIDTH_MM = 40;
/** Generic mild-steel allowable bending stress, illustrative only — not a material spec. */
const ALLOWABLE_STRESS_MPA = 150;
const MIN_THICKNESS_MM = 3;
const MAX_THICKNESS_MM = 18;

export const GUSSET_THRESHOLD_N = 500;

/**
 * Cantilever bending, schematic sizing — not a certified calculation.
 * M = F·L; section modulus Z = b·t²/6 for a rectangular section;
 * solve t from σ_allow = M/Z.
 */
export function requiredThicknessMm(spanMm: number, loadN: number): number {
  const momentNmm = loadN * spanMm;
  const t = Math.sqrt((6 * momentNmm) / (PLATE_WIDTH_MM * ALLOWABLE_STRESS_MPA));
  return Math.min(MAX_THICKNESS_MM, Math.max(MIN_THICKNESS_MM, t));
}

export function needsGusset(loadN: number): boolean {
  return loadN >= GUSSET_THRESHOLD_N;
}
