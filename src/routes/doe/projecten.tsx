import { createFileRoute } from "@tanstack/react-router";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";

export const Route = createFileRoute("/doe/projecten")({
  head: () => ({ meta: [{ title: "Projecten — Damian Vink" }] }),
  component: Projecten,
});

function Projecten() {
  return (
    <SiteShell>
      <PageWrap>
        <Breadcrumb
          items={[
            { href: "/doe", label: "Wat ik doe" },
            { label: "Projecten" },
          ]}
        />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          Wat ik doe
        </p>
        <DisplayTitle before="Projec" last="ten." className="mt-3" />
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Werk uit de machinebouw en werktuigbouwkunde.
        </p>
        <div className="mt-10 rounded-xl border border-dashed border-line-strong bg-elevated px-6 py-12 text-center">
          <p className="font-display text-xl font-semibold">Nog geen cases</p>
          <p className="mt-2 text-sm text-muted">
            Hier komen alleen projecten met een echte toelichting.
          </p>
        </div>
      </PageWrap>
    </SiteShell>
  );
}
