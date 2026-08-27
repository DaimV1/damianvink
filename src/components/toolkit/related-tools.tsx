import { Link } from "@tanstack/react-router";
import { TOOLS, type ToolId } from "@/lib/toolkit/tools";

export function RelatedTools({ active }: { active: ToolId }) {
  const current = TOOLS.find((tool) => tool.id === active);
  if (!current || current.related.length === 0) return null;
  const related = current.related
    .map((id) => TOOLS.find((tool) => tool.id === id))
    .filter((tool): tool is (typeof TOOLS)[number] => Boolean(tool));
  if (related.length === 0) return null;

  return (
    <aside className="mt-12 border-t border-line pt-8" aria-label="Gerelateerde tools">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Ook in de toolkit</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {related.map((tool) => (
          <li key={tool.id}>
            <Link
              to={tool.href}
              className="block rounded-lg border border-line bg-elevated p-4 transition-colors duration-150 hover:border-line-strong"
            >
              <strong className="block font-display text-base font-semibold tracking-tight text-ink">
                {tool.title}
              </strong>
              <small className="mt-1 block text-sm text-muted">
                {tool.standard} · {tool.kind === "naslag" ? "Naslag" : "Rekenhulp"}
              </small>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
