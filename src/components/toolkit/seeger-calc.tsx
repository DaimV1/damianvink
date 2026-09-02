import { useMemo, useState } from "react";
import {
  fmtSeeger,
  fmtSeeger3,
  lookupSeeger,
  seegerFor,
  type SeegerKind,
} from "@/lib/toolkit/seeger";
import { readStoredDiameter, storeDiameter } from "@/lib/toolkit/tools";
import { tx, useLocale } from "@/lib/i18n/locale";
import {
  CalcEyebrow,
  CalcPanel,
  CopyResult,
  Field,
  Note,
  parseWholeMm,
  ResultGrid,
  SelectInput,
  SourceBadge,
  WholeMmInput,
} from "./calc-ui";
import { CirclipSection, SchemaPanel } from "./schema";

export function SeegerCalc() {
  const { locale } = useLocale();
  const [diameter, setDiameter] = useState(() =>
    readStoredDiameter({ min: 3, max: 100 }),
  );
  const [kind, setKind] = useState<SeegerKind>("as");
  const parsed = parseWholeMm(diameter);
  const d = parsed.status === "ok" ? parsed.mm : Number.NaN;
  const row = parsed.status === "ok" ? lookupSeeger(d) : null;
  const result = row ? seegerFor(row, kind) : null;

  function onDia(v: string) {
    setDiameter(v);
    const next = parseWholeMm(v);
    if (next.status === "ok") storeDiameter(String(next.mm));
  }

  const copy = useMemo(() => {
    if (!result || Number.isNaN(d)) return "";
    const where = kind === "as" ? "as" : "boring";
    const norm = kind === "as" ? "DIN 471" : "DIN 472";
    return [
      `Seegerring ${where} Ø ${d} mm · ${norm}`,
      `d₂ groef  ${fmtSeeger(result.d2)} mm ${result.d2Class}`,
      `b breedte  ${fmtSeeger(result.b)} mm (H13, werkplaatstabel)`,
      `t diepte  ${fmtSeeger(result.t)} mm  0 / +${fmtSeeger3(result.tPlus)}`,
    ].join("\n");
  }, [d, kind, result]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {tx(locale, "Groef bij Ø", "Groove at Ø")}
        </h2>
        <Note>
          {tx(
            locale,
            "Nominale seegerringmaten, geen bereik. As = DIN 471 (d₂ h11, kleiner dan d₁), boring = DIN 472 (d₂ H11, groter). b is groefbreedte H13 uit een werkplaatstabel — kan afwijken van de officiële DIN. t is nominaal |d₁ − d₂| / 2; de dieptetol. 0 / +IT11/2 volgt uit d₂ (dieper mag, ondieper niet).",
            "Nominal circlip sizes, not a range. Shaft = DIN 471 (d₂ h11, smaller than d₁), bore = DIN 472 (d₂ H11, larger). b is groove width H13 from a shop table — may deviate from the official DIN. t is nominal |d₁ − d₂| / 2; the depth tolerance 0 / +IT11/2 follows from d₂ (deeper is allowed, shallower is not).",
          )}
        </Note>
        <SourceBadge>
          {tx(
            locale,
            "Groefbreedte b komt uit een werkplaatstabel, niet uit de officiële DIN 471/472-pdf.",
            "Groove width b comes from a shop table, not the official DIN 471/472 PDF.",
          )}
        </SourceBadge>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={tx(locale, "Ø d₁ (mm)", "Ø d₁ (mm)")}>
            <WholeMmInput id="seeger-diameter" value={diameter} onChange={onDia} />
          </Field>
          <Field label={tx(locale, "Inbouw", "Installation")}>
            <SelectInput
              value={kind}
              onChange={(v) => setKind(v as SeegerKind)}
            >
              <option value="as">{tx(locale, "As — DIN 471", "Shaft — DIN 471")}</option>
              <option value="boring">{tx(locale, "Boring — DIN 472", "Bore — DIN 472")}</option>
            </SelectInput>
          </Field>
        </div>
        {parsed.status === "empty" ? (
          <p className="mt-5 text-sm text-muted">
            {tx(locale, "Vul een nominale Ø in.", "Enter a nominal Ø.")}
          </p>
        ) : !row ? (
          <p className="mt-5 text-sm text-muted">
            {tx(
              locale,
              `Geen nominale seegerring voor Ø ${d} mm. De tabel loopt 3–100 mm, niet elke millimeter.`,
              `No nominal circlip for Ø ${d} mm. The table runs 3–100 mm, not every millimeter.`,
            )}
          </p>
        ) : !result ? (
          <p className="mt-5 text-sm text-muted">
            {tx(
              locale,
              `Ø ${d} mm heeft geen DIN 472-ring voor boring. Kies as, of een Ø vanaf 8 mm.`,
              `Ø ${d} mm has no DIN 472 ring for a bore. Choose shaft, or an Ø from 8 mm.`,
            )}
          </p>
        ) : (
          <>
            <p className="mt-5 text-sm text-muted">
              {kind === "as" ? tx(locale, "As", "Shaft") : tx(locale, "Boring", "Bore")} Ø {d} mm ·{" "}
              {kind === "as" ? "DIN 471" : "DIN 472"}
            </p>
            <ResultGrid
              items={[
                {
                  label: tx(locale, "d₂ groef", "d₂ groove"),
                  value: `${fmtSeeger(result.d2)} mm ${result.d2Class}`,
                },
                {
                  label: tx(locale, "b breedte (werkplaatstabel)", "b width (shop table)"),
                  value: `${fmtSeeger(result.b)} mm H13`,
                },
                {
                  label: tx(locale, "t diepte", "t depth"),
                  value: `${fmtSeeger(result.t)} mm  0 / +${fmtSeeger3(result.tPlus)}`,
                },
              ]}
            />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {tx(
                locale,
                "Breedte b komt uit een werkplaatstabel, niet uit de officiële DIN-pdf. Voor productiewerk b in DIN 471/472 controleren.",
                "Width b comes from a shop table, not the official DIN PDF. For production work, verify b in DIN 471/472.",
              )}
            </p>
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
            "Lengtedoorsnede van de gekozen inbouw. Groef is de inkeping; de ring zit erin (accent). Maatlijnen volgen d₁, d₂, b en t. Geen schaal.",
            "Longitudinal section of the selected installation. The groove is the notch; the ring sits in it (accent). Dimension lines follow d₁, d₂, b and t. Not to scale.",
          )}
        </Note>
        <SchemaPanel
          caption={
            kind === "as"
              ? tx(locale, "As · DIN 471 — groef op de buitenkant", "Shaft · DIN 471 — groove on the outside")
              : tx(locale, "Boring · DIN 472 — groef op de binnenkant", "Bore · DIN 472 — groove on the inside")
          }
        >
          <CirclipSection
            kind={kind}
            d1={row?.d1}
            d2={result?.d2}
            b={result?.b}
            t={result?.t}
          />
        </SchemaPanel>
      </section>

      <p className="mt-8 text-sm leading-relaxed text-muted">
        {tx(locale, "Bron:", "Source:")}{" "}
        {tx(
          locale,
          "werkplaatstabel seegerringgroef (samenvatting van DIN 471 as / DIN 472 boring), o.a.",
          "shop table for the circlip groove (summary of DIN 471 shaft / DIN 472 bore), incl.",
        )}{" "}
        <a
          href="https://verspanenmuzo.wordpress.com/2015/02/24/seegerring-groef-tabbel/"
          className="text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          verspanen-metaal
        </a>
        {tx(
          locale,
          ". b = groefbreedte H13 uit die tabel — niet 1:1 overnemen uit de officiële DIN zonder check. t = |d₁ − d₂| / 2 (nominaal). d₂ as = h11, d₂ boring = H11: t wordt daardoor 0 / +IT11/2 — dieper mag, ondieper niet. Geen n-min. (schouder). Controleer kritieke maten in de actuele DIN.",
          ". b = groove width H13 from that table — do not copy 1:1 from the official DIN without checking. t = |d₁ − d₂| / 2 (nominal). d₂ shaft = h11, d₂ bore = H11: t therefore becomes 0 / +IT11/2 — deeper is allowed, shallower is not. No n-min. (shoulder). Verify critical dimensions in the current DIN.",
        )}
      </p>
    </>
  );
}
