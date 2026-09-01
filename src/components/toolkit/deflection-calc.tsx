import { useMemo, useState } from "react";
import {
  BEAM_END_CONDITIONS,
  computeDeflection,
  copyLine,
  fmtDotComma,
  type BeamEndCondition,
} from "@/lib/toolkit/deflection";
import {
  eFor,
  MATERIALS_E,
  sectionProps,
  SECTION_KINDS,
  fmtN,
  type SectionKind,
} from "@/lib/toolkit/knik";
import { tx, useLocale } from "@/lib/i18n/locale";
import {
  CalcEyebrow,
  CalcPanel,
  CopyResult,
  Field,
  Note,
  NumInput,
  ResultGrid,
  SelectInput,
} from "./calc-ui";
import { BeamDeflection, SchemaPanel } from "./schema";

function parseNum(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function DeflectionCalc() {
  const { locale } = useLocale();
  const [sectionKind, setSectionKind] = useState<SectionKind>("rond");
  const [D, setD] = useState("20");
  const [dIn, setDIn] = useState("14");
  const [bDim, setBDim] = useState("40");
  const [hDim, setHDim] = useState("10");
  const [aDim, setADim] = useState("10");
  const [L, setL] = useState("1000");
  const [endCondition, setEndCondition] = useState<BeamEndCondition>("ss");
  const [materialId, setMaterialId] = useState("rvs");
  const [P, setP] = useState("1000");
  const [posA, setPosA] = useState("500");

  const dims = useMemo(() => {
    switch (sectionKind) {
      case "rond":
        return { D: parseNum(D) ?? undefined };
      case "buis":
        return { D: parseNum(D) ?? undefined, d: parseNum(dIn) ?? undefined };
      case "rechthoek":
        return { b: parseNum(bDim) ?? undefined, h: parseNum(hDim) ?? undefined };
      case "vierkant":
        return { a: parseNum(aDim) ?? undefined };
    }
  }, [sectionKind, D, dIn, bDim, hDim, aDim]);

  const section = useMemo(() => sectionProps(sectionKind, dims), [sectionKind, dims]);
  const Lraw = parseNum(L);
  const Praw = parseNum(P);
  const posARaw = parseNum(posA);
  const E = eFor(materialId);
  const material = MATERIALS_E.find((m) => m.id === materialId) ?? MATERIALS_E[0];
  const endLabel = BEAM_END_CONDITIONS.find((c) => c.id === endCondition);

  const result =
    section && Lraw != null && Praw != null && posARaw != null
      ? computeDeflection({ end: endCondition, L: Lraw, a: posARaw, E, I: section.I, P: Praw })
      : null;

  const copy = useMemo(
    () =>
      result && endLabel && posARaw != null
        ? copyLine(result, tx(locale, endLabel.label, endLabel.labelEn), posARaw)
        : "",
    [result, endLabel, posARaw, locale],
  );

  const outOfRange = Lraw != null && posARaw != null && (posARaw < 0 || posARaw > Lraw);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {tx(locale, "Doorbuiging balk", "Beam deflection")}
        </h2>
        <Note>
          {tx(
            locale,
            "Standaard balkformules voor een puntlast op willekeurige positie. Twee statisch bepaalde gevallen: vrij opgelegd en uitkraging. Lineair-elastisch, kleine doorbuigingen. Geen vervanging van een sterkteberekening volgens EN 1993-1-1 bij kritieke constructies.",
            "Standard beam formulas for a point load at an arbitrary position. Two statically determinate cases: simply supported and cantilever. Linear-elastic, small deflections. Not a substitute for a strength calculation per EN 1993-1-1 on critical structures.",
          )}
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={tx(locale, "Lengte L (mm)", "Length L (mm)")}>
            <NumInput id="defl-length" value={L} onChange={setL} />
          </Field>
          <Field label={tx(locale, "Inklemming", "End condition")}>
            <SelectInput
              value={endCondition}
              onChange={(v) => setEndCondition(v as BeamEndCondition)}
            >
              {BEAM_END_CONDITIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {tx(locale, c.label, c.labelEn)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={tx(locale, "Doorsnede", "Cross-section")}>
            <SelectInput value={sectionKind} onChange={(v) => setSectionKind(v as SectionKind)}>
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
              <NumInput id="defl-D" value={D} onChange={setD} />
            </Field>
          ) : null}
          {sectionKind === "buis" ? (
            <>
              <Field label={tx(locale, "Buitendiameter D (mm)", "Outer diameter D (mm)")}>
                <NumInput id="defl-D" value={D} onChange={setD} />
              </Field>
              <Field label={tx(locale, "Binnendiameter d (mm)", "Inner diameter d (mm)")}>
                <NumInput id="defl-d" value={dIn} onChange={setDIn} />
              </Field>
            </>
          ) : null}
          {sectionKind === "rechthoek" ? (
            <>
              <Field label={tx(locale, "Breedte b (mm)", "Width b (mm)")}>
                <NumInput id="defl-b" value={bDim} onChange={setBDim} />
              </Field>
              <Field label={tx(locale, "Hoogte h (mm)", "Height h (mm)")}>
                <NumInput id="defl-h" value={hDim} onChange={setHDim} />
              </Field>
            </>
          ) : null}
          {sectionKind === "vierkant" ? (
            <Field label={tx(locale, "Zijde a (mm)", "Side a (mm)")}>
              <NumInput id="defl-a" value={aDim} onChange={setADim} />
            </Field>
          ) : null}

          <Field label={tx(locale, "Puntlast P (N)", "Point load P (N)")}>
            <NumInput id="defl-P" value={P} onChange={setP} />
          </Field>
          <Field
            label={tx(
              locale,
              endCondition === "cant"
                ? "Afstand a vanaf inklemming (mm)"
                : "Afstand a vanaf linker steunpunt (mm)",
              endCondition === "cant"
                ? "Distance a from the fixed end (mm)"
                : "Distance a from the left support (mm)",
            )}
          >
            <NumInput id="defl-posA" value={posA} onChange={setPosA} />
          </Field>
        </div>

        {section ? (
          result ? (
            <>
              <p className="mt-5 text-sm text-muted">
                {tx(locale, endLabel?.label ?? "", endLabel?.labelEn ?? "")} ·{" "}
                {tx(locale, material.label, material.labelEn)} · E = {fmtN(E)} N/mm²
              </p>
              <ResultGrid
                items={[
                  { label: "I", value: `${fmtN(section.I)} mm⁴` },
                  { label: "A", value: `${fmtN(section.A)} mm²` },
                  { label: "δ(a)", value: `${fmtDotComma(result.deltaAtLoad, 3)} mm` },
                  { label: "δ_max", value: `${fmtDotComma(result.deltaMax, 3)} mm` },
                  { label: "x (δ_max)", value: `${fmtDotComma(result.xMax, 0)} mm` },
                ]}
              />
              <CopyResult text={copy} />
            </>
          ) : outOfRange ? (
            <p className="mt-5 text-sm text-muted">
              {tx(
                locale,
                "Afstand a moet tussen 0 en de lengte L liggen.",
                "Distance a must be between 0 and the length L.",
              )}
            </p>
          ) : (
            <p className="mt-5 text-sm text-muted">
              {tx(
                locale,
                "Vul lengte, puntlast en afstand a in (a tussen 0 en L).",
                "Enter length, point load and distance a (a between 0 and L).",
              )}
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
          {tx(locale, "Belastingschema", "Loading diagram")}
        </h2>
        <Note>
          {tx(
            locale,
            "Positie van de last en van de maximale doorbuiging bij de gekozen inklemming. Geen schaal.",
            "Position of the load and of the maximum deflection for the selected end condition. Not to scale.",
          )}
        </Note>
        <SchemaPanel
          caption={tx(locale, "Belastingschema · puntlast", "Loading diagram · point load")}
        >
          <BeamDeflection
            end={endCondition}
            a={posARaw != null && Lraw != null ? Math.min(Math.max(posARaw, 0), Lraw) : 0}
            L={Lraw ?? 1000}
            E={E}
            I={section?.I ?? 7854}
            P={Praw ?? 1000}
          />
        </SchemaPanel>
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
      </section>
    </>
  );
}
