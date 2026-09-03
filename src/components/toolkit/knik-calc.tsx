import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  computeBuckling,
  copyLine,
  END_CONDITIONS,
  eFor,
  fmtDotComma,
  fmtN,
  kFor,
  lambdaLimit,
  MATERIALS_E,
  rp02For,
  SECTION_KINDS,
  sectionProps,
  type EndConditionId,
  type SectionKind,
} from "@/lib/toolkit/knik";
import { tx, useLocale } from "@/lib/i18n/locale";
import {
  CalcEyebrow,
  CalcPanel,
  CopyLink,
  CopyResult,
  Field,
  Note,
  NumInput,
  ResultGrid,
  SelectInput,
} from "./calc-ui";
import { BucklingModes, SchemaPanel } from "./schema";

function parseNum(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function KnikCalc() {
  const { locale } = useLocale();
  const search = useSearch({ from: "/toolkit/knikberekening" });
  const navigate = useNavigate({ from: "/toolkit/knikberekening" });
  const [sectionKind, setSectionKind] = useState<SectionKind>((search.section as SectionKind) ?? "rond");
  const [D, setD] = useState(search.D ?? "20");
  const [dIn, setDIn] = useState(search.dIn ?? "14");
  const [b, setB] = useState(search.b ?? "40");
  const [h, setH] = useState(search.h ?? "10");
  const [a, setA] = useState(search.a ?? "10");
  const [t, setT] = useState(search.t ?? "3");
  const [L, setL] = useState(search.L ?? "1000");
  const [endCondition, setEndCondition] = useState<EndConditionId>((search.end as EndConditionId) ?? "hh");
  const [materialId, setMaterialId] = useState(search.material ?? "rvs");
  const [F, setF] = useState(search.F ?? "");

  useEffect(() => {
    navigate({
      search: (prev) => ({
        ...prev,
        section: sectionKind,
        D: D || undefined,
        dIn: dIn || undefined,
        b: b || undefined,
        h: h || undefined,
        a: a || undefined,
        t: t || undefined,
        L: L || undefined,
        end: endCondition,
        material: materialId,
        F: F || undefined,
      }),
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKind, D, dIn, b, h, a, t, L, endCondition, materialId, F]);

  const dims = useMemo(() => {
    switch (sectionKind) {
      case "rond":
        return { D: parseNum(D) ?? undefined };
      case "buis":
        return { D: parseNum(D) ?? undefined, d: parseNum(dIn) ?? undefined };
      case "rechthoek":
        return { b: parseNum(b) ?? undefined, h: parseNum(h) ?? undefined };
      case "vierkant":
        return { a: parseNum(a) ?? undefined };
      case "koker":
        return { b: parseNum(b) ?? undefined, h: parseNum(h) ?? undefined, t: parseNum(t) ?? undefined };
    }
  }, [sectionKind, D, dIn, b, h, a, t]);

  const section = useMemo(
    () => sectionProps(sectionKind, dims),
    [sectionKind, dims],
  );
  const Lraw = parseNum(L);
  const Fraw = parseNum(F);
  const k = kFor(endCondition);
  const E = eFor(materialId);
  const material = MATERIALS_E.find((m) => m.id === materialId) ?? MATERIALS_E[0];
  const endLabel = END_CONDITIONS.find((c) => c.id === endCondition);

  const result =
    section && Lraw != null
      ? computeBuckling({ L: Lraw, k, E, I: section.I, A: section.A, F: Fraw })
      : null;

  const copy = useMemo(
    () =>
      result && endLabel
        ? copyLine(result, tx(locale, endLabel.label, endLabel.labelEn))
        : "",
    [result, endLabel, locale],
  );

  const lambdaWarn = lambdaLimit(E, rp02For(materialId));
  const lowLambda = result != null && result.lambda < lambdaWarn;
  const unsafe = result?.safety != null && result.safety < 1;

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {tx(locale, "Euler-knik van een staaf", "Euler buckling of a strut")}
        </h2>
        <Note>
          {tx(
            locale,
            "Kritieke knikkracht F_cr = π² E I / L_eff². Ideale Euler-theorie: geen initiële kromming, geen partiële veiligheidsfactoren. Geen vervanging van EN 1993-1-1 bij kritieke constructies.",
            "Critical load F_cr = π² E I / L_eff². Ideal Euler theory: no initial curvature, no partial safety factors. Not a substitute for EN 1993-1-1 on critical structures.",
          )}
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={tx(locale, "Lengte L (mm)", "Length L (mm)")}>
            <NumInput id="knik-length" value={L} onChange={setL} />
          </Field>
          <Field label={tx(locale, "Inklemming", "End condition")}>
            <SelectInput
              value={endCondition}
              onChange={(v) => setEndCondition(v as EndConditionId)}
            >
              {END_CONDITIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {tx(locale, c.label, c.labelEn)} (k={fmtDotComma(c.k, 3).replace(/,?0+$/, "")})
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={tx(locale, "Doorsnede", "Cross-section")}>
            <SelectInput
              value={sectionKind}
              onChange={(v) => setSectionKind(v as SectionKind)}
            >
              {SECTION_KINDS.map((s) => (
                <option key={s.id} value={s.id}>
                  {tx(locale, s.label, s.labelEn)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={tx(locale, "Materiaal", "Material")}>
            <SelectInput value={materialId} onChange={setMaterialId}>
              {MATERIALS_E.map((m) => (
                <option key={m.id} value={m.id}>
                  {tx(locale, m.label, m.labelEn)}
                </option>
              ))}
            </SelectInput>
          </Field>

          {sectionKind === "rond" ? (
            <Field label={tx(locale, "Diameter D (mm)", "Diameter D (mm)")}>
              <NumInput id="knik-D" value={D} onChange={setD} />
            </Field>
          ) : null}
          {sectionKind === "buis" ? (
            <>
              <Field label={tx(locale, "Buitendiameter D (mm)", "Outer diameter D (mm)")}>
                <NumInput id="knik-D" value={D} onChange={setD} />
              </Field>
              <Field label={tx(locale, "Binnendiameter d (mm)", "Inner diameter d (mm)")}>
                <NumInput id="knik-d" value={dIn} onChange={setDIn} />
              </Field>
            </>
          ) : null}
          {sectionKind === "rechthoek" ? (
            <>
              <Field label={tx(locale, "Breedte b (mm)", "Width b (mm)")}>
                <NumInput id="knik-b" value={b} onChange={setB} />
              </Field>
              <Field label={tx(locale, "Hoogte h (mm)", "Height h (mm)")}>
                <NumInput id="knik-h" value={h} onChange={setH} />
              </Field>
            </>
          ) : null}
          {sectionKind === "vierkant" ? (
            <Field label={tx(locale, "Zijde a (mm)", "Side a (mm)")}>
              <NumInput id="knik-a" value={a} onChange={setA} />
            </Field>
          ) : null}
          {sectionKind === "koker" ? (
            <>
              <Field label={tx(locale, "Breedte b (mm)", "Width b (mm)")}>
                <NumInput id="knik-koker-b" value={b} onChange={setB} />
              </Field>
              <Field label={tx(locale, "Hoogte h (mm)", "Height h (mm)")}>
                <NumInput id="knik-koker-h" value={h} onChange={setH} />
              </Field>
              <Field label={tx(locale, "Wanddikte t (mm)", "Wall thickness t (mm)")}>
                <NumInput id="knik-koker-t" value={t} onChange={setT} />
              </Field>
            </>
          ) : null}
        </div>

        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium text-ink">
            {tx(locale, "Optioneel: axiale last", "Optional: axial load")}
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label={tx(locale, "Axiale last F (N)", "Axial load F (N)")}>
              <NumInput id="knik-force" value={F} onChange={setF} />
            </Field>
          </div>
          <Note>
            {tx(
              locale,
              "Ingevuld: S = F_cr / F wordt getoond. Leeg: alleen F_cr en σ_cr.",
              "Filled in: S = F_cr / F is shown. Empty: only F_cr and σ_cr.",
            )}
          </Note>
        </details>

        {section ? (
          result ? (
            <>
              <p className="mt-5 text-sm text-muted">
                {tx(locale, endLabel?.label ?? "", endLabel?.labelEn ?? "")} ·{" "}
                {tx(locale, material.label, material.labelEn)} · E = {fmtN(E)} N/mm²
              </p>
              <ResultGrid
                items={[
                  { label: "I", value: `${fmtN(result.I)} mm⁴` },
                  { label: "A", value: `${fmtN(result.A)} mm²` },
                  { label: "i", value: `${fmtDotComma(result.i, 1)} mm` },
                  { label: "L_eff", value: `${fmtN(result.Leff)} mm` },
                  { label: "λ", value: fmtDotComma(result.lambda, 1) },
                  { label: "F_cr", value: `${fmtN(result.Fcr)} N` },
                  { label: "σ_cr", value: `${fmtDotComma(result.sigmaCr, 1)} N/mm²` },
                  result.safety != null
                    ? { label: "S", value: fmtDotComma(result.safety, 2) }
                    : null,
                ].filter(Boolean) as { label: string; value: string }[]}
              />
              {unsafe ? (
                <Note>
                  {tx(
                    locale,
                    "F ≥ F_cr — bij deze last knikt de staaf volgens Euler. S < 1.",
                    "F ≥ F_cr — at this load the strut buckles per Euler. S < 1.",
                  )}
                </Note>
              ) : lowLambda ? (
                <Note>
                  {tx(
                    locale,
                    `λ = ${fmtDotComma(result.lambda, 1)} — laag (< ${fmtDotComma(lambdaWarn, 0)} voor ${tx(locale, material.label, material.labelEn)}, richtwaarde λ_grens = π√(E/Rp0,2)). Euler geldt voor slanke staven; bij lage slankheid overschat Euler de sterkte. Controleer met Tetmajer of de Johnson-parabool.`,
                    `λ = ${fmtDotComma(result.lambda, 1)} — low (< ${fmtDotComma(lambdaWarn, 0)} for ${tx(locale, material.label, material.labelEn)}, indicative λ_limit = π√(E/Rp0.2)). Euler applies to slender struts; at low slenderness Euler overestimates strength. Check with Tetmajer or the Johnson parabola.`,
                  )}
                </Note>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <CopyResult text={copy} />
                <CopyLink />
              </div>
            </>
          ) : (
            <p className="mt-5 text-sm text-muted">
              {tx(locale, "Vul een lengte groter dan 0 in.", "Enter a length greater than 0.")}
            </p>
          )
        ) : (
          <p className="mt-5 text-sm text-muted">
            {tx(
              locale,
              "Vul geldige afmetingen in voor de gekozen doorsnede.",
              "Enter valid dimensions for the selected cross-section.",
            )}
          </p>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "Knikvorm", "Buckling shape")}
        </h2>
        <Note>
          {tx(
            locale,
            "De knikvorm bij de gekozen inklemming. k bepaalt de knik-lengte L_eff = k · L. Geen schaal.",
            "The buckling shape for the selected end condition. k sets the buckling length L_eff = k · L. Not to scale.",
          )}
        </Note>
        <SchemaPanel
          caption={tx(
            locale,
            "Knikvormen · Euler-gevallen",
            "Buckling modes · Euler cases",
          )}
        >
          <BucklingModes active={endCondition} />
        </SchemaPanel>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "Knikgevallen (Euler)", "Buckling cases (Euler)")}
        </h2>
        <Note>
          {tx(
            locale,
            "k is de theoretische waarde; k (ontwerp) is de gangbare, conservatievere ontwerpwaarde (AISC/Shigley) — volledig starre inklemming bestaat niet in de praktijk.",
            "k is the theoretical value; k (design) is the customary, more conservative design value (AISC/Shigley) — perfectly rigid fixity does not exist in practice.",
          )}
        </Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{tx(locale, "Inklemming", "End condition")}</th>
                <th>k</th>
                <th>{tx(locale, "k (ontwerp)", "k (design)")}</th>
                <th>L_eff</th>
              </tr>
            </thead>
            <tbody>
              {END_CONDITIONS.map((c) => (
                <tr key={c.id} className={c.id === endCondition ? "is-active" : ""}>
                  <th scope="row">{tx(locale, c.label, c.labelEn)}</th>
                  <td>{fmtDotComma(c.k, 3).replace(/,?0+$/, "")}</td>
                  <td>{fmtDotComma(c.kDesign, 2).replace(/,?0+$/, "")}</td>
                  <td>k · L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {tx(locale, "Bron:", "Source:")}{" "}
          <a
            href="https://www.engineeringtoolbox.com/euler-column-formula-d_1813.html"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Engineering ToolBox — Euler column formula
          </a>
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "E-modulus (indicatief)", "Modulus of elasticity (indicative)")}
        </h2>
        <Note>
          {tx(
            locale,
            "Richtwaarden. Voor een specifieke legering of kwaliteit: materiaalcertificaat of norm nalopen.",
            "Indicative values. For a specific alloy or grade: check the material certificate or standard.",
          )}
        </Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{tx(locale, "Materiaal", "Material")}</th>
                <th>E (N/mm²)</th>
              </tr>
            </thead>
            <tbody>
              {MATERIALS_E.map((m) => (
                <tr key={m.id} className={m.id === materialId ? "is-active" : ""}>
                  <th scope="row">{tx(locale, m.label, m.labelEn)}</th>
                  <td>{fmtN(m.E)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {tx(locale, "Bron:", "Source:")}{" "}
          <a
            href="https://www.engineeringtoolbox.com/young-modulus-d_417.html"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Engineering ToolBox — Young's modulus of elasticity
          </a>
        </p>
      </section>
    </>
  );
}
