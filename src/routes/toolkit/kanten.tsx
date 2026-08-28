import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { KantenCalc } from "@/components/toolkit/kanten-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Richtlijnen kanten: inwendige radius Ri, minimale beenlengte en Z-buiging. Shop-spec 247TailorSteel Sophia, geen ISO of DIN.";

export const Route = createFileRoute("/toolkit/kanten")({
  head: () =>
    pageHead({
      title: "Richtlijnen kanten 247TailorSteel — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/kanten",
    }),
  component: KantenPage,
});

function KantenPage() {
  return (
    <ToolkitFrame
      active="kanten"
      crumbs={[
        { href: "/toolkit", label: "Toolkit" },
        { label: "Richtlijnen kanten" },
      ]}
      before="Richtlijnen"
      last="kanten."
      lede="Inwendige radius, minimale beenlengte en Z-buiging volgens de Sophia-shop van 247TailorSteel. Geen ISO, geen DIN. Altijd hun pagina nalopen."
    >
      <JsonLd
        data={softwareJsonLd({
          name: "Richtlijnen kanten 247TailorSteel",
          path: "/toolkit/kanten",
          description: DESCRIPTION,
          featureList: [
            "Ri",
            "beenlengte",
            "Z-buiging",
            "haaks",
            "scherp",
            "staal",
            "aluminium",
            "RVS",
            "hoogsterkte",
          ],
        })}
      />
      <KantenCalc />
      <Faq
        items={[
          {
            q: "Is dit ISO of DIN?",
            a: "Nee. Het is de aanleverspecificatie van 247TailorSteel Sophia. Andere shops hebben andere radii en beenlengtes. Open hun pagina; dit is een werkblad.",
          },
          {
            q: "Wat zijn Ri, w, s en x?",
            a: "Ri is de inwendige radius na kanten. w is de minimale beenlengte, s de bijbehorende maat op die rij, x de Z-maat voor een Z-buiging. Lege cel betekent: niet in hun tabel.",
          },
          {
            q: "Waarom is alu 0,8 mm Ri leeg?",
            a: "Op de 247-pagina staat daar een streepje. Dat is geen buurrij van staal 0,8 of alu 1,0 mm. Geen naburige waarde invullen.",
          },
          {
            q: "Waarom 10 en 12 mm extra?",
            a: "247 noteert dat die diktes niet over de volle plaatlengte kunnen. De tool toont de rij wél, met die kanttekening. Check de actuele pagina.",
          },
        ]}
      />
    </ToolkitFrame>
  );
}
