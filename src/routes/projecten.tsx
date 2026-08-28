import { createFileRoute } from "@tanstack/react-router";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import { tx, useLocale } from "@/lib/i18n/locale";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/projecten")({
  head: () =>
    pageHead({
      title: "Projecten — Damian Vink",
      description:
        "Projecten uit de machinebouw en werktuigbouwkunde. Alleen cases met een echte toelichting.",
      path: "/projecten",
      noindex: true,
    }),
  component: Projecten,
});

function Projecten() {
  const { locale } = useLocale();
  return (
    <SiteShell>
      <PageWrap>
        <Breadcrumb items={[{ label: tx(locale, "Projecten", "Projects") }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          {tx(locale, "Projecten", "Projects")}
        </p>
        <DisplayTitle
          text={tx(locale, "Projecten.", "Projects.")}
          accent={tx(locale, "ten.", "jects.")}
          className="mt-3"
        />
        <p className="mt-5 text-lg leading-relaxed text-muted">
          {tx(locale, "Werk uit de machinebouw en werktuigbouwkunde.", "Work from machine building and mechanical engineering.")}
        </p>
        <div className="mt-10 rounded-xl border border-dashed border-line-strong bg-elevated px-6 py-12 text-center">
          <p className="font-display text-xl font-semibold">{tx(locale, "Nog geen cases", "No cases yet")}</p>
          <p className="mt-2 text-sm text-muted">
            {tx(locale, "Hier komen alleen projecten met een echte toelichting.", "Only projects with a real write-up will appear here.")}
          </p>
        </div>
      </PageWrap>
    </SiteShell>
  );
}
