import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { tx, useLocale, type Locale } from "@/lib/i18n/locale";
import {
  fmtAu,
  fmtDayLength,
  fmtKm,
  fmtMillionKm,
  fmtPeriod,
  planetFact,
  planetName,
  PLANETS,
  SUN,
  type Planet,
  type PlanetId,
} from "@/lib/lab/planets";
import { cn } from "@/lib/utils";

type SelectedId = PlanetId | "zon" | null;

/** Schematic, compressed orbit radii (px @ zoom 1) — not to scale. Keeps Neptune on screen. */
const ORBIT_PX: Record<PlanetId, number> = {
  mercurius: 42,
  venus: 62,
  aarde: 84,
  mars: 108,
  jupiter: 152,
  saturnus: 196,
  uranus: 236,
  neptunus: 272,
};

/** Schematic planet dot radii (px @ zoom 1) — compressed, not to scale. */
const PLANET_PX: Record<PlanetId, number> = {
  mercurius: 3.2,
  venus: 5.4,
  aarde: 5.8,
  mars: 4.2,
  jupiter: 12.5,
  saturnus: 11,
  uranus: 8,
  neptunus: 7.6,
};

const SUN_PX = 16;
const SQUISH = 0.62;
const EARTH_DISPLAY_SECONDS = 16;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3.2;

/** Angular speed (rad/s at 1x) — periods compressed with sqrt so outer planets still visibly move. */
const BASE_SECONDS: Record<PlanetId, number> = Object.fromEntries(
  PLANETS.map((p) => [p.id, EARTH_DISPLAY_SECONDS * Math.sqrt(p.periodDays / 365.25)]),
) as Record<PlanetId, number>;

const START_ANGLE: Record<PlanetId, number> = Object.fromEntries(
  PLANETS.map((p, i) => [p.id, i * 0.85]),
) as Record<PlanetId, number>;

const SPEEDS = [0.25, 1, 2, 4];

type ScreenPlanet = { id: PlanetId; x: number; y: number; r: number };

