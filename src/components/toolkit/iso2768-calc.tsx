import { useMemo, useState } from "react";
import {
  ANGULAR,
  ANGULAR_BANDS,
  FORM_CLASSES,
  LINEAR,
  LINEAR_BANDS,
  LINEAR_CLASSES,
  PERP,
  PERP_BANDS,
  RADII,
  RADII_BANDS,
  RUNOUT,
  STRAIGHT,
  STRAIGHT_BANDS,
  SYMM,
  fmtForm,
  fmtPlusMinus,
  lookupIso2768,
  parseLengthMm,
  type FormClass,
  type LinearClass,
} from "@/lib/toolkit/iso2768";
import { readStoredDiameter, storeDiameter } from "@/lib/toolkit/tools";
import {
  CalcPanel,
  CopyResult,
  Field,
  Note,
  NumInput,
  ResultGrid,
  SelectInput,
} from "./calc-ui";

const RODIN =
  "https://www.rodinmachining.nl/media/53qdjv2u/iso-2768-normblad-rodin-machining.pdf";
const HOEKMAN = "https://www.hoekman-rvs.nl/toleranties-cnc-kanten-iso-2768";

export function Iso2768Calc() {
  const [length, setLength] = useState(() => readStoredDiameter({ fallback: "20" }));
  const [linear, setLinear] = useState<LinearClass>("m");
  const [form, setForm] = useState<FormClass>("K");

  function onLen(v: string) {
    setLength(v);
    if (/^\d{1,4}$/.test(v.trim())) storeDiameter(v.trim());
  }

  const parsed = parseLengthMm(length);
  const L = parsed.status === "ok" ? parsed.mm : Number.NaN;
  const result = parsed.status === "ok" ? lookupIso2768(L, linear, form) : null;

  const copy = useMemo(() => {
    if (!result || !result.ok) return "";
    return [
      `${result.designation} · L ${fmtNl(L)} mm`,
      `Lineair  ${fmtPlusMinus(result.linear)} mm`,
      `Radii / afschuining  ${fmtPlusMinus(result.radii)} mm`,
      `Hoek (kortste zijde)  ${result.angular ? `±${result.angular}` : "—"}`,
      `Rechtheid / vlakheid  ${fmtForm(result.straightness)} mm`,
      `Haaksheid  ${fmtForm(result.perpendicularity)} mm`,
      `Symmetrie  ${fmtForm(result.symmetry)} mm`,
      `Circulaire uitloop  ${fmtForm(result.runout)} mm`,
    ].join("\n");
  }, [L, result]);

  return (
    <>
      <CalcPanel>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
          Rekenhulp
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          Maat zonder kader
        </h2>
        <Note>
          Nominale lengte in mm. Lineaire klasse f/m/c/v, vormklasse H/K/L.
          Standaard ISO 2768-mK. Onder 0,5 mm geen rij: zet de afwijking naast
          de maat. Lege cel: die combinatie staat niet in de tabel.
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Field label="Nominale lengte (mm)">
            <NumInput id="iso2768-length" value={length} onChange={onLen} />
          </Field>
          <Field label="Lineair (2768-1)">
            <SelectInput value={linear} onChange={(v) => setLinear(v as LinearClass)}>
              {LINEAR_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Vorm (2768-2)">
            <SelectInput value={form} onChange={(v) => setForm(v as FormClass)}>
              {FORM_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        {parsed.status === "empty" ? (
          <p className="mt-5 text-sm text-muted">Vul een nominale lengte in.</p>
        ) : parsed.status === "invalid" ? (
          <p className="mt-5 text-sm text-muted">
            Geen geldige lengte. Gebruik mm, met komma of punt.
          </p>
        ) : !result?.ok ? (
          <p className="mt-5 text-sm text-muted">
            Onder 0,5 mm heeft ISO 2768 geen rij. Zet de afwijking naast de
            maat.
          </p>
        ) : (
          <>
            <p className="mt-5 font-mono text-sm text-ink">{result.designation}</p>
            <ResultGrid
              items={[
                { label: "Lineair", value: `${fmtPlusMinus(result.linear)} mm` },
                {
                  label: "Radii / afschuining",
                  value: `${fmtPlusMinus(result.radii)} mm`,
                },
                {
                  label: "Hoek (kortste zijde)",
                  value: result.angular ? `±${result.angular}` : "—",
                },
                {
                  label: "Rechtheid / vlakheid",
                  value: `${fmtForm(result.straightness)} mm`,
                },
                {
                  label: "Haaksheid",
                  value: `${fmtForm(result.perpendicularity)} mm`,
                },
                {
                  label: "Symmetrie",
                  value: `${fmtForm(result.symmetry)} mm`,
                },
                {
                  label: "Circulaire uitloop",
                  value: `${fmtForm(result.runout)} mm`,
                },
              ]}
            />
            <CopyResult text={copy} />
          </>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          1. Lineaire afmetingen
        </h2>
        <Note>Toelaatbare afwijking ± mm. Boven de ondergrens t/m de bovengrens; 0,5 mm hoort bij de eerste rij.</Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>L (mm)</th>
                <th>f</th>
                <th>m</th>
                <th>c</th>
                <th>v</th>
              </tr>
            </thead>
            <tbody>
              {LINEAR_BANDS.map((band, i) => (
                <tr
                  key={band.label}
                  className={result?.ok && result.linearBand === i ? "is-active" : ""}
                >
                  <th scope="row">{band.label}</th>
                  {(["f", "m", "c", "v"] as LinearClass[]).map((k) => (
                    <td key={k}>{fmtPlusMinus(LINEAR[k][i])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          2. Radii en afschuiningen
        </h2>
        <Note>Buitenradius en afschuinhoogte, ± mm. f en m delen een kolom; c en v ook.</Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>L (mm)</th>
                <th>f / m</th>
                <th>c / v</th>
              </tr>
            </thead>
            <tbody>
              {RADII_BANDS.map((band, i) => (
                <tr
                  key={band.label}
                  className={result?.ok && result.radiiBand === i ? "is-active" : ""}
                >
                  <th scope="row">{band.label}</th>
                  <td>{fmtPlusMinus(RADII.f[i])}</td>
                  <td>{fmtPlusMinus(RADII.c[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          3. Hoekafmetingen
        </h2>
        <Note>Kortste zijde van de hoek, ±. Boven 400 mm blijft de laatste rij gelden.</Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Korte zijde (mm)</th>
                <th>f / m</th>
                <th>c</th>
                <th>v</th>
              </tr>
            </thead>
            <tbody>
              {ANGULAR_BANDS.map((band, i) => (
                <tr
                  key={band.label}
                  className={result?.ok && result.angularBand === i ? "is-active" : ""}
                >
                  <th scope="row">{band.label}</th>
                  <td>±{ANGULAR.f[i]}</td>
                  <td>±{ANGULAR.c[i]}</td>
                  <td>±{ANGULAR.v[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          4. Rechtheid en vlakheid (ISO 2768-2)
        </h2>
        <Note>Waarden in mm, zonder ±. Geen rij boven 3000 mm.</Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>L (mm)</th>
                <th>H</th>
                <th>K</th>
                <th>L</th>
              </tr>
            </thead>
            <tbody>
              {STRAIGHT_BANDS.map((band, i) => (
                <tr
                  key={band.label}
                  className={result?.ok && result.straightBand === i ? "is-active" : ""}
                >
                  <th scope="row">{band.label}</th>
                  <td>{fmtForm(STRAIGHT.H[i])}</td>
                  <td>{fmtForm(STRAIGHT.K[i])}</td>
                  <td>{fmtForm(STRAIGHT.L[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          5. Haaksheid
        </h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>L (mm)</th>
                <th>H</th>
                <th>K</th>
                <th>L</th>
              </tr>
            </thead>
            <tbody>
              {PERP_BANDS.map((band, i) => (
                <tr
                  key={band.label}
                  className={result?.ok && result.perpBand === i ? "is-active" : ""}
                >
                  <th scope="row">{band.label}</th>
                  <td>{fmtForm(PERP.H[i])}</td>
                  <td>{fmtForm(PERP.K[i])}</td>
                  <td>{fmtForm(PERP.L[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          6. Symmetrie
        </h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>L (mm)</th>
                <th>H</th>
                <th>K</th>
                <th>L</th>
              </tr>
            </thead>
            <tbody>
              {PERP_BANDS.map((band, i) => (
                <tr
                  key={band.label}
                  className={result?.ok && result.symmBand === i ? "is-active" : ""}
                >
                  <th scope="row">{band.label}</th>
                  <td>{fmtForm(SYMM.H[i])}</td>
                  <td>{fmtForm(SYMM.K[i])}</td>
                  <td>{fmtForm(SYMM.L[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          7. Circulaire uitloop
        </h2>
        <Note>Onafhankelijk van de nominale lengte.</Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th></th>
                <th>H</th>
                <th>K</th>
                <th>L</th>
              </tr>
            </thead>
            <tbody>
              <tr className={result?.ok ? "is-active" : ""}>
                <th scope="row">alle maten</th>
                <td>{fmtForm(RUNOUT.H)}</td>
                <td>{fmtForm(RUNOUT.K)}</td>
                <td>{fmtForm(RUNOUT.L)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          ISO 2768-2 (H/K/L) is in 2021 ingetrokken; opvolger is ISO 22081. De
          tabellen staan hier omdat tekeningen nog mK zetten. Dit is geen passing
          (ISO 286) en geen vervanging van een kader bij de maat. Bron:{" "}
          <a
            href={RODIN}
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Rodin, ISO 2768-normblad
          </a>{" "}
          en{" "}
          <a
            href={HOEKMAN}
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Hoekman (lineair)
          </a>
          . Naslag, geen vervanging van de norm.
        </p>
      </section>
    </>
  );
}

function fmtNl(n: number) {
  return n.toLocaleString("nl-NL", { maximumFractionDigits: 2 });
}
