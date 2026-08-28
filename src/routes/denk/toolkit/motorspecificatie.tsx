import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { MotorCalc } from "@/components/toolkit/motor-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Motorspecificatie voor een aangedreven rol of trommel: n, F, T, P en de volgende IEC 60034 kW-stap. SEW kiest het aggregaat.";

export const Route = createFileRoute("/denk/toolkit/motorspecificatie")({
  head: () =>
    pageHead({
      title: "Motorspecificatie aandrijving — Damian Vink",
      description: DESCRIPTION,
      path: "/denk/toolkit/motorspecificatie",
    }),
  component: MotorPage,
});

function MotorPage() {
  return (
    <ToolkitFrame
      active="motor"
      crumbs={[
        { href: "/denk/toolkit", label: "Toolkit" },
        { label: "Motorspecificatie" },
      ]}
      before="Motor"
      last="specificatie."
      lede="Berekent het bedrijfspunt van een horizontale aangedreven rol of trommel: n, F, T en P. SEW kiest het aggregaat. Geen cataloguskeuze, geen typecode."
    >
      <JsonLd
        data={softwareJsonLd({
          name: "Motorspecificatie aandrijving",
          path: "/denk/toolkit/motorspecificatie",
          description: DESCRIPTION,
          featureList: [
            "n_rol",
            "F",
            "T",
            "P_as",
            "P_motor",
            "IEC 60034",
            "rollenbaan",
            "band",
            "helling",
            "hijsen",
          ],
        })}
      />
      <MotorCalc />
      <Faq
        items={[
          {
            q: "Wat zit er in P_motor?",
            a: "P_motor = P_as / η × f_b. η is het rendement van de aandrijflijn (standaard 0,85), f_b de bedrijfsfactor (standaard 1,2). P_as is F·v op de rol, in watt.",
          },
          {
            q: "Wat is de IEC-stap?",
            a: "De volgende cataloguswaarde uit de IEC 60034 kW-reeks, niet het berekende asvermogen. 0,104 kW wordt 0,12 kW. Boven 315 kW staat er geen stap in deze reeks.",
          },
          {
            q: "Kiest deze tool een SEW-type?",
            a: "Nee. Deze rekenhulp bepaalt n, F, T en P. SEW kiest het reductoraggregaat in Online Support of DriveConfigurator. Geen typecode, geen voorraadkeuze.",
          },
          {
            q: "Wat is i ≈ 1450 / n?",
            a: "Een familie-indicatie voor een 4-polige motor op 50 Hz (synchroon 1500, vollast rond 1450 min⁻¹). Geen gemeten toerental.",
          },
        ]}
      />
    </ToolkitFrame>
  );
}
