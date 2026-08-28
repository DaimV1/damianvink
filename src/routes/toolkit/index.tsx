import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { ToolkitIndexList } from "@/components/toolkit/toolkit-index-list";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { pageHead, softwareJsonLd } from "@/lib/seo";
import { TOOLS } from "@/lib/toolkit/tools";

const DESCRIPTION =
  "Engineering toolkit: eenheden (SI · imperial), ISO 286-passingen, DIN 6885-spiebanen, SKF-lagerpassingen, seegerringgroef DIN 471/472, VDI 2230-bevestigingsmateriaal, ISO 2768 algemene toleranties, motorspecificatie, pneumatische cilinder ISO 15552, richtlijnen kanten, O-ringgroef ISO 3601 en CAD-bronnen. Rekenhulp bovenaan, naslag eronder.";

export const Route = createFileRoute("/toolkit/")({
  head: () =>
    pageHead({
      title: "Engineering toolkit werktuigbouwkunde — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit",
    }),
  component: ToolkitIndex,
});

function ToolkitIndex() {
  return (
    <ToolkitFrame
      crumbs={[{ label: "Toolkit" }]}
      title="Engineering toolkit."
      accent="toolkit."
      lede="Rekenhulp en naslag voor machinebouw. Zoek op norm, trefwoord of eenheid; open een tool voor de rekenhulp bovenaan en de tabel eronder."
    >
      <JsonLd
        data={softwareJsonLd({
          name: "Engineering toolkit — Damian Vink",
          path: "/toolkit",
          description: DESCRIPTION,
          featureList: TOOLS.map((tool) => `${tool.title} (${tool.standard})`),
        })}
      />
      <ToolkitIndexList />
    </ToolkitFrame>
  );
}
