/** Euler-knik van een slanke staaf. mm, N, N/mm² (=MPa) intern. */

export type EndConditionId = "hh" | "fc" | "ff" | "fp";

/**
 * Vier klassieke Euler-gevallen. k is de knikfactor: L_eff = k · L.
 * kDesign is de gangbare ontwerpwaarde (AISC/Shigley) die rekening houdt met
 * onvolmaakte inklemming — ideale volledige inklemming bestaat niet in de praktijk.
 */
export const END_CONDITIONS: {
  id: EndConditionId;
  k: number;
  kDesign: number;
  label: string;
  labelEn: string;
}[] = [
  { id: "hh", k: 1, kDesign: 1, label: "Scharnier – scharnier", labelEn: "Pinned – pinned" },
  { id: "fc", k: 2, kDesign: 2.1, label: "Ingeklemd – vrij", labelEn: "Fixed – free" },
  { id: "ff", k: 0.5, kDesign: 0.65, label: "Ingeklemd – ingeklemd", labelEn: "Fixed – fixed" },
  { id: "fp", k: 0.699, kDesign: 0.8, label: "Ingeklemd – scharnier", labelEn: "Fixed – pinned" },
];

export function kFor(id: EndConditionId): number {
  return END_CONDITIONS.find((c) => c.id === id)?.k ?? 1;
}

/** The design k (AISC/Shigley), used for the actual F_cr calculation — see kFor for the theoretical value shown for reference. */
export function kDesignFor(id: EndConditionId): number {
  return END_CONDITIONS.find((c) => c.id === id)?.kDesign ?? 1;
}

export type SectionKind = "rond" | "buis" | "rechthoek" | "vierkant" | "koker";

export const SECTION_KINDS: { id: SectionKind; label: string; labelEn: string }[] = [
  { id: "rond", label: "Rond, massief", labelEn: "Round, solid" },
  { id: "buis", label: "Rond, buis", labelEn: "Round, tube" },
  { id: "rechthoek", label: "Rechthoekig", labelEn: "Rectangular" },
  { id: "vierkant", label: "Vierkant", labelEn: "Square" },
  { id: "koker", label: "Koker (rechthoekig, hol)", labelEn: "Box section (rectangular, hollow)" },
];

/**
 * Rp02: indicatieve vloeigrens (N/mm²). Staal/RVS/messing zijn conservatief
 * voor hun groep. Aluminium was dat niet: 240 N/mm² is 6082-T6 (een harde
 * temper); zacht/gegloeid aluminium (1000/3000/5000-serie) ligt op 30-100
 * N/mm² — de yield-waarschuwing zou daar niet afgaan. Nu expliciet
 * legering-specifiek gelabeld i.p.v. generiek "Aluminium".
 */
export const MATERIALS_E: { id: string; label: string; labelEn: string; E: number; Rp02: number }[] = [
  { id: "staal", label: "Staal", labelEn: "Steel", E: 210000, Rp02: 235 },
  { id: "rvs", label: "RVS", labelEn: "Stainless steel", E: 193000, Rp02: 215 },
  { id: "aluminium", label: "Aluminium (6082-T6)", labelEn: "Aluminium (6082-T6)", E: 70000, Rp02: 240 },
  { id: "messing", label: "Messing", labelEn: "Brass", E: 100000, Rp02: 130 },
  { id: "kunststof", label: "Kunststof (indicatief)", labelEn: "Plastic (indicative)", E: 3000, Rp02: 50 },
];

export function eFor(id: string): number {
  return MATERIALS_E.find((m) => m.id === id)?.E ?? MATERIALS_E[0].E;
}

export function rp02For(id: string): number {
  return MATERIALS_E.find((m) => m.id === id)?.Rp02 ?? MATERIALS_E[0].Rp02;
}

/** I (mm⁴) en A (mm²) uit doorsnede-afmetingen (mm). Rechthoek en koker geven I_min (zwakke as). */
export function sectionProps(
  kind: SectionKind,
  dims: { D?: number; d?: number; b?: number; h?: number; a?: number; t?: number },
): { I: number; A: number } | null {
  switch (kind) {
    case "rond": {
      const D = dims.D;
      if (D == null || !(D > 0)) return null;
      return { I: (Math.PI * D ** 4) / 64, A: (Math.PI * D ** 2) / 4 };
    }
    case "buis": {
      const D = dims.D;
      const d = dims.d;
      if (D == null || d == null || !(D > 0) || d < 0 || d >= D) return null;
      return {
        I: (Math.PI * (D ** 4 - d ** 4)) / 64,
        A: (Math.PI * (D ** 2 - d ** 2)) / 4,
      };
    }
    case "rechthoek": {
      const b = dims.b;
      const h = dims.h;
      if (b == null || h == null || !(b > 0) || !(h > 0)) return null;
      const Ix = (b * h ** 3) / 12;
      const Iy = (h * b ** 3) / 12;
      return { I: Math.min(Ix, Iy), A: b * h };
    }
    case "vierkant": {
      const a = dims.a;
      if (a == null || !(a > 0)) return null;
      return { I: a ** 4 / 12, A: a * a };
    }
    case "koker": {
      const b = dims.b;
      const h = dims.h;
      const t = dims.t;
      if (b == null || h == null || t == null || !(b > 0) || !(h > 0) || !(t > 0)) return null;
      const bi = b - 2 * t;
      const hi = h - 2 * t;
      if (bi <= 0 || hi <= 0) return null;
      const Ix = (b * h ** 3 - bi * hi ** 3) / 12;
      const Iy = (h * b ** 3 - hi * bi ** 3) / 12;
      return { I: Math.min(Ix, Iy), A: b * h - bi * hi };
    }
    default:
      return null;
  }
}

