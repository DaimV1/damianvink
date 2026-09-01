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
          Shop-spec van 247TailorSteel Sophia, geen ISO of DIN. Discrete
          diktes; een lege cel is geen buurrij. Changelog bron: 11-03-2026.
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
                { label: "Ri (inwendig)", value: `${dashMm(row.ri)} mm` },
                { label: "s min. beenlengte", value: `${dashMm(row.s)} mm` },
                { label: "w groefwijdte", value: `${dashMm(row.w)} mm` },
                { label: "x (Z-buiging)", value: `${dashMm(row.x)} mm` },
              ]}
            />
            {row.thickPlate ? (
              <Note>
                10 en 12 mm: niet over de volle plaatlengte. Check de actuele
                247-pagina.
              </Note>
            ) : null}
            <CopyResult text={copy} />
          </>
        ) : (
          <p className="mt-5 text-sm text-muted">
            Deze dikte staat niet in de 247-tabellen voor deze combinatie. Geen
            naburige rij gebruiken.
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
          <BendSection kind={kind} ri={row?.ri ?? null} s={row?.s ?? null} w={row?.w ?? null} />
        </SchemaPanel>
      </section>

      <p className="mt-8 text-sm leading-relaxed text-muted">
        Bron:{" "}
        <a
          href={KANTEN_SOURCE}
          className="text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          247TailorSteel — richtlijnen voor kanten
        </a>
        . Shop-spec Sophia, geen ISO/DIN. Geen commerciële band; altijd hun
        pagina nalopen (changelog 11-03-2026). Botsingcontrole, damwandfoto’s
        en de A–F-tolerantiegrid staan daar, niet hier.
      </p>

      <RiTable
        title="Inwendige radius Ri — haaks"
        kind="haaks"
        thicknesses={RI_T_HAAKS}
        active={kind === "haaks" ? t : null}
        material={material}
        showHoogsterkte
      />
      <RiTable
        title="Inwendige radius Ri — scherp"
        kind="scherp"
        thicknesses={RI_T_SCHERP}
        active={kind === "scherp" ? t : null}
        material={material}
        showHoogsterkte={false}
      />
      <GroupTable
        title="Minimale beenlengte — haaks"
        kind="haaks"
        thicknesses={THICKNESSES}
        active={kind === "haaks" ? t : null}
        material={material}
        mode="ws"
      />
      <GroupTable
        title="Minimale beenlengte — scherp"
        kind="scherp"
        thicknesses={BL_T_SCHERP}
        active={kind === "scherp" ? t : null}
        material={material}
        mode="ws"
      />
      <GroupTable
        title="Z-buiging — haaks"
        kind="haaks"
        thicknesses={THICKNESSES}
        active={kind === "haaks" ? t : null}
        material={material}
        mode="zx"
      />
      <GroupTable
        title="Z-buiging — scherp"
        kind="scherp"
        thicknesses={BL_T_SCHERP}
        active={kind === "scherp" ? t : null}
        material={material}
        mode="zx"
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
}: {
  title: string;
  kind: Kind;
  thicknesses: readonly number[];
  active: number | null;
  material: Material;
  showHoogsterkte: boolean;
}) {
  const cols: Material[] = showHoogsterkte
    ? ["staal", "alu", "rvs", "hoogsterkte"]
    : ["staal", "alu", "rvs"];
  const labels: Record<Material, string> = {
    staal: "Staal",
    alu: "Aluminium",
    rvs: "RVS",
    hoogsterkte: "Hoogsterkte",
  };
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <Note>
        Lege cel = geen waarde op de 247-pagina. Aluminium 0,8 mm is geen
        staal-buur.
      </Note>
      <div className="table-scroll mt-4">
        <table className="ref-table">
          <thead>
            <tr>
              <th>t (mm)</th>
              {cols.map((c) => (
                <th key={c}>{labels[c]}</th>
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
}: {
  title: string;
  kind: Kind;
  thicknesses: readonly number[];
  active: number | null;
  material: Material;
  mode: "ws" | "zx";
}) {
  const groups: { id: "sa" | "rvs" | "hs"; label: string; mat: Material }[] = [
    { id: "sa", label: "Staal en Aluminium", mat: "staal" },
    { id: "rvs", label: "RVS", mat: "rvs" },
    { id: "hs", label: "Hoogsterkte", mat: "hoogsterkte" },
  ];
  const activeGroup =
    material === "rvs" ? "rvs" : material === "hoogsterkte" ? "hs" : "sa";
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <Note>
        Staal en aluminium delen deze kolom op de 247-pagina. w is groefwijdte;
        {" "}
        {mode === "ws"
          ? "s is minimale beenlengte (opleg op de matrijs)"
          : "x is de Z-maat"}
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
                  <th>w (groef)</th>
                  <th>{mode === "ws" ? "s (been)" : "x"}</th>
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
    </section>
  );
}
