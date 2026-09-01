import { createFileRoute } from "@tanstack/react-router";
import { ProjectWorkspace } from "@/components/pm/workspace";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { tx, useLocale } from "@/lib/i18n/locale";
import { pageHead } from "@/lib/seo";
import { useProject } from "@/lib/pm/use-project";

export const Route = createFileRoute("/project")({
  head: () =>
    pageHead({
      title: "Projectwerkplek — Damian Vink",
      description:
        "Projectwerkplek voor machinebouw: maandag starten, fasevragen, beslispunt. Staat in deze browser; export bewaart een kopie.",
      path: "/project",
      noindex: true,
    }),
  component: ProjectPage,
});

function ProjectPage() {
  const store = useProject();
  const { locale } = useLocale();

  return (
    <SiteShell>
      <PageWrap wide>
        <Breadcrumb items={[{ label: "Project" }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          Project
        </p>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
          {tx(locale, "Project", "Project")}
          <span className="text-accent">{tx(locale, "werkplek.", " workspace.")}</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          {tx(
            locale,
            "Maandag: geef het project een naam, beantwoord de vragen van deze fase, kijk of het plan nog klopt. Een fase is de vraag die nu openstaat — kader, opdracht, plan en baseline, stand, decharge. Beslispunt is de enige officiële faseovergang. Staat in deze browser; export bewaart een kopie. Voorbeeld laadt een montagelijn in Oriëntatie.",
            "Monday: name the project, answer this phase’s questions, check the plan. A phase is the open question — frame, brief, plan and baseline, status, discharge. The gate is the only official phase change. Stored in this browser; export keeps a copy. Sample loads an assembly line in Framing.",
          )}
        </p>
        <div className="mt-8">
          {store.ready ? (
            <ProjectWorkspace
              project={store.project}
              list={store.list}
              activeId={store.activeId}
              patch={store.patch}
              setProject={store.setProject}
              reset={store.reset}
              createProject={store.createProject}
              switchProject={store.switchProject}
              loadSample={store.loadSample}
              exportJson={store.exportJson}
              importJson={store.importJson}
              backupStale={store.backupStale}
              lastExportAt={store.lastExportAt}
            />
          ) : (
            <p className="text-sm text-muted">{tx(locale, "Laden…", "Loading…")}</p>
          )}
        </div>
      </PageWrap>
    </SiteShell>
  );
}
