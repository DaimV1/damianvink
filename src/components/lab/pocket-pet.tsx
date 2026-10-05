import { useEffect, useState } from "react";
import { Heart, Moon, Sparkles, Utensils, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tx, useLocale } from "@/lib/i18n/locale";

const KEY = "damian-dot-pet-v1";
const PETS = [
  { id: "dot", name: "DOT", nl: "Het origineel", en: "The original", color: "#b9f785" },
  { id: "cat", name: "MOCHI", nl: "Nieuwsgierige kat", en: "Curious cat", color: "#f7ba88" },
  { id: "bunny", name: "PIP", nl: "Vrolijk konijntje", en: "Cheerful bunny", color: "#e6bcfa" },
  { id: "robot", name: "BYTE", nl: "Kleine robot", en: "Little robot", color: "#8cd9f5" },
  { id: "frog", name: "SPROUT", nl: "Relaxte kikker", en: "Chilled frog", color: "#7ee2b8" },
] as const;
type Species = (typeof PETS)[number]["id"];
const validSpecies = (id: unknown): id is Species => PETS.some((p) => p.id === id);
type Pet = {
  species: Species;
  food: number;
  joy: number;
  energy: number;
  care: number;
  sleeping: boolean;
  updated: number;
  born: number;
};
const fresh = (species: Species = "dot"): Pet => ({
  species,
  food: 75,
  joy: 70,
  energy: 85,
  care: 0,
  sleeping: false,
  updated: Date.now(),
  born: Date.now(),
});
function advance(p: Pet): Pet {
  const minutes = Math.max(0, Math.min(240, (Date.now() - p.updated) / 60000));
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  return {
    ...p,
    food: clamp(p.food - minutes * 0.4),
    joy: clamp(p.joy - minutes * 0.25),
    energy: clamp(p.energy + minutes * (p.sleeping ? 2 : -0.3)),
    updated: Date.now(),
  };
}
export function PocketPet() {
  const { locale } = useLocale();
  const t = (nl: string, en: string) => tx(locale, nl, en);
  const [pet, setPet] = useState<Pet>(() => fresh());
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(true);
  const [message, setMessage] = useState("");
  const [reaction, setReaction] = useState("");
  const [game, setGame] = useState<{ score: number; left: number; x: number; y: number } | null>(
    null,
  );
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw) as Pet;
        if (
          [p.food, p.joy, p.energy, p.care, p.updated, p.born].every(Number.isFinite) &&
          typeof p.sleeping === "boolean" &&
          p.care >= 0
        )
          setPet(advance({ ...p, species: validSpecies(p.species) ? p.species : "dot" }));
      }
    } catch {
      setSaved(false);
    }
    setReady(true);
    const timer = window.setInterval(() => setPet((p) => advance(p)), 5000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(pet));
    } catch {
      setSaved(false);
    }
  }, [pet, ready]);
  useEffect(() => {
    if (!reaction) return;
    const timer = window.setTimeout(() => setReaction(""), 1200);
    return () => window.clearTimeout(timer);
  }, [reaction]);
  const gameActive = game !== null;
  useEffect(() => {
    if (!gameActive) return;
    const timer = window.setInterval(
      () => setGame((g) => (g ? { ...g, left: Math.max(0, g.left - 1) } : null)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [gameActive]);
  useEffect(() => {
    if (!game || game.left > 0) return;
    setPet((old) => {
      const p = advance(old);
      return {
        ...p,
        joy: Math.min(100, p.joy + game.score * 4),
        energy: Math.max(0, p.energy - 8),
        care: p.care + game.score,
      };
    });
    setMessage(tx(locale, `Je ving ${game.score} sterren!`, `You caught ${game.score} stars!`));
    setGame(null);
  }, [game, locale]);
  const creature = PETS.find((p) => p.id === pet.species) ?? PETS[0];
  const low = Math.min(pet.food, pet.joy, pet.energy) < 25;
  const stage =
    pet.care < 10
      ? t("Baby", "Baby")
      : pet.care < 30
        ? t("Junior", "Junior")
        : t("Volwassen", "Grown-up");
  function act(action: "food" | "love" | "sleep") {
    setPet((old) => {
      const p = advance(old);
      if (action === "sleep") return { ...p, sleeping: !p.sleeping };
      return {
        ...p,
        food: action === "food" ? Math.min(100, p.food + 18) : p.food,
        joy: Math.min(100, p.joy + (action === "love" ? 12 : 3)),
        care: p.care + 1,
      };
    });
    setReaction(action === "food" ? "✦" : action === "love" ? "♥" : "☾");
    setMessage(
      action === "food"
        ? t("Mmm. Een hapje geluk.", "Mmm. A bite of happiness.")
        : action === "love"
          ? t(`${creature.name} vindt je lief.`, `${creature.name} likes you.`)
          : pet.sleeping
            ? t("Goedemorgen!", "Good morning!")
            : t(`Welterusten, ${creature.name}.`, `Good night, ${creature.name}.`),
    );
  }
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-elevated">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
        <span className="font-mono text-sm uppercase tracking-widest">
          10 / {creature.name} · Pocket Pet
        </span>
        <span className="rounded-full border border-line px-3 py-1 text-sm text-muted">
          {stage} · {pet.care} XP
        </span>
      </div>
      <div className="grid lg:grid-cols-[1.3fr_1fr]">
        <div
          className="relative flex min-h-[400px] flex-col items-center justify-center overflow-hidden bg-[#121a20] p-6 text-[#edeff1]"
          style={{
            backgroundImage: "radial-gradient(#ffffff12 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <span className="absolute left-5 top-5 font-mono text-xs text-[#aab8c0]">
            {pet.sleeping
              ? t("DROOMMODUS", "DREAM MODE")
              : low
                ? t("BEETJE AANDACHT?", "A LITTLE ATTENTION?")
                : t("KLEIN WEZENTJE. GROOT GEVOEL.", "SMALL CREATURE. BIG FEELINGS.")}
          </span>
          {game ? (
            <div className="absolute inset-0 z-10 bg-[#121a20] p-5">
              <div className="flex justify-between font-mono">
                <span>
                  {t("Vang de sterren", "Catch the stars")} · {game.score}
                </span>
                <span>{game.left}s</span>
              </div>
              <button
                type="button"
                aria-label={t("Vang ster", "Catch star")}
                className="absolute flex size-16 items-center justify-center rounded-full border border-[#b9f785] bg-[#b9f785]/10 text-4xl text-[#b9f785] focus-visible:outline-2"
                style={{ left: `${game.x}%`, top: `${game.y}%` }}
                onClick={() =>
                  setGame((g) =>
                    g
                      ? {
                          ...g,
                          score: g.score + 1,
                          x: 8 + Math.random() * 68,
                          y: 20 + Math.random() * 52,
                        }
                      : null,
                  )
                }
              >
                ✦
              </button>
              <Button
                variant="secondary"
                className="absolute bottom-5 left-5"
                onClick={() => setGame(null)}
              >
                {t("Stop spel", "Stop game")}
              </Button>
            </div>
          ) : null}
          <div className="relative">
            <span className="absolute -right-5 -top-7 text-4xl text-[#b9f785]" aria-hidden="true">
              {reaction || (pet.sleeping ? "z z" : "")}
            </span>
            <PetPortrait
              species={pet.species}
              sleeping={pet.sleeping}
              low={low}
              care={pet.care}
              reaction={!!reaction}
              label={t(
                `${creature.name}, ${creature.nl.toLowerCase()}`,
                `${creature.name}, ${creature.en.toLowerCase()}`,
              )}
            />
          </div>
          <p className="mt-3 text-center text-sm text-[#aab8c0]" role="status">
            {message ||
              t(
                `Hallo. Ik ben ${creature.name}. Blijf je even?`,
                `Hi. I'm ${creature.name}. Stay a little?`,
              )}
          </p>
        </div>
        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <div>
            <h2 className="text-2xl font-medium">
              {t("Een vriendje in je browser.", "A friend in your browser.")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {t(
                "Voer je vriendje, geef aandacht en vang samen sterren. Met elke verzorging groeit je vriendje. Slaap herstelt energie; behoeften veranderen langzaam, ook als je weg bent.",
                "Feed your pet, show affection and catch stars together. Each act of care helps your friend grow. Sleep restores energy; needs change slowly, even while you're away.",
              )}
            </p>
          </div>
          <fieldset className="min-w-0">
            <legend className="mb-3 text-sm font-medium">
              {t("Kies je vriendje", "Choose your pet")}
            </legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3">
              {PETS.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  aria-pressed={pet.species === option.id}
                  aria-label={`${option.name} · ${t(option.nl, option.en)}`}
                  disabled={!ready || !!game}
                  className={`flex min-w-0 flex-col items-center rounded-xl border p-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 ${pet.species === option.id ? "border-accent bg-accent/10" : "border-line hover:bg-line"}`}
                  onClick={() => {
                    setPet((p) => ({ ...p, species: option.id }));
                    setMessage("");
                    setReaction("");
                  }}
                >
                  <PetPortrait species={option.id} thumbnail />
                  <span className="font-mono text-xs">{option.name}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">
              {t(
                "Een andere look kiezen behoudt je verzorging en XP.",
                "Changing your pet’s look keeps your care stats and XP.",
              )}
            </p>
          </fieldset>
          <div className="space-y-4">
            {[
              [t("Verzadiging", "Fullness"), pet.food],
              [t("Geluk", "Happiness"), pet.joy],
              [t("Energie", "Energy"), pet.energy],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-mono text-muted">{Math.round(Number(value))}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-label={String(label)}
                  aria-valuenow={Math.round(Number(value))}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-2 overflow-hidden rounded-full bg-line"
                >
                  <div
                    className="h-full rounded-full bg-[#b9f785] transition-[width] motion-reduce:transition-none"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              disabled={!ready || pet.sleeping || !!game}
              onClick={() => act("food")}
            >
              <Utensils className="size-4" />
              {t("Voeren", "Feed")}
            </Button>
            <Button
              variant="secondary"
              disabled={!ready || pet.sleeping || !!game}
              onClick={() => act("love")}
            >
              <Heart className="size-4" />
              {t("Knuffelen", "Cuddle")}
            </Button>
            <Button variant="secondary" disabled={!ready || !!game} onClick={() => act("sleep")}>
              <Moon className="size-4" />
              {pet.sleeping ? t("Wakker maken", "Wake up") : t("Slapen", "Sleep")}
            </Button>
            <Button
              variant="secondary"
              disabled={!ready || pet.sleeping || pet.energy < 10 || !!game}
              onClick={() => setGame({ score: 0, left: 20, x: 45, y: 40 })}
            >
              <Sparkles className="size-4" />
              {t("Spelen", "Play")}
            </Button>
          </div>
          <p className="text-xs leading-relaxed text-muted">
            {saved
              ? t(
                  "Automatisch bewaard op dit apparaat. Geen account nodig. Je vriendje gaat niet dood; na een lange pauze kun je gewoon verder zorgen.",
                  "Automatically saved on this device. No account needed. Your pet never dies; after a long break, simply keep caring.",
                )
              : t(
                  "Opslaan is niet beschikbaar. Je kunt wel spelen tijdens dit bezoek.",
                  "Saving is unavailable. You can still play during this visit.",
                )}
          </p>
          <Button
            variant="secondary"
            className="self-start"
            disabled={!ready || !!game}
            onClick={() => {
              if (
                window.confirm(
                  t(
                    `Opnieuw beginnen met een nieuwe ${creature.name}?`,
                    `Start over with a new ${creature.name}?`,
                  ),
                )
              ) {
                setPet(fresh(pet.species));
                setMessage("");
              }
            }}
          >
            <RotateCcw className="size-3" />
            {t("Nieuw vriendje", "New friend")}
          </Button>
        </div>
      </div>
    </section>
  );
}

function PetPortrait({
  species,
  sleeping = false,
  low = false,
  care = 0,
  reaction = false,
  thumbnail = false,
  label,
}: {
  species: Species;
  sleeping?: boolean;
  low?: boolean;
  care?: number;
  reaction?: boolean;
  thumbnail?: boolean;
  label?: string;
}) {
  const color = (PETS.find((p) => p.id === species) ?? PETS[0]).color;
  return (
    <svg
      viewBox="0 0 240 230"
      className={thumbnail ? "w-16 h-16" : "w-60 sm:w-72"}
      role={thumbnail ? undefined : "img"}
      aria-hidden={thumbnail || undefined}
      aria-label={label}
    >
      <ellipse cx="120" cy="211" rx="68" ry="9" fill="#000" opacity=".25" />
      <g className={!thumbnail && !sleeping ? "motion-safe:animate-[bounce_4s_infinite]" : ""}>
        {species === "cat" && (
          <>
            <path d="M48 90 L48 24 L100 64 M140 64 L192 24 L192 90" fill={color} />
            <path d="M58 65 L60 42 L83 65 M157 65 L180 42 L182 65" fill="#e78e98" />
          </>
        )}
        {species === "bunny" && (
          <>
            <rect x="66" y="5" width="32" height="85" rx="16" fill={color} />
            <rect x="142" y="5" width="32" height="85" rx="16" fill={color} />
            <path
              d="M82 22 V60 M158 22 V60"
              stroke="#f299c3"
              strokeWidth="12"
              strokeLinecap="round"
            />
          </>
        )}
        {species === "robot" && (
          <>
            <path d="M120 55 V27" stroke={color} strokeWidth="8" />
            <circle cx="120" cy="22" r="10" fill="#ffd984" />
            <rect x="28" y="100" width="22" height="40" rx="6" fill={color} />
            <rect x="190" y="100" width="22" height="40" rx="6" fill={color} />
          </>
        )}
        {species === "dot" && care >= 10 && (
          <path d="M75 75 Q45 12 90 46 M165 75 Q195 12 150 46" fill={color} />
        )}
        <path
          d="M48 150 Q18 163 30 177 M192 150 Q222 163 210 177"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />
        <rect
          x="45"
          y="55"
          width="150"
          height="143"
          rx={species === "robot" ? 25 : care >= 30 ? 45 : 70}
          fill={color}
          opacity={low ? 0.75 : 1}
        />
        {species === "frog" && (
          <>
            <circle cx="80" cy="70" r="27" fill={color} />
            <circle cx="160" cy="70" r="27" fill={color} />
          </>
        )}
        <ellipse cx="86" cy="195" rx="17" ry="10" fill={color} />
        <ellipse cx="154" cy="195" rx="17" ry="10" fill={color} />
        <g transform={species === "frog" ? "translate(0 -38)" : undefined}>
          {sleeping ? (
            <path
              d="M77 116 H97 M143 116 H163"
              stroke="#172a24"
              strokeWidth="7"
              strokeLinecap="round"
            />
          ) : (
            <>
              <ellipse cx="88" cy="114" rx="9" ry={reaction ? 8 : 13} fill="#172a24" />
              <ellipse cx="152" cy="114" rx="9" ry={reaction ? 8 : 13} fill="#172a24" />
              <circle cx="91" cy="109" r="3" fill="white" />
              <circle cx="155" cy="109" r="3" fill="white" />
            </>
          )}
        </g>
        <ellipse cx="69" cy="138" rx="12" ry="6" fill="#f29ca4" opacity=".7" />
        <ellipse cx="171" cy="138" rx="12" ry="6" fill="#f29ca4" opacity=".7" />
        {species === "cat" && (
          <path
            d="M48 130 L23 125 M48 143 L23 148 M192 130 L217 125 M192 143 L217 148"
            stroke="#172a24"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}
        {species === "robot" && (
          <rect
            x="78"
            y="92"
            width="84"
            height="43"
            rx="14"
            fill="none"
            stroke="#172a24"
            strokeWidth="3"
          />
        )}
        <path
          d={low ? "M108 155 Q120 145 132 155" : "M108 148 Q120 162 132 148"}
          stroke="#172a24"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
