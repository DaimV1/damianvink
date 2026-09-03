import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { SeegerCalc } from "@/components/toolkit/seeger-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Seegerringgroef DIN 471 (as) en DIN 472 (boring). Groef d2, breedte b en diepte t tot Ø100 mm. Rekenhulp plus werkplaatstabel.";

export const Route = createFileRoute("/toolkit/seegerring-groef")({
  validateSearch: (s: Record<string, unknown>): { d?: string; kind?: string } => ({
    d: typeof s.d === "string" && /^\d{1,4}$/.test(s.d) ? s.d : undefined,
    kind: s.kind === "as" || s.kind === "boring" ? s.kind : undefined,
  }),
  head: () =>
    pageHead({
      title: "Seegerringgroef DIN 471 / DIN 472 — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/seegerring-groef",
    }),
  component: SeegerPage,
});

function SeegerPage() {
  const { locale } = useLocale();
  const copy = toolkitCopy("seeger", locale);
  return (
    <ToolkitFrame
      active="seeger"
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
          name: "Seegerringgroef DIN 471/472",
          path: "/toolkit/seegerring-groef",
          description: DESCRIPTION,
          featureList: ["DIN 471", "DIN 472", "d2", "groefdiepte"],
        })}
      />
      <SeegerCalc />
      <Faq items={copy.faq ?? []} />
    </ToolkitFrame>
  );
}
