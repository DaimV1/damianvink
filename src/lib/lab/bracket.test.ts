import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GUSSET_THRESHOLD_N, needsGusset, requiredThicknessMm } from "./bracket.ts";

describe("bracket demo sizing", () => {
  it("thickness grows with span and with load", () => {
    const base = requiredThicknessMm(120, 400);
    assert.ok(requiredThicknessMm(200, 400) > base);
    assert.ok(requiredThicknessMm(120, 2000) > base);
  });

  it("clamps to the visual range at the slider extremes", () => {
    assert.equal(requiredThicknessMm(40, 50), 3);
    assert.ok(requiredThicknessMm(200, 2000) <= 18);
  });

  it("gusset threshold matches the exported constant", () => {
    assert.equal(needsGusset(GUSSET_THRESHOLD_N - 1), false);
    assert.equal(needsGusset(GUSSET_THRESHOLD_N), true);
  });
});
