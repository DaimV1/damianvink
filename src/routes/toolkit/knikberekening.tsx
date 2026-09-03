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

const NUM_RE = /^\d{1,6}([.,]\d{1,3})?$/;
const SECTION_IDS = new Set(["rond", "buis", "rechthoek", "vierkant", "koker"]);
const END_IDS = new Set(["hh", "fc", "ff", "fp"]);

export const Route = createFileRoute("/toolkit/knikberekening")({
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
    F?: string;
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
      F: num(s.F),
    };
  },
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
