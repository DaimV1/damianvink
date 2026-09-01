import { useMemo, useState } from "react";
import {
  D2_OPTIONS,
  GROOVE,
  ORING_LABELS,
  squeeze,
  type OringKind,
} from "@/lib/toolkit/oring";
import { fmtMm } from "@/lib/utils";
import { tx, useLocale } from "@/lib/i18n/locale";
import {
  CalcEyebrow,
  CalcPanel,
  CopyResult,
  Field,
  Note,
  ResultGrid,
  SelectInput,
} from "./calc-ui";
import { OringGroove, SchemaPanel } from "./schema";

export function OringCalc() {
  const { locale } = useLocale();
  const [d2, setD2] = useState("2.65");
  const [kind, setKind] = useState<OringKind>("radial");
  const d2n = parseFloat(d2);
  const g = GROOVE[kind][d2n as keyof (typeof GROOVE)[typeof kind]];

  const copy = useMemo(() => {
    if (!g) return "";
    return [
      `O-ring d2 ${fmtMm(d2n, 2)} mm · ${ORING_LABELS[kind]}`,
      `Groefdiepte t  ${fmtMm(g.t)} mm (+0,05)`,
      `Groefbreedte b  ${fmtMm(g.b)} mm (+0,25)`,
      `Samendrukking  ca. ${squeeze(d2n, g.t)} %`,
    ].join("\n");
  }, [d2n, g, kind]);

  const items = g
    ? [
        { label: "Groefdiepte t", value: `${fmtMm(g.t)} mm  +0,05` },
        { label: "Groefbreedte b", value: `${fmtMm(g.b)} mm  +0,25` },
        {
          label: "Nominale samendrukking",
          value: `ca. ${squeeze(d2n, g.t)} %`,
        },
        g.C != null ? { label: "Inloop C", value: `${fmtMm(g.C)} mm` } : null,
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
          ISO-koorden A–E. t +0,05 mm, b +0,25 mm (Dichtomatik). Samendrukking =
          (d₂ − t)/d₂: nominale compressie, geen plus-mintolerantie.
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={tx(locale, "Koord d₂", "Cord d₂")}>
            <SelectInput value={d2} onChange={setD2}>
              {D2_OPTIONS.map((opt) => (
                <option key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={tx(locale, "Inbouw", "Installation")}>
            <SelectInput value={kind} onChange={(v) => setKind(v as OringKind)}>
              <option value="radial">Radiaal, statisch</option>
              <option value="axial">Axiaal, statisch</option>
              <option value="hydro">Hydrauliek, dynamisch</option>
            </SelectInput>
          </Field>
        </div>
        {g ? (
          <>
            <p className="mt-5 text-sm text-muted">
              d₂ {fmtMm(d2n, 2)} mm · {ORING_LABELS[kind]}
            </p>
            <ResultGrid items={items} />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Dichtomatik; geen vervanging van ISO 3601-2.
            </p>
            <CopyResult text={copy} />
          </>
        ) : (
          <p className="mt-5 text-sm text-muted">Kies een ISO-koord.</p>
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
          Groefmaten
        </h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>d₂ (mm)</th>
                <th>Groep</th>
                <th>Radiaal statisch t / b</th>
                <th>Axiaal statisch t / b</th>
                <th>Hydrauliek t / b</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  [1.8, "A"],
                  [2.65, "B"],
                  [3.55, "C"],
                  [5.3, "D"],
                  [7, "E"],
                ] as const
              ).map(([dia, group]) => {
                const r = GROOVE.radial[dia];
                const a = GROOVE.axial[dia];
                const h = GROOVE.hydro[dia];
                return (
                  <tr key={dia} className={dia === d2n ? "is-active" : ""}>
                    <th scope="row">{fmtMm(dia, 2)}</th>
                    <td>{group}</td>
                    <td>
                      {fmtMm(r.t)} / {fmtMm(r.b)}
                    </td>
                    <td>
                      {fmtMm(a.t)} / {fmtMm(a.b)}
                    </td>
                    <td>
                      {fmtMm(h.t)} / {fmtMm(h.b)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          Bron: Dichtomatik O-ring brochure, static radial / axial / dynamic
          hydraulics. Trapezium, driehoek en vacuüm weggelaten.
        </p>
      </section>
    </>
  );
}
