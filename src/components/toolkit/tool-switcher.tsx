import { Link } from "@tanstack/react-router";
import { tx, useLocale } from "@/lib/i18n/locale";
import { TOOLS, type ToolId, toolShort } from "@/lib/toolkit/tools";
import { cn } from "@/lib/utils";

export function ToolSwitcher({ active }: { active?: ToolId }) {
  const { locale } = useLocale();
  return (
    <div className="border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <nav
          className="-mx-1 flex gap-1 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Engineering tools"
        >
          {TOOLS.map((tool) => {
            const isOn = tool.id === active;
            return (
              <Link
                key={tool.id}
                to={tool.href}
                aria-current={isOn ? "page" : undefined}
                className={cn(
                  "flex h-11 shrink-0 items-center rounded-full border px-4 text-sm transition-[background-color,border-color,color] duration-150",
                  isOn
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-line bg-elevated text-muted hover:border-line-strong hover:text-ink",
                )}
              >
                {toolShort(tool, locale)}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function Breadcrumb({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  const { locale } = useLocale();
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted" aria-label={tx(locale, "Broodkruimel", "Breadcrumb")}>
      <a href="/" className="hover:text-ink">
        Home
      </a>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-2">
          <span aria-hidden="true" className="text-subtle">
            /
          </span>
          {item.href ? (
            <a href={item.href} className="hover:text-ink">
              {item.label}
            </a>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
