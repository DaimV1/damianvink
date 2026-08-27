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
import { pageHead } from "@/lib/seo";
import { fmtNl } from "@/lib/utils";

export const Route = createFileRoute("/doe/marathon")({
  head: () =>
    pageHead({
      title: "Marathon — Damian Vink",
      description:
        "Trainingslogboek EDP Porto Marathon 2026 van Damian Vink. Strava-export: weekvolume, cumulatieve kilometers en recente runs.",
      path: "/doe/marathon",
    }),
  component: Marathon,
});
