import { useMemo, useState, type ReactNode } from "react";
import { computeBearing } from "@/lib/toolkit/bearing";
import { readStoredDiameter, storeDiameter } from "@/lib/toolkit/tools";
import { mmFromUm } from "@/lib/utils";
import { tx, useLocale } from "@/lib/i18n/locale";
import {
  CalcEyebrow,
  CalcPanel,
  CopyResult,
  Field,
  Note,
  NumInput,
  parseWholeMm,
  ResultGrid,
  SelectInput,
} from "./calc-ui";
import { BearingFitChart, SchemaPanel } from "./schema";

export function LagerCalc() {
  const { locale } = useLocale();
  const [diameter, setDiameter] = useState(() =>
    readStoredDiameter({ min: 4, max: 50 }),
  );
  const [rot, setRot] = useState("binnen");
  const [load, setLoad] = useState("normaal");
  const parsed = parseWholeMm(diameter);
  const d = parsed.status === "ok" ? parsed.mm : Number.NaN;
  const stil = rot === "stil";
  const result = parsed.status === "ok" ? computeBearing(d, rot, load) : null;

  function onDia(v: string) {
    setDiameter(v);
    const next = parseWholeMm(v);
    if (next.status === "ok") storeDiameter(String(next.mm));
  }

  const copy = useMemo(() => {
    if (!result) return "";
    const i = result.i;
    const shaftL = tx(locale, "As", "Shaft");
    const houseL = tx(locale, "Huis", "Housing");
    const bearingL = tx(locale, "Groefkogellager", "Deep-groove bearing");
    const altL = tx(locale, "(alternatief)", "(alternative)");
    return [
      `${bearingL} · ${shaftL.toLowerCase()} Ø ${d} mm · band ${tx(locale, result.band.label, result.band.labelEn)} mm`,
      `${shaftL} ${result.shaft}  ${mmFromUm(result.shaftDev.es[i])} / ${mmFromUm(result.shaftDev.ei[i])} mm`,
      `${houseL} ${result.hole}  ${mmFromUm(result.holeDev.ES[i])} / ${mmFromUm(result.holeDev.EI[i])} mm`,
      result.holeAlt ? `${houseL} ${result.holeAlt} ${altL}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [d, result, locale]);

  const items: { label: ReactNode; value: string }[] =
    result
      ? ([
          {
            label: (
              <>
                {tx(locale, "As", "Shaft")} <span className="normal-case">{result.shaft}</span>
              </>
            ),
            value: `${mmFromUm(result.shaftDev.es[result.i])} / ${mmFromUm(result.shaftDev.ei[result.i])} mm`,
          },
          {
            label: `${tx(locale, "Huis", "Housing")} ${result.hole}`,
            value: `${mmFromUm(result.holeDev.ES[result.i])} / ${mmFromUm(result.holeDev.EI[result.i])} mm`,
          },
          result.holeAltDev
            ? {
                label: `${tx(locale, "Huis", "Housing")} ${result.holeAlt} ${tx(locale, "(alternatief)", "(alternative)")}`,
                value: `${mmFromUm(result.holeAltDev.ES[result.i])} / ${mmFromUm(result.holeAltDev.EI[result.i])} mm`,
              }
            : null,
          stil
            ? {
                label: (
                  <>
                    {tx(locale, "As", "Shaft")}{" "}
                    <span className="normal-case">h6</span>{" "}
                    {tx(locale, "(geen verschuiving nodig)", "(no shift needed)")}
                  </>
                ),
                value: `${mmFromUm(result.h6.es[result.i])} / ${mmFromUm(result.h6.ei[result.i])} mm`,
              }
            : null,
        ].filter(Boolean) as { label: ReactNode; value: string }[])
      : [];

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {tx(locale, "Groefkogellager", "Deep-groove bearing")}
        </h2>
        <Note>
          {tx(
            locale,
            "As-Ø in hele mm (4 t/m 50). Lastkeuze valt weg bij stilstaande binnenring. Klassen volgens SKF; µm → mm volgens ISO 286-2.",
            "Shaft Ø in whole mm (4 through 50). Load choice drops away for a stationary inner ring. Classes per SKF; µm → mm per ISO 286-2.",
          )}
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Field label={tx(locale, "As-Ø (mm)", "Shaft Ø (mm)")}>
            <NumInput id="lager-diameter" value={diameter} onChange={onDia} />
          </Field>
          <Field label={tx(locale, "Rotatie", "Rotation")}>
            <SelectInput value={rot} onChange={setRot}>
              <option value="binnen">{tx(locale, "Binnenring draait (as)", "Inner ring rotates (shaft)")}</option>
              <option value="buiten">{tx(locale, "Buitenring draait (naaf)", "Outer ring rotates (hub)")}</option>
              <option value="stil">{tx(locale, "Binnenring stil", "Inner ring stationary")}</option>
            </SelectInput>
          </Field>
          <Field label={tx(locale, "Last", "Load")}>
            <SelectInput value={load} onChange={setLoad} disabled={stil}>
              <option value="licht">{tx(locale, "Licht, P ≤ 0,05 C", "Light, P ≤ 0.05 C")}</option>
              <option value="normaal">{tx(locale, "Normaal tot hoog, P > 0,05 C", "Normal to high, P > 0.05 C")}</option>
            </SelectInput>
          </Field>
        </div>
        {parsed.status === "empty" ? (
          <p className="mt-5 text-sm text-muted">
            {tx(locale, "Vul een as-Ø in.", "Enter a shaft Ø.")}
          </p>
        ) : parsed.status === "fraction" ? (
          <p className="mt-5 text-sm text-muted">
            {tx(
              locale,
              `Alleen hele millimeters. ${diameter} mm valt niet in de SKF-rijen tot 50 mm.`,
              `Whole millimeters only. ${diameter} mm is not in the SKF rows up to 50 mm.`,
            )}
          </p>
        ) : !result ? (
          <p className="mt-5 text-sm text-muted">
            {tx(
              locale,
              `Geen SKF-rij voor Ø ${d} mm. Rekenhulp: 4 t/m 50 mm.`,
              `No SKF row for Ø ${d} mm. Tool range: 4 through 50 mm.`,
            )}
          </p>
        ) : (
          <>
            <p className="mt-5 text-sm text-muted">
              {tx(
                locale,
                `As Ø ${d} mm · band ${result.band.label} mm · groefkogellager`,
                `Shaft Ø ${d} mm · band ${result.band.labelEn} mm · deep-groove bearing`,
              )}
            </p>
            <ResultGrid items={items} />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {tx(locale, result.note, result.noteEn)}
            </p>
            <CopyResult text={copy} />
          </>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "Tolerantievelden", "Tolerance zones")}
        </h2>
        <Note>
          {tx(
            locale,
            "ISO 286 voor de gekozen Ø-band. Boven: huis (gat), onder: as. Positief = groter dan nominaal. Accent = aanbevolen klasse; lichter = alternatief huis.",
            "ISO 286 for the selected Ø band. Top: housing (hole), bottom: shaft. Positive = larger than nominal. Accent = recommended class; lighter = alternative housing.",
          )}
        </Note>
        <SchemaPanel
          caption={
            result ? (
              <>
                {tx(locale, "Band", "Band")} {tx(locale, result.band.label, result.band.labelEn)} mm ·{" "}
                {tx(locale, "as", "shaft")} <span className="normal-case">{result.shaft}</span> ·{" "}
                {tx(locale, "huis", "housing")} {result.hole}
                {result.holeAlt ? ` / ${result.holeAlt}` : ""}
              </>
            ) : (
              tx(locale, "Band boven 18 t/m 30 mm — vul een Ø in", "Band over 18 through 30 mm — enter an Ø")
            )
          }
        >
          <BearingFitChart
            bandIndex={result?.i ?? 3}
            shaft={result?.shaft}
            hole={result?.hole}
            holeAlt={result?.holeAlt}
          />
        </SchemaPanel>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "As — groefkogellager", "Shaft — deep-groove bearing")}
        </h2>
        <Note>
          {tx(
            locale,
            "SKF, massieve stalen as, cilindrische boring. Alleen rijen tot 50 mm. P is de equivalente lagerbelasting, C het dynamische draaggetal.",
            "SKF, solid steel shaft, cylindrical bore. Rows up to 50 mm only. P is the equivalent bearing load, C the dynamic load rating.",
          )}
        </Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{tx(locale, "Last", "Load")}</th>
                <th>{tx(locale, "As-Ø (mm)", "Shaft Ø (mm)")}</th>
                <th>{tx(locale, "Klasse", "Class")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" rowSpan={2}>
                  {tx(locale, "Licht, P ≤ 0,05 C", "Light, P ≤ 0.05 C")}
                </th>
                <td>≤ 17</td>
                <td>js5</td>
              </tr>
              <tr>
                <td>{tx(locale, "(17) t/m 50", "(17) through 50")}</td>
                <td>j6</td>
              </tr>
              <tr>
                <th scope="row" rowSpan={3}>
                  {tx(locale, "Normaal tot hoog, P > 0,05 C", "Normal to high, P > 0.05 C")}
                </th>
                <td>≤ 10</td>
                <td>js5</td>
              </tr>
              <tr>
                <td>{tx(locale, "(10) t/m 17", "(10) through 17")}</td>
                <td>j5</td>
              </tr>
              <tr>
                <td>{tx(locale, "(17) t/m 50", "(17) through 50")}</td>
                <td>k5</td>
              </tr>
              <tr>
                <th scope="row">
                  {tx(
                    locale,
                    "Binnenring stil, verschuiven gewenst",
                    "Inner ring stationary, shift desired",
                  )}
                </th>
                <td>{tx(locale, "alle Ø", "all Ø")}</td>
                <td>g6</td>
              </tr>
              <tr>
                <th scope="row">
                  {tx(
                    locale,
                    "Binnenring stil, verschuiven niet nodig",
                    "Inner ring stationary, shift not needed",
                  )}
                </th>
                <td>{tx(locale, "alle Ø", "all Ø")}</td>
                <td>h6</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "Huis — gietijzer / staal", "Housing — cast iron / steel")}
        </h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{tx(locale, "Situatie", "Situation")}</th>
                <th>{tx(locale, "Klasse", "Class")}</th>
                <th>{tx(locale, "Buitenring", "Outer ring")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  {tx(locale, "Stilstaande buitenring, algemeen", "Stationary outer ring, general")}
                </th>
                <td>H7</td>
                <td>{tx(locale, "verschuifbaar", "slidable")}</td>
              </tr>
              <tr>
                <th scope="row">
                  {tx(locale, "Licht tot normaal, schuiven gewenst", "Light to normal, sliding desired")}
                </th>
                <td>J7</td>
                <td>{tx(locale, "meestal verschuifbaar", "usually slidable")}</td>
              </tr>
              <tr>
                <th scope="row">
                  {tx(
                    locale,
                    "Normaal tot hoog, schuiven niet nodig",
                    "Normal to high, sliding not needed",
                  )}
                </th>
                <td>K7</td>
                <td>{tx(locale, "meestal vast", "usually fixed")}</td>
              </tr>
              <tr>
                <th scope="row">
                  {tx(locale, "Buitenring draait, licht (P ≤ 0,05 C)", "Outer ring rotates, light (P ≤ 0.05 C)")}
                </th>
                <td>M7</td>
                <td>{tx(locale, "vast", "fixed")}</td>
              </tr>
              <tr>
                <th scope="row">
                  {tx(
                    locale,
                    "Buitenring draait, normaal tot hoog",
                    "Outer ring rotates, normal to high",
                  )}
                </th>
                <td>N7</td>
                <td>{tx(locale, "vast", "fixed")}</td>
              </tr>
              <tr>
                <th scope="row">{tx(locale, "Gedeeld huis", "Split housing")}</th>
                <td>{tx(locale, "G of H, max. K", "G or H, max. K")}</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {tx(
            locale,
            "Bron: SKF-aanbevelingen lagerpassingen, via Duursma. js5 alleen tot en met 17 mm; Ø 20 mm licht is j6. Naslag, geen vervanging van de catalogus.",
            "Source: SKF bearing fit recommendations, via Duursma. js5 only up to and including 17 mm; Ø 20 mm light is j6. Reference only, not a substitute for the catalog.",
          )}
        </p>
      </section>
    </>
  );
}
