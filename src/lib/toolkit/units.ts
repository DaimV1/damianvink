export type CategoryId =
  | "lengte"
  | "oppervlakte"
  | "volume"
  | "massa"
  | "kracht"
  | "druk"
  | "temperatuur"
  | "snelheid"
  | "koppel"
  | "vermogen"
  | "energie"
  | "hoek";

export type Unit = {
  id: string;
  symbol: string;
  name: string;
  nameEn: string;
  /** Multiply (value + offset) by toBase to reach the category base. */
  toBase: number;
  offset?: number;
  system: "si" | "imp" | "other";
};

export type Category = {
  id: CategoryId;
  label: string;
  base: string;
  note: string;
  defaultFrom: string;
  defaultTo: string;
  units: Unit[];
};

const INCH = 0.0254;
const FOOT = 0.3048;
const LB = 0.45359237;
const LBF = 4.4482216152605;
const G0 = 9.80665;

export const CATEGORIES: Category[] = [
  {
    id: "lengte",
    label: "Lengte",
    base: "m",
    defaultFrom: "in",
    defaultTo: "mm",
    note: "Inch is exact 25,4 mm (CGPM 1959 / ISO 1).",
    units: [
      { id: "nm", symbol: "nm", name: "nanometer", nameEn: "nanometer", toBase: 1e-9, system: "si" },
      { id: "um", symbol: "µm", name: "micrometer", nameEn: "micrometer", toBase: 1e-6, system: "si" },
      { id: "mm", symbol: "mm", name: "millimeter", nameEn: "millimeter", toBase: 1e-3, system: "si" },
      { id: "cm", symbol: "cm", name: "centimeter", nameEn: "centimeter", toBase: 1e-2, system: "si" },
      { id: "dm", symbol: "dm", name: "decimeter", nameEn: "decimeter", toBase: 1e-1, system: "si" },
      { id: "m", symbol: "m", name: "meter", nameEn: "meter", toBase: 1, system: "si" },
      { id: "km", symbol: "km", name: "kilometer", nameEn: "kilometer", toBase: 1e3, system: "si" },
      { id: "mil", symbol: "mil", name: "thou / mil", nameEn: "thou / mil", toBase: INCH / 1000, system: "imp" },
      { id: "in", symbol: "in", name: "inch", nameEn: "inch", toBase: INCH, system: "imp" },
      { id: "ft", symbol: "ft", name: "foot", nameEn: "foot", toBase: FOOT, system: "imp" },
      { id: "yd", symbol: "yd", name: "yard", nameEn: "yard", toBase: 0.9144, system: "imp" },
      { id: "mi", symbol: "mi", name: "mile", nameEn: "mile", toBase: 1609.344, system: "imp" },
    ],
  },
  {
    id: "oppervlakte",
    label: "Oppervlakte",
    base: "m²",
    defaultFrom: "in2",
    defaultTo: "mm2",
    note: "Vierkante inch = (25,4 mm)².",
    units: [
      { id: "mm2", symbol: "mm²", name: "vierkante millimeter", nameEn: "square millimeter", toBase: 1e-6, system: "si" },
      { id: "cm2", symbol: "cm²", name: "vierkante centimeter", nameEn: "square centimeter", toBase: 1e-4, system: "si" },
      { id: "dm2", symbol: "dm²", name: "vierkante decimeter", nameEn: "square decimeter", toBase: 1e-2, system: "si" },
      { id: "m2", symbol: "m²", name: "vierkante meter", nameEn: "square meter", toBase: 1, system: "si" },
      { id: "in2", symbol: "in²", name: "square inch", nameEn: "square inch", toBase: INCH * INCH, system: "imp" },
      { id: "ft2", symbol: "ft²", name: "square foot", nameEn: "square foot", toBase: FOOT * FOOT, system: "imp" },
    ],
  },
  {
    id: "volume",
    label: "Volume",
    base: "m³",
    defaultFrom: "dm3",
    defaultTo: "l",
    note: "1 dm³ = 1 L exact. US gallon = 231 in³; UK gallon = 4,54609 L.",
    units: [
      { id: "mm3", symbol: "mm³", name: "kubieke millimeter", nameEn: "cubic millimeter", toBase: 1e-9, system: "si" },
      { id: "cm3", symbol: "cm³", name: "kubieke centimeter", nameEn: "cubic centimeter", toBase: 1e-6, system: "si" },
      { id: "ml", symbol: "mL", name: "milliliter", nameEn: "milliliter", toBase: 1e-6, system: "si" },
      { id: "dm3", symbol: "dm³", name: "kubieke decimeter", nameEn: "cubic decimeter", toBase: 1e-3, system: "si" },
      { id: "l", symbol: "L", name: "liter", nameEn: "liter", toBase: 1e-3, system: "si" },
      { id: "m3", symbol: "m³", name: "kubieke meter", nameEn: "cubic meter", toBase: 1, system: "si" },
      { id: "in3", symbol: "in³", name: "cubic inch", nameEn: "cubic inch", toBase: INCH ** 3, system: "imp" },
      { id: "ft3", symbol: "ft³", name: "cubic foot", nameEn: "cubic foot", toBase: FOOT ** 3, system: "imp" },
      { id: "gal-us", symbol: "gal (US)", name: "US gallon", nameEn: "US gallon", toBase: 0.003785411784, system: "imp" },
      { id: "gal-uk", symbol: "gal (UK)", name: "imperial gallon", nameEn: "imperial gallon", toBase: 0.00454609, system: "imp" },
    ],
  },
  {
    id: "massa",
    label: "Massa",
    base: "kg",
    defaultFrom: "lb",
    defaultTo: "kg",
    note: "Pond (lb) is exact 0,45359237 kg.",
    units: [
      { id: "mg", symbol: "mg", name: "milligram", nameEn: "milligram", toBase: 1e-6, system: "si" },
      { id: "g", symbol: "g", name: "gram", nameEn: "gram", toBase: 1e-3, system: "si" },
      { id: "kg", symbol: "kg", name: "kilogram", nameEn: "kilogram", toBase: 1, system: "si" },
      { id: "t", symbol: "t", name: "ton", nameEn: "tonne", toBase: 1e3, system: "si" },
      { id: "oz", symbol: "oz", name: "ounce", nameEn: "ounce", toBase: LB / 16, system: "imp" },
      { id: "lb", symbol: "lb", name: "pound", nameEn: "pound", toBase: LB, system: "imp" },
    ],
  },
  {
    id: "kracht",
    label: "Kracht",
    base: "N",
    defaultFrom: "lbf",
    defaultTo: "n",
    note: "1 kgf = 9,80665 N (standaardvalversnelling). 1 lbf = 4,4482216152605 N.",
    units: [
      { id: "n", symbol: "N", name: "newton", nameEn: "newton", toBase: 1, system: "si" },
      { id: "kn", symbol: "kN", name: "kilonewton", nameEn: "kilonewton", toBase: 1e3, system: "si" },
      { id: "kgf", symbol: "kgf", name: "kilogramkracht", nameEn: "kilogram-force", toBase: G0, system: "other" },
      { id: "lbf", symbol: "lbf", name: "pound-force", nameEn: "pound-force", toBase: LBF, system: "imp" },
    ],
  },
  {
    id: "druk",
    label: "Druk",
    base: "Pa",
    defaultFrom: "psi",
    defaultTo: "bar",
    note: "1 bar = 10⁵ Pa. 1 psi = 6 894,757 Pa. 1 atm = 101 325 Pa.",
    units: [
      { id: "pa", symbol: "Pa", name: "pascal", nameEn: "pascal", toBase: 1, system: "si" },
      { id: "kpa", symbol: "kPa", name: "kilopascal", nameEn: "kilopascal", toBase: 1e3, system: "si" },
      { id: "mpa", symbol: "MPa", name: "megapascal", nameEn: "megapascal", toBase: 1e6, system: "si" },
      { id: "bar", symbol: "bar", name: "bar", nameEn: "bar", toBase: 1e5, system: "si" },
      { id: "mbar", symbol: "mbar", name: "millibar", nameEn: "millibar", toBase: 100, system: "si" },
      { id: "psi", symbol: "psi", name: "pound per square inch", nameEn: "pound per square inch", toBase: 6894.757293168, system: "imp" },
      { id: "atm", symbol: "atm", name: "standaardatmosfeer", nameEn: "standard atmosphere", toBase: 101325, system: "other" },
    ],
  },
  {
    id: "temperatuur",
    label: "Temperatuur",
    base: "K",
    defaultFrom: "c",
    defaultTo: "k",
    note: "T/K = t/°C + 273,15. T/K = (t/°F + 459,67) × 5/9.",
    units: [
      { id: "c", symbol: "°C", name: "Celsius", nameEn: "Celsius", toBase: 1, offset: 273.15, system: "si" },
      { id: "k", symbol: "K", name: "kelvin", nameEn: "kelvin", toBase: 1, system: "si" },
      { id: "f", symbol: "°F", name: "Fahrenheit", nameEn: "Fahrenheit", toBase: 5 / 9, offset: 459.67, system: "imp" },
    ],
  },
  {
    id: "snelheid",
    label: "Snelheid",
    base: "m/s",
    defaultFrom: "mph",
    defaultTo: "ms",
    note: "1 km/h = 1/3,6 m/s. 1 mph = 0,44704 m/s.",
    units: [
      { id: "mms", symbol: "mm/s", name: "millimeter per seconde", nameEn: "millimeter per second", toBase: 1e-3, system: "si" },
      { id: "ms", symbol: "m/s", name: "meter per seconde", nameEn: "meter per second", toBase: 1, system: "si" },
      { id: "kmh", symbol: "km/h", name: "kilometer per uur", nameEn: "kilometer per hour", toBase: 1 / 3.6, system: "si" },
      { id: "ins", symbol: "in/s", name: "inch per second", nameEn: "inch per second", toBase: INCH, system: "imp" },
      { id: "fts", symbol: "ft/s", name: "foot per second", nameEn: "foot per second", toBase: FOOT, system: "imp" },
      { id: "mph", symbol: "mph", name: "mile per hour", nameEn: "mile per hour", toBase: 0.44704, system: "imp" },
    ],
  },
  {
    id: "koppel",
    label: "Koppel",
    base: "N·m",
    defaultFrom: "lbfft",
    defaultTo: "nm",
    note: "1 N·m = 1000 N·mm. 1 lbf·ft ≈ 1,355818 N·m.",
    units: [
      { id: "nmm", symbol: "N·mm", name: "newtonmillimeter", nameEn: "newton-millimeter", toBase: 1e-3, system: "si" },
      { id: "nm", symbol: "N·m", name: "newtonmeter", nameEn: "newton-meter", toBase: 1, system: "si" },
      { id: "knm", symbol: "kN·m", name: "kilonewtonmeter", nameEn: "kilonewton-meter", toBase: 1e3, system: "si" },
      { id: "kgfm", symbol: "kgf·m", name: "kilogramkrachtmeter", nameEn: "kilogram-force meter", toBase: G0, system: "other" },
      { id: "lbfin", symbol: "lbf·in", name: "pound-force inch", nameEn: "pound-force inch", toBase: LBF * INCH, system: "imp" },
      { id: "lbfft", symbol: "lbf·ft", name: "pound-force foot", nameEn: "pound-force foot", toBase: LBF * FOOT, system: "imp" },
    ],
  },
  {
    id: "vermogen",
    label: "Vermogen",
    base: "W",
    defaultFrom: "hp",
    defaultTo: "kw",
    note: "pk is metrisch (735,49875 W). hp is mechanisch (745,69987 W).",
    units: [
      { id: "w", symbol: "W", name: "watt", nameEn: "watt", toBase: 1, system: "si" },
      { id: "kw", symbol: "kW", name: "kilowatt", nameEn: "kilowatt", toBase: 1e3, system: "si" },
      { id: "pk", symbol: "pk", name: "paardenkracht (metrisch)", nameEn: "metric horsepower", toBase: 735.49875, system: "other" },
      { id: "hp", symbol: "hp", name: "horsepower (mechanisch)", nameEn: "horsepower (mechanical)", toBase: 745.69987158227, system: "imp" },
    ],
  },
  {
    id: "energie",
    label: "Energie",
    base: "J",
    defaultFrom: "kwh",
    defaultTo: "kj",
    note: "1 cal = 4,184 J (thermochemisch). 1 kWh = 3,6 MJ.",
    units: [
      { id: "j", symbol: "J", name: "joule", nameEn: "joule", toBase: 1, system: "si" },
      { id: "kj", symbol: "kJ", name: "kilojoule", nameEn: "kilojoule", toBase: 1e3, system: "si" },
      { id: "wh", symbol: "Wh", name: "wattuur", nameEn: "watt-hour", toBase: 3600, system: "si" },
      { id: "kwh", symbol: "kWh", name: "kilowattuur", nameEn: "kilowatt-hour", toBase: 3.6e6, system: "si" },
      { id: "cal", symbol: "cal", name: "calorie", nameEn: "calorie", toBase: 4.184, system: "other" },
      { id: "kcal", symbol: "kcal", name: "kilocalorie", nameEn: "kilocalorie", toBase: 4184, system: "other" },
      { id: "btu", symbol: "Btu", name: "British thermal unit", nameEn: "British thermal unit", toBase: 1055.05585262, system: "imp" },
    ],
  },
  {
    id: "hoek",
    label: "Hoek",
    base: "rad",
    defaultFrom: "deg",
    defaultTo: "rad",
    note: "2π rad = 360°. 1 gon = π/200 rad.",
    units: [
      { id: "deg", symbol: "°", name: "graad", nameEn: "degree", toBase: Math.PI / 180, system: "si" },
      { id: "rad", symbol: "rad", name: "radiaal", nameEn: "radian", toBase: 1, system: "si" },
      { id: "gon", symbol: "gon", name: "gon / grade", nameEn: "gon / grade", toBase: Math.PI / 200, system: "other" },
    ],
  },
];

