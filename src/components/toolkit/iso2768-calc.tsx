import { useMemo, useState } from "react";
import { fmtMm } from "@/lib/utils";
import { tx, useLocale, type Locale } from "@/lib/i18n/locale";
import {
  ANGULAR,
  ANGULAR_LABELS,
  ANGULAR_LABELS_EN,
  FORM_RANGE_LABELS,
  FORM_RANGE_LABELS_EN,
  LINEAR,
  LINEAR_LABELS,
  LINEAR_LABELS_EN,
  PERPENDICULARITY,
  RADIUS,
  RADIUS_LABELS,
  RADIUS_LABELS_EN,
  RUNOUT,
  STRAIGHTNESS,
  STRAIGHTNESS_LABELS,
  STRAIGHTNESS_LABELS_EN,
  SYMMETRY,
  fmtAngle,
  lookupIso2768,
  type FormClass,
  type LinearClass,
} from "@/lib/toolkit/iso2768";
import { readStoredDiameter, storeDiameter } from "@/lib/toolkit/tools";
import {
  CalcEyebrow,
  CalcPanel,
  CopyResult,
  Field,
  Note,
  NumInput,
  ResultGrid,
  SelectInput,
  SourceBadge,
} from "./calc-ui";

function parseLen(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (t === "") return null;
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function Iso2768Calc() {
  const { locale } = useLocale();
  const [len, setLen] = useState(() => readStoredDiameter({ min: 0, max: 4000, fallback: "42" }));
  const [linear, setLinear] = useState<LinearClass>("m");
  const [form, setForm] = useState<FormClass>("K");
  const L = parseLen(len);
  const row = L == null ? null : lookupIso2768(L, linear, form);

  const copy = useMemo(() => {
    if (!row) return "";
    const noVal = tx(locale, "geen tabelwaarde", "no table value");
    const lines = [row.callout];
    if (row.linearTol != null)
      lines.push(`${tx(locale, "Lineair", "Linear")}  ±${fmtMm(row.linearTol, 2)} mm`);
    else lines.push(`${tx(locale, "Lineair", "Linear")}  ${noVal}`);
    if (row.radiusTol != null)
      lines.push(`${tx(locale, "Radii/afschuining", "Radii/chamfer")}  ±${fmtMm(row.radiusTol, 1)} mm`);
    if (row.angularTol) lines.push(`${tx(locale, "Hoek", "Angle")}  ±${fmtAngle(row.angularTol)}`);
    if (row.straightness != null) {
      lines.push(
        `${tx(locale, "Rechtheid/vlakheid", "Straightness/flatness")}  ${fmtMm(row.straightness, 2)} mm`,
      );
    }
    if (row.perpendicularity != null) {
      lines.push(`${tx(locale, "Haaksheid", "Perpendicularity")}  ${fmtMm(row.perpendicularity, 1)} mm`);
    }
    if (row.symmetry != null)
      lines.push(`${tx(locale, "Symmetrie", "Symmetry")}  ${fmtMm(row.symmetry, 1)} mm`);
    lines.push(`${tx(locale, "Circulaire uitloop", "Circular runout")}  ${fmtMm(row.runout, 1)} mm`);
    return lines.join("\n");
  }, [row, locale]);

  const missing =
    L != null && L < 0.5
      ? tx(
          locale,
          "Onder 0,5 mm heeft ISO 2768 geen rij. Zet de afwijking naast de maat.",
          "Below 0.5 mm ISO 2768 has no row. Put the deviation next to the dimension.",
        )
      : L != null && row == null
        ? tx(locale, "Deze nominale lengte valt buiten de tabellen.", "This nominal length is outside the tables.")
        : null;

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {tx(locale, "Nominale lengte", "Nominal length")}
        </h2>
        <Note>
          {tx(
            locale,
            "Titelblok-default als een maat geen vakje heeft. Geen passing (dat is ISO 286). Standaardaanduiding ISO 2768-mK.",
            "Title-block default when a dimension has no tolerance box. Not a fit (that is ISO 286). Standard callout ISO 2768-mK.",
          )}
        </Note>
        <SourceBadge>
          {tx(
            locale,
            "ISO 2768-2 (H/K/L) is in 2021 ingetrokken; opvolger is ISO 22081.",
            "ISO 2768-2 (H/K/L) was withdrawn in 2021; successor is ISO 22081.",
          )}
        </SourceBadge>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Field label={tx(locale, "Nominale lengte (mm)", "Nominal length (mm)")}>
            <NumInput
              value={len}
              onChange={(v) => {
                setLen(v);
                storeDiameter(v.replace(",", ".").replace(/\..*/, "") || v);
              }}
            />
          </Field>
          <Field label={tx(locale, "Lineair (2768-1)", "Linear (2768-1)")}>
            <SelectInput value={linear} onChange={(v) => setLinear(v as LinearClass)}>
              <option value="f">{tx(locale, "f fijn", "f fine")}</option>
              <option value="m">{tx(locale, "m middel", "m medium")}</option>
              <option value="c">{tx(locale, "c grof", "c coarse")}</option>
              <option value="v">{tx(locale, "v zeer grof", "v very coarse")}</option>
            </SelectInput>
          </Field>
          <Field label={tx(locale, "Vorm (2768-2)", "Geometrical (2768-2)")}>
            <SelectInput value={form} onChange={(v) => setForm(v as FormClass)}>
              <option value="H">H</option>
              <option value="K">K</option>
              <option value="L">L</option>
            </SelectInput>
          </Field>
        </div>
        {row ? (
          <>
            <p className="mt-5 font-mono text-sm text-ink">{row.callout}</p>
            <ResultGrid
              items={[
                {
                  label: tx(locale, "Lineair ±", "Linear ±"),
                  value:
                    row.linearTol != null
                      ? `±${fmtMm(row.linearTol, 2)} mm`
                      : tx(locale, "geen tabelwaarde", "no table value"),
                },
                {
                  label: tx(locale, "Radii / afschuining ±", "Radii / chamfer ±"),
                  value:
                    row.radiusTol != null
                      ? `±${fmtMm(row.radiusTol, 1)} mm`
                      : tx(locale, "geen tabelwaarde", "no table value"),
                },
                {
                  label: tx(locale, "Hoek ±", "Angle ±"),
                  value: row.angularTol
                    ? `±${fmtAngle(row.angularTol)}`
                    : tx(locale, "geen tabelwaarde", "no table value"),
                },
                {
                  label: tx(locale, "Tekening", "Drawing"),
                  value: row.callout,
                },
                {
                  label: tx(locale, "Rechtheid / vlakheid", "Straightness / flatness"),
                  value:
                    row.straightness != null
                      ? `${fmtMm(row.straightness, 2)} mm`
                      : tx(locale, "buiten 2768-2", "outside 2768-2"),
                },
                {
                  label: tx(locale, "Haaksheid", "Perpendicularity"),
                  value:
                    row.perpendicularity != null
                      ? `${fmtMm(row.perpendicularity, 1)} mm`
                      : tx(locale, "buiten 2768-2", "outside 2768-2"),
                },
                {
                  label: tx(locale, "Symmetrie", "Symmetry"),
                  value:
                    row.symmetry != null
                      ? `${fmtMm(row.symmetry, 1)} mm`
                      : tx(locale, "buiten 2768-2", "outside 2768-2"),
                },
                {
                  label: tx(locale, "Circulaire uitloop", "Circular runout"),
                  value: `${fmtMm(row.runout, 1)} mm`,
                },
              ]}
            />
            <CopyResult text={copy} />
          </>
        ) : (
          <p className="mt-5 text-sm text-muted">
            {missing ?? tx(locale, "Voer een nominale lengte in.", "Enter a nominal length.")}
          </p>
        )}
      </CalcPanel>

      <p className="mt-8 text-sm leading-relaxed text-muted">
        {tx(
          locale,
          "ISO 2768-2 (H/K/L) is in 2021 ingetrokken; opvolger is ISO 22081. Hier nog getoond omdat tekeningen nog mK zetten. Dit is geen ISO 286 en geen vervanging van een maat in een vakje.",
          "ISO 2768-2 (H/K/L) was withdrawn in 2021; successor is ISO 22081. Still shown here because drawings still call out mK. This is not ISO 286 and not a substitute for a dimension in a tolerance box.",
        )}
      </p>

      <LinearTable active={row?.linearIndex ?? null} klass={linear} locale={locale} />
      <RadiusTable active={row?.radiusIndex ?? null} klass={linear} locale={locale} />
      <AngleTable active={row?.angularIndex ?? null} klass={linear} locale={locale} />
      <StraightTable active={row?.straightIndex ?? null} klass={form} locale={locale} />
      <FormTable
        title={tx(locale, "Haaksheid (ISO 2768-2)", "Perpendicularity (ISO 2768-2)")}
        data={PERPENDICULARITY}
        active={row?.formRangeIndex ?? null}
        klass={form}
        locale={locale}
      />
      <FormTable
        title={tx(locale, "Symmetrie (ISO 2768-2)", "Symmetry (ISO 2768-2)")}
        data={SYMMETRY}
        active={row?.formRangeIndex ?? null}
        klass={form}
        locale={locale}
      />
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "Circulaire uitloop", "Circular runout")}
        </h2>
        <Note>
          {tx(
            locale,
            "Onafhankelijk van de nominale lengte. Geen ±.",
            "Independent of the nominal length. No ±.",
          )}
        </Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>H</th>
                <th>K</th>
                <th>L</th>
              </tr>
            </thead>
            <tbody>
              <tr className="is-active">
                <td>{fmtMm(RUNOUT.H, 1)}</td>
                <td>{fmtMm(RUNOUT.K, 1)}</td>
                <td>{fmtMm(RUNOUT.L, 1)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {tx(locale, "Bron:", "Source:")}{" "}
          <a
            href="https://www.rodinmachining.nl/media/53qdjv2u/iso-2768-normblad-rodin-machining.pdf"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {tx(locale, "Rodin ISO 2768-blad", "Rodin ISO 2768 sheet")}
          </a>
        </p>
      </section>
    </>
  );
}

