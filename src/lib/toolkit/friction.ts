export type FrictionClass = "geolied" | "tabel" | "droog";

/** Schaal op VDI 2230-1 A1 (μ = 0,14). Alleen Ma; Fv blijft de beoogde voorspanning. */
export const FRICTION = {
  geolied: { id: "geolied" as const, mu: "≈ 0,10", label: "Geolied", factor: 0.72, note: "Richtwaarde. Gesmeerd (olie/vet). Geen MoS2-coating." },
  tabel: { id: "tabel" as const, mu: "0,14", label: "Tabel VDI A1", factor: 1, note: "VDI 2230-1 tabel A1, droog / licht geolied, μ = 0,14." },
  droog: { id: "droog" as const, mu: "≈ 0,20", label: "Droog, onbehandeld", factor: 1.35, note: "Richtwaarde. Ruwe of onbehandelde draad. Controleer in VDI 2230." },
} as const;

export function scaleMa(ma: number, friction: FrictionClass) {
  return Math.round(ma * FRICTION[friction].factor * 10) / 10;
}
