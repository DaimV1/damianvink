import { gateBrief, topRisks, type Project } from "@/lib/pm/model";
import {
  durationDays,
  overlapsWeek,
  weekLabel,
  weekStarts,
  type Activity,
} from "@/lib/pm/activity";

function esc(value: string) {
  return value.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}

function download(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const wordMime = "application/msword";
const excelMime = "application/vnd.ms-excel";

function wrapWord(title: string, body: string) {
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"/><title>${esc(title)}</title>
<style>
@page { size: A4; margin: 1.8cm; }
body { font-family: Calibri, Arial, sans-serif; color: #111827; font-size: 11pt; line-height: 1.35; }
h1 { color: #1D4ED8; font-size: 22pt; margin: 0 0 4pt; }
h2 { color: #1D4ED8; font-size: 14pt; margin: 16pt 0 6pt; }
.lede { color: #6B7280; margin-bottom: 14pt; }
table { border-collapse: collapse; width: 100%; margin: 0 0 12pt; }
th { background: #1D4ED8; color: #fff; text-align: left; padding: 6px 8px; }
td { border: 1px solid #D1D5DB; padding: 6px 8px; vertical-align: top; }
.meta td:nth-child(odd) { background: #F3F4F6; font-weight: 600; width: 22%; }
</style></head><body>${body}</body></html>`;
}

function wrapExcel(title: string, body: string) {
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/><title>${esc(title)}</title>
<style>
table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
th { background: #1D4ED8; color: #fff; font-weight: 600; border: 1px solid #1E40AF; padding: 6px 8px; text-align: center; }
td { border: 1px solid #D1D5DB; padding: 6px 8px; }
h1 { font-family: Calibri, Arial, sans-serif; color: #1D4ED8; font-size: 18pt; }
.note { color: #6B7280; font-size: 10pt; }
.meta td { background: #FEF3C7; }
.bar { background: #93C5FD; color: #1D4ED8; text-align: center; }
.ms { background: #1D4ED8; color: #fff; text-align: center; font-weight: 700; }
.wd { font-weight: 400; font-size: 8pt; }
</style></head><body>${body}</body></html>`;
}

const today = () => new Date().toLocaleDateString("nl-NL");

export function downloadKickOff(p: Project) {
  const html = wrapWord(
    "Project kick-off",
    `<h1>Project kick-off</h1>
<p class="lede">Ingevuld vanuit de projectwerkplek.</p>
<table class="meta">
<tr><td>Project</td><td>${esc(p.name)}</td><td>Datum</td><td>${esc(today())}</td></tr>
<tr><td>Opdrachtgever</td><td>${esc(p.sponsor)}</td><td>Projectmanager</td><td>${esc(p.manager)}</td></tr>
</table>
<h2>Resultaat / uitkomst / doel</h2>
<table>
<tr><th>Laag</th><th>Tekst</th></tr>
<tr><td>Resultaat</td><td>${esc(p.result)}</td></tr>
<tr><td>Uitkomst</td><td>${esc(p.outcome)}</td></tr>
<tr><td>Doel</td><td>${esc(p.goal)}</td></tr>
</table>
<h2>Scope</h2>
<table>
<tr><th>In</th><th>Uit</th></tr>
<tr><td>${esc(p.scopeIn)}</td><td>${esc(p.scopeOut)}</td></tr>
</table>`,
  );
  download("kick-off.doc", wordMime, html);
}

export function downloadWbs(p: Project) {
  const rows = (p.activities ?? []).map(
    (a) =>
      `<tr><td>${esc(a.wbs)}</td><td>${esc(a.name)}</td><td>${esc(a.kind)}</td><td>${esc(a.owner)}</td><td>${a.start}</td><td>${a.end}</td><td>${durationDays(a.start, a.end) ?? ""}</td><td>${a.pct ?? ""}</td></tr>`,
  );
  const extra = Array.from({ length: Math.max(0, 6 - rows.length) }, () => "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>");
  download(
    "wbs.xls",
    excelMime,
    wrapExcel(
      "WBS",
      `<h1>WBS</h1><table><tr class="meta"><td>Project</td><td>${esc(p.name)}</td></tr></table><br/><table><tr><th>WBS</th><th>Werkpakket</th><th>Type</th><th>Eigenaar</th><th>Start</th><th>Einde</th><th>Duur</th><th>%</th></tr>${rows.join("")}${extra.join("")}</table>`,
    ),
  );
}

export function downloadPlanning(p: Project) {
  const rows = (p.activities ?? []).map(
    (a, i) =>
      `<tr><td>${i + 1}</td><td>${esc(a.wbs)}</td><td>${esc(a.name)}</td><td>${esc(a.kind)}</td><td>${esc(a.owner)}</td><td>${a.start}</td><td>${a.end}</td><td>${durationDays(a.start, a.end) ?? ""}</td><td>${a.pct ?? 0}</td></tr>`,
  );
  const extra = Array.from({ length: Math.max(0, 6 - rows.length) }, () => "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>");
  download(
    "projectplanning.xls",
    excelMime,
    wrapExcel(
      "Projectplanning",
      `<h1>Projectplanning</h1><table><tr class="meta"><td>Project</td><td>${esc(p.name)}</td><td>Start</td><td>${esc(p.startDate)}</td></tr></table><br/><table><tr><th>ID</th><th>WBS</th><th>Activiteit</th><th>Type</th><th>Eigenaar</th><th>Start</th><th>Einde</th><th>Duur</th><th>%</th></tr>${rows.join("")}${extra.join("")}</table>`,
    ),
  );
}

export function downloadGantt(p: Project) {
  const weeks = weekStarts(p.startDate, 16);
  const acts: Activity[] = p.activities ?? [];
  const head = weeks.map((w, i) => `<th>W${i + 1}<br/><span class="wd">${esc(weekLabel(w))}</span></th>`).join("");
  const rows = acts.map((a) => {
    const bars = weeks
      .map((w) => {
        if (!overlapsWeek(w, a.start, a.end)) return "<td></td>";
        return a.kind === "mijlpaal" ? '<td class="ms">D</td>' : '<td class="bar">X</td>';
      })
      .join("");
    return `<tr><td>${esc(a.wbs)}</td><td>${esc(a.name)}</td><td>${esc(a.kind)}</td><td>${a.start}</td><td>${a.end}</td><td>${durationDays(a.start, a.end) ?? ""}</td>${bars}</tr>`;
  });
  download(
    "gantt.xls",
    excelMime,
    wrapExcel(
      "Gantt-planning",
      `<h1>Gantt-planning</h1><table><tr class="meta"><td>Project</td><td>${esc(p.name)}</td><td>W1</td><td>${esc(p.startDate)}</td></tr></table><br/><table><tr><th>WBS</th><th>Activiteit</th><th>Type</th><th>Start</th><th>Einde</th><th>Duur</th>${head}</tr>${rows.join("")}</table><p class="note">Balken berekend uit start en einde. Download opnieuw na een wijziging.</p>`,
    ),
  );
}

export function downloadWeekstatus(p: Project) {
  const risks = topRisks(p.risks, 5);
  const issues = p.issues.filter((i) => i.status !== "dicht");
  const riskRows = risks.length
    ? risks.map((r) => `<tr><td>${esc(r.event || r.source)}</td><td>${esc(r.effect)}</td><td>${esc(r.owner)}</td></tr>`).join("")
    : "<tr><td colspan='3'>Geen open risico's</td></tr>";
  const issueRows = issues.length
    ? issues.map((i) => `<tr><td>${esc(i.title)}</td><td>${esc(i.owner)}</td><td>${esc(i.due)}</td></tr>`).join("")
    : "<tr><td colspan='3'>Geen open issues</td></tr>";
  download(
    "weekstatus.doc",
    wordMime,
    wrapWord(
      "Weekstatus",
      `<h1>Weekstatus</h1>
<table class="meta">
<tr><td>Project</td><td>${esc(p.name)}</td><td>Datum</td><td>${esc(today())}</td></tr>
<tr><td>Stand</td><td>${esc(p.rag.toUpperCase())} · ${p.percentDone ?? "-"}%</td><td>Einde</td><td>${esc(p.endDate)}</td></tr>
</table>
<h2>Toprisico's</h2>
<table><tr><th>Gebeurtenis</th><th>Effect</th><th>Eigenaar</th></tr>${riskRows}</table>
<h2>Open issues</h2>
<table><tr><th>Issue</th><th>Eigenaar</th><th>Datum</th></tr>${issueRows}</table>`,
    ),
  );
}

export function downloadBeslispunt(p: Project) {
  const brief = gateBrief(p).split("\n").map((line) => `<p>${esc(line) || "&nbsp;"}</p>`).join("");
  download(
    "beslispunt.doc",
    wordMime,
    wrapWord(
      "Beslispunt",
      `<h1>Beslispunt</h1>${brief}<h2>Besluit</h2><table><tr><th>Advies</th><th>Besluit</th><th>Wie</th><th>Datum</th></tr><tr><td></td><td></td><td>${esc(p.sponsor)}</td><td>${esc(today())}</td></tr></table>`,
    ),
  );
}

export const GENERATORS = {
  "kick-off": downloadKickOff,
  wbs: downloadWbs,
  planning: downloadPlanning,
  gantt: downloadGantt,
  weekstatus: downloadWeekstatus,
  beslispunt: downloadBeslispunt,
} as const;
