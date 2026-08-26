# damianvink.nl

Persoonlijke site van Damian Vink. Statische HTML op GitHub Pages.

## Structuur

- `/` — Home (Wie ik ben · Wat ik doe · Wat ik denk · Contact)
- `/over-mij/` — Wie ik ben + CV
- `/doe/marathon/` — Marathon (`data/strava.json`)
- `/doe/projecten/` — Projecten (leeg tot er echte cases zijn)
- `/weet/` — Wat ik denk (Engineering toolkit · Blog)
- `/weet/toolkit/` — Engineering toolkit
  - `/weet/toolkit/passingen/` — Passingen (ISO 286)
  - `/weet/toolkit/spiebaan-toleranties/` — Spiebaan-toleranties (DIN 6885)
  - `/weet/toolkit/lagerpassingen/` — Lagerpassingen
  - `/weet/toolkit/o-ringgroef/` — O-ringgroef
  - `/weet/toolkit/bronnen/` — CAD-bibliotheken
- `/weet/blog/` — Blog (leeg tot er echte artikelen zijn)

Easter egg: `/spel/` (Vink). Alleen via het vogeltje naast de sitenaam, niet in nav/sitemap.

Onbekende paden vallen op `404.html`. `llms.txt` is een korte inhoudsopgave voor AI-crawlers.

## Engineering toolkit (correcties)

Tabellen en rekenhulp herberekend uit ISO 286-2, DIN 6885-1, SKF en Dichtomatik:

- **JS7** = ±IT7/2, niet afgerond (6–10: ±7,5 µm · 18–30: ±10,5 µm · 30–50: ±12,5 µm)
- **H7/p6** tot 18 mm: max. speling 0 µm (lijnpassing); daarna altijd interferentie
- **Spiebaan**: eerste rij is boven 6 t/m 8 (Ø 6 mm valt erbuiten)
- **H9/D10**: werkplaats-/UNI-conventie; DIN 6885-1:2021 noemt P9 sluitend en N9/JS9 vrij
- **Lager Ø 20 licht**: j6 (js5 alleen tot en met 17 mm). Lastkeuze uit bij stilstaande binnenring
- **O-ring samendrukking**: nominale compressie (d₂ − t)/d₂, geen ±-tolerantie
- **CAD-links**: MISUMI → uk.misumi-ec.com; norelem → norelem.com/nl

Nominale Ø in de rekenhulp is een leegbaar tekstveld (hele millimeters). Naslag, geen vervanging van de norm.

GitHub Pages: de mapinhoud van deze repo is de site. Trailing slashes (`/weet/toolkit/passingen/`) horen bij de directory-`index.html`.
