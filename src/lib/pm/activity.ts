export type ActivityKind = "activiteit" | "mijlpaal";

export type Activity = {
  id: string;
  wbs: string;
  name: string;
  kind: ActivityKind;
  owner: string;
  start: string;
  end: string;
  pct: number | null;
};

export function toDate(iso: string) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function iso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number) {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}

export function mondayOf(d: Date) {
  const x = new Date(d.getTime());
  const day = x.getDay();
  x.setDate(x.getDate() + (day === 0 ? -6 : 1 - day));
  x.setHours(0, 0, 0, 0);
  return x;
}

export function weekStarts(projectStart: string, count = 16) {
  const base = toDate(projectStart) ?? mondayOf(new Date());
  const mon = mondayOf(base);
  return Array.from({ length: count }, (_, i) => addDays(mon, i * 7));
}

export function weekLabel(d: Date) {
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

export function overlapsWeek(weekStart: Date, start: string, end: string) {
  const s = toDate(start);
  const e = toDate(end) ?? s;
  if (!s || !e) return false;
  const weekEnd = addDays(weekStart, 6);
  return s.getTime() <= weekEnd.getTime() && e.getTime() >= weekStart.getTime();
}

export function durationDays(start: string, end: string) {
  const s = toDate(start);
  const e = toDate(end);
  if (!s || !e) return null;
  return Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
}

export function emptyActivity(id: string): Activity {
  return { id, wbs: "", name: "", kind: "activiteit", owner: "", start: "", end: "", pct: 0 };
}
