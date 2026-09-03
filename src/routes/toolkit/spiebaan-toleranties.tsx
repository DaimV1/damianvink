import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { SpiebaanCalc } from "@/components/toolkit/spiebaan-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "DIN 6885-1 spiebaan-toleranties: t1, t2, b×h. Vul de as-Ø in; de tabel markeert de rij. P9 vaste zitting, N9/JS9 lichte zitting.";

export const Route = createFileRoute("/toolkit/spiebaan-toleranties")({
  validateSearch: (s: Record<string, unknown>): { d?: string } => ({
    d: typeof s.d === "string" && /^\d{1,4}$/.test(s.d) ? s.d : undefined,
  }),
  head: () =>
    pageHead({
      title: "Spiebaan-toleranties DIN 6885 (t1/t2) — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/spiebaan-toleranties",
    }),
  component: SpiebaanPage,
});

function SpiebaanPage() {
  const { locale } = useLocale();
  const copy = toolkitCopy("spiebaan", locale);
  return (
    <ToolkitFrame
      active="spiebaan"
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
          name: "Spiebaan-toleranties DIN 6885",
          path: "/toolkit/spiebaan-toleranties",
          description: DESCRIPTION,
          featureList: ["t1", "t2", "P9", "N9/JS9", "DIN 6885-1"],
        })}
      />
      <SpiebaanCalc />
      <Faq items={copy.faq ?? []} />
    </ToolkitFrame>
  );
}
