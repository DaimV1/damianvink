import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { OringCalc } from "@/components/toolkit/oring-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "O-ringgroef volgens ISO 3601. Koorden 1,80–7,00 mm: groefdiepte t en breedte b, radiaal en axiaal. Rekenhulp plus naslagtabel.";

export const Route = createFileRoute("/toolkit/o-ringgroef")({
  head: () =>
    pageHead({
      title: "O-ringgroef ISO 3601 — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/o-ringgroef",
    }),
  component: OringPage,
});

function OringPage() {
  const { locale } = useLocale();
  const copy = toolkitCopy("oring", locale);
  return (
    <ToolkitFrame
      active="oring"
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
          name: "O-ringgroef ISO 3601",
          path: "/toolkit/o-ringgroef",
          description: DESCRIPTION,
          featureList: ["ISO 3601", "radiaal", "axiaal", "koorddiameter"],
        })}
      />
      <OringCalc />
      <Faq items={copy.faq ?? []} />
    </ToolkitFrame>
  );
}
