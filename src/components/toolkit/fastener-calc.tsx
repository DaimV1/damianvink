import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  FASTENERS,
  fmtForce,
  fmtNm,
  fmtPitch,
  lookupFastener,
  type FitSeries,
  type Strength,
} from "@/lib/toolkit/fastener";
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
  SourceBadge,
} from "./calc-ui";
import { BoltSection, SchemaPanel } from "./schema";

export function FastenerCalc() {
  const { locale } = useLocale();
  const search = useSearch({ from: "/toolkit/bevestigers" });
  const navigate = useNavigate({ from: "/toolkit/bevestigers" });
  const [size, setSize] = useState(search.size ?? "8");
  const [klass, setKlass] = useState<Strength>((search.klass as Strength) ?? "8.8");
  const [fit, setFit] = useState<FitSeries>((search.fit as FitSeries) ?? "middel");
  const d = parseInt(size, 10);

  useEffect(() => {
    navigate({ search: (prev) => ({ ...prev, size, klass, fit }), replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, klass, fit]);
  const row = lookupFastener(d);
  const hole = row?.hole[fit];
  const ma = row?.ma?.[klass];
  const fv = row?.fv?.[klass];

  const copy = useMemo(() => {
    if (!row || hole == null) return "";
    const lines = [
      `M${row.d} × ${fmtPitch(row.p)} · ${klass} · doorlaat ${fit}`,
      `Tappoor  ${fmtMm(row.tap)} mm`,
      `Doorlaat D  ${fmtMm(hole)} mm (ISO 273 ${fit})`,
      `SW zeskant  ${fmtMm(row.sw)} mm · k ${fmtMm(row.k)} mm`,
      `Inbus s  ${fmtMm(row.s)} mm · dk ${fmtMm(row.dk)} mm`,
    ];
    if (ma != null && fv != null) {
      lines.push(`Ma  ${fmtNm(ma)} Nm · Fv  ${fmtForce(fv)} N`);
    }
    return lines.join("\n");
  }, [fit, fv, hole, klass, ma, row]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {tx(locale, "Bout bij M-maat", "Bolt at M size")}
        </h2>
        <Note>
          {tx(
            locale,
            "Grove draad ISO 262. Doorlaat ISO 273. Moment en voorspanning: VDI 2230-1 tabel A1, μ = 0,14, 90 % van Rp0,2, droog. Geen vervanging van een VDI-berekening bij wisselende last.",
            "Coarse thread ISO 262. Clearance hole ISO 273. Torque and preload: VDI 2230-1 table A1, μ = 0.14, 90 % of Rp0.2, dry. Not a substitute for a VDI calculation under variable load.",
          )}
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Field label={tx(locale, "Draad", "Thread")}>
            <SelectInput value={size} onChange={setSize}>
              {FASTENERS.map((f) => (
                <option key={f.d} value={String(f.d)}>
                  M{f.d} × {fmtPitch(f.p)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={tx(locale, "Sterkteklasse", "Strength class")}>
            <SelectInput
              value={klass}
              onChange={(v) => setKlass(v as Strength)}
            >
              <option value="8.8">8.8</option>
              <option value="10.9">10.9</option>
              <option value="12.9">12.9</option>
            </SelectInput>
          </Field>
          <Field label={tx(locale, "Doorlaat", "Clearance hole")}>
            <SelectInput value={fit} onChange={(v) => setFit(v as FitSeries)}>
              <option value="fijn">{tx(locale, "Fijn", "Fine")}</option>
              <option value="middel">{tx(locale, "Middel", "Medium")}</option>
              <option value="grof">{tx(locale, "Grof", "Coarse")}</option>
            </SelectInput>
          </Field>
        </div>
        {row && hole != null ? (
          <>
            <p className="mt-5 text-sm text-muted">
              M{row.d} × {fmtPitch(row.p)} · {klass} · ISO 273{" "}
              {tx(locale, fit, fit === "fijn" ? "fine" : fit === "grof" ? "coarse" : "medium")}
            </p>
            <ResultGrid
              items={[
                { label: tx(locale, "Tappoorgat", "Tap drill"), value: `${fmtMm(row.tap)} mm` },
                { label: tx(locale, "Doorlaat D", "Clearance D"), value: `${fmtMm(hole)} mm` },
                {
                  label: tx(locale, "SW zeskant", "SW hex"),
                  value: `${fmtMm(row.sw)} mm · k ${fmtMm(row.k)}`,
                },
                {
                  label: tx(locale, "Inbus ISO 4762", "Socket head ISO 4762"),
                  value: `s ${fmtMm(row.s)} · dk ${fmtMm(row.dk)}`,
                },
                ma != null
                  ? { label: tx(locale, "Aandraaimoment Ma", "Tightening torque Ma"), value: `${fmtNm(ma)} Nm` }
                  : {
                      label: tx(locale, "Aandraaimoment Ma", "Tightening torque Ma"),
                      value: tx(locale, "geen rij vanaf M4", "no row from M4"),
                    },
                fv != null
                  ? { label: tx(locale, "Voorspanning Fv", "Preload Fv"), value: `${fmtForce(fv)} N` }
                  : { label: tx(locale, "Voorspanning Fv", "Preload Fv"), value: "—" },
              ]}
            />
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
          </>
        ) : (
          <p className="mt-5 text-sm text-muted">{tx(locale, "Kies een M-maat.", "Choose an M size.")}</p>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "Doorsnede", "Section")}
        </h2>
        <Note>
          {tx(
            locale,
            "Bout door twee platen. Maatlijnen: D doorlaat, d draad, k kophoogte, SW sleutelwijdte. Geen schaal.",
            "Bolt through two plates. Dimensions: D clearance, d thread, k head height, SW wrench size. Not to scale.",
          )}
        </Note>
        <SchemaPanel
          caption={tx(
            locale,
            "Lengtedoorsnede · zeskant ISO 4014",
            "Longitudinal section · hex ISO 4014",
          )}
        >
          <BoltSection row={row} hole={hole ?? null} />
        </SchemaPanel>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "Doorlaat en kop (ISO 273 / 4014 / 4762)", "Clearance and head (ISO 273 / 4014 / 4762)")}
        </h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>d</th>
                <th>P</th>
                <th>{tx(locale, "Tap", "Tap")}</th>
                <th>{tx(locale, "D fijn", "D fine")}</th>
                <th>{tx(locale, "D middel", "D medium")}</th>
                <th>{tx(locale, "D grof", "D coarse")}</th>
                <th>SW</th>
                <th>{tx(locale, "s inbus", "s socket")}</th>
              </tr>
            </thead>
            <tbody>
              {FASTENERS.map((f) => (
                <tr key={f.d} className={f.d === row?.d ? "is-active" : ""}>
                  <th scope="row">M{f.d}</th>
                  <td>{fmtPitch(f.p)}</td>
                  <td>{fmtMm(f.tap)}</td>
                  <td>{fmtMm(f.hole.fijn)}</td>
                  <td>{fmtMm(f.hole.middel)}</td>
                  <td>{fmtMm(f.hole.grof)}</td>
                  <td>{fmtMm(f.sw)}</td>
                  <td>{fmtMm(f.s)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {tx(locale, "Bron:", "Source:")} ISO 273, ISO 4014/4017, ISO 4762, ISO 262 ·{" "}
          <a
            href="https://www.engineersedge.com/iso_socket_head_screw.htm"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {tx(locale, "Engineers Edge — ISO 4762 maattabel", "Engineers Edge — ISO 4762 size table")}
          </a>
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "Aandraaimoment (VDI 2230-1 A1)", "Tightening torque (VDI 2230-1 A1)")}
        </h2>
        <Note>
          {tx(
            locale,
            "Grove draad, μ = 0,14, 90 % Rp0,2, droog. Fv in N, Ma in N·m.",
            "Coarse thread, μ = 0.14, 90 % Rp0.2, dry. Fv in N, Ma in N·m.",
          )}
        </Note>
        <SourceBadge>
          {tx(
            locale,
            "Bron: Würth's weergave van VDI 2230-1 tabel A1, niet de primaire norm zelf.",
            "Source: Würth's rendering of VDI 2230-1 table A1, not the primary standard.",
          )}
        </SourceBadge>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>d</th>
                <th>Ma 8.8</th>
                <th>Ma 10.9</th>
                <th>Ma 12.9</th>
                <th>Fv 8.8</th>
                <th>Fv 10.9</th>
                <th>Fv 12.9</th>
              </tr>
            </thead>
            <tbody>
              {FASTENERS.filter((f) => f.ma).map((f) => (
                <tr key={f.d} className={f.d === row?.d ? "is-active" : ""}>
                  <th scope="row">M{f.d}</th>
                  <td>{fmtNm(f.ma!["8.8"])}</td>
                  <td>{fmtNm(f.ma!["10.9"])}</td>
                  <td>{fmtNm(f.ma!["12.9"])}</td>
                  <td>{fmtForce(f.fv!["8.8"])}</td>
                  <td>{fmtForce(f.fv!["10.9"])}</td>
                  <td>{fmtForce(f.fv!["12.9"])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {tx(locale, "Bron:", "Source:")}{" "}
          {tx(
            locale,
            "ISO 273 (doorlaat), ISO 4014/4017 (zeskant SW, k), ISO 4762 (inbus s, dk), ISO 262 (spoed). Momenten: VDI 2230-1 tabel A1 via",
            "ISO 273 (clearance), ISO 4014/4017 (hex SW, k), ISO 4762 (socket s, dk), ISO 262 (pitch). Torques: VDI 2230-1 table A1 via",
          )}{" "}
          <a
            href="https://www.wurth.nl/nl/wuerth_nl/uw_branche/architecten_en_planners/din__en_normdelen/voorspan_en_aandraaimoment_3/voorspanaandraai.php"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Würth
          </a>
          {tx(
            locale,
            ". Gesmeerd (μ lager) geeft een lager toelaatbaar moment. M3 heeft geen A1-rij. Controleer kritieke verbindingen in VDI 2230.",
            ". Lubricated (lower μ) gives a lower permissible torque. M3 has no A1 row. Verify critical joints in VDI 2230.",
          )}
        </p>
      </section>
    </>
  );
}
