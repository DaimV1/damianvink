# damianvink.nl

Personal site of Damian Vink — Project Engineer werktuigbouwkunde & machinebouw.

## Changes in this update

### Dark mode (default)
- Full dark theme as the primary look, with system preference support
- Manual light/dark toggle in the header (persisted in `localStorage`)
- All hard-coded light colors replaced with CSS variables

### Visual polish
- Softer elevated surfaces, clearer borders and tables
- Improved callouts, buttons, cards and footer
- Slightly refined accent colors for dark backgrounds
- Smoother hover states and focus outlines

### Structure / map
- HTML files stay flat at the root (required for current GitHub Pages URLs and SEO)
- Navigation + homepage “map” cards kept as the site map
- `tools` added to `sitemap.xml`
- Theme toggle and early theme script added on every page

## Deploy

This is a static GitHub Pages site (`CNAME` → damianvink.nl).

1. Copy the updated files into your repo (or replace the branch contents)
2. Commit and push to `main`
3. GitHub Pages will publish automatically

## Local preview

Open `index.html` in a browser, or run any static server from this folder, e.g.:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000
