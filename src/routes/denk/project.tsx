import { createFileRoute } from "@tanstack/react-router";
import { ProjectWorkspace } from "@/components/pm/workspace";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { pageHead } from "@/lib/seo";
import { useProject } from "@/lib/pm/use-project";

export const Route = createFileRoute("/denk/project")({
  head: () =>
    pageHead({
      title: "Projectwerkplek — Damian Vink",
      description:
        "Persoonlijke projectwerkplek: fasen, stakeholders, risico's en het beslispunt. Bedoeld voor de weekstart, niet als lesboek.",
      path: "/denk/project",
      noindex: true,
    }),
  component: ProjectPage,
});

function ProjectPage() {
  const store = useProject();

  return (
    <SiteShell>
      <PageWrap wide>
        <Breadcrumb items={[{ label: "Werkplek" }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          Werkplek
        </p>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
          Project<span className="text-accent">werkplek.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Eén scherm voor je weekstart en het beslispunt. Vijf fasen, registers
          tot decharge. Geen lesboek.
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
            <p className="text-sm text-muted">Laden…</p>
          )}
        </div>
      </PageWrap>
    </SiteShell>
  );
}
