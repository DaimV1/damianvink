import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Box, Globe2, Orbit, Pause, Play, RotateCcw, Ruler, Sparkles } from "lucide-react";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { InteractiveScene } from "@/components/interactive-scene";
import { tx, useLocale } from "@/lib/i18n/locale";
import { pageHead } from "@/lib/seo";
import {
  BOLT_OPTIONS,
  BRACKET_DEFAULTS,
  LOAD_RANGE,
  requiredThicknessMm,
  SPAN_RANGE,
  type BoltCount,
} from "@/lib/lab/bracket";

export const Route = createFileRoute("/ai-lab")({
  head: () =>
    pageHead({
      title: "Interactive Lab — Damian Vink",
      description:
        "Interactieve 3D-demo’s: ontdek een lagerassemblage in exploded view, bestuur een draaiende wereldbol, verken een zonnestelsel, speel met een muisreactief deeltjesveld en genereer een parametrische beugel.",
      path: "/ai-lab",
    }),
  component: Lab,
});
function Lab() {
  const { locale } = useLocale();
  const t = (nl: string, en: string) => tx(locale, nl, en);
  const [kind, setKind] = useState<"assembly" | "earth" | "solar" | "particles" | "bracket">(
    "assembly",
  );
  const [spread, setSpread] = useState(45);
  const [angle, setAngle] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [reset, setReset] = useState(0);
  const [span, setSpan] = useState(BRACKET_DEFAULTS.span);
  const [load, setLoad] = useState(BRACKET_DEFAULTS.load);
  const [bolts, setBolts] = useState<BoltCount>(BRACKET_DEFAULTS.bolts);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPlaying(!query.matches);
    const onChange = () => setPlaying(!query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  function choose(next: typeof kind) {
    setKind(next);
    setAngle(0);
  }
  const assembly = kind === "assembly";
  const solar = kind === "solar";
  const particles = kind === "particles";
  const bracket = kind === "bracket";
  return (
    <SiteShell>
      <PageWrap wide>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 font-mono text-sm uppercase tracking-[0.18em] text-muted">
              Damian Vink / Interactive Lab
            </p>
            <h1 className="text-4xl font-medium tracking-tight sm:text-6xl">
              {t("Kijk. Schuif. Ontdek.", "Look. Slide. Explore.")}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
              {t(
                "Met AI gebouwd, door jou bestuurd. Vijf interactieve 3D-experimenten, rechtstreeks in je browser.",
                "Built with AI, controlled by you. Five interactive 3D experiments, right in your browser.",
              )}
            </p>
          </div>
          <span className="rounded-full border border-line px-4 py-2 font-mono text-sm text-muted">
            {t("Geen account nodig", "No account needed")}
          </span>
        </div>
        <div
          className="mb-5 flex flex-wrap gap-2"
          role="group"
          aria-label={t("Kies een demo", "Choose a demo")}
        >
          <Button
            variant={assembly ? "primary" : "secondary"}
            aria-pressed={assembly}
            onClick={() => choose("assembly")}
          >
            <Box className="size-4" aria-hidden="true" />
            01 / Exploded view
          </Button>
          <Button
            variant={kind === "earth" ? "primary" : "secondary"}
            aria-pressed={kind === "earth"}
            onClick={() => choose("earth")}
          >
            <Globe2 className="size-4" aria-hidden="true" />
            02 / {t("Wereldbol", "Globe")}
          </Button>
          <Button
            variant={solar ? "primary" : "secondary"}
            aria-pressed={solar}
            onClick={() => choose("solar")}
          >
            <Orbit className="size-4" aria-hidden="true" />
            03 / {t("Zonnestelsel", "Solar system")}
          </Button>
          <Button
            variant={particles ? "primary" : "secondary"}
            aria-pressed={particles}
            onClick={() => choose("particles")}
          >
            <Sparkles className="size-4" aria-hidden="true" />
            04 / {t("Deeltjesveld", "Particle field")}
          </Button>
          <Button
            variant={bracket ? "primary" : "secondary"}
            aria-pressed={bracket}
            onClick={() => choose("bracket")}
          >
            <Ruler className="size-4" aria-hidden="true" />
            05 / {t("Parametrische beugel", "Parametric bracket")}
          </Button>
        </div>
        <div className="overflow-hidden rounded-xl border border-line bg-elevated">
          <div className="relative bg-[#081321]">
            <div className="flex items-center justify-between gap-3 px-5 pt-5 text-sm text-slate-300">
              <span className="font-mono uppercase tracking-widest">
                {assembly
                  ? "Bearing assembly / 01"
                  : solar
                    ? "Solar system / 03"
                    : particles
                      ? "Particle field / 04"
                      : bracket
                        ? "Parametric bracket / 05"
                        : "Earth / 02"}
              </span>
              <span>
                {assembly
                  ? `${spread}% ${t("uitgeschoven", "exploded")}`
                  : solar
                    ? t("Baansnelheid instelbaar", "Orbital speed adjustable")
                    : particles
                      ? t("Reageert op je cursor", "Reacts to your cursor")
                      : bracket
                        ? `${requiredThicknessMm(span, load).toFixed(1)} mm ${t("plaatdikte", "plate thickness")}`
                        : t("Rotatie om de aardas", "Axial rotation")}
              </span>
            </div>
            <InteractiveScene
              key={kind}
              kind={kind}
              controls={{ spread, angle, speed, playing, reset, span, load, bolts }}
              label={
                assembly
                  ? t(
                      "3D-lagerassemblage met as, huis, lager, deksel en borgring",
                      "3D bearing assembly with shaft, housing, bearing, cover and retaining ring",
                    )
                  : solar
                    ? t(
                        "Zonnestelsel met de zon en acht planeten in omloopbaan",
                        "Solar system with the sun and eight planets in orbit",
                      )
                    : particles
                      ? t(
                          "Deeltjesveld van vierduizend punten dat om de cursor wervelt",
                          "Particle field of four thousand points swirling around the cursor",
                        )
                      : bracket
                        ? t(
                            "Parametrische muurbeugel die live herbouwt op overspanning, belasting en aantal bouten",
                            "Parametric wall bracket that rebuilds live from span, load and bolt count",
                          )
                        : t(
                            "Draaiende wereldbol met continenten en geografisch raster",
                            "Rotating globe with continents and geographic grid",
                          )
              }
              unavailable={t(
                "3D is niet beschikbaar in deze browser. Probeer een recente browser met WebGL ingeschakeld.",
                "3D is unavailable in this browser. Try a recent browser with WebGL enabled.",
              )}
            />
            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 px-5 py-4 font-mono text-xs text-slate-400">
              {assembly ? (
                <>
                  <span>01 {t("As", "Shaft")}</span>
                  <span>02 {t("Lagerhuis", "Housing")}</span>
                  <span>03 {t("Kogellager", "Bearing")}</span>
                  <span>04 {t("Deksel", "Cover")}</span>
                  <span>05 {t("Borgring", "Retaining ring")}</span>
                </>
              ) : solar ? (
                <>
                  <span>{t("Mercurius t/m Neptunus", "Mercury through Neptune")}</span>
                  <span>{t("Afstanden en periodes gecomprimeerd", "Distances and periods compressed")}</span>
                </>
              ) : particles ? (
                <>
                  <span>{t("~4.000 GPU-punten", "~4,000 GPU points")}</span>
                  <span>{t("Beweeg de cursor over het veld", "Move your cursor over the field")}</span>
                </>
              ) : bracket ? (
                <>
                  <span>t = √(6·F·L / (b·σ))</span>
                  <span>
                    {t(
                      "Schematisch — geen productieberekening",
                      "Schematic — not a production calculation",
                    )}
                  </span>
                </>
              ) : (
                <>
                  <span>{t("Landcontouren: Natural Earth", "Land outlines: Natural Earth")}</span>
                  <span>{t("Schematische belichting", "Illustrative lighting")}</span>
                </>
              )}
            </div>
          </div>
          <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            {assembly ? (
              <Control
                id="spread"
                title={t("Explosieafstand", "Explosion distance")}
                value={spread}
                min={0}
                max={100}
                step={1}
                unit="%"
                onChange={setSpread}
                left={t("Gemonteerd", "Assembled")}
                right={t("Uit elkaar", "Exploded")}
              />
            ) : bracket ? (
              <Control
                id="span"
                title={t("Overspanning", "Span")}
                value={span}
                min={SPAN_RANGE.min}
                max={SPAN_RANGE.max}
                step={5}
                unit=" mm"
                onChange={setSpan}
                left={`${SPAN_RANGE.min} mm`}
                right={`${SPAN_RANGE.max} mm`}
              />
            ) : (
              <Control
                id="speed"
                title={
                  solar
                    ? t("Baansnelheid", "Orbital speed")
                    : particles
                      ? t("Stroomsnelheid", "Flow speed")
                      : t("Rotatiesnelheid", "Rotation speed")
                }
                value={speed}
                min={-2}
                max={2}
                step={0.1}
                unit="×"
                onChange={setSpeed}
                left={t("Achteruit", "Reverse")}
                right={t("Vooruit", "Forward")}
              />
            )}
            {bracket ? (
              <Control
                id="load"
                title={t("Belasting", "Load")}
                value={load}
                min={LOAD_RANGE.min}
                max={LOAD_RANGE.max}
                step={25}
                unit=" N"
                onChange={setLoad}
                left={`${LOAD_RANGE.min} N`}
                right={`${LOAD_RANGE.max} N`}
              />
            ) : (
              <Control
                id="angle"
                title={
                  kind === "earth"
                    ? t("Draai de wereldbol", "Turn the globe")
                    : t("Kijkhoek", "View angle")
                }
                value={angle}
                min={0}
                max={360}
                step={1}
                unit="°"
                onChange={setAngle}
                left="0°"
                right="360°"
              />
            )}
            <div className="flex flex-col gap-3 pb-5">
              {bracket && (
                <div
                  role="group"
                  aria-label={t("Aantal bouten", "Bolt count")}
                  className="flex items-center gap-1"
                >
                  {BOLT_OPTIONS.map((n) => (
                    <Button
                      key={n}
                      variant={bolts === n ? "primary" : "secondary"}
                      aria-pressed={bolts === n}
                      onClick={() => setBolts(n)}
                    >
                      {n} {t("bouten", "bolts")}
                    </Button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                {!assembly && !bracket && (
                  <Button
                    variant="secondary"
                    aria-label={
                      playing
                        ? t("Pauzeer rotatie", "Pause rotation")
                        : t("Start rotatie", "Start rotation")
                    }
                    onClick={() => setPlaying((v) => !v)}
                  >
                    {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                    {playing ? t("Pauze", "Pause") : t("Draaien", "Rotate")}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => {
                    setReset((v) => v + 1);
                    setSpread(0);
                    setAngle(0);
                    setSpeed(1);
                    setPlaying(false);
                    setSpan(BRACKET_DEFAULTS.span);
                    setLoad(BRACKET_DEFAULTS.load);
                    setBolts(BRACKET_DEFAULTS.bolts);
                  }}
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <h2 className="text-xl font-medium">
            {assembly
              ? t("Een mechanisme, laag voor laag.", "A mechanism, layer by layer.")
              : solar
                ? t("Acht planeten, één zon.", "Eight planets, one sun.")
                : particles
                  ? t("Duizenden punten, één cursor.", "Thousands of points, one cursor.")
                  : bracket
                    ? t("Vorm volgt belasting.", "Form follows load.")
                    : t("De wereld ligt aan je vingertoppen.", "The world at your fingertips.")}
          </h2>
          <p className="text-base leading-relaxed text-muted">
            {assembly
              ? t(
                  "Schuif de onderdelen uit elkaar en draai de kijkhoek om de opbouw van een lagerassemblage te ontdekken. Een schematisch demonstratiemodel, geen productietekening.",
                  "Separate the parts and turn the view to explore a bearing assembly. A schematic demonstration, not a production drawing.",
                )
              : solar
                ? t(
                    "Verander de baansnelheid en draairichting, of pauzeer en draai zelf de kijkhoek. Afstanden en omlooptijden zijn gecomprimeerd voor het beeld, niet op schaal.",
                    "Change the orbital speed and direction, or pause and turn the view yourself. Distances and orbital periods are compressed for the visual, not to scale.",
                  )
                : particles
                  ? t(
                      "Beweeg de cursor over het veld: elk punt draait mee in een werveling en zakt terug zodra je wegbeweegt. Geen vaste animatie — puur reactie op waar je bent.",
                      "Move your cursor over the field: every point swirls with you and settles back once you move away. No fixed animation — pure reaction to where you are.",
                    )
                  : bracket
                    ? t(
                        "Verander overspanning, belasting en aantal bouten: de plaatdikte wordt live herberekend uit een vereenvoudigde buigberekening (cantilever), en vanaf 500 N verschijnt er een schoor. Schematisch, geen productieberekening — zie",
                        "Change span, load and bolt count: the plate thickness is recalculated live from a simplified cantilever bending check, and a gusset appears from 500 N. Schematic, not a production calculation — see",
                      )
                    : t(
                        "Verander de snelheid en draairichting, of pauzeer en kies zelf een positie. De continenten zijn gebaseerd op geografische data; de animatie toont geen actuele dag- en nachtgrens.",
                        "Change speed and direction, or pause and choose a position. Continents use geographic data; the lighting does not show the current day–night boundary.",
                      )}
            {bracket ? (
              <>
                {" "}
                <Link to="/toolkit/doorbuiging-balk" className="text-accent underline underline-offset-2">
                  {t("Doorbuiging balk", "Beam deflection")}
                </Link>{" "}
                {t("in de Toolkit voor een gecontroleerde versie.", "in the Toolkit for a checked version.")}
              </>
            ) : null}
          </p>
        </div>
      </PageWrap>
    </SiteShell>
  );
}
function Control({
  id,
  title,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  left,
  right,
}: {
  id: string;
  title: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  left: string;
  right: string;
}) {
  return (
    <div>
      <div className="mb-3 flex justify-between gap-3">
        <label htmlFor={id} className="text-base font-medium">
          {title}
        </label>
        <output htmlFor={id} className="font-mono text-sm text-accent">
          {value}
          {unit}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 w-full cursor-pointer accent-[var(--accent)]"
      />
      <div className="flex justify-between text-sm text-muted">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}
