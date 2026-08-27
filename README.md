# Damian Vink

Persoonlijke site van Damian Vink, Project Engineer werktuigbouwkunde.
Live: [https://www.damianvink.nl](https://www.damianvink.nl) (Vercel, TanStack Start).

## Lokaal

```sh
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

```sh
npm run typecheck
npm run build
```

## Deploy

Vercel-project `damianvink`, production branch `main`.
Custom domain: `www.damianvink.nl` (apex 308’t naar www).

## Findability

- `public/robots.txt` — sitemap-verwijzing, `/spel` en `/denk/project` uitgesloten
- `public/sitemap.xml` — indexeerbare pagina’s, www, geen trailing slash
- `public/llms.txt` — korte inhoudsopgave voor AI-crawlers
- `/weet/*` en `/kennis/*` — permanente redirects naar `/denk/*`

## Pagina’s

- `/` — home
- `/over-mij` — loopbaan + CV
- `/doe/marathon` — trainingslogboek Porto 2026
- `/denk/toolkit` — engineering toolkit
- `/denk/toolkit/passingen` — ISO 286
- `/denk/toolkit/spiebaan-toleranties` — DIN 6885
- `/denk/toolkit/lagerpassingen` — SKF / ISO 286
- `/denk/toolkit/seegerring-groef` — DIN 471 / 472
- `/denk/toolkit/bevestigers` — ISO 273 / VDI 2230
- `/denk/toolkit/o-ringgroef` — ISO 3601
- `/denk/toolkit/bronnen` — CAD-bibliotheken
- `/contact` — e-mail en socials
- `/spel` — easter egg (noindex)

## Stack

TanStack Start, React 19, Vite, Tailwind CSS v4.

## Bronnen

Naslag in de toolkit is een werkblad, geen vervanging van ISO 286, DIN 6885 of SKF-catalogi.
