import { createFileRoute } from "@tanstack/react-router";
import { Faq } from "@/components/toolkit/calc-ui";
import { FastenerCalc } from "@/components/toolkit/fastener-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";

export const Route = createFileRoute("/denk/toolkit/bevestigers")({
  head: () => ({
    meta: [{ title: "Bevestigers (ISO 273 / VDI 2230) — Damian Vink" }],
  }),
  component: FastenerPage,
});

function FastenerPage() {
  return (
    <ToolkitFrame
      active="bevestigers"
      crumbs={[
        { href: "/denk", label: "Wat ik denk" },
        { href: "/denk/toolkit", label: "Engineering toolkit" },
        { label: "Bevestigers" },
      ]}
      before="Bevesti"
      last="gers."
      lede="Metrische bouten M3–M24: doorlaat ISO 273, zeskant en inbus, aandraaimoment 8.8 / 10.9 / 12.9. Kies de M-maat; de tabellen markeren de rij."
    >
      <FastenerCalc />
      <Faq
        items={[
          {
            q: "Welke doorlaat is standaard?",
            a: "Middel (ISO 273 medium). Fijn bij nauwkeurige uitlijning, grof bij plaatwerk of ruwe gaten.",
          },
          {
            q: "Aandraaimoment M8 8.8?",
            a: "27,3 N·m bij μ = 0,14, droog, 90 % Rp0,2 (VDI 2230-1 A1). Voorspanning 18 100 N. Gesmeerd is μ lager — moment omlaag.",
          },
          {
            q: "Zeskant of inbus?",
            a: "SW en k zijn ISO 4014/4017 (zeskant). s en dk zijn ISO 4762 (cilinderkop inbus). Zelfde M-draad, andere kop.",
          },
          {
            q: "Is dit een VDI-verbinding?",
            a: "Nee. Tabel A1 is een startwaarde voor statische, concentrische last. Wisselende last, klemverhouding en inbedlengte reken je in VDI 2230.",
          },
        ]}
      />
    </ToolkitFrame>
  );
}
