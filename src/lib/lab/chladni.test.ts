import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHLADNI_PRESETS,
  MODE_RANGE,
  chladniGradient,
  chladniValue,
  makeParticles,
  meanAmplitude,
  randomSource,
  stepParticles,
  type Particle,
} from "./chladni.ts";

describe("chladniValue", () => {
  it("is exactly zero at both plate corners, for any mode", () => {
    for (const { n, m } of CHLADNI_PRESETS) {
      assert.equal(chladniValue(n, m, 0, 0), 0);
      assert.equal(chladniValue(n, m, 1, 1), 0);
    }
  });

  it("is exactly zero along the diagonal x = y, for any mode", () => {
    for (const { n, m } of [
      { n: 1, m: 2 },
      { n: 3, m: 5 },
      { n: 4, m: 9 },
    ]) {
      for (const x of [0.1, 0.37, 0.5, 0.82]) {
        assert.equal(chladniValue(n, m, x, x), 0);
      }
    }
  });

  it("flips sign when n and m are swapped, keeping the same nodal lines", () => {
    assert.ok(Math.abs(chladniValue(3, 5, 0.2, 0.7) + chladniValue(5, 3, 0.2, 0.7)) < 1e-12);
  });
});

describe("chladniGradient", () => {
  it("matches a central finite-difference estimate of the analytic value", () => {
    const eps = 1e-5;
    for (const { n, m } of [
      { n: 2, m: 3 },
      { n: 4, m: 7 },
    ]) {
      for (const [x, y] of [
        [0.3, 0.6],
        [0.55, 0.2],
      ]) {
        const [gx, gy] = chladniGradient(n, m, x, y);
        const dx = (chladniValue(n, m, x + eps, y) - chladniValue(n, m, x - eps, y)) / (2 * eps);
        const dy = (chladniValue(n, m, x, y + eps) - chladniValue(n, m, x, y - eps)) / (2 * eps);
        assert.ok(Math.abs(gx - dx) < 1e-3, `dU/dx off at (${x},${y})`);
        assert.ok(Math.abs(gy - dy) < 1e-3, `dU/dy off at (${x},${y})`);
      }
    }
  });
});

describe("CHLADNI_PRESETS", () => {
  it("only contains n < m within range, no duplicates", () => {
    const seen = new Set<string>();
    for (const { n, m } of CHLADNI_PRESETS) {
      assert.ok(n >= MODE_RANGE.min && m <= MODE_RANGE.max);
      assert.ok(n < m);
      const key = `${n},${m}`;
      assert.ok(!seen.has(key));
      seen.add(key);
    }
  });
});

describe("particle settling", () => {
  function settle(n: number, m: number, seed: number, steps: number) {
    let particles: Particle[] = makeParticles(400, seed);
    const random = randomSource(seed + 1);
    const before = meanAmplitude(particles, n, m);
    for (let i = 0; i < steps; i++) particles = stepParticles(particles, n, m, 1 / 60, random);
    return { before, after: meanAmplitude(particles, n, m), particles };
  }

  it("reduces mean amplitude over time as sand collects on the nodal lines", () => {
    const { before, after } = settle(3, 5, 42, 600);
    assert.ok(after < before * 0.5, `expected settling, got ${before} -> ${after}`);
  });

  it("keeps every particle inside the plate, even at the highest mode numbers", () => {
    const { particles } = settle(MODE_RANGE.max - 1, MODE_RANGE.max, 7, 300);
    for (const p of particles) {
      assert.ok(p.x >= 0 && p.x <= 1);
      assert.ok(p.y >= 0 && p.y <= 1);
      assert.ok(Number.isFinite(p.vx) && Number.isFinite(p.vy));
    }
  });

  it("is deterministic for a given seed", () => {
    const a = settle(2, 7, 99, 120);
    const b = settle(2, 7, 99, 120);
    assert.deepEqual(a.particles, b.particles);
  });
});
