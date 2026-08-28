import { useMemo, useState } from "react";
import {
  DUTY_DEFAULT_MU,
  FAMILY_HINT,
  IEC_KW,
  copyLine,
  fmtDotComma,
  fmtKw,
  sizeMotor,
  toMetersPerSecond,
  type Duty,
  type SpeedUnit,
} from "@/lib/toolkit/motor";
import { fmtNl } from "@/lib/utils";
import {
  CalcPanel,
  CopyResult,
  Field,
  Note,
  NumInput,
  ResultGrid,
  SelectInput,
} from "./calc-ui";

function parseNum(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function fmtInput(n: number) {
  const s = n.toFixed(4).replace(/\.?0+$/, "");
  return s.replace(".", ",");
}

export function MotorCalc() {
  const [speed, setSpeed] = useState("30");
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>("m/min");
  const [diameterMm, setDiameterMm] = useState("100");
  const [mass, setMass] = useState("500");
  const [duty, setDuty] = useState<Duty>("rollenbaan");
  const [mu, setMu] = useState("0,03");
  const [alpha, setAlpha] = useState("0");
  const [eta, setEta] = useState("0,85");
  const [fb, setFb] = useState("1,2");
  const [accel, setAccel] = useState("0");

  function onDuty(next: string) {
    const d = next as Duty;
    setDuty(d);
    const def = DUTY_DEFAULT_MU[d];
    if (def != null) setMu(fmtInput(def));
  }

  function onUnit(next: string) {
    const unit = next as SpeedUnit;
    const n = parseNum(speed);
    if (n != null && n > 0 && unit !== speedUnit) {
      setSpeed(
        unit === "m/s" ? fmtInput(n / 60) : fmtInput(n * 60),
      );
    }
    setSpeedUnit(unit);
  }

  const vRaw = parseNum(speed);
  const dRaw = parseNum(diameterMm);
  const mRaw = parseNum(mass);
  const muRaw = parseNum(mu);
  const alphaRaw = parseNum(alpha);
  const etaRaw = parseNum(eta);
  const fbRaw = parseNum(fb);
  const aRaw = parseNum(accel);

  const v_ms = vRaw != null ? toMetersPerSecond(vRaw, speedUnit) : null;
  const D_m = dRaw != null ? dRaw / 1000 : null;

  const result =
    v_ms != null &&
    D_m != null &&
    mRaw != null &&
    muRaw != null &&
    etaRaw != null &&
    fbRaw != null
      ? sizeMotor({
          v_ms,
          D_m,
          mass_kg: mRaw,
          duty,
          mu: muRaw,
          alpha_deg: alphaRaw ?? 0,
          eta: etaRaw,
          fb: fbRaw,
          a_ms2: aRaw ?? 0,
        })
      : null;

  const copy = useMemo(() => (result ? copyLine(result) : ""), [result]);

  const showMuMain = duty === "helling";
  const showMuAdvanced = duty !== "hijsen" && duty !== "helling";
  const showAlpha = duty === "helling";

  return (
    <>
      <CalcPanel>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
          Rekenhulp
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          Bedrijfspunt van de rol
        </h2>
        <Note>
          Horizontale aangedreven rol of trommel. Berekent n, F, T en P. SEW
          kiest het aggregaat — dit is geen cataloguskeuze en geen typecode.
          g = 9,81 m/s².
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Transportsnelheid">
            <div className="flex gap-2">
              <NumInput id="motor-speed" value={speed} onChange={setSpeed} />
              <SelectInput value={speedUnit} onChange={onUnit}>
                <option value="m/min">m/min</option>
                <option value="m/s">m/s</option>
              </SelectInput>
            </div>
          </Field>
          <Field label="Roldiameter (mm)">
            <NumInput
              id="motor-diameter"
              value={diameterMm}
              onChange={setDiameterMm}
            />
          </Field>
          <Field label="Massa (kg)">
            <NumInput id="motor-mass" value={mass} onChange={setMass} />
          </Field>
          <Field label="Bedrijf">
            <SelectInput value={duty} onChange={onDuty}>
              <option value="rollenbaan">Rollenbaan (μ = 0,03)</option>
              <option value="band">Band (μ = 0,10)</option>
              <option value="helling">Helling (μ + α°)</option>
              <option value="hijsen">Hijsen</option>
            </SelectInput>
          </Field>
          {showMuMain ? (
            <Field label="μ">
              <NumInput id="motor-mu" value={mu} onChange={setMu} />
            </Field>
          ) : null}
          {showAlpha ? (
            <Field label="Helling α (°)">
              <NumInput id="motor-alpha" value={alpha} onChange={setAlpha} />
            </Field>
          ) : null}
        </div>

        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium text-ink">
            Geavanceerd (η, f_b, μ, a)
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Rendement η">
              <NumInput id="motor-eta" value={eta} onChange={setEta} />
            </Field>
            <Field label="Bedrijfsfactor f_b">
              <NumInput id="motor-fb" value={fb} onChange={setFb} />
            </Field>
            {showMuAdvanced ? (
              <Field label="μ (overschrijven)">
                <NumInput id="motor-mu-adv" value={mu} onChange={setMu} />
              </Field>
            ) : null}
            <Field label="Versnelling a (m/s²)">
              <NumInput id="motor-accel" value={accel} onChange={setAccel} />
            </Field>
          </div>
          <Note>
            Standaard η = 0,85 en f_b = 1,2. Versnelling staat uit (a = 0). Bij
            hijsen telt μ niet mee.
          </Note>
        </details>

        {result ? (
          <>
            <p className="mt-5 text-sm text-muted">
              {result.familyHint}. 4-polig 50 Hz is een familie-indicatie, geen
              gemeten toerental.
            </p>
            <ResultGrid
              items={[
                {
                  label: "n_rol",
                  value: `${fmtDotComma(result.n_rpm, 1)} min⁻¹`,
                },
                { label: "F", value: `${fmtNl(result.F, 0)} N` },
                { label: "T", value: `${fmtDotComma(result.T, 2)} Nm` },
                {
                  label: "P_as",
                  value: `${fmtDotComma(result.P_as_kW, 3)} kW`,
                },
                {
                  label: "P_motor",
                  value: `${fmtDotComma(result.P_motor_kW, 3)} kW`,
                },
                {
                  label: "IEC 60034",
                  value: result.iecKw != null
                    ? `${fmtKw(result.iecKw)} kW`
                    : result.iecOverRange
                      ? `boven ${fmtKw(IEC_KW[IEC_KW.length - 1])} kW — geen stap in deze reeks`
                      : "—",
                },
                {
                  label: "i (4-polig 50 Hz)",
                  value:
                    result.i == null
                      ? "—"
                      : `≈ ${fmtDotComma(result.i, 1)}`,
                },
                { label: "Reductorfamilie", value: result.familyHint },
              ]}
            />
            <CopyResult text={copy} />
          </>
        ) : (
          <p className="mt-5 text-sm text-muted">
            Vul een snelheid groter dan 0, een roldiameter groter dan 0 en een
            massa groter dan 0 in.
          </p>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          SEW kiest het aggregaat
        </h2>
        <Note>
          Deze rekenhulp bepaalt het bedrijfspunt (n, F, T, P). SEW selecteert
          het reductoraggregaat. DRN.. IE3 is de huidige SEW-wisselstroomlijn,
          geen voorraadkeuze. Geen verzonnen typecodes.
        </Note>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
          <li>
            <a
              href="https://www.sew-eurodrive.nl/en_us/online_support/"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Drive selection / Online Support
            </a>
            : application → recommendations, zonder login. Neem conveyor/roller,
            P, n en T mee.
          </li>
          <li>
            <a
              href="https://www.sew-eurodrive.nl/products/software/project-planning/product-configurator/product-configurator.html"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              DriveConfigurator
            </a>
            : projectplanning en productconfigurator.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          Bedrijfsformules
        </h2>
        <Note>
          SI intern. n_rol = v / (π D), T = F · D/2, P_as = F · v, P_motor =
          P_as / η · f_b. Optioneel + m a.
        </Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Bedrijf</th>
                <th>F</th>
                <th>μ-default</th>
                <th>Familie</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["rollenbaan", "m g μ", "0,03"],
                  ["band", "m g μ", "0,10"],
                  ["helling", "m g μ + m g sin(α)", "0,03"],
                  ["hijsen", "m g", "—"],
                ] as const
              ).map(([id, formula, muDef]) => (
                <tr key={id} className={id === duty ? "is-active" : ""}>
                  <th scope="row">{id}</th>
                  <td>{formula}</td>
                  <td>{muDef}</td>
                  <td>{FAMILY_HINT[id]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          IEC 60034 kW-stappen
        </h2>
        <Note>
          Volgende catalogusmotor, niet het berekende asvermogen. Boven 315 kW
          geen stap in deze reeks.
        </Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>P (kW)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {IEC_KW.map((kw) => (
                <tr
                  key={kw}
                  className={kw === result?.iecKw ? "is-active" : ""}
                >
                  <th scope="row">{fmtKw(kw)}</th>
                  <td>{kw === result?.iecKw ? "volgende stap" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          P = F·v. IEC 60034 kW-reeks (R20). Naslag, geen SEW-catalogus. Open
          Online Support of DriveConfigurator voor het aggregaat.
        </p>
      </section>
    </>
  );
}
