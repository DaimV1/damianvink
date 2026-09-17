import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Pause, Play, Shuffle, SkipForward, Vibrate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tx, useLocale } from "@/lib/i18n/locale";
import {
  CHLADNI_PRESETS,
  DEFAULT_MODE,
  MODE_RANGE,
  PARTICLE_COUNT,
  makeParticles,
  randomSource,
  stepParticles,
  type Mode,
  type Particle,
} from "@/lib/lab/chladni";

const AUTO_CYCLE_MS = 3200;
const DISTURB_RADIUS = 0.1;

function nudgeTowardsPointer(particles: Particle[], pointer: { x: number; y: number }) {
  return particles.map((p) => {
    const dx = p.x - pointer.x;
    const dy = p.y - pointer.y;
    const dist = Math.hypot(dx, dy);
    if (dist > DISTURB_RADIUS || dist < 1e-4) return p;
    const push = (1 - dist / DISTURB_RADIUS) * 1.8;
    return { ...p, vx: p.vx + (dx / dist) * push, vy: p.vy + (dy / dist) * push };
  });
}

function presetIndex(mode: Mode) {
  return CHLADNI_PRESETS.findIndex((p) => p.n === mode.n && p.m === mode.m);
}

function draw(ctx: CanvasRenderingContext2D, width: number, height: number, particles: Particle[]) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#081321";
  ctx.fillRect(0, 0, width, height);
  const size = Math.min(width, height) * 0.86;
  const left = (width - size) / 2;
  const top = (height - size) / 2;
  const plate = ctx.createLinearGradient(left, top, left + size, top + size);
  plate.addColorStop(0, "#111f34");
  plate.addColorStop(1, "#0a1524");
  ctx.fillStyle = plate;
  ctx.fillRect(left, top, size, size);
  ctx.strokeStyle = "rgba(148,163,184,0.35)";
  ctx.lineWidth = Math.max(1, size / 300);
  ctx.strokeRect(left, top, size, size);
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "rgba(255, 214, 150, 0.55)";
  const r = Math.max(1, size / 420);
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(left + p.x * size, top + p.y * size, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
}

