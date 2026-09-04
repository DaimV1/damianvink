import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { computeBearing } from "@/lib/toolkit/bearing";
import { readStoredDiameter, storeDiameter } from "@/lib/toolkit/tools";
import { mmFromUm } from "@/lib/utils";
import { tx, useLocale } from "@/lib/i18n/locale";
import {
  CalcEyebrow,
  CalcPanel,
  CopyLink,
  CopyResult,
  Field,
  Note,
  parseWholeMm,
  ResultGrid,
  SelectInput,
  WholeMmInput,
} from "./calc-ui";
import { BearingFitChart, SchemaPanel } from "./schema";

export function LagerCalc() {
  const { locale } = useLocale();
  const search = useSearch({ from: "/toolkit/lagerpassingen" });
  const navigate = useNavigate({ from: "/toolkit/lagerpassingen" });
  const [diameter, setDiameter] = useState(() =>
    search.d ?? readStoredDiameter({ min: 4, max: 50 }),
  );
  const [rot, setRot] = useState(search.rot ?? "binnen");
  const [load, setLoad] = useState(search.load ?? "normaal");
  const parsed = parseWholeMm(diameter);
  const d = parsed.status === "ok" ? parsed.mm : Number.NaN;
  const stil = rot === "stil";
  const result = parsed.status === "ok" ? computeBearing(d, rot, load) : null;

  useEffect(() => {
    navigate({
      search: (prev) => ({ ...prev, d: diameter || undefined, rot, load }),
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diameter, rot, load]);

  function onDia(v: string) {
    setDiameter(v);
    const next = parseWholeMm(v);
    if (next.status === "ok") storeDiameter(String(next.mm));
  }

  const copy = useMemo(() => {
    if (!result) return "";
    const shaftL = tx(locale, "As", "Shaft");
    const houseL = tx(locale, "Huis", "Housing");
    const bearingL = tx(locale, "Groefkogellager", "Deep-groove bearing");
    const altL = tx(locale, "(alternatief)", "(alternative)");
    return [
      `${bearingL} · ${shaftL.toLowerCase()} Ø ${d} mm · band ${tx(locale, result.band.label, result.band.labelEn)} mm`,
      `${shaftL} ${result.shaft}  ${mmFromUm(result.shaftDev.es)} / ${mmFromUm(result.shaftDev.ei)} mm`,
      `${houseL} ${result.hole}  ${mmFromUm(result.holeDev.ES)} / ${mmFromUm(result.holeDev.EI)} mm`,
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
            value: `${mmFromUm(result.shaftDev.es)} / ${mmFromUm(result.shaftDev.ei)} mm`,
          },
          {
            label: `${tx(locale, "Huis", "Housing")} ${result.hole}`,
            value: `${mmFromUm(result.holeDev.ES)} / ${mmFromUm(result.holeDev.EI)} mm`,
          },
          result.holeAltDev
            ? {
                label: `${tx(locale, "Huis", "Housing")} ${result.holeAlt} ${tx(locale, "(alternatief)", "(alternative)")}`,
                value: `${mmFromUm(result.holeAltDev.ES)} / ${mmFromUm(result.holeAltDev.EI)} mm`,
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
                value: `${mmFromUm(result.h6.es)} / ${mmFromUm(result.h6.ei)} mm`,
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
            "As-Ø in hele mm (4 t/m 50). Klassen volgens SKF; µm → mm volgens ISO 286-2.",
            "Shaft Ø in whole mm (4 through 50). Classes per SKF; µm → mm per ISO 286-2.",
          )}
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Field label={tx(locale, "As-Ø (mm)", "Shaft Ø (mm)")}>
            <WholeMmInput id="lager-diameter" value={diameter} onChange={onDia} />
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
            <Note>
              {tx(
                locale,
                "\"Normale tot hoge last\" dekt hier P > 0,05 C in één klasse. Bij zware of stotende last (SKF-vuistregel: P > ca. 0,1–0,15 C) vraagt SKF vaak een strakkere as-passing (m5/m6) dan hier getoond — check de actuele SKF-tabel. Ook niet in deze tool: de lagerboring zelf is getolereerd volgens ISO 492 (niet ISO 286), en cilindriciteit, opsluitvlak-rondloop en Ra van de as staan hier niet — die bepalen samen met de klasse de werkelijke passing.",
                "\"Normal to high load\" covers P > 0.05 C as one class here. For heavy or shock loads (SKF rule of thumb: P > roughly 0.1–0.15 C) SKF often calls for a tighter shaft fit (m5/m6) than shown — check the current SKF table. Also not covered: the bearing bore itself is toleranced per ISO 492 (not ISO 286), and shaft cylindricity, shoulder runout and Ra aren't shown — together with the class these set the actual interference.",
              )}
            </Note>
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
          </>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "Doorsnede", "Section")}
        </h2>
        <Note>
          {tx(
            locale,
            "Doorsnede van het lager in het huis. Links de pasvlak bij de as, rechts de pasvlak tussen buitenring en huis. Geen schaal.",
            "Cross-section of the bearing in the housing. Left: the fit at the shaft, right: the fit between the outer ring and the housing. Not to scale.",
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
              tx(locale, "Band >18 – ≤30 mm — vul een Ø in", "Band >18 – ≤30 mm — enter an Ø")
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
          {tx(locale, "Naslagtabel", "Reference table")}
        </h2>
        <Note>
          {tx(
            locale,
            "De volledige keuzeregel achter de rekenhulp, zodat die te controleren is zonder de widget te bedienen. Klassen volgens SKF; de µm-waarden per klasse staan op de passingen-pagina.",
            "The full selection rule behind the calculator, so it can be checked without operating the widget. Classes per SKF; the µm values per class are on the fits (passingen) page.",
          )}
        </Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{tx(locale, "Rotatie", "Rotation")}</th>
                <th>{tx(locale, "Last", "Load")}</th>
                <th>{tx(locale, "As", "Shaft")}</th>
                <th>{tx(locale, "Huis", "Housing")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className={rot === "binnen" && load === "licht" ? "is-active" : ""}>
                <th scope="row">{tx(locale, "Binnenring draait", "Inner ring rotates")}</th>
                <td>{tx(locale, "Licht, P ≤ 0,05 C", "Light, P ≤ 0.05 C")}</td>
                <td>js5 (≤17 mm) / j6 (&gt;17 mm)</td>
                <td>H7 / J7 {tx(locale, "(alt.)", "(alt.)")}</td>
              </tr>
              <tr className={rot === "binnen" && load === "normaal" ? "is-active" : ""}>
                <th scope="row">{tx(locale, "Binnenring draait", "Inner ring rotates")}</th>
                <td>{tx(locale, "Normaal–hoog, P > 0,05 C", "Normal–high, P > 0.05 C")}</td>
                <td>js5 (≤10 mm) / j5 (≤17 mm) / k5 (&gt;17 mm)</td>
                <td>H7 / K7 {tx(locale, "(alt.)", "(alt.)")}</td>
              </tr>
              <tr className={rot === "buiten" && load === "licht" ? "is-active" : ""}>
                <th scope="row">{tx(locale, "Buitenring draait", "Outer ring rotates")}</th>
                <td>{tx(locale, "Licht, P ≤ 0,05 C", "Light, P ≤ 0.05 C")}</td>
                <td>g6</td>
                <td>M7</td>
              </tr>
              <tr className={rot === "buiten" && load === "normaal" ? "is-active" : ""}>
                <th scope="row">{tx(locale, "Buitenring draait", "Outer ring rotates")}</th>
                <td>{tx(locale, "Normaal–hoog, P > 0,05 C", "Normal–high, P > 0.05 C")}</td>
                <td>g6</td>
                <td>N7</td>
              </tr>
              <tr className={rot === "stil" ? "is-active" : ""}>
                <th scope="row">{tx(locale, "Binnenring stil", "Inner ring stationary")}</th>
                <td>—</td>
                <td>g6 / h6 {tx(locale, "(geen verschuiving)", "(no shift needed)")}</td>
                <td>H7</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-8 text-sm leading-relaxed text-muted">
        {tx(locale, "Bron:", "Source:")}{" "}
        <a
          href="https://www.skf.com/us/products/rolling-bearings/principles-of-rolling-bearing-selection/bearing-selection-process/bearing-interfaces/seat-tolerances-for-standard-conditions"
          className="text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          SKF — seat tolerances for standard conditions
        </a>
        {tx(
          locale,
          ". js5 alleen tot en met 17 mm; Ø 20 mm licht is j6. Naslag, geen vervanging van de catalogus.",
          ". js5 only up to and including 17 mm; Ø 20 mm light is j6. Reference only, not a substitute for the catalog.",
        )}
      </p>
    </>
  );
}
