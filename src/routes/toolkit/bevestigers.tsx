import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { FastenerCalc } from "@/components/toolkit/fastener-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Bevestigingsmateriaal M3–M24: doorlaat ISO 273, zeskant en inbus, aandraaimoment 8.8 / 10.9 / 12.9 volgens VDI 2230.";

export const Route = createFileRoute("/toolkit/bevestigers")({
  head: () =>
    pageHead({
      title: "Bevestigingsmateriaal ISO 273 / VDI 2230 — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/bevestigers",
    }),
  component: FastenerPage,
});

function FastenerPage() {
  const { locale } = useLocale();
  const copy = toolkitCopy("bevestigers", locale);
  return (
    <ToolkitFrame
      active="bevestigers"
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
          name: "Bevestigingsmateriaal ISO 273 / VDI 2230",
          path: "/toolkit/bevestigers",
          description: DESCRIPTION,
          featureList: ["ISO 273", "VDI 2230", "M3-M24", "aandraaimoment"],
        })}
      />
      <FastenerCalc />
      <Faq items={copy.faq ?? []} />
    </ToolkitFrame>
  );
}
