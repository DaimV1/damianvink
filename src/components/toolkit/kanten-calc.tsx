import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  bendAllowance90,
  bendDeduction90,
  DEFAULT_K_FACTOR,
  KANTEN_SOURCE,
  KINDS,
  MATERIALS,
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
  CopyLink,
  CopyResult,
  Field,
  Note,
  NumInput,
  ResultGrid,
  SelectInput,
} from "./calc-ui";
import { BendSection, SchemaPanel } from "./schema";

function parseK(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (t === "") return null;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function KantenCalc() {
  const { locale } = useLocale();
  const search = useSearch({ from: "/toolkit/kanten" });
  const navigate = useNavigate({ from: "/toolkit/kanten" });
  const [tRaw, setTRaw] = useState(search.t ?? "2");
  const [material, setMaterial] = useState<Material>((search.material as Material) ?? "rvs");
  const [kind, setKind] = useState<Kind>((search.kind as Kind) ?? "haaks");
  const [kRaw, setKRaw] = useState(search.k ?? String(DEFAULT_K_FACTOR).replace(".", ","));

  useEffect(() => {
    navigate({
      search: (prev) => ({ ...prev, t: tRaw || undefined, material, kind, k: kRaw || undefined }),
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tRaw, material, kind, kRaw]);
  const t = Number(tRaw);
  const row = Number.isFinite(t) ? lookupKanten(t, material, kind) : null;
  const kFactor = parseK(kRaw);
  const ri = row?.ri ?? null;
  const bendMath = useMemo(
    () =>
      kind === "haaks" && ri != null && kFactor != null
        ? { ba: bendAllowance90(ri, t, kFactor), bd: bendDeduction90(ri, t, kFactor) }
        : null,
    [kind, ri, t, kFactor],
  );
  const copy = useMemo(() => (row ? copyLine(row, bendMath) : ""), [row, bendMath]);

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
          {kind === "haaks" ? (
            <Field label={tx(locale, "K-factor (bend allowance)", "K-factor (bend allowance)")}>
              <NumInput id="kanten-k" value={kRaw} onChange={setKRaw} />
            </Field>
          ) : null}
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
                bendMath
                  ? {
                      label: tx(locale, "Bend allowance (90°)", "Bend allowance (90°)"),
                      value: `${bendMath.ba.toFixed(2).replace(".", ",")} mm`,
                    }
                  : null,
                bendMath
                  ? {
                      label: tx(locale, "Bend deduction (90°)", "Bend deduction (90°)"),
                      value: `${bendMath.bd.toFixed(2).replace(".", ",")} mm`,
                    }
                  : null,
              ].filter(Boolean) as { label: string; value: string }[]}
            />
            {bendMath ? (
              <Note>
                {tx(
                  locale,
                  "Alleen voor haaks (90°) — scherp heeft geen vaste hoek. Platte lengte = som beenlengtes tot de buigraaklijn + bend allowance, of som buitenmaten (OML) − bend deduction. K-factor is een richtwaarde (0,3–0,5, afhankelijk van materiaal en Ri/t) — pas aan of meet na op je eigen machine/materiaal.",
                  "Right angle (90°) only — sharp has no fixed angle. Flat length = sum of leg lengths to the bend tangent + bend allowance, or sum of outside dimensions (OML) − bend deduction. K-factor is indicative (0.3–0.5, depending on material and Ri/t) — adjust or verify on your own machine/material.",
                )}
              </Note>
            ) : null}
            {row.ri != null ? (
              <Note>
                {tx(
                  locale,
                  `Gat/inkeping bij een kant: richtwaarde minimaal ca. ${(2.5 * t).toFixed(1).replace(".", ",")}–${(3 * t).toFixed(1).replace(".", ",")} mm (2,5–3 × t) vanaf de buigraaklijn, anders vervormt het gat mee. Niet als harde regel van de fabrikant te lezen — vraag na bij 247.`,
                  `Hole/notch near a bend: rule-of-thumb minimum ca. ${(2.5 * t).toFixed(1)}–${(3 * t).toFixed(1)} mm (2.5–3 × t) from the bend tangent, otherwise the hole distorts with the bend. Not a hard rule from the manufacturer — check with 247.`,
                )}
              </Note>
            ) : null}
            {row.thickPlate ? (
              <Note>
                {tx(
                  locale,
                  "10 en 12 mm: niet over de volle plaatlengte. Check de actuele 247-pagina.",
                  "10 and 12 mm: not over the full plate length. Check the current 247 page.",
                )}
              </Note>
            ) : null}
            {!row.thickPlate && row.w == null && row.s != null ? (
              <Note>
                {tx(
                  locale,
                  "w ontbreekt op de 247-pagina bij deze combinatie, terwijl s wel is opgegeven. Geen naburige rij gebruiken — check de actuele 247-pagina.",
                  "w is missing on the 247 page for this combination, while s is given. Do not use a neighboring row — check the current 247 page.",
                )}
              </Note>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
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
    </>
  );
}
