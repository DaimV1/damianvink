import { useMemo } from "react";
import { PhaseIntro, patchList } from "@/components/pm/bits";
import { Area, Card, Field, NumInput, Select, TextInput } from "@/components/pm/fields";
import { Button } from "@/components/ui/button";
import { euro, pert, uid, type Estimate, type PhaseId, type Project } from "@/lib/pm/model";
import { tx, useLocale } from "@/lib/i18n/locale";

export function PhasePanel({
  project, patch, setProject, viewPhase,
}: {
  project: Project;
  patch: (p: Partial<Project>) => void;
  setProject: (p: Project | ((prev: Project) => Project)) => void;
  viewPhase: PhaseId;
}) {
  const lookingAhead = viewPhase !== project.phase;
  const { locale } = useLocale();
  const form =
    viewPhase === "orientatie" ? <Orientatie project={project} patch={patch} /> :
    viewPhase === "voorbereiding" ? <Voorbereiding project={project} setProject={setProject} patch={patch} /> :
    viewPhase === "definitie" ? <Definitie project={project} patch={patch} setProject={setProject} /> :
    viewPhase === "uitvoering" ? <Uitvoering project={project} patch={patch} /> :
    <Afsluiting project={project} patch={patch} />;

  return (
    <div className="grid gap-4">
      {lookingAhead ? (
        <p className="rounded-md border border-line bg-elevated px-4 py-3 text-sm text-ink">
          {tx(locale, "Je kunt deze fase al lezen en vullen. De officiële overgang gaat via Beslispunt.", "You can already read and fill this phase. The official change goes through the Gate.")}
        </p>
      ) : null}
      {form}
    </div>
  );
}