export function SolarSystemLab() {
  const { locale } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selected, setSelected] = useState<SelectedId>(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  const pausedRef = useRef(false);
  const speedRef = useRef(1);
  const timeRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const followRef = useRef<PlanetId | null>(null);
  const cameraFreeRef = useRef(true);
  const screenPlanetsRef = useRef<ScreenPlanet[]>([]);
  const sunScreenRef = useRef({ x: 0, y: 0, r: SUN_PX });
  const selectedRef = useRef<SelectedId>(null);
  const localeRef = useRef<Locale>(locale);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  function selectPlanet(id: SelectedId) {
    setSelected(id);
    followRef.current = id && id !== "zon" ? id : null;
    cameraFreeRef.current = id == null;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      pausedRef.current = true;
      setPaused(true);
    }

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function colors() {
      const s = getComputedStyle(document.documentElement);
      return {
        line: s.getPropertyValue("--line-strong").trim() || "rgba(255,255,255,0.18)",
        lineSoft: s.getPropertyValue("--line").trim() || "rgba(255,255,255,0.1)",
        ink: s.getPropertyValue("--ink").trim() || "#f1efe8",
        muted: s.getPropertyValue("--ink-muted").trim() || "#9b9da6",
        accent: s.getPropertyValue("--accent").trim() || "#5b8cff",
        paper: s.getPropertyValue("--paper").trim() || "#0c0d11",
      };
    }

    function resize() {
      const rect = container!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    function worldCenter() {
      return { x: width / 2 + panRef.current.x, y: height / 2 + panRef.current.y };
    }

    function planetPos(planet: Planet) {
      const angle = START_ANGLE[planet.id] + timeRef.current * ((2 * Math.PI) / BASE_SECONDS[planet.id]);
      const r = ORBIT_PX[planet.id] * zoomRef.current;
      const c = worldCenter();
      return {
        x: c.x + Math.cos(angle) * r,
        y: c.y + Math.sin(angle) * r * SQUISH,
        angle,
        r,
      };
    }

    function draw() {
      const c = colors();
      ctx!.clearRect(0, 0, width, height);
      const center = worldCenter();

      ctx!.strokeStyle = c.lineSoft;
      ctx!.lineWidth = 1;
      for (const planet of PLANETS) {
        const r = ORBIT_PX[planet.id] * zoomRef.current;
        ctx!.beginPath();
        ctx!.ellipse(center.x, center.y, r, r * SQUISH, 0, 0, Math.PI * 2);
        ctx!.stroke();
      }

      // Sun
      const sunR = SUN_PX * Math.max(0.7, Math.min(1.3, zoomRef.current));
      sunScreenRef.current = { x: center.x, y: center.y, r: sunR };
      const glow = ctx!.createRadialGradient(center.x, center.y, 0, center.x, center.y, sunR * 2.4);
      glow.addColorStop(0, "rgba(244,179,80,0.45)");
      glow.addColorStop(1, "rgba(244,179,80,0)");
      ctx!.fillStyle = glow;
      ctx!.beginPath();
      ctx!.arc(center.x, center.y, sunR * 2.4, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.fillStyle = SUN.color;
      ctx!.beginPath();
      ctx!.arc(center.x, center.y, sunR, 0, Math.PI * 2);
      ctx!.fill();
      if (selectedRef.current === "zon") {
        ctx!.strokeStyle = c.accent;
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.arc(center.x, center.y, sunR + 5, 0, Math.PI * 2);
        ctx!.stroke();
      }

      const positions: ScreenPlanet[] = [];
      for (const planet of PLANETS) {
        const pos = planetPos(planet);
        const pr = PLANET_PX[planet.id] * Math.max(0.65, Math.min(1.6, zoomRef.current));
        positions.push({ id: planet.id, x: pos.x, y: pos.y, r: pr });

        if (planet.ring) {
          ctx!.strokeStyle = c.muted;
          ctx!.lineWidth = Math.max(1, pr * 0.22);
          ctx!.beginPath();
          ctx!.ellipse(pos.x, pos.y, pr * 1.9, pr * 0.7, -0.5, 0, Math.PI * 2);
          ctx!.stroke();
        }

        ctx!.fillStyle = planet.color;
        ctx!.beginPath();
        ctx!.arc(pos.x, pos.y, pr, 0, Math.PI * 2);
        ctx!.fill();

        if (selectedRef.current === planet.id) {
          ctx!.strokeStyle = c.accent;
          ctx!.lineWidth = 2;
          ctx!.beginPath();
          ctx!.arc(pos.x, pos.y, pr + 5, 0, Math.PI * 2);
          ctx!.stroke();
        }

        if (zoomRef.current > 0.7) {
          ctx!.fillStyle = c.muted;
          ctx!.font = "10px IBM Plex Mono, monospace";
          ctx!.textAlign = "center";
          ctx!.fillText(planetName(planet, localeRef.current), pos.x, pos.y + pr + 13);
        }
      }
      screenPlanetsRef.current = positions;
    }

    function step(ts: number) {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dtReal = Math.min(0.1, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;
      if (!pausedRef.current) timeRef.current += dtReal * speedRef.current;

      if (followRef.current) {
        const planet = PLANETS.find((p) => p.id === followRef.current)!;
        const angle = START_ANGLE[planet.id] + timeRef.current * ((2 * Math.PI) / BASE_SECONDS[planet.id]);
        const r = ORBIT_PX[planet.id] * zoomRef.current;
        const offX = Math.cos(angle) * r;
        const offY = Math.sin(angle) * r * SQUISH;
        panRef.current.x += (-offX - panRef.current.x) * 0.12;
        panRef.current.y += (-offY - panRef.current.y) * 0.12;
      }

      draw();
      raf = requestAnimationFrame(step);
    }

    function hitTest(px: number, py: number): SelectedId {
      let best: SelectedId = null;
      let bestDist = Infinity;
      const sun = sunScreenRef.current;
      const sunDist = Math.hypot(px - sun.x, py - sun.y);
      if (sunDist <= sun.r + 6) {
        best = "zon";
        bestDist = sunDist;
      }
      for (const p of screenPlanetsRef.current) {
        const d = Math.hypot(px - p.x, py - p.y);
        const hitR = Math.max(p.r + 6, 10);
        if (d <= hitR && d < bestDist) {
          best = p.id;
          bestDist = d;
        }
      }
      return best;
    }

    const pointers = new Map<number, { x: number; y: number }>();
    let dragStart: { x: number; y: number; panX: number; panY: number } | null = null;
    let dragMoved = false;
    let pinchStart: { dist: number; zoom: number } | null = null;

    function toLocal(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function onPointerDown(e: PointerEvent) {
      canvas!.setPointerCapture(e.pointerId);
      const local = toLocal(e);
      pointers.set(e.pointerId, local);
      cameraFreeRef.current = true;
      followRef.current = null;
      if (pointers.size === 1) {
        dragStart = { x: local.x, y: local.y, panX: panRef.current.x, panY: panRef.current.y };
        dragMoved = false;
      } else if (pointers.size === 2) {
        const pts = [...pointers.values()];
        pinchStart = { dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), zoom: zoomRef.current };
      }
    }

    function onPointerMove(e: PointerEvent) {
      if (!pointers.has(e.pointerId)) return;
      const local = toLocal(e);
      pointers.set(e.pointerId, local);

      if (pointers.size === 2 && pinchStart) {
        const pts = [...pointers.values()];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const next = (pinchStart.zoom * dist) / Math.max(1, pinchStart.dist);
        zoomRef.current = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, next));
        return;
      }

      if (pointers.size === 1 && dragStart) {
        const dx = local.x - dragStart.x;
        const dy = local.y - dragStart.y;
        if (Math.hypot(dx, dy) > 4) dragMoved = true;
        panRef.current.x = dragStart.panX + dx;
        panRef.current.y = dragStart.panY + dy;
      }
    }

    function onPointerUp(e: PointerEvent) {
      const local = pointers.get(e.pointerId) ?? toLocal(e);
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchStart = null;
      if (pointers.size === 0) {
        if (dragStart && !dragMoved) {
          const hit = hitTest(local.x, local.y);
          selectPlanet(hit);
        }
        dragStart = null;
      }
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      cameraFreeRef.current = true;
      followRef.current = null;
      const factor = Math.exp(-e.deltaY * 0.0012);
      zoomRef.current = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomRef.current * factor));
    }

    function onDoubleClick() {
      followRef.current = null;
      panRef.current = { x: 0, y: 0 };
      zoomRef.current = 1;
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("dblclick", onDoubleClick);

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("dblclick", onDoubleClick);
    };
  }, []);

  function resetView() {
    followRef.current = null;
    panRef.current = { x: 0, y: 0 };
    zoomRef.current = 1;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
          className="flex h-10 items-center gap-2 rounded-md border border-line-strong bg-elevated px-3 text-sm text-ink transition-colors duration-150 hover:border-line-strong"
          aria-pressed={paused}
        >
          {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
          {paused ? tx(locale, "Start", "Play") : tx(locale, "Pauze", "Pause")}
        </button>
        <div className="flex h-10 items-center gap-0.5 rounded-md border border-line-strong bg-elevated p-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              aria-pressed={speed === s}
              className={cn(
                "h-8 rounded px-2.5 font-mono text-xs transition-colors duration-150",
                speed === s ? "bg-accent text-accent-fg" : "text-muted hover:text-ink",
              )}
            >
              {s}×
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={resetView}
          className="flex h-10 items-center gap-2 rounded-md border border-line-strong bg-elevated px-3 text-sm text-muted transition-colors duration-150 hover:text-ink"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {tx(locale, "Reset weergave", "Reset view")}
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
        <div
          ref={containerRef}
          className="relative aspect-square w-full overflow-hidden rounded-xl border border-line bg-elevated sm:aspect-[4/3] lg:aspect-square"
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 size-full touch-none"
            role="img"
            aria-label={tx(
              locale,
              "Interactieve simulatie van het zonnestelsel. Sleep om te draaien, scroll of knijp om te zoomen, tik een planeet aan voor details.",
              "Interactive solar system simulation. Drag to pan, scroll or pinch to zoom, tap a planet for details.",
            )}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-subtle">
              {tx(locale, "Kies een lichaam", "Pick a body")}
            </p>
            <div className="mt-2 grid grid-cols-4 gap-1.5 lg:grid-cols-2">
              <button
                type="button"
                onClick={() => selectPlanet(selected === "zon" ? null : "zon")}
                aria-pressed={selected === "zon"}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-left text-xs transition-colors duration-150",
                  selected === "zon"
                    ? "border-accent bg-accent/10 text-ink"
                    : "border-line-strong bg-elevated text-muted hover:text-ink",
                )}
              >
                <span className="size-2 shrink-0 rounded-full" style={{ background: SUN.color }} aria-hidden="true" />
                <span className="truncate">{tx(locale, "Zon", "Sun")}</span>
              </button>
              {PLANETS.map((planet) => (
                <button
                  key={planet.id}
                  type="button"
                  onClick={() => selectPlanet(selected === planet.id ? null : planet.id)}
                  aria-pressed={selected === planet.id}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-left text-xs transition-colors duration-150",
                    selected === planet.id
                      ? "border-accent bg-accent/10 text-ink"
                      : "border-line-strong bg-elevated text-muted hover:text-ink",
                  )}
                >
                  <span className="size-2 shrink-0 rounded-full" style={{ background: planet.color }} aria-hidden="true" />
                  <span className="truncate">{planetName(planet, locale)}</span>
                </button>
              ))}
            </div>
          </div>

          <InfoPanel selected={selected} locale={locale} />
        </div>
      </div>

      <p className="mt-4 text-xs text-subtle">
        {tx(
          locale,
          "Afstanden, groottes en snelheid zijn schematisch — gecomprimeerd zodat Neptunus in beeld past. Cijfers in het infopaneel zijn de echte waarden.",
          "Distances, sizes and speed are schematic — compressed so Neptune stays in frame. Numbers in the info panel are the real values.",
        )}
      </p>
    </div>
  );
}

