import { createFileRoute } from "@tanstack/react-router";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import { buttonVariants } from "@/components/ui/button";
import { tx, useLocale } from "@/lib/i18n/locale";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/over-mij")({
  head: () =>
    pageHead({
      title: "Over — Damian Vink",
      description:
        "Damian Vink, Project Engineer bij Protakt. Achtergrond in werktuigbouwkunde en machinebouw. Loopbaan, opleiding Hogeschool Rotterdam en CV.",
      path: "/over-mij",
      ogType: "profile",
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
  const { locale } = useLocale();
  return (
    <SiteShell>
      <PageWrap>
        <Breadcrumb items={[{ label: tx(locale, "Over", "About") }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          {tx(locale, "Over", "About")}
        </p>
        <DisplayTitle
          text={tx(locale, "Over mij.", "About me.")}
          accent={tx(locale, "mij.", "me.")}
          className="mt-3"
        />
        <div className="mt-8 space-y-4 text-lg leading-relaxed text-muted">
          <p className="text-ink">
            {tx(
              locale,
              "Ik ben Damian Vink, Project Engineer met een achtergrond in werktuigbouwkunde en machinebouw.",
              "I am Damian Vink, a project engineer with a background in mechanical engineering and machine building.",
            )}
          </p>
          <p>
            {tx(
              locale,
              "Ik houd ervan om technische vraagstukken te vertalen naar praktische, goed doordachte oplossingen.",
              "I like turning technical problems into practical, well-considered solutions.",
            )}
          </p>
          <p>
            {tx(
              locale,
              "In mijn werk combineer ik technisch ontwerp met projectverantwoordelijkheid. Daarbij ben ik graag betrokken bij het hele proces: van het eerste idee en ontwerp tot de technische uitwerking en realisatie.",
              "I combine mechanical design with project ownership, from the first idea through detailing and realisation.",
            )}
          </p>
          <p>
            {tx(
              locale,
              "Op deze site staan een engineering toolkit voor machinebouw (passingen, spiebanen, CAD-bronnen) en een trainingslogboek voor de EDP Porto Marathon op 8 november 2026.",
              "This site has an engineering toolkit for machine building (fits, keyways, CAD libraries) and a training log for the EDP Porto Marathon on 8 November 2026.",
            )}
          </p>
        </div>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            {tx(locale, "Loopbaan", "Career")}
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
                  {tx(
                    locale,
                    item.kind,
                    item.kind === "Werk"
                      ? "Work"
                      : item.kind === "Opleiding"
                        ? "Education"
                        : "Work",
                  )}
                </p>
                <h3 className="mt-1 font-medium text-ink">
                  {locale === "en" && item.title === "Afstudeerstagiair"
                    ? "Graduation intern"
                    : locale === "en" && item.title === "Stagiair"
                      ? "Intern"
                      : item.title}
                </h3>
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
            {tx(
              locale,
              "Overzicht van opleiding, werkervaring en technische achtergrond.",
              "Education, work experience and technical background.",
            )}
          </p>
          <a
            href="/cv.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "secondary" }), "mt-5")}
          >
            {tx(locale, "Bekijk CV (PDF)", "View CV (PDF)")}
          </a>
        </section>
      </PageWrap>
    </SiteShell>
  );
}
