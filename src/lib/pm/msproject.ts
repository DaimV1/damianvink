import { durationDays, toDate, type Activity } from "@/lib/pm/activity";
import type { Project } from "@/lib/pm/model";

function esc(value: string) {
  return value
    .replaceAll("&", "&" + "amp;")
    .replaceAll("<", "&" + "lt;")
    .replaceAll(">", "&" + "gt;");
}

function stamp(isoDate: string, endOfDay = false) {
  if (!isoDate) return "";
  return `${isoDate}T${endOfDay ? "17:00:00" : "08:00:00"}`;
}

function workingDays(start: string, end: string) {
  const s = toDate(start);
  const e = toDate(end) ?? s;
  if (!s || !e) return 1;
  let n = 0;
  const d = new Date(s.getTime());
  while (d.getTime() <= e.getTime()) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) n += 1;
    d.setDate(d.getDate() + 1);
  }
  return Math.max(n, 1);
}

function weekDays() {
  const work =
    "<WorkingTimes><WorkingTime><FromTime>08:00:00</FromTime><ToTime>12:00:00</ToTime></WorkingTime><WorkingTime><FromTime>13:00:00</FromTime><ToTime>17:00:00</ToTime></WorkingTime></WorkingTimes>";
  return [1, 2, 3, 4, 5, 6, 7]
    .map((day) => {
      const working = day >= 2 && day <= 6;
      return `<WeekDay><DayType>${day}</DayType><DayWorking>${working ? 1 : 0}</DayWorking>${working ? work : ""}</WeekDay>`;
    })
    .join("");
}

function taskXml(a: Activity, uid: number, id: number) {
  const milestone = a.kind === "mijlpaal";
  const start = a.start || a.end;
  const end = a.end || a.start;
  const days = milestone ? 0 : workingDays(start, end);
  const hours = days * 8;
  const duration = milestone ? "PT0H0M0S" : `PT${hours}H0M0S`;
  const startStamp = stamp(start, false);
  const finishStamp = stamp(end, !milestone);
  const outline = a.wbs.includes(".") ? 2 : 1;
  return `<Task>
<UID>${uid}</UID>
<ID>${id}</ID>
<Name>${esc(a.name || a.wbs || `Taak ${id}`)}</Name>
<Type>1</Type>
<WBS>${esc(a.wbs)}</WBS>
<OutlineNumber>${esc(a.wbs || String(id))}</OutlineNumber>
<OutlineLevel>${outline}</OutlineLevel>
<Priority>500</Priority>
<Start>${startStamp}</Start>
<Finish>${finishStamp}</Finish>
<ManualStart>${startStamp}</ManualStart>
<ManualFinish>${finishStamp}</ManualFinish>
<Duration>${duration}</Duration>
<ManualDuration>${duration}</ManualDuration>
<DurationFormat>7</DurationFormat>
<Milestone>${milestone ? 1 : 0}</Milestone>
<Manual>1</Manual>
<Summary>0</Summary>
<Estimated>0</Estimated>
<PercentComplete>${Math.max(0, Math.min(100, a.pct ?? 0))}</PercentComplete>
<ConstraintType>0</ConstraintType>
<CalendarUID>1</CalendarUID>
</Task>`;
}

export function buildMsProjectXml(p: Project) {
  const acts = (p.activities ?? []).filter((a) => a.name || a.start || a.end);
  const starts = acts.map((a) => a.start).filter(Boolean).sort();
  const ends = acts.map((a) => a.end || a.start).filter(Boolean).sort();
  const projectStart = p.startDate || starts[0] || new Date().toISOString().slice(0, 10);
  const projectFinish = p.endDate || ends[ends.length - 1] || projectStart;
  const title = p.name || "Projectplanning";
  const summaryDuration = durationDays(projectStart, projectFinish) ?? 1;
  const tasks = [
    `<Task>
<UID>0</UID>
<ID>0</ID>
<Name>${esc(title)}</Name>
<Type>1</Type>
<OutlineNumber>0</OutlineNumber>
<OutlineLevel>0</OutlineLevel>
<Priority>500</Priority>
<Start>${stamp(projectStart)}</Start>
<Finish>${stamp(projectFinish, true)}</Finish>
<Duration>PT${Math.max(summaryDuration, 1) * 8}H0M0S</Duration>
<DurationFormat>7</DurationFormat>
<Milestone>0</Milestone>
<Summary>1</Summary>
<Manual>0</Manual>
<CalendarUID>1</CalendarUID>
</Task>`,
    ...acts.map((a, i) => taskXml(a, i + 1, i + 1)),
  ].join("\n");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Project xmlns="http://schemas.microsoft.com/project">
<SaveVersion>14</SaveVersion>
<Name>${esc(title)}.xml</Name>
<Title>${esc(title)}</Title>
<Manager>${esc(p.manager)}</Manager>
<Author>${esc(p.manager)}</Author>
<CreationDate>${stamp(new Date().toISOString().slice(0, 10))}</CreationDate>
<ScheduleFromStart>1</ScheduleFromStart>
<StartDate>${stamp(projectStart)}</StartDate>
<FinishDate>${stamp(projectFinish, true)}</FinishDate>
<CalendarUID>1</CalendarUID>
<DefaultStartTime>08:00:00</DefaultStartTime>
<DefaultFinishTime>17:00:00</DefaultFinishTime>
<MinutesPerDay>480</MinutesPerDay>
<MinutesPerWeek>2400</MinutesPerWeek>
<DaysPerMonth>20</DaysPerMonth>
<DefaultTaskType>1</DefaultTaskType>
<NewTasksAreManual>1</NewTasksAreManual>
<WeekStartDay>1</WeekStartDay>
<CurrencyDigits>2</CurrencyDigits>
<CurrencySymbol>EUR</CurrencySymbol>
<CurrencyCode>EUR</CurrencyCode>
<Calendars>
<Calendar>
<UID>1</UID>
<Name>Standaard</Name>
<IsBaseCalendar>1</IsBaseCalendar>
<BaseCalendarUID>-1</BaseCalendarUID>
<WeekDays>${weekDays()}</WeekDays>
</Calendar>
</Calendars>
<Tasks>
${tasks}
</Tasks>
</Project>`;
}

export function downloadMsProject(p: Project) {
  const xml = buildMsProjectXml(p);
  const blob = new Blob([xml], { type: "text/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const slug = (p.name || "planning").replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-|-$/g, "") || "planning";
  a.download = `${slug}.xml`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
