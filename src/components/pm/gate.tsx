import { useState } from "react";
import { Card, Field, Select, TextInput, Area } from "@/components/pm/fields";
import { Button } from "@/components/ui/button";
import {
  PHASES, gateBrief, nextPhase, openCount, riskScore, topRisks, uid,
  type DecisionKind, type Project,
} from "@/lib/pm/model";

export function GatePanel({
  project, setProject,
}: {
  project: Project;
  setProject: (p: Project | ((prev: Project) => Project)) => void;
}) {
  const [advice, setAdvice] = useState<DecisionKind>("go");
  const [who, setWho] = useState(project.sponsor);
  const [notes, setNotes] = useState("");
  const nxt = nextPhase(project.phase);
  const phase = PHASES.find((p) => p.id === project.phase)!;
  const brief = gateBrief(project);

  function record(decision: DecisionKind) {
    setProject((p) => ({
      ...p,
      decisions: [...p.decisions, {
        id: uid(), from: p.phase, advice, decision, who,
        date: new Date().toISOString().slice(0, 10), notes,
      }],
      phase: decision === "go" && nxt ? nxt : p.phase,
      baselineFrozen: decision === "go" && p.phase === "definitie" ? true : p.baselineFrozen,
      baselineEndDate: decision === "go" && p.phase === "definitie" ? p.endDate : p.baselineEndDate,
      baselineBudget: decision === "go" && p.phase === "definitie" ? p.budget : p.baselineBudget,
    }));
    setNotes("");
  }

  function download() {
    const blob = new Blob([brief], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `faseovergang-${project.phase}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-4">
      <Card title={`Beslispunt · ${phase.label}`}>
        <p className="text-sm text-muted">{phase.result}. Dit is het A4’tje voor de stuurgroep.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {topRisks(project.risks, 3).map((r) => (
            <div key={r.id} className="rounded-md border border-line p-3 text-sm">
              <p className="font-mono text-xs text-accent">Risico {riskScore(r)}</p>
              <p className="mt-1 text-ink">{r.event || r.source || "Naamloos"}</p>
            </div>
          ))}
          <div className="rounded-md border border-line p-3 text-sm">
            <p className="font-mono text-xs text-accent">Issues</p>
            <p className="mt-1">{openCount(project.issues)} open</p>
          </div>
          <div className="rounded-md border border-line p-3 text-sm">
            <p className="font-mono text-xs text-accent">Wijzigingen</p>
            <p className="mt-1">{openCount(project.changes)} open</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Advies PM">
            <Select value={advice} onChange={(e) => setAdvice(e.target.value as DecisionKind)}>
              <option value="go">Go</option><option value="bijsturen">Bijsturen</option><option value="stop">Stop</option>
            </Select>
          </Field>
          <Field label="Beslisser"><TextInput value={who} onChange={(e) => setWho(e.target.value)} /></Field>
        </div>
        <Field label="Toelichting" className="mt-4"><Area value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => record("go")} disabled={!nxt && project.phase !== "afsluiting"}>
            {nxt ? `Go naar ${PHASES.find((p) => p.id === nxt)?.label}` : "Go vastleggen"}
          </Button>
          <Button variant="secondary" onClick={() => record("bijsturen")}>Bijsturen</Button>
          <Button variant="secondary" onClick={() => record("stop")}>Stop</Button>
          <Button variant="ghost" onClick={download}>Export stuurgroep</Button>
          <button type="button" className="text-sm text-muted hover:text-ink" onClick={() => navigator.clipboard.writeText(brief)}>Kopieer tekst</button>
        </div>
      </Card>
      {project.decisions.length ? (
        <Card title="Eerdere besluiten">
          <ul className="space-y-2 text-sm">
            {project.decisions.slice().reverse().map((d) => (
              <li key={d.id} className="border-b border-line pb-2 last:border-0">
                <strong className="text-ink">{d.date} · {d.decision}</strong>
                <span className="text-muted"> vanuit {PHASES.find((p) => p.id === d.from)?.label} · {d.who}</span>
                {d.notes ? <p className="mt-1 text-muted">{d.notes}</p> : null}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
