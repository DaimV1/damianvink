import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { Iso2768Calc } from "@/components/toolkit/iso2768-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "ISO 2768 algemene toleranties: lineair f/m/c/v en vorm H/K/L. Titelblok-default als een maat geen vakje heeft. Geen passing (ISO 286).";

export const Route = createFileRoute("/toolkit/iso-2768")({
  head: () =>
    pageHead({
      title: "Algemene toleranties ISO 2768-mK — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/iso-2768",
    }),
  component: Iso2768Page,
});

function Iso2768Page() {
  return (
    <ToolkitFrame
      active="iso2768"
      crumbs={[
        { href: "/toolkit", label: "Toolkit" },
        { label: "Algemene toleranties" },
      ]}
      before="Algemene"
      last="toleranties."
      lede="Titelblok-default als een maat geen vakje heeft. Geen passing (dat is ISO 286). Standaardaanduiding ISO 2768-mK."
    >
      <JsonLd
        data={softwareJsonLd({
          name: "Algemene toleranties ISO 2768",
          path: "/toolkit/iso-2768",
          description: DESCRIPTION,
          featureList: ["ISO 2768-1", "ISO 2768-2", "f/m/c/v", "H/K/L", "mK"],
        })}
      />
      <Iso2768Calc />
      <Faq
        items={[
          {
            q: "Wat betekent ISO 2768-mK?",
            a: "m is de middelste lineaire klasse (2768-1), K de middelste vormklasse (2768-2). Zet die aanduiding in of bij het titelblok.",
          },
          {
            q: "Wanneer zet ik de afwijking naast de maat?",
            a: "Onder 0,5 mm heeft de norm geen rij. De afwijking moet dan naast de nominale maat staan. Hetzelfde als een cel in de tabel leeg is (—).",
          },
          {
            q: "Is dit een passing?",
            a: "Nee. Passingen (H7/g6, speling, overmaat) staan onder ISO 286. ISO 2768 is de default als er geen vakje om de maat staat.",
          },
          {
            q: "2768-2 is ingetrokken. Waarom H/K/L?",
            a: "Deel 2 is in 2021 ingetrokken; opvolger ISO 22081. Tekeningen zetten nog mK, daarom staat de oude tabel erbij. Geen vervanging van een getolereerde maat in een vakje.",
          },
        ]}
      />
    </ToolkitFrame>
  );
}
