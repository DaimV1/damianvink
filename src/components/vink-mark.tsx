import { Link } from "@tanstack/react-router";

export function VinkMark({ className = "h-4 w-6" }: { className?: string }) {
  return (
    <Link
      to="/spel"
      aria-label="Vink, open het spel"
      className="inline-flex text-accent transition-transform duration-150 ease-out hover:scale-110 active:scale-[0.96]"
      title="Vink"
    >
      <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
        <ellipse cx="10" cy="8.2" rx="8.2" ry="5.6" fill="currentColor" />
        <path d="M16.4 6.4 23 8.2 16.4 10z" fill="currentColor" />
        <circle cx="12.4" cy="6.6" r="1.55" fill="var(--paper)" />
      </svg>
    </Link>
  );
}
