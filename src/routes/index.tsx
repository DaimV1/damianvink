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
            Project Engineer werktuigbouwkunde. Mechanisch ontwerp, naslag en een
            marathonlogboek.
          </p>
        </section>

        <section className="reveal reveal-delay-1 border-t border-line py-14 sm:py-16">
          <SectionTitle before="Wie ik" last="ben." />
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            Achtergrond in werktuigbouwkunde en machinebouw.
          </p>
          <p className="mt-5">
            <Link to="/over-mij" className="text-sm text-accent hover:underline">
              Meer over mij →
            </Link>
          </p>
        </section>

        <section className="reveal reveal-delay-2 border-t border-line py-14 sm:py-16">
          <SectionTitle before="Wat ik" last="doe." />
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            Marathonvoorbereiding en projecten.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Tile
              href="/doe/marathon"
              src="/img/marathon.webp"
              alt="Hardloper op een verlichte weg in het donker"
              titleBefore="Mara"
              titleLast="thon."
            />
            <Tile
              href="/doe/projecten"
              src="/img/projecten.webp"
              alt="Metaalwerkplaats met freesbank en werkstukken"
              titleBefore="Projec"
              titleLast="ten."
            />
          </div>
        </section>

        <section className="reveal reveal-delay-3 border-t border-line py-14 sm:py-16">
          <SectionTitle before="Wat ik" last="heb." />
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            Naslag tijdens ontwerp en een projectwerkplek tijdens de rit.
          </p>
          <div className="mt-8 grid gap-3">
            <KnowledgeRow
              num="01"
              title="Engineering toolkit"
              body="Passingen, spiebanen, lagerpassingen, seegerringgroef, bevestigers en CAD-bronnen."
              href="/denk/toolkit"
              link="Engineering toolkit"
              meta="Werktuigbouwkunde · Machinebouw"
            />
            <KnowledgeRow
              num="02"
              title="Projectwerkplek"
              body="Fasen, stakeholders, risico’s, issues en het beslispunt."
              href="/denk/project"
              link="Projectwerkplek"
              meta="Projectmanagement"
            />
          </div>
        </section>

        <section className="reveal reveal-delay-3 border-t border-line py-14 sm:py-16">
          <SectionTitle before="Wat ik" last="denk." />
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            Artikelen en later een podcast.
          </p>
          <div className="mt-8 grid gap-3">
            <KnowledgeRow
              num="01"
              title="Blog"
              body="Artikelen. Nog geen stukken gepubliceerd."
              href="/denk/blog"
              link="Blog"
              meta="Artikelen volgen."
            />
            <KnowledgeRow
              num="02"
              title="Podcast"
              body="Afleveringen. Nog geen episodes gepubliceerd."
              href="/denk/podcast"
              link="Podcast"
              meta="Afleveringen volgen."
            />
          </div>
        </section>

        <section className="border-t border-line py-14 sm:py-16">
          <SectionTitle before="Con" last="tact." />
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            Voor vragen over engineering, samenwerkingen of deze website: stuur
            een bericht via e-mail, LinkedIn, X of Instagram.
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

function Tile({
  href,
  src,
  alt,
  titleBefore,
  titleLast,
}: {
  href: string;
  src: string;
  alt: string;
  titleBefore: string;
  titleLast: string;
}) {
  return (
    <Link to={href} className="group relative block overflow-hidden rounded-xl border border-line">
      <img
        src={src}
        alt={alt}
        width={953}
        height={640}
        className="aspect-[3/2] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-paper/90 to-transparent px-5 py-5 font-display text-2xl font-semibold tracking-tight text-ink">
        {titleBefore}
        <span className="text-accent">{titleLast}</span>
      </span>
    </Link>
  );
}

function KnowledgeRow({
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
          <h3 className="font-display text-xl font-semibold tracking-tight">{title}</h3>
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
