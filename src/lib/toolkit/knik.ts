/** Euler-knik van een slanke staaf. mm, N, N/mm² (=MPa) intern. */

export type EndConditionId = "hh" | "fc" | "ff" | "fp";

/** Vier klassieke Euler-gevallen. k is de knikfactor: L_eff = k · L. */
export const END_CONDITIONS: {
  id: EndConditionId;
  k: number;
  label: string;
  labelEn: string;
}[] = [
  { id: "hh", k: 1, label: "Scharnier – scharnier", labelEn: "Pinned – pinned" },
  { id: "fc", k: 2, label: "Ingeklemd – vrij", labelEn: "Fixed – free" },
  { id: "ff", k: 0.5, label: "Ingeklemd – ingeklemd", labelEn: "Fixed – fixed" },
  { id: "fp", k: 0.699, label: "Ingeklemd – scharnier", labelEn: "Fixed – pinned" },
];

export function kFor(id: EndConditionId): number {
  return END_CONDITIONS.find((c) => c.id === id)?.k ?? 1;
}

export type SectionKind = "rond" | "buis" | "rechthoek" | "vierkant" | "koker";

export const SECTION_KINDS: { id: SectionKind; label: string; labelEn: string }[] = [
  { id: "rond", label: "Rond, massief", labelEn: "Round, solid" },
  { id: "buis", label: "Rond, buis", labelEn: "Round, tube" },
  { id: "rechthoek", label: "Rechthoekig", labelEn: "Rectangular" },
  { id: "vierkant", label: "Vierkant", labelEn: "Square" },
  { id: "koker", label: "Koker (rechthoekig, hol)", labelEn: "Box section (rectangular, hollow)" },
];

export const MATERIALS_E: { id: string; label: string; labelEn: string; E: number }[] = [
  { id: "staal", label: "Staal", labelEn: "Steel", E: 210000 },
  { id: "rvs", label: "RVS", labelEn: "Stainless steel", E: 193000 },
  { id: "aluminium", label: "Aluminium", labelEn: "Aluminium", E: 70000 },
  { id: "messing", label: "Messing", labelEn: "Brass", E: 100000 },
  { id: "kunststof", label: "Kunststof (indicatief)", labelEn: "Plastic (indicative)", E: 3000 },
];

export function eFor(id: string): number {
  return MATERIALS_E.find((m) => m.id === id)?.E ?? MATERIALS_E[0].E;
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

/** Vuistregel: onder deze slankheid overschat Euler de sterkte (gedrongen staaf). */
export const LAMBDA_WARN = 100;

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
