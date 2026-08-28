import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { CylinderCalc } from "@/components/toolkit/cylinder-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Pneumatische cilinder: F = p·A, dubbelwerkend. ISO 15552 en ISO 6432, manometerdruk, lastfactor. Theoretisch, geen knik, geen Festo-type.";

export const Route = createFileRoute("/toolkit/cilinder")({
  head: () =>
    pageHead({
      title: "Pneumatische cilinder ISO 15552 — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/cilinder",
    }),
  component: CilinderPage,
});

function CilinderPage() {
  return (
    <ToolkitFrame
      active="cilinder"
      crumbs={[
        { href: "/toolkit", label: "Toolkit" },
        { label: "Cilinder" },
      ]}
      title="Pneumatische cilinder."
      accent="cilinder."
      lede="Berekent de ISO-boring bij last en druk. F = p·A, dubbelwerkend. Festo of SMC kiest het type. Geen knikberekening."
    >
      <JsonLd
        data={softwareJsonLd({
          name: "Pneumatische cilinder",
          path: "/toolkit/cilinder",
          description: DESCRIPTION,
          featureList: [
            "F = p·A",
            "ISO 15552",
            "ISO 6432",
            "F_uit",
            "F_in",
            "lastfactor",
            "normaal liters",
          ],
        })}
      />
      <CylinderCalc />
      <Faq
        items={[
          {
            q: "Wat is F = p·A?",
            a: "Theoretische kracht: druk (manometer, in N/mm²) maal zuigeroppervlak. 1 bar = 0,1 N/mm². Geen wrijving, geen afdichtingverlies.",
          },
          {
            q: "6 bar of 6 bar absoluut?",
            a: "Manometerdruk (overdruk). 6 bar op de reduceerventiel is 6 bar gauge. Luchtverbruik per cyclus gebruikt p+1 als benadering van absoluut.",
          },
          {
            q: "Waarom lastfactor 1,25?",
            a: "Vuistregel voor wrijving en dynamiek. Geen normwaarde. Verhoog bij verticale last, stoppen op de stang, of onbekende wrijving. S = 1 is puur theoretisch.",
          },
          {
            q: "Kiest deze tool een Festo- of SMC-type?",
            a: "Nee. Alleen de ISO-boring en basisstang. Geen typecode, geen demping, geen sensorsleuf. Lange slag op drukstang: knik in de catalogus van de fabrikant.",
          },
        ]}
      />
    </ToolkitFrame>
  );
}
