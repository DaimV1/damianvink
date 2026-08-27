import { createFileRoute } from "@tanstack/react-router";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/denk/blog")({
  head: () =>
    pageHead({
      title: "Blog — Damian Vink",
      description:
        "Nog geen artikelen. Stukken over werktuigbouwkunde en ontwerp, als ze er zijn.",
      path: "/denk/blog",
      noindex: true,
    }),
  component: Blog,
});

function Blog() {
  return (
    <SiteShell>
      <PageWrap>
        <Breadcrumb
          items={[
            { href: "/denk", label: "Artikelen" },
            { label: "Blog" },
          ]}
        />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          Artikelen
        </p>
        <DisplayTitle last="Blog." className="mt-3" />
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Nog geen artikelen.
        </p>
        <div className="mt-10 rounded-xl border border-dashed border-line-strong bg-elevated px-6 py-12 text-center">
          <p className="font-display text-xl font-semibold">Nog geen artikelen</p>
          <p className="mt-2 text-sm text-muted">
            Hier komen stukken over werktuigbouwkunde en ontwerp, als ze er zijn.
          </p>
        </div>
      </PageWrap>
    </SiteShell>
  );
}
