import { useMemo, useState } from "react";
import {
  CATALOG,
  copyLine,
  cycleLiters,
  forcesAt,
  minPistonMm,
  seriesLabel,
  sizeCylinder,
  type StrokeDir,
} from "@/lib/toolkit/cylinder";
import { tx, useLocale } from "@/lib/i18n/locale";
import { fmtNl } from "@/lib/utils";
import {
  CalcEyebrow,
  CalcPanel,
  CopyResult,
  Field,
  Note,
  ResultGrid,
  SelectInput,
} from "./calc-ui";

const qtyClass =
  "h-12 w-full rounded-md border border-line-strong bg-paper px-3 font-mono text-base text-ink tabular-nums outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-2 focus:ring-accent/30";

function sanitizeQty(raw: string, intDigits: number) {
  let v = raw.replace(/[^\d.,]/g, "");
  const sep = v.search(/[.,]/);
  if (sep >= 0) {
    const mark = v[sep];
    v = v.slice(0, sep + 1) + v.slice(sep + 1).replace(/[.,]/g, "");
    const [head, tail = ""] = v.split(mark);
    return `${head.slice(0, intDigits)}${mark}${tail.slice(0, 2)}`;
  }
  return v.slice(0, intDigits);
}

function parseNum(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function QtyInput({
  value,
  onChange,
  id,
  intDigits = 6,
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
  intDigits?: number;
}) {
  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      spellCheck={false}
      value={value}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => onChange(sanitizeQty(e.target.value, intDigits))}
      className={qtyClass}
    />
  );
}

