import { useMemo, useState } from "react";
import {
  SEEGER,
  fmtSeeger,
  fmtSeeger3,
  grooveDepth,
  lookupSeeger,
  seegerFor,
  type SeegerKind,
} from "@/lib/toolkit/seeger";
import { readStoredDiameter, storeDiameter } from "@/lib/toolkit/tools";
import {
  CalcPanel,
  CopyResult,
  Field,
  Note,
  NumInput,
  parseWholeMm,
  ResultGrid,
  SelectInput,
} from "./calc-ui";

export function SeegerCalc() {
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
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
          Rekenhulp
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          Groef bij Ø
        </h2>
        <Note>
          Nominale seegerringmaten, geen bereik. As = DIN 471 (d₂ h11, kleiner
          dan d₁), boring = DIN 472 (d₂ H11, groter). b is groefbreedte H13 uit
          een werkplaatstabel — kan afwijken van de officiële DIN. t is nominaal
          |d₁ − d₂| / 2; de dieptetol. 0 / +IT11/2 volgt uit d₂ (dieper mag,
          ondieper niet).
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Ø d₁ (mm)">
            <NumInput id="seeger-diameter" value={diameter} onChange={onDia} />
          </Field>
          <Field label="Inbouw">
            <SelectInput
              value={kind}
              onChange={(v) => setKind(v as SeegerKind)}
            >
              <option value="as">As — DIN 471</option>
              <option value="boring">Boring — DIN 472</option>
            </SelectInput>
          </Field>
        </div>
        {parsed.status === "empty" ? (
          <p className="mt-5 text-sm text-muted">Vul een nominale Ø in.</p>
        ) : parsed.status === "fraction" ? (
          <p className="mt-5 text-sm text-muted">
            Alleen hele millimeters. Seegerringen zijn nominale maten, geen bereik.
          </p>
        ) : !row ? (
          <p className="mt-5 text-sm text-muted">
            Geen nominale seegerring voor Ø {d} mm. De tabel loopt 3–100 mm,
            niet elke millimeter.
          </p>
        ) : !result ? (
          <p className="mt-5 text-sm text-muted">
            Ø {d} mm heeft geen DIN 472-ring voor boring. Kies as, of een Ø
            vanaf 8 mm.
          </p>
        ) : (
          <>
            <p className="mt-5 text-sm text-muted">
              {kind === "as" ? "As" : "Boring"} Ø {d} mm ·{" "}
              {kind === "as" ? "DIN 471" : "DIN 472"}
            </p>
            <ResultGrid
              items={[
                { label: "d₂ groef", value: `${fmtSeeger(result.d2)} mm ${result.d2Class}` },
                {
                  label: "b breedte (werkplaatstabel)",
                  value: `${fmtSeeger(result.b)} mm H13`,
                },
                {
                  label: "t diepte",
                  value: `${fmtSeeger(result.t)} mm  0 / +${fmtSeeger3(result.tPlus)}`,
                },
              ]}
            />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Breedte b komt uit een werkplaatstabel, niet uit de officiële
              DIN-pdf. Voor productiewerk b in DIN 471/472 controleren.
            </p>
            <CopyResult text={copy} />
          </>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          Doorsnede
        </h2>
        <Note>
          Links de groef in de as, rechts in de boring. Geen schaal. De
          seegerring zit in de groef (accent).
        </Note>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <AsSchema active={kind === "as"} />
          <BoreSchema active={kind === "boring"} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          Seegerringgroef (DIN 471 / 472)
        </h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>d₁</th>
                <th>d₂ as</th>
                <th>d₂ boring</th>
                <th>b</th>
                <th>t as</th>
                <th>t boring</th>
              </tr>
            </thead>
            <tbody>
              {SEEGER.map((k) => {
                const tAs = k.d2as != null ? grooveDepth(k.d1, k.d2as) : null;
                const tBor = k.d2bor != null ? grooveDepth(k.d1, k.d2bor) : null;
                return (
                  <tr
                    key={k.d1}
                    className={row?.d1 === k.d1 ? "is-active" : ""}
                  >
                    <th scope="row">{k.d1}</th>
                    <td>{k.d2as != null ? fmtSeeger(k.d2as) : "—"}</td>
                    <td>{k.d2bor != null ? fmtSeeger(k.d2bor) : "—"}</td>
                    <td>{fmtSeeger(k.b)}</td>
                    <td>{tAs != null ? fmtSeeger(tAs) : "—"}</td>
                    <td>{tBor != null ? fmtSeeger(tBor) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          Bron: werkplaatstabel seegerringgroef (samenvatting van DIN 471 as /
          DIN 472 boring), o.a.{" "}
          <a
            href="https://verspanenmuzo.wordpress.com/2015/02/24/seegerring-groef-tabbel/"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            verspanen-metaal
          </a>
          . b = groefbreedte H13 uit die tabel — niet 1:1 overnemen uit de
          officiële DIN zonder check. t = |d₁ − d₂| / 2 (nominaal). d₂ as =
          h11, d₂ boring = H11: t wordt daardoor 0 / +IT11/2 — dieper mag,
          ondieper niet. Geen n-min. (schouder). Controleer kritieke maten in de
          actuele DIN.
        </p>
      </section>
    </>
  );
}

function AsSchema({ active }: { active: boolean }) {
  return (
    <figure className={active ? "text-ink" : "text-muted"}>
      <svg
        className="w-full max-w-md"
        viewBox="0 0 320 220"
        role="img"
        aria-label="Doorsnede as met seegerringgroef: d1, d2, b en t"
      >
        <circle
          cx="110"
          cy="110"
          r="78"
          fill="none"
          stroke="currentColor"
          opacity="0.35"
        />
        <circle cx="110" cy="110" r="62" fill="none" stroke="currentColor" />
        <rect
          x="168"
          y="100"
          width="14"
          height="20"
          rx="1"
          fill="var(--accent)"
        />
        <path
          d="M172 96 v8 M172 124 v8"
          stroke="currentColor"
          fill="none"
          opacity="0.5"
        />
        <text x="8" y="24" fill="currentColor" fontSize="13">
          as — DIN 471
        </text>
        <text x="96" y="116" fill="currentColor" fontSize="13">
          d₁
        </text>
        <text x="188" y="88" fill="currentColor" fontSize="13">
          d₂
        </text>
        <text x="188" y="116" fill="currentColor" fontSize="13">
          b
        </text>
        <text x="188" y="152" fill="currentColor" fontSize="13">
          t
        </text>
        <text x="8" y="204" fill="currentColor" fontSize="12" opacity="0.75">
          groef in de as, ring van buiten
        </text>
      </svg>
    </figure>
  );
}

function BoreSchema({ active }: { active: boolean }) {
  return (
    <figure className={active ? "text-ink" : "text-muted"}>
      <svg
        className="w-full max-w-md"
        viewBox="0 0 320 220"
        role="img"
        aria-label="Doorsnede boring met seegerringgroef: d1, d2, b en t"
      >
        <circle
          cx="110"
          cy="110"
          r="82"
          fill="none"
          stroke="currentColor"
          opacity="0.35"
        />
        <circle cx="110" cy="110" r="52" fill="none" stroke="currentColor" />
        <rect
          x="154"
          y="100"
          width="14"
          height="20"
          rx="1"
          fill="var(--accent)"
        />
        <text x="8" y="24" fill="currentColor" fontSize="13">
          boring — DIN 472
        </text>
        <text x="96" y="116" fill="currentColor" fontSize="13">
          d₁
        </text>
        <text x="180" y="88" fill="currentColor" fontSize="13">
          d₂
        </text>
        <text x="180" y="116" fill="currentColor" fontSize="13">
          b
        </text>
        <text x="180" y="152" fill="currentColor" fontSize="13">
          t
        </text>
        <text x="8" y="204" fill="currentColor" fontSize="12" opacity="0.75">
          groef in de boring, ring van binnen
        </text>
      </svg>
    </figure>
  );
}
