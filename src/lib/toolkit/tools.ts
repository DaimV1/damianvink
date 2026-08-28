/** Switcher uses `short`; ISO 2768 is labeled Toleranties. */
export const TOOLS = [
  {
    id: "eenheden",
    href: "/toolkit/eenheden",
    short: "Eenheden",
    shortEn: "Units",
    title: "Eenheden",
    titleEn: "Units",
    standard: "SI · imperial",
    kind: "rekenhulp",
    related: ["motor", "bevestigers", "cilinder"],
    blurb: "Inch ↔ mm, °C ↔ K, dm³ ↔ L, lbf ↔ N, psi ↔ bar. SI en imperial.",
    blurbEn: "Inch ↔ mm, °C ↔ K, dm³ ↔ L, lbf ↔ N, psi ↔ bar. SI and imperial.",
    tags: ["omrekenen", "inch", "kelvin", "newton", "liter", "units", "convert"],
  },
  {
    id: "passingen",
    href: "/toolkit/passingen",
    short: "Passingen",
    shortEn: "Fits",
    title: "Passingen",
    titleEn: "Fits",
    standard: "ISO 286",
    kind: "rekenhulp",
    related: ["lager", "iso2768"],
    blurb: "Voorkeurpassingen tot Ø 50 mm. JS7 = ±IT7/2, niet afgerond.",
    blurbEn: "Preferred fits to Ø 50 mm. JS7 = ±IT7/2, not rounded.",
    tags: ["h7", "g6", "h6", "js7", "speling", "overmaat", "boring", "fits", "clearance", "interference"],
  },
  {
    id: "iso2768",
    href: "/toolkit/iso-2768",
    short: "Toleranties",
    shortEn: "Tolerances",
    title: "Algemene toleranties",
    titleEn: "General tolerances",
    standard: "ISO 2768",
    kind: "rekenhulp",
    related: ["passingen"],
    blurb: "Titelblok-default f/m/c/v en H/K/L. Geen passing (dat is ISO 286).",
    blurbEn: "Title-block default f/m/c/v and H/K/L. Not a fit (that is ISO 286).",
    tags: ["titelblok", "algemeen", "maat", "title block", "general"],
  },
  {
    id: "spiebaan",
    href: "/toolkit/spiebaan-toleranties",
    short: "Spiebaan",
    shortEn: "Keyway",
    title: "Spiebaan-toleranties",
    titleEn: "Keyway tolerances",
    standard: "DIN 6885",
    kind: "rekenhulp",
    related: ["passingen"],
    blurb: "Spiemaat, t₁/t₂. As-Ø: boven de ondergrens t/m de bovengrens.",
    blurbEn: "Key size, t₁/t₂. Shaft Ø: above the lower bound through the upper bound.",
    tags: ["spie", "naaf", "as", "keyway", "key", "hub", "shaft"],
  },
  {
    id: "lager",
    href: "/toolkit/lagerpassingen",
    short: "Lager",
    shortEn: "Bearing",
    title: "Lagerpassingen",
    titleEn: "Bearing fits",
    standard: "SKF · ISO 286",
    kind: "rekenhulp",
    related: ["passingen"],
    blurb: "Groefkogellagers: vast/los, SKF-klassen tot Ø 50 mm.",
    blurbEn: "Deep-groove ball bearings: locating/non-locating, SKF classes to Ø 50 mm.",
    tags: ["kogel", "vast", "los", "bearing", "locating"],
  },
  {
    id: "seeger",
    href: "/toolkit/seegerring-groef",
    short: "Seeger",
    shortEn: "Circlip",
    title: "Seegerringgroef",
    titleEn: "Circlip groove",
    standard: "DIN 471 / 472",
    kind: "rekenhulp",
    related: ["oring"],
    blurb: "Groef d₂, breedte b en diepte t op as of in boring, tot Ø 100 mm.",
    blurbEn: "Groove d₂, width b and depth t on shaft or in bore, to Ø 100 mm.",
    tags: ["borgveer", "circlip", "as", "boring", "retaining"],
  },
  {
    id: "bevestigers",
    href: "/toolkit/bevestigers",
    short: "Bouten",
    shortEn: "Bolts",
    title: "Bevestigingsmateriaal",
    titleEn: "Fasteners",
    standard: "ISO 273 · VDI 2230",
    kind: "rekenhulp",
    related: ["bronnen"],
    blurb: "M3–M24: doorlaat, zeskant/inbus, aandraaimoment 8.8 / 10.9 / 12.9.",
    blurbEn: "M3–M24: clearance hole, hex/socket, tightening torque 8.8 / 10.9 / 12.9.",
    tags: ["bout", "moer", "moment", "inbus", "m8", "bolt", "torque", "nut"],
  },
  {
    id: "oring",
    href: "/toolkit/o-ringgroef",
    short: "O-ring",
    shortEn: "O-ring",
    title: "O-ringgroef",
    titleEn: "O-ring groove",
    standard: "ISO 3601",
    kind: "rekenhulp",
    related: ["seeger"],
    blurb: "ISO-koorden 1,80–7,00 mm: groef t / b, radiaal en axiaal.",
    blurbEn: "ISO cords 1.80–7.00 mm: groove t / b, radial and axial.",
    tags: ["afdichting", "koord", "radiaal", "axiaal", "seal", "cord"],
  },
  {
    id: "motor",
    href: "/toolkit/motorspecificatie",
    short: "Motor",
    shortEn: "Motor",
    title: "Motorspecificatie",
    titleEn: "Motor specification",
    standard: "P = F·v",
    kind: "rekenhulp",
    related: ["eenheden", "bronnen", "cilinder"],
    blurb:
      "Rollenbaan/band/helling/hijsen: n, F, T, P en volgende IEC-kW-stap. SEW kiest het aggregaat.",
    blurbEn:
      "Roller conveyor/belt/incline/hoist: n, F, T, P and next IEC kW step. SEW selects the gearmotor.",
    tags: ["kw", "koppel", "iec", "aandrijving", "torque", "drive"],
  },
  {
    id: "cilinder",
    href: "/toolkit/cilinder",
    short: "Cilinder",
    shortEn: "Cylinder",
    title: "Pneumatische cilinder",
    titleEn: "Pneumatic cylinder",
    standard: "ISO 15552 · 6432",
    kind: "rekenhulp",
    related: ["motor", "eenheden"],
    blurb:
      "F = p·A, dubbelwerkend. ISO-boring bij last en 6 bar. Geen knik, geen Festo-type.",
    blurbEn:
      "F = p·A, double acting. ISO bore from load at 6 bar. No buckling, no Festo type.",
    tags: ["pneumatiek", "festo", "smc", "bar", "zuiger", "kracht", "pneumatic", "force", "piston"],
  },
  {
    id: "kanten",
    href: "/toolkit/kanten",
    short: "Kanten",
    shortEn: "Bending",
    title: "Richtlijnen kanten",
    titleEn: "Bending guidelines",
    standard: "247TailorSteel",
    kind: "rekenhulp",
    related: ["bronnen"],
    blurb:
      "Haaks/scherp: Ri, minimale beenlengte w/s, Z-buiging. Shop-spec Sophia, geen ISO.",
    blurbEn:
      "Square/acute: Ri, minimum leg length w/s, Z-bend. Sophia shop-spec, not ISO.",
    tags: ["buigen", "plaat", "sophia", "zetwerk", "bending", "sheet"],
  },
  {
    id: "bronnen",
    href: "/toolkit/bronnen",
    short: "CAD",
    shortEn: "CAD",
    title: "CAD-bibliotheken",
    titleEn: "CAD libraries",
    standard: "Bronnen",
    kind: "naslag",
    related: ["bevestigers", "kanten"],
    blurb: "3D-modellen, componenten, plaatwerk en naslag.",
    blurbEn: "3D models, components, sheet metal and references.",
    tags: ["grabcad", "mcmaster", "model"],
  },
] as const;

