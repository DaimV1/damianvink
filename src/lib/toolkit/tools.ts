export const TOOLS = [
  {
    id: "passingen",
    href: "/denk/toolkit/passingen",
    short: "Passingen",
    title: "Passingen",
    standard: "ISO 286",
    blurb: "Voorkeurpassingen tot Ø 50 mm. JS7 = ±IT7/2, niet afgerond.",
  },
  {
    id: "spiebaan",
    href: "/denk/toolkit/spiebaan-toleranties",
    short: "Spiebaan",
    title: "Spiebaan-toleranties",
    standard: "DIN 6885",
    blurb: "Spiemaat, t₁/t₂. As-Ø: boven de ondergrens t/m de bovengrens.",
  },
  {
    id: "lager",
    href: "/denk/toolkit/lagerpassingen",
    short: "Lager",
    title: "Lagerpassingen",
    standard: "SKF · ISO 286",
    blurb: "Groefkogellagers: vast/los, SKF-klassen tot Ø 50 mm.",
  },
  {
    id: "seeger",
    href: "/denk/toolkit/seegerring-groef",
    short: "Seeger",
    title: "Seegerringgroef",
    standard: "DIN 471 / 472",
    blurb: "Groef d₂, breedte b en diepte t op as of in boring, tot Ø 100 mm.",
  },
  {
    id: "oring",
    href: "/denk/toolkit/o-ringgroef",
    short: "O-ring",
    title: "O-ringgroef",
    standard: "ISO 3601",
    blurb: "ISO-koorden 1,80–7,00 mm: groef t / b, radiaal en axiaal.",
  },
  {
    id: "bronnen",
    href: "/denk/toolkit/bronnen",
    short: "CAD",
    title: "CAD-bibliotheken",
    standard: "Bronnen",
    blurb: "3D-modellen, componenten, plaatwerk en naslag.",
  },
] as const;

export type ToolId = (typeof TOOLS)[number]["id"];

export const DIAMETER_KEY = "toolkit-diameter";

export function readStoredDiameter(fallback = "20") {
  if (typeof window === "undefined") return fallback;
  const raw = sessionStorage.getItem(DIAMETER_KEY);
  if (raw && /^\d{1,4}$/.test(raw)) return raw;
  return fallback;
}

export function storeDiameter(value: string) {
  if (typeof window === "undefined") return;
  if (/^\d{1,4}$/.test(value)) sessionStorage.setItem(DIAMETER_KEY, value);
}