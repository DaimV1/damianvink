import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { tx, useLocale } from "@/lib/i18n/locale";
import { TOOL_GROUPS, TOOLS, type ToolId, toolShort, toolTitle } from "@/lib/toolkit/tools";
import { cn } from "@/lib/utils";

export function ToolSwitcher({ active }: { active?: ToolId }) {
  const { locale } = useLocale();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeTool = TOOLS.find((tool) => tool.id === active);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-2.5 sm:px-6">
        <select
          aria-label={tx(locale, "Kies een tool", "Choose a tool")}
          value={activeTool?.href ?? ""}
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
        <button
          type="button"
          className="hidden h-11 w-full items-center justify-between gap-2 rounded-md border border-line-strong bg-elevated px-4 text-sm text-ink transition-colors duration-150 hover:border-line-strong sm:flex"
          aria-expanded={open}
          aria-controls="toolkit-switcher-panel"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {tx(locale, "Toolkit", "Toolkit")}
            </span>
            {activeTool ? (
              <>
                <span aria-hidden="true" className="text-subtle">
                  /
                </span>
                <span className="font-medium">{toolTitle(activeTool, locale)}</span>
              </>
            ) : null}
          </span>
          <ChevronDown
            className={cn("size-4 shrink-0 text-muted transition-transform duration-150", open ? "rotate-180" : "")}
            aria-hidden="true"
          />
        </button>
      </div>

      {open ? (
        <div
          id="toolkit-switcher-panel"
          className="hidden border-t border-line bg-paper sm:block"
        >
          <nav
            className="mx-auto grid max-w-6xl gap-x-8 gap-y-6 px-4 py-6 sm:px-6 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Engineering tools"
          >
            {TOOL_GROUPS.map((group) => (
              <div key={group.id}>
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-subtle">
                  {tx(locale, group.label, group.labelEn)}
                </p>
                <ul className="mt-2 space-y-0.5">
                  {TOOLS.filter((tool) => tool.group === group.id).map((tool) => {
                    const isOn = tool.id === active;
                    return (
                      <li key={tool.id}>
                        <Link
                          to={tool.href}
                          aria-current={isOn ? "page" : undefined}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "block rounded-md px-2 py-1.5 -mx-2 text-sm transition-colors duration-150",
                            isOn
                              ? "bg-accent text-accent-fg"
                              : "text-ink hover:bg-muted-bg",
                          )}
                        >
                          {toolShort(tool, locale)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      ) : null}
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
