import { createFileRoute } from "@tanstack/react-router";
import { Faq } from "@/components/toolkit/calc-ui";
import { OringCalc } from "@/components/toolkit/oring-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";

export const Route = createFileRoute("/denk/toolkit/o-ringgroef")({
  head: () => ({ meta: [{ title: "O-ringgroef — Damian Vink" }] }),
  component: OringPage,
});

function OringPage() {
  return (
    <ToolkitFrame
      active="oring"
      crumbs={[
        { href: "/denk", label: "Wat ik denk" },
        { href: "/denk/toolkit", label: "Engineering toolkit" },
        { label: "O-ringgroef" },
      ]}
      before="O-ring"
      last="groef."
      lede="ISO-koorden 1,80–7,00 mm: groef t / b, schema radiaal en axiaal. Kies koord en inbouw; de tabel markeert de rij."
    >
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
