import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { DisplayTitle, SectionTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { DEFAULT_DESCRIPTION, pageHead } from "@/lib/seo";
import { SOCIALS } from "@/lib/socials";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "Damian Vink | Project Engineer werktuigbouwkunde & machinebouw",
      description: DEFAULT_DESCRIPTION,
      path: "/",
    }),
  component: Home,
});

function Home() {
  return (
    <SiteShell>
      <PageWrap wide>
        <section className="reveal pb-16 pt-6 sm:pb-24 sm:pt-10">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
            Project Engineer · Werktuigbouwkunde
          </p>
          <DisplayTitle before="Damian" last="Vink." className="mt-4" />
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Ontwerp en projecten in machinebouw.
          </p>
        </section>

        <section className="reveal reveal-delay-1 border-t border-line py-14 sm:py-16">
          <div className="grid gap-3">
            <Door
              num="01"
              title="Toolkit"
              body="Eenheden, passingen, spiebanen, lagerpassingen, seegerringgroef, bevestigingsmateriaal en CAD-bronnen."
              href="/toolkit"
              link="Toolkit"
              meta="Werktuigbouwkunde · Machinebouw"
            />
            <Door
              num="02"
              title="Project"
              body="Fasen, stakeholders, risico’s, issues en het beslispunt."
              href="/project"
              link="Project"
              meta="Projectmanagement"
            />
            <Door
              num="03"
              title="Marathon"
              body="Trainingslogboek EDP Porto Marathon 2026."
              href="/marathon"
              link="Marathon"
              meta="Logboek"
            />
          </div>
        </section>

        <section className="border-t border-line py-14 sm:py-16">
          <SectionTitle before="Con" last="tact." />
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            Vragen over engineering of samenwerking: e-mail of LinkedIn.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {SOCIALS.map((item) => (
              <ContactCard key={item.href} href={item.href} label={item.label} value={item.value} />
            ))}
          </div>
        </section>
      </PageWrap>
    </SiteShell>
  );
}

function Door({
  num,
  title,
  body,
  href,
  link,
  meta,
}: {
  num: string;
  title: string;
  body: string;
  href: string;
  link: string;
  meta: string;
}) {
  return (
    <article className="rounded-lg border border-line bg-elevated p-5">
      <div className="flex gap-4">
        <span className="font-mono text-sm text-accent">{num}</span>
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
        </div>
      </div>
      <Link to={href} className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4 text-sm">
        <span>
          <strong className="font-medium text-ink">{link}</strong>
          <span className="ml-2 text-muted">{meta}</span>
        </span>
        <span aria-hidden="true" className="text-accent">
          →
        </span>
      </Link>
    </article>
  );
}

function ContactCard({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: string;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex min-h-16 items-center justify-between gap-3 rounded-lg border border-line bg-elevated px-4 py-3 transition-colors duration-150 hover:border-line-strong"
    >
      <span>
        <strong className="block text-sm font-medium text-ink">{label}</strong>
        <small className="text-sm text-muted">{value}</small>
      </span>
      <ArrowUpRight className="size-4 text-subtle" />
    </a>
  );
}
