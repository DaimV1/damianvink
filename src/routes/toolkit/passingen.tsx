import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { PassingenCalc } from "@/components/toolkit/passingen-calc";
import { Faq } from "@/components/toolkit/calc-ui";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "ISO 286 voorkeurpassingen tot Ø50 mm. H7/g6, H7/h6, JS7. Rekenhulp voor speling en overmaat plus naslagtabel, eenheidsgatstelsel.";

export const Route = createFileRoute("/toolkit/passingen")({
  head: () =>
    pageHead({
      title: "Passingen ISO 286 (H7/g6, JS7) — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/passingen",
    }),
  component: PassingenPage,
});

function PassingenPage() {
  const { locale } = useLocale();
  const copy = toolkitCopy("passingen", locale);
  return (
    <ToolkitFrame
      active="passingen"
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
          name: "Passingen ISO 286",
          path: "/toolkit/passingen",
          description: DESCRIPTION,
          featureList: ["H7/g6", "H7/h6", "JS7", "speling", "overmaat", "eenheidsgatstelsel"],
        })}
      />
      <PassingenCalc />
      <Faq items={copy.faq ?? []} />
    </ToolkitFrame>
  );
}
