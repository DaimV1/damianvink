import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateBracket, deflectionFraction } from "./bracket.ts";

describe("cantilever experiment", () => {
  it("matches a hand-calculated rectangular beam reference", () => {
    const r = calculateBracket(120, 8, 400);
    assert.equal(r.stress, 112.5);
    assert.ok(Math.abs(r.deflection - 0.642857142857) < 1e-10);
    assert.equal(r.beyondYield, false);
  });
  it("shows the independent effects of thickness, length and force", () => {
    const a = calculateBracket(80, 6, 200);
    const thick = calculateBracket(80, 12, 200);
    const long = calculateBracket(160, 6, 200);
    const heavy = calculateBracket(80, 6, 400);
    assert.equal(thick.stress, a.stress / 4);
    assert.equal(thick.deflection, a.deflection / 8);
    assert.equal(long.stress, a.stress * 2);
    assert.equal(long.deflection, a.deflection * 8);
    assert.equal(heavy.deflection, a.deflection * 2);
  });
  it("does not hide extreme results behind a visual clamp", () => {
    const r = calculateBracket(200, 3, 2000);
    assert.ok(r.stress > 6000);
    assert.ok(r.deflection > 200);
    assert.equal(r.beyondYield, true);
    assert.equal(r.largeDeflection, true);
    assert.equal(calculateBracket(40, 20, 0).shortBeam, true);
  });
  it("returns zero at zero load and satisfies curve boundary conditions", () => {
    assert.equal(calculateBracket(120, 8, 0).deflection, 0);
    assert.equal(calculateBracket(120, 8, 0).stress, 0);
    assert.equal(deflectionFraction(0), 0);
    assert.equal(deflectionFraction(1), 1);
    assert.equal(deflectionFraction(0.5), 0.3125);
    assert.throws(() => calculateBracket(120, 0, 400), RangeError);
  });
});
