import { GanttBoard } from "@/components/pm/gantt";
import { GENERATORS } from "@/lib/pm/fill-templates";
import { TEMPLATES } from "@/lib/pm/templates";
import type { Project } from "@/lib/pm/model";

export function TemplatesPanel({
  project,
  setProject,
}: {
  project: Project;
  setProject: (p: Project | ((prev: Project) => Project)) => void;
}) {
  return (
    <div className="space-y-10">
      <GanttBoard project={project} setProject={setProject} />
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">Downloads</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            Bestanden worden gevuld met wat nu in de werkplek staat: naam, scope, risico’s, issues en de Gantt-regels.
          </p>
        </div>
        <div className="grid gap-3">
          {TEMPLATES.map((t, i) => (
            <article
              key={t.id}
              className="flex flex-col gap-3 rounded-lg border border-line bg-elevated p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-mono text-xs text-accent">
                  {String(i + 1).padStart(2, "0")} · {t.phase}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">{t.title}</h3>
                <p className="mt-1 text-sm text-muted">{t.body}</p>
              </div>
              <button
                type="button"
                onClick={() => GENERATORS[t.id](project)}
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-accent bg-accent px-4 text-sm text-accent-fg"
              >
                Download {t.kind}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