export function CylinderCalc() {
  const { locale } = useLocale();
  const [load, setLoad] = useState("1000");
  const [pBar, setPBar] = useState("6");
  const [S, setS] = useState("1,25");
  const [dir, setDir] = useState<StrokeDir>("uit");
  const [stroke, setStroke] = useState("100");

  const loadN = parseNum(load);
  const p = parseNum(pBar);
  const sFac = parseNum(S);
  const strokeMm = parseNum(stroke);

  const need = loadN != null && sFac != null ? loadN * sFac : null;
  const pick =
    loadN != null && p != null && sFac != null
      ? sizeCylinder({ loadN, pBar: p, S: sFac, dir })
      : null;
  const dMin = need != null && p != null ? minPistonMm(need, p) : null;
  const forces = pick && p != null ? forcesAt(pick, p) : null;
  const liters =
    pick && p != null && strokeMm != null ? cycleLiters(pick, p, strokeMm) : null;
  const rows = p != null && p > 0 ? CATALOG : [];

  const copy = useMemo(() => {
    if (!pick || !forces || loadN == null || p == null || sFac == null) return "";
    return copyLine({
      row: pick,
      pBar: p,
      loadN,
      S: sFac,
      dir,
      F_uit: forces.F_uit,
      F_in: forces.F_in,
    });
  }, [dir, forces, loadN, p, pick, sFac]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {tx(locale, "Boring bij last en druk", "Bore from load and pressure")}
        </h2>
        <Note>
          {tx(
            locale,
            "F = p·A, manometerdruk. Dubbelwerkend. Theoretisch, zonder wrijving. Stangdiameter is de ISO-basisstang, geen vergroting.",
            "F = p·A, gauge pressure. Double acting. Theoretical, no friction. Rod diameter is the ISO basic rod, not oversized.",
          )}
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={tx(locale, "Last F (N)", "Load F (N)")}>
            <QtyInput id="cyl-load" value={load} onChange={setLoad} />
          </Field>
          <Field label={tx(locale, "Druk p (bar)", "Pressure p (bar)")}>
            <QtyInput id="cyl-p" value={pBar} onChange={setPBar} intDigits={2} />
          </Field>
          <Field label={tx(locale, "Lastfactor S", "Load factor S")}>
            <QtyInput id="cyl-s" value={S} onChange={setS} intDigits={2} />
          </Field>
          <Field label={tx(locale, "Richting", "Direction")}>
            <SelectInput value={dir} onChange={(v) => setDir(v as StrokeDir)}>
              <option value="uit">{tx(locale, "Uitgaan (zuiger)", "Extend (piston)")}</option>
              <option value="in">{tx(locale, "Binnenhalen (stangzijde)", "Retract (rod side)")}</option>
            </SelectInput>
          </Field>
          <Field label={tx(locale, "Slag (mm)", "Stroke (mm)")}>
            <QtyInput id="cyl-stroke" value={stroke} onChange={setStroke} intDigits={4} />
          </Field>
        </div>

        {pick && forces && need != null && dMin != null && p != null ? (
          <>
            <p className="mt-5 text-sm text-muted">
              {tx(
                locale,
                `${seriesLabel(pick.series)} Ø${pick.bore}/${pick.rod} dekt ${fmtNl(need, 0)} N (${fmtNl(loadN ?? 0, 0)} × ${String(sFac).replace(".", ",")}). Ondergrens zuiger ${fmtNl(dMin, 1)} mm.`,
                `${seriesLabel(pick.series)} Ø${pick.bore}/${pick.rod} covers ${fmtNl(need, 0)} N (${fmtNl(loadN ?? 0, 0)} × ${String(sFac).replace(".", ",")}). Minimum piston ${fmtNl(dMin, 1)} mm.`,
              )}
            </p>
            <ResultGrid
              items={[
                { label: tx(locale, "Boring / stang", "Bore / rod"), value: `Ø${pick.bore} / ${pick.rod} mm` },
                { label: tx(locale, "Norm", "Standard"), value: seriesLabel(pick.series) },
                { label: "F_uit", value: `${fmtNl(forces.F_uit, 0)} N` },
                { label: "F_in", value: `${fmtNl(forces.F_in, 0)} N` },
                {
                  label: tx(locale, "Lucht / cyclus", "Air / cycle"),
                  value: liters != null ? `${fmtNl(liters, 2)} NL` : "—",
                },
              ]}
            />
            <CopyResult text={copy} />
          </>
        ) : loadN != null && p != null && sFac != null && p > 0 && loadN > 0 ? (
          <p className="mt-5 text-sm text-muted">
            {tx(
              locale,
              `Geen ISO-boring dekt ${fmtNl(need ?? 0, 0)} N bij ${fmtNl(p, 1)} bar (max Ø320). Open de catalogus.`,
              `No ISO bore covers ${fmtNl(need ?? 0, 0)} N at ${fmtNl(p, 1)} bar (max Ø320). Open the catalogue.`,
            )}
          </p>
        ) : (
          <p className="mt-5 text-sm text-muted">{tx(locale, "Vul last, druk en lastfactor in.", "Enter load, pressure and load factor.")}</p>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(
            locale,
            `Theoretische kracht bij ${p != null && p > 0 ? `${fmtNl(p, 1)} bar` : "druk"}`,
            `Theoretical force at ${p != null && p > 0 ? `${fmtNl(p, 1)} bar` : "pressure"}`,
          )}
        </h2>
        <Note>
          {tx(
            locale,
            "F_uit = p·A_zuiger, F_in = p·A_ring. Geen wrijving. Stang = ISO-basis. Actieve rij is de gekozen boring.",
            "F_extend = p·A_piston, F_retract = p·A_annulus. No friction. Rod = ISO basic. Active row is the selected bore.",
          )}
        </Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Ø</th>
                <th>{tx(locale, "Stang", "Rod")}</th>
                <th>{tx(locale, "Norm", "Standard")}</th>
                <th>F_uit</th>
                <th>F_in</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const f = p != null ? forcesAt(row, p) : null;
                return (
                  <tr
                    key={`${row.series}-${row.bore}`}
                    className={pick?.bore === row.bore ? "is-active" : ""}
                  >
                    <th scope="row">{row.bore}</th>
                    <td>{row.rod}</td>
                    <td>{seriesLabel(row.series)}</td>
                    <td>{f ? fmtNl(f.F_uit, 0) : "—"}</td>
                    <td>{f ? fmtNl(f.F_in, 0) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {tx(locale, "Bron:", "Source:")}{" "}
          <a
            href="https://www.iso.org/standard/66921.html"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            ISO 15552
          </a>{" "}
          (Ø 32–320 mm) ·{" "}
          <a
            href="https://www.iso.org/standard/64054.html"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            ISO 6432
          </a>{" "}
          (Ø 8–25 mm).
        </p>
      </section>
    </>
  );
}
