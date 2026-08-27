import type { PhaseId, Project, Rag } from "@/lib/pm/model";
import { PHASES } from "@/lib/pm/model";
import { cn } from "@/lib/utils";

export function PhaseBar({ current, onSelect }: { current: PhaseId; onSelect: (id: PhaseId) => void }) {
  return (
    <nav aria-label="Projectfasen" className="grid gap-2 sm:grid-cols-5">
      {PHASES.map((p) => {
        const on = p.id === current;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={cn(
              "rounded-lg border px-3 py-3 text-left transition-colors",
              on ? "border-accent bg-accent/10" : "border-line bg-elevated hover:border-line-strong",
            )}
          >
            <span className="font-mono text-[11px] text-accent">{p.n}</span>
            <strong className="mt-1 block text-sm font-medium text-ink">{p.label}</strong>
            <span className="mt-1 block text-xs text-muted">{p.question}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function PhaseIntro({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-subtle">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value}</dd>
    </div>
  );
}

export function RagBadge({
  value, suggested, onChange,
}: { value: Rag; suggested: Rag; onChange: (r: Rag) => void }) {
  return (
    <div className="text-right">
      <p className="text-xs text-subtle">Stand</p>
      <div className="mt-1 flex gap-1">
        {(["groen", "oranje", "rood"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className={cn(
              "rounded-full px-3 py-1 text-xs capitalize",
              value === r ? "bg-accent text-accent-fg" : "border border-line text-muted",
            )}
          >
            {r}
          </button>
        ))}
      </div>
      {suggested !== value ? (
        <p className="mt-1 text-[11px] text-subtle">registers wijzen op {suggested}</p>
      ) : null}
    </div>
  );
}

export function patchList<K extends "stakeholders" | "risks" | "issues" | "changes" | "estimates">(
  setProject: (p: Project | ((prev: Project) => Project)) => void,
  key: K,
  id: string,
  partial: Partial<Project[K][number]>,
) {
  setProject((p) => ({
    ...p,
    [key]: (p[key] as { id: string }[]).map((row) => (row.id === id ? { ...row, ...partial } : row)),
  }));
}
