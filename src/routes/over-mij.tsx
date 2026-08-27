import { createFileRoute } from "@tanstack/react-router";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/over-mij")({
  head: () => ({
    meta: [{ title: "Wie ik ben — Damian Vink" }],
  }),
  component: OverMij,
});

const LOOPBAAN = [
  {
    when: "juni 2026 – heden",
    kind: "Werk",
    title: "Project Engineer",
    org: "Protakt",
    now: true,
  },
  {
    when: "juni 2023 – juni 2026",
    kind: "Werk",
    title: "Mechanical Engineer, junior → medior",
    org: "Protakt",
  },
  {
    when: "augustus 2022 – juni 2023",
    kind: "Werk",
    title: "Calculator",
    org: "Bosman van Zaal",
  },
  {
    when: "september 2022",
    kind: "Opleiding",
    title: "HBO Bachelor Werktuigbouwkunde",
    org: "Hogeschool Rotterdam",
  },
  {
    when: "juli 2022 – september 2022",
    kind: "Werk",
    title: "Afstudeerstagiair",
    org: "Bosman van Zaal",
  },
  {
    when: "september 2020 – februari 2021",
    kind: "Werk",
    title: "Stagiair",
    org: "Bosman van Zaal",
  },
];

function OverMij() {
  return (
    <SiteShell>
      <PageWrap>
        <Breadcrumb items={[{ label: "Wie ik ben" }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          Wie ik ben
        </p>
        <DisplayTitle before="Wie ik" last="ben." className="mt-3" />
        <div className="mt-8 space-y-4 text-lg leading-relaxed text-muted">
          <p className="text-ink">
            Ik ben Damian Vink, Project Engineer met een achtergrond in
            werktuigbouwkunde en machinebouw.
          </p>
          <p>
            Ik houd ervan om technische vraagstukken te vertalen naar praktische,
            goed doordachte oplossingen.
          </p>
          <p>
            In mijn werk combineer ik technisch ontwerp met
            projectverantwoordelijkheid. Daarbij ben ik graag betrokken bij het
            hele proces: van het eerste idee en ontwerp tot de technische
            uitwerking en realisatie.
          </p>
          <p>
            Naast mijn werk gebruik ik deze website om wat ik denk en onderwerpen
            te verzamelen — onder meer een engineering toolkit en een persoonlijk
            marathonlogboek.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Loopbaan
          </h2>
          <ol className="mt-6 space-y-0">
            {LOOPBAAN.map((item) => (
              <li
                key={item.when + item.title}
                className="relative border-l border-line py-4 pl-6"
              >
                <span
                  className={
                    item.now
                      ? "absolute -left-1.5 top-6 size-3 rounded-full bg-accent"
                      : "absolute -left-1 top-6 size-2 rounded-full bg-subtle"
                  }
                />
                <p className="font-mono text-xs text-muted">
                  {item.when}
                  <span className="mx-2 text-subtle">·</span>
                  {item.kind}
                </p>
                <h3 className="mt-1 font-medium text-ink">{item.title}</h3>
                <p className="text-sm text-muted">{item.org}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 rounded-xl border border-line bg-elevated p-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Curriculum vitae
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Overzicht van opleiding, werkervaring en technische achtergrond.
          </p>
          <a href="/cv.pdf" download className={cn(buttonVariants({ variant: "secondary" }), "mt-5")}>
            Download CV (PDF)
          </a>
        </section>
      </PageWrap>
    </SiteShell>
  );
}
