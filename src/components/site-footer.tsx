import { Link } from "@tanstack/react-router";

const FOOTER = [
  { to: "/over-mij", label: "Wie ik ben" },
  { to: "/doe", label: "Wat ik doe" },
  { to: "/heb", label: "Wat ik heb" },
  { to: "/denk", label: "Wat ik denk" },
  { to: "/denk/toolkit", label: "Toolkit" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
          {FOOTER.map((item) => (
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
          © {new Date().getFullYear()} Damian Vink
        </p>
      </div>
    </footer>
  );
}
