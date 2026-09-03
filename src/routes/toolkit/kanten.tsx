import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { KantenCalc } from "@/components/toolkit/kanten-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Richtlijnen kanten: inwendige radius Ri, minimale beenlengte en Z-buiging. Shop-spec 247TailorSteel Sophia, geen ISO of DIN.";

const MATERIAL_IDS = new Set(["staal", "alu", "rvs", "hoogsterkte"]);
const KIND_IDS = new Set(["haaks", "scherp"]);

export const Route = createFileRoute("/toolkit/kanten")({
  validateSearch: (
    s: Record<string, unknown>,
  ): { t?: string; material?: string; kind?: string; k?: string } => ({
    t: typeof s.t === "string" && /^\d{1,2}(\.\d{1,2})?$/.test(s.t) ? s.t : undefined,
    material: typeof s.material === "string" && MATERIAL_IDS.has(s.material) ? s.material : undefined,
    kind: typeof s.kind === "string" && KIND_IDS.has(s.kind) ? s.kind : undefined,
    k: typeof s.k === "string" && /^\d{1,2}[.,]?\d{0,2}$/.test(s.k) ? s.k : undefined,
  }),
  head: () =>
    pageHead({
      title: "Richtlijnen kanten 247TailorSteel — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/kanten",
    }),
  component: KantenPage,
});

function KantenPage() {
  const { locale } = useLocale();
  const copy = toolkitCopy("kanten", locale);
  return (
    <ToolkitFrame
      active="kanten"
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
          name: "Richtlijnen kanten 247TailorSteel",
          path: "/toolkit/kanten",
          description: DESCRIPTION,
          featureList: [
            "Ri",
            "beenlengte",
            "Z-buiging",
            "haaks",
            "scherp",
            "staal",
            "aluminium",
            "RVS",
            "hoogsterkte",
          ],
        })}
      />
      <KantenCalc />
      <Faq items={copy.faq ?? []} />
    </ToolkitFrame>
  );
}
