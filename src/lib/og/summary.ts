/**
 * Turns a shared toolkit URL's query string into the content of its OG card.
 *
 * Pure and dependency-light on purpose: the same calculators the page runs are
 * reused here (no second implementation of any formula — that is exactly the
 * drift the 4 Sept audit warned about), and everything below is unit-tested in
 * toolkit.test.ts.
 *
 * A tool with no entry here, or with inputs that do not resolve to a result,
 * falls back to its TOOLS metadata — so every page still gets a branded card,
 * never the generic site image.
 */
import { computeBearing } from "../toolkit/bearing.ts";
import { forcesAt, seriesLabel, sizeCylinder } from "../toolkit/cylinder.ts";
import { fmtNm, lookupFastener } from "../toolkit/fastener.ts";
import { clearanceRange, computeFit, pairRange } from "../toolkit/iso286.ts";
import { designation, lookupIso2768 } from "../toolkit/iso2768.ts";
import { lookupKeyway } from "../toolkit/keyway.ts";
import { GROOVE, type OringKind } from "../toolkit/oring.ts";
import { fmtSeeger, lookupSeeger, seegerFor, type SeegerKind } from "../toolkit/seeger.ts";
import { TOOLS, type ToolId } from "../toolkit/tools.ts";
import { fmtMm, mmFromUm } from "../utils.ts";

export type OgChip = { label: string; value: string };

export type OgSummary = {
  /** Tool name, e.g. "Passingen". */
  title: string;
  /** Standard/eyebrow, e.g. "ISO 286". */
  standard: string;
  /** The headline the card leads with — the answer, when there is one. */
  headline: string;
  /** Up to 3 supporting key/value pairs. */
  chips: OgChip[];
};

type Search = Record<string, string | undefined>;

function num(v: string | undefined): number {
  if (typeof v !== "string") return Number.NaN;
  return Number.parseFloat(v.replace(",", "."));
}

/** N with a thousands separator, matching the site's nl-NL number style. */
function fmtN(n: number): string {
  return Math.round(n).toLocaleString("nl-NL");
}

type Builder = (s: Search) => { headline: string; chips: OgChip[] } | null;

