import type { Activity } from "@/lib/pm/activity";

export const PHASES = [
  { id: "orientatie", n: "01", label: "Oriëntatie", question: "Moet dit een project zijn?", result: "Kader en werkvorm" },
  { id: "voorbereiding", n: "02", label: "Voorbereiding", question: "Mag het van start?", result: "Projectopdracht voor go/no-go" },
  { id: "definitie", n: "03", label: "Definitie", question: "Hoe gaan we het doen?", result: "Plan en baseline" },
  { id: "uitvoering", n: "04", label: "Uitvoering", question: "Blijven we binnen de afspraak?", result: "Stand, issues en wijzigingen" },
  { id: "afsluiting", n: "05", label: "Afsluiting", question: "Kunnen we decharge geven?", result: "Overdracht en evaluatie" },
] as const;

export type PhaseId = (typeof PHASES)[number]["id"];
export type Rag = "groen" | "oranje" | "rood";
export type Constraint = "tijd" | "geld" | "scope" | "kwaliteit";
export type Workform = "project" | "programma" | "lijn";
export type DecisionKind = "go" | "bijsturen" | "stop";
export type ItemStatus = "open" | "bezig" | "dicht";
export type ChangeAdvice = "go" | "bijsturen" | "afwijzen";
export type RiskResponse = "vermijden" | "verkleinen" | "overdragen" | "accepteren";
export type Score = 1 | 2 | 3 | 4 | 5;

export type Stakeholder = { id: string; name: string; influence: Score; interest: Score; note: string };
export type Risk = {
  id: string; source: string; event: string; effect: string; probability: Score; impact: Score;
  euro: number | null; owner: string; measure: string; response: RiskResponse; status: ItemStatus;
};
export type Issue = { id: string; title: string; owner: string; due: string; status: ItemStatus; note: string };
export type Change = {
  id: string; title: string; scope: string; days: number | null; money: number | null;
  riskNote: string; advice: ChangeAdvice; status: ItemStatus;
};
export type Estimate = { id: string; name: string; o: number | null; m: number | null; p: number | null };
export type Decision = {
  id: string; from: PhaseId; advice: DecisionKind; decision: DecisionKind; who: string; date: string; notes: string;
};

export type Project = {
  id: string;
  updatedAt: string;
  name: string; sponsor: string; manager: string; phase: PhaseId; rag: Rag; startDate: string; endDate: string;
  budget: number | null; spent: number | null; percentDone: number | null;
  result: string; outcome: string; goal: string; constraint: Constraint; workform: Workform;
  why: string; authority: string; scopeIn: string; scopeOut: string;
  riskReserve: number | null; contingency: number | null;
  baselineFrozen: boolean; baselineEndDate: string; baselineBudget: number | null;
  estimates: Estimate[]; activities: Activity[]; stakeholders: Stakeholder[]; risks: Risk[]; issues: Issue[];
  changes: Change[]; decisions: Decision[]; accepted: boolean; handover: string; lessons: string;
};

export type Workspace = {
  version: 2;
  activeId: string;
  projects: Record<string, Project>;
};

export const STORAGE_KEY_V1 = "pm-project-v1";
export const STORAGE_KEY = "pm-workspace-v2";

export function uid() { return Math.random().toString(36).slice(2, 10); }
export function isoNow() { return new Date().toISOString(); }

