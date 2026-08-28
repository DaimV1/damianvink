import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { matchTools, TOOLS } from "@/lib/toolkit/tools";

export function ToolkitIndexList() {
  const [query, setQuery] = useState("");
  const hits = useMemo(() => matchTools(query), [query]);
  const searching = query.trim().length > 0;

  return (
    <div>
      <form
        role="search"
        className="relative"
        onSubmit={(e) => e.preventDefault()}
      >
        <label
          htmlFor="toolkit-zoek"
          className="mb-2 block font-mono text-xs uppercase tracking-[0.16em] text-muted"
        >
          Zoek
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="toolkit-zoek"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek H7, moment, inch, ISO…"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-controls="toolkit-lijst"
            className="h-12 w-full rounded-md border border-line-strong bg-paper py-2 pl-10 pr-12 text-base text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/30 [&::-webkit-search-cancel-button]:hidden"
          />
          {searching ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-muted-bg hover:text-ink"
              aria-label="Zoekterm wissen"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </form>
      <p className="mt-3 font-mono text-xs text-muted" aria-live="polite">
        {searching
          ? `${hits.length} van ${TOOLS.length} tools`
          : `${TOOLS.length} tools`}
      </p>

      <div id="toolkit-lijst" className="mt-4 grid gap-3">
        {hits.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line-strong bg-elevated px-5 py-10 text-center text-sm text-muted">
            Geen tools voor “{query.trim()}”. Probeer een norm, eenheid of
            trefwoord.
          </p>
        ) : (
          hits.map((tool) => {
            const n = TOOLS.findIndex((t) => t.id === tool.id) + 1;
            return (
              <Link
                key={tool.id}
                to={tool.href}
                className="flex items-center justify-between gap-4 rounded-lg border border-line bg-elevated p-5 transition-colors duration-150 hover:border-line-strong"
              >
                <span>
                  <span className="font-mono text-xs text-accent">
                    {String(n).padStart(2, "0")} · {tool.standard}
                  </span>
                  <strong className="mt-1 block font-display text-lg font-semibold tracking-tight text-ink">
                    {tool.title}
                  </strong>
                  <small className="mt-1 block text-sm text-muted">{tool.blurb}</small>
                  <small className="mt-2 block font-mono text-xs uppercase tracking-[0.12em] text-subtle">
                    {tool.kind === "naslag" ? "Naslag" : "Rekenhulp + naslag"}
                  </small>
                </span>
                <span aria-hidden="true" className="text-accent">
                  →
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
