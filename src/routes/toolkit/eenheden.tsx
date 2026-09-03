import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { EenhedenCalc } from "@/components/toolkit/eenheden-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Eenheden omrekenen: imperial ↔ metrisch en SI onderling. Inch naar mm, °C naar K, dm³ naar L, lbf naar N, psi naar bar, pk naar kW.";

const CATEGORY_IDS = new Set([
  "lengte",
  "oppervlakte",
  "volume",
  "massa",
  "kracht",
  "druk",
  "temperatuur",
  "snelheid",
  "koppel",
  "vermogen",
  "energie",
  "hoek",
]);
const ID_RE = /^[a-zA-Z0-9_-]{1,12}$/;

export const Route = createFileRoute("/toolkit/eenheden")({
  validateSearch: (
    s: Record<string, unknown>,
  ): { cat?: string; from?: string; to?: string; val?: string; side?: string } => ({
    cat: typeof s.cat === "string" && CATEGORY_IDS.has(s.cat) ? s.cat : undefined,
    from: typeof s.from === "string" && ID_RE.test(s.from) ? s.from : undefined,
    to: typeof s.to === "string" && ID_RE.test(s.to) ? s.to : undefined,
    val: typeof s.val === "string" && /^-?\d{0,9}([.,]\d{1,6})?$/.test(s.val) ? s.val : undefined,
    side: s.side === "from" || s.side === "to" ? s.side : undefined,
  }),
  head: () =>
    pageHead({
      title: "Eenheden omrekenen (SI · imperial) — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/eenheden",
    }),
  component: EenhedenPage,
});

function EenhedenPage() {
  const { locale } = useLocale();
  const copy = toolkitCopy("eenheden", locale);
  return (
    <ToolkitFrame
      active="eenheden"
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
          name: "Eenheden omrekenen",
          path: "/toolkit/eenheden",
          description: DESCRIPTION,
          featureList: [
            "inch ↔ mm",
            "°C ↔ K ↔ °F",
            "dm³ ↔ L",
            "lbf ↔ N",
            "psi ↔ bar",
            "pk ↔ kW",
          ],
        })}
      />
      <EenhedenCalc />
      <Faq items={copy.faq ?? []} />
    </ToolkitFrame>
  );
}
