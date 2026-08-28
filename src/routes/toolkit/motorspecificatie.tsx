import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { MotorCalc } from "@/components/toolkit/motor-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Motorspecificatie voor een aangedreven rol of trommel: n, F, T, P en de volgende IEC 60034 kW-stap. SEW kiest het aggregaat.";

export const Route = createFileRoute("/toolkit/motorspecificatie")({
  head: () =>
    pageHead({
      title: "Motorspecificatie aandrijving — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/motorspecificatie",
    }),
  component: MotorPage,
});

function MotorPage() {
  const { locale } = useLocale();
  const copy = toolkitCopy("motor", locale);
  return (
    <ToolkitFrame
      active="motor"
      crumbs={[
        { href: "/toolkit", label: "Toolkit" },
        { label: copy.crumb },
      ]}
      title={copy.title}
      accent={copy.accent}
      lede={copy.lede}
    >
      <JsonLd
        data={softwareJsonLd({
          name: "Motorspecificatie aandrijving",
          path: "/toolkit/motorspecificatie",
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
      <Faq items={copy.faq ?? []} />
    </ToolkitFrame>
  );
}
