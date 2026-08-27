import { patchList } from "@/components/pm/bits";
import { Area, Card, NumInput, Select, TextInput } from "@/components/pm/fields";
import { Button } from "@/components/ui/button";
import {
  euro, riskBand, riskEmv, riskScore, stakeholderAction, uid,
  type ChangeAdvice, type ItemStatus, type Project, type RiskResponse, type Score,
} from "@/lib/pm/model";

const SCORES: Score[] = [1, 2, 3, 4, 5];

export function StakeholdersPanel({
  project, setProject,
}: { project: Project; setProject: (p: Project | ((prev: Project) => Project)) => void }) {
  return (
    <Card title="Belanghebbenden" action={
      <Button variant="secondary" size="sm" onClick={() => setProject((p) => ({ ...p, stakeholders: [...p.stakeholders, { id: uid(), name: "", influence: 3, interest: 3, note: "" }] }))}>Toevoegen</Button>
    }>
      <p className="mb-4 text-sm text-muted">Invloed × belang. Actie volgt automatisch: managen, tevreden houden, informeren of monitoren.</p>
      <div className="space-y-3">
        {project.stakeholders.map((s) => (
          <div key={s.id} className="grid gap-2 rounded-md border border-line p-3 sm:grid-cols-6">
            <TextInput className="sm:col-span-2" placeholder="Naam" value={s.name} onChange={(e) => patchList(setProject, "stakeholders", s.id, { name: e.target.value })} />
            <Select value={s.influence} onChange={(e) => patchList(setProject, "stakeholders", s.id, { influence: Number(e.target.value) as Score })}>
              {SCORES.map((n) => <option key={n} value={n}>Invloed {n}</option>)}
            </Select>
            <Select value={s.interest} onChange={(e) => patchList(setProject, "stakeholders", s.id, { interest: Number(e.target.value) as Score })}>
              {SCORES.map((n) => <option key={n} value={n}>Belang {n}</option>)}
            </Select>
            <p className="flex items-center text-xs text-muted">{stakeholderAction(s)}</p>
            <button type="button" className="text-left text-xs text-subtle hover:text-ink" onClick={() => setProject((p) => ({ ...p, stakeholders: p.stakeholders.filter((x) => x.id !== s.id) }))}>weg</button>
            <TextInput className="sm:col-span-6" placeholder="Notitie" value={s.note} onChange={(e) => patchList(setProject, "stakeholders", s.id, { note: e.target.value })} />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function RisksPanel({
  project, setProject,
}: { project: Project; setProject: (p: Project | ((prev: Project) => Project)) => void }) {
  return (
    <Card title="Risico’s" action={
      <Button variant="secondary" size="sm" onClick={() => setProject((p) => ({ ...p, risks: [...p.risks, { id: uid(), source: "", event: "", effect: "", probability: 3, impact: 3, euro: null, owner: "", measure: "", response: "verkleinen", status: "open" }] }))}>Toevoegen</Button>
    }>
      <p className="mb-4 text-sm text-muted">Bron → gebeurtenis → gevolg. Score = kans × impact. EMV = (kans/5) × euro-impact.</p>
      <div className="space-y-4">
        {project.risks.map((r) => {
          const score = riskScore(r);
          const emv = riskEmv(r);
          return (
            <div key={r.id} className="space-y-2 rounded-md border border-line p-3">
              <div className="grid gap-2 sm:grid-cols-3">
                <TextInput placeholder="Bron" value={r.source} onChange={(e) => patchList(setProject, "risks", r.id, { source: e.target.value })} />
                <TextInput placeholder="Gebeurtenis" value={r.event} onChange={(e) => patchList(setProject, "risks", r.id, { event: e.target.value })} />
                <TextInput placeholder="Gevolg" value={r.effect} onChange={(e) => patchList(setProject, "risks", r.id, { effect: e.target.value })} />
              </div>
              <div className="grid gap-2 sm:grid-cols-6">
                <Select value={r.probability} onChange={(e) => patchList(setProject, "risks", r.id, { probability: Number(e.target.value) as Score })}>
                  {SCORES.map((n) => <option key={n} value={n}>Kans {n}</option>)}
                </Select>
                <Select value={r.impact} onChange={(e) => patchList(setProject, "risks", r.id, { impact: Number(e.target.value) as Score })}>
                  {SCORES.map((n) => <option key={n} value={n}>Impact {n}</option>)}
                </Select>
                <NumInput placeholder="Euro-impact" value={r.euro} onValue={(euroVal) => patchList(setProject, "risks", r.id, { euro: euroVal })} />
                <TextInput placeholder="Eigenaar" value={r.owner} onChange={(e) => patchList(setProject, "risks", r.id, { owner: e.target.value })} />
                <Select value={r.response} onChange={(e) => patchList(setProject, "risks", r.id, { response: e.target.value as RiskResponse })}>
                  <option value="vermijden">Vermijden</option><option value="verkleinen">Verkleinen</option>
                  <option value="overdragen">Overdragen</option><option value="accepteren">Accepteren</option>
                </Select>
                <Select value={r.status} onChange={(e) => patchList(setProject, "risks", r.id, { status: e.target.value as ItemStatus })}>
                  <option value="open">Open</option><option value="bezig">Bezig</option><option value="dicht">Dicht</option>
                </Select>
              </div>
              <TextInput placeholder="Maatregel" value={r.measure} onChange={(e) => patchList(setProject, "risks", r.id, { measure: e.target.value })} />
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span>Score {score} · {riskBand(score)}{emv != null ? ` · EMV ${euro(emv)}` : ""}</span>
                <div className="flex gap-3">
                  <button type="button" className="hover:text-ink" onClick={() => setProject((p) => ({
                    ...p,
                    issues: [...p.issues, { id: uid(), title: r.event || r.source || "Opgetreden risico", owner: r.owner, due: "", status: "open", note: r.effect }],
                    risks: p.risks.map((x) => (x.id === r.id ? { ...x, status: "dicht" as const } : x)),
                  }))}>is opgetreden → issue</button>
                  <button type="button" className="hover:text-ink" onClick={() => setProject((p) => ({ ...p, risks: p.risks.filter((x) => x.id !== r.id) }))}>weg</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function IssuesPanel({
  project, setProject,
}: { project: Project; setProject: (p: Project | ((prev: Project) => Project)) => void }) {
  return (
    <Card title="Issues" action={
      <Button variant="secondary" size="sm" onClick={() => setProject((p) => ({ ...p, issues: [...p.issues, { id: uid(), title: "", owner: "", due: "", status: "open", note: "" }] }))}>Toevoegen</Button>
    }>
      <p className="mb-4 text-sm text-muted">Speelt nu. Geen waarschijnlijkheid — actie.</p>
      <div className="space-y-3">
        {project.issues.map((issue) => (
          <div key={issue.id} className="grid gap-2 rounded-md border border-line p-3 sm:grid-cols-4">
            <TextInput className="sm:col-span-2" placeholder="Issue" value={issue.title} onChange={(e) => patchList(setProject, "issues", issue.id, { title: e.target.value })} />
            <TextInput placeholder="Eigenaar" value={issue.owner} onChange={(e) => patchList(setProject, "issues", issue.id, { owner: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <TextInput type="date" value={issue.due} onChange={(e) => patchList(setProject, "issues", issue.id, { due: e.target.value })} />
              <Select value={issue.status} onChange={(e) => patchList(setProject, "issues", issue.id, { status: e.target.value as ItemStatus })}>
                <option value="open">Open</option><option value="bezig">Bezig</option><option value="dicht">Dicht</option>
              </Select>
            </div>
            <TextInput className="sm:col-span-4" placeholder="Toelichting" value={issue.note} onChange={(e) => patchList(setProject, "issues", issue.id, { note: e.target.value })} />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ChangesPanel({
  project, setProject,
}: { project: Project; setProject: (p: Project | ((prev: Project) => Project)) => void }) {
  return (
    <Card title="Wijzigingen" action={
      <Button variant="secondary" size="sm" onClick={() => setProject((p) => ({ ...p, changes: [...p.changes, { id: uid(), title: "", scope: "", days: null, money: null, riskNote: "", advice: "bijsturen", status: "open" }] }))}>Toevoegen</Button>
    }>
      <p className="mb-4 text-sm text-muted">
        Impact tegen de baseline{project.baselineFrozen ? ` (${project.baselineEndDate || "geen datum"}, ${euro(project.baselineBudget)}).` : " — bevries die eerst in de definitie."}
      </p>
      <div className="space-y-3">
        {project.changes.map((c) => (
          <div key={c.id} className="space-y-2 rounded-md border border-line p-3">
            <TextInput placeholder="Wijziging" value={c.title} onChange={(e) => patchList(setProject, "changes", c.id, { title: e.target.value })} />
            <Area placeholder="Scope-effect" value={c.scope} onChange={(e) => patchList(setProject, "changes", c.id, { scope: e.target.value })} />
            <div className="grid gap-2 sm:grid-cols-4">
              <NumInput placeholder="Dagen extra" value={c.days} onValue={(days) => patchList(setProject, "changes", c.id, { days })} />
              <NumInput placeholder="Euro extra" value={c.money} onValue={(money) => patchList(setProject, "changes", c.id, { money })} />
              <Select value={c.advice} onChange={(e) => patchList(setProject, "changes", c.id, { advice: e.target.value as ChangeAdvice })}>
                <option value="go">Advies: go</option><option value="bijsturen">Advies: bijsturen</option><option value="afwijzen">Advies: afwijzen</option>
              </Select>
              <Select value={c.status} onChange={(e) => patchList(setProject, "changes", c.id, { status: e.target.value as ItemStatus })}>
                <option value="open">Open</option><option value="bezig">Bezig</option><option value="dicht">Dicht</option>
              </Select>
            </div>
            <TextInput placeholder="Risico-effect" value={c.riskNote} onChange={(e) => patchList(setProject, "changes", c.id, { riskNote: e.target.value })} />
          </div>
        ))}
      </div>
    </Card>
  );
}
