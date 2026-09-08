import { createFileRoute, Link } from "@tanstack/react-router";
import { Orbit } from "lucide-react";
import { DisplayTitle } from "@/components/display-title";
import { JsonLd } from "@/components/json-ld";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import { tx, useLocale } from "@/lib/i18n/locale";
import { itemListJsonLd, pageHead, webPageJsonLd } from "@/lib/seo";
import { showcaseBlurb, showcaseTagline, showcaseTitle, SHOWCASES } from "@/lib/lab/showcases";

const DESCRIPTION =
  "Interactive Lab: kleine interactieve builds en visualisaties naast de rekenhulpen. Zonnestelsel, en meer als het af is.";
const DESCRIPTION_EN =
  "Interactive Lab: small interactive builds and visualizations alongside the calculators. Solar system, and more as it's finished.";

export const Route = createFileRoute("/lab/")({
  head: () =>
    pageHead({
      title: "Interactive Lab — Damian Vink",
      description: DESCRIPTION,
      path: "/lab",
    }),
  component: LabIndex,
});

function LabIndex() {
  const { locale } = useLocale();
  return (
    <SiteShell>
      <PageWrap wide>
        <JsonLd
          data={webPageJsonLd({
            name: "Interactive Lab",
            path: "/lab",
            description: tx(locale, DESCRIPTION, DESCRIPTION_EN),
          })}
        />
        <JsonLd
          data={itemListJsonLd({
            name: "Interactive Lab",
            path: "/lab",
            items: SHOWCASES.map((s) => ({
              name: showcaseTitle(s, locale),
              url: s.href,
              description: showcaseBlurb(s, locale),
            })),
          })}
        />
        <Breadcrumb items={[{ label: "Interactive Lab" }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Interactive Lab</p>
        <DisplayTitle
          text={tx(locale, "Interactive Lab.", "Interactive Lab.")}
          accent="Lab."
          className="mt-3"
        />
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          {tx(
            locale,
            "Geen rekenhulp, geen norm — kleine interactieve builds om iets uit te proberen. Draait los van de toolkit.",
            "Not a calculator, not a standard — small interactive builds, just to try something out. Runs separately from the toolkit.",
          )}
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {SHOWCASES.map((s, i) => (
            <Link
              key={s.id}
              to={s.href}
              className="flex items-start gap-4 rounded-lg border border-line bg-elevated p-5 transition-colors duration-150 hover:border-line-strong"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-muted-bg text-accent">
                <Orbit className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                <strong className="mt-1 block font-display text-lg font-semibold tracking-tight text-ink">
                  {showcaseTitle(s, locale)}
                </strong>
                <small className="mt-1 block text-sm text-muted">{showcaseTagline(s, locale)}</small>
              </span>
            </Link>
          ))}
        </div>
      </PageWrap>
    </SiteShell>
  );
}
