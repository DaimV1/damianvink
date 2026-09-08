export type VesselState = { levelA: number; levelB: number };

export const VESSEL_DEFAULTS = {
  levelA: 0.75,
  levelB: 0.15,
  tilt: 0,
  valve: 1,
};

export const TILT_RANGE = { min: -30, max: 30 };
export const VALVE_RANGE = { min: 0, max: 1 };

/** Illustrative scale only — not a real tank size. */
const TANK_HEIGHT_M = 1;
const TANK_AREA_M2 = 0.6;
const PIPE_AREA_M2 = 0.02;
const PIPE_HALF_LENGTH_M = 0.7;
const DISCHARGE_COEFF = 0.6;
const G = 9.81;
/** Caps the per-step level change so the solver settles instead of oscillating past equilibrium. */
const MAX_STEP_FRACTION = 0.35;

/**
 * One communicating-vessels step: flow driven by head difference (Torricelli,
 * Q = Cd·A·sqrt(2·g·Δh)) plus an extra head component from tilting the whole
 * rig. Volume is conserved between the two tanks; levels are clamped to
 * [0, 1] and the step is capped so it can't overshoot past equilibrium.
 */
export function stepVessels(
  state: VesselState,
  tiltDeg: number,
  valveOpen: number,
  dt: number,
): { state: VesselState; flow: number } {
  const headA = state.levelA * TANK_HEIGHT_M;
  const headB = state.levelB * TANK_HEIGHT_M;
  const tiltHead = Math.sin((tiltDeg * Math.PI) / 180) * PIPE_HALF_LENGTH_M * 2;
  const dh = headA - headB + tiltHead;
  const cd = DISCHARGE_COEFF * Math.max(0, Math.min(1, valveOpen));
  const flow = cd * PIPE_AREA_M2 * Math.sign(dh) * Math.sqrt(2 * G * Math.abs(dh));

  let dLevel = (flow * dt) / TANK_AREA_M2;
  const maxStep = Math.abs(dh) * MAX_STEP_FRACTION;
  dLevel = Math.sign(dLevel) * Math.min(Math.abs(dLevel), maxStep);
  // dLevel > 0 moves A -> B: capped by what A has and what B can still take.
  const upper = Math.min(state.levelA, 1 - state.levelB);
  const lower = Math.max(-(1 - state.levelA), -state.levelB);
  dLevel = Math.max(lower, Math.min(upper, dLevel));

  return {
    state: {
      levelA: clamp01(state.levelA - dLevel),
      levelB: clamp01(state.levelB + dLevel),
    },
    flow,
  };
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
