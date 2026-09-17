import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Dna, Pause, Play, Plus, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tx, useLocale } from "@/lib/i18n/locale";
import {
  evolve,
  makeLayout,
  MAX_GENERATIONS,
  MAX_STOPS,
  POPULATION,
  startEvolution,
  type Layout,
  type Stop,
} from "@/lib/lab/evolution";

export function EvolutionLab() {
  const { locale } = useLocale();
  const t = (nl: string, en: string) => tx(locale, nl, en);
  const [stops, setStops] = useState(() => makeLayout("scatter"));
  const [search, setSearch] = useState(() => startEvolution(makeLayout("scatter")));
  const [running, setRunning] = useState(false);
  const [mutation, setMutation] = useState(25);
  const [speed, setSpeed] = useState(1);
  const [layout, setLayout] = useState<Layout | "custom">("scatter");
  const [showInitial, setShowInitial] = useState(false);
  const [showPopulation, setShowPopulation] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const board = useRef<HTMLDivElement>(null);
  const drag = useRef<number | null>(null);
  const finished = search.generation >= MAX_GENERATIONS;
  const best = search.population[0];
  const improvement =
    search.initial.distance > 0 ? (1 - best.distance / search.initial.distance) * 100 : 0;

  useEffect(() => {
    if (!running || finished) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setSearch((current) => {
        let next = current;
        for (let i = 0; i < speed && next.generation < MAX_GENERATIONS; i++)
          next = evolve(next, stops, mutation / 100);
        return next;
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [running, finished, speed, stops, mutation]);

  function replaceStops(next: Stop[], nextLayout: Layout | "custom" = "custom") {
    setRunning(false);
    setStops(next);
    setSearch(startEvolution(next));
    setLayout(nextLayout);
  }
  function locate(event: PointerEvent): Stop {
    const rect = board.current!.getBoundingClientRect();
    return {
      x: Math.max(30, Math.min(770, ((event.clientX - rect.left) / rect.width) * 800)),
      y: Math.max(35, Math.min(485, ((event.clientY - rect.top) / rect.height) * 520)),
    };
  }
  function addStop(point?: Stop) {
    if (stops.length >= MAX_STOPS) return;
    replaceStops([
      ...stops,
      point ?? { x: 90 + ((stops.length * 137) % 620), y: 85 + ((stops.length * 97) % 350) },
    ]);
    setSelected(stops.length);
  }
  function moveStop(index: number, point: Stop) {
    replaceStops(stops.map((stop, i) => (i === index ? point : stop)));
  }
  function removeStop(index: number) {
    if (stops.length <= 4) return;
    replaceStops(stops.filter((_, i) => i !== index));
    setSelected(null);
  }
  function path(order: number[]) {
    return [...order, order[0]].map((index) => `${stops[index].x},${stops[index].y}`).join(" ");
  }
  const graphTop = search.initial.distance || 1;
  const graphBottom = Math.min(best.distance * 0.85, graphTop * 0.8);
  const graph = search.history
    .map(
      (value, i) =>
        `${(i / Math.max(1, search.history.length - 1)) * 260},${12 + ((graphTop - value) / (graphTop - graphBottom)) * 72}`,
    )
    .join(" ");

  return (
    <section
      aria-labelledby="evolution-title"
      className="overflow-hidden rounded-xl border border-line bg-elevated"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-5 sm:p-7">
        <div>
          <p className="mb-2 font-mono text-sm uppercase tracking-widest text-accent">
            Evolution Lab / 07
          </p>
          <h2 id="evolution-title" className="font-display text-2xl sm:text-3xl">
            {t("Geen route gegeven. Wel een doel.", "No route given. Just a goal.")}
          </h2>
          <p className="mt-2 max-w-2xl text-base text-muted">
            {t(
              "Bezoek elke stop en keer terug. Jij maakt de kaart; evolutie zoekt een kortere ronde.",
              "Visit every stop and return. You make the map; evolution searches for a shorter tour.",
            )}
          </p>
        </div>
        <span className="rounded-full border border-line px-3 py-2 font-mono text-sm text-muted">
          {t("Genetisch algoritme", "Genetic algorithm")}
        </span>
      </div>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
            <div
              role="group"
              aria-label={t("Kaartindeling", "Map layout")}
              className="flex flex-wrap gap-2"
            >
              {(["scatter", "clusters", "ring"] as const).map((item) => (
                <Button
                  key={item}
                  size="sm"
                  variant={layout === item ? "primary" : "secondary"}
                  aria-pressed={layout === item}
                  onClick={() => {
                    replaceStops(makeLayout(item), item);
                    setSelected(null);
                  }}
                >
                  {item === "scatter"
                    ? t("Verspreid", "Scatter")
                    : item === "clusters"
                      ? "Clusters"
                      : "Ring"}
                </Button>
              ))}
            </div>
            <span className="font-mono text-sm text-muted">
              {stops.length} / {MAX_STOPS} {t("stops", "stops")}
            </span>
          </div>
          <div
            ref={board}
            className="relative h-[350px] overflow-hidden bg-[#081321] sm:h-[440px] lg:h-[480px]"
            onPointerDown={(event) => {
              if (event.button === 0 && event.target === event.currentTarget)
                addStop(locate(event));
            }}
            aria-label={t(
              "Routekaart: klik op lege ruimte om een stop toe te voegen",
              "Route map: click empty space to add a stop",
            )}
          >
            <svg
              viewBox="0 0 800 520"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <defs>
                <pattern id="evo-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeOpacity="0.1" />
                </pattern>
              </defs>
              <rect width="800" height="520" fill="url(#evo-grid)" />
              {showPopulation &&
                search.population
                  .slice(1, 9)
                  .map((candidate, i) => (
                    <polyline
                      key={i}
                      points={path(candidate.order)}
                      fill="none"
                      stroke="#789cff"
                      strokeOpacity="0.09"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
              {showInitial && (
                <polyline
                  points={path(search.initial.order)}
                  fill="none"
                  stroke="#f9b86c"
                  strokeDasharray="6 6"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              <polyline
                points={path(best.order)}
                fill="none"
                stroke="#64e8c0"
                strokeOpacity="0.12"
                strokeWidth="10"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              <polyline
                points={path(best.order)}
                fill="none"
                stroke="#64e8c0"
                strokeWidth="2.5"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {stops.map((stop, index) => (
              <button
                key={index}
                type="button"
                className="absolute z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center rounded-full border-2 bg-[#102338] font-mono text-xs text-white shadow-lg outline-none focus-visible:ring-4 focus-visible:ring-white/70"
                style={{
                  left: `${stop.x / 8}%`,
                  top: `${stop.y / 5.2}%`,
                  borderColor: selected === index ? "#f9b86c" : "#64e8c0",
                }}
                aria-label={`${t("Stop", "Stop")} ${index + 1}. ${t("Pijltjes verplaatsen, Delete verwijdert.", "Arrow keys move, Delete removes.")}`}
                aria-pressed={selected === index}
                onFocus={() => setSelected(index)}
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  event.stopPropagation();
                  setSelected(index);
                  drag.current = index;
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                  if (drag.current === index) moveStop(index, locate(event));
                }}
                onPointerUp={() => {
                  drag.current = null;
                }}
                onPointerCancel={() => {
                  drag.current = null;
                }}
                onLostPointerCapture={() => {
                  drag.current = null;
                }}
                onKeyDown={(event) => {
                  const directions: Record<string, [number, number]> = {
                    ArrowLeft: [-1, 0],
                    ArrowRight: [1, 0],
                    ArrowUp: [0, -1],
                    ArrowDown: [0, 1],
                  };
                  if (directions[event.key]) {
                    event.preventDefault();
                    const [dx, dy] = directions[event.key];
                    const step = event.shiftKey ? 25 : 8;
                    moveStop(index, {
                      x: Math.max(30, Math.min(770, stop.x + dx * step)),
                      y: Math.max(35, Math.min(485, stop.y + dy * step)),
                    });
                  }
                  if (event.key === "Delete" || event.key === "Backspace") {
                    event.preventDefault();
                    removeStop(index);
                  }
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-line px-5 py-3 text-sm text-muted">
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-5 bg-[#64e8c0]" />
              {t("Beste ronde", "Best tour")}
            </span>
            {showInitial && (
              <span className="flex items-center gap-2">
                <span className="w-5 border-t-2 border-dashed border-[#f9b86c]" />
                {t("Startgeneratie", "Starting generation")}
              </span>
            )}
            <span>
              {t("Klik om toe te voegen · sleep om te verplaatsen", "Click to add · drag to move")}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-4">
            <Button
              variant="secondary"
              size="sm"
              disabled={stops.length >= MAX_STOPS}
              onClick={() => addStop()}
            >
              <Plus className="size-4" aria-hidden="true" />
              {t("Stop toevoegen", "Add stop")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={selected === null || stops.length <= 4}
              onClick={() => selected !== null && removeStop(selected)}
            >
              {t("Selectie verwijderen", "Remove selected")}
            </Button>
            <span className="text-sm text-muted">
              {t(
                "Kaart aanpassen start een nieuwe zoektocht.",
                "Editing the map resets the search.",
              )}
            </span>
          </div>
        </div>
        <aside
          className="flex flex-col gap-5 border-t border-line p-5 lg:border-l lg:border-t-0"
          aria-label={t("Evolutiebediening", "Evolution controls")}
        >
          <div className="flex items-center justify-between font-mono text-sm text-muted">
            <span>{t("GENERATIE", "GENERATION")}</span>
            <span role="status">
              {finished
                ? t("Voltooid", "Finished")
                : running
                  ? t("Zoekt", "Searching")
                  : t("Gepauzeerd", "Paused")}
            </span>
          </div>
          <div
            className="-mt-3 font-display text-5xl tabular-nums"
            data-testid="evolution-generation"
          >
            {search.generation.toString().padStart(3, "0")}
            <span className="ml-2 text-sm text-muted">/ {MAX_GENERATIONS}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button disabled={finished} onClick={() => setRunning(!running)}>
              {running && !finished ? (
                <Pause className="size-4" aria-hidden="true" />
              ) : (
                <Play className="size-4" aria-hidden="true" />
              )}
              {running && !finished ? t("Pauze", "Pause") : t("Evolueer", "Evolve")}
            </Button>
            <Button
              variant="secondary"
              disabled={(running && !finished) || finished}
              onClick={() => setSearch((current) => evolve(current, stops, mutation / 100))}
            >
              <SkipForward className="size-4" aria-hidden="true" />
              {t("1 stap", "1 step")}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 border-y border-line py-4">
            <div>
              <p className="text-sm text-muted">{t("Korter dan start", "Shorter than start")}</p>
              <p
                className="mt-1 font-mono text-2xl text-accent"
                data-testid="evolution-improvement"
              >
                {improvement.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted">{t("Beste afstand", "Best distance")}</p>
              <p className="mt-1 font-mono text-2xl" data-testid="evolution-distance">
                {Math.round(best.distance)}
                <span className="ml-1 text-sm text-muted">u</span>
              </p>
            </div>
          </div>
          <figure>
            <figcaption className="flex justify-between text-sm text-muted">
              <span>{t("Afstand per generatie", "Distance per generation")}</span>
              <span>{t("lager = beter", "lower = better")}</span>
            </figcaption>
            <svg
              viewBox="0 0 260 100"
              className="mt-2 h-24 w-full"
              role="img"
              aria-label={t(
                `Beste afstand van ${Math.round(search.initial.distance)} naar ${Math.round(best.distance)} kaarteenheden.`,
                `Best distance from ${Math.round(search.initial.distance)} to ${Math.round(best.distance)} map units.`,
              )}
            >
              <path
                d="M0 12 H260 M0 48 H260 M0 84 H260"
                stroke="currentColor"
                className="text-line"
              />
              <polyline
                points={search.history.length === 1 ? "0,12 260,12" : graph}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-accent"
              />
            </svg>
          </figure>
          <div>
            <label htmlFor="evo-mutation" className="flex justify-between text-sm">
              {t("Mutatiekans", "Mutation chance")}
              <span className="font-mono text-accent">{mutation}%</span>
            </label>
            <input
              id="evo-mutation"
              type="range"
              min="0"
              max="100"
              step="5"
              value={mutation}
              onChange={(event) => setMutation(Number(event.target.value))}
              className="h-8 w-full accent-[var(--accent)]"
            />
            <p className="text-sm text-muted">
              {t(
                "Hoe vaak een nieuwe route willekeurig verandert.",
                "How often a new route changes at random.",
              )}
            </p>
          </div>
          <div>
            <label htmlFor="evo-speed" className="mr-3 text-sm">
              {t("Tempo", "Speed")}
            </label>
            <select
              id="evo-speed"
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
              className="rounded-md border border-line bg-paper px-3 py-2 text-sm"
            >
              <option value="1">1×</option>
              <option value="5">5×</option>
              <option value="20">20×</option>
            </select>
          </div>
          <div className="space-y-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showInitial}
                onChange={(event) => setShowInitial(event.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              {t("Vergelijk met start", "Compare with start")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showPopulation}
                onChange={(event) => setShowPopulation(event.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              {t("Toon alternatieve routes", "Show alternative routes")}
            </label>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setRunning(false);
              setSearch(startEvolution(stops));
            }}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {t("Herstart dezelfde proef", "Restart same experiment")}
          </Button>
        </aside>
      </div>
      <div className="grid gap-5 border-t border-line p-5 text-base sm:p-7 md:grid-cols-3">
        {[
          [
            t("01 / Selecteren", "01 / Select"),
            t(
              `${POPULATION} routes strijden om de kortste afstand. Kortere routes hebben meer kans om ouder te worden.`,
              `${POPULATION} routes compete for the shortest distance. Shorter routes are more likely to become parents.`,
            ),
          ],
          [
            t("02 / Combineren", "02 / Combine"),
            t(
              "Een deel van de ene route wordt gecombineerd met de volgorde van een andere. Elke stop blijft precies één keer in de ronde.",
              "Part of one route is combined with the order of another. Every stop stays in the tour exactly once.",
            ),
          ],
          [
            t("03 / Muteren", "03 / Mutate"),
            t(
              "Soms keert een stukje route om. De twee beste routes blijven altijd behouden, dus de beste afstand wordt nooit slechter.",
              "Sometimes a section reverses. The two best routes always survive, so the best distance never gets worse.",
            ),
          ],
        ].map(([title, body]) => (
          <div key={title}>
            <h3 className="mb-2 font-medium">{title}</h3>
            <p className="leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </div>
      <details className="border-t border-line px-5 py-4 text-sm sm:px-7">
        <summary className="cursor-pointer font-medium">
          <Dna className="mr-2 inline size-4" aria-hidden="true" />
          {t("Wat je hier ziet", "What you are seeing")}
        </summary>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted">
          {t(
            "Een echt genetisch zoekalgoritme dat lokaal in je browser rekent. Geen vooraf opgenomen animatie. De afstand telt alle rechte verbindingen én de terugweg, in kaarteenheden (u). De vergelijking gebruikt de beste route uit de startpopulatie. Dit is een heuristiek, geen bewijs van de kortst mogelijke route. Herstarten gebruikt dezelfde willekeurige reeks; zo kun je mutatiekansen eerlijk vergelijken. Na 1.000 generaties stopt de proef.",
            "A real genetic search algorithm running locally in your browser. No prerecorded animation. Distance includes all straight connections and the return trip, in map units (u). The comparison uses the best route in the initial population. This is a heuristic, not proof of the shortest possible route. Restarting uses the same random sequence so you can compare mutation settings fairly. The experiment stops after 1,000 generations.",
          )}
        </p>
        <p className="mt-3 text-muted">
          {t("Verder lezen:", "Further reading:")}{" "}
          <a
            className="text-accent underline"
            href="https://natureofcode.com/genetic-algorithms/"
            target="_blank"
            rel="noreferrer"
          >
            The Nature of Code — Evolutionary Computing
          </a>
        </p>
      </details>
    </section>
  );
}
