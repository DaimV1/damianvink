import { useMemo, useState } from "react";
import { fmtMm } from "@/lib/utils";
import { tx, useLocale } from "@/lib/i18n/locale";
import {
  ANGULAR,
  ANGULAR_LABELS,
  FORM_RANGE_LABELS,
  LINEAR,
  LINEAR_LABELS,
  PERPENDICULARITY,
  RADIUS,
  RADIUS_LABELS,
  RUNOUT,
  STRAIGHTNESS,
  STRAIGHTNESS_LABELS,
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
    const lines = [row.callout];
    if (row.linearTol != null) lines.push(`Lineair  ±${fmtMm(row.linearTol, 2)} mm`);
    else lines.push("Lineair  geen tabelwaarde");
    if (row.radiusTol != null) lines.push(`Radii/afschuining  ±${fmtMm(row.radiusTol, 1)} mm`);
    if (row.angularTol) lines.push(`Hoek  ±${fmtAngle(row.angularTol)}`);
    if (row.straightness != null) {
      lines.push(`Rechtheid/vlakheid  ${fmtMm(row.straightness, 2)} mm`);
    }
    if (row.perpendicularity != null) {
      lines.push(`Haaksheid  ${fmtMm(row.perpendicularity, 1)} mm`);
    }
    if (row.symmetry != null) lines.push(`Symmetrie  ${fmtMm(row.symmetry, 1)} mm`);
    lines.push(`Circulaire uitloop  ${fmtMm(row.runout, 1)} mm`);
    return lines.join("\n");
  }, [row]);

  const missing =
    L != null && L < 0.5
      ? "Onder 0,5 mm heeft ISO 2768 geen rij. Zet de afwijking naast de maat."
      : L != null && row == null
        ? "Deze nominale lengte valt buiten de tabellen."
        : null;

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {tx(locale, "Nominale lengte", "Nominal length")}
        </h2>
        <Note>
          Titelblok-default als een maat geen vakje heeft. Geen passing (dat is
          ISO 286). Standaardaanduiding ISO 2768-mK.
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
              <option value="f">f fijn</option>
              <option value="m">m middel</option>
              <option value="c">c grof</option>
              <option value="v">v zeer grof</option>
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
                  label: "Lineair ±",
                  value:
                    row.linearTol != null
                      ? `±${fmtMm(row.linearTol, 2)} mm`
                      : "geen tabelwaarde",
                },
                {
                  label: "Radii / afschuining ±",
                  value:
                    row.radiusTol != null
                      ? `±${fmtMm(row.radiusTol, 1)} mm`
                      : "geen tabelwaarde",
                },
                {
                  label: "Hoek ±",
                  value: row.angularTol ? `±${fmtAngle(row.angularTol)}` : "geen tabelwaarde",
                },
                {
                  label: "Tekening",
                  value: row.callout,
                },
                {
                  label: "Rechtheid / vlakheid",
                  value:
                    row.straightness != null
                      ? `${fmtMm(row.straightness, 2)} mm`
                      : "buiten 2768-2",
                },
                {
                  label: "Haaksheid",
                  value:
                    row.perpendicularity != null
                      ? `${fmtMm(row.perpendicularity, 1)} mm`
                      : "buiten 2768-2",
                },
                {
                  label: "Symmetrie",
                  value:
                    row.symmetry != null ? `${fmtMm(row.symmetry, 1)} mm` : "buiten 2768-2",
                },
                {
                  label: "Circulaire uitloop",
                  value: `${fmtMm(row.runout, 1)} mm`,
                },
              ]}
            />
            <CopyResult text={copy} />
          </>
        ) : (
          <p className="mt-5 text-sm text-muted">
            {missing ?? "Voer een nominale lengte in."}
          </p>
        )}
      </CalcPanel>

      <p className="mt-8 text-sm leading-relaxed text-muted">
        ISO 2768-2 (H/K/L) is in 2021 ingetrokken; opvolger is ISO 22081. Hier
        nog getoond omdat tekeningen nog mK zetten. Dit is geen ISO 286 en geen
        vervanging van een maat in een vakje. Bron:{" "}
        <a
          href="https://www.rodinmachining.nl/media/53qdjv2u/iso-2768-normblad-rodin-machining.pdf"
          className="text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Rodin ISO 2768-blad
        </a>
        ; lineair nagekeken bij{" "}
        <a
          href="https://www.hoekman-rvs.nl/toleranties-cnc-kanten-iso-2768"
          className="text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Hoekman
        </a>{" "}
        (hoek/vorm niet van Hoekman — onvolledig t.o.v. de norm).
      </p>

      <LinearTable active={row?.linearIndex ?? null} klass={linear} />
      <RadiusTable active={row?.radiusIndex ?? null} klass={linear} />
      <AngleTable active={row?.angularIndex ?? null} klass={linear} />
      <StraightTable active={row?.straightIndex ?? null} klass={form} />
      <FormTable
        title="Haaksheid (ISO 2768-2)"
        data={PERPENDICULARITY}
        active={row?.formRangeIndex ?? null}
        klass={form}
      />
      <FormTable
        title="Symmetrie (ISO 2768-2)"
        data={SYMMETRY}
        active={row?.formRangeIndex ?? null}
        klass={form}
      />
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          Circulaire uitloop
        </h2>
        <Note>Onafhankelijk van de nominale lengte. Geen ±.</Note>
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
}: {
  active: number | null;
  klass: LinearClass;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        Lineaire maten (ISO 2768-1)
      </h2>
      <Note>Toelaatbare afwijkingen in mm. Onder 0,5 mm: afwijking naast de maat.</Note>
      <div className="table-scroll mt-4">
        <table className="ref-table">
          <thead>
            <tr>
              <th>Nominale lengte</th>
              <th>f</th>
              <th>m</th>
              <th>c</th>
              <th>v</th>
            </tr>
          </thead>
          <tbody>
            {LINEAR_LABELS.map((label, i) => (
              <tr key={label} className={i === active ? "is-active" : ""}>
                <th scope="row">{label}</th>
                <td>{dash(LINEAR.f[i] ?? null)}</td>
                <td>{dash(LINEAR.m[i] ?? null)}</td>
                <td>{dash(LINEAR.c[i] ?? null)}</td>
                <td>{dash(LINEAR.v[i] ?? null)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RadiusTable({
  active,
  klass: _klass,
}: {
  active: number | null;
  klass: LinearClass;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        Radii en afschuinhoogten
      </h2>
      <div className="table-scroll mt-4">
        <table className="ref-table">
          <thead>
            <tr>
              <th>Nominale lengte</th>
              <th>f / m</th>
              <th>c / v</th>
            </tr>
          </thead>
          <tbody>
            {RADIUS_LABELS.map((label, i) => (
              <tr key={label} className={i === active ? "is-active" : ""}>
                <th scope="row">{label}</th>
                <td>±{fmtMm(RADIUS.fm[i] ?? 0, 1)}</td>
                <td>±{fmtMm(RADIUS.cv[i] ?? 0, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AngleTable({
  active,
  klass: _klass,
}: {
  active: number | null;
  klass: LinearClass;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        Hoekmaten (kortere been)
      </h2>
      <div className="table-scroll mt-4">
        <table className="ref-table">
          <thead>
            <tr>
              <th>Kortere been</th>
              <th>f / m</th>
              <th>c</th>
              <th>v</th>
            </tr>
          </thead>
          <tbody>
            {ANGULAR_LABELS.map((label, i) => (
              <tr key={label} className={i === active ? "is-active" : ""}>
                <th scope="row">{label}</th>
                <td>±{fmtAngle(ANGULAR.f[i] ?? ANGULAR.f[0])}</td>
                <td>±{fmtAngle(ANGULAR.c[i] ?? ANGULAR.c[0])}</td>
                <td>±{fmtAngle(ANGULAR.v[i] ?? ANGULAR.v[0])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StraightTable({
  active,
  klass: _klass,
}: {
  active: number | null;
  klass: FormClass;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        Rechtheid en vlakheid (ISO 2768-2)
      </h2>
      <Note>Waarden in mm, geen ±.</Note>
      <div className="table-scroll mt-4">
        <table className="ref-table">
          <thead>
            <tr>
              <th>Nominale lengte</th>
              <th>H</th>
              <th>K</th>
              <th>L</th>
            </tr>
          </thead>
          <tbody>
            {STRAIGHTNESS_LABELS.map((label, i) => (
              <tr key={label} className={i === active ? "is-active" : ""}>
                <th scope="row">{label}</th>
                <td>{fmtMm(STRAIGHTNESS.H[i] ?? 0, 2)}</td>
                <td>{fmtMm(STRAIGHTNESS.K[i] ?? 0, 2)}</td>
                <td>{fmtMm(STRAIGHTNESS.L[i] ?? 0, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FormTable({
  title,
  data,
  active,
  klass: _klass,
}: {
  title: string;
  data: { H: readonly number[]; K: readonly number[]; L: readonly number[] };
  active: number | null;
  klass: FormClass;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <Note>Waarden in mm, geen ±.</Note>
      <div className="table-scroll mt-4">
        <table className="ref-table">
          <thead>
            <tr>
              <th>Nominale lengte</th>
              <th>H</th>
              <th>K</th>
              <th>L</th>
            </tr>
          </thead>
          <tbody>
            {FORM_RANGE_LABELS.map((label, i) => (
              <tr key={label} className={i === active ? "is-active" : ""}>
                <th scope="row">{label}</th>
                <td>{fmtMm(data.H[i] ?? 0, 1)}</td>
                <td>{fmtMm(data.K[i] ?? 0, 1)}</td>
                <td>{fmtMm(data.L[i] ?? 0, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
