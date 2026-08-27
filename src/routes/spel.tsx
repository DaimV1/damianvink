import { createFileRoute } from "@tanstack/react-router";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
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
  return (
    <SiteShell>
      <PageWrap>
        <Breadcrumb items={[{ label: "Vink" }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Spel</p>
        <DisplayTitle last="Vink." className="mt-3" />
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Eigen minigame. Tik of spatie om te vliegen, door de opening. Record
          blijft in deze browser.
        </p>
        <div className="mt-8">
          <VinkGame />
        </div>
        <p className="mt-6 text-xs text-subtle">
          Geen Flappy Bird: andere naam, eigen tekening, geen overgenomen sprites
          of geluid.
        </p>
      </PageWrap>
    </SiteShell>
  );
}
