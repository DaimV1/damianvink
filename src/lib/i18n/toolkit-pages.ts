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
      lede: "Naslagwerk voor werktuigbouwkundigen en constructeurs. Zoek op norm, trefwoord of eenheid; open een tool voor de rekenhulp bovenaan en de tabel eronder.",
    },
    en: {
      title: "Engineering toolkit.",
      accent: "toolkit.",
      crumb: "Toolkit",
      lede: "Reference material for mechanical engineers and machine designers. Search by standard, keyword or unit; open a tool for the calculator on top and the table below.",
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
  iso2768: {
    nl: {
      title: "Algemene toleranties.",
      accent: "toleranties.",
      crumb: "Algemene toleranties",
      lede: "Titelblok-default als een maat geen vakje heeft. Geen passing (dat is ISO 286). Standaardaanduiding ISO 2768-mK.",
      faq: [
        { q: "Wat betekent ISO 2768-mK?", a: "m is de middelste lineaire klasse (2768-1), K de middelste vormklasse (2768-2). Zet die aanduiding in of bij het titelblok." },
        { q: "Wanneer zet ik de afwijking naast de maat?", a: "Onder 0,5 mm heeft de norm geen rij. De afwijking moet dan naast de nominale maat staan. Hetzelfde als een cel in de tabel leeg is (—)." },
        { q: "Is dit een passing?", a: "Nee. Passingen (H7/g6, speling, overmaat) staan onder ISO 286. ISO 2768 is de default als er geen vakje om de maat staat." },
        { q: "2768-2 is ingetrokken. Waarom H/K/L?", a: "Deel 2 is in 2021 ingetrokken; opvolger ISO 22081. Tekeningen zetten nog mK, daarom staat de oude tabel erbij. Geen vervanging van een getolereerde maat in een vakje." },
      ],
    },
    en: {
      title: "General tolerances.",
      accent: "tolerances.",
      crumb: "General tolerances",
      lede: "Title-block default when a dimension has no box. Not a fit (that is ISO 286). Standard designation ISO 2768-mK.",
      faq: [
        { q: "What does ISO 2768-mK mean?", a: "m is the medium linear class (2768-1), K the medium geometrical class (2768-2). Put that designation in or next to the title block." },
        { q: "When do I put the deviation next to the dimension?", a: "Below 0.5 mm the standard has no row. The deviation then sits next to the nominal size. Same if a table cell is empty (—)." },
        { q: "Is this a fit?", a: "No. Fits (H7/g6, clearance, interference) are ISO 286. ISO 2768 is the default when there is no box around the dimension." },
        { q: "2768-2 is withdrawn. Why H/K/L?", a: "Part 2 was withdrawn in 2021; successor ISO 22081. Drawings still use mK, so the old table stays. It does not replace a boxed, individually tolerated dimension." },
      ],
    },
  },
  spiebaan: {
    nl: {
      title: "Spiebaan-toleranties (DIN 6885).",
      accent: "(DIN 6885).",
      crumb: "Spiebaan-toleranties",
      lede: "Parallelspieën en spiebanen volgens DIN 6885-1 (hoge vorm). Vul de as-Ø in; de tabel eronder markeert de bijbehorende rij.",
      faq: [
        { q: "Wat is t1 en t2 bij DIN 6885?", a: "t₁ is de groefdiepte in de as, t₂ in de naaf. b × h is de spiemaat." },
        { q: "Welke breedtetolerantie is standaard?", a: "P9 in as en naaf: vaste zitting (DIN 6885-1:2021). Lichte zitting is N9 (as) / JS9 (naaf). H9/D10 is werkplaats-/UNI-conventie." },
        { q: "Hoort Ø 6 mm in de tabel?", a: "Nee. DIN 6885-1: eerste rij is boven 6 mm tot en met 8 mm. Precies Ø 6 mm valt erbuiten." },
        { q: "Wat is het verschil tussen DIN 6885-1 en 6885-2?", a: "DIN 6885-1 is de hoge vorm. DIN 6885-2 is de lage vorm, met een andere radiale positie van de spie." },
      ],
    },
    en: {
      title: "Keyway tolerances (DIN 6885).",
      accent: "(DIN 6885).",
      crumb: "Keyway tolerances",
      lede: "Parallel keys and keyways per DIN 6885-1 (high type). Enter shaft Ø; the table below highlights the matching row.",
      faq: [
        { q: "What are t1 and t2 in DIN 6885?", a: "t₁ is groove depth in the shaft, t₂ in the hub. b × h is the key size." },
        { q: "Which width tolerance is standard?", a: "P9 in shaft and hub: tight fit (DIN 6885-1:2021). Easy fit is N9 (shaft) / JS9 (hub). H9/D10 is a shop/UNI convention." },
        { q: "Does Ø 6 mm belong in the table?", a: "No. DIN 6885-1: first row is above 6 mm through 8 mm. Exactly Ø 6 mm is outside." },
        { q: "Difference between DIN 6885-1 and 6885-2?", a: "DIN 6885-1 is the high type. DIN 6885-2 is the low type, with a different radial key position." },
      ],
    },
  },
  lager: {
    nl: {
      title: "Lagerpassingen.",
      accent: "passingen.",
      crumb: "Lagerpassingen",
      lede: "Groefkogellagers: vast/los, SKF-klassen, ISO 286 tot Ø 50 mm. Kies rotatie en last; de aanbevolen as- en huisklasse volgt direct.",
      faq: [
        { q: "Wanneer een vaste passing op de as?", a: "Als de binnenring draait t.o.v. de radiale last. Die ring vast, de andere los." },
        { q: "Welke astolerantie bij groefkogel Ø 20 mm?", a: "Licht: j6. Normaal tot hoog: k5. Huis meestal H7, of K7 als de buitenring niet hoeft te schuiven. js5 geldt alleen tot en met 17 mm." },
        { q: "Gedeeld huis?", a: "Geen grote overmaat. Duursma: G of H, maximaal K." },
      ],
    },
    en: {
      title: "Bearing fits.",
      accent: "fits.",
      crumb: "Bearing fits",
      lede: "Deep-groove ball bearings: locating/non-locating, SKF classes, ISO 286 to Ø 50 mm. Pick rotation and load; recommended shaft and housing class follows.",
      faq: [
        { q: "When a tight fit on the shaft?", a: "When the inner ring rotates relative to the radial load. That ring tight, the other loose." },
        { q: "Which shaft tolerance at deep-groove Ø 20 mm?", a: "Light: j6. Normal to heavy: k5. Housing usually H7, or K7 if the outer ring need not slide. js5 only through 17 mm." },
        { q: "Split housing?", a: "No large interference. Duursma: G or H, K at most." },
      ],
    },
  },
  seeger: {
    nl: {
      title: "Seegerringgroef.",
      accent: "groef.",
      crumb: "Seegerringgroef",
      lede: "Borgringgroef op de as (DIN 471) of in de boring (DIN 472). Vul de nominale Ø in; de tabel markeert d₂, b en t.",
      faq: [
        { q: "Wat is het verschil tussen DIN 471 en DIN 472?", a: "DIN 471 is de seegerring voor een as: groef aan de buitenkant, d₂ kleiner dan d₁. DIN 472 is voor een boring: groef aan de binnenkant, d₂ groter dan d₁." },
        { q: "Hoe volgt t uit de tabel?", a: "t is de nominale groefdiepte: |d₁ − d₂| / 2. Bij Ø 20 mm as is d₂ = 19 mm, dus t = 0,5 mm." },
        { q: "Zit er tolerantie op de groefdiepte?", a: "DIN geeft t als rekenmaat bij nominale d₁/d₂. De maattolerantie zit op d₂: h11 op de as, H11 in de boring. t wordt daardoor 0 / +IT11/2 (bij Ø 20 as: 0 / +0,065 mm). Dieper mag, ondieper niet — anders staat de ring bol. Breedte b is H13." },
        { q: "Waarom ontbreekt Ø 23 mm?", a: "Seegerringen zijn nominale maten, geen bereik zoals bij spiebanen. Alleen de rijen in DIN 471/472 (en deze werkplaatstabel tot 100 mm) bestaan." },
        { q: "Waar komt de tabel vandaan?", a: "Werkplaatstabel seegerringgroef, onder meer verspanen-metaal, gelijk aan DIN 471/472. n-min. (afstand tot de schouder) staat niet in die tabel — die haal je uit de norm als de last dat vraagt." },
      ],
    },
    en: {
      title: "Circlip groove.",
      accent: "groove.",
      crumb: "Circlip groove",
      lede: "Retaining-ring groove on the shaft (DIN 471) or in the bore (DIN 472). Enter nominal Ø; the table highlights d₂, b and t.",
      faq: [
        { q: "Difference between DIN 471 and DIN 472?", a: "DIN 471 is the circlip for a shaft: groove on the outside, d₂ smaller than d₁. DIN 472 is for a bore: groove on the inside, d₂ larger than d₁." },
        { q: "How does t follow from the table?", a: "t is nominal groove depth: |d₁ − d₂| / 2. At Ø 20 mm shaft, d₂ = 19 mm, so t = 0.5 mm." },
        { q: "Is there a tolerance on groove depth?", a: "DIN gives t as a calculated size at nominal d₁/d₂. The dimensional tolerance is on d₂: h11 on the shaft, H11 in the bore. t therefore becomes 0 / +IT11/2 (Ø 20 shaft: 0 / +0.065 mm). Deeper is allowed, shallower is not — otherwise the ring dishes. Width b is H13." },
        { q: "Why is Ø 23 mm missing?", a: "Circlips are nominal sizes, not ranges like keyways. Only the rows in DIN 471/472 (and this shop table to 100 mm) exist." },
        { q: "Where does the table come from?", a: "Shop table for circlip grooves, among others verspanen-metaal, matching DIN 471/472. n-min. (distance to the shoulder) is not in that table — take it from the standard if the load requires it." },
      ],
    },
  },
  bevestigers: {
    nl: {
      title: "Bevestigingsmateriaal.",
      accent: "materiaal.",
      crumb: "Bevestigingsmateriaal",
      lede: "Metrische bouten M3–M24: doorlaat ISO 273, zeskant en inbus, aandraaimoment 8.8 / 10.9 / 12.9. Kies de M-maat; de tabellen markeren de rij.",
      faq: [
        { q: "Welke doorlaat is standaard?", a: "Middel (ISO 273 medium). Fijn bij nauwkeurige uitlijning, grof bij plaatwerk of ruwe gaten." },
        { q: "Aandraaimoment M8 8.8?", a: "27,3 N·m bij μ = 0,14, droog, 90 % Rp0,2 (VDI 2230-1 A1). Voorspanning 18 100 N. Gesmeerd is μ lager — moment omlaag." },
        { q: "Zeskant of inbus?", a: "SW en k zijn ISO 4014/4017 (zeskant). s en dk zijn ISO 4762 (cilinderkop inbus). Zelfde M-draad, andere kop." },
        { q: "Is dit een VDI-verbinding?", a: "Nee. Tabel A1 is een startwaarde voor statische, concentrische last. Wisselende last, klemverhouding en inbedlengte reken je in VDI 2230." },
      ],
    },
    en: {
      title: "Fasteners.",
      accent: "teners.",
      crumb: "Fasteners",
      lede: "Metric bolts M3–M24: clearance hole ISO 273, hex and socket, tightening torque 8.8 / 10.9 / 12.9. Pick the M size; the tables highlight the row.",
      faq: [
        { q: "Which clearance hole is standard?", a: "Medium (ISO 273 medium). Fine for accurate alignment, coarse for sheet or rough holes." },
        { q: "Tightening torque M8 8.8?", a: "27.3 N·m at μ = 0.14, dry, 90 % Rp0.2 (VDI 2230-1 A1). Preload 18 100 N. Lubricated μ is lower — torque down." },
        { q: "Hex or socket?", a: "SW and k are ISO 4014/4017 (hex). s and dk are ISO 4762 (socket head). Same M thread, different head." },
        { q: "Is this a VDI joint?", a: "No. Table A1 is a starting value for static, concentric load. Alternating load, clamp ratio and grip length you calculate in VDI 2230." },
      ],
    },
  },
  oring: {
    nl: {
      title: "O-ringgroef.",
      accent: "groef.",
      crumb: "O-ringgroef",
      lede: "ISO-koorden 1,80–7,00 mm: groef t / b, schema radiaal en axiaal. Kies koord en inbouw; de tabel markeert de rij.",
      faq: [
        { q: "Wat is d₂?", a: "Koorddiameter volgens ISO 3601-1. Vijf groepen: 1,80 / 2,65 / 3,55 / 5,30 / 7,00 mm." },
        { q: "Groef voor 2,65 mm radiaal statisch?", a: "t = 2,0 mm (+0,05), b = 3,6 mm (+0,25). Nominale samendrukking ongeveer 25 % — geen plus-mintolerantie." },
      ],
    },
    en: {
      title: "O-ring groove.",
      accent: "groove.",
      crumb: "O-ring groove",
      lede: "ISO cords 1.80–7.00 mm: groove t / b, radial and axial layout. Pick cord and installation; the table highlights the row.",
      faq: [
        { q: "What is d₂?", a: "Cord diameter per ISO 3601-1. Five groups: 1.80 / 2.65 / 3.55 / 5.30 / 7.00 mm." },
        { q: "Groove for 2.65 mm radial static?", a: "t = 2.0 mm (+0.05), b = 3.6 mm (+0.25). Nominal squeeze about 25 % — not a plus-minus tolerance." },
      ],
    },
  },
  motor: {
    nl: {
      title: "Motorspecificatie.",
      accent: "specificatie.",
      crumb: "Motorspecificatie",
      lede: "Berekent het bedrijfspunt van een horizontale aangedreven rol of trommel: n, F, T en P. Geen cataloguskeuze, geen typecode.",
      faq: [
        { q: "Wat zit er in P_motor?", a: "P_motor = P_as / η × f_b. η is het rendement van de aandrijflijn (standaard 0,85), f_b de bedrijfsfactor (standaard 1,2). P_as is F·v op de rol, in watt." },
        { q: "Wat is de IEC-stap?", a: "De volgende cataloguswaarde uit de IEC 60034 kW-reeks, niet het berekende asvermogen. 0,104 kW wordt 0,12 kW. Boven 315 kW staat er geen stap in deze reeks." },
        { q: "Kiest deze tool een motortype?", a: "Nee. Deze rekenhulp bepaalt alleen het bedrijfspunt: n, F, T en P. Geen typecode, geen voorraadkeuze." },
        { q: "Wat is i ≈ 1450 / n?", a: "Een familie-indicatie voor een 4-polige motor op 50 Hz (synchroon 1500, vollast rond 1450 min⁻¹). Geen gemeten toerental." },
      ],
    },
    en: {
      title: "Motor specification.",
      accent: "specification.",
      crumb: "Motor specification",
      lede: "Operating point of a driven roller or drum: n, F, T and P. No catalogue pick, no type code.",
      faq: [
        { q: "What is in P_motor?", a: "P_motor = P_shaft / η × f_b. η is drivetrain efficiency (default 0.85), f_b the service factor (default 1.2). P_shaft is F·v at the roller, in watts." },
        { q: "What is the IEC step?", a: "The next catalogue value from the IEC 60034 kW series, not the calculated shaft power. 0.104 kW becomes 0.12 kW. Above 315 kW there is no step in this series." },
        { q: "Does this pick a motor type?", a: "No. This calculator only finds the operating point: n, F, T and P. No type code, no stock pick." },
        { q: "What is i ≈ 1450 / n?", a: "A family indication for a 4-pole motor at 50 Hz (synchronous 1500, full load around 1450 min⁻¹). Not a measured speed." },
      ],
    },
  },
  kanten: {
    nl: {
      title: "Richtlijnen kanten.",
      accent: "kanten.",
      crumb: "Richtlijnen kanten",
      lede: "Inwendige radius, minimale beenlengte en Z-buiging volgens de Sophia-shop van 247TailorSteel. Geen ISO, geen DIN. Altijd hun pagina nalopen.",
      faq: [
        { q: "Is dit ISO of DIN?", a: "Nee. Het is de aanleverspecificatie van 247TailorSteel Sophia. Andere shops hebben andere radii en beenlengtes. Open hun pagina; dit is een werkblad." },
        { q: "Wat zijn Ri, w, s en x?", a: "Ri is de inwendige radius na kanten. w is groefwijdte van de matrijs, s de minimale beenlengte (opleg op de matrijs), x de Z-maat voor een Z-buiging. Lege cel betekent: niet in hun tabel." },
        { q: "Waarom is alu 0,8 mm Ri leeg?", a: "Op de 247-pagina staat daar een streepje. Dat is geen buurrij van staal 0,8 of alu 1,0 mm. Geen naburige waarde invullen." },
        { q: "Waarom 10 en 12 mm extra?", a: "247 noteert dat die diktes niet over de volle plaatlengte kunnen. De tool toont de rij wél, met die kanttekening. Check de actuele pagina." },
      ],
    },
    en: {
      title: "Bending guidelines.",
      accent: "guidelines.",
      crumb: "Bending guidelines",
      lede: "Inside radius, minimum leg length and Z-bend per the 247TailorSteel Sophia shop. Not ISO, not DIN. Always check their page.",
      faq: [
        { q: "Is this ISO or DIN?", a: "No. It is 247TailorSteel Sophia’s intake spec. Other shops have other radii and leg lengths. Open their page; this is a worksheet." },
        { q: "What are Ri, w, s and x?", a: "Ri is the inside radius after bending. w is die groove width, s the minimum leg length (overlay on the die), x the Z dimension for a Z-bend. Empty cell: not in their table." },
        { q: "Why is alu 0.8 mm Ri empty?", a: "The 247 page has a dash there. That is not a neighbour of steel 0.8 or alu 1.0 mm. Do not fill a neighbouring value." },
        { q: "Why the 10 and 12 mm note?", a: "247 notes those thicknesses cannot run the full sheet length. The tool still shows the row, with that caveat. Check the current page." },
      ],
    },
  },
  knik: {
    nl: {
      title: "Knikberekening.",
      accent: "berekening.",
      crumb: "Knikberekening",
      lede: "Euler-knik van een slanke staaf: kritieke last F_cr, kritieke spanning σ_cr en slankheid λ. Vier inklemgevallen, vier doorsnedevormen.",
      faq: [
        { q: "Wat is F_cr?", a: "De kritieke Euler-last: F_cr = π² E I / L_eff². Boven deze last knikt de staaf elastisch, ongeacht de sterkte van het materiaal." },
        { q: "Wat is L_eff?", a: "De knik-lengte L_eff = k · L. k volgt uit de inklemming: scharnier-scharnier k=1, ingeklemd-vrij k=2, ingeklemd-ingeklemd k=0,5, ingeklemd-scharnier k≈0,699." },
        { q: "Waarom een waarschuwing bij lage λ?", a: "Euler geldt voor slanke staven. Bij lage slankheid (vuistregel λ < 100) overschat de formule de werkelijke sterkte; gebruik dan Tetmajer of de Johnson-parabool." },
        { q: "Is dit een vervanging van EN 1993-1-1?", a: "Nee. Dit is de ideale Euler-theorie: geen initiële kromming, geen partiële veiligheidsfactoren. Voor kritieke constructies de norm of een FEM-check gebruiken." },
      ],
    },
    en: {
      title: "Buckling calculation.",
      accent: "calculation.",
      crumb: "Buckling calculation",
      lede: "Euler buckling of a slender strut: critical load F_cr, critical stress σ_cr and slenderness λ. Four end conditions, four cross-section shapes.",
      faq: [
        { q: "What is F_cr?", a: "The critical Euler load: F_cr = π² E I / L_eff². Above this load the strut buckles elastically, regardless of material strength." },
        { q: "What is L_eff?", a: "The buckling length L_eff = k · L. k follows from the end condition: pinned-pinned k=1, fixed-free k=2, fixed-fixed k=0.5, fixed-pinned k≈0.699." },
        { q: "Why a warning at low λ?", a: "Euler applies to slender struts. At low slenderness (rule of thumb λ < 100) the formula overestimates real strength; use Tetmajer or the Johnson parabola instead." },
        { q: "Does this replace EN 1993-1-1?", a: "No. This is ideal Euler theory: no initial curvature, no partial safety factors. For critical structures, use the standard or an FEM check." },
      ],
    },
  },
  bronnen: {
    nl: {
      title: "CAD-bibliotheken.",
      accent: "theken.",
      crumb: "CAD-bibliotheken",
      lede: "CAD-modellen, componenten, plaatwerk en norm-naslag. Kantlijnen in de rekenhulp Richtlijnen kanten (247TailorSteel Sophia, shop-spec). Links openen in een nieuw tabblad.",
    },
    en: {
      title: "CAD libraries.",
      accent: "libraries.",
      crumb: "CAD libraries",
      lede: "CAD models, components, sheet metal and standards. Bend lines in the Bending guidelines calculator (247TailorSteel Sophia, shop-spec). Links open in a new tab.",
    },
  },
} as const satisfies Record<string, Record<Locale, PageCopy>>;

export function toolkitCopy<K extends keyof typeof pages>(id: K, locale: Locale): PageCopy {
  return pages[id][locale];
}
