import { createFileRoute } from "@tanstack/react-router";
import { DisplayTitle } from "@/components/display-title";
import { JsonLd } from "@/components/json-ld";
import { SolarSystemLab } from "@/components/lab/solar-system";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import { tx, useLocale } from "@/lib/i18n/locale";
import { breadcrumbJsonLd, pageHead, webPageJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Interactieve simulatie van het zonnestelsel: acht planeten die om de zon draaien. Sleep, zoom en tik een planeet aan voor de cijfers.";
const DESCRIPTION_EN =
  "Interactive solar system simulation: eight planets orbiting the sun. Drag, zoom and tap a planet for the numbers.";

export const Route = createFileRoute("/lab/zonnestelsel")({
  head: () =>
    pageHead({
      title: "Zonnestelsel — Interactive Lab — Damian Vink",
      description: DESCRIPTION,
      path: "/lab/zonnestelsel",
    }),
  component: ZonnestelselPage,
});

function ZonnestelselPage() {
  const { locale } = useLocale();
  return (
    <SiteShell>
      <PageWrap wide>
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Interactive Lab", path: "/lab" },
            { name: tx(locale, "Zonnestelsel", "Solar system") },
          ])}
        />
        <JsonLd
          data={webPageJsonLd({
            name: tx(locale, "Zonnestelsel — Interactive Lab", "Solar system — Interactive Lab"),
            path: "/lab/zonnestelsel",
            description: tx(locale, DESCRIPTION, DESCRIPTION_EN),
          })}
        />
        <Breadcrumb items={[{ href: "/lab", label: "Interactive Lab" }, { label: tx(locale, "Zonnestelsel", "Solar system") }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Interactive Lab</p>
        <DisplayTitle
          text={tx(locale, "Zonnestelsel.", "Solar system.")}
          accent={tx(locale, "stelsel.", "system.")}
          className="mt-3"
        />
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          {tx(
            locale,
            "Acht planeten, één zon, echte orbitale verhoudingen — visueel gecomprimeerd zodat alles in beeld past.",
            "Eight planets, one sun, real orbital ratios — visually compressed so everything fits on screen.",
          )}
        </p>

        <div className="mt-10">
          <SolarSystemLab />
        </div>
      </PageWrap>
    </SiteShell>
  );
}
