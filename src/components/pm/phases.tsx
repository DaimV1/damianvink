import { useMemo } from "react";
import { PhaseIntro, patchList } from "@/components/pm/bits";
import { Area, Card, Field, NumInput, Select, TextInput } from "@/components/pm/fields";
import { Button } from "@/components/ui/button";
import { euro, pert, uid, type Estimate, type Project } from "@/lib/pm/model";

export function PhasePanel({
  project, patch, setProject,
}: {
  project: Project;
  patch: (p: Partial<Project>) => void;
  setProject: (p: Project | ((prev: Project) => Project)) => void;
}) {
  if (project.phase === "orientatie") return <Orientatie project={project} patch={patch} />;
  if (project.phase === "voorbereiding") return <Voorbereiding project={project} patch={patch} />;
  if (project.phase === "definitie") return <Definitie project={project} patch={patch} setProject={setProject} />;
  if (project.phase === "uitvoering") return <Uitvoering project={project} patch={patch} />;
  return <Afsluiting project={project} patch={patch} />;
}

function Orientatie({ project, patch }: { project: Project; patch: (p: Partial<Project>) => void }) {
  return (
    <div className="grid gap-4">
      <PhaseIntro title="Oriëntatie" body="Bepaal of dit een project is, en wat resultaat, uitkomst en doel van elkaar zijn." />
      <Card title="Kader">
        <div className="grid gap-4">
          <Field label="Projectresultaat" hint="Wat wordt opgeleverd?"><Area value={project.result} onChange={(e) => patch({ result: e.target.value })} /></Field>
          <Field label="Uitkomst" hint="Welke verandering maakt dat resultaat mogelijk?"><Area value={project.outcome} onChange={(e) => patch({ outcome: e.target.value })} /></Field>
          <Field label="Doel" hint="Welk effect wil de opdrachtgever daarmee?"><Area value={project.goal} onChange={(e) => patch({ goal: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Harde constraint">
              <Select value={project.constraint} onChange={(e) => patch({ constraint: e.target.value as Project["constraint"] })}>
                <option value="tijd">Tijd</option><option value="geld">Geld</option><option value="scope">Scope</option><option value="kwaliteit">Kwaliteit</option>
              </Select>
            </Field>
            <Field label="Werkvorm">
              <Select value={project.workform} onChange={(e) => patch({ workform: e.target.value as Project["workform"] })}>
                <option value="project">Project</option><option value="programma">Programma</option><option value="lijn">Lijn / BAU</option>
              </Select>
            </Field>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Voorbereiding({ project, patch }: { project: Project; patch: (p: Partial<Project>) => void }) {
  return (
    <div className="grid gap-4">
      <PhaseIntro title="Voorbereiding" body="Maak de opdracht scherp genoeg voor de eerste go/no-go. Stakeholders en eerste risico’s zet je in de registers." />
      <Card title="Projectopdracht">
        <div className="grid gap-4">
          <Field label="Waarom" hint="Aanleiding en belang."><Area value={project.why} onChange={(e) => patch({ why: e.target.value })} /></Field>
          <Field label="Bevoegdheid PM"><Area value={project.authority} onChange={(e) => patch({ authority: e.target.value })} placeholder="Wat mag de PM zelf beslissen?" /></Field>
          <Field label="Resultaat (uit oriëntatie)" hint="Je kunt het hier aanscherpen."><Area value={project.result} onChange={(e) => patch({ result: e.target.value })} /></Field>
        </div>
      </Card>
    </div>
  );
}

function Definitie({
  project, patch, setProject,
}: {
  project: Project; patch: (p: Partial<Project>) => void;
  setProject: (p: Project | ((prev: Project) => Project)) => void;
}) {
  const total = useMemo(() => project.estimates.reduce((acc, est) => {
    const p = pert(est);
    if (!p) return acc;
    return { mu: acc.mu + p.mu, sigma2: acc.sigma2 + p.sigma * p.sigma };
  }, { mu: 0, sigma2: 0 }), [project.estimates]);
  const sigma = Math.sqrt(total.sigma2);

  return (
    <div className="grid gap-4">
      <PhaseIntro title="Definitie" body="Maak scope, schatting en budget rekenbaar. Bij go bevries je de baseline; wijzigingen rekenen daartegen." />
      <Card title="Scope">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="In scope"><Area value={project.scopeIn} onChange={(e) => patch({ scopeIn: e.target.value })} /></Field>
          <Field label="Buiten scope"><Area value={project.scopeOut} onChange={(e) => patch({ scopeOut: e.target.value })} /></Field>
        </div>
      </Card>
      <Card title="3-punts schatting" action={
        <Button variant="secondary" size="sm" onClick={() => setProject((p) => ({ ...p, estimates: [...p.estimates, { id: uid(), name: "", o: null, m: null, p: null }] }))}>Regel</Button>
      }>
        <div className="space-y-3">
          {project.estimates.length === 0 ? <p className="text-sm text-muted">Nog geen stukken. Schat de grote brokken, niet elke taak.</p> : null}
          {project.estimates.map((est) => {
            const calc = pert(est);
            return (
              <div key={est.id} className="grid gap-2 rounded-md border border-line p-3 sm:grid-cols-6">
                <TextInput className="sm:col-span-2" placeholder="Stuk werk" value={est.name} onChange={(e) => patchList(setProject, "estimates", est.id, { name: e.target.value })} />
                <NumInput placeholder="Optimistisch" value={est.o} onValue={(o) => patchList(setProject, "estimates", est.id, { o } as Partial<Estimate>)} />
                <NumInput placeholder="Meest waarschijnlijk" value={est.m} onValue={(m) => patchList(setProject, "estimates", est.id, { m } as Partial<Estimate>)} />
                <NumInput placeholder="Pessimistisch" value={est.p} onValue={(p) => patchList(setProject, "estimates", est.id, { p } as Partial<Estimate>)} />
                <div className="flex items-center justify-between gap-2 text-xs text-muted">
                  <span>{calc ? `μ ${calc.mu.toFixed(1)} · σ ${calc.sigma.toFixed(1)}` : "—"}</span>
                  <button type="button" className="text-subtle hover:text-ink" onClick={() => setProject((p) => ({ ...p, estimates: p.estimates.filter((x) => x.id !== est.id) }))}>weg</button>
                </div>
              </div>
            );
          })}
          {project.estimates.some((e) => pert(e)) ? <p className="text-sm text-muted">Som μ {total.mu.toFixed(1)} · gecombineerde σ {sigma.toFixed(1)}</p> : null}
        </div>
      </Card>
      <Card title="Geld en baseline">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Budget"><NumInput value={project.budget} onValue={(budget) => patch({ budget })} /></Field>
          <Field label="Risicoreserve"><NumInput value={project.riskReserve} onValue={(riskReserve) => patch({ riskReserve })} /></Field>
          <Field label="Contingency"><NumInput value={project.contingency} onValue={(contingency) => patch({ contingency })} /></Field>
          <Field label="Einddatum"><TextInput type="date" value={project.endDate} onChange={(e) => patch({ endDate: e.target.value })} /></Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant={project.baselineFrozen ? "secondary" : "primary"} onClick={() => patch({ baselineFrozen: true, baselineEndDate: project.endDate, baselineBudget: project.budget })}>Baseline bevriezen</Button>
          {project.baselineFrozen
            ? <p className="text-sm text-muted">Bevroren: {project.baselineEndDate || "geen datum"} · {euro(project.baselineBudget)}</p>
            : <p className="text-sm text-muted">Nog niet bevroren. Doe dit bij de go naar uitvoering.</p>}
        </div>
      </Card>
    </div>
  );
}

function Uitvoering({ project, patch }: { project: Project; patch: (p: Partial<Project>) => void }) {
  const slip = Boolean(project.baselineEndDate && project.endDate && project.endDate > project.baselineEndDate);
  const over = project.budget != null && project.spent != null && project.spent > project.budget;
  return (
    <div className="grid gap-4">
      <PhaseIntro title="Uitvoering" body="Weekstand. Issues en wijzigingen leven in de registers. Een risico dat optreedt, maak je een issue." />
      <Card title="Stand">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="% klaar"><NumInput min={0} max={100} value={project.percentDone} onValue={(percentDone) => patch({ percentDone })} /></Field>
          <Field label="Besteed"><NumInput value={project.spent} onValue={(spent) => patch({ spent })} /></Field>
          <Field label="Huidige einddatum"><TextInput type="date" value={project.endDate} onChange={(e) => patch({ endDate: e.target.value })} /></Field>
        </div>
        <ul className="mt-4 space-y-1 text-sm text-muted">
          <li>Budget {euro(project.spent)} van {euro(project.budget)}{over ? " — over budget" : ""}</li>
          <li>Baseline-einddatum {project.baselineEndDate || "niet bevroren"}{slip ? " — later dan baseline" : ""}</li>
        </ul>
      </Card>
    </div>
  );
}

function Afsluiting({ project, patch }: { project: Project; patch: (p: Partial<Project>) => void }) {
  const leftover = project.risks.filter((r) => r.status !== "dicht").length;
  return (
    <div className="grid gap-4">
      <PhaseIntro title="Afsluiting" body="Resultaat tegen acceptatie, open risico’s overdragen, decharge vragen." />
      <Card title="Oplevering">
        <Field label="Resultaat"><Area value={project.result} onChange={(e) => patch({ result: e.target.value })} /></Field>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={project.accepted} onChange={(e) => patch({ accepted: e.target.checked })} />
          Opdrachtgever heeft het resultaat geaccepteerd
        </label>
      </Card>
      <Card title="Overdracht">
        <Field label="Wat gaat naar de lijn?" hint={leftover ? `${leftover} open risico’s nog overdragen.` : "Geen open risico’s."}>
          <Area value={project.handover} onChange={(e) => patch({ handover: e.target.value })} />
        </Field>
        <Field label="Geleerde les" className="mt-4"><Area value={project.lessons} onChange={(e) => patch({ lessons: e.target.value })} /></Field>
      </Card>
    </div>
  );
}
