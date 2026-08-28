import { useMemo, useState } from "react";
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
    return [
      `Groefkogellager · as Ø ${d} mm · band ${result.band.label} mm`,
      `As ${result.shaft}  ${mmFromUm(result.shaftDev.es[i])} / ${mmFromUm(result.shaftDev.ei[i])} mm`,
      `Huis ${result.hole}  ${mmFromUm(result.holeDev.ES[i])} / ${mmFromUm(result.holeDev.EI[i])} mm`,
      result.holeAlt ? `Huis ${result.holeAlt} (alternatief)` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [d, result]);

  const items: { label: string; value: string }[] =
    result
      ? ([
          {
            label: `As ${result.shaft}`,
            value: `${mmFromUm(result.shaftDev.es[result.i])} / ${mmFromUm(result.shaftDev.ei[result.i])} mm`,
          },
          {
            label: `Huis ${result.hole}`,
            value: `${mmFromUm(result.holeDev.ES[result.i])} / ${mmFromUm(result.holeDev.EI[result.i])} mm`,
          },
          result.holeAltDev
            ? {
                label: `Huis ${result.holeAlt} (alternatief)`,
                value: `${mmFromUm(result.holeAltDev.ES[result.i])} / ${mmFromUm(result.holeAltDev.EI[result.i])} mm`,
              }
            : null,
          stil
            ? {
                label: "As h6 (geen verschuiving nodig)",
                value: `${mmFromUm(result.h6.es[result.i])} / ${mmFromUm(result.h6.ei[result.i])} mm`,
              }
            : null,
        ].filter(Boolean) as { label: string; value: string }[])
      : [];

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {tx(locale, "Groefkogellager", "Deep-groove bearing")}
        </h2>
        <Note>
          As-Ø in hele mm (4 t/m 50). Lastkeuze valt weg bij stilstaande
          binnenring. Klassen volgens SKF; µm → mm volgens ISO 286-2.
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Field label={tx(locale, "As-Ø (mm)", "Shaft Ø (mm)")}>
            <NumInput id="lager-diameter" value={diameter} onChange={onDia} />
          </Field>
          <Field label={tx(locale, "Rotatie", "Rotation")}>
            <SelectInput value={rot} onChange={setRot}>
              <option value="binnen">Binnenring draait (as)</option>
              <option value="buiten">Buitenring draait (naaf)</option>
              <option value="stil">Binnenring stil</option>
            </SelectInput>
          </Field>
          <Field label={tx(locale, "Last", "Load")}>
            <SelectInput value={load} onChange={setLoad} disabled={stil}>
              <option value="licht">Licht, P ≤ 0,05 C</option>
              <option value="normaal">Normaal tot hoog, P {'>'} 0,05 C</option>
            </SelectInput>
          </Field>
        </div>
        {parsed.status === "empty" ? (
          <p className="mt-5 text-sm text-muted">Vul een as-Ø in.</p>
        ) : parsed.status === "fraction" ? (
          <p className="mt-5 text-sm text-muted">
            Alleen hele millimeters. {diameter} mm valt niet in de SKF-rijen tot 50 mm.
          </p>
        ) : !result ? (
          <p className="mt-5 text-sm text-muted">
            Geen SKF-rij voor Ø {d} mm. Rekenhulp: 4 t/m 50 mm.
          </p>
        ) : (
          <>
            <p className="mt-5 text-sm text-muted">
              As Ø {d} mm · band {result.band.label} mm · groefkogellager
            </p>
            <ResultGrid items={items} />
            <p className="mt-4 text-sm leading-relaxed text-muted">{result.note}</p>
            <CopyResult text={copy} />
          </>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          As — groefkogellager
        </h2>
        <Note>
          SKF, massieve stalen as, cilindrische boring. Alleen rijen tot 50 mm. P
          is de equivalente lagerbelasting, C het dynamische draaggetal.
        </Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Last</th>
                <th>As-Ø (mm)</th>
                <th>Klasse</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" rowSpan={2}>
                  Licht, P ≤ 0,05 C
                </th>
                <td>≤ 17</td>
                <td>js5</td>
              </tr>
              <tr>
                <td>(17) t/m 50</td>
                <td>j6</td>
              </tr>
              <tr>
                <th scope="row" rowSpan={3}>
                  Normaal tot hoog, P {'>'} 0,05 C
                </th>
                <td>≤ 10</td>
                <td>js5</td>
              </tr>
              <tr>
                <td>(10) t/m 17</td>
                <td>j5</td>
              </tr>
              <tr>
                <td>(17) t/m 50</td>
                <td>k5</td>
              </tr>
              <tr>
                <th scope="row">Binnenring stil, verschuiven gewenst</th>
                <td>alle Ø</td>
                <td>g6</td>
              </tr>
              <tr>
                <th scope="row">Binnenring stil, verschuiven niet nodig</th>
                <td>alle Ø</td>
                <td>h6</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          Huis — gietijzer / staal
        </h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Situatie</th>
                <th>Klasse</th>
                <th>Buitenring</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Stilstaande buitenring, algemeen</th>
                <td>H7</td>
                <td>verschuifbaar</td>
              </tr>
              <tr>
                <th scope="row">Licht tot normaal, schuiven gewenst</th>
                <td>J7</td>
                <td>meestal verschuifbaar</td>
              </tr>
              <tr>
                <th scope="row">Normaal tot hoog, schuiven niet nodig</th>
                <td>K7</td>
                <td>meestal vast</td>
              </tr>
              <tr>
                <th scope="row">Buitenring draait, licht (P ≤ 0,05 C)</th>
                <td>M7</td>
                <td>vast</td>
              </tr>
              <tr>
                <th scope="row">Buitenring draait, normaal tot hoog</th>
                <td>N7</td>
                <td>vast</td>
              </tr>
              <tr>
                <th scope="row">Gedeeld huis</th>
                <td>G of H, max. K</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          Bron: SKF-aanbevelingen lagerpassingen, via Duursma. js5 alleen tot en
          met 17 mm; Ø 20 mm licht is j6. Naslag, geen vervanging van de
          catalogus.
        </p>
      </section>
    </>
  );
}
