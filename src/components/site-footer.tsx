import { Link } from "@tanstack/react-router";
import { tx, useLocale } from "@/lib/i18n/locale";

export function SiteFooter() {
  const { locale } = useLocale();
  const footer = [
    { to: "/toolkit", label: "Toolkit" },
    { to: "/project", label: "Project" },
    { to: "/marathon", label: "Marathon" },
    { to: "/over-mij", label: tx(locale, "Over", "About") },
    { to: "/contact", label: "Contact" },
  ] as const;

  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
          {footer.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-muted transition-colors duration-150 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="font-mono text-xs text-subtle">
          {tx(locale, "Project Engineer · werktuigbouwkunde", "Project Engineer · mechanical engineering")}
          <span className="mx-2 text-line">·</span>
          © {new Date().getFullYear()} Damian Vink
        </p>
      </div>
    </footer>
  );
}
