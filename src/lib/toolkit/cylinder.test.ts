import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cycleLiters,
  forceN,
  forcesAt,
  ISO_15552,
  minPistonMm,
  pistonAreaMm2,
  sizeCylinder,
} from "./cylinder.ts";

describe("pneumatische cilinder", () => {
  it("Ø32 at 6 bar is 482,5 N out, 414,7 N in (rod 12)", () => {
    const row = ISO_15552[0];
    assert.equal(row.bore, 32);
    assert.equal(row.rod, 12);
    const f = forcesAt(row, 6);
    assert.ok(Math.abs(f.F_uit - 482.55) < 0.05);
    assert.ok(Math.abs(f.F_in - 414.69) < 0.05);
  });

  it("1 bar · 1 mm² = 0,1 N", () => {
    assert.equal(forceN(1, 1), 0.1);
  });

  it("1000 N at 6 bar, S=1,25 uit → Ø63 ISO 15552", () => {
    const pick = sizeCylinder({
      loadN: 1000,
      pBar: 6,
      S: 1.25,
      dir: "uit",
    });
    assert.ok(pick);
    assert.equal(pick.bore, 63);
    assert.equal(pick.series, "iso15552");
    const dMin = minPistonMm(1250, 6);
    assert.ok(dMin);
    assert.ok(dMin > 50 && dMin < 63);
  });

  it("100 N at 6 bar, S=1,25 uit → Ø20 ISO 6432", () => {
    const pick = sizeCylinder({
      loadN: 100,
      pBar: 6,
      S: 1.25,
      dir: "uit",
    });
    assert.ok(pick);
    assert.equal(pick.bore, 20);
    assert.equal(pick.series, "iso6432");
  });

  it("above Ø320 returns null", () => {
    const pick = sizeCylinder({
      loadN: 1e6,
      pBar: 6,
      S: 1.25,
      dir: "uit",
    });
    assert.equal(pick, null);
  });

  it("retract needs a larger bore than extend at the same load", () => {
    const uit = sizeCylinder({
      loadN: 450,
      pBar: 6,
      S: 1,
      dir: "uit",
    });
    const inn = sizeCylinder({
      loadN: 450,
      pBar: 6,
      S: 1,
      dir: "in",
    });
    assert.equal(uit?.bore, 32);
    assert.equal(inn?.bore, 40);
  });

  it("cycle liters is (A+Aann)·s·(p+1)/1e6", () => {
    const row = ISO_15552[0];
    const A = pistonAreaMm2(32);
    const Aann = pistonAreaMm2(32) - pistonAreaMm2(12);
    const expected = ((A + Aann) * 100 * 7) / 1e6;
    const got = cycleLiters(row, 6, 100);
    assert.ok(got);
    assert.ok(Math.abs(got - expected) < 1e-12);
  });
});
