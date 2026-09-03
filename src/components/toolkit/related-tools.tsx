import { Link } from "@tanstack/react-router";
import { tx, useLocale } from "@/lib/i18n/locale";
import { TOOLS, type ToolId, toolKindLabel, toolTitle } from "@/lib/toolkit/tools";

export function RelatedTools({ active }: { active: ToolId }) {
  const { locale } = useLocale();
  const current = TOOLS.find((tool) => tool.id === active);
  if (!current) return null;
  const related = current.related
    .map((id) => TOOLS.find((tool) => tool.id === id))
    .filter((tool): tool is (typeof TOOLS)[number] => Boolean(tool));
  if (related.length === 0) return null;

  return (
    <aside
      className="mt-12 border-t border-line pt-8 print:hidden"
      aria-label={tx(locale, "Gerelateerde tools", "Related tools")}
    >
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
        {tx(locale, "Ook in de toolkit", "Also in the toolkit")}
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {related.map((tool) => (
          <li key={tool.id}>
            <Link
              to={tool.href}
              className="block rounded-lg border border-line bg-elevated p-4 transition-colors duration-150 hover:border-line-strong"
            >
              <strong className="block font-display text-base font-semibold tracking-tight text-ink">
                {toolTitle(tool, locale)}
              </strong>
              <small className="mt-1 block text-sm text-muted">
                {tool.standard} · {toolKindLabel(tool, locale)}
              </small>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
