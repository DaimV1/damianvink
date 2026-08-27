import { createFileRoute, Link } from "@tanstack/react-router";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/heb/")({
  head: () =>
    pageHead({
      title: "Wat ik heb — Damian Vink",
      description:
        "Twee toolkits van Damian Vink: engineering-naslag tijdens ontwerp (ISO 286, DIN 6885) en een projectwerkplek tijdens de rit.",
      path: "/heb",
    }),
  component: Heb,
});

function Heb() {
  return (
    <SiteShell>
      <PageWrap>
        <Breadcrumb items={[{ label: "Wat ik heb" }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          Wat ik heb
        </p>
        <DisplayTitle before="Wat ik" last="heb." className="mt-3" />
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Twee toolkits: naslag tijdens ontwerp, en een projectwerkplek tijdens
          de rit.
        </p>
        <div className="mt-10 space-y-3">
          <Link
            to="/denk/toolkit"
            className="block rounded-lg border border-line bg-elevated p-5 transition-colors hover:border-line-strong"
          >
            <p className="font-mono text-xs text-accent">01</p>
            <h2 className="mt-1 font-display text-xl font-semibold">
              Engineering toolkit
            </h2>
            <p className="mt-1 text-sm text-muted">
              Passingen, spiebanen, lagerpassingen, seegerringgroef, bevestigers
              en CAD-bronnen.
            </p>
          </Link>
          <Link
            to="/denk/project"
            className="block rounded-lg border border-line bg-elevated p-5 transition-colors hover:border-line-strong"
          >
            <p className="font-mono text-xs text-accent">02</p>
            <h2 className="mt-1 font-display text-xl font-semibold">
              Projectwerkplek
            </h2>
            <p className="mt-1 text-sm text-muted">
              Fasen, stakeholders, risico’s, issues en het beslispunt.
            </p>
          </Link>
        </div>
      </PageWrap>
    </SiteShell>
  );
}
