import { useEffect, useRef, useState } from "react";
import { PhaseBar, RagBadge, Stat } from "@/components/pm/bits";
import { Field, TextInput } from "@/components/pm/fields";
import { GatePanel } from "@/components/pm/gate";
import { GanttBoard } from "@/components/pm/gantt";
import { OverviewPanel, type WorkspaceTab } from "@/components/pm/overview";
import { PhasePanel } from "@/components/pm/phases";
import { ChangesPanel, IssuesPanel, RisksPanel, StakeholdersPanel } from "@/components/pm/registers";
import { TemplatesPanel } from "@/components/pm/templates";
import { Button } from "@/components/ui/button";
import {
  PHASES,
  euro,
  inferredRag,
  nextAction,
  openCount,
  type PhaseId,
  type Project,
} from "@/lib/pm/model";
import { tx, useLocale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";

const PRIMARY_TABS: { id: WorkspaceTab | "templates"; nl: string; en: string }[] = [
  { id: "overzicht", nl: "Weekstart", en: "Week start" },
  { id: "fase", nl: "Fasewerk", en: "Phase work" },
  { id: "plan", nl: "Plan", en: "Plan" },
  { id: "poort", nl: "Beslispunt", en: "Gate" },
];

const REGISTER_TABS: { id: WorkspaceTab | "templates"; nl: string; en: string }[] = [
  { id: "mensen", nl: "Mensen", en: "People" },
  { id: "risicos", nl: "Risico’s", en: "Risks" },
  { id: "issues", nl: "Issues", en: "Issues" },
  { id: "wijzigingen", nl: "Wijzigingen", en: "Changes" },
  { id: "templates", nl: "Templates", en: "Templates" },
];

function TabButton({
  id, label, panel, setPanel,
}: {
  id: WorkspaceTab | "templates";
  label: string;
  panel: WorkspaceTab | "templates";
  setPanel: (id: WorkspaceTab | "templates") => void;
}) {
  return (
    <button
      type="button"
      onClick={() => setPanel(id)}
      className={cn(
        "h-11 rounded-full border px-4 text-sm",
        panel === id ? "border-accent bg-accent text-accent-fg" : "border-line bg-elevated text-muted hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}

export function ProjectWorkspace({
  project,
  list,
  activeId,
  patch,
  setProject,
  reset,
  createProject,
  switchProject,
  loadSample,
  exportJson,
  importJson,
  backupStale,
  lastExportAt,
}: {
  project: Project;
  list: Project[];
  activeId: string;
  patch: (p: Partial<Project>) => void;
  setProject: (p: Project | ((prev: Project) => Project)) => void;
  reset: () => void;
  createProject: (name?: string) => string;
  switchProject: (id: string) => void;
  loadSample: () => void;
  exportJson: () => void;
  importJson: (file: File) => Promise<void>;
  backupStale: boolean;
  lastExportAt?: string;
}) {
  const [panel, setPanel] = useState<WorkspaceTab | "templates">(
    () => (project.name.trim() ? "overzicht" : "fase"),
  );
  const [viewPhase, setViewPhase] = useState<PhaseId>(project.phase);
  const fileRef = useRef<HTMLInputElement>(null);
  const suggestedRag = inferredRag(project);
  const phase = PHASES.find((p) => p.id === project.phase)!;
  const looking = PHASES.find((p) => p.id === viewPhase)!;
  const untitled = !project.name.trim();
  const { locale } = useLocale();

  useEffect(() => {
    setPanel(project.name.trim() ? "overzicht" : "fase");
    setViewPhase(project.phase);
  }, [project.id]);

  useEffect(() => {
    setViewPhase(project.phase);
  }, [project.phase]);

  function onNew() {
    const name = window.prompt(tx(locale, "Naam van het nieuwe project", "Name of the new project"));
    if (name == null) return;
    createProject(name.trim() || undefined);
  }

  return (
    <div className="space-y-6">
      {backupStale ? (
        <p className="rounded-md border border-line bg-elevated px-4 py-3 text-sm text-ink">
          Backup is verouderd{lastExportAt ? ` (laatste export ${lastExportAt.slice(0, 10)})` : " (nog nooit geëxporteerd)"}.
          Staat zit in dit tabblad.{" "}
          <button type="button" className="text-accent hover:underline" onClick={exportJson}>Exporteer JSON</button>
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-w-0 items-center gap-2 text-sm">
          <span className="text-muted">Project</span>
          <select
            value={activeId}
            onChange={(e) => switchProject(e.target.value)}
            className="h-11 max-w-[16rem] rounded-md border border-line bg-elevated px-3 text-sm"
          >
            {list.map((item) => (
              <option key={item.id} value={item.id}>
              {item.name || tx(locale, "Naamloos project", "Untitled project")}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={onNew}>{tx(locale, "Nieuw", "New")}</Button>
          <Button variant="secondary" size="sm" onClick={loadSample}>{tx(locale, "Voorbeeld", "Sample")}</Button>
          <Button variant="ghost" size="sm" onClick={exportJson}>Export</Button>
          <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>Import</Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importJson(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <header className="rounded-lg border border-line bg-elevated p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
              {tx(locale, "Projectwerkplek", "Project workspace")}
            </p>
            <TextInput
              aria-label={tx(locale, "Projectnaam", "Project name")}
              placeholder={tx(locale, "Naam van het project", "Project name")}
              value={project.name}
              onChange={(e) => patch({ name: e.target.value })}
              className="mt-2 h-auto border-transparent bg-transparent px-0 py-1 font-display text-2xl font-semibold tracking-tight"
            />
            {untitled ? (
              <p className="mt-2 text-sm text-ink">
                {tx(locale, "Geef eerst een naam, daarna de vragen van fase 01.", "Name it first, then the phase 01 questions.")}
              </p>
            ) : null}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label={tx(locale, "Opdrachtgever", "Sponsor")}>
                <TextInput value={project.sponsor} onChange={(e) => patch({ sponsor: e.target.value })} placeholder={tx(locale, "Wie is eigenaar van de business case?", "Who owns the business case?")} />
              </Field>
              <Field label={tx(locale, "Projectmanager", "Project manager")}>
                <TextInput value={project.manager} onChange={(e) => patch({ manager: e.target.value })} />
              </Field>
            </div>
          </div>
          <RagBadge value={project.rag} suggested={suggestedRag} onChange={(rag) => patch({ rag })} />
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-4">
          <Stat label={tx(locale, "Fase", "Phase")} value={locale === "en" ? phase.labelEn : phase.label} />
          <Stat label={tx(locale, "Klaar", "Done")} value={project.percentDone == null ? "\u2014" : `${project.percentDone}%`} />
          <Stat label={tx(locale, "Einddatum", "End date")} value={project.endDate || "\u2014"} />
          <Stat label="Budget" value={`${euro(project.spent)} / ${euro(project.budget)}`} />
        </dl>
        <p className="mt-4 text-sm text-ink">
          Weekstart: {nextAction(project, locale)}
        </p>
        <p className="mt-1 text-sm text-muted">
          Open: {openCount(project.issues)} issues · {openCount(project.changes)} wijzigingen · {project.risks.filter((r) => r.status !== "dicht").length} risico’s
        </p>
      </header>

      <aside className="rounded-lg border border-line bg-elevated p-4 text-sm leading-relaxed text-muted">
        <p className="font-medium text-ink">Kort</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Maandag: naam, vragen van deze fase, plan even nalopen.</li>
          <li>Een fase is de open vraag: kader, opdracht, plan/baseline, stand, decharge.</li>
          <li>Beslispunt is de enige officiële fasezet. Later fases zijn al leesbaar en invulbaar.</li>
          <li>Staat in deze browser. Export bewaart een kopie. Voorbeeld laadt een montagelijn in Oriëntatie.</li>
        </ul>
      </aside>

      {viewPhase !== project.phase ? (
        <p className="rounded-md border border-line bg-elevated px-4 py-3 text-sm text-ink">
          {tx(
            locale,
            `Je kijkt naar ${looking.label}. Officieel sta je in ${phase.label}. Invullen mag; de officiële overgang is Beslispunt.`,
            `You are viewing ${looking.labelEn}. Officially you are in ${phase.labelEn}. Filling in is allowed; the official change is the Gate.`,
          )}
        </p>
      ) : null}

      <PhaseBar
        current={project.phase}
        lookingAt={viewPhase}
        onSelect={(id) => {
          setViewPhase(id);
          setPanel("fase");
        }}
      />

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1" aria-label={tx(locale, "Hoofdacties", "Main actions")}>
          {PRIMARY_TABS.map((tab) => (
            <TabButton key={tab.id} id={tab.id} label={tx(locale, tab.nl, tab.en)} panel={panel} setPanel={setPanel} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1" aria-label="Registers">
          <span className="px-2 font-mono text-[11px] uppercase tracking-wide text-subtle">
            {tx(locale, "Registers", "Registers")}
          </span>
          {REGISTER_TABS.map((tab) => (
            <TabButton key={tab.id} id={tab.id} label={tx(locale, tab.nl, tab.en)} panel={panel} setPanel={setPanel} />
          ))}
        </div>
      </div>

      {panel === "overzicht" ? <OverviewPanel project={project} onOpen={(tab) => setPanel(tab)} patch={patch} setProject={setProject} /> : null}
      {panel === "fase" ? <PhasePanel project={project} patch={patch} setProject={setProject} viewPhase={viewPhase} /> : null}
      {panel === "plan" ? <GanttBoard project={project} setProject={setProject} /> : null}
      {panel === "mensen" ? <StakeholdersPanel project={project} setProject={setProject} /> : null}
      {panel === "risicos" ? <RisksPanel project={project} setProject={setProject} /> : null}
      {panel === "issues" ? <IssuesPanel project={project} setProject={setProject} /> : null}
      {panel === "wijzigingen" ? <ChangesPanel project={project} setProject={setProject} /> : null}
      {panel === "poort" ? <GatePanel project={project} setProject={setProject} /> : null}
      {panel === "templates" ? <TemplatesPanel project={project} setProject={setProject} /> : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-xs text-subtle">Staat in deze browser. Export bewaart een kopie.</p>
        <Button variant="ghost" size="sm" onClick={() => { if (window.confirm("Dit wist het actieve project in deze browser.")) reset(); }}>
          Project wissen
        </Button>
      </div>
    </div>
  );
}
