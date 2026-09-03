import { Link, useNavigate } from "@tanstack/react-router";
import { tx, useLocale } from "@/lib/i18n/locale";
import { TOOL_GROUPS, TOOLS, type ToolId, toolShort } from "@/lib/toolkit/tools";
import { cn } from "@/lib/utils";

export function ToolSwitcher({ active }: { active?: ToolId }) {
  const { locale } = useLocale();
  const navigate = useNavigate();
  return (
    <div className="border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-2.5 sm:px-6 sm:py-0">
        <select
          aria-label={tx(locale, "Kies een tool", "Choose a tool")}
          value={TOOLS.find((tool) => tool.id === active)?.href ?? ""}
          onChange={(e) => {
            if (e.target.value) navigate({ to: e.target.value });
          }}
          className="h-11 w-full rounded-md border border-line-strong bg-elevated px-3 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-2 focus:ring-accent/30 sm:hidden"
        >
          {!active ? <option value="" /> : null}
          {TOOL_GROUPS.map((group) => (
            <optgroup key={group.id} label={tx(locale, group.label, group.labelEn)}>
              {TOOLS.filter((tool) => tool.group === group.id).map((tool) => (
                <option key={tool.id} value={tool.href}>
                  {tx(locale, tool.title, tool.titleEn)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <nav
          className="-mx-1 hidden items-center gap-1 overflow-x-auto py-2.5 [scrollbar-width:none] sm:flex [&::-webkit-scrollbar]:hidden"
          aria-label="Engineering tools"
        >
          {TOOL_GROUPS.map((group, groupIndex) => (
            <span key={group.id} className="flex shrink-0 items-center gap-1">
              {groupIndex > 0 ? (
                <span
                  aria-hidden="true"
                  className="mx-1 h-6 w-px shrink-0 bg-line-strong"
                />
              ) : null}
              {TOOLS.filter((tool) => tool.group === group.id).map((tool) => {
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
            </span>
          ))}
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
