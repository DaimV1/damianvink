import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeBearing, pickBearing } from "./bearing.ts";
import { FRICTION, lookupFastener, scaleMa } from "./fastener.ts";
import { HOLE, bandIndex, computeFit } from "./iso286.ts";
import { keyWidthTol, lookupKeyway } from "./keyway.ts";
import { GROOVE, squeeze } from "./oring.ts";
import { lookupSeeger, seegerFor } from "./seeger.ts";
import { rangeHint } from "./tools.ts";

describe("ISO 286 passingen", () => {
  it("H7/h6 at 20 mm is 0 to 34 µm clearance", () => {
    const r = computeFit(20, "H7/h6");
    assert.ok(r);
    assert.equal(r.ES, 21);
    assert.equal(r.EI, 0);
    assert.equal(r.es, 0);
    assert.equal(r.ei, -13);
    assert.equal(r.minC, 0);
    assert.equal(r.maxC, 34);
    assert.equal(r.kind.kind, "los");
  });

  it("JS7 is unrounded ±IT7/2", () => {
    assert.equal(HOLE.JS7.ES[bandIndex(8)], 7.5);
    assert.equal(HOLE.JS7.ES[bandIndex(20)], 10.5);
    assert.equal(HOLE.JS7.ES[bandIndex(40)], 12.5);
  });

  it("H7/p6 is line fit up to 18 mm and interference after", () => {
    const small = computeFit(12, "H7/p6");
    const large = computeFit(20, "H7/p6");
    assert.ok(small && large);
    assert.equal(small.maxC, 0);
    assert.ok(small.minC < 0);
    assert.ok(large.maxC < 0);
  });

  it("returns null outside 3–50 mm", () => {
    assert.equal(computeFit(3, "H7/h6"), null);
    assert.equal(computeFit(51, "H7/h6"), null);
    assert.equal(computeFit(60, "H7/h6"), null);
  });
});
