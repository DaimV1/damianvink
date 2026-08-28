import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeBearing, pickBearing } from "./bearing.ts";
import { lookupFastener } from "./fastener.ts";
import { FRICTION, scaleMa } from "./friction.ts";
import { HOLE, bandIndex, computeFit } from "./iso286.ts";
import { keyWidthTol, lookupKeyway } from "./keyway.ts";
import {
  copyLine,
  nextIecKw,
  sizeMotor,
} from "./motor.ts";
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

describe("motor", () => {
  const base = {
    v_ms: 0.5,
    D_m: 0.1,
    mass_kg: 500,
    duty: "rollenbaan" as const,
    mu: 0.03,
    eta: 0.85,
    fb: 1.2,
  };

  it("horizontal roller: n, F, T, P and IEC 0.12 kW", () => {
    const r = sizeMotor(base);
    assert.ok(r);
    assert.ok(Math.abs(r.n_rpm - 95.5) < 0.05);
    assert.ok(Math.abs(r.F - 147) < 0.2);
    assert.ok(Math.abs(r.T - 7.36) < 0.02);
    assert.ok(Math.abs(r.P_as_kW - 0.074) < 0.002);
    assert.ok(Math.abs(r.P_motor_kW - 0.104) < 0.002);
    assert.equal(r.iecKw, 0.12);
  });

  it("zero speed → no row", () => {
    assert.equal(sizeMotor({ ...base, v_ms: 0 }), null);
  });

  it("zero D → no row", () => {
    assert.equal(sizeMotor({ ...base, D_m: 0 }), null);
  });

  it("hijsen F = m g, no μ", () => {
    const r = sizeMotor({ ...base, duty: "hijsen", mu: 0.03 });
    assert.ok(r);
    assert.ok(Math.abs(r.F - 500 * 9.81) < 0.01);
  });

  it("i ≈ 1450 / n", () => {
    const r = sizeMotor(base);
    assert.ok(r && r.i != null);
    assert.ok(Math.abs(r.i - 1450 / r.n_rpm) < 1e-9);
  });

  it("nextIecKw(0.104) === 0.12", () => {
    assert.equal(nextIecKw(0.104), 0.12);
  });

  it("copy line contains P and n", () => {
    const r = sizeMotor(base);
    assert.ok(r);
    const line = copyLine(r);
    assert.match(line, /P=/);
    assert.match(line, /n=/);
    assert.match(line, /min/);
  });
});
