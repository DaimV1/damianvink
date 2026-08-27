import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { VinkMark } from "@/components/vink-mark";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/over-mij", label: "Wie ik ben", match: "/over-mij" },
  { to: "/doe", label: "Wat ik doe", match: "/doe" },
  { to: "/denk", label: "Wat ik denk", match: "/denk" },
  { to: "/denk/toolkit", label: "Toolkit", match: "/denk/toolkit" },
  { to: "/#contact", label: "Contact", match: null },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  function isActive(item: (typeof NAV)[number]) {
    if (!item.match) return false;
    if (item.to === "/denk/toolkit") return pathname.startsWith("/denk/toolkit");
    if (item.to === "/denk")
      return pathname === "/denk" || pathname.startsWith("/denk/blog");
    if (item.to === "/doe") return pathname.startsWith("/doe");
    return pathname === item.match || pathname.startsWith(item.match + "/");
  }

  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <VinkMark />
          <Link
            to="/"
            className="truncate font-sans text-sm text-ink"
            onClick={() => setOpen(false)}
          >
            <strong className="font-medium">Damian Vink</strong>
            <span className="hidden text-muted sm:inline"> — damianvink.nl</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-0.5 whitespace-nowrap lg:flex" aria-label="Hoofdmenu">
          {NAV.map((item) =>
            item.to === "/#contact" ? (
              <a
                key={item.label}
                href="/#contact"
                className="rounded-md px-3 py-2 text-sm text-muted transition-colors duration-150 hover:text-ink"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                aria-current={isActive(item) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors duration-150",
                  isActive(item) ? "text-ink" : "text-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggle}
            className="relative grid size-11 place-items-center rounded-md text-ink transition-colors duration-150 hover:bg-muted-bg"
            aria-label="Thema wisselen"
            title="Thema wisselen"
          >
            <Sun
              className={cn(
                "absolute size-4 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                theme === "dark"
                  ? "scale-100 opacity-100 blur-none"
                  : "scale-[0.25] opacity-0 blur-[4px]",
              )}
            />
            <Moon
              className={cn(
                "size-4 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                theme === "light"
                  ? "scale-100 opacity-100 blur-none"
                  : "scale-[0.25] opacity-0 blur-[4px]",
              )}
            />
          </button>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-md text-ink hover:bg-muted-bg lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Menu sluiten" : "Menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-line px-4 py-3 lg:hidden"
          aria-label="Mobiel menu"
        >
          <div className="flex flex-col">
            {NAV.map((item) =>
              item.to === "/#contact" ? (
                <a
                  key={item.label}
                  href="/#contact"
                  className="flex min-h-11 items-center text-base text-ink"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex min-h-11 items-center text-base text-ink"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
