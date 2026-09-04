import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  D2_OPTIONS,
  fillRatio,
  GROOVE,
  ORING_LABELS,
  ORING_LABELS_EN,
  squeeze,
  type OringKind,
} from "@/lib/toolkit/oring";
import { fmtMm } from "@/lib/utils";
import { tx, useLocale } from "@/lib/i18n/locale";
import {
  CalcEyebrow,
  CalcPanel,
  CopyLink,
  CopyResult,
  Field,
  Note,
  ResultGrid,
  SelectInput,
} from "./calc-ui";
import { OringGroove, SchemaPanel } from "./schema";

export function OringCalc() {
  const { locale } = useLocale();
  const search = useSearch({ from: "/toolkit/o-ringgroef" });
  const navigate = useNavigate({ from: "/toolkit/o-ringgroef" });
  const [d2, setD2] = useState(search.d2 ?? "2.65");
  const [kind, setKind] = useState<OringKind>((search.kind as OringKind) ?? "radial");
  const d2n = parseFloat(d2);

  useEffect(() => {
    navigate({ search: (prev) => ({ ...prev, d2, kind }), replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d2, kind]);
  const g = GROOVE[kind][d2n as keyof (typeof GROOVE)[typeof kind]];
  const kindLabel = tx(locale, ORING_LABELS[kind], ORING_LABELS_EN[kind]);

  const copy = useMemo(() => {
    if (!g) return "";
    return [
      `O-ring d2 ${fmtMm(d2n, 2)} mm · ${kindLabel}`,
      `${tx(locale, "Groefdiepte t", "Groove depth t")}  ${fmtMm(g.t)} mm (+0,05)`,
      `${tx(locale, "Groefbreedte b", "Groove width b")}  ${fmtMm(g.b)} mm (+0,25)`,
      `${tx(locale, "Samendrukking", "Compression")}  ca. ${squeeze(d2n, g.t)} %`,
      `${tx(locale, "Vulgraad", "Fill ratio")}  ca. ${fillRatio(d2n, g.t, g.b)} %`,
    ].join("\n");
  }, [d2n, g, kindLabel, locale]);

  const items = g
    ? [
        { label: tx(locale, "Groefdiepte t", "Groove depth t"), value: `${fmtMm(g.t)} mm  +0,05` },
        { label: tx(locale, "Groefbreedte b", "Groove width b"), value: `${fmtMm(g.b)} mm  +0,25` },
        {
          label: tx(locale, "Nominale samendrukking", "Nominal compression"),
          value: `ca. ${squeeze(d2n, g.t)} %`,
        },
        {
          label: tx(locale, "Vulgraad (nominaal)", "Fill ratio (nominal)"),
          value: `ca. ${fillRatio(d2n, g.t, g.b)} %`,
        },
        g.C != null
          ? { label: tx(locale, "Inloop C", "Lead-in C"), value: `${fmtMm(g.C)} mm` }
          : null,
      ].filter(Boolean) as { label: string; value: string }[]
    : [];

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {tx(locale, "Groef bij koord", "Groove at cord")}
        </h2>
        <Note>
          {tx(
            locale,
            "ISO-koorden A–E. t +0,05 mm, b +0,25 mm (Dichtomatik). Samendrukking = (d₂ − t)/d₂: nominale compressie, geen plus-mintolerantie. Vulgraad = doorsnede-oppervlak ring t.o.v. groefoppervlak (b × t); richtwaarde 75–90%, met ruimte voor thermische uitzetting.",
            "ISO cords A–E. t +0.05 mm, b +0.25 mm (Dichtomatik). Compression = (d₂ − t)/d₂: nominal compression, not a plus/minus tolerance. Fill ratio = ring cross-section area vs. groove area (b × t); target 75–90%, leaving room for thermal expansion.",
          )}
        </Note>
        <Note>
          {tx(
            locale,
            "Radiale rek van het koord over de groefdiameter: max. ca. 5% bij montage. Deze tool rekent niet vanaf een boring-/as-diameter — controleer zelf. Extrusiespleet en back-up ring bij hoge druk of dynamische toepassingen: niet in deze tool.",
            "Radial stretch of the cord over the groove diameter: max. ca. 5% at assembly. This tool does not work from a bore/shaft diameter — check separately. Extrusion gap and back-up ring for high pressure or dynamic use: not covered here.",
          )}
        </Note>
        <Note>
          {tx(
            locale,
            "Vlakheid/Ra van de afdichtvlakken staat hier niet in — algemene richtwaarde (niet uit deze tabel geverifieerd): Ra ≤ 1,6 µm statisch, Ra ≤ 0,4 µm dynamisch, met een lichte afrondstraal op de groefranden om het koord niet te snijden bij montage. Controleer tegen ISO 3601-2 voor een normwaarde.",
            "Sealing-surface flatness/Ra isn't covered here — general guidance (not verified against this table): Ra ≤ 1.6 µm static, Ra ≤ 0.4 µm dynamic, with a light break on the groove edges so the cord isn't cut during assembly. Check ISO 3601-2 for a normative value.",
          )}
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={tx(locale, "Koord d₂", "Cord d₂")}>
            <SelectInput value={d2} onChange={setD2}>
              {D2_OPTIONS.map((opt) => (
                <option key={opt.value} value={String(opt.value)}>
                  {tx(locale, opt.label, opt.labelEn)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={tx(locale, "Inbouw", "Installation")}>
            <SelectInput value={kind} onChange={(v) => setKind(v as OringKind)}>
              <option value="radial">{tx(locale, "Radiaal, statisch", "Radial, static")}</option>
              <option value="axial">{tx(locale, "Axiaal, statisch", "Axial, static")}</option>
              <option value="hydro">{tx(locale, "Hydrauliek, dynamisch", "Hydraulic, dynamic")}</option>
            </SelectInput>
          </Field>
        </div>
        {g ? (
          <>
            <p className="mt-5 text-sm text-muted">
              d₂ {fmtMm(d2n, 2)} mm · {kindLabel}
            </p>
            <ResultGrid items={items} />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {tx(locale, "Dichtomatik; geen vervanging van ISO 3601-2.", "Dichtomatik; not a substitute for ISO 3601-2.")}
            </p>
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
          </>
        ) : (
          <p className="mt-5 text-sm text-muted">
            {tx(locale, "Kies een ISO-koord.", "Choose an ISO cord.")}
          </p>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "Doorsnede", "Section")}
        </h2>
        <Note>
          {tx(
            locale,
            "Radiaal en hydrauliek: groef in de as, afdichting tegen de boring. Axiaal: groef in de flens, geklemd tussen twee vlakke platen. Maatlijnen volgen de gekozen rij. Geen schaal.",
            "Radial and hydraulic: groove in the shaft, sealing against the bore. Axial: groove in the flange, clamped between two flat faces. Dimension lines follow the selected row. Not to scale.",
          )}
        </Note>
        <SchemaPanel
          caption={tx(
            locale,
            "Dwarsdoorsnede · ISO 3601",
            "Cross-section · ISO 3601",
          )}
        >
          <OringGroove kind={kind} t={g?.t} b={g?.b} />
        </SchemaPanel>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "Naslagtabel", "Reference table")}
        </h2>
        <Note>
          {tx(
            locale,
            "Alle vijf koorden en alle drie inbouwtypes, zodat de volledige groeftabel te controleren is zonder de rekenhulp te bedienen.",
            "All five cords and all three installation types, so the full groove table can be checked without operating the calculator.",
          )}
        </Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>d₂</th>
                <th>{tx(locale, "Inbouw", "Installation")}</th>
                <th>t</th>
                <th>b</th>
                <th>C</th>
              </tr>
            </thead>
            <tbody>
              {D2_OPTIONS.flatMap((opt) =>
                (Object.keys(ORING_LABELS) as OringKind[]).map((k) => {
                  const row = GROOVE[k][opt.value as keyof (typeof GROOVE)[typeof k]];
                  const active = opt.value === d2n && k === kind;
                  return (
                    <tr key={`${opt.value}-${k}`} className={active ? "is-active" : ""}>
                      <th scope="row">{tx(locale, opt.label, opt.labelEn)}</th>
                      <td>{tx(locale, ORING_LABELS[k], ORING_LABELS_EN[k])}</td>
                      <td>{fmtMm(row.t)}</td>
                      <td>{fmtMm(row.b)}</td>
                      <td>{row.C != null ? fmtMm(row.C) : "—"}</td>
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-8 text-sm leading-relaxed text-muted">
        {tx(locale, "Bron:", "Source:")}{" "}
        {tx(
          locale,
          "Dichtomatik O-ring brochure, static radial / axial / dynamic hydraulics. Trapezium, driehoek en vacuüm weggelaten.",
          "Dichtomatik O-ring brochure, static radial / axial / dynamic hydraulics. Trapezoidal, triangular and vacuum grooves omitted.",
        )}
      </p>
    </>
  );
}
