import type { Locale } from "@/lib/i18n/locale";

type Faq = { q: string; a: string };
type PageCopy = {
  title: string;
  accent: string;
  crumb: string;
  lede: string;
  faq?: Faq[];
};

const pages = {
  index: {
    nl: {
      title: "Engineering toolkit.",
      accent: "toolkit.",
      crumb: "Toolkit",
      lede: "Rekenhulp en naslag voor machinebouw. Zoek op norm, trefwoord of eenheid; open een tool voor de rekenhulp bovenaan en de tabel eronder.",
    },
    en: {
      title: "Engineering toolkit.",
      accent: "toolkit.",
      crumb: "Toolkit",
      lede: "Calculators and tables for machine building. Search by standard, keyword or unit; open a tool for the calculator on top and the table below.",
    },
  },
  eenheden: {
    nl: {
      title: "Eenheden omrekenen.",
      accent: "omrekenen.",
      crumb: "Eenheden",
      lede: "Imperial naar metrisch en terug, plus SI onderling: lengte, volume, massa, kracht, druk, temperatuur, koppel, vermogen. Rekenhulp eerst; alle eenheden van de gekozen grootheid eronder.",
      faq: [
        { q: "Hoeveel mm is 1 inch?", a: "Exact 25,4 mm. Dat is de internationale inch sinds 1959 (ISO 1). 1 ft = 12 in = 304,8 mm." },
        { q: "Is 1 dm³ hetzelfde als 1 L?", a: "Ja. De liter is gedefinieerd als 1 dm³, dus 0,001 m³. 1 mL = 1 cm³." },
        { q: "Celsius naar kelvin?", a: "T/K = t/°C + 273,15. 0 °C = 273,15 K; 20 °C = 293,15 K. Fahrenheit: T/K = (t/°F + 459,67) × 5/9." },
        { q: "pk of hp?", a: "pk is de metrische paardenkracht (735,49875 W). hp is mechanical horsepower (745,69987 W). Voor IEC-motorstappen gebruik je kW, niet pk." },
        { q: "US gallon of UK gallon?", a: "US liquid gallon = 231 in³ = 3,785411784 L. Imperial (UK) gallon = 4,54609 L. Die twee zijn niet inwisselbaar." },
      ],
    },
    en: {
      title: "Convert units.",
      accent: "units.",
      crumb: "Units",
      lede: "Imperial to metric and back, plus SI among themselves: length, volume, mass, force, pressure, temperature, torque, power. Calculator first; every unit of the selected quantity below.",
      faq: [
        { q: "How many mm is 1 inch?", a: "Exactly 25.4 mm. That is the international inch since 1959 (ISO 1). 1 ft = 12 in = 304.8 mm." },
        { q: "Is 1 dm³ the same as 1 L?", a: "Yes. The litre is defined as 1 dm³, so 0.001 m³. 1 mL = 1 cm³." },
        { q: "Celsius to kelvin?", a: "T/K = t/°C + 273.15. 0 °C = 273.15 K; 20 °C = 293.15 K. Fahrenheit: T/K = (t/°F + 459.67) × 5/9." },
        { q: "pk or hp?", a: "pk is metric horsepower (735.49875 W). hp is mechanical horsepower (745.69987 W). For IEC motor steps use kW, not pk." },
        { q: "US gallon or UK gallon?", a: "US liquid gallon = 231 in³ = 3.785411784 L. Imperial (UK) gallon = 4.54609 L. They are not interchangeable." },
      ],
    },
  },
  passingen: {
    nl: {
      title: "Passingen (ISO 286).",
      accent: "(ISO 286).",
      crumb: "Passingen",
      lede: "ISO 286, eenheidsgatstelsel. Rekenhulp eerst: nominale Ø en passing. Daaronder de tabellen. Diameters: boven 3 mm tot en met 50 mm.",
      faq: [
        { q: "Wat is het eenheidsgatstelsel in ISO 286?", a: "Het gat krijgt een H-afwijking (ondermaat 0). De as (c, d, f, g, h, k, n, p, s) bepaalt of de passing los, overgang of vast is." },
        { q: "Wat betekent H7/g6?", a: "Losse passing: gat H7, as g6. Altijd speling. Typisch voor glijdende of nauwkeurig verschuifbare delen." },
        { q: "Waarom staan 30–40 mm en 40–50 mm apart?", a: "IT-graden zijn gelijk voor 30–50 mm (H7 = 25 µm). De fundamentele afwijking van c wijzigt bij 40 mm, daarom staat H11/c11 in twee rijen." },
        { q: "Is H7/p6 altijd overmaat?", a: "Nee. Tot 18 mm is de maximale speling 0 µm (lijnpassing mogelijk). Vanaf 18–30 mm is max. speling negatief: altijd interferentie." },
        { q: "Zijn de waarden in mm of µm?", a: "Tabellen en rekenhulp staan in mm, omgerekend uit ISO 286 (µm). JS7 toont vier decimalen waar IT7 oneven is." },
      ],
    },
    en: {
      title: "Fits (ISO 286).",
      accent: "(ISO 286).",
      crumb: "Fits",
      lede: "ISO 286, hole-basis system. Calculator first: nominal Ø and fit. Tables below. Diameters: above 3 mm through 50 mm.",
      faq: [
        { q: "What is the hole-basis system in ISO 286?", a: "The hole gets an H deviation (lower deviation 0). The shaft (c, d, f, g, h, k, n, p, s) decides whether the fit is clearance, transition or interference." },
        { q: "What does H7/g6 mean?", a: "Clearance fit: hole H7, shaft g6. Always clearance. Typical for sliding or accurately movable parts." },
        { q: "Why are 30–40 mm and 40–50 mm separate?", a: "IT grades are the same for 30–50 mm (H7 = 25 µm). The fundamental deviation of c changes at 40 mm, so H11/c11 has two rows." },
        { q: "Is H7/p6 always interference?", a: "No. Up to 18 mm the maximum clearance is 0 µm (line fit possible). From 18–30 mm max. clearance is negative: always interference." },
        { q: "Are the values in mm or µm?", a: "Tables and calculator are in mm, converted from ISO 286 (µm). JS7 shows four decimals where IT7 is odd." },
      ],
    },
  },
  cilinder: {
    nl: {
      title: "Pneumatische cilinder.",
      accent: "cilinder.",
      crumb: "Cilinder",
      lede: "Berekent de ISO-boring bij last en druk. F = p·A, dubbelwerkend. Festo of SMC kiest het type. Geen knikberekening.",
      faq: [
        { q: "Wat is F = p·A?", a: "Theoretische kracht: druk (manometer, in N/mm²) maal zuigeroppervlak. 1 bar = 0,1 N/mm². Geen wrijving, geen afdichtingverlies." },
        { q: "6 bar of 6 bar absoluut?", a: "Manometerdruk (overdruk). 6 bar op de reduceerventiel is 6 bar gauge. Luchtverbruik per cyclus gebruikt p+1 als benadering van absoluut." },
        { q: "Waarom lastfactor 1,25?", a: "Vuistregel voor wrijving en dynamiek. Geen normwaarde. Verhoog bij verticale last, stoppen op de stang, of onbekende wrijving. S = 1 is puur theoretisch." },
        { q: "ISO 15552 of 6432?", a: "Volgt uit de boring. Ø8–25 is ISO 6432 (rond, mini). Ø32–320 is ISO 15552 (profiel). De kleinste boring die F·S haalt, wint." },
        { q: "Kiest deze tool een Festo- of SMC-type?", a: "Nee. Alleen de ISO-boring en basisstang. Geen typecode, geen demping, geen sensorsleuf. Lange slag op drukstang: knik in de catalogus van de fabrikant." },
      ],
    },
    en: {
      title: "Pneumatic cylinder.",
      accent: "cylinder.",
      crumb: "Cylinder",
      lede: "ISO bore from load and pressure. F = p·A, double acting. Festo or SMC picks the type. No buckling check.",
      faq: [
        { q: "What is F = p·A?", a: "Theoretical force: gauge pressure (N/mm²) times piston area. 1 bar = 0.1 N/mm². No friction, no seal loss." },
        { q: "6 bar or 6 bar absolute?", a: "Gauge pressure. 6 bar on the regulator is 6 bar gauge. Air per cycle uses p+1 as an absolute approximation." },
        { q: "Why load factor 1.25?", a: "Rule of thumb for friction and dynamics. Not a standard value. Raise it for vertical load, stopping on the rod, or unknown friction. S = 1 is purely theoretical." },
        { q: "ISO 15552 or 6432?", a: "Follows from the bore. Ø8–25 is ISO 6432 (round, mini). Ø32–320 is ISO 15552 (profile). The smallest bore that covers F·S wins." },
        { q: "Does this pick a Festo or SMC type?", a: "No. ISO bore and basic rod only. No type code, no cushioning, no sensor slot. Long stroke in compression: buckling in the manufacturer catalogue." },
      ],
    },
  },
} as const satisfies Record<string, Record<Locale, PageCopy>>;

export function toolkitCopy<K extends keyof typeof pages>(id: K, locale: Locale): PageCopy {
  return pages[id][locale];
}
