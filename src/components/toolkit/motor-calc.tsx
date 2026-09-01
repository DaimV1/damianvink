import { useMemo, useState } from "react";
import {
  DUTY_DEFAULT_MU,
  FAMILY_HINT,
  FAMILY_HINT_EN,
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
import { tx, useLocale } from "@/lib/i18n/locale";
import {
  CalcEyebrow,
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
  const { locale } = useLocale();
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
  const familyHintText = tx(locale, FAMILY_HINT[duty], FAMILY_HINT_EN[duty]);
  const dutyLabel: Record<Duty, string> = {
    rollenbaan: tx(locale, "Rollenbaan", "Roller conveyor"),
    band: tx(locale, "Band", "Belt"),
    helling: tx(locale, "Helling", "Incline"),
    hijsen: tx(locale, "Hijsen", "Hoisting"),
  };

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {tx(locale, "Bedrijfspunt van de rol", "Roller operating point")}
        </h2>
        <Note>
          {tx(
            locale,
            "Horizontale aangedreven rol of trommel. Berekent n, F, T en P. Geen cataloguskeuze en geen typecode. g = 9,81 m/s².",
            "Horizontal driven roller or drum. Calculates n, F, T and P. No catalog selection and no type code. g = 9.81 m/s².",
          )}
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={tx(locale, "Transportsnelheid", "Conveyor speed")}>
            <div className="flex gap-2">
              <NumInput id="motor-speed" value={speed} onChange={setSpeed} />
              <SelectInput value={speedUnit} onChange={onUnit}>
                <option value="m/min">m/min</option>
                <option value="m/s">m/s</option>
              </SelectInput>
            </div>
          </Field>
          <Field label={tx(locale, "Roldiameter (mm)", "Roller diameter (mm)")}>
            <NumInput
              id="motor-diameter"
              value={diameterMm}
              onChange={setDiameterMm}
            />
          </Field>
          <Field label={tx(locale, "Massa (kg)", "Mass (kg)")}>
            <NumInput id="motor-mass" value={mass} onChange={setMass} />
          </Field>
          <Field label={tx(locale, "Bedrijf", "Duty")}>
            <SelectInput value={duty} onChange={onDuty}>
              <option value="rollenbaan">{tx(locale, "Rollenbaan (μ = 0,03)", "Roller conveyor (μ = 0.03)")}</option>
              <option value="band">{tx(locale, "Band (μ = 0,10)", "Belt (μ = 0.10)")}</option>
              <option value="helling">{tx(locale, "Helling (μ + α°)", "Incline (μ + α°)")}</option>
              <option value="hijsen">{tx(locale, "Hijsen", "Hoisting")}</option>
            </SelectInput>
          </Field>
          {showMuMain ? (
            <Field label="μ">
              <NumInput id="motor-mu" value={mu} onChange={setMu} />
            </Field>
          ) : null}
          {showAlpha ? (
            <Field label={tx(locale, "Helling α (°)", "Incline α (°)")}>
              <NumInput id="motor-alpha" value={alpha} onChange={setAlpha} />
            </Field>
          ) : null}
        </div>

        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium text-ink">
            {tx(locale, "Geavanceerd (η, f_b, μ, a)", "Advanced (η, f_b, μ, a)")}
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label={tx(locale, "Rendement η", "Efficiency η")}>
              <NumInput id="motor-eta" value={eta} onChange={setEta} />
            </Field>
            <Field label={tx(locale, "Bedrijfsfactor f_b", "Service factor f_b")}>
              <NumInput id="motor-fb" value={fb} onChange={setFb} />
            </Field>
            {showMuAdvanced ? (
              <Field label={tx(locale, "μ (overschrijven)", "μ (override)")}>
                <NumInput id="motor-mu-adv" value={mu} onChange={setMu} />
              </Field>
            ) : null}
            <Field label={tx(locale, "Versnelling a (m/s²)", "Acceleration a (m/s²)")}>
              <NumInput id="motor-accel" value={accel} onChange={setAccel} />
            </Field>
          </div>
          <Note>
            {tx(
              locale,
              "Standaard η = 0,85 en f_b = 1,2. Versnelling staat uit (a = 0). Bij hijsen telt μ niet mee.",
              "Default η = 0.85 and f_b = 1.2. Acceleration is off (a = 0). For hoisting, μ does not count.",
            )}
          </Note>
        </details>

        {result ? (
          <>
            <p className="mt-5 text-sm text-muted">
              {tx(
                locale,
                `${familyHintText}. 4-polig 50 Hz is een familie-indicatie, geen gemeten toerental.`,
                `${familyHintText}. 4-pole 50 Hz is a family indication, not a measured speed.`,
              )}
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
                      ? tx(
                          locale,
                          `boven ${fmtKw(IEC_KW[IEC_KW.length - 1])} kW — geen stap in deze reeks`,
                          `above ${fmtKw(IEC_KW[IEC_KW.length - 1])} kW — no step in this series`,
                        )
                      : "—",
                },
                {
                  label: tx(locale, "i (4-polig 50 Hz)", "i (4-pole 50 Hz)"),
                  value:
                    result.i == null
                      ? "—"
                      : `≈ ${fmtDotComma(result.i, 1)}`,
                },
                {
                  label: tx(locale, "Reductorfamilie", "Gearbox family"),
                  value: familyHintText,
                },
              ]}
            />
            <CopyResult text={copy} />
          </>
        ) : (
          <p className="mt-5 text-sm text-muted">
            {tx(
              locale,
              "Vul een snelheid groter dan 0, een roldiameter groter dan 0 en een massa groter dan 0 in.",
              "Enter a speed greater than 0, a roller diameter greater than 0 and a mass greater than 0.",
            )}
          </p>
        )}
      </CalcPanel>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "Bedrijfsformules", "Duty formulas")}
        </h2>
        <Note>
          {tx(
            locale,
            "SI intern. n_rol = v / (π D), T = F · D/2, P_as = F · v, P_motor = P_as / η · f_b. Optioneel + m a.",
            "SI internally. n_rol = v / (π D), T = F · D/2, P_as = F · v, P_motor = P_as / η · f_b. Optionally + m a.",
          )}
        </Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{tx(locale, "Bedrijf", "Duty")}</th>
                <th>F</th>
                <th>{tx(locale, "μ-default", "μ default")}</th>
                <th>{tx(locale, "Familie", "Family")}</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["rollenbaan", "m g μ", "0,03"],
                  ["band", "m g μ", "0,10"],
                  ["helling", "m g (μ cos(α) + sin(α))", "0,03"],
                  ["hijsen", "m g", "—"],
                ] as const
              ).map(([id, formula, muDef]) => (
                <tr key={id} className={id === duty ? "is-active" : ""}>
                  <th scope="row">{dutyLabel[id]}</th>
                  <td>{formula}</td>
                  <td>{muDef}</td>
                  <td>{tx(locale, FAMILY_HINT[id], FAMILY_HINT_EN[id])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {tx(locale, "Bron μ-defaults:", "Source for μ defaults:")}{" "}
          <a
            href="https://www.engineeringtoolbox.com/rolling-friction-resistance-d_1303.html"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Engineering ToolBox — rolling resistance
          </a>
          {tx(
            locale,
            ". Richtwaarden, geen normtabel — meet of vraag de fabrikant na bij kritieke aandrijvingen.",
            ". Indicative values, not a standard table — measure or check with the manufacturer for critical drives.",
          )}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(locale, "IEC 60034 kW-stappen", "IEC 60034 kW steps")}
        </h2>
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
                  <td>{kw === result?.iecKw ? tx(locale, "volgende stap", "next step") : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {tx(locale, "Bron:", "Source:")} IEC 60034-1 (
          {tx(locale, "voorkeurreeks vermogens, R20", "preferred power ratings, R20 series")}).
        </p>
      </section>
    </>
  );
}
