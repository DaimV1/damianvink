import { createFileRoute, Link } from "@tanstack/react-router";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";

export const Route = createFileRoute("/doe/")({
  head: () => ({ meta: [{ title: "Wat ik doe — Damian Vink" }] }),
  component: Doe,
});

function Doe() {
  return (
    <SiteShell>
      <PageWrap wide>
        <Breadcrumb items={[{ label: "Wat ik doe" }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          Wat ik doe
        </p>
        <DisplayTitle before="Wat ik" last="doe." className="mt-3" />
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
          Marathonvoorbereiding en projecten.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            to="/doe/marathon"
            className="group relative overflow-hidden rounded-xl border border-line"
          >
            <img
              src="/img/marathon.webp"
              alt="Hardloper op een verlichte weg in het donker"
              className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-paper/90 to-transparent px-5 py-5 font-display text-2xl font-semibold tracking-tight">
              Mara<span className="text-accent">thon.</span>
            </span>
          </Link>
          <Link
            to="/doe/projecten"
            className="group relative overflow-hidden rounded-xl border border-line"
          >
            <img
              src="/img/projecten.webp"
              alt="Metaalwerkplaats met freesbank en werkstukken"
              className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-paper/90 to-transparent px-5 py-5 font-display text-2xl font-semibold tracking-tight">
              Projec<span className="text-accent">ten.</span>
            </span>
          </Link>
        </div>
      </PageWrap>
    </SiteShell>
  );
}
