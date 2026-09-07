import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Copy, Sparkles, RotateCcw } from "lucide-react";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { tx, useLocale } from "@/lib/i18n/locale";
import { pageHead } from "@/lib/seo";
import { examples, modes, type Mode } from "@/lib/ai/demo";
import { generateDemo } from "@/lib/ai/generate";

export const Route = createFileRoute("/ai-lab")({
  head: () =>
    pageHead({
      title: "AI Lab — Damian Vink",
      description: "Probeer AI voor heldere teksten, concrete projectacties en nieuwe ideeën.",
      path: "/ai-lab",
    }),
  component: AiLab,
});
function AiLab() {
  const { locale } = useLocale();
  return (
    <SiteShell>
      <PageWrap wide>
        <Lab key={locale} locale={locale} />
      </PageWrap>
    </SiteShell>
  );
}
function Lab({ locale }: { locale: "nl" | "en" }) {
  const t = (nl: string, en: string) => tx(locale, nl, en);
  const [mode, setMode] = useState<Mode>("rewrite");
  const [text, setText] = useState(examples[locale].rewrite.input);
  const [output, setOutput] = useState(examples[locale].rewrite.output);
  const [source, setSource] = useState<"example" | "live">("example");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const labels = {
    rewrite: t("Tekst verbeteren", "Improve writing"),
    actions: t("Van notities naar actie", "Notes into action"),
    ideas: t("Ideeën uitwerken", "Explore ideas"),
  };
  const descriptions = {
    rewrite: t("Dezelfde boodschap. Helder verwoord.", "The same message. Clearly expressed."),
    actions: t("Overzicht, eigenaren en open vragen.", "Structure, owners and open questions."),
    ideas: t("Drie richtingen, met een eerste stap.", "Three directions, each with a first step."),
  };
  function select(next: Mode) {
    setMode(next);
    setText(examples[locale][next].input);
    setOutput(examples[locale][next].output);
    setSource("example");
    setError("");
    setCopied(false);
  }
  async function run() {
    if (busy) return;
    setBusy(true);
    setError("");
    setOutput("");
    setCopied(false);
    try {
      const result = await generateDemo({ data: { mode, text, locale } });
      if (result.ok) {
        setOutput(result.text);
        setSource("live");
      } else
        setError(
          result.error === "unavailable"
            ? t(
                "Live AI is nog niet beschikbaar. Via ‘Laad voorbeeld’ kun je de uitgewerkte demo bekijken.",
                "Live AI is not available yet. Use ‘Load example’ to explore the prepared demo.",
              )
            : result.error === "busy"
              ? t(
                  "Het is even druk. Probeer het over een minuut opnieuw.",
                  "It is busy. Please try again in a minute.",
                )
              : t(
                  "Genereren is niet gelukt. Je invoer is bewaard; probeer opnieuw.",
                  "Generation failed. Your input is preserved; please try again.",
                ),
        );
    } catch {
      setError(
        t(
          "Geen verbinding. Controleer je internet en probeer opnieuw.",
          "Connection failed. Check your internet and try again.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      setError(
        t(
          "Kopiëren lukt niet. Selecteer en kopieer de tekst handmatig.",
          "Could not copy. Select and copy the text manually.",
        ),
      );
    }
  }
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 font-mono text-sm uppercase tracking-widest text-muted">
            Damian Vink / AI Lab
          </p>
          <h1 className="text-4xl font-medium tracking-tight sm:text-6xl">
            {t("Van input naar inzicht.", "From input to insight.")}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted">
            {t(
              "Ontdek wat AI met tekst kan. Kies een toepassing, bekijk het voorbeeld of probeer je eigen invoer.",
              "Explore what AI can do with text. Pick a task, inspect the example or try your own input.",
            )}
          </p>
        </div>
        <Sparkles className="size-9 text-accent" aria-hidden="true" />
      </div>
      <div
        className="mb-6 grid gap-2 sm:grid-cols-3"
        role="group"
        aria-label={t("AI-toepassing", "AI task")}
      >
        {modes.map((item, i) => (
          <button
            key={item}
            type="button"
            disabled={busy}
            aria-pressed={mode === item}
            onClick={() => select(item)}
            className={`min-h-24 rounded-lg border p-4 text-left transition-colors disabled:opacity-50 ${mode === item ? "border-accent bg-accent/10" : "border-line bg-elevated hover:border-line-strong"}`}
          >
            <span className="mb-2 block font-mono text-sm text-muted">0{i + 1}</span>
            <strong className="block text-base font-medium">{labels[item]}</strong>
          </button>
        ))}
      </div>
      <div className="grid overflow-hidden rounded-xl border border-line bg-elevated lg:grid-cols-2">
        <section className="min-w-0 p-5 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <label htmlFor="ai-input" className="font-mono text-sm uppercase tracking-wider">
              01 / {t("Jouw input", "Your input")}
            </label>
            <span className="text-sm text-muted">{text.length}/3000</span>
          </div>
          <textarea
            id="ai-input"
            value={text}
            disabled={busy}
            maxLength={3000}
            onChange={(e) => {
              setText(e.target.value);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            className="min-h-64 w-full resize-y rounded-md border border-line bg-paper p-4 text-base leading-relaxed text-ink focus-visible:outline-accent disabled:opacity-60"
            aria-describedby="ai-privacy"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={run} disabled={busy || text.trim().length < 10}>
              <Sparkles className="size-4" aria-hidden="true" />
              {busy
                ? t("Bezig met genereren…", "Generating…")
                : t("Genereer met AI", "Generate with AI")}
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => select(mode)}>
              <RotateCcw className="size-4" aria-hidden="true" />
              {t("Laad voorbeeld", "Load example")}
            </Button>
          </div>
          <p id="ai-privacy" className="mt-4 text-sm leading-relaxed text-muted">
            {t(
              "Bij genereren wordt je tekst naar OpenAI gestuurd. Gebruik geen vertrouwelijke gegevens. De voorbeelden werken zonder AI-verbinding.",
              "Generating sends your text to OpenAI. Do not enter confidential information. Examples work without an AI connection.",
            )}
          </p>
        </section>
        <section
          className="min-w-0 border-t border-line bg-paper p-5 sm:p-7 lg:border-l lg:border-t-0"
          aria-busy={busy}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-mono text-sm uppercase tracking-wider">
              02 / {t("Resultaat", "Result")}
            </h2>
            {output && (
              <span className="rounded-full border border-line px-3 py-1 text-sm text-muted">
                {source === "example"
                  ? t("Voorbeeld · vooraf uitgewerkt", "Example · prepared in advance")
                  : t("Live gegenereerd", "Generated live")}
              </span>
            )}
          </div>
          <p className="mb-5 text-base font-medium">{descriptions[mode]}</p>
          <div aria-live="polite" role="status">
            {busy ? (
              <p className="text-muted">
                {t("Je invoer wordt verwerkt…", "Processing your input…")}
              </p>
            ) : output ? (
              <p className="whitespace-pre-wrap break-words text-base leading-relaxed">{output}</p>
            ) : (
              <p className="text-base text-muted">
                {t("Je resultaat verschijnt hier.", "Your result will appear here.")}
              </p>
            )}
          </div>
          {error && (
            <p role="alert" className="mt-5 rounded-md border border-line-strong p-4 text-base">
              {error}
            </p>
          )}
          {output && (
            <Button variant="ghost" className="mt-6" onClick={copy}>
              <Copy className="size-4" aria-hidden="true" />
              {copied ? t("Gekopieerd", "Copied") : t("Kopieer resultaat", "Copy result")}
            </Button>
          )}
        </section>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
        <p>
          {t(
            "AI geeft een eerste versie. Jij beoordeelt feiten, aannames en bruikbaarheid.",
            "AI provides a first draft. You assess facts, assumptions and usefulness.",
          )}
        </p>
        <a href="/contact" className="inline-flex min-h-11 items-center gap-1 text-ink">
          {t("Een toepassing bespreken", "Discuss an application")}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </>
  );
}
