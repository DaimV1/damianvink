import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CalcPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-line-strong bg-elevated p-5 shadow-[var(--shadow)] sm:p-7",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm text-muted">
      {label}
      {children}
    </label>
  );
}

const controlClass =
  "h-12 w-full rounded-md border border-line-strong bg-paper px-3 font-mono text-base text-ink tabular-nums outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-2 focus:ring-accent/30";

/** Keep one decimal separator visible so 20,5 does not become 205. */
export function sanitizeDiameterInput(raw: string) {
  let v = raw.replace(/[^\d.,]/g, "");
  const sep = v.search(/[.,]/);
  if (sep >= 0) {
    const mark = v[sep];
    v = v.slice(0, sep + 1) + v.slice(sep + 1).replace(/[.,]/g, "");
    const [head, tail = ""] = v.split(mark);
    return `${head.slice(0, 4)}${mark}${tail.slice(0, 2)}`;
  }
  return v.slice(0, 4);
}

export function parseWholeMm(raw: string): { status: "empty" } | { status: "fraction" } | { status: "ok"; mm: number } {
  const t = raw.trim();
  if (t === "") return { status: "empty" };
  const n = t.replace(",", ".");
  if (!/^\d+(\.0*)?$/.test(n)) return { status: "fraction" };
  const mm = Number.parseInt(n, 10);
  if (!Number.isFinite(mm)) return { status: "fraction" };
  return { status: "ok", mm };
}

export function NumInput({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      spellCheck={false}
      value={value}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => onChange(sanitizeDiameterInput(e.target.value))}
      className={controlClass}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  children,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn(controlClass, "disabled:opacity-50")}
    >
      {children}
    </select>
  );
}

export function ResultGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="mt-5 grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-md border border-line bg-paper px-4 py-3"
        >
          <dt className="text-xs uppercase tracking-wide text-muted">{item.label}</dt>
          <dd className="mt-1 font-mono text-lg tabular-nums text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CopyResult({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      className="mt-5"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          window.setTimeout(() => setDone(false), 1600);
        } catch {
          /* ignore */
        }
      }}
    >
      {done ? <Check className="size-4" /> : <Copy className="size-4" />}
      {done ? "Gekopieerd" : "Kopieer resultaat"}
    </Button>
  );
}

export function KindDot({ kind }: { kind: "los" | "overgang" | "lijn" | "vast" }) {
  return (
    <span
      className={cn(
        "inline-block size-2.5 rounded-full",
        kind === "los" && "bg-fit-los",
        kind === "overgang" && "bg-fit-overgang",
        kind === "lijn" && "bg-fit-lijn",
        kind === "vast" && "bg-fit-vast",
      )}
      aria-hidden="true"
    />
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-sm leading-relaxed text-muted">{children}</p>;
}

export function Faq({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        Vragen
      </h2>
      <div className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line bg-elevated">
        {items.map((item) => (
          <details key={item.q} className="group px-4 py-1">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-2 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
              {item.q}
              <span className="text-subtle transition-transform duration-150 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="pb-4 text-sm leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
