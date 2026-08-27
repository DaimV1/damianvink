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
        "Artikelen van Damian Vink over werktuigbouwkunde, ontwerp en wat hij onderweg leert. Nog geen stukken gepubliceerd.",
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
            { href: "/denk", label: "Wat ik denk" },
            { label: "Blog" },
          ]}
        />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          Wat ik denk
        </p>
        <DisplayTitle last="Blog." className="mt-3" />
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Artikelen over werktuigbouwkunde, ontwerp en wat ik onderweg leer.
        </p>
        <div className="mt-10 rounded-xl border border-dashed border-line-strong bg-elevated px-6 py-12 text-center">
          <p className="font-display text-xl font-semibold">Nog geen artikelen</p>
          <p className="mt-2 text-sm text-muted">
            Hier komen alleen stukken die ik zelf schrijf.
          </p>
        </div>
      </PageWrap>
    </SiteShell>
  );
}
