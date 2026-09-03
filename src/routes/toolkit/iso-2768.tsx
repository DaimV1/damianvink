import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { Iso2768Calc } from "@/components/toolkit/iso2768-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "ISO 2768 algemene toleranties: lineair f/m/c/v en vorm H/K/L. Titelblok-default als een maat geen vakje heeft. Geen passing (ISO 286).";

export const Route = createFileRoute("/toolkit/iso-2768")({
  validateSearch: (
    s: Record<string, unknown>,
  ): { len?: string; linear?: string; form?: string } => ({
    len: typeof s.len === "string" && /^\d{1,4}([.,]\d{1,2})?$/.test(s.len) ? s.len : undefined,
    linear: typeof s.linear === "string" && ["f", "m", "c", "v"].includes(s.linear) ? s.linear : undefined,
    form: typeof s.form === "string" && ["H", "K", "L"].includes(s.form) ? s.form : undefined,
  }),
  head: () =>
    pageHead({
      title: "Algemene toleranties ISO 2768-mK — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/iso-2768",
    }),
  component: Iso2768Page,
});

function Iso2768Page() {
  const { locale } = useLocale();
  const copy = toolkitCopy("iso2768", locale);
  return (
    <ToolkitFrame
      active="iso2768"
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
          name: "Algemene toleranties ISO 2768",
          path: "/toolkit/iso-2768",
          description: DESCRIPTION,
          featureList: ["ISO 2768-1", "ISO 2768-2", "f/m/c/v", "H/K/L", "mK"],
        })}
      />
      <Iso2768Calc />
      <Faq items={copy.faq ?? []} />
    </ToolkitFrame>
  );
}
