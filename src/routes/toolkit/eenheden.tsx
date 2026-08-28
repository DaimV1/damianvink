import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { EenhedenCalc } from "@/components/toolkit/eenheden-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
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
  const { locale } = useLocale();
  const copy = toolkitCopy("eenheden", locale);
  return (
    <ToolkitFrame
      active="eenheden"
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
      <Faq items={copy.faq ?? []} />
    </ToolkitFrame>
  );
}
