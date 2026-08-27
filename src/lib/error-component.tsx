import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-paper px-6 text-center text-ink">
      <TriangleAlert className="size-10 text-fit-vast" strokeWidth={2} aria-hidden="true" />
      <h1 className="font-display text-lg font-semibold">Er ging iets mis</h1>
      <p className="max-w-md text-sm break-words text-muted">
        {error.message || "Onverwachte fout. Probeer de pagina opnieuw te laden."}
      </p>
    </main>
  );
}
