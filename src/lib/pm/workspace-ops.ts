import { emptyWorkspace, type Project, type Workspace } from "./model.ts";

export function isBlankProject(p: Project) {
  return (
    !p.name.trim() &&
    !p.sponsor.trim() &&
    !p.manager.trim() &&
    !p.result.trim() &&
    !p.outcome.trim() &&
    !p.goal.trim() &&
    !p.why.trim() &&
    !p.scopeIn.trim() &&
    p.activities.length === 0 &&
    p.risks.length === 0 &&
    p.issues.length === 0 &&
    p.stakeholders.length === 0 &&
    p.changes.length === 0 &&
    p.estimates.length === 0 &&
    p.decisions.length === 0
  );
}

/** Ongewijzigd voorbeeld uit loadSample. */
export function isStockSample(p: Project) {
  return p.name === "Montagelijn module B" && p.sponsor === "Plantmanager" && p.manager === "Damian Vink";
}

function newest(a: Project, b: Project) {
  return b.updatedAt.localeCompare(a.updatedAt);
}

function pickKept(candidates: Project[], activeId: string) {
  const active = candidates.find((p) => p.id === activeId);
  if (active) return active;
  return [...candidates].sort(newest)[0];
}

export function pruneWorkspace<T extends Workspace>(ws: T): T {
  const all = Object.values(ws.projects);
  if (all.length <= 1) return ws;

  const filled = all.filter((p) => !isBlankProject(p) && !isStockSample(p));
  const blanks = all.filter(isBlankProject);
  const samples = all.filter(isStockSample);

  const kept: Project[] = [...filled];
  if (samples.length) kept.push(pickKept(samples, ws.activeId));
  if (blanks.length && !kept.some(isBlankProject)) kept.push(pickKept(blanks, ws.activeId));

  const projects: Record<string, Project> = {};
  for (const p of kept) projects[p.id] = p;
  const ids = Object.keys(projects);
  if (!ids.length) return { ...ws, ...emptyWorkspace() };

  const activeId = projects[ws.activeId] ? ws.activeId : ids[0];
  return { ...ws, activeId, projects };
}
