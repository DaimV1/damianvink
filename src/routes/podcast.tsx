import { createFileRoute } from "@tanstack/react-router";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import { tx, useLocale } from "@/lib/i18n/locale";
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
  const { locale } = useLocale();
  return (
    <SiteShell>
      <PageWrap>
        <Breadcrumb items={[{ label: "Podcast" }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          {tx(locale, "Artikelen", "Episodes")}
        </p>
        <DisplayTitle text="Podcast." className="mt-3" />
        <p className="mt-5 text-lg leading-relaxed text-muted">
          {tx(locale, "Nog geen afleveringen.", "No episodes yet.")}
        </p>
        <div className="mt-10 rounded-xl border border-dashed border-line-strong bg-elevated px-6 py-12 text-center">
          <p className="font-display text-xl font-semibold">{tx(locale, "Nog geen afleveringen", "No episodes yet")}</p>
          <p className="mt-2 text-sm text-muted">
            {tx(
              locale,
              "Hier komen afleveringen over werktuigbouwkunde en projecten, als ze er zijn.",
              "Episodes on mechanical engineering and projects, when they exist.",
            )}
          </p>
        </div>
      </PageWrap>
    </SiteShell>
  );
}