function InfoPanel({ selected, locale }: { selected: SelectedId; locale: Locale }) {
  if (!selected) {
    return (
      <div className="rounded-lg border border-dashed border-line-strong bg-elevated px-4 py-6 text-center text-sm text-muted">
        {tx(locale, "Tik een planeet of de zon aan voor de cijfers.", "Tap a planet or the sun for the numbers.")}
      </div>
    );
  }

  if (selected === "zon") {
    return (
      <div className="rounded-lg border border-line bg-elevated p-4">
        <p className="font-mono text-xs text-accent">{tx(locale, "Ster", "Star")}</p>
        <strong className="mt-1 block font-display text-lg font-semibold text-ink">
          {tx(locale, SUN.name, SUN.nameEn)}
        </strong>
        <dl className="mt-3 space-y-1.5 text-sm">
          <Row label={tx(locale, "Diameter", "Diameter")} value={`${fmtKm(SUN.diameterKm)} km`} />
          <Row
            label={tx(locale, "Oppervlaktetemp.", "Surface temp.")}
            value={`~${SUN.surfaceTempC.toLocaleString("nl-NL")} °C`}
          />
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-muted">{tx(locale, SUN.factNl, SUN.factEn)}</p>
      </div>
    );
  }

  const planet = PLANETS.find((p) => p.id === selected)!;
  return (
    <div className="rounded-lg border border-line bg-elevated p-4">
      <p className="font-mono text-xs text-accent">
        {tx(locale, "Planeet", "Planet")} · {fmtAu(planet.distanceAu)} AE
      </p>
      <strong className="mt-1 block font-display text-lg font-semibold text-ink">
        {planetName(planet, locale)}
      </strong>
      <dl className="mt-3 space-y-1.5 text-sm">
        <Row label={tx(locale, "Afstand tot zon", "Distance to sun")} value={`${fmtMillionKm(planet.distanceAu)} mln km`} />
        <Row label={tx(locale, "Omlooptijd", "Orbital period")} value={fmtPeriod(planet.periodDays, locale)} />
        <Row label={tx(locale, "Daglengte", "Day length")} value={fmtDayLength(planet.dayHours, locale)} />
        <Row label={tx(locale, "Diameter", "Diameter")} value={`${fmtKm(planet.diameterKm)} km`} />
        <Row label={tx(locale, "Manen", "Moons")} value={planet.moons} />
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-muted">{planetFact(planet, locale)}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-mono text-ink">{value}</dd>
    </div>
  );
}
