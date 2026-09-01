import { GanttBoard } from "@/components/pm/gantt";
import { GENERATORS } from "@/lib/pm/fill-templates";
import { downloadMsProject } from "@/lib/pm/msproject";
import { TEMPLATES } from "@/lib/pm/templates";
import type { Project } from "@/lib/pm/model";
import { tx, useLocale } from "@/lib/i18n/locale";

export function TemplatesPanel({
  project,
  setProject,
}: {
  project: Project;
  setProject: (p: Project | ((prev: Project) => Project)) => void;
}) {
  const { locale } = useLocale();
  return (
    <div className="space-y-10">
      <GanttBoard project={project} setProject={setProject} />
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">Downloads</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            {tx(
              locale,
              "Bestanden worden gevuld met wat nu in de werkplek staat: naam, scope, risico’s, issues en de Gantt-regels.",
              "Files are filled with what's currently in the workspace: name, scope, risks, issues and the Gantt rows.",
            )}
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
                  {String(i + 1).padStart(2, "0")} · {tx(locale, t.phase, t.phaseEn)}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">
                  {tx(locale, t.title, t.titleEn)}
                </h3>
                <p className="mt-1 text-sm text-muted">{tx(locale, t.body, t.bodyEn)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (t.id === "msproject") downloadMsProject(project);
                  else GENERATORS[t.id](project);
                }}
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-accent bg-accent px-4 text-sm text-accent-fg"
              >
                {tx(locale, "Download", "Download")} {t.kind}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
