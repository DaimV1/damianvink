import type { ReactNode } from "react";
import { DisplayTitle } from "@/components/display-title";
import { JsonLd } from "@/components/json-ld";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { SourceBadge } from "@/components/toolkit/calc-ui";
import { RelatedTools } from "@/components/toolkit/related-tools";
import { Breadcrumb, ToolSwitcher } from "@/components/toolkit/tool-switcher";
import { tx, useLocale } from "@/lib/i18n/locale";
import { breadcrumbJsonLd } from "@/lib/seo";
import { fmtIsoDateNl, TOOLS, type ToolId } from "@/lib/toolkit/tools";

function VerifiedBadge({ active }: { active?: ToolId }) {
  const { locale } = useLocale();
  const tool = active ? TOOLS.find((t) => t.id === active) : undefined;
  if (!tool) return null;
  return (
    <SourceBadge>
      {tx(
        locale,
        `Laatst gecontroleerd: ${fmtIsoDateNl(tool.verifiedAt)}`,
        `Last checked: ${fmtIsoDateNl(tool.verifiedAt)}`,
      )}
    </SourceBadge>
  );
}

export function ToolkitFrame({
  active,
  crumbs,
  eyebrow = "Engineering toolkit",
  title,
  accent,
  lede,
  children,
}: {
  active?: ToolId;
  crumbs: { href?: string; label: string }[];
  eyebrow?: string;
  title: string;
  accent: string;
  lede: ReactNode;
  children: ReactNode;
}) {
  return (
    <SiteShell subnav={<ToolSwitcher active={active} />}>
      <PageWrap wide>
        <JsonLd
          data={breadcrumbJsonLd(
            crumbs.map((c) => ({ name: c.label, path: c.href })),
          )}
        />
        <Breadcrumb items={crumbs} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          {eyebrow}
        </p>
        <DisplayTitle text={title} accent={accent} className="mt-3" />
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{lede}</p>
        <VerifiedBadge active={active} />
        <div className="mt-10">{children}</div>
        {active ? <RelatedTools active={active} /> : null}
      </PageWrap>
    </SiteShell>
  );
}
