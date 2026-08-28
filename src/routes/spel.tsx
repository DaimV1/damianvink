import { createFileRoute } from "@tanstack/react-router";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import { tx, useLocale } from "@/lib/i18n/locale";
import { VinkGame } from "@/components/vink-game";

export const Route = createFileRoute("/spel")({
  head: () => ({
    meta: [
      { title: "Vink — Damian Vink" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Spel,
});

function Spel() {
  const { locale } = useLocale();
  return (
    <SiteShell>
      <PageWrap>
        <Breadcrumb items={[{ label: "Vink" }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{tx(locale, "Spel", "Game")}</p>
        <DisplayTitle text="Vink." className="mt-3" />
        <p className="mt-5 text-lg leading-relaxed text-muted">
          {tx(
            locale,
            "Eigen minigame. Tik of spatie om te vliegen, door de opening. Record blijft in deze browser.",
            "Own minigame. Tap or space to fly through the gap. High score stays in this browser.",
          )}
        </p>
        <div className="mt-8">
          <VinkGame />
        </div>
        <p className="mt-6 text-xs text-subtle">
          {tx(
            locale,
            "Vink vliegt door. Geen plan, geen overleg — alleen de volgende opening.",
            "Vink keeps flying. No plan, no meeting — just the next gap.",
          )}
        </p>
      </PageWrap>
    </SiteShell>
  );
}