function Orientatie({ project, patch }: { project: Project; patch: (p: Partial<Project>) => void }) {
  const { locale } = useLocale();
  return (
    <div className="grid gap-4">
      <PhaseIntro title={tx(locale, "Oriëntatie", "Framing")} body={tx(locale, "Bepaal of dit een project is, en wat resultaat, uitkomst en doel van elkaar zijn.", "Decide whether this is a project, and how result, outcome and goal differ.")} />
      <Card title={tx(locale, "Kader", "Frame")}>
        <div className="grid gap-4">
          <Field label={tx(locale, "Projectresultaat", "Project result")} hint={tx(locale, "Wat wordt opgeleverd?", "What is delivered?")}><Area value={project.result} onChange={(e) => patch({ result: e.target.value })} /></Field>
          <Field label={tx(locale, "Uitkomst", "Outcome")} hint={tx(locale, "Welke verandering maakt dat resultaat mogelijk?", "What change does that result make possible?")}><Area value={project.outcome} onChange={(e) => patch({ outcome: e.target.value })} /></Field>
          <Field label={tx(locale, "Doel", "Goal")} hint={tx(locale, "Welk effect wil de opdrachtgever daarmee?", "What effect does the sponsor want from it?")}><Area value={project.goal} onChange={(e) => patch({ goal: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={tx(locale, "Harde constraint", "Hard constraint")}>
              <Select value={project.constraint} onChange={(e) => patch({ constraint: e.target.value as Project["constraint"] })}>
                <option value="tijd">{tx(locale, "Tijd", "Time")}</option><option value="geld">{tx(locale, "Geld", "Money")}</option><option value="scope">Scope</option><option value="kwaliteit">{tx(locale, "Kwaliteit", "Quality")}</option>
              </Select>
            </Field>
            <Field label={tx(locale, "Werkvorm", "Work form")}>
              <Select value={project.workform} onChange={(e) => patch({ workform: e.target.value as Project["workform"] })}>
                <option value="project">Project</option><option value="programma">{tx(locale, "Programma", "Programme")}</option><option value="lijn">{tx(locale, "Lijn / BAU", "Line / BAU")}</option>
              </Select>
            </Field>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Voorbereiding({
  project, patch, setProject,
}: {
  project: Project;
  patch: (p: Partial<Project>) => void;
  setProject: (p: Project | ((prev: Project) => Project)) => void;
}) {
  const { locale } = useLocale();
  return (
    <div className="grid gap-4">
      <PhaseIntro title={tx(locale, "Voorbereiding", "Preparation")} body={tx(locale, "Maak de opdracht scherp genoeg voor de eerste go/no-go. Belanghebbende en eerste risico hieronder; de registers houden het volledige overzicht.", "Make the brief sharp enough for the first go/no-go. Stakeholder and first risk below; the registers keep the full picture.")} />
      <Card title={tx(locale, "Projectopdracht", "Project brief")}>
        <div className="grid gap-4">
          <Field label={tx(locale, "Waarom", "Why")} hint={tx(locale, "Aanleiding en belang.", "Reason and stake.")}><Area value={project.why} onChange={(e) => patch({ why: e.target.value })} /></Field>
          <Field label={tx(locale, "Bevoegdheid PM", "PM authority")}><Area value={project.authority} onChange={(e) => patch({ authority: e.target.value })} placeholder={tx(locale, "Wat mag de PM zelf beslissen?", "What may the PM decide alone?")} /></Field>
          <Field label={tx(locale, "Resultaat (uit oriëntatie)", "Result (from framing)")} hint={tx(locale, "Je kunt het hier aanscherpen.", "You can sharpen it here.")}><Area value={project.result} onChange={(e) => patch({ result: e.target.value })} /></Field>
        </div>
      </Card>
      <Card title={tx(locale, "Belanghebbenden", "Stakeholders")} action={
        <Button variant="secondary" size="sm" onClick={() => setProject((p) => ({
          ...p,
          stakeholders: [...p.stakeholders, { id: uid(), name: "", influence: 3, interest: 3, note: "" }],
        }))}>Toevoegen</Button>
      }>
        {project.stakeholders.length === 0 ? (
          <p className="text-sm text-muted">Minstens één naam. Invloed en belang sturen de actie in het register Mensen.</p>
        ) : null}
        <div className="space-y-3">
          {project.stakeholders.map((s) => (
            <div key={s.id} className="grid gap-2 rounded-md border border-line p-3 sm:grid-cols-4">
              <TextInput className="sm:col-span-2" placeholder="Naam" value={s.name} onChange={(e) => patchList(setProject, "stakeholders", s.id, { name: e.target.value })} />
              <Select value={s.influence} onChange={(e) => patchList(setProject, "stakeholders", s.id, { influence: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}>
                <option value={1}>Invloed 1</option>
                <option value={2}>Invloed 2</option>
                <option value={3}>Invloed 3</option>
                <option value={4}>Invloed 4</option>
                <option value={5}>Invloed 5</option>
              </Select>
              <Select value={s.interest} onChange={(e) => patchList(setProject, "stakeholders", s.id, { interest: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}>
                <option value={1}>Belang 1</option>
                <option value={2}>Belang 2</option>
                <option value={3}>Belang 3</option>
                <option value={4}>Belang 4</option>
                <option value={5}>Belang 5</option>
              </Select>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Eerste risico’s" action={
        <Button variant="secondary" size="sm" onClick={() => setProject((p) => ({
          ...p,
          risks: [...p.risks, {
            id: uid(), source: "", event: "", effect: "", probability: 3, impact: 3,
            euro: null, owner: "", measure: "", response: "verkleinen", status: "open",
          }],
        }))}>Toevoegen</Button>
      }>
        {project.risks.length === 0 ? (
          <p className="text-sm text-muted">Noem de gebeurtenis. Kans × impact en eigenaar komen in het register Risico’s verder.</p>
        ) : null}
        <div className="space-y-3">
          {project.risks.map((r) => (
            <div key={r.id} className="grid gap-2 rounded-md border border-line p-3 sm:grid-cols-4">
              <TextInput className="sm:col-span-2" placeholder="Gebeurtenis" value={r.event} onChange={(e) => patchList(setProject, "risks", r.id, { event: e.target.value })} />
              <Select value={r.probability} onChange={(e) => patchList(setProject, "risks", r.id, { probability: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}>
                <option value={1}>Kans 1</option>
                <option value={2}>Kans 2</option>
                <option value={3}>Kans 3</option>
                <option value={4}>Kans 4</option>
                <option value={5}>Kans 5</option>
              </Select>
              <Select value={r.impact} onChange={(e) => patchList(setProject, "risks", r.id, { impact: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}>
                <option value={1}>Impact 1</option>
                <option value={2}>Impact 2</option>
                <option value={3}>Impact 3</option>
                <option value={4}>Impact 4</option>
                <option value={5}>Impact 5</option>
              </Select>
            </div>
          ))}
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
  const { locale } = useLocale();
  const sigma = Math.sqrt(total.sigma2);

  return (
    <div className="grid gap-4">
      <PhaseIntro title={tx(locale, "Definitie", "Definition")} body={tx(locale, "Maak scope, schatting (dagen) en budget rekenbaar. Bij go bevries je de baseline; wijzigingen rekenen daartegen.", "Make scope, estimate (days) and budget countable. On go you freeze the baseline; changes count against it.")} />
      <Card title="Scope">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={tx(locale, "In scope", "In scope")}><Area value={project.scopeIn} onChange={(e) => patch({ scopeIn: e.target.value })} /></Field>
          <Field label={tx(locale, "Buiten scope", "Out of scope")}><Area value={project.scopeOut} onChange={(e) => patch({ scopeOut: e.target.value })} /></Field>
        </div>
      </Card>
      <Card title={tx(locale, "3-punts schatting (dagen)", "3-point estimate (days)")} action={
        <Button variant="secondary" size="sm" onClick={() => setProject((p) => ({ ...p, estimates: [...p.estimates, { id: uid(), name: "", o: null, m: null, p: null }] }))}>Regel</Button>
      }>
        <div className="space-y-3">
          {project.estimates.length === 0 ? <p className="text-sm text-muted">{tx(locale, "Nog geen stukken. Schat de grote brokken in dagen, niet elke taak.", "No chunks yet. Estimate the big pieces in days, not every task.")}</p> : null}
          {project.estimates.map((est) => {
            const calc = pert(est);
            return (
              <div key={est.id} className="grid gap-2 rounded-md border border-line p-3 sm:grid-cols-6">
                <TextInput className="sm:col-span-2" placeholder="Stuk werk" value={est.name} onChange={(e) => patchList(setProject, "estimates", est.id, { name: e.target.value })} />
                <NumInput placeholder="O (d)" value={est.o} onValue={(o) => patchList(setProject, "estimates", est.id, { o } as Partial<Estimate>)} />
                <NumInput placeholder="M (d)" value={est.m} onValue={(m) => patchList(setProject, "estimates", est.id, { m } as Partial<Estimate>)} />
                <NumInput placeholder="P (d)" value={est.p} onValue={(p) => patchList(setProject, "estimates", est.id, { p } as Partial<Estimate>)} />
                <div className="flex items-center justify-between gap-2 text-xs text-muted">
                  <span>{calc ? `μ ${calc.mu.toFixed(1)} d · σ ${calc.sigma.toFixed(1)} d` : "—"}</span>
                  <button type="button" className="text-subtle hover:text-ink" onClick={() => setProject((p) => ({ ...p, estimates: p.estimates.filter((x) => x.id !== est.id) }))}>weg</button>
                </div>
              </div>
            );
          })}
          {project.estimates.some((e) => pert(e)) ? <p className="text-sm text-muted">Som μ {total.mu.toFixed(1)} d · gecombineerde σ {sigma.toFixed(1)} d</p> : null}
        </div>
      </Card>
      <Card title={tx(locale, "Geld en baseline", "Money and baseline")}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Budget"><NumInput value={project.budget} onValue={(budget) => patch({ budget })} /></Field>
          <Field label={tx(locale, "Risicoreserve", "Risk reserve")}><NumInput value={project.riskReserve} onValue={(riskReserve) => patch({ riskReserve })} /></Field>
          <Field label="Contingency"><NumInput value={project.contingency} onValue={(contingency) => patch({ contingency })} /></Field>
          <Field label={tx(locale, "Einddatum", "End date")}><TextInput type="date" value={project.endDate} onChange={(e) => patch({ endDate: e.target.value })} /></Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant={project.baselineFrozen ? "secondary" : "primary"} onClick={() => patch({ baselineFrozen: true, baselineEndDate: project.endDate, baselineBudget: project.budget })}>{tx(locale, "Baseline bevriezen", "Freeze baseline")}</Button>
          {project.baselineFrozen
            ? <p className="text-sm text-muted">{tx(locale, "Bevroren:", "Frozen:")} {project.baselineEndDate || tx(locale, "geen datum", "no date")} · {euro(project.baselineBudget)}</p>
            : <p className="text-sm text-muted">{tx(locale, "Nog niet bevroren. Doe dit bij de go naar uitvoering.", "Not frozen yet. Do this at the go to delivery.")}</p>}
        </div>
      </Card>
    </div>
  );
}

function Uitvoering({ project, patch }: { project: Project; patch: (p: Partial<Project>) => void }) {
  const { locale } = useLocale();
  const slip = Boolean(project.baselineEndDate && project.endDate && project.endDate > project.baselineEndDate);
  const over = project.budget != null && project.spent != null && project.spent > project.budget;
  return (
    <div className="grid gap-4">
      <PhaseIntro title={tx(locale, "Uitvoering", "Delivery")} body={tx(locale, "Weekstand. Issues en wijzigingen leven in de registers. Een risico dat optreedt, maak je een issue.", "Week status. Issues and changes live in the registers. A risk that occurs becomes an issue.")} />
      <Card title={tx(locale, "Stand", "Status")}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={tx(locale, "% klaar", "% complete")}><NumInput min={0} max={100} value={project.percentDone} onValue={(percentDone) => patch({ percentDone })} /></Field>
          <Field label={tx(locale, "Besteed", "Spent")}><NumInput value={project.spent} onValue={(spent) => patch({ spent })} /></Field>
          <Field label={tx(locale, "Huidige einddatum", "Current end date")}><TextInput type="date" value={project.endDate} onChange={(e) => patch({ endDate: e.target.value })} /></Field>
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
  const { locale } = useLocale();
  const leftover = project.risks.filter((r) => r.status !== "dicht").length;
  return (
    <div className="grid gap-4">
      <PhaseIntro title={tx(locale, "Afsluiting", "Close-out")} body={tx(locale, "Resultaat tegen acceptatie, open risico’s overdragen, decharge vragen.", "Result against acceptance, hand over open risks, ask for discharge.")} />
      <Card title={tx(locale, "Oplevering", "Handover of result")}>
        <Field label={tx(locale, "Resultaat", "Result")}><Area value={project.result} onChange={(e) => patch({ result: e.target.value })} /></Field>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={project.accepted} onChange={(e) => patch({ accepted: e.target.checked })} />
          {tx(locale, "Opdrachtgever heeft het resultaat geaccepteerd", "Sponsor has accepted the result")}
        </label>
      </Card>
      <Card title={tx(locale, "Overdracht", "Handover")}>
        <Field label={tx(locale, "Wat gaat naar de lijn?", "What goes to the line?")} hint={leftover ? tx(locale, `${leftover} open risico’s nog overdragen.`, `${leftover} open risks still to hand over.`) : tx(locale, "Geen open risico’s.", "No open risks.")}>
          <Area value={project.handover} onChange={(e) => patch({ handover: e.target.value })} />
        </Field>
        <Field label={tx(locale, "Geleerde les", "Lesson learned")} className="mt-4"><Area value={project.lessons} onChange={(e) => patch({ lessons: e.target.value })} /></Field>
      </Card>
    </div>
  );
}
