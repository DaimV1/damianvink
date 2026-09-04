import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { OringCalc } from "@/components/toolkit/oring-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "O-ringgroef, koorddiameter volgens ISO 3601-1. Groefdiepte t en breedte b (Dichtomatik-tabel) voor koorden 1,80–7,00 mm, radiaal en axiaal. Rekenhulp plus naslagtabel.";

export const Route = createFileRoute("/toolkit/o-ringgroef")({
  validateSearch: (s: Record<string, unknown>): { d2?: string; kind?: string } => ({
    d2: typeof s.d2 === "string" && /^\d{1,2}(\.\d{1,2})?$/.test(s.d2) ? s.d2 : undefined,
    kind: s.kind === "radial" || s.kind === "axial" || s.kind === "hydro" ? s.kind : undefined,
  }),
  head: () =>
    pageHead({
      title: "O-ringgroef (ISO 3601-1 koord) — Damian Vink",
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
          name: "O-ringgroef (ISO 3601-1 koord)",
          path: "/toolkit/o-ringgroef",
          description: DESCRIPTION,
          featureList: ["ISO 3601-1 koorddiameter", "radiaal", "axiaal", "groeftabel"],
        })}
      />
      <OringCalc />
      <Faq items={copy.faq ?? []} />
    </ToolkitFrame>
  );
}
