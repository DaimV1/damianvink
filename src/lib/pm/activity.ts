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

export function weekLabel(d: Date, locale: "nl" | "en" = "nl") {
  return d.toLocaleDateString(locale === "en" ? "en-GB" : "nl-NL", { day: "numeric", month: "short" });
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

/** Horizon follows the live plan, not a 16-week screenshot. */
export function planWeekCount(
  projectStart: string,
  projectEnd: string,
  activities: { start: string; end: string }[],
  min = 8,
  max = 40,
) {
  const dates: Date[] = [];
  const s = toDate(projectStart);
  const e = toDate(projectEnd);
  if (s) dates.push(s);
  if (e) dates.push(e);
  for (const a of activities) {
    const as = toDate(a.start);
    const ae = toDate(a.end);
    if (as) dates.push(as);
    if (ae) dates.push(ae);
  }
  if (!dates.length) return min;
  const origin = mondayOf(s ?? dates.reduce((a, b) => (a.getTime() < b.getTime() ? a : b)));
  const last = dates.reduce((a, b) => (a.getTime() > b.getTime() ? a : b));
  const weeks = Math.ceil((last.getTime() - origin.getTime()) / (7 * 86400000)) + 1;
  return Math.min(max, Math.max(min, weeks));
}
