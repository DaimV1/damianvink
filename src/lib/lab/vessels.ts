export type VesselState = { levelA: number; levelB: number };

/** A = top tank (source), B = bottom tank (reservoir). */
export const VESSEL_DEFAULTS = {
  levelA: 0.8,
  levelB: 0.05,
  valve: 1,
  pump: 0,
};

export const VALVE_RANGE = { min: 0, max: 1 };
export const PUMP_RANGE = { min: 0, max: 1 };

/** Illustrative scale only — not a real tank size. */
const TANK_HEIGHT_M = 1;
const TANK_AREA_M2 = 0.55;
const PIPE_AREA_M2 = 0.02;
const DISCHARGE_COEFF = 0.6;
const G = 9.81;
/** Fixed vertical drop between the two tanks' pipe connections — gravity always pulls this way. */
const ELEVATION_HEAD_M = 1.3;
/** Pump's rated flow at full power, working against gravity back up to the top tank. */
const PUMP_MAX_FLOW_M3_S = 0.05;

/**
 * The top tank drains into the bottom one through a valve-controlled pipe
 * (Torricelli orifice flow, Q = Cd·A·sqrt(2·g·Δh), driven by the fixed
 * elevation between the two tanks plus whatever head their own fill levels
 * add or subtract). A pump can push water from the bottom tank back up to
 * the top one at a fixed rate, independent of the valve — with the valve
 * fully open gravity outpaces it, but throttle the valve and the pump wins.
 * Volume is conserved between the two tanks; levels stay clamped to [0, 1].
 */
export function stepVessels(
  state: VesselState,
  valveOpen: number,
  pumpPower: number,
  dt: number,
): { state: VesselState; drainFlow: number; pumpFlow: number } {
  const valve = clamp01(valveOpen);
  const pump = clamp01(pumpPower);

  const headDiff = ELEVATION_HEAD_M + state.levelA * TANK_HEIGHT_M - state.levelB * TANK_HEIGHT_M;
  const cd = DISCHARGE_COEFF * valve;
  const drainFlow = headDiff > 0 ? cd * PIPE_AREA_M2 * Math.sqrt(2 * G * headDiff) : 0;
  const pumpFlow = PUMP_MAX_FLOW_M3_S * pump;

  let dLevel = ((drainFlow - pumpFlow) * dt) / TANK_AREA_M2;
  // dLevel > 0 moves A -> B (draining): capped by what A has and what B can still take.
  // dLevel < 0 moves B -> A (pumping): capped by what B has and what A can still take.
  const upper = Math.min(state.levelA, 1 - state.levelB);
  const lower = Math.max(-(1 - state.levelA), -state.levelB);
  dLevel = Math.max(lower, Math.min(upper, dLevel));

  return {
    state: {
      levelA: clamp01(state.levelA - dLevel),
      levelB: clamp01(state.levelB + dLevel),
    },
    drainFlow,
    pumpFlow,
  };
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
