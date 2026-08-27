import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { SpiebaanCalc } from "@/components/toolkit/spiebaan-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "DIN 6885-1 spiebaan-toleranties: t1, t2, b×h. Vul de as-Ø in; de tabel markeert de rij. P9 vaste zitting, N9/JS9 lichte zitting.";

export const Route = createFileRoute("/denk/toolkit/spiebaan-toleranties")({
  head: () =>
    pageHead({
      title: "Spiebaan-toleranties DIN 6885 (t1/t2) — Damian Vink",
      description: DESCRIPTION,
      path: "/denk/toolkit/spiebaan-toleranties",
    }),
  component: SpiebaanPage,
});

function SpiebaanPage() {
  return (
    <ToolkitFrame
      active="spiebaan"
      crumbs={[
        { href: "/denk/toolkit", label: "Toolkit" },
        { label: "Spiebaan-toleranties" },
      ]}
      before="Spiebaan-toleranties"
      last="(DIN 6885)."
      lede="Parallelspieën en spiebanen volgens DIN 6885-1 (hoge vorm). Vul de as-Ø in; de tabel eronder markeert de bijbehorende rij."
    >
      <JsonLd
        data={softwareJsonLd({
          name: "Spiebaan-toleranties DIN 6885",
          path: "/denk/toolkit/spiebaan-toleranties",
          description: DESCRIPTION,
          featureList: ["t1", "t2", "P9", "N9/JS9", "DIN 6885-1"],
        })}
      />
      <SpiebaanCalc />
      <Faq
        items={[
          {
            q: "Wat is t1 en t2 bij DIN 6885?",
            a: "t₁ is de groefdiepte in de as, t₂ in de naaf. b × h is de spiemaat.",
          },
          {
            q: "Welke breedtetolerantie is standaard?",
            a: "P9 in as en naaf: vaste zitting (DIN 6885-1:2021). Lichte zitting is N9 (as) / JS9 (naaf). H9/D10 is werkplaats-/UNI-conventie.",
          },
          {
            q: "Hoort Ø 6 mm in de tabel?",
            a: "Nee. DIN 6885-1: eerste rij is boven 6 mm tot en met 8 mm. Precies Ø 6 mm valt erbuiten.",
          },
          {
            q: "Wat is het verschil tussen DIN 6885-1 en 6885-2?",
            a: "DIN 6885-1 is de hoge vorm. DIN 6885-2 is de lage vorm, met een andere radiale positie van de spie.",
          },
        ]}
      />
    </ToolkitFrame>
  );
}