export function ChladniPlate() {
  const { locale } = useLocale();
  const t = (nl: string, en: string) => tx(locale, nl, en);
  const [mode, setMode] = useState<Mode>(DEFAULT_MODE);
  const [running, setRunning] = useState(true);
  const [autoCycle, setAutoCycle] = useState(false);
  const [scatterTick, setScatterTick] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>(makeParticles(PARTICLE_COUNT, 1));
  const modeRef = useRef(mode);
  const runningRef = useRef(running);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const reducedMotion = useRef(false);
  const random = useRef(randomSource(7));

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = query.matches;
    setRunning(!query.matches);
    const onChange = () => {
      reducedMotion.current = query.matches;
      setRunning(!query.matches);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  function settleInstantly() {
    const { n, m } = modeRef.current;
    let next = particles.current;
    for (let i = 0; i < 500; i++) next = stepParticles(next, n, m, 1 / 60, random.current);
    particles.current = next;
  }

  // Scatter fresh sand whenever the visitor asks for it (and once on mount).
  useEffect(() => {
    particles.current = makeParticles(PARTICLE_COUNT, Date.now() & 0xffff);
    if (reducedMotion.current) settleInstantly();
  }, [scatterTick]);

  // Visitors who asked for reduced motion never see the live settling animation,
  // so jump the existing grains straight to the new pattern's resting shape instead.
  useEffect(() => {
    if (reducedMotion.current) settleInstantly();
  }, [mode]);

  useEffect(() => {
    const element = host.current;
    const canvasEl = canvas.current;
    if (!element || !canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    let last = performance.now();
    const resize = new ResizeObserver(() => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvasEl.width = Math.round(element.clientWidth * dpr);
      canvasEl.height = Math.round(element.clientHeight * dpr);
    });
    resize.observe(element);
    const loop = (time: number) => {
      const dt = Math.min((time - last) / 1000, 1 / 30);
      last = time;
      if (!document.hidden) {
        if (runningRef.current) {
          const { n, m } = modeRef.current;
          let next = stepParticles(particles.current, n, m, dt, random.current);
          if (pointer.current) next = nudgeTowardsPointer(next, pointer.current);
          particles.current = next;
        }
        draw(ctx, canvasEl.width, canvasEl.height, particles.current);
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!autoCycle) return;
    const timer = window.setInterval(() => {
      setMode((current) => {
        const index = presetIndex(current);
        const next = CHLADNI_PRESETS[(index + 1) % CHLADNI_PRESETS.length];
        return next;
      });
    }, AUTO_CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [autoCycle]);

  function locatePointer(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height) * 0.86;
    const left = rect.left + (rect.width - size) / 2;
    const top = rect.top + (rect.height - size) / 2;
    pointer.current = {
      x: (event.clientX - left) / size,
      y: (event.clientY - top) / size,
    };
  }

  const index = presetIndex(mode);

  return (
    <section
      aria-labelledby="chladni-title"
      className="overflow-hidden rounded-xl border border-line bg-elevated"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-5 sm:p-7">
        <div>
          <p className="mb-2 font-mono text-sm uppercase tracking-widest text-accent">
            Chladni Plate / 08
          </p>
          <h2 id="chladni-title" className="font-display text-2xl sm:text-3xl">
            {t("Zand vindt de stilte.", "Sand finds the stillness.")}
          </h2>
          <p className="mt-2 max-w-2xl text-base text-muted">
            {t(
              "Een trillende plaat, geen geluid nodig. Zandkorrels bewegen weg van waar de plaat trilt en verzamelen zich op de plekken die stilstaan.",
              "A vibrating plate, no sound required. Grains of sand move away from where the plate shakes and collect where it stays still.",
            )}
          </p>
        </div>
        <span className="rounded-full border border-line px-3 py-2 font-mono text-sm text-muted">
          {t("Staande golven", "Standing waves")}
        </span>
      </div>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <div
            ref={host}
            className="relative h-[350px] touch-none overflow-hidden bg-[#081321] sm:h-[440px] lg:h-[480px]"
            onPointerMove={(event) => locatePointer(event)}
            onPointerDown={(event) => locatePointer(event)}
            onPointerLeave={() => {
              pointer.current = null;
            }}
            role="img"
            aria-label={t(
              `Chladni-patroon voor modus n=${mode.n}, m=${mode.m}, met ${PARTICLE_COUNT} zandkorrels`,
              `Chladni pattern for mode n=${mode.n}, m=${mode.m}, with ${PARTICLE_COUNT} grains of sand`,
            )}
          >
            <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-line px-5 py-3 text-sm text-muted">
            <span className="font-mono">
              n={mode.n}, m={mode.m}
            </span>
            <span>{t(`~${PARTICLE_COUNT} zandkorrels`, `~${PARTICLE_COUNT} grains of sand`)}</span>
            <span>
              {t("Sleep over de plaat om te verstoren", "Drag across the plate to disturb it")}
            </span>
          </div>
        </div>
        <aside
          className="flex flex-col gap-5 border-t border-line p-5 lg:border-l lg:border-t-0"
          aria-label={t("Trillingbediening", "Vibration controls")}
        >
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => setRunning((v) => !v)}>
              {running ? (
                <Pause className="size-4" aria-hidden="true" />
              ) : (
                <Play className="size-4" aria-hidden="true" />
              )}
              {running ? t("Pauze", "Pause") : t("Trillen", "Vibrate")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setAutoCycle(false);
                setMode(CHLADNI_PRESETS[(index + 1) % CHLADNI_PRESETS.length]);
              }}
            >
              <SkipForward className="size-4" aria-hidden="true" />
              {t("Volgend patroon", "Next pattern")}
            </Button>
          </div>
          <div>
            <label htmlFor="chladni-n" className="flex justify-between text-sm">
              {t("Modus n", "Mode n")}
              <span className="font-mono text-accent">{mode.n}</span>
            </label>
            <input
              id="chladni-n"
              type="range"
              min={MODE_RANGE.min}
              max={MODE_RANGE.max - 1}
              step={1}
              value={mode.n}
              onChange={(event) => {
                setAutoCycle(false);
                const n = Number(event.target.value);
                setMode((current) => ({ n, m: Math.max(n + 1, current.m) }));
              }}
              className="h-8 w-full accent-[var(--accent)]"
            />
          </div>
          <div>
            <label htmlFor="chladni-m" className="flex justify-between text-sm">
              {t("Modus m", "Mode m")}
              <span className="font-mono text-accent">{mode.m}</span>
            </label>
            <input
              id="chladni-m"
              type="range"
              min={mode.n + 1}
              max={MODE_RANGE.max}
              step={1}
              value={mode.m}
              onChange={(event) => {
                setAutoCycle(false);
                setMode((current) => ({ ...current, m: Number(event.target.value) }));
              }}
              className="h-8 w-full accent-[var(--accent)]"
            />
            <p className="text-sm text-muted">
              {t(
                "Twee golfgetallen bepalen het patroon — samen goed voor 36 unieke figuren.",
                "Two wave numbers set the pattern — 36 unique figures in total.",
              )}
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoCycle}
              onChange={(event) => setAutoCycle(event.target.checked)}
              className="size-4 accent-[var(--accent)]"
            />
            {t("Doorloop alle patronen automatisch", "Cycle through every pattern automatically")}
          </label>
          <Button
            variant="secondary"
            onClick={() => {
              setAutoCycle(false);
              setScatterTick((v) => v + 1);
            }}
          >
            <Shuffle className="size-4" aria-hidden="true" />
            {t("Strooi zand opnieuw", "Scatter the sand again")}
          </Button>
        </aside>
      </div>
      <div className="grid gap-5 border-t border-line p-5 text-base sm:p-7 md:grid-cols-3">
        {[
          [
            t("01 / Trillen", "01 / Vibrate"),
            t(
              "De plaat trilt volgens twee golfgetallen n en m. Waar de uitwijking groot is (de antiknopen), beweegt het oppervlak het meest.",
              "The plate vibrates according to two wave numbers, n and m. Where displacement is large — the antinodes — the surface moves the most.",
            ),
          ],
          [
            t("02 / Botsen", "02 / Bounce"),
            t(
              "Zandkorrels op een antiknoop worden weggeschud, met een kracht die groter is naarmate de plaat daar harder trilt.",
              "Grains of sand sitting on an antinode get shaken off, with a force that grows with how hard the plate moves there.",
            ),
          ],
          [
            t("03 / Bezinken", "03 / Settle"),
            t(
              "Op de knooplijnen staat de plaat stil, dus daar houdt niets het zand meer weg. De korrels verzamelen zich precies daar.",
              "Along the nodal lines the plate stands still, so nothing shakes the sand away any more. The grains collect exactly there.",
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
          <Vibrate className="mr-2 inline size-4" aria-hidden="true" />
          {t("Wat je hier ziet", "What you are seeing")}
        </summary>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted">
          {t(
            "Een echte deeltjessimulatie die lokaal in je browser rekent, geen geanimeerde afbeelding. Het patroon is een veelgebruikte wiskundige benadering voor een vierkante plaat — U(x,y) = cos(nπx)cos(mπy) − cos(mπx)cos(nπy) — geen opgeloste trillingsvergelijking en geen geluid. Elke korrel beweegt weg van waar de uitwijking groot is en schudt naar verhouding van hoe groot die uitwijking daar is; op een knooplijn is de uitwijking nul, dus stopt de beweging vanzelf.",
            "A genuine particle simulation running locally in your browser, not an animated image. The pattern is a widely used mathematical approximation for a square plate — U(x,y) = cos(nπx)cos(mπy) − cos(mπx)cos(nπy) — not a solved vibration equation, and there is no sound. Each grain moves away from where displacement is large and shakes in proportion to how large it is there; along a nodal line displacement is zero, so the motion stops on its own.",
          )}
        </p>
        <p className="mt-3 text-muted">
          {t("Verder lezen:", "Further reading:")}{" "}
          <a
            className="text-accent underline"
            href="https://en.wikipedia.org/wiki/Chladni_figure"
            target="_blank"
            rel="noreferrer"
          >
            Wikipedia — Chladni figure
          </a>
        </p>
      </details>
    </section>
  );
}
