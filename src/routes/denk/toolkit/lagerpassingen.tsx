import { createFileRoute } from "@tanstack/react-router";
import { Faq } from "@/components/toolkit/calc-ui";
import { LagerCalc } from "@/components/toolkit/lager-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";

export const Route = createFileRoute("/denk/toolkit/lagerpassingen")({
  head: () => ({ meta: [{ title: "Lagerpassingen — Damian Vink" }] }),
  component: LagerPage,
});

function LagerPage() {
  return (
    <ToolkitFrame
      active="lager"
      crumbs={[
        { href: "/denk", label: "Wat ik denk" },
        { href: "/denk/toolkit", label: "Engineering toolkit" },
        { label: "Lagerpassingen" },
      ]}
      before="Lager"
      last="passingen."
      lede="Groefkogellagers: vast/los, SKF-klassen, ISO 286 tot Ø 50 mm. Kies rotatie en last; de aanbevolen as- en huisklasse volgt direct."
    >
      <LagerCalc />
      <Faq
        items={[
          {
            q: "Wanneer een vaste passing op de as?",
            a: "Als de binnenring draait t.o.v. de radiale last. Die ring vast, de andere los.",
          },
          {
            q: "Welke astolerantie bij groefkogel Ø 20 mm?",
            a: "Licht: j6. Normaal tot hoog: k5. Huis meestal H7, of K7 als de buitenring niet hoeft te schuiven. js5 geldt alleen tot en met 17 mm.",
          },
          {
            q: "Gedeeld huis?",
            a: "Geen grote overmaat. Duursma: G of H, maximaal K.",
          },
        ]}
      />
    </ToolkitFrame>
  );
}
