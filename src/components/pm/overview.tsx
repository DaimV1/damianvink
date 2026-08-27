import { mondayOf, overlapsWeek } from "@/lib/pm/activity";
import {
  euro,
  nextAction,
  openCount,
  phaseChecks,
  riskScore,
  topRisks,
  type Project,
} from "@/lib/pm/model";
import { Card } from "@/components/pm/fields";
import { Button } from "@/components/ui/button";

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
}: {
  project: Project;
  onOpen: (tab: WorkspaceTab) => void;
}) {
  const checks = phaseChecks(project);
  const risks = topRisks(project.risks, 3);
  const issues = project.issues.filter((i) => i.status !== "dicht").slice(0, 5);
  const changes = project.changes.filter((c) => c.status !== "dicht").slice(0, 4);
  const weekStart = mondayOf(new Date());
  const weekWork = (project.activities ?? []).filter((a) => overlapsWeek(weekStart, a.start, a.end));

  return (
    <div className="grid gap-4">
      <Card title="Deze week">
        <p className="text-sm text-ink">{nextAction(project)}</p>
        <p className="mt-2 text-sm text-muted">
          {project.result || "Nog geen resultaat geformuleerd."} Harde constraint: {project.constraint}.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onOpen("fase")}>Naar fasewerk</Button>
          <Button size="sm" variant="secondary" onClick={() => onOpen("poort")}>Beslispunt</Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Fasecheck">
          <ul className="space-y-2 text-sm">
            {checks.map((c) => (
              <li key={c.id} className="flex items-start gap-2">
                <span className="font-mono text-xs text-accent">{c.done ? "ok" : "\u2014"}</span>
                <span className={c.done ? "text-muted" : "text-ink"}>{c.label}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Plan deze week">
          {weekWork.length === 0 ? (
            <p className="text-sm text-muted">Nog geen activiteiten in deze week. Zet ze onder Plan.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {weekWork.map((a) => (
                <li key={a.id}>
                  <span className="font-mono text-xs text-accent">{a.wbs || a.kind}</span> {a.name || "Naamloos"}
                  {a.owner ? <span className="text-muted"> \u00b7 {a.owner}</span> : null}
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="mt-3 text-sm text-accent hover:underline" onClick={() => onOpen("plan")}>
            Open plan
          </button>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Toprisico\u2019s">
          {risks.length === 0 ? <p className="text-sm text-muted">Geen open risico\u2019s.</p> : (
            <ul className="space-y-2 text-sm">
              {risks.map((r) => (
                <li key={r.id}>
                  <span className="font-mono text-xs text-accent">{riskScore(r)}</span> {r.event || r.source || "Naamloos"}
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="mt-3 text-sm text-accent hover:underline" onClick={() => onOpen("risicos")}>
            {openCount(project.risks)} open
          </button>
        </Card>
        <Card title="Issues">
          {issues.length === 0 ? <p className="text-sm text-muted">Geen open issues.</p> : (
            <ul className="space-y-2 text-sm">
              {issues.map((i) => (
                <li key={i.id}>
                  {i.title || "Naamloos"}
                  <span className="text-muted">{i.due ? ` \u00b7 ${i.due}` : ""}{i.owner ? ` \u00b7 ${i.owner}` : ""}</span>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="mt-3 text-sm text-accent hover:underline" onClick={() => onOpen("issues")}>
            {openCount(project.issues)} open
          </button>
        </Card>
        <Card title="Wijzigingen">
          {changes.length === 0 ? <p className="text-sm text-muted">Geen open wijzigingen.</p> : (
            <ul className="space-y-2 text-sm">
              {changes.map((c) => (
                <li key={c.id}>{c.title || "Naamloos"} \u00b7 {c.advice}</li>
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
        {project.endDate ? ` \u00b7 einde ${project.endDate}` : ""}
        {project.baselineFrozen ? ` \u00b7 baseline ${project.baselineEndDate || "bevroren"}` : " \u00b7 baseline nog open"}
      </p>
    </div>
  );
}
