import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeBearing, pickBearing } from "./bearing.ts";
import { lookupFastener } from "./fastener.ts";
import { FRICTION, scaleMa } from "./friction.ts";
import { HOLE, bandIndex, computeFit } from "./iso286.ts";
import { designation, lookupIso2768 } from "./iso2768.ts";
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

describe("DIN 6885 spiebaan", () => {
  it("Ø 20 mm is 6 × 6 with t1 3.5", () => {
    const row = lookupKeyway(20);
    assert.ok(row);
    assert.equal(row.b, 6);
    assert.equal(row.h, 6);
    assert.equal(row.t1, 3.5);
    assert.equal(row.t2, 2.8);
  });

  it("Ø 6 mm is outside the first row", () => {
    assert.equal(lookupKeyway(6), null);
    assert.ok(lookupKeyway(7));
  });

  it("P9 on 6 mm width is hole-basis interference", () => {
    const tol = keyWidthTol(6, "P9");
    assert.ok(tol);
    assert.equal(tol.ES, -12);
    assert.equal(tol.EI, -42);
  });
});

describe("lagerpassingen", () => {
  it("Ø 20 inner ring normal load is k5 / H7", () => {
    const rec = pickBearing(20, "binnen", "normaal");
    assert.equal(rec.shaft, "k5");
    assert.equal(rec.hole, "H7");
    const r = computeBearing(20, "binnen", "normaal");
    assert.ok(r);
    assert.equal(r.shaftDev.es[r.i], 11);
    assert.equal(r.shaftDev.ei[r.i], 2);
  });

  it("light load at Ø 20 is j6 not js5", () => {
    assert.equal(pickBearing(20, "binnen", "licht").shaft, "j6");
    assert.equal(pickBearing(17, "binnen", "licht").shaft, "js5");
  });
});

describe("seeger DIN 471/472", () => {
  it("Ø 20 shaft groove is 19.0 × 1.3", () => {
    const row = lookupSeeger(20);
    assert.ok(row);
    const as = seegerFor(row, "as");
    const bore = seegerFor(row, "boring");
    assert.ok(as && bore);
    assert.equal(as.d2, 19);
    assert.equal(bore.d2, 21);
    assert.equal(as.b, 1.3);
    assert.equal(as.t, 0.5);
  });
});

describe("O-ring squeeze", () => {
  it("2.65 mm radial static is nominally 25 %", () => {
    const g = GROOVE.radial[2.65];
    assert.equal(g.t, 2);
    assert.equal(squeeze(2.65, g.t), 25);
  });
});

describe("bevestigers", () => {
  it("M8 medium clearance and VDI table moment", () => {
    const row = lookupFastener(8);
    assert.ok(row);
    assert.equal(row.p, 1.25);
    assert.equal(row.tap, 6.8);
    assert.equal(row.hole.middel, 9);
    assert.equal(row.ma?.["8.8"], 27.3);
  });

  it("scales Ma with friction class and keeps table at factor 1", () => {
    assert.equal(scaleMa(27.3, "tabel"), 27.3);
    assert.equal(FRICTION.tabel.factor, 1);
    assert.ok(scaleMa(27.3, "geolied") < 27.3);
    assert.ok(scaleMa(27.3, "droog") > 27.3);
  });
});

describe("bereikstop", () => {
  it("warns below exclusive lower bound and above max", () => {
    assert.match(rangeHint(6, 6, 7, 110) ?? "", /buiten/);
    assert.match(rangeHint(60, null, 4, 50) ?? "", /50/);
    assert.equal(rangeHint(20, 3, 4, 50), null);
  });
});

describe("iso2768", () => {
  it("42 mm class m is linear ±0.3", () => {
    const r = lookupIso2768(42, "m", "K");
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.linear, 0.3);
  });

  it("ISO 2768-mK returns K form; 42 mm K straightness 0.2", () => {
    const r = lookupIso2768(42, "m", "K");
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.designation, "ISO 2768-mK");
    assert.equal(r.formClass, "K");
    assert.equal(r.straightness, 0.2);
  });

  it("0.4 mm has no row", () => {
    assert.equal(lookupIso2768(0.4, "m", "K").ok, false);
  });

  it("6 mm f linear ±0.05", () => {
    const r = lookupIso2768(6, "f", "H");
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.linear, 0.05);
  });

  it("8 mm v linear ±1.0", () => {
    const r = lookupIso2768(8, "v", "K");
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.linear, 1.0);
  });

  it("designations ISO 2768-mK and ISO 2768-fH", () => {
    assert.equal(designation("m", "K"), "ISO 2768-mK");
    assert.equal(designation("f", "H"), "ISO 2768-fH");
    const mk = lookupIso2768(42, "m", "K");
    const fh = lookupIso2768(42, "f", "H");
    assert.equal(mk.ok && mk.designation, "ISO 2768-mK");
    assert.equal(fh.ok && fh.designation, "ISO 2768-fH");
  });

  it("v at 2 mm linear is empty", () => {
    const r = lookupIso2768(2, "v", "K");
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.linear, null);
  });

  it("circular runout K is 0.2", () => {
    const r = lookupIso2768(42, "m", "K");
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.runout, 0.2);
  });
});