function dash(v: number | null) {
  return v == null ? "—" : `±${fmtMm(v, 2)}`;
}

function LinearTable({
  active,
  klass: _klass,
  locale,
}: {
  active: number | null;
  klass: LinearClass;
  locale: Locale;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        {tx(locale, "Lineaire maten (ISO 2768-1)", "Linear dimensions (ISO 2768-1)")}
      </h2>
      <Note>
        {tx(
          locale,
          "Toelaatbare afwijkingen in mm. Onder 0,5 mm: afwijking naast de maat.",
          "Permissible deviations in mm. Below 0.5 mm: deviation next to the dimension.",
        )}
      </Note>
      <div className="table-scroll mt-4">
        <table className="ref-table">
          <thead>
            <tr>
              <th>{tx(locale, "Nominale lengte", "Nominal length")}</th>
              <th>f</th>
              <th>m</th>
              <th>c</th>
              <th>v</th>
            </tr>
          </thead>
          <tbody>
            {LINEAR_LABELS.map((label, i) => (
              <tr key={label} className={i === active ? "is-active" : ""}>
                <th scope="row">{tx(locale, label, LINEAR_LABELS_EN[i])}</th>
                <td>{dash(LINEAR.f[i] ?? null)}</td>
                <td>{dash(LINEAR.m[i] ?? null)}</td>
                <td>{dash(LINEAR.c[i] ?? null)}</td>
                <td>{dash(LINEAR.v[i] ?? null)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-subtle">
        {tx(locale, "Bron:", "Source:")}{" "}
        <a
          href="https://www.rodinmachining.nl/media/53qdjv2u/iso-2768-normblad-rodin-machining.pdf"
          className="text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {tx(locale, "Rodin ISO 2768-blad", "Rodin ISO 2768 sheet")}
        </a>
        {tx(locale, "; nagekeken bij", "; checked against")}{" "}
        <a
          href="https://www.hoekman-rvs.nl/toleranties-cnc-kanten-iso-2768"
          className="text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Hoekman
        </a>
        .
      </p>
    </section>
  );
}

function RadiusTable({
  active,
  klass: _klass,
  locale,
}: {
  active: number | null;
  klass: LinearClass;
  locale: Locale;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        {tx(locale, "Radii en afschuinhoogten", "Radii and chamfer heights")}
      </h2>
      <div className="table-scroll mt-4">
        <table className="ref-table">
          <thead>
            <tr>
              <th>{tx(locale, "Nominale lengte", "Nominal length")}</th>
              <th>f / m</th>
              <th>c / v</th>
            </tr>
          </thead>
          <tbody>
            {RADIUS_LABELS.map((label, i) => (
              <tr key={label} className={i === active ? "is-active" : ""}>
                <th scope="row">{tx(locale, label, RADIUS_LABELS_EN[i])}</th>
                <td>±{fmtMm(RADIUS.fm[i] ?? 0, 1)}</td>
                <td>±{fmtMm(RADIUS.cv[i] ?? 0, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-subtle">
        {tx(locale, "Bron:", "Source:")}{" "}
        <a
          href="https://www.rodinmachining.nl/media/53qdjv2u/iso-2768-normblad-rodin-machining.pdf"
          className="text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {tx(locale, "Rodin ISO 2768-blad", "Rodin ISO 2768 sheet")}
        </a>
      </p>
    </section>
  );
}

function AngleTable({
  active,
  klass: _klass,
  locale,
}: {
  active: number | null;
  klass: LinearClass;
  locale: Locale;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        {tx(locale, "Hoekmaten (kortere been)", "Angular dimensions (shorter leg)")}
      </h2>
      <div className="table-scroll mt-4">
        <table className="ref-table">
          <thead>
            <tr>
              <th>{tx(locale, "Kortere been", "Shorter leg")}</th>
              <th>f / m</th>
              <th>c</th>
              <th>v</th>
            </tr>
          </thead>
          <tbody>
            {ANGULAR_LABELS.map((label, i) => (
              <tr key={label} className={i === active ? "is-active" : ""}>
                <th scope="row">{tx(locale, label, ANGULAR_LABELS_EN[i])}</th>
                <td>±{fmtAngle(ANGULAR.f[i] ?? ANGULAR.f[0])}</td>
                <td>±{fmtAngle(ANGULAR.c[i] ?? ANGULAR.c[0])}</td>
                <td>±{fmtAngle(ANGULAR.v[i] ?? ANGULAR.v[0])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-subtle">
        {tx(locale, "Bron:", "Source:")}{" "}
        <a
          href="https://www.rodinmachining.nl/media/53qdjv2u/iso-2768-normblad-rodin-machining.pdf"
          className="text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {tx(locale, "Rodin ISO 2768-blad", "Rodin ISO 2768 sheet")}
        </a>
      </p>
    </section>
  );
}

function StraightTable({
  active,
  klass: _klass,
  locale,
}: {
  active: number | null;
  klass: FormClass;
  locale: Locale;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        {tx(locale, "Rechtheid en vlakheid (ISO 2768-2)", "Straightness and flatness (ISO 2768-2)")}
      </h2>
      <Note>{tx(locale, "Waarden in mm, geen ±.", "Values in mm, no ±.")}</Note>
      <div className="table-scroll mt-4">
        <table className="ref-table">
          <thead>
            <tr>
              <th>{tx(locale, "Nominale lengte", "Nominal length")}</th>
              <th>H</th>
              <th>K</th>
              <th>L</th>
            </tr>
          </thead>
          <tbody>
            {STRAIGHTNESS_LABELS.map((label, i) => (
              <tr key={label} className={i === active ? "is-active" : ""}>
                <th scope="row">{tx(locale, label, STRAIGHTNESS_LABELS_EN[i])}</th>
                <td>{fmtMm(STRAIGHTNESS.H[i] ?? 0, 2)}</td>
                <td>{fmtMm(STRAIGHTNESS.K[i] ?? 0, 2)}</td>
                <td>{fmtMm(STRAIGHTNESS.L[i] ?? 0, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-subtle">
        {tx(locale, "Bron:", "Source:")}{" "}
        <a
          href="https://www.rodinmachining.nl/media/53qdjv2u/iso-2768-normblad-rodin-machining.pdf"
          className="text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {tx(locale, "Rodin ISO 2768-blad", "Rodin ISO 2768 sheet")}
        </a>
      </p>
    </section>
  );
}

function FormTable({
  title,
  data,
  active,
  klass: _klass,
  locale,
}: {
  title: string;
  data: { H: readonly number[]; K: readonly number[]; L: readonly number[] };
  active: number | null;
  klass: FormClass;
  locale: Locale;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <Note>{tx(locale, "Waarden in mm, geen ±.", "Values in mm, no ±.")}</Note>
      <div className="table-scroll mt-4">
        <table className="ref-table">
          <thead>
            <tr>
              <th>{tx(locale, "Nominale lengte", "Nominal length")}</th>
              <th>H</th>
              <th>K</th>
              <th>L</th>
            </tr>
          </thead>
          <tbody>
            {FORM_RANGE_LABELS.map((label, i) => (
              <tr key={label} className={i === active ? "is-active" : ""}>
                <th scope="row">{tx(locale, label, FORM_RANGE_LABELS_EN[i])}</th>
                <td>{fmtMm(data.H[i] ?? 0, 1)}</td>
                <td>{fmtMm(data.K[i] ?? 0, 1)}</td>
                <td>{fmtMm(data.L[i] ?? 0, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-subtle">
        {tx(locale, "Bron:", "Source:")}{" "}
        <a
          href="https://www.rodinmachining.nl/media/53qdjv2u/iso-2768-normblad-rodin-machining.pdf"
          className="text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {tx(locale, "Rodin ISO 2768-blad", "Rodin ISO 2768 sheet")}
        </a>
      </p>
    </section>
  );
}
