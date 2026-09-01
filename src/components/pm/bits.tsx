import type { PhaseId, Project, Rag } from "@/lib/pm/model";
import { PHASES } from "@/lib/pm/model";
import { tx, useLocale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";

export function PhaseBar({
  current,
  lookingAt,
  onSelect,
}: {
  current: PhaseId;
  lookingAt?: PhaseId;
  onSelect?: (id: PhaseId) => void;
}) {
  const { locale } = useLocale();
  const view = lookingAt ?? current;
  return (
    <nav aria-label={tx(locale, "Projectfasen", "Project phases")} className="grid grid-cols-5 gap-2">
      {PHASES.map((p) => {
        const official = p.id === current;
        const looking = p.id === view && view !== current;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect?.(p.id)}
            className={cn(
              "rounded-lg border px-2 py-2 text-left transition-colors sm:px-3 sm:py-3",
              official
                ? "border-accent bg-accent/10"
                : looking
                  ? "border-accent bg-elevated ring-2 ring-accent"
                  : "border-line bg-elevated hover:border-line-strong",
            )}
          >
            <span className="flex items-center justify-between gap-1">
              <span className="font-mono text-[11px] text-accent">{p.n}</span>
              {official ? <span className="font-mono text-[9px] uppercase tracking-wide text-accent">{tx(locale, "hier", "here")}</span> : null}
            </span>
            <strong className="mt-1 block text-[11px] font-medium leading-tight text-ink sm:text-sm">{locale === "en" ? p.labelEn : p.label}</strong>
            <span className="mt-1 hidden text-xs text-muted sm:block">{locale === "en" ? p.questionEn : p.question}</span>
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
  const { locale } = useLocale();
  const ragLabel = { groen: tx(locale, "groen", "green"), oranje: tx(locale, "oranje", "amber"), rood: tx(locale, "rood", "red") };
  return (
    <div className="text-right">
      <p className="text-xs text-subtle">{tx(locale, "Stand", "Status")}</p>
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
            {ragLabel[r]}
          </button>
        ))}
      </div>
      {suggested !== value ? (
        <p className="mt-1 text-[11px] text-subtle">
          {tx(locale, "registers wijzen op", "registers point to")} {ragLabel[suggested]}
        </p>
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
