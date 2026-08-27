import { TEMPLATES } from "@/lib/pm/templates";

export function TemplatesPanel() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight">Templates</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
          Invulbladen voor het overleg. Open in Word of Excel, vul in, deel in de
          weekstart of het beslispunt.
        </p>
      </div>
      <div className="grid gap-3">
        {TEMPLATES.map((t, i) => (
          <article
            key={t.id}
            className="flex flex-col gap-3 rounded-lg border border-line bg-elevated p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-mono text-xs text-accent">
                {String(i + 1).padStart(2, "0")} · {t.phase}
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">
                {t.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{t.body}</p>
            </div>
            <a
              href={t.href}
              download={t.file}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-accent bg-accent px-4 text-sm text-accent-fg"
            >
              Download {t.kind}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
