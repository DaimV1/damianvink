import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { SeegerCalc } from "@/components/toolkit/seeger-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Seegerringgroef DIN 471 (as) en DIN 472 (boring). Groef d2, breedte b en diepte t tot Ø100 mm. Rekenhulp plus werkplaatstabel.";

export const Route = createFileRoute("/denk/toolkit/seegerring-groef")({
  head: () =>
    pageHead({
      title: "Seegerringgroef DIN 471 / DIN 472 — Damian Vink",
      description: DESCRIPTION,
      path: "/denk/toolkit/seegerring-groef",
    }),
  component: SeegerPage,
});

function SeegerPage() {
  return (
    <ToolkitFrame
      active="seeger"
      crumbs={[
        { href: "/denk/toolkit", label: "Toolkit" },
        { label: "Seegerringgroef" },
      ]}
      before="Seegerring"
      last="groef."
      lede="Borgringgroef op de as (DIN 471) of in de boring (DIN 472). Vul de nominale Ø in; de tabel markeert d₂, b en t."
    >
      <JsonLd
        data={softwareJsonLd({
          name: "Seegerringgroef DIN 471/472",
          path: "/denk/toolkit/seegerring-groef",
          description: DESCRIPTION,
          featureList: ["DIN 471", "DIN 472", "d2", "groefdiepte"],
        })}
      />
      <SeegerCalc />
      <Faq
        items={[
          {
            q: "Wat is het verschil tussen DIN 471 en DIN 472?",
            a: "DIN 471 is de seegerring voor een as: groef aan de buitenkant, d₂ kleiner dan d₁. DIN 472 is voor een boring: groef aan de binnenkant, d₂ groter dan d₁.",
          },
          {
            q: "Hoe volgt t uit de tabel?",
            a: "t is de nominale groefdiepte: |d₁ − d₂| / 2. Bij Ø 20 mm as is d₂ = 19 mm, dus t = 0,5 mm.",
          },
          {
            q: "Zit er tolerantie op de groefdiepte?",
            a: "DIN geeft t als rekenmaat bij nominale d₁/d₂. De maattolerantie zit op d₂: h11 op de as, H11 in de boring. t wordt daardoor 0 / +IT11/2 (bij Ø 20 as: 0 / +0,065 mm). Dieper mag, ondieper niet — anders staat de ring bol. Breedte b is H13.",
          },
          {
            q: "Waarom ontbreekt Ø 23 mm?",
            a: "Seegerringen zijn nominale maten, geen bereik zoals bij spiebanen. Alleen de rijen in DIN 471/472 (en deze werkplaatstabel tot 100 mm) bestaan.",
          },
          {
            q: "Waar komt de tabel vandaan?",
            a: "Werkplaatstabel seegerringgroef, onder meer verspanen-metaal, gelijk aan DIN 471/472. n-min. (afstand tot de schouder) staat niet in die tabel — die haal je uit de norm als de last dat vraagt.",
          },
        ]}
      />
    </ToolkitFrame>
  );
}
