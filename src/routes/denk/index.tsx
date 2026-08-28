import { createFileRoute, Link } from "@tanstack/react-router";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/denk/")({
  head: () =>
    pageHead({
      title: "Artikelen — Damian Vink",
      description:
        "Nog geen artikelen of podcast. Alleen stukken die er daadwerkelijk zijn.",
      path: "/denk",
    }),
  component: Denk,
});

function Denk() {
  return (
    <SiteShell>
      <PageWrap>
        <Breadcrumb items={[{ label: "Artikelen" }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          Artikelen
        </p>
        <DisplayTitle last="Artikelen." className="mt-3" />
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Nog geen artikelen of podcast.
        </p>
        <div className="mt-10 space-y-3">
          <Link
            to="/denk/blog"
            className="block rounded-lg border border-line bg-elevated p-5 transition-colors hover:border-line-strong"
          >
            <p className="font-mono text-xs text-accent">01</p>
            <h2 className="mt-1 font-display text-xl font-semibold">Blog</h2>
            <p className="mt-1 text-sm text-muted">
              Artikelen. Nog niets gepubliceerd.
            </p>
          </Link>
          <Link
            to="/denk/podcast"
            className="block rounded-lg border border-line bg-elevated p-5 transition-colors hover:border-line-strong"
          >
            <p className="font-mono text-xs text-accent">02</p>
            <h2 className="mt-1 font-display text-xl font-semibold">Podcast</h2>
            <p className="mt-1 text-sm text-muted">
              Afleveringen. Nog niets gepubliceerd.
            </p>
          </Link>
        </div>
      </PageWrap>
    </SiteShell>
  );
}
