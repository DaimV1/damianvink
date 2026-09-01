import { Fragment, useMemo, useState } from "react";
import {
  BL_T_SCHERP,
  KANTEN_SOURCE,
  KINDS,
  MATERIALS,
  RI_T_HAAKS,
  RI_T_SCHERP,
  THICKNESSES,
  copyLine,
  dashMm,
  lookupKanten,
  type Kind,
  type Material,
} from "@/lib/toolkit/kanten";
import { tx, useLocale, type Locale } from "@/lib/i18n/locale";
import {
  CalcEyebrow,
  CalcPanel,
  CopyResult,
  Field,
  Note,
  ResultGrid,
  SelectInput,
} from "./calc-ui";
import { BendSection, SchemaPanel } from "./schema";

export function KantenCalc() {
  const { locale } = useLocale();
  const [tRaw, setTRaw] = useState("2");
  const [material, setMaterial] = useState<Material>("rvs");
  const [kind, setKind] = useState<Kind>("haaks");
  const t = Number(tRaw);
  const row = Number.isFinite(t) ? lookupKanten(t, material, kind) : null;
  const copy = useMemo(() => (row ? copyLine(row) : ""), [row]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {tx(locale, "Kantlijn", "Bend line")}
        </h2>
        <Note>
          {tx(
            locale,
            "Shop-spec van 247TailorSteel Sophia, geen ISO of DIN. Discrete diktes; een lege cel is geen buurrij. Changelog bron: 11-03-2026.",
            "Shop spec from 247TailorSteel Sophia, not ISO or DIN. Discrete thicknesses; an empty cell is not a neighboring row. Changelog source: 11-03-2026.",
          )}
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Field label={tx(locale, "Dikte (mm)", "Thickness (mm)")}>
            <SelectInput value={tRaw} onChange={setTRaw}>
              {THICKNESSES.map((d) => (
                <option key={d} value={String(d)}>
                  {dashMm(d)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={tx(locale, "Materiaal", "Material")}>
            <SelectInput
              value={material}
              onChange={(v) => setMaterial(v as Material)}
            >
              {MATERIALS.map((m) => (
                <option key={m.id} value={m.id}>
                  {tx(locale, m.label, m.labelEn)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={tx(locale, "Kant", "Bend")}>
            <SelectInput value={kind} onChange={(v) => setKind(v as Kind)}>
              {KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {tx(locale, k.label, k.labelEn)}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
        {row ? (
          <>
            <ResultGrid
              items={[
                {
                  label: tx(locale, "Ri (inwendig)", "Ri (internal)"),
                  value: `${dashMm(row.ri)} mm`,
                },
                {
                  label: tx(locale, "s min. beenlengte", "s min. leg length"),
                  value: `${dashMm(row.s)} mm`,
                },
                {
                  label: tx(locale, "w groefwijdte", "w die opening"),
                  value: `${dashMm(row.w)} mm`,
                },
                {
                  label: tx(locale, "x (Z-buiging)", "x (Z-bend)"),
                  value: `${dashMm(row.x)} mm`,
                },
              ]}
            />
            {row.thickPlate ? (
              <Note>
                {tx(
                  locale,
                  "10 en 12 mm: niet over de volle plaatlengte. Check de actuele 247-pagina.",
                  "10 and 12 mm: not over the full plate length. Check the current 247 page.",
                )}
              </Note>
            ) : null}
            <CopyResult text={copy} />
          </>
        ) : (
          <p className="mt-5 text-sm text-muted">
            {tx(
              locale,
              "Deze dikte staat niet in de 247-tabellen voor deze combinatie. Geen naburige rij gebruiken.",
              "This thickness is not in the 247 tables for this combination. Do not use a neighboring row.",
            )}
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
            "Kant in de matrijs: w is de groefwijdte (opening bovenkant matrijs), s de minimale beenlengte, Ri de inwendige radius bij de knik. Maatlijnen volgen de gekozen rij. Geen schaal.",
            "Bend in the die: w is the die opening width, s the minimum leg length, Ri the inner radius at the bend. Dimension lines follow the selected row. Not to scale.",
          )}
        </Note>
        <SchemaPanel
          caption={tx(
            locale,
            kind === "haaks" ? "Dwarsdoorsnede · haaks (90°)" : "Dwarsdoorsnede · scherp",
            kind === "haaks" ? "Cross-section · right angle (90°)" : "Cross-section · sharp",
          )}
        >
          <BendSection
            kind={kind}
            ri={row?.ri ?? null}
            s={row?.s ?? null}
            w={row?.w ?? null}
            t={Number.isFinite(t) ? t : null}
          />
        </SchemaPanel>
      </section>

      <p className="mt-8 text-sm leading-relaxed text-muted">
        {tx(locale, "Bron:", "Source:")}{" "}
        <a
          href={KANTEN_SOURCE}
          className="text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {tx(
            locale,
            "247TailorSteel — richtlijnen voor kanten",
            "247TailorSteel — bending guidelines",
          )}
        </a>
        {tx(
          locale,
          ". Shop-spec Sophia, geen ISO/DIN. Geen commerciële band; altijd hun pagina nalopen (changelog 11-03-2026). Botsingcontrole, damwandfoto’s en de A–F-tolerantiegrid staan daar, niet hier.",
          ". Shop spec Sophia, not ISO/DIN. No commercial affiliation; always check their page (changelog 11-03-2026). Collision checks, tooling photos and the A–F tolerance grid live there, not here.",
        )}
      </p>

      <RiTable
        title={tx(locale, "Inwendige radius Ri — haaks", "Internal radius Ri — right angle")}
        kind="haaks"
        thicknesses={RI_T_HAAKS}
        active={kind === "haaks" ? t : null}
        material={material}
        showHoogsterkte
        locale={locale}
      />
      <RiTable
        title={tx(locale, "Inwendige radius Ri — scherp", "Internal radius Ri — sharp")}
        kind="scherp"
        thicknesses={RI_T_SCHERP}
        active={kind === "scherp" ? t : null}
        material={material}
        showHoogsterkte={false}
        locale={locale}
      />
      <GroupTable
        title={tx(locale, "Minimale beenlengte — haaks", "Minimum leg length — right angle")}
        kind="haaks"
        thicknesses={THICKNESSES}
        active={kind === "haaks" ? t : null}
        material={material}
        mode="ws"
        locale={locale}
      />
      <GroupTable
        title={tx(locale, "Minimale beenlengte — scherp", "Minimum leg length — sharp")}
        kind="scherp"
        thicknesses={BL_T_SCHERP}
        active={kind === "scherp" ? t : null}
        material={material}
        mode="ws"
        locale={locale}
      />
      <GroupTable
        title={tx(locale, "Z-buiging — haaks", "Z-bend — right angle")}
        kind="haaks"
        thicknesses={THICKNESSES}
        active={kind === "haaks" ? t : null}
        material={material}
        mode="zx"
        locale={locale}
      />
      <GroupTable
        title={tx(locale, "Z-buiging — scherp", "Z-bend — sharp")}
        kind="scherp"
        thicknesses={BL_T_SCHERP}
        active={kind === "scherp" ? t : null}
        material={material}
        mode="zx"
        locale={locale}
      />
    </>
  );
}

function RiTable({
  title,
  kind,
  thicknesses,
  active,
  material,
  showHoogsterkte,
  locale,
}: {
  title: string;
  kind: Kind;
  thicknesses: readonly number[];
  active: number | null;
  material: Material;
  showHoogsterkte: boolean;
  locale: Locale;
}) {
  const cols: Material[] = showHoogsterkte
    ? ["staal", "alu", "rvs", "hoogsterkte"]
    : ["staal", "alu", "rvs"];
  const labelFor = (id: Material) => {
    const m = MATERIALS.find((m) => m.id === id);
    return m ? tx(locale, m.label, m.labelEn) : id;
  };
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <Note>
        {tx(
          locale,
          "Lege cel = geen waarde op de 247-pagina. Aluminium 0,8 mm is geen staal-buur.",
          "Empty cell = no value on the 247 page. Aluminium 0.8 mm is not a steel neighbor.",
        )}
      </Note>
      <div className="table-scroll mt-4">
        <table className="ref-table">
          <thead>
            <tr>
              <th>t (mm)</th>
              {cols.map((c) => (
                <th key={c}>{labelFor(c)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {thicknesses.map((d) => (
              <tr key={d} className={d === active ? "is-active" : ""}>
                <th scope="row">{dashMm(d)}</th>
                {cols.map((c) => (
                  <td
                    key={c}
                    className={
                      d === active && c === material ? "font-semibold" : ""
                    }
                  >
                    {dashMm(lookupKanten(d, c, kind)?.ri ?? null)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-subtle">
        {tx(locale, "Bron:", "Source:")}{" "}
        <a
          href={KANTEN_SOURCE}
          className="text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          247TailorSteel
        </a>
      </p>
    </section>
  );
}

function GroupTable({
  title,
  kind,
  thicknesses,
  active,
  material,
  mode,
  locale,
}: {
  title: string;
  kind: Kind;
  thicknesses: readonly number[];
  active: number | null;
  material: Material;
  mode: "ws" | "zx";
  locale: Locale;
}) {
  const groups: { id: "sa" | "rvs" | "hs"; label: string; mat: Material }[] = [
    { id: "sa", label: tx(locale, "Staal en Aluminium", "Steel and Aluminium"), mat: "staal" },
    { id: "rvs", label: "RVS", mat: "rvs" },
    { id: "hs", label: tx(locale, "Hoogsterkte", "High-strength"), mat: "hoogsterkte" },
  ];
  const activeGroup =
    material === "rvs" ? "rvs" : material === "hoogsterkte" ? "hs" : "sa";
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <Note>
        {tx(
          locale,
          "Staal en aluminium delen deze kolom op de 247-pagina. w is groefwijdte;",
          "Steel and aluminium share this column on the 247 page. w is die opening;",
        )}{" "}
        {mode === "ws"
          ? tx(
              locale,
              "s is minimale beenlengte (opleg op de matrijs)",
              "s is minimum leg length (bearing on the die)",
            )
          : tx(locale, "x is de Z-maat", "x is the Z dimension")}
        .
      </Note>
      <div className="table-scroll mt-4">
        <table className="ref-table">
          <thead>
            <tr>
              <th>t (mm)</th>
              {groups.map((g) => (
                <th key={g.id} colSpan={2}>
                  {g.label}
                </th>
              ))}
            </tr>
            <tr>
              <th />
              {groups.map((g) => (
                <Fragment key={g.id}>
                  <th>{tx(locale, "w (groef)", "w (die)")}</th>
                  <th>{mode === "ws" ? tx(locale, "s (been)", "s (leg)") : "x"}</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {thicknesses.map((d) => (
              <tr key={d} className={d === active ? "is-active" : ""}>
                <th scope="row">{dashMm(d)}</th>
                {groups.map((g) => {
                  const r = lookupKanten(d, g.mat, kind);
                  const cls =
                    d === active && g.id === activeGroup ? "font-semibold" : "";
                  const left = mode === "ws" ? (r?.w ?? null) : (r?.zw ?? null);
                  const right = mode === "ws" ? (r?.s ?? null) : (r?.x ?? null);
                  return (
                    <Fragment key={g.id}>
                      <td className={cls}>{dashMm(left)}</td>
                      <td className={cls}>{dashMm(right)}</td>
                    </Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-subtle">
        {tx(locale, "Bron:", "Source:")}{" "}
        <a
          href={KANTEN_SOURCE}
          className="text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          247TailorSteel
        </a>
      </p>
    </section>
  );
}
