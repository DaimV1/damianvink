import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/denk/toolkit/bronnen")({
  head: () =>
    pageHead({
      title: "CAD-bibliotheken — Damian Vink",
      description:
        "CAD-bibliotheken en naslag voor machinebouw: TraceParts, 3Dfindit, MISUMI, 247 Tailor Steel, SKF, ISO OBP.",
      path: "/denk/toolkit/bronnen",
    }),
  component: BronnenPage,
});