const BUILDERS: Partial<Record<ToolId, Builder>> = {
  passingen(s) {
    const d = num(s.d);
    const fit = s.fit ?? "H7/h6";
    const r = computeFit(d, fit);
    if (!r) return null;
    return {
      headline: `Ø${d} ${r.fit.id}`,
      chips: [
        { label: `Gat ${r.fit.hole}`, value: `${pairRange(r.ES, r.EI)} mm` },
        { label: `As ${r.fit.shaft}`, value: `${pairRange(r.es, r.ei)} mm` },
        { label: "Speling", value: `${clearanceRange(r.minC, r.maxC)} mm` },
      ],
    };
  },

  cilinder(s) {
    const loadN = num(s.load);
    const pBar = num(s.p);
    const S = Number.isFinite(num(s.s)) ? num(s.s) : 1.25;
    const dir = s.dir === "in" ? "in" : "uit";
    const row = sizeCylinder({ loadN, pBar, S, dir });
    if (!row) return null;
    const f = forcesAt(row, pBar);
    return {
      headline: `Ø${row.bore}/${row.rod} · ${fmtN(dir === "uit" ? f.F_uit : f.F_in)} N`,
      chips: [
        { label: "Norm", value: seriesLabel(row.series) },
        { label: "F_uit", value: `${fmtN(f.F_uit)} N` },
        { label: "F_in", value: `${fmtN(f.F_in)} N` },
      ],
    };
  },

  lager(s) {
    const d = num(s.d);
    const r = computeBearing(d, s.rot ?? "binnen", s.load ?? "normaal");
    if (!r) return null;
    return {
      headline: `Ø${d} · as ${r.shaft} / huis ${r.hole}`,
      chips: [
        { label: `As ${r.shaft}`, value: `${mmFromUm(r.shaftDev.es)} / ${mmFromUm(r.shaftDev.ei)} mm` },
        { label: `Huis ${r.hole}`, value: `${mmFromUm(r.holeDev.ES)} / ${mmFromUm(r.holeDev.EI)} mm` },
        ...(r.holeAlt ? [{ label: "Alternatief", value: r.holeAlt }] : []),
      ],
    };
  },

  spiebaan(s) {
    const d = num(s.d);
    const row = lookupKeyway(d);
    if (!row) return null;
    return {
      headline: `Ø${d} · spie ${row.b} × ${row.h}`,
      chips: [
        { label: "t₁ as", value: `${fmtMm(row.t1)} mm` },
        { label: "t₂ naaf", value: `${fmtMm(row.t2)} mm` },
        { label: "Tol. diepte", value: `0 / +${fmtMm(row.depthTol)} mm` },
      ],
    };
  },

  seeger(s) {
    const d = num(s.d);
    const row = lookupSeeger(d);
    const kind: SeegerKind = s.kind === "boring" ? "boring" : "as";
    const r = row ? seegerFor(row, kind) : null;
    if (!row || !r) return null;
    return {
      headline: `Ø${d} · groef Ø${fmtSeeger(r.d2)} ${r.d2Class}`,
      chips: [
        { label: "Norm", value: kind === "as" ? "DIN 471" : "DIN 472" },
        { label: "b breedte", value: `${fmtSeeger(r.b)} mm` },
        { label: "t diepte", value: `${fmtSeeger(r.t)} mm` },
      ],
    };
  },

  oring(s) {
    const d2 = num(s.d2);
    const kind: OringKind =
      s.kind === "axial" || s.kind === "hydro" ? (s.kind as OringKind) : "radial";
    const g = GROOVE[kind][d2 as keyof (typeof GROOVE)[typeof kind]];
    if (!g) return null;
    const label =
      kind === "radial" ? "Radiaal" : kind === "axial" ? "Axiaal" : "Hydrauliek";
    return {
      headline: `Koord ${fmtMm(d2, 2)} · groef ${fmtMm(g.t)} × ${fmtMm(g.b)}`,
      chips: [
        { label: "Inbouw", value: label },
        { label: "Diepte t", value: `${fmtMm(g.t)} mm` },
        { label: "Breedte b", value: `${fmtMm(g.b)} mm` },
      ],
    };
  },

  iso2768(s) {
    const L = num(s.len);
    const linear = s.linear === "f" || s.linear === "c" || s.linear === "v" ? s.linear : "m";
    const form = s.form === "K" || s.form === "L" ? s.form : "H";
    const r = lookupIso2768(L, linear, form);
    if (!r || r.linearTol == null) return null;
    return {
      headline: `${fmtMm(L)} mm → ±${fmtMm(r.linearTol, 2)} mm`,
      chips: [
        { label: "Aanduiding", value: designation(linear, form) },
        ...(r.straightness != null
          ? [{ label: "Rechtheid", value: `${fmtMm(r.straightness, 2)} mm` }]
          : []),
        { label: "Rondloop", value: `${fmtMm(r.runout, 2)} mm` },
      ],
    };
  },

  bevestigers(s) {
    const d = num(s.size);
    const row = lookupFastener(d);
    if (!row) return null;
    const klass = s.klass === "10.9" || s.klass === "12.9" ? s.klass : "8.8";
    const fit = s.fit === "fijn" || s.fit === "grof" ? s.fit : "middel";
    const ma = row.ma?.[klass];
    return {
      headline: ma != null ? `M${row.d} ${klass} · ${fmtNm(ma)} N·m` : `M${row.d} ${klass}`,
      chips: [
        { label: "Doorlaat", value: `Ø${fmtMm(row.hole[fit])} mm (${fit})` },
        { label: "Kernboor", value: `Ø${fmtMm(row.tap)} mm` },
        { label: "Sleutel", value: `SW ${row.sw}` },
      ],
    };
  },
};

/** Card content for `tool`, given the shared URL's search params. */
export function ogSummary(toolId: string, search: Search): OgSummary | null {
  const tool = TOOLS.find((t) => t.id === toolId);
  if (!tool) return null;

  const built = BUILDERS[tool.id]?.(search) ?? null;
  return {
    title: tool.title,
    standard: tool.standard,
    // No resolvable result (bare page, or inputs outside the tables): the card
    // still identifies the tool rather than falling back to the site image.
    headline: built?.headline ?? tool.blurb,
    chips: built?.chips ?? [],
  };
}
