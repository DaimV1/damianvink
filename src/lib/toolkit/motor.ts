export const G = 9.81;
export const N_4POLE_50HZ = 1450;

/** IEC 60034 / R20 motor kW sequence. Stop at 315 — do not invent further steps. */
export const IEC_KW = [
  0.12, 0.18, 0.25, 0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15,
  18.5, 22, 30, 37, 45, 55, 75, 90, 110, 132, 160, 200, 250, 315,
] as const;

export type Duty = "rollenbaan" | "band" | "helling" | "hijsen";
export type SpeedUnit = "m/min" | "m/s";

export const DUTY_DEFAULT_MU: Record<Duty, number | null> = {
  rollenbaan: 0.03,
  band: 0.1,
  helling: 0.03,
  hijsen: null,
};

/** Family hint only — not a SEW type code. */
export const FAMILY_HINT: Record<Duty, string> = {
  rollenbaan: "typisch F (parallelas) of K (kegelwiel)",
  band: "typisch F (parallelas) of K (kegelwiel)",
  helling: "F of K",
  hijsen: "vaak R of K",
};

export const FAMILY_HINT_EN: Record<Duty, string> = {
  rollenbaan: "typically F (parallel shaft) or K (bevel-helical)",
  band: "typically F (parallel shaft) or K (bevel-helical)",
  helling: "F or K",
  hijsen: "often R or K",
};

export function toMetersPerSecond(value: number, unit: SpeedUnit) {
  return unit === "m/min" ? value / 60 : value;
}

export function nextIecKw(pMotorKw: number): number | null {
  if (!(pMotorKw > 0)) return null;
  for (const step of IEC_KW) {
    if (step >= pMotorKw) return step;
  }
  return null;
}

export function tractionForceN({
  mass_kg,
  duty,
  mu,
  alpha_deg = 0,
  a_ms2 = 0,
}: {
  mass_kg: number;
  duty: Duty;
  mu: number;
  alpha_deg?: number;
  a_ms2?: number;
}) {
  const m = mass_kg;
  let F: number;
  if (duty === "hijsen") {
    F = m * G;
  } else if (duty === "helling") {
    const alphaRad = (alpha_deg * Math.PI) / 180;
    F = m * G * (mu * Math.cos(alphaRad) + Math.sin(alphaRad));
  } else {
    F = m * G * mu;
  }
  return F + m * a_ms2;
}

export type MotorInput = {
  v_ms: number;
  D_m: number;
  mass_kg: number;
  duty: Duty;
  mu: number;
  alpha_deg?: number;
  eta: number;
  fb: number;
  a_ms2?: number;
};

export type MotorResult = {
  n_rpm: number;
  F: number;
  T: number;
  P_as_W: number;
  P_as_kW: number;
  P_motor_W: number;
  P_motor_kW: number;
  iecKw: number | null;
  iecOverRange: boolean;
  i: number | null;
  familyHint: string;
  duty: Duty;
};

export function sizeMotor(input: MotorInput): MotorResult | null {
  const {
    v_ms,
    D_m,
    mass_kg,
    duty,
    mu,
    alpha_deg = 0,
    eta,
    fb,
    a_ms2 = 0,
  } = input;
  if (!(v_ms > 0) || !(D_m > 0) || !(mass_kg > 0) || !(eta > 0) || !(fb > 0)) {
    return null;
  }

  const n_rpm = (v_ms / (Math.PI * D_m)) * 60;
  const F = tractionForceN({ mass_kg, duty, mu, alpha_deg, a_ms2 });
  const T = F * (D_m / 2);
  const P_as_W = F * v_ms;
  const P_motor_W = (P_as_W / eta) * fb;
  const P_as_kW = P_as_W / 1000;
  const P_motor_kW = P_motor_W / 1000;
  const iecKw = nextIecKw(P_motor_kW);
  const last = IEC_KW[IEC_KW.length - 1];
  const iecOverRange = P_motor_kW > last;

  return {
    n_rpm,
    F,
    T,
    P_as_W,
    P_as_kW,
    P_motor_W,
    P_motor_kW,
    iecKw,
    iecOverRange,
    i: n_rpm > 0 ? N_4POLE_50HZ / n_rpm : null,
    familyHint: FAMILY_HINT[duty],
    duty,
  };
}

export function fmtDotComma(n: number, digits: number) {
  return n.toFixed(digits).replace(".", ",");
}

export function fmtKw(n: number) {
  const digits = Number.isInteger(n) ? 0 : n < 1 ? 2 : 1;
  return n.toLocaleString("nl-NL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: 2,
  });
}

/** “P=.. kW, n=.. min⁻¹, T=.. Nm, 4-polig 50 Hz, i≈..” */
export function copyLine(r: MotorResult) {
  const p = fmtDotComma(r.P_motor_kW, 3);
  const n = fmtDotComma(r.n_rpm, 1);
  const t = fmtDotComma(r.T, 2);
  const iPart = r.i == null ? "" : `, i≈${fmtDotComma(r.i, 1)}`;
  return `P=${p} kW, n=${n} min⁻¹, T=${t} Nm, 4-polig 50 Hz${iPart}`;
}
