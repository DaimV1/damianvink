import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tx, useLocale } from "@/lib/i18n/locale";
import {
  BRACKET_DEFAULTS,
  SPAN_RANGE,
  THICKNESS_RANGE,
  LOAD_RANGE,
  YIELD_MPA,
  calculateBracket,
  deflectionFraction,
} from "@/lib/lab/bracket";

export function BracketLab() {
  const { locale } = useLocale();
  const t = (nl: string, en: string) => tx(locale, nl, en);
  const id = useId();
  const [settings, setSettings] = useState(BRACKET_DEFAULTS);
  const [magnify, setMagnify] = useState(true);
  const { span, thickness, load } = settings;
  const result = calculateBracket(span, thickness, load);
  const invalid = result.beyondYield || result.largeDeflection;
  const number = (n: number, digits = 1) =>
    n.toLocaleString(locale === "nl" ? "nl-NL" : "en-GB", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  // Keep all curves on the board. Always disclose the actual displacement scale.
  const scale = Math.min(magnify ? 10 : 1, 100 / Math.max(0.001, result.deflection * 2));
  const length = span * 2;
  const drop = result.deflection * 2 * scale;
  const tipX = 130 + length;
  const tipY = 170 + drop;
  const curve = Array.from({ length: 41 }, (_, i) => {
    const u = i / 40;
    return `${i === 0 ? "M" : "L"}${130 + u * length},${170 + deflectionFraction(u) * drop}`;
  }).join(" ");
  const color = invalid ? "#fb917f" : "#70e5ce";
  const controls = [
    {
      key: "span" as const,
      title: t("Lengte", "Length"),
      range: SPAN_RANGE,
      step: 5,
      unit: "mm",
      hint: t("Van de muur tot de last", "From the wall to the load"),
    },
    {
      key: "thickness" as const,
      title: t("Plaatdikte", "Plate thickness"),
      range: THICKNESS_RANGE,
      step: 1,
      unit: "mm",
      hint: t("Een dikkere plaat buigt minder", "A thicker plate bends less"),
    },
    {
      key: "load" as const,
      title: t("Belasting", "Load"),
      range: LOAD_RANGE,
      step: 25,
      unit: "N",
      hint: t(
        `Ongeveer ${number(load / 9.81)} kg aan het uiteinde`,
        `About ${number(load / 9.81)} kg at the tip`,
      ),
    },
  ];
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="overflow-hidden rounded-xl border border-line bg-elevated"
    >
      <div className="p-5 sm:p-7">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Bend Lab / 05</p>
        <h2 id={`${id}-heading`} className="mt-3 text-2xl font-medium sm:text-3xl">
          {t("Hoe sterk is jouw beugel?", "How strong is your bracket?")}
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">
          {t(
            "Hang een last aan een stalen plaat. Maak hem langer of dunner en zie hem doorbuigen. Wat heeft het meeste effect?",
            "Hang a load from a steel plate. Make it longer or thinner and watch it bend. Which change has the biggest effect?",
          )}
        </p>
      </div>
      <div className="grid lg:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 bg-[#081321] text-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 text-xs">
            <span className="font-mono uppercase tracking-widest">
              {t("Zijaanzicht", "Side view")}
            </span>
            <span>
              {t("Doorbuiging in beeld", "Displayed deflection")}: {number(scale, 2)}×
            </span>
          </div>
          <svg
            viewBox="0 0 680 380"
            role="img"
            aria-label={t(
              `Ingeklemde plaat: ${span} mm lang, ${thickness} mm dik. Berekende doorbuiging ${number(result.deflection, 2)} mm.`,
              `Fixed plate: ${span} mm long, ${thickness} mm thick. Calculated deflection ${number(result.deflection, 2)} mm.`,
            )}
            className="w-full"
          >
            <defs>
              <pattern id={`${id}-wall`} width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M0 10L10 0" stroke="#475569" />
              </pattern>
            </defs>
            <rect x="85" y="90" width="45" height="220" fill={`url(#${id}-wall)`} />
            <path d="M130 90V310" stroke="#94a3b8" strokeWidth="3" />
            <path
              d={`M130 170H${tipX}`}
              stroke="#64748b"
              strokeWidth={thickness * 2}
              strokeDasharray="5 6"
              opacity="0.55"
            />
            <path
              d={curve}
              fill="none"
              stroke={color}
              strokeWidth={thickness * 2}
              strokeLinejoin="round"
            />
            <path
              d={`M${tipX} ${tipY - thickness - 70}V${tipY - thickness - 12}m-7 -10l7 10 7 -10`}
              fill="none"
              stroke="#ffbd7c"
              strokeWidth="3"
            />
            <text x={tipX + 14} y={tipY - thickness - 40} fill="#ffbd7c" fontSize="17">
              {load} N
            </text>
            <path d={`M130 70H${tipX}M130 64V76M${tipX} 64V76`} stroke="#94a3b8" />
            <text x={130 + length / 2} y="55" textAnchor="middle" fill="#cbd5e1" fontSize="17">
              {span} mm
            </text>
            <text x="130" y="345" fill="#94a3b8" fontSize="15">
              {t("Vast aan de muur", "Fixed to the wall")}
            </text>
            <text x={tipX + 14} y={tipY + thickness + 27} fill={color} fontSize="17">
              δ {number(result.deflection, 2)} mm
            </text>
          </svg>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 p-5 text-xs text-slate-400">
            <span>{t("Stippellijn = onbelast", "Dashed line = unloaded")}</span>
            <label className="flex cursor-pointer items-center gap-2 text-slate-200">
              <input
                type="checkbox"
                checked={magnify}
                onChange={(e) => setMagnify(e.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              {t("Vergroot doorbuiging (max. 10×)", "Magnify deflection (max. 10×)")}
            </label>
          </div>
          {scale < 1 && (
            <p className="px-5 pb-5 text-sm text-orange-200">
              {t(
                "Verplaatsing verkleind om in beeld te passen. Het model is hier niet meer geldig.",
                "Displacement reduced to fit the view. The model is no longer valid here.",
              )}
            </p>
          )}
        </div>
        <div className="flex flex-col justify-center gap-7 p-5 sm:p-7">
          {controls.map((c) => (
            <div key={c.key}>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor={`${id}-${c.key}`} className="font-medium">
                  {c.title}
                </label>
                <output htmlFor={`${id}-${c.key}`} className="font-mono text-accent">
                  {settings[c.key]} {c.unit}
                </output>
              </div>
              <input
                id={`${id}-${c.key}`}
                type="range"
                min={c.range.min}
                max={c.range.max}
                step={c.step}
                value={settings[c.key]}
                aria-valuetext={`${settings[c.key]} ${c.unit}`}
                onChange={(e) => setSettings((s) => ({ ...s, [c.key]: Number(e.target.value) }))}
                className="mt-2 h-8 w-full cursor-pointer accent-[var(--accent)]"
              />
              <p className="text-sm text-muted">{c.hint}</p>
            </div>
          ))}
          <Button
            variant="secondary"
            onClick={() => {
              setSettings(BRACKET_DEFAULTS);
              setMagnify(true);
            }}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset
          </Button>
        </div>
      </div>
      <div className="grid gap-5 border-t border-line p-5 sm:grid-cols-3 sm:p-7">
        <div>
          <p className="text-sm text-muted">{t("Doorbuiging uiteinde", "Tip deflection")}</p>
          <p className="mt-2 font-mono text-3xl">
            {number(result.deflection, 2)} <span className="text-base text-muted">mm</span>
          </p>
        </div>
        <div>
          <p className="text-sm text-muted">
            {t("Max. buigspanning bij de muur", "Max. bending stress at the wall")}
          </p>
          <p className="mt-2 font-mono text-3xl">
            {number(result.stress)} <span className="text-base text-muted">MPa</span>
          </p>
        </div>
        <div role="status">
          <p className={`font-medium ${invalid ? "text-orange-500" : "text-accent"}`}>
            {invalid
              ? t("Buiten het elastische model", "Outside the elastic model")
              : result.shortBeam
                ? t(
                    "Korte, dikke plaat: grove benadering",
                    "Short, thick plate: rough approximation",
                  )
                : t("Elastische buiging in dit model", "Elastic bending in this model")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {result.beyondYield
              ? t(
                  "De berekende spanning bereikt de aangenomen vloeigrens van 235 MPa. Blijvende vervorming wordt niet gesimuleerd; de getallen zijn een extrapolatie.",
                  "Calculated stress reaches the assumed 235 MPa yield limit. Permanent deformation is not simulated; numbers are extrapolations.",
                )
              : result.largeDeflection
                ? t(
                    "De doorbuiging is te groot voor deze kleine-vervormingsbenadering.",
                    "Deflection is too large for this small-displacement approximation.",
                  )
                : t(
                    "Geen oordeel over de sterkte van bouten, lassen of de muur.",
                    "This does not assess the strength of bolts, welds or the wall.",
                  )}
          </p>
        </div>
      </div>
      <div className="border-t border-line p-5 sm:p-7">
        <p className="font-medium">
          {t("Probeer dit: twee keer zo dik", "Try this: twice as thick")}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {t(
            "Schuif de plaatdikte van 8 naar 16 mm. Bij dezelfde lengte en belasting wordt de doorbuiging acht keer kleiner en de buigspanning vier keer kleiner.",
            "Slide the thickness from 8 to 16 mm. With the same length and load, deflection becomes eight times smaller and bending stress four times smaller.",
          )}
        </p>
        <details className="mt-5 text-sm text-muted">
          <summary className="cursor-pointer font-medium text-foreground">
            {t("Hoe rekenen we dit uit?", "How is this calculated?")}
          </summary>
          <div className="mt-3 space-y-2 leading-relaxed">
            <p>
              {t(
                "Een rechte plaat, volledig ingeklemd, met één puntlast aan het uiteinde. Breedte 40 mm; aangenomen staal: E = 210.000 MPa en vloeigrens 235 MPa. Eigen gewicht en afschuiving zijn weggelaten; voor korte, dikke platen is dit minder nauwkeurig.",
                "A straight plate, fully fixed, with one point load at the tip. Width 40 mm; assumed steel: E = 210,000 MPa and yield limit 235 MPa. Self-weight and shear are omitted; short, thick plates are less accurately represented.",
              )}
            </p>
            <p className="font-mono">I = b·t³/12 · σ = 6·F·L/(b·t²) · δ = F·L³/(3·E·I)</p>
            <p>
              {t(
                `Educatief experiment, geen constructieberekening. De kleur wisselt bij ${YIELD_MPA} MPa; de tekening vergroot alleen de verplaatsing, niet de plaatdikte.`,
                `Educational experiment, not a structural design check. Colour changes at ${YIELD_MPA} MPa; the drawing magnifies displacement only, not plate thickness.`,
              )}
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}
