import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { stepVessels, type VesselState } from "./vessels.ts";

function run(state: VesselState, valve: number, pump: number, steps: number, dt = 1 / 60) {
  let s = state;
  const history: VesselState[] = [s];
  for (let i = 0; i < steps; i++) {
    s = stepVessels(s, valve, pump, dt).state;
    history.push(s);
  }
  return { final: s, history };
}

describe("gravity tank with pump-back loop", () => {
  it("conserves total volume every step", () => {
    const { history } = run({ levelA: 0.8, levelB: 0.05 }, 1, 0.4, 600);
    for (const s of history) {
      assert.ok(Math.abs(s.levelA + s.levelB - 0.85) < 1e-9);
    }
  });

  it("drains from the top tank to the bottom when the valve is open and the pump is off", () => {
    const step = stepVessels({ levelA: 0.8, levelB: 0.05 }, 1, 0, 1 / 60);
    assert.ok(step.drainFlow > 0);
    assert.equal(step.pumpFlow, 0);
    assert.ok(step.state.levelA < 0.8);
    assert.ok(step.state.levelB > 0.05);
  });

  it("closing the valve stops the gravity drain", () => {
    const step = stepVessels({ levelA: 0.8, levelB: 0.05 }, 0, 0, 1 / 60);
    assert.equal(step.drainFlow, 0);
    assert.equal(step.state.levelA, 0.8);
    assert.equal(step.state.levelB, 0.05);
  });

  it("the pump moves water back up against gravity when the valve is shut", () => {
    const step = stepVessels({ levelA: 0.1, levelB: 0.5 }, 0, 1, 1 / 60);
    assert.equal(step.drainFlow, 0);
    assert.ok(step.pumpFlow > 0);
    assert.ok(step.state.levelA > 0.1);
    assert.ok(step.state.levelB < 0.5);
  });

  it("gravity outpaces a full-power pump when the valve is fully open", () => {
    const step = stepVessels({ levelA: 0.5, levelB: 0.3 }, 1, 1, 1 / 60);
    assert.ok(step.drainFlow > step.pumpFlow);
    assert.ok(step.state.levelA < 0.5);
  });

  it("a full-power pump outpaces a throttled valve", () => {
    const step = stepVessels({ levelA: 0.5, levelB: 0.3 }, 0.3, 1, 1 / 60);
    assert.ok(step.pumpFlow > step.drainFlow);
    assert.ok(step.state.levelA > 0.5);
  });

  it("left running with the valve open and no pump, the top tank drains to empty", () => {
    const { final } = run({ levelA: 0.8, levelB: 0.05 }, 1, 0, 4000);
    assert.ok(final.levelA < 1e-6);
    assert.ok(Math.abs(final.levelB - 0.85) < 1e-6);
  });

  it("never sends a level outside [0, 1]", () => {
    const { final } = run({ levelA: 0.02, levelB: 0.02 }, 0, 1, 4000);
    assert.ok(final.levelA >= 0 && final.levelA <= 1);
    assert.ok(final.levelB >= 0 && final.levelB <= 1);
  });
});
