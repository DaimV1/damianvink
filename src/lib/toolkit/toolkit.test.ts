import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeBearing, pickBearing } from "./bearing.ts";
import { lookupFastener } from "./fastener.ts";
import { FRICTION, scaleMa } from "./friction.ts";
import { HOLE, bandIndex, computeFit, fitExtendable } from "./iso286.ts";
import { designation, lookupIso2768 } from "./iso2768.ts";
import { keyWidthTol, lookupKeyway } from "./keyway.ts";
import {
  copyLine,
  nextIecKw,
  sizeMotor,
} from "./motor.ts";
import { GROOVE, squeeze } from "./oring.ts";
import { lookupSeeger, seegerFor } from "./seeger.ts";
import { lookupKanten } from "./kanten.ts";
import { computeBuckling, sectionProps } from "./knik.ts";
import { rangeHint, matchTools, TOOLS } from "./tools.ts";

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

  it("returns null at/below 3 mm (below the table's first band)", () => {
    assert.equal(computeFit(3, "H7/h6"), null);
  });

  it("H7/h6 (formula-extendable) works past 50 mm, band 50-80", () => {
    const r = computeFit(60, "H7/h6");
    assert.ok(r);
    assert.equal(r.ES, 30);
    assert.equal(r.EI, 0);
    assert.equal(r.es, 0);
    assert.equal(r.ei, -19);
    assert.equal(r.minC, 0);
    assert.equal(r.maxC, 49);
    // same ISO band (50-80) at both ends, so identical result
    assert.deepEqual(computeFit(51, "H7/h6"), r);
  });

  it("H7/h6 formula still resolves deep into the norm (e.g. Ø1000)", () => {
    const r = computeFit(1000, "H7/h6");
    assert.ok(r);
    assert.ok(r.ES > 0);
    assert.equal(r.EI, 0);
    assert.equal(r.es, 0);
    assert.ok(r.ei < 0);
    assert.equal(r.minC, 0);
    assert.ok(r.maxC > 0);
  });

  it("H7/k6 (no formula for k) stays capped at 50 mm", () => {
    assert.ok(computeFit(40, "H7/k6"));
    assert.equal(computeFit(60, "H7/k6"), null);
  });

  it("fitExtendable matches which fits have a formula on both sides", () => {
    assert.equal(fitExtendable("H7/h6"), true);
    assert.equal(fitExtendable("H7/g6"), true);
    assert.equal(fitExtendable("H8/f7"), true);
    assert.equal(fitExtendable("H9/d9"), true);
    assert.equal(fitExtendable("H11/c11"), false);
    assert.equal(fitExtendable("H7/k6"), false);
    assert.equal(fitExtendable("H7/n6"), false);
    assert.equal(fitExtendable("H7/p6"), false);
    assert.equal(fitExtendable("H7/s6"), false);
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

  it("roller inertia adds 0.5*m*a to F, T and P during acceleration", () => {
    const r = sizeMotor({ ...base, a_ms2: 0.5, rollerMass_kg: 50 });
    assert.ok(r);
    // F_load = m g mu + m a = 147.15 + 250 = 397.15; roller adds 0.5*50*0.5 = 12.5
    assert.ok(Math.abs(r.rollerAccelForce - 12.5) < 1e-9);
    assert.ok(Math.abs(r.F - 409.65) < 0.01);
    assert.ok(Math.abs(r.T - 409.65 * 0.05) < 0.001);
    assert.ok(Math.abs(r.P_as_kW - (409.65 * 0.5) / 1000) < 1e-6);
  });

  it("roller inertia is zero without a roller mass or without acceleration", () => {
    const noMass = sizeMotor({ ...base, a_ms2: 0.5 });
    const noAccel = sizeMotor({ ...base, rollerMass_kg: 50 });
    assert.ok(noMass && noAccel);
    assert.equal(noMass.rollerAccelForce, 0);
    assert.equal(noAccel.rollerAccelForce, 0);
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

describe("iso2768", () => {
  it("42 mm class m → ±0,3 linear", () => {
    const r = lookupIso2768(42, "m", "K");
    assert.ok(r);
    assert.equal(r.linearTol, 0.3);
  });

  it("ISO 2768-mK returns K form", () => {
    const r = lookupIso2768(42, "m", "K");
    assert.ok(r);
    assert.equal(r.callout, "ISO 2768-mK");
    assert.equal(r.form, "K");
    assert.equal(r.straightness, 0.2);
    assert.equal(designation("m", "K"), "ISO 2768-mK");
    assert.equal(designation("f", "H"), "ISO 2768-fH");
  });

  it("0,4 mm no row", () => {
    assert.equal(lookupIso2768(0.4, "m", "K"), null);
  });

  it("6 mm f linear ±0,05", () => {
    const r = lookupIso2768(6, "f", "K");
    assert.ok(r);
    assert.equal(r.linearTol, 0.05);
  });

  it("8 mm v linear ±1,0", () => {
    const r = lookupIso2768(8, "v", "K");
    assert.ok(r);
    assert.equal(r.linearTol, 1.0);
  });

  it("v at 2 mm linear is empty", () => {
    const r = lookupIso2768(2, "v", "K");
    assert.ok(r);
    assert.equal(r.linearTol, null);
  });

  it("circulaire uitloop K = 0,2 independent of size", () => {
    const a = lookupIso2768(2, "m", "K");
    const b = lookupIso2768(200, "m", "K");
    assert.ok(a && b);
    assert.equal(a.runout, 0.2);
    assert.equal(b.runout, 0.2);
  });
});

describe("kanten", () => {
  it("2 mm staal haaks → Ri 1,88, w 12, s 9,10", () => {
    const r = lookupKanten(2, "staal", "haaks");
    assert.ok(r);
    assert.equal(r.ri, 1.88);
    assert.equal(r.w, 12);
    assert.equal(r.s, 9.1);
  });

  it("3 mm RVS haaks → s 15,12", () => {
    const r = lookupKanten(3, "rvs", "haaks");
    assert.ok(r);
    assert.equal(r.s, 15.12);
  });

  it("0,8 mm alu haaks Ri is empty, not a neighbour", () => {
    const r = lookupKanten(0.8, "alu", "haaks");
    assert.ok(r);
    assert.equal(r.ri, null);
    assert.equal(r.w, 8);
    assert.equal(r.s, 5.7);
  });

  it("scherp hoogsterkte has no Ri column", () => {
    const r = lookupKanten(2, "hoogsterkte", "scherp");
    assert.ok(r);
    assert.equal(r.ri, null);
  });

  it("hoogsterkte haaks Ri only at 8/10/12", () => {
    assert.equal(lookupKanten(6, "hoogsterkte", "haaks")?.ri, null);
    assert.equal(lookupKanten(8, "hoogsterkte", "haaks")?.ri, 8);
    assert.equal(lookupKanten(10, "hoogsterkte", "haaks")?.ri, 8.23);
    assert.equal(lookupKanten(12, "hoogsterkte", "haaks")?.ri, 7.02);
  });

  it("unknown thickness → null, no neighbour", () => {
    assert.equal(lookupKanten(7, "staal", "haaks"), null);
  });
});

describe("toolkit zoek", () => {
  it("empty query returns every tool", () => {
    assert.equal(matchTools("").length, TOOLS.length);
    assert.equal(matchTools("   ").length, TOOLS.length);
  });

  it("ISO 286 hits passingen and lager, not seeger", () => {
    const ids = matchTools("ISO 286").map((t) => t.id);
    assert.ok(ids.includes("passingen"));
    assert.ok(ids.includes("lager"));
    assert.equal(ids.includes("seeger"), false);
  });

  it("H7 finds passingen via tags", () => {
    assert.deepEqual(matchTools("h7").map((t) => t.id), ["passingen"]);
  });

  it("moment finds bevestigers", () => {
    assert.ok(matchTools("moment").some((t) => t.id === "bevestigers"));
  });

  it("inch finds eenheden despite capital I", () => {
    assert.ok(matchTools("INCH").some((t) => t.id === "eenheden"));
  });

  it("unknown term is empty", () => {
    assert.equal(matchTools("xyzzy").length, 0);
  });
});

describe("Euler-knik", () => {
  it("square 10 mm, L=500 mm, K=1, E=200000: F_cr ≈ 6579,7 N", () => {
    const section = sectionProps("vierkant", { a: 10 });
    assert.ok(section);
    assert.ok(Math.abs(section.I - 833.3333) < 0.001);
    assert.equal(section.A, 100);
    const r = computeBuckling({ L: 500, k: 1, E: 200000, I: section.I, A: section.A, F: null });
    assert.ok(r);
    assert.ok(Math.abs(r.Fcr - 6579.7) < 1);
    assert.ok(Math.abs(r.sigmaCr - 65.797) < 0.01);
    assert.ok(Math.abs(r.lambda - 173.205) < 0.01);
    assert.equal(r.safety, null);
  });

  it("F_cr scales with 1/k²: fixed-free (k=2) is a quarter of pinned-pinned (k=1)", () => {
    const section = sectionProps("rond", { D: 20 });
    assert.ok(section);
    const hh = computeBuckling({ L: 1000, k: 1, E: 210000, I: section.I, A: section.A, F: null });
    const fc = computeBuckling({ L: 1000, k: 2, E: 210000, I: section.I, A: section.A, F: null });
    assert.ok(hh && fc);
    assert.ok(Math.abs(hh.Fcr / fc.Fcr - 4) < 1e-9);
  });

  it("tube I/A less than solid round of the same OD", () => {
    const solid = sectionProps("rond", { D: 30 });
    const tube = sectionProps("buis", { D: 30, d: 24 });
    assert.ok(solid && tube);
    assert.ok(tube.I < solid.I);
    assert.ok(tube.A < solid.A);
  });

  it("rectangle takes the weaker axis", () => {
    const section = sectionProps("rechthoek", { b: 40, h: 10 });
    assert.ok(section);
    assert.ok(Math.abs(section.I - (10 * 40 ** 3) / 12) < 1e-6);
  });

  it("safety factor is F_cr / F when a load is given", () => {
    const section = sectionProps("rond", { D: 20 });
    assert.ok(section);
    const r = computeBuckling({ L: 1000, k: 1, E: 210000, I: section.I, A: section.A, F: 1000 });
    assert.ok(r && r.safety != null);
    assert.ok(Math.abs(r.safety - r.Fcr / 1000) < 1e-9);
  });

  it("invalid inputs return null", () => {
    assert.equal(sectionProps("buis", { D: 10, d: 12 }), null);
    assert.equal(sectionProps("rond", { D: 0 }), null);
    assert.equal(computeBuckling({ L: 0, k: 1, E: 210000, I: 100, A: 10, F: null }), null);
  });
});
