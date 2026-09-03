import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { KEYWAYS, lookupKeyway } from "@/lib/toolkit/keyway";
import { readStoredDiameter, storeDiameter } from "@/lib/toolkit/tools";
import { fmtMm } from "@/lib/utils";
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
  WholeMmInput,
} from "./calc-ui";
import { KeywaySection, SchemaPanel } from "./schema";

export function SpiebaanCalc() {
  const { locale } = useLocale();
  const search = useSearch({ from: "/toolkit/spiebaan-toleranties" });
  const navigate = useNavigate({ from: "/toolkit/spiebaan-toleranties" });
  const [diameter, setDiameter] = useState(() =>
    search.d ?? readStoredDiameter({ min: 7, max: 110 }),
  );

  useEffect(() => {
    navigate({ search: (prev) => ({ ...prev, d: diameter || undefined }), replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diameter]);
  const parsed = parseWholeMm(diameter);
  const d = parsed.status === "ok" ? parsed.mm : Number.NaN;
  const row = parsed.status === "ok" ? lookupKeyway(d) : null;
  const rangeLabel = (over: number, to: number) => `boven ${over} t/m ${to}`;
  const rangeLabelDisplay = (over: number, to: number) => `>${over} – ≤${to}`;
  const activeLabel = row ? rangeLabel(row.over, row.to) : "";

  function onDia(v: string) {
    setDiameter(v);
    const next = parseWholeMm(v);
    if (next.status === "ok") storeDiameter(String(next.mm));
  }

  const copy = useMemo(() => {
    if (!row) return "";
    const range = rangeLabelDisplay(row.over, row.to);
    return [
      `${tx(locale, "As", "Shaft")} Ø ${d} mm · ${range}`,
      `${tx(locale, "Spie", "Key")} ${row.b} × ${row.h} mm`,
      `t₁ ${tx(locale, "as", "shaft")}  ${fmtMm(row.t1)} mm`,
      `t₂ ${tx(locale, "naaf", "hub")}  ${fmtMm(row.t2)} mm`,
      `${tx(locale, "Dieptetol.", "Depth tol.")}  0 / +${fmtMm(row.depthTol)} mm`,
    ].join("\n");
  }, [d, row, locale]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {tx(locale, "Spie bij as-Ø", "Key at shaft Ø")}
        </h2>
        <Note>
          {tx(
            locale,
            "As-Ø in hele mm. DIN 6885-1: boven de ondergrens tot en met de bovengrens. De eerste rij is boven 6 t/m 8 — Ø 6 mm valt erbuiten.",
            "Shaft Ø in whole mm. DIN 6885-1: over the lower bound up to and including the upper bound. The first row is over 6 through 8 — Ø 6 mm falls outside.",
          )}
        </Note>
        <div className="mt-6 max-w-xs">
          <Field label={tx(locale, "As-Ø (mm)", "Shaft Ø (mm)")}>
            <WholeMmInput id="spie-diameter" value={diameter} onChange={onDia} />
          </Field>
        </div>
        {parsed.status === "empty" ? (
          <p className="mt-5 text-sm text-muted">
            {tx(locale, "Vul een as-Ø in.", "Enter a shaft Ø.")}
          </p>
        ) : !row ? (
          <p className="mt-5 text-sm text-muted">
            {tx(
              locale,
              `Geen rij in DIN 6885-1 voor Ø ${d} mm. De tabel begint boven 6 mm tot en met 110 mm.`,
              `No row in DIN 6885-1 for Ø ${d} mm. The table starts over 6 mm up to and including 110 mm.`,
            )}
          </p>
        ) : (
          <>
            <p className="mt-5 text-sm text-muted">
              {tx(locale, "As", "Shaft")} Ø {d} mm · {rangeLabelDisplay(row.over, row.to)}
            </p>
            <ResultGrid
              items={[
                { label: tx(locale, "Spie b × h", "Key b × h"), value: `${row.b} × ${row.h} mm` },
                { label: tx(locale, "t₁ as", "t₁ shaft"), value: `${fmtMm(row.t1)} mm` },
                { label: tx(locale, "t₂ naaf", "t₂ hub"), value: `${fmtMm(row.t2)} mm` },
                {
                  label: tx(locale, "Dieptetolerantie", "Depth tolerance"),
                  value: `0 / +${fmtMm(row.depthTol)} mm`,
                },
              ]}
            />
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
          {tx(locale, "Spie en groefdiepte (DIN 6885-1)", "Key and groove depth (DIN 6885-1)")}
        </h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{tx(locale, "As Ø d (mm)", "Shaft Ø d (mm)")}</th>
                <th>{tx(locale, "Spie b × h", "Key b × h")}</th>
                <th>{tx(locale, "t₁ as", "t₁ shaft")}</th>
                <th>{tx(locale, "t₂ naaf", "t₂ hub")}</th>
                <th>{tx(locale, "Tol. diepte", "Depth tol.")}</th>
              </tr>
            </thead>
            <tbody>
              {KEYWAYS.map((k) => {
                const key = rangeLabel(k.over, k.to);
                return (
                  <tr key={key} className={key === activeLabel ? "is-active" : ""}>
                    <th scope="row">{rangeLabelDisplay(k.over, k.to)}</th>
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
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {tx(locale, "Bron:", "Source:")}{" "}
          <a
            href="https://www.elesa-ganter.com/static/technicaldata/files/DIN6885_Keyways_EN.pdf"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Elesa+Ganter — DIN 6885 keyways
          </a>
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "Breedtetolerantie b", "Width tolerance b")}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-lg border border-line bg-elevated p-4">
            <p className="flex items-center gap-2 font-medium text-ink">
              <KindDot kind="vast" /> P9 / P9 — {tx(locale, "vast", "fixed")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {tx(
                locale,
                "Standaard. As en naaf beide P9. Spie zit strak; geschikt voor wisselende belasting.",
                "Standard. Shaft and hub both P9. Key sits tight; suitable for variable load.",
              )}
            </p>
          </article>
          <article className="rounded-lg border border-line bg-elevated p-4">
            <p className="flex items-center gap-2 font-medium text-ink">
              <KindDot kind="overgang" /> N9 / JS9 — {tx(locale, "licht", "light")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {tx(
                locale,
                "As N9, naaf JS9. Makkelijker monteren. Alleen als de toepassing dat toelaat.",
                "Shaft N9, hub JS9. Easier to assemble. Only if the application allows it.",
              )}
            </p>
          </article>
          <article className="rounded-lg border border-line bg-elevated p-4">
            <p className="flex items-center gap-2 font-medium text-ink">
              <KindDot kind="los" /> H9 / D10 — {tx(locale, "glijdend", "sliding")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {tx(
                locale,
                "Werkplaats-/UNI-conventie voor verschuifbare naven. DIN 6885-1:2021 noemt P9 sluitend en N9/JS9 vrij.",
                "Shop/UNI convention for slidable hubs. DIN 6885-1:2021 names P9 as close and N9/JS9 as free.",
              )}
            </p>
          </article>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {tx(locale, "Bron:", "Source:")}{" "}
          <a
            href="https://www.elesa-ganter.com/static/technicaldata/files/DIN6885_Keyways_EN.pdf"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Elesa+Ganter — DIN 6885 keyways
          </a>
          {tx(
            locale,
            " (hoge vorm). DIN 6885-2 is de lage vorm. H9/D10 is werkplaats-/UNI-conventie, niet de benoemde glijdpassing in DIN 6885-1:2021. Controleer kritieke maten in de actuele norm.",
            " (high type). DIN 6885-2 is the low type. H9/D10 is shop/UNI convention, not the named sliding fit in DIN 6885-1:2021. Verify critical dimensions in the current standard.",
          )}
        </p>
      </section>
    </>
  );
}
