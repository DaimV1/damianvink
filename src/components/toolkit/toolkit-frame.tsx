import type { ReactNode } from "react";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { RelatedTools } from "@/components/toolkit/related-tools";
import { Breadcrumb, ToolSwitcher } from "@/components/toolkit/tool-switcher";
import type { ToolId } from "@/lib/toolkit/tools";

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
        <Breadcrumb items={crumbs} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          {eyebrow}
        </p>
        <DisplayTitle text={title} accent={accent} className="mt-3" />
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{lede}</p>
        <div className="mt-10">{children}</div>
        {active ? <RelatedTools active={active} /> : null}
      </PageWrap>
    </SiteShell>
  );
}