export function categoryById(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export function unitById(category: Category, id: string) {
  return category.units.find((u) => u.id === id) ?? category.units[0];
}

export function toBase(value: number, unit: Unit) {
  return (value + (unit.offset ?? 0)) * unit.toBase;
}

export function fromBase(base: number, unit: Unit) {
  return base / unit.toBase - (unit.offset ?? 0);
}

export function convert(value: number, from: Unit, to: Unit) {
  return fromBase(toBase(value, from), to);
}

export function parseQty(raw: string): number | null {
  const t = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (t === "" || t === "-" || t === "+" || t === "." || t === "-.") return null;
  if (!/^[+-]?\d*\.?\d+(e[+-]?\d+)?$/i.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Keep one decimal mark and optional leading minus; allow scientific e. */
export function sanitizeQtyInput(raw: string) {
  let v = raw.replace(/[^\d.,eE+-]/g, "");
  const neg = v.startsWith("-");
  v = (neg ? "-" : "") + v.replace(/[+-]/g, "").replace(/e/gi, "e");
  const e = v.toLowerCase().indexOf("e", 1);
  if (e >= 0) {
    const head = sanitizePlain(v.slice(neg ? 1 : 0, e));
    let exp = v.slice(e + 1).replace(/[^0-9+-]/g, "");
    if (exp.startsWith("+") || exp.startsWith("-")) {
      exp = exp[0] + exp.slice(1).replace(/[+-]/g, "").slice(0, 3);
    } else {
      exp = exp.slice(0, 3);
    }
    return `${neg ? "-" : ""}${head}e${exp}`;
  }
  return `${neg ? "-" : ""}${sanitizePlain(v.slice(neg ? 1 : 0))}`;
}

function sanitizePlain(v: string) {
  v = v.replace(/[^0-9.,]/g, "");
  const sep = v.search(/[.,]/);
  if (sep >= 0) {
    const mark = v[sep];
    const [head, tail = ""] = (v.slice(0, sep + 1) + v.slice(sep + 1).replace(/[.,]/g, "")).split(mark);
    return `${head.slice(0, 12)}${mark}${tail.slice(0, 12)}`;
  }
  return v.slice(0, 16);
}

export function formatQty(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs < 1e-6 || abs >= 1e7) {
    const [mant, exp] = n.toExponential(6).split("e");
    return `${trimZeros(mant).replace(".", ",")}·10${exp.replace("+", "")}`;
  }
  let digits = 6;
  if (abs >= 100) digits = 4;
  if (abs >= 1000) digits = 3;
  if (abs >= 10000) digits = 2;
  return trimZeros(n.toFixed(digits)).replace(".", ",");
}

function trimZeros(s: string) {
  if (!s.includes(".")) return s;
  return s.replace(/\.?0+$/, "");
}

export function factorLine(from: Unit, to: Unit) {
  if (from.offset != null || to.offset != null) return null;
  const f = convert(1, from, to);
  return `1 ${from.symbol} = ${formatQty(f)} ${to.symbol}`;
}
