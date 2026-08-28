import { createFileRoute } from "@tanstack/react-router";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/podcast")({
  head: () =>
    pageHead({
      title: "Podcast — Damian Vink",
      description:
        "Nog geen afleveringen. Podcast over werktuigbouwkunde en projecten, als die er is.",
      path: "/podcast",
      noindex: true,
    }),
  component: Podcast,
});

function Podcast() {
  return (
    <SiteShell>
      <PageWrap>
        <Breadcrumb items={[{ label: "Podcast" }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          Artikelen
        </p>
        <DisplayTitle last="Podcast." className="mt-3" />
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Nog geen afleveringen.
        </p>
        <div className="mt-10 rounded-xl border border-dashed border-line-strong bg-elevated px-6 py-12 text-center">
          <p className="font-display text-xl font-semibold">Nog geen afleveringen</p>
          <p className="mt-2 text-sm text-muted">
            Hier komen afleveringen over werktuigbouwkunde en projecten, als ze er zijn.
          </p>
        </div>
      </PageWrap>
    </SiteShell>
  );
}
