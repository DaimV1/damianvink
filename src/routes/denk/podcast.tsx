import { createFileRoute } from "@tanstack/react-router";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";

export const Route = createFileRoute("/denk/podcast")({
  head: () => ({ meta: [{ title: "Podcast — Damian Vink" }] }),
  component: Podcast,
});

function Podcast() {
  return (
    <SiteShell>
      <PageWrap>
        <Breadcrumb
          items={[
            { href: "/denk", label: "Wat ik denk" },
            { label: "Podcast" },
          ]}
        />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          Wat ik denk
        </p>
        <DisplayTitle last="Podcast." className="mt-3" />
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Afleveringen over werktuigbouwkunde, projecten en wat ik onderweg leer.
        </p>
        <div className="mt-10 rounded-xl border border-dashed border-line-strong bg-elevated px-6 py-12 text-center">
          <p className="font-display text-xl font-semibold">Nog geen afleveringen</p>
          <p className="mt-2 text-sm text-muted">
            Hier komen alleen afleveringen die ik zelf maak.
          </p>
        </div>
      </PageWrap>
    </SiteShell>
  );
}
