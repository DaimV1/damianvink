import { useState } from "react";
import { Card, Field, Select, TextInput, Area } from "@/components/pm/fields";
import { Button } from "@/components/ui/button";
import { tx, useLocale } from "@/lib/i18n/locale";
import {
  PHASES, applyGateDecision, gateBlockers, gateBrief, nextPhase, openCount, riskScore, topRisks,
  type DecisionKind, type Project,
} from "@/lib/pm/model";

export function GatePanel({
  project, setProject,
}: {
  project: Project;
  setProject: (p: Project | ((prev: Project) => Project)) => void;
}) {
  const { locale } = useLocale();
  const [advice, setAdvice] = useState<DecisionKind>("go");
  const [who, setWho] = useState(project.sponsor);
  const [notes, setNotes] = useState("");
  const nxt = nextPhase(project.phase);
  const phase = PHASES.find((p) => p.id === project.phase)!;
  const brief = gateBrief(project);
  const blockers = gateBlockers(project, locale);
  const canGo = blockers.length === 0;

  function record(decision: DecisionKind) {
    if (decision === "go" && !canGo) return;
    setProject((p) => applyGateDecision(p, { advice, decision, who, notes }));
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
      <Card title={`${tx(locale, "Beslispunt", "Gate")} · ${locale === "en" ? phase.labelEn : phase.label}`}>
        <p className="text-sm text-muted">{locale === "en" ? phase.resultEn : phase.result}. {tx(locale, "Dit is het A4’tje voor de stuurgroep.", "This is the one-pager for the steering group.")}</p>
        {blockers.length ? (
          <ul className="mt-3 space-y-1 text-sm text-ink">
            {blockers.map((b) => (
              <li key={b}><span className="font-mono text-xs text-accent">{tx(locale, "blok", "block")}</span> {b}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">{tx(locale, "Geen harde blockers. Je kunt een go voorleggen.", "No hard blockers. You can put a go on the table.")}</p>
        )}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {topRisks(project.risks, 3).map((r) => (
            <div key={r.id} className="rounded-md border border-line p-3 text-sm">
              <p className="font-mono text-xs text-accent">{tx(locale, "Risico", "Risk")} {riskScore(r)}</p>
              <p className="mt-1 text-ink">{r.event || r.source || tx(locale, "Naamloos", "Untitled")}</p>
            </div>
          ))}
          <div className="rounded-md border border-line p-3 text-sm">
            <p className="font-mono text-xs text-accent">Issues</p>
            <p className="mt-1">{openCount(project.issues)} {tx(locale, "open", "open")}</p>
          </div>
          <div className="rounded-md border border-line p-3 text-sm">
            <p className="font-mono text-xs text-accent">{tx(locale, "Wijzigingen", "Changes")}</p>
            <p className="mt-1">{openCount(project.changes)} open</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={tx(locale, "Advies PM", "PM advice")}>
            <Select value={advice} onChange={(e) => setAdvice(e.target.value as DecisionKind)}>
              <option value="go">Go</option><option value="bijsturen">{tx(locale, "Bijsturen", "Steer")}</option><option value="stop">Stop</option>
            </Select>
          </Field>
          <Field label={tx(locale, "Beslisser", "Decision maker")}><TextInput value={who} onChange={(e) => setWho(e.target.value)} /></Field>
        </div>
        <Field label={tx(locale, "Toelichting", "Notes")} className="mt-4"><Area value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => record("go")} disabled={!canGo || (!nxt && project.phase !== "afsluiting")}>
            {nxt ? `${tx(locale, "Go naar", "Go to")} ${locale === "en" ? PHASES.find((p) => p.id === nxt)?.labelEn : PHASES.find((p) => p.id === nxt)?.label}` : tx(locale, "Go vastleggen", "Record go")}
          </Button>
          <Button variant="secondary" onClick={() => record("bijsturen")}>{tx(locale, "Bijsturen", "Steer")}</Button>
          <Button variant="secondary" onClick={() => record("stop")}>Stop</Button>
          <Button variant="ghost" onClick={download}>{tx(locale, "Export stuurgroep", "Export steering group")}</Button>
          <button
            type="button"
            className="text-sm text-muted hover:text-ink"
            onClick={() => navigator.clipboard.writeText(brief)}
          >
            {tx(locale, "Kopieer tekst", "Copy text")}
          </button>
        </div>
      </Card>
      {project.decisions.length ? (
        <Card title={tx(locale, "Eerdere besluiten", "Previous decisions")}>
          <ul className="space-y-2 text-sm">
            {project.decisions.slice().reverse().map((d) => (
              <li key={d.id} className="border-b border-line pb-2 last:border-0">
                <strong className="text-ink">
                  {d.date} ·{" "}
                  {d.decision === "bijsturen" ? tx(locale, "Bijsturen", "Steer") : d.decision === "go" ? "Go" : "Stop"}
                </strong>
                <span className="text-muted">
                  {" "}
                  {tx(locale, "vanuit", "from")}{" "}
                  {locale === "en"
                    ? PHASES.find((p) => p.id === d.from)?.labelEn
                    : PHASES.find((p) => p.id === d.from)?.label}{" "}
                  · {d.who}
                </span>
                {d.notes ? <p className="mt-1 text-muted">{d.notes}</p> : null}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
