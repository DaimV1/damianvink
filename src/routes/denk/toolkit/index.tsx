import { createFileRoute, Link } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { pageHead, softwareJsonLd } from "@/lib/seo";
import { TOOLS } from "@/lib/toolkit/tools";

const DESCRIPTION =
  "Engineering toolkit: ISO 286-passingen, DIN 6885-spiebanen, SKF-lagerpassingen, seegerringgroef DIN 471/472, VDI 2230-bevestigingsmateriaal, ISO 2768 algemene toleranties, motorspecificatie, O-ringgroef ISO 3601 en CAD-bronnen. Rekenhulp bovenaan, naslag eronder.";

export const Route = createFileRoute("/denk/toolkit/")({
  head: () =>
    pageHead({
      title: "Engineering toolkit werktuigbouwkunde — Damian Vink",
      description: DESCRIPTION,
      path: "/denk/toolkit",
    }),
  component: ToolkitIndex,
});

function ToolkitIndex() {
  return (
    <ToolkitFrame
      crumbs={[{ label: "Toolkit" }]}
      before="Engineering"
      last="toolkit."
      lede="Rekenhulp en naslag voor machinebouw: passingen, spiebanen, lagers, seegerringgroeven, bevestigingsmateriaal, algemene toleranties, motorspecificatie en CAD-bronnen. Open een tool; de rekenhulp staat bovenaan, de tabel of bronnen eronder."
    >
      <JsonLd
        data={softwareJsonLd({
          name: "Engineering toolkit — Damian Vink",
          path: "/denk/toolkit",
          description: DESCRIPTION,
          featureList: TOOLS.map((tool) => `${tool.title} (${tool.standard})`),
        })}
      />
      <div className="grid gap-3">
        {TOOLS.map((tool, i) => (
          <Link
            key={tool.id}
            to={tool.href}
            className="flex items-center justify-between gap-4 rounded-lg border border-line bg-elevated p-5 transition-colors duration-150 hover:border-line-strong"
          >
            <span>
              <span className="font-mono text-xs text-accent">
                {String(i + 1).padStart(2, "0")} · {tool.standard}
              </span>
              <strong className="mt-1 block font-display text-lg font-semibold tracking-tight text-ink">
                {tool.title}
              </strong>
              <small className="mt-1 block text-sm text-muted">{tool.blurb}</small>
              <small className="mt-2 block font-mono text-xs uppercase tracking-[0.12em] text-subtle">
                {tool.kind === "naslag" ? "Naslag" : "Rekenhulp + naslag"}
              </small>
            </span>
            <span aria-hidden="true" className="text-accent">
              →
            </span>
          </Link>
        ))}
      </div>
    </ToolkitFrame>
  );
}
