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

## Deploy (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/DaimV1/damianvink/tree/redesign&project-name=damianvink&repository-name=damianvink)

Of importeer de repo: [vercel.com/new/import](https://vercel.com/new/import?s=https://github.com/DaimV1/damianvink) en kies branch `redesign`.

Framework preset: **TanStack Start**. Elke push naar die branch krijgt daarna een preview-URL.

`damianvink.nl` staat nu nog op GitHub Pages. Pas DNS om naar Vercel als de preview goed is, en merge daarna `redesign` naar `main`.

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

## Bronnen

Naslag in de toolkit is een werkblad, geen vervanging van ISO 286, DIN 6885 of SKF-catalogi.
