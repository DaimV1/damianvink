import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { stepVessels, type VesselState } from "./vessels.ts";

function run(state: VesselState, tilt: number, valve: number, steps: number, dt = 1 / 60) {
  let s = state;
  const history: VesselState[] = [s];
  for (let i = 0; i < steps; i++) {
    s = stepVessels(s, tilt, valve, dt).state;
    history.push(s);
  }
  return { final: s, history };
}

describe("communicating vessels", () => {
  it("conserves total volume every step", () => {
    const { history } = run({ levelA: 0.75, levelB: 0.15 }, 0, 1, 600);
    for (const s of history) {
      assert.ok(Math.abs(s.levelA + s.levelB - 0.9) < 1e-9);
    }
  });

  it("equalizes without overshooting past the midpoint", () => {
    const { final, history } = run({ levelA: 0.75, levelB: 0.15 }, 0, 1, 3000);
    assert.ok(Math.abs(final.levelA - final.levelB) < 0.01);
    for (const s of history) {
      // never overshoots: A never drops below B's eventual level while draining
      assert.ok(s.levelA >= final.levelA - 1e-6);
      assert.ok(s.levelB <= final.levelB + 1e-6);
    }
  });

  it("stays put when levels already match and the rig is level", () => {
    const { final } = run({ levelA: 0.4, levelB: 0.4 }, 0, 1, 300);
    assert.ok(Math.abs(final.levelA - 0.4) < 1e-6);
    assert.ok(Math.abs(final.levelB - 0.4) < 1e-6);
  });

  it("tilting toward B drives flow into B even at equal levels", () => {
    const flat = stepVessels({ levelA: 0.5, levelB: 0.5 }, 0, 1, 1 / 60);
    const tilted = stepVessels({ levelA: 0.5, levelB: 0.5 }, 30, 1, 1 / 60);
    assert.equal(flat.flow, 0);
    assert.ok(tilted.flow > 0);
    assert.ok(tilted.state.levelB > flat.state.levelB);
  });

  it("tilting the other way reverses the flow direction", () => {
    const step = stepVessels({ levelA: 0.5, levelB: 0.5 }, -30, 1, 1 / 60);
    assert.ok(step.flow < 0);
    assert.ok(step.state.levelA > 0.5);
  });

  it("closing the valve stops flow", () => {
    const step = stepVessels({ levelA: 0.75, levelB: 0.15 }, 0, 0, 1 / 60);
    assert.equal(step.flow, 0);
    assert.equal(step.state.levelA, 0.75);
    assert.equal(step.state.levelB, 0.15);
  });

  it("never sends a level outside [0, 1]", () => {
    const { final } = run({ levelA: 0.02, levelB: 0.98 }, -30, 1, 3000);
    assert.ok(final.levelA >= 0 && final.levelA <= 1);
    assert.ok(final.levelB >= 0 && final.levelB <= 1);
  });
});
