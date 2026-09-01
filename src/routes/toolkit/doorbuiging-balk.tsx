import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { DeflectionCalc } from "@/components/toolkit/deflection-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Doorbuiging van een balk onder een puntlast op afstand a: vrij opgelegd of uitkraging. Doorbuiging bij de last en de maximale doorbuiging.";

export const Route = createFileRoute("/toolkit/doorbuiging-balk")({
  head: () =>
    pageHead({
      title: "Doorbuiging balk puntlast — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/doorbuiging-balk",
    }),
  component: DeflectionPage,
});

function DeflectionPage() {
  const { locale } = useLocale();
  const copy = toolkitCopy("doorbuiging", locale);
  return (
    <ToolkitFrame
      active="doorbuiging"
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
          name: "Doorbuiging balk",
          path: "/toolkit/doorbuiging-balk",
          description: DESCRIPTION,
          featureList: [
            "puntlast",
            "vrij opgelegd",
            "uitkraging",
            "doorbuiging bij last",
            "maximale doorbuiging",
          ],
        })}
      />
      <DeflectionCalc />
      <Faq items={copy.faq ?? []} />
    </ToolkitFrame>
  );
}
