import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-sm font-medium text-ink">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-muted">{hint}</span> : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const control =
  "w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:border-line-strong";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(control, "h-11", props.className)} />;
}

export function Area(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      {...props}
      className={cn(control, "min-h-[5.5rem] resize-y", props.className)}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(control, "h-11", props.className)} />;
}

export function NumInput({
  value,
  onValue,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: number | null;
  onValue: (n: number | null) => void;
}) {
  return (
    <input
      {...props}
      type="number"
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        onValue(v === "" ? null : Number(v));
      }}
      className={cn(control, "h-11", props.className)}
    />
  );
}

export function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-elevated p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
