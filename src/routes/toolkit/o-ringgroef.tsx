import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { OringCalc } from "@/components/toolkit/oring-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "O-ringgroef volgens ISO 3601. Koorden 1,80–7,00 mm: groefdiepte t en breedte b, radiaal en axiaal. Rekenhulp plus naslagtabel.";

export const Route = createFileRoute("/toolkit/o-ringgroef")({
  head: () =>
    pageHead({
      title: "O-ringgroef ISO 3601 — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/o-ringgroef",
    }),
  component: OringPage,
});

function OringPage() {
  return (
    <ToolkitFrame
      active="oring"
      crumbs={[
        { href: "/toolkit", label: "Toolkit" },
        { label: "O-ringgroef" },
      ]}
      before="O-ring"
      last="groef."
      lede="ISO-koorden 1,80–7,00 mm: groef t / b, schema radiaal en axiaal. Kies koord en inbouw; de tabel markeert de rij."
    >
      <JsonLd
        data={softwareJsonLd({
          name: "O-ringgroef ISO 3601",
          path: "/toolkit/o-ringgroef",
          description: DESCRIPTION,
          featureList: ["ISO 3601", "radiaal", "axiaal", "koorddiameter"],
        })}
      />
      <OringCalc />
      <Faq
        items={[
          {
            q: "Wat is d₂?",
            a: "Koorddiameter volgens ISO 3601-1. Vijf groepen: 1,80 / 2,65 / 3,55 / 5,30 / 7,00 mm.",
          },
          {
            q: "Groef voor 2,65 mm radiaal statisch?",
            a: "t = 2,0 mm (+0,05), b = 3,6 mm (+0,25). Nominale samendrukking ongeveer 25 % — geen plus-mintolerantie.",
          },
        ]}
      />
    </ToolkitFrame>
  );
}
