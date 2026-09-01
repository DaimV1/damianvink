import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { KnikCalc } from "@/components/toolkit/knik-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Euler-knikberekening van een slanke staaf: kritieke last F_cr, kritieke spanning en slankheid λ voor vier inklemgevallen.";

export const Route = createFileRoute("/toolkit/knikberekening")({
  head: () =>
    pageHead({
      title: "Knikberekening balk Euler — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/knikberekening",
    }),
  component: KnikPage,
});

function KnikPage() {
  const { locale } = useLocale();
  const copy = toolkitCopy("knik", locale);
  return (
    <ToolkitFrame
      active="knik"
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
          name: "Knikberekening balk (Euler)",
          path: "/toolkit/knikberekening",
          description: DESCRIPTION,
          featureList: [
            "F_cr",
            "sigma_cr",
            "slankheid",
            "scharnier-scharnier",
            "ingeklemd-vrij",
            "ingeklemd-ingeklemd",
            "ingeklemd-scharnier",
          ],
        })}
      />
      <KnikCalc />
      <Faq items={copy.faq ?? []} />
    </ToolkitFrame>
  );
}
