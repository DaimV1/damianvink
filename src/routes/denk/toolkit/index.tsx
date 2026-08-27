import { createFileRoute, Link } from "@tanstack/react-router";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { TOOLS } from "@/lib/toolkit/tools";

export const Route = createFileRoute("/denk/toolkit/")({
  head: () => ({ meta: [{ title: "Engineering toolkit — Damian Vink" }] }),
  component: ToolkitIndex,
});

function ToolkitIndex() {
  return (
    <ToolkitFrame
      crumbs={[
        { href: "/heb", label: "Wat ik heb" },
        { label: "Engineering toolkit" },
      ]}
      before="Engineering"
      last="toolkit."
      lede="Tabellen en links die ik tijdens ontwerp gebruik. Open een tool: de rekenhulp staat bovenaan, de naslag eronder. Wisselen gaat via de balk."
    >
      <div className="grid gap-3">
        {TOOLS.map((tool, i) => (
          <Link
            key={tool.id}
            to={tool.href}
            className="flex items-center justify-between gap-4 rounded-lg border border-line bg-elevated p-5 transition-colors duration-150 hover:border-line-strong"
          >
            <span>
              <span className="font-mono text-xs text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <strong className="mt-1 block font-display text-lg font-semibold tracking-tight text-ink">
                {tool.title}
              </strong>
              <small className="mt-1 block text-sm text-muted">{tool.blurb}</small>
            </span>
            <span aria-hidden="true" className="text-accent">
              →
            </span>
          </Link>
        ))}
      </div>
    </ToolkitFrame>
  );
}
