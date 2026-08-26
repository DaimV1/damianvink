# damianvink.nl

Persoonlijke site van Damian Vink. Statische HTML op GitHub Pages (`damianvink.nl`).

## Live informatiearchitectuur

- `/` — Home (Wie ik ben · Wat ik doe · Wat ik denk · Contact)
- `/over-mij/` — Wie ik ben + CV
- `/doe/` — Wat ik doe (hub)
- `/doe/marathon/` — Marathon (`data/strava.json`)
- `/doe/projecten/` — Projecten (leeg tot er echte cases zijn)
- `/denk/` — Wat ik denk (Engineering toolkit · Blog)
- `/denk/toolkit/` — Engineering toolkit
  - `/denk/toolkit/passingen/` — Passingen (ISO 286)
  - `/denk/toolkit/spiebaan-toleranties/` — Spiebaan-toleranties (DIN 6885)
  - `/denk/toolkit/lagerpassingen/` — Lagerpassingen
  - `/denk/toolkit/o-ringgroef/` — O-ringgroef
  - `/denk/toolkit/bronnen/` — CAD-bibliotheken
- `/denk/blog/` — Blog (leeg tot er echte artikelen zijn)

Easter egg: `/spel/` (Vink). Alleen via het vogeltje naast de sitenaam, niet in nav of sitemap.

Onbekende paden vallen op `404.html`. `llms.txt` is een korte inhoudsopgave voor AI-crawlers.

Oude URL’s `/weet/…` en `/kennis/…` zijn HTML-redirects (canonical + meta-refresh + noindex) naar `/denk/…`. GitHub Pages kent geen echte 301.

## Chrome (header / footer)

Gedeelde markup staat in `partials/`:

- `partials/header.html` — skip zit in de pagina’s; header met nav + thema
- `partials/footer.html`
- `partials/redirect.html`

Bouwen (injecteert chrome in alle publieke HTML, schrijft redirects):

```bash
node scripts/build-pages.js
```

Controleren of nav niet drift:

```bash
bash scripts/check-chrome.sh
```

GitHub Pages serveert de gebouwde HTML in deze repo-root (directory-`index.html`, trailing slashes). De Action `.github/workflows/check-chrome.yml` draait dezelfde check.

### Pagina toevoegen

1. Kopieer een bestaande `index.html` in de juiste map (`over-mij/`, `doe/…`, `denk/…`).
2. Vul `<title>`, description, canonical, OG en de `<main>`-inhoud.
3. Laat header/footer zoals ze zijn (of een lege `<header></header>` / `<footer></footer>`).
4. Run `node scripts/build-pages.js` — chrome, skip-link, `aria-current` en theme-color worden gezet.
5. Zet de URL in `sitemap.xml` en `llms.txt`.

### Toolkit-tool toevoegen

1. Map `denk/toolkit/<slug>/index.html` (voorbeeld: `passingen/`).
2. Rekenhulp: eigen JS in `js/<slug>.js`, onderaan de pagina na `/js/site.js`. Behoud bestaande element-ids als je een tool kopieert (`#fit-calc`, `#fit-calc-out`, enz.).
3. Link op `denk/toolkit/index.html`.
4. Redirect-stub onder `weet/toolkit/<slug>/` en `kennis/toolkit/<slug>/` (of opnieuw `node scripts/build-pages.js` na uitbreiden van de lijst in dat script).
5. Sitemap + `llms.txt`.

## Navigatie

Header (deze volgorde): Wie ik ben · Wat ik doe · Toolkit · Wat ik denk · Contact.

`aria-current="page"`:

- `/over-mij/` → Wie ik ben
- `/doe/` en dieper → Wat ik doe
- `/denk/toolkit/` en dieper → Toolkit
- `/denk/` en `/denk/blog/` → Wat ik denk

Footer: Wie ik ben · Toolkit · Wat ik denk · Marathon · Contact.

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

GitHub Pages: de mapinhoud van deze repo is de site. Trailing slashes (`/denk/toolkit/passingen/`) horen bij de directory-`index.html`.

## AI-tekst index

Gemarkeerd met `data-ai`, class `ai-text`, commentaar `<!-- AI-TEXT An -->` en zichtbare tag `.ai-tag`. Later verbergen: `.ai-tag { display: none; }`.

| ID | Pagina | Begin |
| --- | --- | --- |
| A1 | `/` | Project Engineer werktuigbouwkunde. Mechanisch ontwerp, |
| A2 | `/` | Achtergrond in werktuigbouwkunde en machinebouw. |
| A3 | `/` | Naslag tijdens ontwerp, en later artikelen. |
| A4 | `/` | Voor vragen over engineering, samenwerkingen of deze |
| A5 | `/` | Tekst gemarkeerd met A1, A2, … is concept- |
| A6 | `/over-mij/` | Ik houd ervan om technische vraagstukken te vertalen |
| A7 | `/over-mij/` | In mijn werk combineer ik technisch ontwerp met |
| A8 | `/over-mij/` | Naast mijn werk gebruik ik deze website om |
| A9 | `/over-mij/` | Overzicht van opleiding, werkervaring en technische |
| A10 | `/denk/` | Twee sporen: naslag tijdens ontwerp, en artikelen |
| A11 | `/denk/toolkit/` | Tabellen en links die ik tijdens ontwerp gebruik. |
| A12 | `/denk/blog/` | Artikelen over werktuigbouwkunde, ontwerp en wat |
| A13 | `/doe/projecten/` | Werk uit de machinebouw en werktuigbouwkunde. |
