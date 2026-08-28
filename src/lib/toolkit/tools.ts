/** Switcher uses `short`; ISO 2768 is labeled Toleranties. */
export const TOOLS = [
  {
    id: "eenheden",
    href: "/toolkit/eenheden",
    short: "Eenheden",
    title: "Eenheden",
    standard: "SI · imperial",
    kind: "rekenhulp",
    related: ["motor", "bevestigers"],
    blurb: "Inch ↔ mm, °C ↔ K, dm³ ↔ L, lbf ↔ N, psi ↔ bar. SI en imperial.",
  },
  {
    id: "passingen",
    href: "/toolkit/passingen",
    short: "Passingen",
    title: "Passingen",
    standard: "ISO 286",
    kind: "rekenhulp",
    related: ["lager", "iso2768"],
    blurb: "Voorkeurpassingen tot Ø 50 mm. JS7 = ±IT7/2, niet afgerond.",
  },
  {
    id: "iso2768",
    href: "/toolkit/iso-2768",
    short: "Toleranties",
    title: "Algemene toleranties",
    standard: "ISO 2768",
    kind: "rekenhulp",
    related: ["passingen"],
    blurb: "Titelblok-default f/m/c/v en H/K/L. Geen passing (dat is ISO 286).",
  },
  {
    id: "spiebaan",
    href: "/toolkit/spiebaan-toleranties",
    short: "Spiebaan",
    title: "Spiebaan-toleranties",
    standard: "DIN 6885",
    kind: "rekenhulp",
    related: ["passingen"],
    blurb: "Spiemaat, t₁/t₂. As-Ø: boven de ondergrens t/m de bovengrens.",
  },
  {
    id: "lager",
    href: "/toolkit/lagerpassingen",
    short: "Lager",
    title: "Lagerpassingen",
    standard: "SKF · ISO 286",
    kind: "rekenhulp",
    related: ["passingen"],
    blurb: "Groefkogellagers: vast/los, SKF-klassen tot Ø 50 mm.",
  },
  {
    id: "seeger",
    href: "/toolkit/seegerring-groef",
    short: "Seeger",
    title: "Seegerringgroef",
    standard: "DIN 471 / 472",
    kind: "rekenhulp",
    related: ["oring"],
    blurb: "Groef d₂, breedte b en diepte t op as of in boring, tot Ø 100 mm.",
  },
  {
    id: "bevestigers",
    href: "/toolkit/bevestigers",
    short: "Bouten",
    title: "Bevestigingsmateriaal",
    standard: "ISO 273 · VDI 2230",
    kind: "rekenhulp",
    related: ["bronnen"],
    blurb: "M3–M24: doorlaat, zeskant/inbus, aandraaimoment 8.8 / 10.9 / 12.9.",
  },
  {
    id: "oring",
    href: "/toolkit/o-ringgroef",
    short: "O-ring",
    title: "O-ringgroef",
    standard: "ISO 3601",
    kind: "rekenhulp",
    related: ["seeger"],
    blurb: "ISO-koorden 1,80–7,00 mm: groef t / b, radiaal en axiaal.",
  },
  {
    id: "motor",
    href: "/toolkit/motorspecificatie",
    short: "Motor",
    title: "Motorspecificatie",
    standard: "P = F·v",
    kind: "rekenhulp",
    related: ["eenheden", "bronnen"],
    blurb:
      "Rollenbaan/band/helling/hijsen: n, F, T, P en volgende IEC-kW-stap. SEW kiest het aggregaat.",
  },
  {
    id: "kanten",
    href: "/toolkit/kanten",
    short: "Kanten",
    title: "Richtlijnen kanten",
    standard: "247TailorSteel",
    kind: "rekenhulp",
    related: ["bronnen"],
    blurb:
      "Haaks/scherp: Ri, minimale beenlengte w/s, Z-buiging. Shop-spec Sophia, geen ISO.",
  },
  {
    id: "bronnen",
    href: "/toolkit/bronnen",
    short: "CAD",
    title: "CAD-bibliotheken",
    standard: "Bronnen",
    kind: "naslag",
    related: ["bevestigers", "kanten"],
    blurb: "3D-modellen, componenten, plaatwerk en naslag.",
  },
] as const;

export type ToolId = (typeof TOOLS)[number]["id"];

export const DIAMETER_KEY = "toolkit-diameter";

export function readStoredDiameter({
  min,
  max,
  fallback = "20",
}: {
  min?: number;
  max?: number;
  fallback?: string;
} = {}) {
  if (typeof window === "undefined") {
    return inRange(fallback, min, max) ? fallback : "";
  }
  const raw = sessionStorage.getItem(DIAMETER_KEY);
  if (raw && /^\d{1,4}$/.test(raw) && inRange(raw, min, max)) return raw;
  if (inRange(fallback, min, max)) return fallback;
  return "";
}

function inRange(raw: string, min?: number, max?: number) {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return false;
  if (min != null && n < min) return false;
  if (max != null && n > max) return false;
  return true;
}

export function storeDiameter(value: string) {
  if (typeof window === "undefined") return;
  if (/^\d{1,4}$/.test(value)) sessionStorage.setItem(DIAMETER_KEY, value);
}

export function rangeHint(d: number, minExclusive: number | null, min: number, max: number, unit = "mm") {
  if (minExclusive != null && d <= minExclusive) {
    return `Ø ${d} ${unit} valt buiten de tabel. De eerste rij begint boven ${minExclusive} ${unit} (niet ${minExclusive} zelf). Open de norm; neem geen naburige rij.`;
  }
  if (d < min || d > max) {
    return `Ø ${d} ${unit} valt buiten het werkblad (${min} t/m ${max} ${unit}). Geen naburige rij gebruiken — sla de norm of catalogus na.`;
  }
  return null;
}
