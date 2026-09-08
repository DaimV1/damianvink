/**
 * Real astronomical figures (rounded, common reference values). The animation
 * itself is schematic — see ORBIT_RADIUS_PX / orbitPeriodSeconds in
 * solar-system.tsx — but everything a user reads in the info panel here is a
 * real number, not a value invented for the visual.
 */
export type PlanetId =
  | "mercurius"
  | "venus"
  | "aarde"
  | "mars"
  | "jupiter"
  | "saturnus"
  | "uranus"
  | "neptunus";

export type Planet = {
  id: PlanetId;
  name: string;
  nameEn: string;
  color: string;
  distanceAu: number;
  periodDays: number;
  dayHours: number;
  diameterKm: number;
  moons: string;
  ring?: boolean;
  factNl: string;
  factEn: string;
};

export const SUN = {
  name: "Zon",
  nameEn: "Sun",
  color: "#f4b350",
  diameterKm: 1_392_700,
  surfaceTempC: 5500,
  factNl: "G-type ster; bevat ruim 99,8% van de massa van het zonnestelsel.",
  factEn: "G-type star; holds over 99.8% of the solar system's mass.",
};

export const PLANETS: Planet[] = [
  {
    id: "mercurius",
    name: "Mercurius",
    nameEn: "Mercury",
    color: "#9c9891",
    distanceAu: 0.39,
    periodDays: 88,
    dayHours: 1407.6,
    diameterKm: 4_879,
    moons: "0",
    factNl: "Grootste temperatuurverschil van het zonnestelsel: van -180°C tot 430°C.",
    factEn: "Largest temperature swing in the solar system: from -180°C to 430°C.",
  },
  {
    id: "venus",
    name: "Venus",
    nameEn: "Venus",
    color: "#d9b382",
    distanceAu: 0.72,
    periodDays: 224.7,
    dayHours: 5832.5,
    diameterKm: 12_104,
    moons: "0",
    factNl: "Draait retrograde; een dag op Venus duurt langer dan haar jaar.",
    factEn: "Rotates retrograde; a day on Venus lasts longer than its year.",
  },
  {
    id: "aarde",
    name: "Aarde",
    nameEn: "Earth",
    color: "#4d7ec2",
    distanceAu: 1.0,
    periodDays: 365.25,
    dayHours: 24,
    diameterKm: 12_742,
    moons: "1",
    factNl: "Enige bekende planeet met vloeibaar oppervlaktewater en leven.",
    factEn: "Only known planet with liquid surface water and life.",
  },
  {
    id: "mars",
    name: "Mars",
    nameEn: "Mars",
    color: "#c1592f",
    distanceAu: 1.52,
    periodDays: 687,
    dayHours: 24.6,
    diameterKm: 6_779,
    moons: "2",
    factNl: "Olympus Mons: grootste vulkaan van het zonnestelsel, ca. 22 km hoog.",
    factEn: "Olympus Mons: the solar system's largest volcano, ~22 km high.",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    nameEn: "Jupiter",
    color: "#d8ae7e",
    distanceAu: 5.2,
    periodDays: 4_331,
    dayHours: 9.9,
    diameterKm: 139_820,
    moons: "95+",
    factNl: "Grote Rode Vlek: een storm groter dan de aarde, al eeuwen actief.",
    factEn: "Great Red Spot: a storm larger than Earth, active for centuries.",
  },
  {
    id: "saturnus",
    name: "Saturnus",
    nameEn: "Saturn",
    color: "#e3c98f",
    distanceAu: 9.58,
    periodDays: 10_747,
    dayHours: 10.7,
    diameterKm: 116_460,
    moons: "146+",
    ring: true,
    factNl: "Dichtheid lager dan water — Saturnus zou drijven in een genoeg grote oceaan.",
    factEn: "Density lower than water — Saturn would float in a large enough ocean.",
  },
  {
    id: "uranus",
    name: "Uranus",
    nameEn: "Uranus",
    color: "#9fd4d4",
    distanceAu: 19.2,
    periodDays: 30_589,
    dayHours: 17.2,
    diameterKm: 50_724,
    moons: "28",
    factNl: "Rotatie-as helt ~98° — de planeet rolt vrijwel op haar zij om de zon.",
    factEn: "Axial tilt ~98° — the planet essentially rolls around the sun on its side.",
  },
  {
    id: "neptunus",
    name: "Neptunus",
    nameEn: "Neptune",
    color: "#3f5fc9",
    distanceAu: 30.05,
    periodDays: 59_800,
    dayHours: 16.1,
    diameterKm: 49_244,
    moons: "16",
    factNl: "Snelste winden van het zonnestelsel: tot ca. 2.100 km/u.",
    factEn: "Fastest winds in the solar system: up to ~2,100 km/h.",
  },
];

export function planetName(planet: Planet, locale: "nl" | "en") {
  return locale === "en" ? planet.nameEn : planet.name;
}

export function planetFact(planet: Planet, locale: "nl" | "en") {
  return locale === "en" ? planet.factEn : planet.factNl;
}

export function fmtAu(au: number) {
  return au.toLocaleString("nl-NL", { maximumFractionDigits: 2 });
}

export function fmtKm(km: number) {
  return Math.round(km).toLocaleString("nl-NL");
}

export function fmtMillionKm(au: number) {
  return Math.round(au * 149.6).toLocaleString("nl-NL");
}

export function fmtPeriod(days: number, locale: "nl" | "en") {
  if (days < 500) {
    return locale === "en" ? `${Math.round(days)} days` : `${Math.round(days)} dagen`;
  }
  const years = days / 365.25;
  const n = years.toLocaleString("nl-NL", { maximumFractionDigits: 1 });
  return locale === "en" ? `${n} years` : `${n} jaar`;
}

export function fmtDayLength(hours: number, locale: "nl" | "en") {
  if (hours < 48) {
    const n = hours.toLocaleString("nl-NL", { maximumFractionDigits: 1 });
    return locale === "en" ? `${n} h` : `${n} u`;
  }
  const days = hours / 24;
  const n = days.toLocaleString("nl-NL", { maximumFractionDigits: 1 });
  return locale === "en" ? `${n} Earth days` : `${n} aardse dagen`;
}
