import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { CylinderCalc } from "@/components/toolkit/cylinder-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Pneumatische cilinder: F = p·A, dubbelwerkend. ISO 15552 en ISO 6432, manometerdruk, lastfactor. Theoretisch, geen knik, geen Festo-type.";

const NUM_RE = /^\d{1,6}([.,]\d{1,2})?$/;

export const Route = createFileRoute("/toolkit/cilinder")({
  validateSearch: (
    s: Record<string, unknown>,
  ): { load?: string; p?: string; s?: string; dir?: string; stroke?: string } => ({
    load: typeof s.load === "string" && NUM_RE.test(s.load) ? s.load : undefined,
    p: typeof s.p === "string" && NUM_RE.test(s.p) ? s.p : undefined,
    s: typeof s.s === "string" && NUM_RE.test(s.s) ? s.s : undefined,
    dir: s.dir === "uit" || s.dir === "in" ? s.dir : undefined,
    stroke: typeof s.stroke === "string" && NUM_RE.test(s.stroke) ? s.stroke : undefined,
  }),
  head: () =>
    pageHead({
      title: "Pneumatische cilinder ISO 15552 — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/cilinder",
    }),
  component: CilinderPage,
});

function CilinderPage() {
  const { locale } = useLocale();
  const copy = toolkitCopy("cilinder", locale);
  return (
    <ToolkitFrame
      active="cilinder"
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
          name: "Pneumatische cilinder",
          path: "/toolkit/cilinder",
          description: DESCRIPTION,
          featureList: [
            "F = p·A",
            "ISO 15552",
            "ISO 6432",
            "F_uit",
            "F_in",
            "lastfactor",
            "normaal liters",
          ],
        })}
      />
      <CylinderCalc />
      <Faq items={copy.faq ?? []} />
    </ToolkitFrame>
  );
}
