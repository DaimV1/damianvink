import { createFileRoute, Link } from "@tanstack/react-router";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import { TOOLS } from "@/lib/toolkit/tools";

export const Route = createFileRoute("/heb/")({
  head: () => ({ meta: [{ title: "Wat ik heb — Damian Vink" }] }),
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
        <ul className="mt-8 space-y-2">
          {TOOLS.map((tool) => (
            <li key={tool.id}>
              <Link to={tool.href} className="text-sm text-accent hover:underline">
                {tool.title} ({tool.standard}) →
              </Link>
            </li>
          ))}
        </ul>
      </PageWrap>
    </SiteShell>
  );
}
