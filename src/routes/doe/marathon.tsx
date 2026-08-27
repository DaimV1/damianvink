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
import { fmtNl } from "@/lib/utils";

export const Route = createFileRoute("/doe/marathon")({
  head: () => ({ meta: [{ title: "Marathon — Damian Vink" }] }),
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

function Marathon() {
  const all = strava.totals_all;
  const plan = strava.totals;
  const longest = longestFromCumulative(strava.cumulative);
  const weekMax = Math.max(...strava.weekly.map((w) => w.km), 1);
  const weekSum = strava.weekly.reduce((s, w) => s + w.km, 0);
  const last = strava.cumulative[strava.cumulative.length - 1];

  return (
    <SiteShell>
      <PageWrap wide>
        <Breadcrumb
          items={[
            { href: "/doe", label: "Wat ik doe" },
            { label: "Marathon" },
          ]}
        />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          Wat ik doe
        </p>
        <DisplayTitle before="Mara" last="thon." className="mt-3" />
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          Trainingsdata uit een Strava-export. Eerst het totaal van alle
          hardloopsessies in die export, daaronder het trainingsblok richting de
          EDP Porto Marathon (runs vanaf 3 juni 2026).
        </p>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Totaaloverzicht
          </h2>
          <p className="mt-1 text-sm text-muted">Alle hardloopsessies in de Strava-export.</p>
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
              return (
                <div
                  key={w.label}
                  className={`week-bar ${now ? "is-now" : ""}`}
                  style={{ ["--h" as string]: `${pct}%` }}
                  title={`${w.label}: ${fmtNl(w.km, 1)} km`}
                >
                  <span className="wb-val">{fmtNl(w.km, 1)}</span>
                  <span className="wb-col" />
                  <span className="wb-lab">{w.label}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-subtle">
            {strava.weekly.length} weken · plantsom {fmtNl(plan.distance_km, 1)} km
            (som van de weekstaven {fmtNl(weekSum, 1)} km door afronding op 1
            decimaal).
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
