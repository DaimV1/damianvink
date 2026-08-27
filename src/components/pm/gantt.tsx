import { Field, NumInput, Select, TextInput } from "@/components/pm/fields";
import {
  durationDays,
  emptyActivity,
  overlapsWeek,
  planWeekCount,
  weekLabel,
  weekStarts,
  type Activity,
  type ActivityKind,
} from "@/lib/pm/activity";
import { applyActivityProgress, uid, type Project } from "@/lib/pm/model";

export function GanttBoard({
  project,
  setProject,
}: {
  project: Project;
  setProject: (p: Project | ((prev: Project) => Project)) => void;
}) {
  const activities = project.activities ?? [];
  const weeks = weekStarts(project.startDate, planWeekCount(project.startDate, project.endDate, activities));

  function patch(partial: Partial<Project>) {
    setProject((prev) => ({ ...prev, ...partial }));
  }

  function update(id: string, partial: Partial<Activity>) {
    setProject((prev) => ({
      ...prev,
      activities: (prev.activities ?? []).map((a) => (a.id === id ? { ...a, ...partial } : a)),
    }));
  }

  function addRow(kind: ActivityKind = "activiteit") {
    setProject((prev) => ({
      ...prev,
      activities: [...(prev.activities ?? []), { ...emptyActivity(uid()), kind }],
    }));
  }

  function seed() {
    const start = project.startDate || new Date().toISOString().slice(0, 10);
    const d = (offset: number) => {
      const x = new Date(`${start}T00:00:00`);
      x.setDate(x.getDate() + offset);
      return x.toISOString().slice(0, 10);
    };
    patch({
      startDate: start,
      activities: [
        { id: uid(), wbs: "1", name: "Kick-off", kind: "mijlpaal", owner: project.manager, start: d(0), end: d(0), pct: 0 },
        { id: uid(), wbs: "1.1", name: "Scope vastleggen", kind: "activiteit", owner: project.manager, start: d(1), end: d(10), pct: 0 },
        { id: uid(), wbs: "2.1", name: "WBS en raming", kind: "activiteit", owner: project.manager, start: d(8), end: d(21), pct: 0 },
        { id: uid(), wbs: "2", name: "Baseline", kind: "mijlpaal", owner: project.sponsor, start: d(21), end: d(21), pct: 0 },
        { id: uid(), wbs: "3.1", name: "Uitvoering", kind: "activiteit", owner: "", start: d(22), end: d(70), pct: 0 },
        { id: uid(), wbs: "5", name: "Decharge", kind: "mijlpaal", owner: project.sponsor, start: d(90), end: d(90), pct: 0 },
      ],
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">Gantt</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Vul start, einde, eigenaar en %. De balk volgt de datums; de horizon volgt jouw plan.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="W1 start (maandag)">
            <TextInput
              type="date"
              value={project.startDate}
              onChange={(e) => patch({ startDate: e.target.value })}
            />
          </Field>
          <Field label="Einde">
            <TextInput
              type="date"
              value={project.endDate}
              onChange={(e) => patch({ endDate: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="min-w-[1100px] w-full border-collapse text-sm">
          <thead>
            <tr className="bg-elevated">
              <th className="border-b border-line px-2 py-2 text-left font-medium">WBS</th>
              <th className="border-b border-line px-2 py-2 text-left font-medium">Activiteit</th>
              <th className="border-b border-line px-2 py-2 text-left font-medium">Type</th>
              <th className="border-b border-line px-2 py-2 text-left font-medium">Eigenaar</th>
              <th className="border-b border-line px-2 py-2 text-left font-medium">Start</th>
              <th className="border-b border-line px-2 py-2 text-left font-medium">Einde</th>
              <th className="border-b border-line px-2 py-2 text-left font-medium">%</th>
              <th className="border-b border-line px-2 py-2 text-left font-medium">d</th>
              {weeks.map((w, i) => (
                <th key={i} className="border-b border-line px-1 py-2 text-center font-mono text-[10px] text-muted">
                  W{i + 1}
                  <span className="block font-sans">{weekLabel(w)}</span>
                </th>
              ))}
              <th className="border-b border-line px-2 py-2 text-left font-medium"><span className="sr-only">Weg</span></th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.id}>
                <td className="border-b border-line p-1">
                  <TextInput value={a.wbs} onChange={(e) => update(a.id, { wbs: e.target.value })} className="h-9 min-w-[3rem] px-2" />
                </td>
                <td className="border-b border-line p-1">
                  <TextInput value={a.name} onChange={(e) => update(a.id, { name: e.target.value })} className="h-9 min-w-[10rem] px-2" />
                </td>
                <td className="border-b border-line p-1">
                  <Select
                    value={a.kind}
                    onChange={(e) => update(a.id, { kind: e.target.value as ActivityKind })}
                    className="h-9 min-w-[7rem] px-2"
                  >
                    <option value="activiteit">Activiteit</option>
                    <option value="mijlpaal">Mijlpaal</option>
                  </Select>
                </td>
                <td className="border-b border-line p-1">
                  <TextInput value={a.owner} onChange={(e) => update(a.id, { owner: e.target.value })} className="h-9 min-w-[6rem] px-2" placeholder="Wie" />
                </td>
                <td className="border-b border-line p-1">
                  <TextInput type="date" value={a.start} onChange={(e) => update(a.id, { start: e.target.value, end: a.end || e.target.value })} className="h-9 px-2" />
                </td>
                <td className="border-b border-line p-1">
                  <TextInput type="date" value={a.end} onChange={(e) => update(a.id, { end: e.target.value })} className="h-9 px-2" />
                </td>
                <td className="border-b border-line p-1">
                  <NumInput
                    min={0}
                    max={100}
                    value={a.pct}
                    onValue={(pct) => setProject((p) => applyActivityProgress(p, a.id, pct))}
                    className="h-9 w-16 px-2"
                  />
                </td>
                <td className="border-b border-line px-2 text-center text-muted">{durationDays(a.start, a.end) ?? "\u2014"}</td>
                {weeks.map((w, i) => {
                  const on = overlapsWeek(w, a.start, a.end);
                  return (
                    <td key={i} className="border-b border-line p-0">
                      <div
                        className={
                          on
                            ? a.kind === "mijlpaal"
                              ? "mx-0.5 h-6 rounded-sm bg-accent"
                              : "mx-0.5 h-5 rounded-sm bg-accent/60"
                            : "h-6"
                        }
                      />
                    </td>
                  );
                })}
                <td className="border-b border-line p-1">
                  <button
                    type="button"
                    className="px-2 text-xs text-subtle hover:text-ink"
                    onClick={() =>
                      setProject((prev) => ({
                        ...prev,
                        activities: (prev.activities ?? []).filter((row) => row.id !== a.id),
                      }))
                    }
                  >
                    weg
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => addRow("activiteit")} className="h-11 rounded-full border border-line px-4 text-sm">
          Activiteit
        </button>
        <button type="button" onClick={() => addRow("mijlpaal")} className="h-11 rounded-full border border-line px-4 text-sm">
          Mijlpaal
        </button>
        {activities.length === 0 ? (
          <button type="button" onClick={seed} className="h-11 rounded-full border border-accent bg-accent px-4 text-sm text-accent-fg">
            Voorbeeld vullen
          </button>
        ) : null}
      </div>
    </section>
  );
}