export type ToolId = (typeof TOOLS)[number]["id"];
export type Tool = (typeof TOOLS)[number];

export function toolTitle(tool: Tool, locale: "nl" | "en") {
  return locale === "en" ? tool.titleEn : tool.title;
}

export function toolShort(tool: Tool, locale: "nl" | "en") {
  return locale === "en" ? tool.shortEn : tool.short;
}

export function toolBlurb(tool: Tool, locale: "nl" | "en") {
  return locale === "en" ? tool.blurbEn : tool.blurb;
}

export function toolKindLabel(tool: Tool, locale: "nl" | "en") {
  if (tool.kind === "naslag") return locale === "en" ? "Reference" : "Naslag";
  return locale === "en" ? "Calculator" : "Rekenhulp";
}

export function foldToolkitQuery(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ø/gi, "o")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function matchTools(query: string): Tool[] {
  const tokens = foldToolkitQuery(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return [...TOOLS];
  return TOOLS.filter((tool) => {
    const hay = foldToolkitQuery(
      [
        tool.title,
        tool.titleEn,
        tool.short,
        tool.shortEn,
        tool.standard,
        tool.blurb,
        tool.blurbEn,
        tool.kind,
        tool.id,
        ...tool.tags,
      ].join(" "),
    );
    return tokens.every((token) => hay.includes(token));
  });
}

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