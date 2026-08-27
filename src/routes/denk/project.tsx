import { createFileRoute } from "@tanstack/react-router";
import { ProjectWorkspace } from "@/components/pm/workspace";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { useProject } from "@/lib/pm/use-project";

export const Route = createFileRoute("/denk/project")({
  head: () => ({ meta: [{ title: "Projectwerkplek — Damian Vink" }] }),
  component: ProjectPage,
});

function ProjectPage() {
  const { project, patch, setProject, reset, ready } = useProject();

  return (
    <SiteShell>
      <PageWrap wide>
        <Breadcrumb
          items={[
            { href: "/heb", label: "Wat ik heb" },
            { label: "Projectwerkplek" },
          ]}
        />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          Wat ik heb
        </p>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
          Project<span className="text-accent">werkplek.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Eén project, vijf fasen. Registers lopen mee tot decharge. Bedoeld voor
          de weekstart en het beslispunt, niet als lesboek.
        </p>
        <div className="mt-8">
          {ready ? (
            <ProjectWorkspace
              project={project}
              patch={patch}
              setProject={setProject}
              reset={reset}
            />
          ) : (
            <p className="text-sm text-muted">Laden…</p>
          )}
        </div>
      </PageWrap>
    </SiteShell>
  );
}
