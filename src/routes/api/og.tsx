import { createFileRoute } from "@tanstack/react-router";
import { OgCard } from "@/lib/og/card";
import { ogSummary } from "@/lib/og/summary";
import { renderOgImage } from "@/lib/og/render";
import { TOOLS } from "@/lib/toolkit/tools";

/**
 * Share card for a toolkit page: /api/og?tool=<id>&<the page's own params>.
 *
 * The query string is the page's, verbatim — the card is generated from the
 * same inputs the visitor shared, so a pasted deep link previews the actual
 * result instead of the generic site image.
 */
export const Route = createFileRoute("/api/og")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const toolId = url.searchParams.get("tool") ?? "";
        if (!TOOLS.some((t) => t.id === toolId)) {
          return new Response("unknown tool", { status: 404 });
        }

        const search: Record<string, string> = {};
        for (const [key, value] of url.searchParams) {
          if (key !== "tool") search[key] = value;
        }

        const summary = ogSummary(toolId, search);
        if (!summary) return new Response("unknown tool", { status: 404 });

        try {
          return await renderOgImage(<OgCard summary={summary} />);
        } catch (err) {
          // A broken card must never break the page that links to it — the
          // crawler just falls back to no image.
          console.error("[og] render failed:", err);
          return new Response("og render failed", { status: 500 });
        }
      },
    },
  },
});
