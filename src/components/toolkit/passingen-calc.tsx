import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  BANDS,
  FITS,
  HOLE_FIELDS,
  SHAFT_FIELDS,
  bandIndex,
  clearanceRange,
  computeFit,
  fitExtendable,
  holeDeviationAt,
  holeExtendable,
  isExtendedBand,
  pairRange,
  shaftDeviationAt,
  shaftExtendable,
} from "@/lib/toolkit/iso286";
import { readStoredDiameter, storeDiameter } from "@/lib/toolkit/tools";
import { mmFromUm } from "@/lib/utils";
import { tx, useLocale } from "@/lib/i18n/locale";
import {
  CalcEyebrow,
  CalcPanel,
  CopyLink,
  CopyResult,
  Field,
  KindDot,
  Note,
  parseWholeMm,
  ResultGrid,
  SelectInput,
  WholeMmInput,
} from "./calc-ui";

export function PassingenCalc() {
  const { locale } = useLocale();
  const search = useSearch({ from: "/toolkit/passingen" });
  const navigate = useNavigate({ from: "/toolkit/passingen" });
  const [diameter, setDiameter] = useState(() =>
    search.d ?? readStoredDiameter({ min: 4, max: 3150 }),
  );
  const [fitId, setFitId] = useState(() =>
    search.fit && FITS.some((f) => f.id === search.fit) ? search.fit : "H7/h6",
  );

  useEffect(() => {
    navigate({
      search: (prev) => ({ ...prev, d: diameter || undefined, fit: fitId }),
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diameter, fitId]);

  function onDia(v: string) {
    setDiameter(v);
    const parsed = parseWholeMm(v);
    if (parsed.status === "ok") storeDiameter(String(parsed.mm));
  }

  const parsed = parseWholeMm(diameter);
  const d = parsed.status === "ok" ? parsed.mm : Number.NaN;
  const result = parsed.status === "ok" ? computeFit(d, fitId) : null;
  const activeBand = parsed.status === "ok" ? bandIndex(d) : -1;
  const activeBandExtended = activeBand >= 0 && isExtendedBand(activeBand);
  const fitOutOfBandRange =
    parsed.status === "ok" && activeBand >= 0 && activeBandExtended && !fitExtendable(fitId);

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
            "Nominale Ø in hele millimeters, boven 0 t/m 3150 mm (de volledige ISO 286-reeks). H/h, JS/js, G/g, F/f en D/d zijn berekend uit de ISO 286-1-formules en gelden over de hele reeks. c11, k6, n6, p6 en s6 hebben geen eenvoudige formule en blijven beperkt tot t/m 50 mm — zie hieronder. In de kleinste band (>0–≤3 mm) zijn alleen H6–H11, JS7, h6, h7 en p6 geverifieerd; de overige klassen tonen daar \"—\" (nog geen bron gecontroleerd) in plaats van een gok.",
            "Nominal Ø in whole millimeters, over 0 through 3150 mm (the full ISO 286 series). H/h, JS/js, G/g, F/f and D/d are computed from the ISO 286-1 formulas and apply across the whole series. c11, k6, n6, p6 and s6 have no simple formula and stay capped at 50 mm — see below. In the smallest band (>0–≤3 mm) only H6–H11, JS7, h6, h7 and p6 are verified; the other classes show \"—\" there (no source checked yet) rather than a guess.",
          )}
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={tx(locale, "Nominale Ø (mm)", "Nominal Ø (mm)")}>
            <WholeMmInput id="fit-diameter" value={diameter} onChange={onDia} />
          </Field>
          <Field label={tx(locale, "Passing", "Fit")}>
            <SelectInput value={fitId} onChange={setFitId}>
              {FITS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id}
                  {fitExtendable(f.id)
                    ? ""
                    : tx(locale, " (t/m 50 mm)", " (up to 50 mm)")}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        {parsed.status === "empty" ? (
          <p className="mt-5 text-sm text-muted">
            {tx(locale, "Vul een nominale Ø in.", "Enter a nominal Ø.")}
          </p>
        ) : fitOutOfBandRange ? (
          <p className="mt-5 text-sm text-muted">
            {tx(
              locale,
              `${fitId} heeft geen formule voor c, k, n, p of s en is alleen beschikbaar t/m 50 mm. Ø ${d} mm valt in band ${BANDS[activeBand].label} mm. Kies H7/h6, H7/g6, H8/f7 of H9/d9 voor de volledige reeks, of blijf onder 50 mm.`,
              `${fitId} has no formula for c, k, n, p or s and is only available up to 50 mm. Ø ${d} mm falls in band ${BANDS[activeBand].labelEn} mm. Choose H7/h6, H7/g6, H8/f7 or H9/d9 for the full series, or stay under 50 mm.`,
            )}
          </p>
        ) : !result ? (
          <p className="mt-5 text-sm text-muted">
            {tx(
              locale,
              `Geen ISO-band voor Ø ${d} mm, of ${fitId} heeft nog geen geverifieerde waarde in die band (zie de kleinste band hierboven). Tabellen: boven 0 t/m 3150 mm.`,
              `No ISO band for Ø ${d} mm, or ${fitId} has no verified value in that band yet (see the smallest band above). Tables: over 0 through 3150 mm.`,
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
                  label: (
                    <>
                      {tx(locale, "As", "Shaft")}{" "}
                      <span className="normal-case">{result.fit.shaft}</span>
                    </>
                  ),
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
            {activeBandExtended ? (
              <Note>
                {tx(
                  locale,
                  "Berekend uit de ISO 286-1-formules (boven 50 mm zijn dit geen tabelwaarden meer).",
                  "Computed from the ISO 286-1 formulas (above 50 mm these are no longer table values).",
                )}
              </Note>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
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
                    {fitExtendable(f.id) ? "" : " *"}
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
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {tx(locale, "Bron:", "Source:")}{" "}
          {tx(locale, "afgeleid van de gat- en astoleranties in tabel 2 en 3, zie ", "derived from the hole and shaft tolerances in tables 2 and 3, see ")}
          <a
            href="https://www.roymech.co.uk/Useful_Tables/ISO_Tolerances/ISO_286_2H.html"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            RoyMech ISO 286-2
          </a>
          . {tx(locale, "* alleen t/m 50 mm (geen formule voor c, k, n, p of s).", "* only up to 50 mm (no formula for c, k, n, p or s).")}
        </p>
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
                  <th key={k}>
                    {k}
                    {holeExtendable(k) ? "" : " *"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BANDS.map((band, i) => (
                <tr key={band.label} className={i === activeBand ? "is-active" : ""}>
                  <th scope="row">{tx(locale, band.label, band.labelEn)}</th>
                  {HOLE_FIELDS.map((k) => {
                    const dev = holeDeviationAt(k, i);
                    return <td key={k}>{dev ? pairRange(dev.ES, dev.EI) : "—"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {tx(locale, "Bron:", "Source:")} ISO 286-1 / ISO 286-2 ·{" "}
          <a
            href="https://www.roymech.co.uk/Useful_Tables/ISO_Tolerances/ISO_286_2H.html"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            RoyMech ISO 286-2 hole tolerances
          </a>
          . {tx(
            locale,
            "H6–H11, F8, G7 en JS7 zijn berekend uit de ISO 286-1-formules boven 50 mm. * K7 en N7 hebben geen formule en blijven t/m 50 mm. In de >0–≤3 mm-band tonen F8, G7, K7 en N7 \"—\": niet gegokt, nog niet tegen een primaire bron gecontroleerd (netwerktoegang tot naslagsites was tijdens deze fix geblokkeerd).",
            "H6–H11, F8, G7 and JS7 are computed from the ISO 286-1 formulas above 50 mm. * K7 and N7 have no formula and stay capped at 50 mm. In the >0–≤3 mm band, F8, G7, K7 and N7 show \"—\": not guessed, not yet checked against a primary source (network access to reference sites was blocked while making this fix).",
          )}
        </p>
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
                    {shaftExtendable(k) ? "" : " *"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BANDS.map((band, i) => (
                <tr key={band.label} className={i === activeBand ? "is-active" : ""}>
                  <th scope="row">{tx(locale, band.label, band.labelEn)}</th>
                  {SHAFT_FIELDS.map((k) => {
                    const dev = shaftDeviationAt(k, i);
                    return <td key={k}>{dev ? pairRange(dev.es, dev.ei) : "—"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {tx(locale, "Bron:", "Source:")} ISO 286-1 / ISO 286-2 (
          {tx(locale, "limietafwijkingen", "limit deviations")}) ·{" "}
          <a
            href="https://www.roymech.co.uk/Useful_Tables/ISO_Tolerances/ISO_286_2s.html"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            RoyMech ISO 286-2 shaft tolerances
          </a>
          .{" "}
          {tx(
            locale,
            "Waarden omgerekend van µm naar mm. Diameters: boven de ondergrens tot en met de bovengrens. JS7 is ±IT7/2 volgens ISO 286-2, zonder afronding naar hele µm. d9, f7, g6, h6 en h7 zijn berekend uit de ISO 286-1-formules boven 50 mm. * c11, k6, n6, p6 en s6 hebben geen formule en blijven t/m 50 mm. In de >0–≤3 mm-band zijn alleen h6, h7 en p6 geverifieerd (p6 afgeleid uit de al geverifieerde \"lijnpassing tot 18 mm\"-regel hierboven); c11, d9, f7, g6, k6, n6 en s6 tonen daar \"—\" — nog niet tegen een primaire bron gecontroleerd. Naslag, geen vervanging van de norm.",
            "Values converted from µm to mm. Diameters: over the lower bound up to and including the upper bound. JS7 is ±IT7/2 per ISO 286-2, without rounding to whole µm. d9, f7, g6, h6 and h7 are computed from the ISO 286-1 formulas above 50 mm. * c11, k6, n6, p6 and s6 have no formula and stay capped at 50 mm. In the >0–≤3 mm band only h6, h7 and p6 are verified (p6 derived from the already-verified \"line fit up to 18 mm\" rule above); c11, d9, f7, g6, k6, n6 and s6 show \"—\" there — not yet checked against a primary source. Reference only, not a substitute for the standard.",
          )}
        </p>
      </section>
    </>
  );
}
