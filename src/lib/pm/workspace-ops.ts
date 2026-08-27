import { emptyProject, emptyWorkspace, type Project, type Workspace } from "./model.ts";

export function isUntitled(p: Project) {
  return !p.name.trim();
}

export function isBlankProject(p: Project) {
  return (
    isUntitled(p) &&
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
  if (!all.length) return { ...ws, ...emptyWorkspace() };
  if (all.length === 1) return ws;

  const untitled = all.filter(isUntitled);
  const samples = all.filter(isStockSample);
  const named = all.filter((p) => !isUntitled(p) && !isStockSample(p));

  const kept: Project[] = [...named];
  if (samples.length) kept.push(pickKept(samples, ws.activeId));
  if (untitled.length) kept.push(pickKept(untitled, ws.activeId));

  const projects: Record<string, Project> = {};
  for (const p of kept) projects[p.id] = p;
  const ids = Object.keys(projects);
  const activeId = projects[ws.activeId] ? ws.activeId : ids[0];
  return { ...ws, activeId, projects };
}

/** Named blank you can run. Drops leftover blank untitled projects. */
export function startNamedProject<T extends Workspace>(ws: T, name: string): T {
  const clean = pruneWorkspace(ws);
  const next = emptyProject({ name: name.trim() });
  const projects: Record<string, Project> = {};
  for (const p of Object.values(clean.projects)) {
    if (isBlankProject(p)) continue;
    projects[p.id] = p;
  }
  projects[next.id] = next;
  return { ...clean, activeId: next.id, projects };
}
