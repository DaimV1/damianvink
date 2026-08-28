import { mondayOf, overlapsWeek } from "@/lib/pm/activity";
import {
  applyActivityProgress,
  baselineSlip,
  euro,
  inferredRag,
  nextAction,
  openCount,
  overdueIssues,
  phaseChecks,
  riskScore,
  topRisks,
  type Project,
} from "@/lib/pm/model";
import { Card, Field, NumInput, TextInput } from "@/components/pm/fields";
import { Button } from "@/components/ui/button";
import { tx, useLocale } from "@/lib/i18n/locale";

export type WorkspaceTab =
  | "overzicht"
  | "fase"
  | "plan"
  | "mensen"
  | "risicos"
  | "issues"
  | "wijzigingen"
  | "poort";

export function OverviewPanel({
  project,
  onOpen,
  patch,
  setProject,
}: {
  project: Project;
  onOpen: (tab: WorkspaceTab) => void;
  patch: (p: Partial<Project>) => void;
  setProject: (p: Project | ((prev: Project) => Project)) => void;
}) {
  const checks = phaseChecks(project);
  const risks = topRisks(project.risks, 3);
  const issues = project.issues.filter((i) => i.status !== "dicht").slice(0, 5);
  const late = overdueIssues(project);
  const changes = project.changes.filter((c) => c.status !== "dicht").slice(0, 4);
  const weekStart = mondayOf(new Date());
  const weekWork = (project.activities ?? []).filter((a) => overlapsWeek(weekStart, a.start, a.end));
  const suggested = inferredRag(project);
  const slip = baselineSlip(project);
  const { locale } = useLocale();

  return (
    <div className="grid gap-4">
      <Card title={tx(locale, "Deze week", "This week")}>
        <p className="text-sm text-ink">{nextAction(project, locale)}</p>
        <p className="mt-2 text-sm text-muted">
          {project.result || tx(locale, "Nog geen resultaat geformuleerd.", "No result formulated yet.")} {tx(locale, "Harde constraint:", "Hard constraint:")} {project.constraint}.
        </p>
        {slip.late || slip.over || suggested !== project.rag ? (
          <p className="mt-2 text-sm text-ink">
            {slip.late ? `Einddatum later dan baseline (${project.baselineEndDate}). ` : ""}
            {slip.over ? "Besteed boven budget. " : ""}
            {suggested !== project.rag ? `Registers wijzen op ${suggested}.` : ""}
          </p>
        ) : null}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Field label={tx(locale, "% klaar", "% complete")}>
            <NumInput min={0} max={100} value={project.percentDone} onValue={(percentDone) => patch({ percentDone })} />
          </Field>
          <Field label={tx(locale, "Besteed", "Spent")}>
            <NumInput value={project.spent} onValue={(spent) => patch({ spent })} />
          </Field>
          <Field label={tx(locale, "Einddatum", "End date")}>
            <TextInput type="date" value={project.endDate} onChange={(e) => patch({ endDate: e.target.value })} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onOpen("fase")}>{tx(locale, "Naar fasewerk", "To phase work")}</Button>
          <Button size="sm" variant="secondary" onClick={() => onOpen("poort")}>{tx(locale, "Beslispunt", "Gate")}</Button>
        </div>
      </Card>

      {late.length ? (
        <Card title={tx(locale, "Verlopen issues", "Overdue issues")}>
          <ul className="space-y-3">
            {late.map((issue) => (
              <li key={issue.id} className="flex flex-wrap items-end gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">{issue.title || tx(locale, "Naamloos", "Untitled")}</p>
                  <p className="font-mono text-xs text-accent">{issue.due}</p>
                </div>
                <TextInput
                  placeholder={tx(locale, "Eigenaar", "Owner")}
                  value={issue.owner}
                  onChange={(e) =>
                    setProject((p) => ({
                      ...p,
                      issues: p.issues.map((x) => (x.id === issue.id ? { ...x, owner: e.target.value } : x)),
                    }))
                  }
                  className="h-9 w-36"
                />
                <button
                  type="button"
                  className="text-sm text-accent hover:underline"
                  onClick={() =>
                    setProject((p) => ({
                      ...p,
                      issues: p.issues.map((x) => (x.id === issue.id ? { ...x, status: "dicht" as const } : x)),
                    }))
                  }
                >
                  {tx(locale, "sluiten", "close")}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={tx(locale, "Fasecheck", "Phase check")}>
          <ul className="space-y-2 text-sm">
            {checks.map((c) => (
              <li key={c.id} className="flex items-start gap-2">
                <span className="font-mono text-xs text-accent">{c.done ? "ok" : "\u2014"}</span>
                <span className={c.done ? "text-muted" : "text-ink"}>{locale === "en" ? c.labelEn : c.label}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title={tx(locale, "Plan deze week", "Plan this week")}>
          {weekWork.length === 0 ? (
            <p className="text-sm text-muted">{tx(locale, "Nog geen activiteiten in deze week. Zet ze onder Plan.", "No activities in this week yet. Put them under Plan.")}</p>
          ) : (
            <ul className="space-y-3">
              {weekWork.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="font-mono text-xs text-accent">{a.wbs || a.kind}</span> {a.name || "Naamloos"}
                    {a.owner ? <span className="text-muted"> · {a.owner}</span> : null}
                  </span>
                  <NumInput
                    min={0}
                    max={100}
                    value={a.pct}
                    onValue={(pct) => setProject((p) => applyActivityProgress(p, a.id, pct))}
                    className="h-9 w-20"
                    aria-label={`Voortgang ${a.name || "activiteit"}`}
                  />
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="mt-3 text-sm text-accent hover:underline" onClick={() => onOpen("plan")}>
            {tx(locale, "Open plan", "Open plan")}
          </button>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title={tx(locale, "Toprisico’s", "Top risks")}>
          {risks.length === 0 ? <p className="text-sm text-muted">{tx(locale, "Geen open risico’s.", "No open risks.")}</p> : (
            <ul className="space-y-2 text-sm">
              {risks.map((r) => (
                <li key={r.id}>
                  <span className="font-mono text-xs text-accent">{riskScore(r)}</span> {r.event || r.source || "Naamloos"}
                  {r.owner ? <span className="text-muted"> · {r.owner}</span> : null}
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="mt-3 text-sm text-accent hover:underline" onClick={() => onOpen("risicos")}>
            {openCount(project.risks)} open
          </button>
        </Card>
        <Card title="Issues">
          {issues.length === 0 ? <p className="text-sm text-muted">{tx(locale, "Geen open issues.", "No open issues.")}</p> : (
            <ul className="space-y-2 text-sm">
              {issues.map((i) => (
                <li key={i.id}>
                  {i.title || "Naamloos"}
                  <span className="text-muted">{i.due ? ` · ${i.due}` : ""}{i.owner ? ` · ${i.owner}` : ""}</span>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="mt-3 text-sm text-accent hover:underline" onClick={() => onOpen("issues")}>
            {openCount(project.issues)} open
          </button>
        </Card>
        <Card title={tx(locale, "Wijzigingen", "Changes")}>
          {changes.length === 0 ? <p className="text-sm text-muted">{tx(locale, "Geen open wijzigingen.", "No open changes.")}</p> : (
            <ul className="space-y-2 text-sm">
              {changes.map((c) => (
                <li key={c.id}>{c.title || "Naamloos"} · {c.advice}</li>
              ))}
            </ul>
          )}
          <button type="button" className="mt-3 text-sm text-accent hover:underline" onClick={() => onOpen("wijzigingen")}>
            {openCount(project.changes)} open
          </button>
        </Card>
      </div>

      <p className="text-sm text-muted">
        Budget {euro(project.spent)} / {euro(project.budget)}
        {project.endDate ? ` · einde ${project.endDate}` : ""}
        {project.baselineFrozen ? ` · baseline ${project.baselineEndDate || "bevroren"}` : " · baseline nog open"}
        {slip.budgetDelta ? ` · plan ${slip.budgetDelta > 0 ? "+" : ""}${euro(slip.budgetDelta)} t.o.v. baseline` : ""}
      </p>
    </div>
  );
}