/** Afstand (mm) van de neutrale lijn tot de uiterste vezel, voor dezelfde (zwakke) as als sectionProps' I. */
export function extremeFiber(
  kind: SectionKind,
  dims: { D?: number; d?: number; b?: number; h?: number; a?: number; t?: number },
): number | null {
  switch (kind) {
    case "rond":
    case "buis": {
      const D = dims.D;
      if (D == null || !(D > 0)) return null;
      return D / 2;
    }
    case "rechthoek":
    case "koker": {
      const b = dims.b;
      const h = dims.h;
      if (b == null || h == null || !(b > 0) || !(h > 0)) return null;
      return Math.min(b, h) / 2;
    }
    case "vierkant": {
      const a = dims.a;
      if (a == null || !(a > 0)) return null;
      return a / 2;
    }
    default:
      return null;
  }
}

export type BucklingResult = {
  I: number;
  A: number;
  Leff: number;
  i: number;
  lambda: number;
  Fcr: number;
  sigmaCr: number;
  safety: number | null;
};

/** Kritieke Euler-last F_cr = π² E I / L_eff². Geldig voor grote slankheid (elastisch knikken). */
export function computeBuckling({
  L,
  k,
  E,
  I,
  A,
  F,
}: {
  L: number;
  k: number;
  E: number;
  I: number;
  A: number;
  F: number | null;
}): BucklingResult | null {
  if (!(L > 0) || !(k > 0) || !(E > 0) || !(I > 0) || !(A > 0)) return null;
  const Leff = k * L;
  const i = Math.sqrt(I / A);
  const lambda = Leff / i;
  const Fcr = (Math.PI ** 2 * E * I) / Leff ** 2;
  const sigmaCr = Fcr / A;
  const safety = F != null && F > 0 ? Fcr / F : null;
  return { I, A, Leff, i, lambda, Fcr, sigmaCr, safety };
}

/**
 * Grensslankheid λ_grens = π·√(E / Rp0,2) — de slankheid waaronder Euler de
 * sterkte overschat, per materiaal. Voor staal ≈ 94 (dicht bij de vuistregel
 * 100); voor aluminium ≈ 54 — bijna de helft, dus een vaste grens van 100
 * waarschuwt bij aluminium veel te laat.
 */
export function lambdaLimit(E: number, rp02: number): number {
  return Math.PI * Math.sqrt(E / rp02);
}

export type ColumnCapacity = BucklingResult & {
  /** λ below the Euler validity limit: the bar squashes before it buckles. */
  belowEulerLimit: boolean;
  /** π·√(E/Rp0,2) for this material. */
  lambdaLim: number;
  /** A · Rp0,2 — the plastic squash load. */
  squashLoad: number;
  /** Which mechanism sets the reported F_cr. */
  governing: "euler" | "plooien";
};

/**
 * Euler F_cr, capped at the squash load where Euler does not apply.
 *
 * Below λ_grens the bar yields before it buckles, and π²EI/L² runs away from
 * reality fast — for a Ø20 RVS bar at L = 100 mm Euler says ~1 496 kN against
 * a squash load of ~68 kN, a factor of 22. Reporting the Euler number there
 * is optimistic in the direction that hurts, so F_cr is capped at A·Rp0,2 and
 * the caller is told which mechanism governs.
 *
 * Deliberately the SAME hard cap the pneumatic-cilinder rod check uses (it now
 * calls this function) rather than a Tetmajer/Johnson curve through the
 * transition: two tools giving different answers for one bar is the failure
 * the 4 Sept audit raised as H-6, and shared code is what keeps them equal. A
 * transition curve would be more accurate between the regimes, but it has to
 * land in both tools at once.
 */
export function columnCapacity({
  L,
  k,
  E,
  I,
  A,
  F,
  rp02,
}: {
  L: number;
  k: number;
  E: number;
  I: number;
  A: number;
  F: number | null;
  rp02: number;
}): ColumnCapacity | null {
  const raw = computeBuckling({ L, k, E, I, A, F });
  if (!raw || !(rp02 > 0)) return null;
  const lambdaLim = lambdaLimit(E, rp02);
  const belowEulerLimit = raw.lambda < lambdaLim;
  const squashLoad = A * rp02;
  const Fcr = belowEulerLimit ? Math.min(raw.Fcr, squashLoad) : raw.Fcr;
  return {
    ...raw,
    Fcr,
    sigmaCr: Fcr / A,
    safety: F != null && F > 0 ? Fcr / F : null,
    belowEulerLimit,
    lambdaLim,
    squashLoad,
    governing: Fcr === squashLoad && belowEulerLimit ? "plooien" : "euler",
  };
}

export function fmtN(n: number) {
  if (Math.abs(n) >= 1000) {
    return n.toLocaleString("nl-NL", { maximumFractionDigits: 0 });
  }
  return n.toLocaleString("nl-NL", { maximumFractionDigits: 1 });
}

export function fmtDotComma(n: number, digits: number) {
  return n.toFixed(digits).replace(".", ",");
}

export function copyLine(r: BucklingResult, kLabel: string) {
  const safetyPart = r.safety != null ? `, S=${fmtDotComma(r.safety, 2)}` : "";
  return `F_cr=${fmtN(r.Fcr)} N, σ_cr=${fmtDotComma(r.sigmaCr, 1)} N/mm², λ=${fmtDotComma(r.lambda, 1)} (${kLabel})${safetyPart}`;
}
