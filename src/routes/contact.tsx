import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import { SOCIALS } from "@/lib/socials";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [{ title: "Contact — Damian Vink" }],
  }),
  component: Contact,
});

function Contact() {
  return (
    <SiteShell>
      <PageWrap>
        <Breadcrumb items={[{ label: "Contact" }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Contact</p>
        <DisplayTitle before="Con" last="tact." className="mt-3" />
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          Voor vragen over engineering, samenwerkingen of deze website: stuur een bericht via LinkedIn, X of Instagram.
        </p>
        <div className="mt-10 grid gap-3">
          {SOCIALS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-16 items-center justify-between gap-3 rounded-lg border border-line bg-elevated px-4 py-3 transition-colors duration-150 hover:border-line-strong"
            >
              <span>
                <strong className="block text-sm font-medium text-ink">{item.label}</strong>
                <small className="text-sm text-muted">{item.value}</small>
              </span>
              <ArrowUpRight className="size-4 text-subtle" />
            </a>
          ))}
        </div>
      </PageWrap>
    </SiteShell>
  );
}
