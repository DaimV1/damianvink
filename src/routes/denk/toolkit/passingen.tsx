import { createFileRoute } from "@tanstack/react-router";
import { PassingenCalc } from "@/components/toolkit/passingen-calc";
import { Faq } from "@/components/toolkit/calc-ui";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";

export const Route = createFileRoute("/denk/toolkit/passingen")({
  head: () => ({ meta: [{ title: "Passingen (ISO 286) — Damian Vink" }] }),
  component: PassingenPage,
});

function PassingenPage() {
  return (
    <ToolkitFrame
      active="passingen"
      crumbs={[
        { href: "/denk", label: "Wat ik denk" },
        { href: "/denk/toolkit", label: "Engineering toolkit" },
        { label: "Passingen" },
      ]}
      before="Passingen"
      last="(ISO 286)."
      lede={
        <>
          ISO 286, eenheidsgatstelsel. Rekenhulp eerst: nominale Ø en passing.
          Daaronder de tabellen. Diameters: boven 3 mm tot en met 50 mm.
        </>
      }
    >
      <PassingenCalc />
      <Faq
        items={[
          {
            q: "Wat is het eenheidsgatstelsel in ISO 286?",
            a: "Het gat krijgt een H-afwijking (ondermaat 0). De as (c, d, f, g, h, k, n, p, s) bepaalt of de passing los, overgang of vast is.",
          },
          {
            q: "Wat betekent H7/g6?",
            a: "Losse passing: gat H7, as g6. Altijd speling. Typisch voor glijdende of nauwkeurig verschuifbare delen.",
          },
          {
            q: "Waarom staan 30–40 mm en 40–50 mm apart?",
            a: "IT-graden zijn gelijk voor 30–50 mm (H7 = 25 µm). De fundamentele afwijking van c wijzigt bij 40 mm, daarom staat H11/c11 in twee rijen.",
          },
          {
            q: "Is H7/p6 altijd overmaat?",
            a: "Nee. Tot 18 mm is de maximale speling 0 µm (lijnpassing mogelijk). Vanaf 18–30 mm is max. speling negatief: altijd interferentie.",
          },
          {
            q: "Zijn de waarden in mm of µm?",
            a: "Tabellen en rekenhulp staan in mm, omgerekend uit ISO 286 (µm). JS7 toont vier decimalen waar IT7 oneven is.",
          },
        ]}
      />
    </ToolkitFrame>
  );
}
