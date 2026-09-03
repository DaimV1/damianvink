import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { VinkMark } from "@/components/vink-mark";
import { tx, useLocale } from "@/lib/i18n/locale";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { locale, toggle: toggleLocale } = useLocale();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const nav = [
    { to: "/toolkit", label: "Toolkit", match: "/toolkit" },
    { to: "/project", label: tx(locale, "Project", "Project"), match: "/project" },
    { to: "/marathon", label: "Marathon", match: "/marathon" },
    { to: "/over-mij", label: tx(locale, "Over", "About"), match: "/over-mij" },
    { to: "/contact", label: "Contact", match: "/contact" },
  ] as const;

  function isActive(item: (typeof nav)[number]) {
    if (item.to === "/toolkit") return pathname.startsWith("/toolkit");
    if (item.to === "/project") return pathname === "/project" || pathname.startsWith("/project/");
    if (item.to === "/marathon") return pathname.startsWith("/marathon");
    return pathname === item.match || pathname.startsWith(item.match + "/");
  }

  return (
    <header className="border-b border-line bg-paper print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <VinkMark />
          <Link to="/" className="truncate font-sans text-sm text-ink" onClick={() => setOpen(false)}>
            <strong className="font-medium">Damian Vink</strong>
            <span className="hidden text-muted sm:inline"> — damianvink.nl</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-0.5 whitespace-nowrap lg:flex" aria-label={tx(locale, "Hoofdmenu", "Main menu")}>
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive(item) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition-colors duration-150",
                isActive(item) ? "text-ink" : "text-muted hover:text-ink",
              )}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleLocale}
            className="grid size-11 place-items-center rounded-md text-ink transition-colors duration-150 hover:bg-muted-bg"
            aria-label={locale === "nl" ? "Switch to English" : "Schakel naar Nederlands"}
            title={locale === "nl" ? "English" : "Nederlands"}
          >
            <span className="font-mono text-xs font-medium tracking-wide">
              {locale === "nl" ? "NL" : "EN"}
            </span>
          </button>
          <button
            type="button"
            onClick={toggle}
            className="relative grid size-11 place-items-center rounded-md text-ink transition-colors duration-150 hover:bg-muted-bg"
            aria-label={tx(locale, "Thema wisselen", "Toggle theme")}
            title={tx(locale, "Thema wisselen", "Toggle theme")}
          >
            <Sun
              className={cn(
                "absolute size-4 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                theme === "dark" ? "scale-100 opacity-100 blur-none" : "scale-[0.25] opacity-0 blur-[4px]",
              )}
            />
            <Moon
              className={cn(
                "size-4 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                theme === "light" ? "scale-100 opacity-100 blur-none" : "scale-[0.25] opacity-0 blur-[4px]",
              )}
            />
          </button>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-md text-ink hover:bg-muted-bg lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? tx(locale, "Menu sluiten", "Close menu") : tx(locale, "Menu", "Menu")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav id="mobile-nav" className="border-t border-line px-4 py-3 lg:hidden" aria-label={tx(locale, "Mobiel menu", "Mobile menu")}>
          <div className="flex flex-col">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex min-h-11 items-center text-base text-ink"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