export function emptyProject(partial: Partial<Project> = {}): Project {
  return {
    id: uid(),
    updatedAt: isoNow(),
    name: "", sponsor: "", manager: "", phase: "orientatie", rag: "groen", startDate: "", endDate: "",
    budget: null, spent: null, percentDone: null, result: "", outcome: "", goal: "",
    constraint: "tijd", workform: "project", why: "", authority: "", scopeIn: "", scopeOut: "",
    riskReserve: null, contingency: null, baselineFrozen: false, baselineEndDate: "", baselineBudget: null,
    estimates: [], activities: [], stakeholders: [], risks: [], issues: [], changes: [], decisions: [],
    accepted: false, handover: "", lessons: "",
    ...partial,
  };
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function parseProject(raw: unknown): Project {
  if (!raw || typeof raw !== "object") return emptyProject();
  const given = raw as Partial<Project>;
  const next = emptyProject({
    ...given,
    id: given.id && String(given.id) ? String(given.id) : uid(),
    activities: asArray(given.activities),
    estimates: asArray(given.estimates),
    stakeholders: asArray(given.stakeholders),
    risks: asArray(given.risks),
    issues: asArray(given.issues),
    changes: asArray(given.changes),
    decisions: asArray(given.decisions),
  });
  if (!next.startDate) next.startDate = "";
  if (!PHASES.some((p) => p.id === next.phase)) next.phase = "orientatie";
  return next;
}

export function nextPhase(id: PhaseId): PhaseId | null {
  const i = PHASES.findIndex((p) => p.id === id);
  return i >= 0 && i < PHASES.length - 1 ? PHASES[i + 1].id : null;
}

export function stakeholderAction(s: Stakeholder) {
  const hiInf = s.influence >= 3;
  const hiInt = s.interest >= 3;
  if (hiInf && hiInt) return "Actief managen";
  if (hiInf && !hiInt) return "Tevreden houden";
  if (!hiInf && hiInt) return "Informeren";
  return "Monitoren";
}

export function riskScore(r: Risk) { return r.probability * r.impact; }
export function riskBand(score: number) {
  if (score >= 16) return "kritiek" as const;
  if (score >= 10) return "hoog" as const;
  if (score >= 5) return "midden" as const;
  return "laag" as const;
}
export function riskEmv(r: Risk) { return r.euro == null ? null : (r.probability / 5) * r.euro; }

export function pert(est: Estimate) {
  if (est.o == null || est.m == null || est.p == null) return null;
  return { mu: (est.o + 4 * est.m + est.p) / 6, sigma: (est.p - est.o) / 6 };
}

export function openCount<T extends { status: ItemStatus }>(items: T[]) {
  return items.filter((x) => x.status !== "dicht").length;
}

export function topRisks(risks: Risk[], n = 5) {
  return [...risks].filter((r) => r.status !== "dicht").sort((a, b) => riskScore(b) - riskScore(a)).slice(0, n);
}

export function inferredRag(project: Project): Rag {
  const critical = project.risks.some((r) => r.status !== "dicht" && riskScore(r) >= 16);
  const over = project.budget != null && project.spent != null && project.spent > project.budget;
  const late = Boolean(project.endDate && project.baselineEndDate && project.endDate > project.baselineEndDate);
  const hot = project.risks.some((r) => r.status !== "dicht" && riskScore(r) >= 10);
  if (critical || over) return "rood";
  if (openCount(project.issues) >= 3 || late || hot) return "oranje";
  return "groen";
}

export function euro(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "\u2014";
  return n.toLocaleString("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

export function emptyWorkspace(): Workspace {
  const project = emptyProject();
  return { version: 2, activeId: project.id, projects: { [project.id]: project } };
}

export function parseWorkspace(raw: unknown): Workspace {
  if (!raw || typeof raw !== "object") return emptyWorkspace();
  const given = raw as Partial<Workspace> & { name?: string; phase?: PhaseId };
  if (given.version === 2 && given.projects && typeof given.projects === "object") {
    const projects: Record<string, Project> = {};
    for (const [id, value] of Object.entries(given.projects)) {
      const project = parseProject({ ...(value as object), id });
      projects[project.id] = project;
    }
    const ids = Object.keys(projects);
    if (!ids.length) return emptyWorkspace();
    const activeId = given.activeId && projects[given.activeId] ? given.activeId : ids[0];
    return { version: 2, activeId, projects };
  }
  const project = parseProject(raw);
  return { version: 2, activeId: project.id, projects: { [project.id]: project } };
}

export function itemRef(prefix: string, items: { id: string }[], id: string) {
  const i = items.findIndex((x) => x.id === id);
  return `${prefix}-${String((i < 0 ? items.length : i) + 1).padStart(2, "0")}`;
}

export function phaseChecks(project: Project) {
  const hasPlan = project.activities.length > 0 || project.estimates.some((e) => pert(e));
  const map: Record<PhaseId, { id: string; label: string; done: boolean }[]> = {
    orientatie: [
      { id: "result", label: "Resultaat ingevuld", done: Boolean(project.result.trim()) },
      { id: "outcome", label: "Uitkomst ingevuld", done: Boolean(project.outcome.trim()) },
      { id: "goal", label: "Doel ingevuld", done: Boolean(project.goal.trim()) },
      { id: "form", label: "Werkvorm gekozen", done: Boolean(project.workform) },
    ],
    voorbereiding: [
      { id: "why", label: "Aanleiding scherp", done: Boolean(project.why.trim()) },
      { id: "authority", label: "Bevoegdheid PM", done: Boolean(project.authority.trim()) },
      { id: "people", label: "Minstens één belanghebbende", done: project.stakeholders.length > 0 },
      { id: "risk", label: "Eerste risico benoemd", done: project.risks.length > 0 },
    ],
    definitie: [
      { id: "scope", label: "Scope in en uit", done: Boolean(project.scopeIn.trim() && project.scopeOut.trim()) },
      { id: "plan", label: "Schatting of planregel", done: hasPlan },
      { id: "money", label: "Budget en einddatum", done: project.budget != null && Boolean(project.endDate) },
      { id: "base", label: "Baseline bevroren", done: project.baselineFrozen },
    ],
    uitvoering: [
      { id: "pct", label: "% klaar bijgewerkt", done: project.percentDone != null },
      { id: "spent", label: "Besteed ingevuld", done: project.spent != null },
      { id: "issues", label: "Open issues hebben een eigenaar", done: project.issues.filter((i) => i.status !== "dicht").every((i) => i.owner.trim()) },
    ],
    afsluiting: [
      { id: "accepted", label: "Resultaat geaccepteerd", done: project.accepted },
      { id: "handover", label: "Overdracht beschreven", done: Boolean(project.handover.trim()) },
      { id: "lessons", label: "Les vastgelegd", done: Boolean(project.lessons.trim()) },
      { id: "risks", label: "Geen open risico’s of benoemd in overdracht", done: openCount(project.risks) === 0 || Boolean(project.handover.trim()) },
    ],
  };
  return map[project.phase];
}

export function nextAction(project: Project) {
  if (!project.name.trim()) return "Geef het project een naam.";
  if (!project.sponsor.trim()) return "Vul de opdrachtgever in.";
  const missing = phaseChecks(project).find((c) => !c.done);
  if (missing) return missing.label;
  if (project.phase !== "afsluiting") return "Klaar voor het beslispunt.";
  return "Vraag decharge.";
}

export function gateBlockers(project: Project) {
  const blockers: string[] = [];
  if (!project.name.trim()) blockers.push("Nog geen projectnaam.");
  if (!project.sponsor.trim()) blockers.push("Geen opdrachtgever.");
  if (project.phase === "definitie" && !project.baselineFrozen && !project.endDate && project.budget == null) {
    blockers.push("Geen einddatum of budget om te bevriezen.");
  }
  const orphanRisks = project.risks.filter((r) => r.status !== "dicht" && riskScore(r) >= 16 && !r.owner.trim());
  if (orphanRisks.length) blockers.push("Kritiek risico zonder eigenaar.");
  if (project.phase === "afsluiting" && !project.accepted) blockers.push("Resultaat is nog niet geaccepteerd.");
  return blockers;
}

export function sampleProject(): Project {
  const start = new Date();
  const iso = (offset: number) => {
    const x = new Date(start);
    x.setDate(x.getDate() + offset);
    return x.toISOString().slice(0, 10);
  };
  return emptyProject({
    name: "Montagelijn module B",
    sponsor: "Plantmanager",
    manager: "Damian Vink",
    phase: "definitie",
    rag: "oranje",
    startDate: iso(0),
    endDate: iso(70),
    budget: 85000,
    spent: 12000,
    percentDone: 18,
    result: "Werkende montagemodule B, inclusief afnameprotocol.",
    outcome: "Lijn kan productfamilie B zonder ombouwen draaien.",
    goal: "Doorlooptijd per stuk onder 90 seconden.",
    constraint: "tijd",
    workform: "project",
    why: "Huidige ombouw kost een ploeg per week.",
    authority: "PM mag tot €5.000 zelf beslissen.",
    scopeIn: "Frame, geleiding, pneumatiek, afname.",
    scopeOut: "Gebouw, IT-koppeling MES.",
    baselineFrozen: false,
    stakeholders: [
      { id: uid(), name: "Plantmanager", influence: 5, interest: 5, note: "Business case" },
      { id: uid(), name: "Onderhoud", influence: 3, interest: 4, note: "Overdracht" },
    ],
    risks: [
      { id: uid(), source: "Leverancier geleiding", event: "Levering +4 weken", effect: "Einddatum schuift", probability: 3, impact: 4, euro: 12000, owner: "PM", measure: "Tweede bron vragen", response: "verkleinen", status: "open" },
    ],
    issues: [
      { id: uid(), title: "Layout nog niet bevroren", owner: "Engineering", due: iso(10), status: "open", note: "Wacht op plant" },
    ],
    changes: [],
    activities: [
      { id: uid(), wbs: "1", name: "Kick-off", kind: "mijlpaal", owner: "PM", start: iso(0), end: iso(0), pct: 100 },
      { id: uid(), wbs: "1.1", name: "Scope vastleggen", kind: "activiteit", owner: "PM", start: iso(1), end: iso(10), pct: 40 },
      { id: uid(), wbs: "2", name: "Baseline", kind: "mijlpaal", owner: "Plantmanager", start: iso(21), end: iso(21), pct: 0 },
    ],
  });
}

export function gateBrief(project: Project) {
  const phase = PHASES.find((p) => p.id === project.phase);
  const risks = topRisks(project.risks);
  const issues = project.issues.filter((i) => i.status !== "dicht");
  const changes = project.changes.filter((c) => c.status !== "dicht");
  return [
    `Faseovergang \u2014 ${project.name || "Naamloos project"}`,
    `Fase: ${phase?.label ?? project.phase}`,
    `Opdrachtgever: ${project.sponsor || "\u2014"}`,
    `Projectmanager: ${project.manager || "\u2014"}`,
    `Stand: ${project.rag.toUpperCase()} \u00b7 ${project.percentDone ?? "\u2014"}% klaar`,
    `Einddatum: ${project.endDate || "\u2014"} (baseline ${project.baselineEndDate || "nog niet bevroren"})`,
    `Budget: ${euro(project.spent)} / ${euro(project.budget)}`,
    "",
    "Toprisico's",
    ...(risks.length
      ? risks.map((r) => `- [${riskScore(r)}] ${r.event || r.source} → ${r.effect} (${r.owner || "geen eigenaar"})`)
      : ["- geen open risico's"]),
    "",
    "Open issues",
    ...(issues.length ? issues.map((i) => `- ${i.title} (${i.owner || "\u2014"}${i.due ? `, ${i.due}` : ""})`) : ["- geen"]),
    "",
    "Open wijzigingen",
    ...(changes.length
      ? changes.map((c) => `- ${c.title} \u00b7 advies ${c.advice}${c.days != null ? ` \u00b7 ${c.days} d` : ""}${c.money != null ? ` \u00b7 ${euro(c.money)}` : ""}`)
      : ["- geen"]),
    "",
    `Scope in: ${project.scopeIn || "\u2014"}`,
    `Scope uit: ${project.scopeOut || "\u2014"}`,
  ].join("\n");
}
