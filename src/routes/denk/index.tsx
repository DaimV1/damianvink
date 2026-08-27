import { createFileRoute, Link } from "@tanstack/react-router";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";

export const Route = createFileRoute("/denk/")({
  head: () => ({ meta: [{ title: "Wat ik denk — Damian Vink" }] }),
  component: Denk,
});

function Denk() {
  return (
    <SiteShell>
      <PageWrap>
        <Breadcrumb items={[{ label: "Wat ik denk" }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          Wat ik denk
        </p>
        <DisplayTitle before="Wat ik" last="denk." className="mt-3" />
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Artikelen en later een podcast. Alleen stukken die ik zelf maak.
        </p>
        <div className="mt-10 space-y-3">
          <Link
            to="/denk/blog"
            className="block rounded-lg border border-line bg-elevated p-5 transition-colors hover:border-line-strong"
          >
            <p className="font-mono text-xs text-accent">01</p>
            <h2 className="mt-1 font-display text-xl font-semibold">Blog</h2>
            <p className="mt-1 text-sm text-muted">
              Artikelen. Nog geen stukken gepubliceerd.
            </p>
          </Link>
          <Link
            to="/denk/podcast"
            className="block rounded-lg border border-line bg-elevated p-5 transition-colors hover:border-line-strong"
          >
            <p className="font-mono text-xs text-accent">02</p>
            <h2 className="mt-1 font-display text-xl font-semibold">Podcast</h2>
            <p className="mt-1 text-sm text-muted">
              Afleveringen. Nog geen episodes gepubliceerd.
            </p>
          </Link>
        </div>
      </PageWrap>
    </SiteShell>
  );
}
