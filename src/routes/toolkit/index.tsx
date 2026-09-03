import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { ToolkitIndexList } from "@/components/toolkit/toolkit-index-list";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
import { itemListJsonLd, pageHead, softwareJsonLd } from "@/lib/seo";
import { TOOLS } from "@/lib/toolkit/tools";

const DESCRIPTION =
  "Engineering toolkit: eenheden (SI · imperial), ISO 286-passingen, DIN 6885-spiebanen, SKF-lagerpassingen, seegerringgroef DIN 471/472, VDI 2230-bevestigingsmateriaal, ISO 2768 algemene toleranties, motorspecificatie, pneumatische cilinder ISO 15552, richtlijnen kanten, O-ringgroef ISO 3601, knikberekening, doorbuiging balk, CAD-bronnen en macro-bibliotheek.";

export const Route = createFileRoute("/toolkit/")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => ({
    q: typeof s.q === "string" && s.q.trim() ? s.q : undefined,
  }),
  head: () =>
    pageHead({
      title: "Engineering toolkit werktuigbouwkunde — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit",
    }),
  component: ToolkitIndex,
});

function ToolkitIndex() {
  const { locale } = useLocale();
  const copy = toolkitCopy("index", locale);
  const { q } = Route.useSearch();
  return (
    <ToolkitFrame
      crumbs={[{ label: copy.crumb }]}
      title={copy.title}
      accent={copy.accent}
      lede={copy.lede}
    >
      <JsonLd
        data={softwareJsonLd({
          name: "Engineering toolkit — Damian Vink",
          path: "/toolkit",
          description: DESCRIPTION,
          featureList: TOOLS.map((tool) => `${tool.title} (${tool.standard})`),
        })}
      />
      <JsonLd
        data={itemListJsonLd({
          name: "Engineering toolkit",
          path: "/toolkit",
          items: TOOLS.map((tool) => ({
            name: `${tool.title} (${tool.standard})`,
            url: tool.href,
            description: tool.blurb,
          })),
        })}
      />
      <ToolkitIndexList query={q ?? ""} />
    </ToolkitFrame>
  );
}
