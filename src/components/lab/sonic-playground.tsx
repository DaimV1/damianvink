import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { Music2, Pause, Play, Plus, RotateCcw, Shuffle, Trash2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tx, useLocale } from "@/lib/i18n/locale";
import {
  MAX_NOTES,
  ROWS,
  STEPS,
  starterNotes,
  stepDuration,
  varyNotes,
  type Instrument,
  type SonicNote,
} from "@/lib/lab/sonic";
import { SonicAudio } from "@/lib/lab/sonic-audio";

const COLORS = { bass: "#70e5ce", melody: "#c0a2ff", drum: "#ffbd7c" };
function Shape({ instrument }: { instrument: Instrument }) {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden="true">
      {instrument === "bass" ? (
        <circle cx="20" cy="20" r="15" fill="currentColor" />
      ) : instrument === "melody" ? (
        <path d="M20 3 L38 35 H2 Z" fill="currentColor" />
      ) : (
        <rect x="5" y="5" width="30" height="30" rx="3" fill="currentColor" />
      )}
    </svg>
  );
}
export function SonicPlayground() {
  const { locale } = useLocale();
  const t = (nl: string, en: string) => tx(locale, nl, en);
  const [notes, setNotes] = useState(starterNotes);
  const [instrument, setInstrument] = useState<Instrument>("melody");
  const [selected, setSelected] = useState<number | null>(null);
  const [bpm, setBpm] = useState(100);
  const [volume, setVolume] = useState(45);
  const [running, setRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [cursor, setCursor] = useState(0);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState(false);
  const [variation, setVariation] = useState(0);
  const [undo, setUndo] = useState<SonicNote[] | null>(null);
  const engine = useRef<SonicAudio | null>(null);
  const settings = useRef({ notes, bpm, volume });
  const board = useRef<HTMLDivElement>(null);
  const drag = useRef<number | null>(null);
  const nextId = useRef(100);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const frame = useRef(0);
  const request = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    settings.current = { notes, bpm, volume };
    engine.current?.volume(volume / 100);
  }, [notes, bpm, volume]);
  const cancel = useCallback(() => {
    request.current++;
    if (timer.current !== null) clearInterval(timer.current);
    timer.current = null;
    cancelAnimationFrame(frame.current);
    engine.current?.silence();
  }, []);
  const stop = useCallback(() => {
    cancel();
    void engine.current?.context.suspend().catch(() => {});
    setRunning(false);
    setStarting(false);
    setActiveStep(-1);
    setCursor(0);
    setLevel(0);
  }, [cancel]);
  useEffect(() => {
    mounted.current = true;
    const hide = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      mounted.current = false;
      document.removeEventListener("visibilitychange", hide);
      cancel();
      void engine.current?.close().catch(() => {});
      engine.current = null;
    };
  }, [cancel, stop]);

  async function play() {
    if (running) {
      stop();
      return;
    }
    setError(false);
    setStarting(true);
    const token = ++request.current;
    try {
      const audio = engine.current ?? new SonicAudio();
      engine.current = audio;
      audio.volume(volume / 100);
      await audio.context.resume();
      if (!mounted.current || token !== request.current) return;
      if (audio.context.state !== "running") throw new Error("Audio unavailable");
      setStarting(false);
      setRunning(true);
      let nextTime = audio.context.currentTime + 0.06;
      let nextStep = 0;
      let shownStep = -1;
      let currentEvent = { step: 0, time: nextTime, duration: stepDuration(bpm) };
      const queue: (typeof currentEvent)[] = [];
      const schedule = () => {
        if (audio.context.state !== "running") {
          stop();
          return;
        }
        const now = audio.context.currentTime;
        if (nextTime < now) nextTime = now + 0.02;
        while (nextTime < now + 0.1) {
          const duration = stepDuration(settings.current.bpm);
          for (const note of settings.current.notes)
            if (note.step === nextStep) audio.note(note, nextTime);
          queue.push({ step: nextStep, time: nextTime, duration });
          nextTime += duration;
          nextStep = (nextStep + 1) % STEPS;
        }
      };
      schedule();
      timer.current = setInterval(schedule, 25);
      let lastPaint = 0;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const paint = (timestamp: number) => {
        if (token !== request.current) return;
        const now = audio.context.currentTime;
        while (queue.length && queue[0].time <= now) currentEvent = queue.shift()!;
        if (timestamp - lastPaint > 32) {
          if (now >= currentEvent.time) {
            if (shownStep !== currentEvent.step) {
              shownStep = currentEvent.step;
              setActiveStep(shownStep);
            }
            setCursor(
              reducedMotion
                ? currentEvent.step + 0.5
                : currentEvent.step +
                    Math.min(1, (now - currentEvent.time) / currentEvent.duration),
            );
          }
          setLevel(audio.level());
          lastPaint = timestamp;
        }
        frame.current = requestAnimationFrame(paint);
      };
      frame.current = requestAnimationFrame(paint);
    } catch {
      if (mounted.current && token === request.current) {
        stop();
        setError(true);
      }
    }
  }
  function remember() {
    setUndo(notes);
  }
  function add(step?: number, row?: number) {
    if (notes.length >= MAX_NOTES) return;
    if (step === undefined || row === undefined) {
      const free = Array.from({ length: STEPS * ROWS }, (_, i) => ({
        step: i % STEPS,
        row: Math.floor(i / STEPS),
      })).find((cell) => !notes.some((n) => n.step === cell.step && n.row === cell.row));
      if (!free) return;
      step = free.step;
      row = free.row;
    }
    const existing = notes.find((n) => n.step === step && n.row === row);
    if (existing) {
      setSelected(existing.id);
      return;
    }
    remember();
    const id = nextId.current++;
    setNotes([...notes, { id, instrument, step, row, size: 60 }]);
    setSelected(id);
  }
  function update(id: number, change: Partial<SonicNote>) {
    setNotes((current) =>
      current.map((note) => {
        if (note.id !== id) return note;
        const next = { ...note, ...change };
        if (
          current.some(
            (other) => other.id !== id && other.step === next.step && other.row === next.row,
          )
        )
          return note;
        return next;
      }),
    );
  }
  function locate(event: PointerEvent) {
    const rect = board.current!.getBoundingClientRect();
    return {
      step: Math.max(
        0,
        Math.min(STEPS - 1, Math.floor(((event.clientX - rect.left) / rect.width) * STEPS)),
      ),
      row: Math.max(
        0,
        Math.min(ROWS - 1, Math.floor(((event.clientY - rect.top) / rect.height) * ROWS)),
      ),
    };
  }
  const current = notes.find((note) => note.id === selected);
  function remove(id: number) {
    if (notes.length === 1) stop();
    remember();
    setNotes(notes.filter((note) => note.id !== id));
    setSelected(null);
  }
  const name = (value: Instrument) =>
    value === "bass" ? t("Bas", "Bass") : value === "melody" ? t("Melodie", "Melody") : "Drums";
  return (
    <section
      aria-labelledby="sonic-title"
      className="overflow-hidden rounded-xl border border-line bg-elevated"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-7">
        <div>
          <p className="mb-2 font-mono text-sm uppercase tracking-widest text-accent">
            Sonic Playground / 09
          </p>
          <h2 id="sonic-title" className="font-display text-3xl sm:text-4xl">
            {t("Geef je ideeën een geluid.", "Give your ideas a sound.")}
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted">
            {t(
              "Plaats een vorm. Verschuif een toon. Maak een loop die van jou is.",
              "Place a shape. Shift a note. Make a loop of your own.",
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-line px-4 py-2 text-sm text-muted">
          <Music2 className="size-4" aria-hidden="true" />
          {t("16 stappen · eindeloos spelen", "16 steps · endless play")}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-y border-line px-5 py-4 sm:px-7">
        <Button
          onClick={() => void play()}
          disabled={starting || notes.length === 0}
          aria-label={
            running ? t("Pauzeer muziek", "Pause music") : t("Speel muziek af", "Play music")
          }
        >
          {running ? (
            <Pause className="size-4" aria-hidden="true" />
          ) : (
            <Play className="size-4" aria-hidden="true" />
          )}
          {starting
            ? t("Starten…", "Starting…")
            : running
              ? t("Pauze", "Pause")
              : t("Afspelen", "Play")}
        </Button>
        <Button
          variant="secondary"
          disabled={!notes.some((n) => n.instrument === "melody")}
          onClick={() => {
            remember();
            setNotes(varyNotes(notes));
            setVariation((v) => v + 1);
          }}
        >
          <Shuffle className="size-4" aria-hidden="true" />
          {t("Maak een variatie", "Make a variation")}
        </Button>
        <span role="status" className="text-sm text-muted">
          {running
            ? t("Je loop speelt", "Your loop is playing")
            : t("Geluid start met Afspelen", "Sound starts with Play")}
          {variation > 0 ? ` · ${t("Variatie", "Variation")} ${variation}` : ""}
        </span>
        <div className="ml-auto flex items-center gap-2 text-sm text-muted">
          <Volume2 className="size-4" aria-hidden="true" />
          <meter
            min="0"
            max="100"
            value={level}
            aria-label={t("Audio-uitgangsniveau", "Audio output level")}
            className="h-3 w-20"
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="border-b border-line p-5 text-base">
          {t(
            "Geluid kon niet starten. Probeer opnieuw of gebruik een recente browser die Web Audio ondersteunt.",
            "Sound could not start. Try again or use a recent browser that supports Web Audio.",
          )}
        </p>
      )}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          <div
            className="flex flex-wrap items-center gap-2 px-5 py-4"
            role="group"
            aria-label={t("Kies je instrument", "Choose your instrument")}
          >
            {(["bass", "melody", "drum"] as const).map((item) => (
              <Button
                key={item}
                variant={instrument === item ? "primary" : "secondary"}
                aria-pressed={instrument === item}
                onClick={() => setInstrument(item)}
              >
                <span
                  className="size-5"
                  style={{ color: instrument === item ? "currentColor" : COLORS[item] }}
                >
                  <Shape instrument={item} />
                </span>
                {name(item)}
              </Button>
            ))}
            <Button variant="ghost" onClick={() => add()} disabled={notes.length >= MAX_NOTES}>
              <Plus className="size-4" aria-hidden="true" />
              {t("Vorm toevoegen", "Add shape")}
            </Button>
          </div>
          <div
            className="overflow-x-auto overscroll-x-contain border-y border-line bg-[#0c1020] p-4 sm:p-5"
            aria-label={t(
              "Muziekveld, horizontaal scrollbaar op kleine schermen",
              "Music field, scroll horizontally on small screens",
            )}
          >
            <div className="min-w-[640px]">
              <div className="mb-3 grid grid-cols-4 font-mono text-sm text-slate-400">
                {[1, 2, 3, 4].map((beat) => (
                  <span key={beat}>
                    {t("TEL", "BEAT")} {beat}
                  </span>
                ))}
              </div>
              <div
                ref={board}
                className="relative h-[320px]"
                onPointerDown={(event) => {
                  if (event.button === 0 && event.target === event.currentTarget) {
                    const cell = locate(event);
                    add(cell.step, cell.row);
                  }
                }}
                aria-label={t(
                  "Klik op een lege cel om een vorm te plaatsen",
                  "Click an empty cell to place a shape",
                )}
              >
                <div className="pointer-events-none absolute inset-0 grid grid-cols-16">
                  {Array.from({ length: STEPS }, (_, i) => (
                    <div
                      key={i}
                      className="border-l border-white/10"
                      style={{
                        background:
                          activeStep === i
                            ? "rgba(192,162,255,0.09)"
                            : i % 4 === 0
                              ? "rgba(255,255,255,0.025)"
                              : undefined,
                      }}
                    />
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-0 grid grid-rows-8">
                  {Array.from({ length: ROWS }, (_, i) => (
                    <div key={i} className="border-t border-white/10" />
                  ))}
                </div>
                {running && (
                  <div
                    className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white/80 shadow-[0_0_14px_2px_#c0a2ff]"
                    style={{ left: `${(cursor / STEPS) * 100}%` }}
                  />
                )}
                {notes.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    aria-label={`${name(note.instrument)}, ${t("stap", "step")} ${note.step + 1}, ${t("hoogte", "pitch")} ${ROWS - note.row}`}
                    aria-pressed={selected === note.id}
                    className="absolute z-20 flex size-10 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-white"
                    style={{
                      left: `${((note.step + 0.5) / STEPS) * 100}%`,
                      top: `${((note.row + 0.5) / ROWS) * 100}%`,
                      color: COLORS[note.instrument],
                      background: selected === note.id ? "rgba(255,255,255,0.12)" : undefined,
                    }}
                    onFocus={() => setSelected(note.id)}
                    onPointerDown={(event) => {
                      if (event.button !== 0) return;
                      event.stopPropagation();
                      remember();
                      setSelected(note.id);
                      drag.current = note.id;
                      event.currentTarget.setPointerCapture(event.pointerId);
                    }}
                    onPointerMove={(event) => {
                      if (drag.current === note.id) update(note.id, locate(event));
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
                      const direction: Record<string, [number, number]> = {
                        ArrowLeft: [-1, 0],
                        ArrowRight: [1, 0],
                        ArrowUp: [0, -1],
                        ArrowDown: [0, 1],
                      };
                      if (direction[event.key]) {
                        event.preventDefault();
                        remember();
                        const [x, y] = direction[event.key];
                        update(note.id, {
                          step: Math.max(0, Math.min(15, note.step + x)),
                          row: Math.max(0, Math.min(7, note.row + y)),
                        });
                      }
                      if (event.key === "Delete" || event.key === "Backspace") {
                        event.preventDefault();
                        remove(note.id);
                      }
                    }}
                  >
                    <span
                      className="block"
                      style={{
                        width: 18 + note.size * 0.18,
                        height: 18 + note.size * 0.18,
                        filter:
                          activeStep === note.step
                            ? `brightness(1.5) drop-shadow(0 0 8px ${COLORS[note.instrument]})`
                            : undefined,
                      }}
                    >
                      <Shape instrument={note.instrument} />
                    </span>
                  </button>
                ))}
                {notes.length === 0 && (
                  <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-base text-slate-400">
                    {t(
                      "Een leeg veld. Alle ruimte voor jouw geluid.",
                      "An empty field. Room for your sound.",
                    )}
                  </p>
                )}
              </div>
              <div className="mt-3 flex justify-between font-mono text-xs text-slate-400">
                <span>{t("LINKS → RECHTS = TIJD", "LEFT → RIGHT = TIME")}</span>
                <span>{t("OMHOOG = HOGERE TOON", "UP = HIGHER PITCH")}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm text-muted">
            <span>
              {t(
                "Sleep vormen · pijltjes verplaatsen · Delete verwijdert",
                "Drag shapes · arrow keys move · Delete removes",
              )}
            </span>
            <span className="font-mono">
              {notes.length}/{MAX_NOTES} {t("vormen", "shapes")}
            </span>
          </div>
          <div className="grid gap-4 p-5 pt-0 sm:grid-cols-3">
            {(["bass", "melody", "drum"] as const).map((item) => (
              <div key={item}>
                <h3 className="mb-1 font-medium">{name(item)}</h3>
                <p className="text-sm leading-relaxed text-muted">
                  {item === "bass"
                    ? t("De cirkel legt een warme basis.", "The circle lays a warm foundation.")
                    : item === "melody"
                      ? t(
                          "De driehoek geeft je loop een melodie.",
                          "The triangle gives your loop a melody.",
                        )
                      : t(
                          "Onder: kick. Midden: snare. Boven: hi-hat.",
                          "Bottom: kick. Middle: snare. Top: hi-hat.",
                        )}
                </p>
              </div>
            ))}
          </div>
        </div>
        <aside
          className="space-y-5 border-t border-line p-5 lg:border-l lg:border-t-0"
          aria-label={t("Muziekbediening", "Music controls")}
        >
          <div>
            <label htmlFor="sonic-tempo" className="flex justify-between text-sm">
              Tempo <span className="font-mono text-accent">{bpm} BPM</span>
            </label>
            <input
              id="sonic-tempo"
              type="range"
              min="60"
              max="160"
              step="1"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="h-9 w-full accent-[var(--accent)]"
            />
            <div className="flex justify-between text-sm text-muted">
              <span>Ambient</span>
              <span>{t("Energiek", "Energetic")}</span>
            </div>
          </div>
          <div>
            <label htmlFor="sonic-volume" className="flex justify-between text-sm">
              Volume <span className="font-mono text-accent">{volume}%</span>
            </label>
            <input
              id="sonic-volume"
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-9 w-full accent-[var(--accent)]"
            />
          </div>
          <div className="space-y-3 border-y border-line py-5">
            <h3 className="font-medium">{t("Jouw vorm", "Your shape")}</h3>
            {current ? (
              <>
                <p className="text-sm text-muted">
                  {name(current.instrument)} · {t("stap", "step")} {current.step + 1}
                </p>
                <label htmlFor="sonic-size" className="flex justify-between text-sm">
                  {t("Grootte / sterkte", "Size / strength")}{" "}
                  <span className="font-mono text-accent">{current.size}%</span>
                </label>
                <input
                  id="sonic-size"
                  type="range"
                  min="15"
                  max="100"
                  step="5"
                  value={current.size}
                  onChange={(e) => update(current.id, { size: Number(e.target.value) })}
                  className="h-8 w-full accent-[var(--accent)]"
                />
                <label htmlFor="sonic-pitch" className="flex justify-between text-sm">
                  {t("Hoogte", "Pitch")}
                  <span>{ROWS - current.row}/8</span>
                </label>
                <input
                  id="sonic-pitch"
                  type="range"
                  min="1"
                  max="8"
                  value={ROWS - current.row}
                  onChange={(e) => update(current.id, { row: ROWS - Number(e.target.value) })}
                  className="h-8 w-full accent-[var(--accent)]"
                />
                <Button variant="secondary" onClick={() => remove(current.id)}>
                  <Trash2 className="size-4" aria-hidden="true" />
                  {t("Verwijder vorm", "Remove shape")}
                </Button>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-muted">
                {t(
                  "Selecteer een vorm om de grootte en toonhoogte aan te passen. Groter klinkt sterker.",
                  "Select a shape to adjust its size and pitch. Bigger sounds stronger.",
                )}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              disabled={!undo}
              onClick={() => {
                if (undo) {
                  stop();
                  setNotes(undo);
                  setUndo(null);
                  setSelected(null);
                }
              }}
            >
              {t("Ongedaan maken", "Undo")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                stop();
                remember();
                setNotes(starterNotes());
                setSelected(null);
                setBpm(100);
                setVariation(0);
              }}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              {t("Startpatroon", "Starter pattern")}
            </Button>
            <Button
              variant="ghost"
              disabled={notes.length === 0}
              onClick={() => {
                stop();
                remember();
                setNotes([]);
                setSelected(null);
              }}
            >
              {t("Leeg het veld", "Clear the field")}
            </Button>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            {t(
              "Alle melodietonen passen in C-pentatonisch. Variaties veranderen de melodie; bas en drums bewaren de groove.",
              "Every melodic note fits C pentatonic. Variations change the melody; bass and drums keep the groove.",
            )}
          </p>
        </aside>
      </div>
    </section>
  );
}
