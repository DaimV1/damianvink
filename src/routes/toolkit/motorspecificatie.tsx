import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { MotorCalc } from "@/components/toolkit/motor-calc";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { useLocale } from "@/lib/i18n/locale";
import { pageHead, softwareJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Motorspecificatie voor een aangedreven rol of trommel: n, F, T, P en de volgende IEC 60034 kW-stap.";

const NUM_RE = /^-?\d{0,6}([.,]\d{1,4})?$/;

export const Route = createFileRoute("/toolkit/motorspecificatie")({
  validateSearch: (
    s: Record<string, unknown>,
  ): {
    speed?: string;
    unit?: string;
    d?: string;
    mass?: string;
    duty?: string;
    mu?: string;
    alpha?: string;
    eta?: string;
    fb?: string;
    a?: string;
    rm?: string;
  } => {
    const num = (v: unknown) => (typeof v === "string" && NUM_RE.test(v) ? v : undefined);
    return {
      speed: num(s.speed),
      unit: s.unit === "m/min" || s.unit === "m/s" ? s.unit : undefined,
      d: num(s.d),
      mass: num(s.mass),
      duty:
        s.duty === "rollenbaan" || s.duty === "band" || s.duty === "helling" || s.duty === "hijsen"
          ? s.duty
          : undefined,
      mu: num(s.mu),
      alpha: num(s.alpha),
      eta: num(s.eta),
      fb: num(s.fb),
      a: num(s.a),
      rm: num(s.rm),
    };
  },
  head: () =>
    pageHead({
      title: "Motorspecificatie aandrijving — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/motorspecificatie",
    }),
  component: MotorPage,
});

function MotorPage() {
  const { locale } = useLocale();
  const copy = toolkitCopy("motor", locale);
  return (
    <ToolkitFrame
      active="motor"
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
          name: "Motorspecificatie aandrijving",
          path: "/toolkit/motorspecificatie",
          description: DESCRIPTION,
          featureList: [
            "n_rol",
            "F",
            "T",
            "P_as",
            "P_motor",
            "IEC 60034",
            "rollenbaan",
            "band",
            "helling",
            "hijsen",
          ],
        })}
      />
      <MotorCalc />
      <Faq items={copy.faq ?? []} />
    </ToolkitFrame>
  );
}
