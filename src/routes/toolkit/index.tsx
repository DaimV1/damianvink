import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { ToolkitIndexList } from "@/components/toolkit/toolkit-index-list";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
import { itemListJsonLd, pageHead, softwareJsonLd } from "@/lib/seo";
import { TOOLS } from "@/lib/toolkit/tools";

// Kept short for the SERP snippet (Google truncates ~155-160 chars) — the
// full 15-tool list lives on-page (ToolkitIndexList) and in itemListJsonLd
// below, so it doesn't need repeating here.
const DESCRIPTION =
  "Engineering toolkit voor werktuigbouwkunde: 15 rekenhulpen — ISO 286-passingen, DIN 6885-spiebanen, lagerpassingen, bevestigers, motorspecificatie en meer.";

// Full tool list, for structured data only — no SERP truncation constraint
// there, and it gives search engines a complete picture of what this page covers.
const DESCRIPTION_LONG =
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
          description: DESCRIPTION_LONG,
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
