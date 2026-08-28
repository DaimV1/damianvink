import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DisplayTitle } from "@/components/display-title";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import strava from "@/data/strava.json";
import { tx, useLocale } from "@/lib/i18n/locale";
import { pageHead } from "@/lib/seo";
import { fmtNl } from "@/lib/utils";

export const Route = createFileRoute("/marathon")({
  head: () =>
    pageHead({
      title: "Marathon — Damian Vink",
      description:
        "Trainingslogboek EDP Porto Marathon, 8 november 2026. Strava-export: weekvolume, herstelweken en recente runs.",
      path: "/marathon",
    }),
  component: Marathon,
});

function longestFromCumulative(points: { km: number }[]) {
  let max = 0;
  let prev = 0;
  for (const p of points) {
    const d = p.km - prev;
    if (d > max) max = d;
    prev = p.km;
  }
  return max;
}

function fmtLongDate(iso: string, locale: "nl" | "en") {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(locale === "en" ? "en-GB" : "nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function weeksBetween(fromIso: string, toIso: string) {
  const from = Date.parse(`${fromIso}T12:00:00`);
  const to = Date.parse(`${toIso}T12:00:00`);
  return Math.max(0, Math.round((to - from) / (7 * 86400000)));
}

function Marathon() {
  const { locale } = useLocale();
  const all = strava.totals_all;
  const plan = strava.totals;
  const longest = longestFromCumulative(strava.cumulative);
  const weekMax = Math.max(...strava.weekly.map((w) => w.km), 1);
  const weekSum = strava.weekly.reduce((s, w) => s + w.km, 0);
  const last = strava.cumulative[strava.cumulative.length - 1];
  const raceDate = strava.plan.race;
  const weeksLeft = weeksBetween(strava.updated, raceDate);

  return (
    <SiteShell>
      <PageWrap wide>
        <Breadcrumb items={[{ label: "Marathon" }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          {tx(locale, "Logboek", "Log")}
        </p>
        <DisplayTitle text="Marathon." accent="thon." className="mt-3" />
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          {tx(
            locale,
            `Opbouw naar de EDP Porto Marathon op ${fmtLongDate(raceDate, locale)}. Cijfers komen uit een Strava-export (bijgewerkt ${strava.updated}). Namen in de tabel zijn het plan; de kilometers zijn wat er gelopen is.`,
            `Build-up to the EDP Porto Marathon on ${fmtLongDate(raceDate, locale)}. Figures come from a Strava export (updated ${strava.updated}). Names in the table are the plan; kilometres are what was run.`,
          )}
        </p>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {tx(locale, "Wedstrijd", "Race")}
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label={tx(locale, "Wedstrijd", "Race")} value="Porto" unit="EDP Marathon" />
            <Kpi label={tx(locale, "Datum", "Date")} value={tx(locale, "8 nov", "8 Nov")} unit="2026" />
            <Kpi label={tx(locale, "Afstand", "Distance")} value={fmtNl(strava.plan.distance_km, 3)} unit="km" />
            <Kpi label={tx(locale, "Nog", "Left")} value={String(weeksLeft)} unit={tx(locale, "weken", "weeks")} />
          </div>
          <p className="mt-3 text-sm text-muted">
            {tx(
              locale,
              `Blok vanaf ${fmtLongDate(strava.plan.start, locale)}. Geen doeltijd vastgelegd; het kader is uitlopen in Porto. W32 is een herstelweek, geen dip zonder reden.`,
              `Block from ${fmtLongDate(strava.plan.start, locale)}. No target time; the frame is finishing in Porto. W32 is a recovery week, not a dip without a reason.`,
            )}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {tx(locale, "Totaaloverzicht", "Totals")}
          </h2>
          <p className="mt-1 text-sm text-muted">{tx(locale, "Alle hardloopsessies in de Strava-export.", "All running sessions in the Strava export.")}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Afstand" value={fmtNl(all.distance_km, 1)} unit="km" />
            <Kpi label="Activiteiten" value={String(all.activities)} unit="stuks" />
            <Kpi label="Tijd in beweging" value={fmtNl(all.moving_time_h, 1)} unit="uur" />
            <Kpi label="Hoogtemeters" value={fmtNl(all.elevation_m, 0)} unit="m" />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Trainingsblok · EDP Porto Marathon
          </h2>
          <p className="mt-1 text-sm text-muted">
            {strava.plan.note} · bron: {strava.source} · bijgewerkt {strava.updated}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
            <Kpi label="Afstand plan" value={fmtNl(plan.distance_km, 1)} unit="km" />
            <Kpi label="Runs" value={String(plan.activities)} unit="stuks" />
            <Kpi label="Tijd in beweging" value={fmtNl(plan.moving_time_h, 1)} unit="uur" />
            <Kpi label="Gem. tempo" value={strava.avg_pace} unit="min/km" />
            <Kpi label="Hoogtemeters plan" value={fmtNl(plan.elevation_m, 0)} unit="m" />
            <Kpi label="Langste run" value={fmtNl(longest, 1)} unit="km" />
          </div>

          <h3 className="mt-10 font-display text-lg font-semibold">Weekvolume (km)</h3>
          <div className="mt-4 flex gap-2 overflow-x-auto rounded-xl border border-line bg-elevated p-4">
            {strava.weekly.map((w, i) => {
              const pct = Math.max(8, Math.round((w.km / weekMax) * 100));
              const now = i === strava.weekly.length - 1;
              const rest = "herstel" in w && w.herstel;
              return (
                <div
                  key={w.label}
                  className={`week-bar ${now ? "is-now" : ""} ${rest ? "is-rest" : ""}`}
                  style={{ ["--h" as string]: `${pct}%` }}
                  title={`${w.label}: ${fmtNl(w.km, 1)} km${rest ? " · herstelweek" : ""}`}
                >
                  <span className="wb-val">{fmtNl(w.km, 1)}</span>
                  <span className="wb-col" />
                  <span className="wb-lab">{rest ? `${w.label}*` : w.label}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-subtle">
            {strava.weekly.length} weken · plantsom {fmtNl(plan.distance_km, 1)} km
            (som van de weekstaven {fmtNl(weekSum, 1)} km door afronding op 1
            decimaal). * herstelweek.
          </p>

          <h3 className="mt-10 font-display text-lg font-semibold">
            Cumulatieve kilometers
          </h3>
          <div className="mt-4 h-56 rounded-xl border border-line bg-elevated p-3 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={strava.cumulative} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "var(--ink-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={40}
                />
                <YAxis
                  tick={{ fill: "var(--ink-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--paper-elevated)",
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    color: "var(--ink)",
                  }}
                  formatter={(value) => [`${fmtNl(Number(value), 1)} km`, "Cumulatief"]}
                />
                <Area
                  type="monotone"
                  dataKey="km"
                  stroke="var(--accent)"
                  fill="color-mix(in oklab, var(--accent) 22%, transparent)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-xs text-subtle">
            Opbouw tot {fmtNl(last.km, 1)} km sinds {strava.plan.start}.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Recente trainingen in het plan
          </h2>
          <p className="mt-1 text-sm text-muted">
            Kolom Training is de sessienaam uit het plan; Afstand is gelopen.
          </p>
          <div className="table-scroll mt-4">
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Training</th>
                  <th>Afstand</th>
                  <th>Tijd</th>
                </tr>
              </thead>
              <tbody>
                {strava.recent.map((r) => (
                  <tr key={r.date + r.type}>
                    <td>{r.date}</td>
                    <td>{r.type}</td>
                    <td>{fmtNl(r.km, 1)} km</td>
                    <td>{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </PageWrap>
    </SiteShell>
  );
}

function Kpi({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <article className="rounded-lg border border-line bg-elevated px-4 py-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums tracking-tight text-ink">
        {value}
        <span className="ml-1.5 font-sans text-sm font-normal text-muted">{unit}</span>
      </p>
    </article>
  );
}
