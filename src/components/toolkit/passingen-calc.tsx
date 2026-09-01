import { useMemo, useState } from "react";
import {
  BANDS,
  FITS,
  HOLE,
  HOLE_FIELDS,
  SHAFT,
  SHAFT_FIELDS,
  bandIndex,
  clearanceRange,
  computeFit,
  pairRange,
} from "@/lib/toolkit/iso286";
import { readStoredDiameter, storeDiameter } from "@/lib/toolkit/tools";
import { mmFromUm } from "@/lib/utils";
import { tx, useLocale } from "@/lib/i18n/locale";
import {
  CalcEyebrow,
  CalcPanel,
  CopyResult,
  Field,
  KindDot,
  Note,
  NumInput,
  parseWholeMm,
  ResultGrid,
  SelectInput,
} from "./calc-ui";

export function PassingenCalc() {
  const { locale } = useLocale();
  const [diameter, setDiameter] = useState(() =>
    readStoredDiameter({ min: 4, max: 50 }),
  );
  const [fitId, setFitId] = useState("H7/h6");

  function onDia(v: string) {
    setDiameter(v);
    const parsed = parseWholeMm(v);
    if (parsed.status === "ok") storeDiameter(String(parsed.mm));
  }

  const parsed = parseWholeMm(diameter);
  const d = parsed.status === "ok" ? parsed.mm : Number.NaN;
  const result = parsed.status === "ok" ? computeFit(d, fitId) : null;
  const activeBand = parsed.status === "ok" ? bandIndex(d) : -1;

  const copy = useMemo(() => {
    if (!result) return "";
    const holeL = tx(locale, "Gat", "Hole");
    const shaftL = tx(locale, "As", "Shaft");
    const clearanceL = tx(locale, "Speling", "Clearance");
    return [
      `Ø ${d} mm · ${result.fit.id} · band ${tx(locale, result.band.label, result.band.labelEn)} mm`,
      `${holeL} ${result.fit.hole}  ${mmFromUm(result.ES)} / ${mmFromUm(result.EI)} mm`,
      `${shaftL} ${result.fit.shaft}  ${mmFromUm(result.es)} / ${mmFromUm(result.ei)} mm`,
      `${clearanceL}  ${mmFromUm(result.minC)} … ${mmFromUm(result.maxC)} mm`,
    ].join("\n");
  }, [d, result, locale]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {tx(locale, "Nominale passing", "Nominal fit")}
        </h2>
        <Note>
          {tx(
            locale,
            "Nominale Ø in hele millimeters. Tabellen: boven 3 t/m 50 mm. Zelfde getallen als de naslag hieronder.",
            "Nominal Ø in whole millimeters. Tables: over 3 through 50 mm. Same figures as the reference below.",
          )}
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={tx(locale, "Nominale Ø (mm)", "Nominal Ø (mm)")}>
            <NumInput id="fit-diameter" value={diameter} onChange={onDia} />
          </Field>
          <Field label={tx(locale, "Passing", "Fit")}>
            <SelectInput value={fitId} onChange={setFitId}>
              {FITS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        {parsed.status === "empty" ? (
          <p className="mt-5 text-sm text-muted">
            {tx(locale, "Vul een nominale Ø in.", "Enter a nominal Ø.")}
          </p>
        ) : parsed.status === "fraction" ? (
          <p className="mt-5 text-sm text-muted">
            {tx(
              locale,
              `Alleen hele millimeters. ${diameter} mm valt niet in de tabel.`,
              `Whole millimeters only. ${diameter} mm is not in the table.`,
            )}
          </p>
        ) : !result ? (
          <p className="mt-5 text-sm text-muted">
            {tx(
              locale,
              `Geen ISO-band voor Ø ${d} mm. Tabellen: boven 3 t/m 50 mm (Ø 3 valt erbuiten).`,
              `No ISO band for Ø ${d} mm. Tables: over 3 through 50 mm (Ø 3 falls outside).`,
            )}
          </p>
        ) : (
          <>
            <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted">
              Ø {d} mm · {tx(locale, "band", "band")}{" "}
              {tx(locale, result.band.label, result.band.labelEn)} mm ·{" "}
              <KindDot kind={result.kind.kind} />
              <span className="text-ink">{tx(locale, result.kind.text, result.kind.textEn)}</span>
            </p>
            <ResultGrid
              items={[
                {
                  label: `${tx(locale, "Gat", "Hole")} ${result.fit.hole}`,
                  value: `${mmFromUm(result.ES)} / ${mmFromUm(result.EI)} mm`,
                },
                {
                  label: `${tx(locale, "As", "Shaft")} ${result.fit.shaft}`,
                  value: `${mmFromUm(result.es)} / ${mmFromUm(result.ei)} mm`,
                },
                {
                  label: tx(locale, "Speling min … max", "Clearance min … max"),
                  value: `${clearanceRange(result.minC, result.maxC)} mm`,
                },
              ]}
            />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {tx(locale, result.fit.use, result.fit.useEn)}
            </p>
            <CopyResult text={copy} />
          </>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "1. Voorkeurpassingen", "1. Preferred fits")}
        </h2>
        <Note>
          {tx(
            locale,
            "Minimum … maximum speling in mm. Negatief = overmaat. H7/p6 tot 18 mm: max. 0 µm (lijnpassing mogelijk).",
            "Minimum … maximum clearance in mm. Negative = interference. H7/p6 up to 18 mm: max. 0 µm (line fit possible).",
          )}
        </Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Ø (mm)</th>
                {FITS.map((f) => (
                  <th key={f.id} className="normal-case">
                    {f.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BANDS.map((band, i) => (
                <tr key={band.label} className={i === activeBand ? "is-active" : ""}>
                  <th scope="row">{tx(locale, band.label, band.labelEn)}</th>
                  {FITS.map((f) => {
                    const r = computeFit(band.to, f.id);
                    return (
                      <td key={f.id}>
                        {r ? clearanceRange(r.minC, r.maxC) : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "Wanneer welke passing", "When to use which fit")}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {FITS.map((f) => {
            const live = parsed.status === "ok" ? computeFit(d, f.id) : null;
            const kind = live?.kind.kind ?? f.kind;
            return (
              <article
                key={f.id}
                className="rounded-lg border border-line bg-elevated p-4"
              >
                <p className="flex items-center gap-2 font-mono text-sm text-ink">
                  <KindDot kind={kind} />
                  {f.id}
                  {live ? (
                    <span className="font-sans text-muted">
                      · {tx(locale, live.kind.text, live.kind.textEn)}
                    </span>
                  ) : null}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {tx(locale, f.use, f.useEn)}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "2. Gattoleranties", "2. Hole tolerances")}
        </h2>
        <Note>
          {tx(
            locale,
            "Bovenmaat / ondermaat t.o.v. nominaal, in mm. JS7 = ±IT7/2, niet afgerond.",
            "Upper / lower deviation relative to nominal, in mm. JS7 = ±IT7/2, not rounded.",
          )}
        </Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Ø (mm)</th>
                {HOLE_FIELDS.map((k) => (
                  <th key={k}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BANDS.map((band, i) => (
                <tr key={band.label} className={i === activeBand ? "is-active" : ""}>
                  <th scope="row">{tx(locale, band.label, band.labelEn)}</th>
                  {HOLE_FIELDS.map((k) => (
                    <td key={k}>{pairRange(HOLE[k].ES[i], HOLE[k].EI[i])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "3. Astoleranties", "3. Shaft tolerances")}
        </h2>
        <Note>
          {tx(
            locale,
            "Bovenmaat / ondermaat t.o.v. nominaal, in mm.",
            "Upper / lower deviation relative to nominal, in mm.",
          )}
        </Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Ø (mm)</th>
                {SHAFT_FIELDS.map((k) => (
                  <th key={k} className="normal-case">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BANDS.map((band, i) => (
                <tr key={band.label} className={i === activeBand ? "is-active" : ""}>
                  <th scope="row">{tx(locale, band.label, band.labelEn)}</th>
                  {SHAFT_FIELDS.map((k) => (
                    <td key={k}>{pairRange(SHAFT[k].es[i], SHAFT[k].ei[i])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {tx(
            locale,
            "Bron: ISO 286-1 / ISO 286-2 (limietafwijkingen). Waarden omgerekend van µm naar mm. Diameters: boven de ondergrens tot en met de bovengrens. JS7 is ±IT7/2 volgens ISO 286-2, zonder afronding naar hele µm. Naslag, geen vervanging van de norm.",
            "Source: ISO 286-1 / ISO 286-2 (limit deviations). Values converted from µm to mm. Diameters: over the lower bound up to and including the upper bound. JS7 is ±IT7/2 per ISO 286-2, without rounding to whole µm. Reference only, not a substitute for the standard.",
          )}
        </p>
      </section>
    </>
  );
}
