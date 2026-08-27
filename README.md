# Damian Vink

Persoonlijke site van Damian Vink, Project Engineer werktuigbouwkunde.

Redesign met engineering toolkit (rekenhulp bovenaan, naslag eronder) en vaste toolwisselaar.

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

## Pagina’s

- `/` — home
- `/over-mij` — loopbaan
- `/denk/toolkit` — engineering toolkit
- `/denk/toolkit/passingen` — ISO 286
- `/denk/toolkit/spiebaan-toleranties` — DIN 6885
- `/denk/toolkit/lagerpassingen` — SKF / ISO 286
- `/denk/toolkit/o-ringgroef` — ISO 3601
- `/doe/marathon` — trainingslogboek Porto 2026
- `/spel` — Vink (easter egg)

`/weet/*` verwijst door naar `/denk/*`.

## Stack

TanStack Start, React 19, Vite, Tailwind CSS v4.

Dit is een Node-app, geen statische HTML. GitHub Pages host nog de vorige site. Voor deze versie: Vercel, Netlify of een eigen Node-host.

## Bronnen

Naslag in de toolkit is een werkblad, geen vervanging van ISO 286, DIN 6885 of SKF-catalogi.
