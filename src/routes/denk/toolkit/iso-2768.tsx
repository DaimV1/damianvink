import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { Iso2768Calc } from "@/components/toolkit/iso2768-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Algemene toleranties ISO 2768: titelblok-default als een maat geen kader heeft. Lineair f/m/c/v, vorm H/K/L. Geen passing (ISO 286). Standaard ISO 2768-mK.";

export const Route = createFileRoute("/denk/toolkit/iso-2768")({
  head: () =>
    pageHead({
      title: "Algemene toleranties ISO 2768 — Damian Vink",
      description: DESCRIPTION,
      path: "/denk/toolkit/iso-2768",
    }),
  component: Iso2768Page,
});

function Iso2768Page() {
  return (
    <ToolkitFrame
      active="iso2768"
      crumbs={[
        { href: "/denk/toolkit", label: "Toolkit" },
        { label: "Algemene toleranties" },
      ]}
      before="Algemene"
      last="toleranties."
      lede="Titelblok-default als een maat geen kader heeft. Geen passing (ISO 286). Standaard-aanduiding ISO 2768-mK."
    >
      <JsonLd
        data={softwareJsonLd({
          name: "Algemene toleranties ISO 2768",
          path: "/denk/toolkit/iso-2768",
          description: DESCRIPTION,
          featureList: ["ISO 2768-mK", "f/m/c/v", "H/K/L", "lineair", "vorm"],
        })}
      />
      <Iso2768Calc />
      <Faq
        items={[
          {
            q: "Wat is ISO 2768-mK?",
            a: "Titelblok-aanduiding: lineaire klasse m (gemiddeld) plus vormklasse K. Maten zonder kader vallen daaronder. Standaard op veel werktuigbouwkundige tekeningen.",
          },
          {
            q: "Is dit een passing zoals ISO 286?",
            a: "Nee. ISO 286 is H7/g6 en speling of overmaat. ISO 2768 is de algemene maattolerantie als er geen kader bij de maat staat.",
          },
          {
            q: "Maat kleiner dan 0,5 mm?",
            a: "Geen rij. De afwijking moet naast de maat op de tekening. Deze rekenhulp verzint geen naburige waarde.",
          },
          {
            q: "Geldt ISO 2768-2 (H/K/L) nog?",
            a: "Deel 2 is in 2021 ingetrokken; opvolger is ISO 22081. De tabellen staan hier omdat tekeningen nog mK vragen.",
          },
          {
            q: "Vervangt dit een kader op de tekening?",
            a: "Nee. Kritieke maten (passing, groef, lager) krijgen een eigen tolerantie. ISO 2768 is alleen de default voor maten zonder kader.",
          },
        ]}
      />
    </ToolkitFrame>
  );
}
