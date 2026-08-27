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
  name: string; sponsor: string; manager: string; phase: PhaseId; rag: Rag; startDate: string; endDate: string;
  budget: number | null; spent: number | null; percentDone: number | null;
  result: string; outcome: string; goal: string; constraint: Constraint; workform: Workform;
  why: string; authority: string; scopeIn: string; scopeOut: string;
  riskReserve: number | null; contingency: number | null;
  baselineFrozen: boolean; baselineEndDate: string; baselineBudget: number | null;
  estimates: Estimate[]; activities: Activity[]; stakeholders: Stakeholder[]; risks: Risk[]; issues: Issue[];
  changes: Change[]; decisions: Decision[]; accepted: boolean; handover: string; lessons: string;
};

export const STORAGE_KEY = "pm-project-v1";
export function uid() { return Math.random().toString(36).slice(2, 10); }

export function emptyProject(): Project {
  return {
    name: "", sponsor: "", manager: "", phase: "orientatie", rag: "groen", startDate: "", endDate: "",
    budget: null, spent: null, percentDone: null, result: "", outcome: "", goal: "",
    constraint: "tijd", workform: "project", why: "", authority: "", scopeIn: "", scopeOut: "",
    riskReserve: null, contingency: null, baselineFrozen: false, baselineEndDate: "", baselineBudget: null,
    estimates: [], activities: [], stakeholders: [], risks: [], issues: [], changes: [], decisions: [],
    accepted: false, handover: "", lessons: "",
  };
}

export function parseProject(raw: unknown): Project {
  if (!raw || typeof raw !== "object") return emptyProject();
  const next = { ...emptyProject(), ...(raw as Partial<Project>) };
  if (!Array.isArray(next.activities)) next.activities = [];
  if (!next.startDate) next.startDate = "";
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
