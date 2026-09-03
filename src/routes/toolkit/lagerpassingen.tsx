import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { LagerCalc } from "@/components/toolkit/lager-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Lagerpassingen voor groefkogellagers tot Ø50 mm. SKF-klassen, vast/los, as j6/k5, huis H7. Rekenhulp plus naslag volgens ISO 286.";

export const Route = createFileRoute("/toolkit/lagerpassingen")({
  validateSearch: (s: Record<string, unknown>): { d?: string; rot?: string; load?: string } => ({
    d: typeof s.d === "string" && /^\d{1,4}$/.test(s.d) ? s.d : undefined,
    rot: s.rot === "binnen" || s.rot === "buiten" || s.rot === "stil" ? s.rot : undefined,
    load: s.load === "licht" || s.load === "normaal" ? s.load : undefined,
  }),
  head: () =>
    pageHead({
      title: "Lagerpassingen SKF / ISO 286 — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/lagerpassingen",
    }),
  component: LagerPage,
});

function LagerPage() {
  const { locale } = useLocale();
  const copy = toolkitCopy("lager", locale);
  return (
    <ToolkitFrame
      active="lager"
      crumbs={[
        { href: "/toolkit", label: "Toolkit" },
        { label: copy.crumb },
      ]}
      title={copy.title}
      accent={copy.accent}
      lede={copy.lede}
    >
      <JsonLd
        data={softwareJsonLd({
          name: "Lagerpassingen SKF / ISO 286",
          path: "/toolkit/lagerpassingen",
          description: DESCRIPTION,
          featureList: ["SKF", "ISO 286", "j6", "k5", "H7", "vast/los"],
        })}
      />
      <LagerCalc />
      <Faq items={copy.faq ?? []} />
    </ToolkitFrame>
  );
}
