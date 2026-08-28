import { createFileRoute } from "@tanstack/react-router";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import { tx, useLocale } from "@/lib/i18n/locale";
import { ARTICLES } from "@/lib/articles";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/blog/")({
  head: () =>
    pageHead({
      title: "Blog — Damian Vink",
      description:
        "Artikelen over werktuigbouwkunde, ontwerp en machinebouw. Alleen stukken die er daadwerkelijk zijn.",
      path: "/blog",
    }),
  component: Blog,
});

function Blog() {
  const { locale } = useLocale();
  return (
    <SiteShell>
      <PageWrap>
        <Breadcrumb items={[{ label: "Blog" }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          {tx(locale, "Artikelen", "Articles")}
        </p>
        <DisplayTitle text="Blog." className="mt-3" />
        <p className="mt-5 text-lg leading-relaxed text-muted">
          {tx(locale, "Stukken over werktuigbouwkunde en ontwerp.", "Pieces on mechanical engineering and design.")}
        </p>
        <div className="mt-10 space-y-3">
          {ARTICLES.map((post, i) => (
            <a
              key={post.slug}
              href={post.href}
              className="block rounded-lg border border-line bg-elevated p-5 transition-colors hover:border-line-strong"
            >
              <p className="font-mono text-xs text-accent">
                {String(i + 1).padStart(2, "0")} · {post.dateLabel}
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold">{post.title}</h2>
              <p className="mt-1 text-sm text-muted">{post.description}</p>
            </a>
          ))}
        </div>
      </PageWrap>
    </SiteShell>
  );
}
