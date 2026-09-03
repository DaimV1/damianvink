import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { DeflectionCalc } from "@/components/toolkit/deflection-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Doorbuiging van een balk onder een puntlast op afstand a: vrij opgelegd of uitkraging. Doorbuiging bij de last en de maximale doorbuiging.";

const NUM_RE = /^\d{1,6}([.,]\d{1,3})?$/;
const SECTION_IDS = new Set(["rond", "buis", "rechthoek", "vierkant", "koker"]);
const END_IDS = new Set(["ss", "cant"]);

export const Route = createFileRoute("/toolkit/doorbuiging-balk")({
  validateSearch: (
    s: Record<string, unknown>,
  ): {
    section?: string;
    D?: string;
    dIn?: string;
    b?: string;
    h?: string;
    a?: string;
    t?: string;
    L?: string;
    end?: string;
    material?: string;
    P?: string;
    posA?: string;
  } => {
    const num = (v: unknown) => (typeof v === "string" && NUM_RE.test(v) ? v : undefined);
    return {
      section: typeof s.section === "string" && SECTION_IDS.has(s.section) ? s.section : undefined,
      D: num(s.D),
      dIn: num(s.dIn),
      b: num(s.b),
      h: num(s.h),
      a: num(s.a),
      t: num(s.t),
      L: num(s.L),
      end: typeof s.end === "string" && END_IDS.has(s.end) ? s.end : undefined,
      material: typeof s.material === "string" && /^[a-z]{1,20}$/.test(s.material) ? s.material : undefined,
      P: num(s.P),
      posA: num(s.posA),
    };
  },
  head: () =>
    pageHead({
      title: "Doorbuiging balk puntlast — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/doorbuiging-balk",
    }),
  component: DeflectionPage,
});

function DeflectionPage() {
  const { locale } = useLocale();
  const copy = toolkitCopy("doorbuiging", locale);
  return (
    <ToolkitFrame
      active="doorbuiging"
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
          name: "Doorbuiging balk",
          path: "/toolkit/doorbuiging-balk",
          description: DESCRIPTION,
          featureList: [
            "puntlast",
            "vrij opgelegd",
            "uitkraging",
            "doorbuiging bij last",
            "maximale doorbuiging",
          ],
        })}
      />
      <DeflectionCalc />
      <Faq items={copy.faq ?? []} />
    </ToolkitFrame>
  );
}
