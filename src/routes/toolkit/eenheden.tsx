import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { EenhedenCalc } from "@/components/toolkit/eenheden-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Eenheden omrekenen: imperial ↔ metrisch en SI onderling. Inch naar mm, °C naar K, dm³ naar L, lbf naar N, psi naar bar, pk naar kW.";

export const Route = createFileRoute("/toolkit/eenheden")({
  head: () =>
    pageHead({
      title: "Eenheden omrekenen (SI · imperial) — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/eenheden",
    }),
  component: EenhedenPage,
});

function EenhedenPage() {
  return (
    <ToolkitFrame
      active="eenheden"
      crumbs={[
        { href: "/toolkit", label: "Toolkit" },
        { label: "Eenheden" },
      ]}
      before="Eenheden"
      last="omrekenen."
      lede="Imperial naar metrisch en terug, plus SI onderling: lengte, volume, massa, kracht, druk, temperatuur, koppel, vermogen. Rekenhulp eerst; alle eenheden van de gekozen grootheid eronder."
    >
      <JsonLd
        data={softwareJsonLd({
          name: "Eenheden omrekenen",
          path: "/toolkit/eenheden",
          description: DESCRIPTION,
          featureList: [
            "inch ↔ mm",
            "°C ↔ K ↔ °F",
            "dm³ ↔ L",
            "lbf ↔ N",
            "psi ↔ bar",
            "pk ↔ kW",
          ],
        })}
      />
      <EenhedenCalc />
      <Faq
        items={[
          {
            q: "Hoeveel mm is 1 inch?",
            a: "Exact 25,4 mm. Dat is de internationale inch sinds 1959 (ISO 1). 1 ft = 12 in = 304,8 mm.",
          },
          {
            q: "Is 1 dm³ hetzelfde als 1 L?",
            a: "Ja. De liter is gedefinieerd als 1 dm³, dus 0,001 m³. 1 mL = 1 cm³.",
          },
          {
            q: "Celsius naar kelvin?",
            a: "T/K = t/°C + 273,15. 0 °C = 273,15 K; 20 °C = 293,15 K. Fahrenheit: T/K = (t/°F + 459,67) × 5/9.",
          },
          {
            q: "pk of hp?",
            a: "pk is de metrische paardenkracht (735,49875 W). hp is mechanical horsepower (745,69987 W). Voor IEC-motorstappen gebruik je kW, niet pk.",
          },
          {
            q: "US gallon of UK gallon?",
            a: "US liquid gallon = 231 in³ = 3,785411784 L. Imperial (UK) gallon = 4,54609 L. Die twee zijn niet inwisselbaar.",
          },
        ]}
      />
    </ToolkitFrame>
  );
}
