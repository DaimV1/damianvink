import { useMemo, useState } from "react";
import { KEYWAYS, lookupKeyway } from "@/lib/toolkit/keyway";
import { readStoredDiameter, storeDiameter } from "@/lib/toolkit/tools";
import { fmtMm } from "@/lib/utils";
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
} from "./calc-ui";
import { KeywaySection, SchemaPanel } from "./schema";

export function SpiebaanCalc() {
  const { locale } = useLocale();
  const [diameter, setDiameter] = useState(() =>
    readStoredDiameter({ min: 7, max: 110 }),
  );
  const parsed = parseWholeMm(diameter);
  const d = parsed.status === "ok" ? parsed.mm : Number.NaN;
  const row = parsed.status === "ok" ? lookupKeyway(d) : null;
  const activeLabel = row ? `boven ${row.over} t/m ${row.to}` : "";

  function onDia(v: string) {
    setDiameter(v);
    const next = parseWholeMm(v);
    if (next.status === "ok") storeDiameter(String(next.mm));
  }

  const copy = useMemo(() => {
    if (!row) return "";
    return [
      `As Ø ${d} mm · ${activeLabel}`,
      `Spie ${row.b} × ${row.h} mm`,
      `t₁ as  ${fmtMm(row.t1)} mm`,
      `t₂ naaf  ${fmtMm(row.t2)} mm`,
      `Dieptetol.  0 / +${fmtMm(row.depthTol)} mm`,
    ].join("\n");
  }, [activeLabel, d, row]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {tx(locale, "Spie bij as-Ø", "Key at shaft Ø")}
        </h2>
        <Note>
          As-Ø in hele mm. DIN 6885-1: boven de ondergrens tot en met de
          bovengrens. De eerste rij is boven 6 t/m 8 — Ø 6 mm valt erbuiten.
        </Note>
        <div className="mt-6 max-w-xs">
          <Field label={tx(locale, "As-Ø (mm)", "Shaft Ø (mm)")}>
            <NumInput id="spie-diameter" value={diameter} onChange={onDia} />
          </Field>
        </div>
        {parsed.status === "empty" ? (
          <p className="mt-5 text-sm text-muted">Vul een as-Ø in.</p>
        ) : parsed.status === "fraction" ? (
          <p className="mt-5 text-sm text-muted">
            Alleen hele millimeters. {diameter} mm valt niet in DIN 6885-1.
          </p>
        ) : !row ? (
          <p className="mt-5 text-sm text-muted">
            Geen rij in DIN 6885-1 voor Ø {d} mm. De tabel begint boven 6 mm tot
            en met 110 mm.
          </p>
        ) : (
          <>
            <p className="mt-5 text-sm text-muted">
              As Ø {d} mm · {activeLabel}
            </p>
            <ResultGrid
              items={[
                { label: "Spie b × h", value: `${row.b} × ${row.h} mm` },
                { label: "t₁ as", value: `${fmtMm(row.t1)} mm` },
                { label: "t₂ naaf", value: `${fmtMm(row.t2)} mm` },
                {
                  label: "Dieptetolerantie",
                  value: `0 / +${fmtMm(row.depthTol)} mm`,
                },
              ]}
            />
            <CopyResult text={copy} />
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
            "Dwarsdoorsnede: t₁ in de as, t₂ in de naaf, b × h de spie. Maatlijnen volgen de gekozen rij. Geen schaal.",
            "Cross-section: t₁ in the shaft, t₂ in the hub, b × h the key. Dimension lines follow the selected row. Not to scale.",
          )}
        </Note>
        <SchemaPanel caption={tx(locale, "Dwarsdoorsnede · DIN 6885-1 hoge vorm", "Cross-section · DIN 6885-1 high type")}>
          <KeywaySection row={row} />
        </SchemaPanel>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          Spie en groefdiepte (DIN 6885-1)
        </h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>As Ø d (mm)</th>
                <th>Spie b × h</th>
                <th>t₁ as</th>
                <th>t₂ naaf</th>
                <th>Tol. diepte</th>
              </tr>
            </thead>
            <tbody>
              {KEYWAYS.map((k) => {
                const label = `boven ${k.over} t/m ${k.to}`;
                return (
                  <tr key={label} className={label === activeLabel ? "is-active" : ""}>
                    <th scope="row">{label}</th>
                    <td>
                      {k.b} × {k.h}
                    </td>
                    <td>{fmtMm(k.t1)}</td>
                    <td>{fmtMm(k.t2)}</td>
                    <td>0 / +{fmtMm(k.depthTol)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          Breedtetolerantie b
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-lg border border-line bg-elevated p-4">
            <p className="flex items-center gap-2 font-medium text-ink">
              <KindDot kind="vast" /> P9 / P9 — vast
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Standaard. As en naaf beide P9. Spie zit strak; geschikt voor
              wisselende belasting.
            </p>
          </article>
          <article className="rounded-lg border border-line bg-elevated p-4">
            <p className="flex items-center gap-2 font-medium text-ink">
              <KindDot kind="overgang" /> N9 / JS9 — licht
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              As N9, naaf JS9. Makkelijker monteren. Alleen als de toepassing dat
              toelaat.
            </p>
          </article>
          <article className="rounded-lg border border-line bg-elevated p-4">
            <p className="flex items-center gap-2 font-medium text-ink">
              <KindDot kind="los" /> H9 / D10 — glijdend
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Werkplaats-/UNI-conventie voor verschuifbare naven. DIN 6885-1:2021
              noemt P9 sluitend en N9/JS9 vrij.
            </p>
          </article>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          Bron: DIN 6885-1 (hoge vorm). DIN 6885-2 is de lage vorm. H9/D10 is
          werkplaats-/UNI-conventie, niet de benoemde glijdpassing in DIN
          6885-1:2021. Controleer kritieke maten in de actuele norm.
        </p>
      </section>
    </>
  );
}
