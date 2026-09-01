import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/toolkit/calc-ui";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { tx, useLocale, type Locale } from "@/lib/i18n/locale";
import { pageHead, webPageJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Downloadbare VBA-macro's voor SolidWorks 2024 en Inventor 2024: STEP-export, batch opslaan, eigenschappen tonen. Basis-hulpmiddelen, geen productiecode.";

export const Route = createFileRoute("/toolkit/macros")({
  head: () =>
    pageHead({
      title: "Macro-bibliotheek SolidWorks & Inventor — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/macros",
    }),
  component: MacrosPage,
});

function groups(locale: Locale) {
  return [
    {
      title: "SolidWorks 2024",
      install: tx(
        locale,
        "Installeren: Tools > Macro > New, plak de code in de module — of importeer het .bas-bestand direct via de VBA-editor (File > Import File).",
        "Install: Tools > Macro > New, paste the code into the module — or import the .bas file directly via the VBA editor (File > Import File).",
      ),
      macros: [
        {
          file: "/macros/solidworks-export-step.bas",
          name: tx(locale, "Exporteer naar STEP", "Export to STEP"),
          note: tx(
            locale,
            "Slaat het actieve part of assembly op als .step, naast het bestaande bestand.",
            "Saves the active part or assembly as .step, next to the existing file.",
          ),
        },
        {
          file: "/macros/solidworks-batch-pdf.bas",
          name: tx(locale, "Batch-export tekeningen naar PDF", "Batch-export drawings to PDF"),
          note: tx(
            locale,
            "Exporteert elke geopende, al opgeslagen tekening naar PDF.",
            "Exports every open, already-saved drawing to PDF.",
          ),
        },
        {
          file: "/macros/solidworks-show-properties.bas",
          name: tx(locale, "Toon custom properties", "Show custom properties"),
          note: tx(
            locale,
            "Leest de configuratie-onafhankelijke custom properties van het actieve document. Alleen-lezen.",
            "Reads the configuration-independent custom properties of the active document. Read-only.",
          ),
        },
      ],
    },
    {
      title: "Inventor 2024",
      install: tx(
        locale,
        "Installeren: Alt+F11 (VBA-editor) > Insert > Module, plak de code.",
        "Install: Alt+F11 (VBA editor) > Insert > Module, paste the code.",
      ),
      macros: [
        {
          file: "/macros/inventor-export-step.bas",
          name: tx(locale, "Exporteer naar STEP", "Export to STEP"),
          note: tx(
            locale,
            "Slaat het actieve part of assembly op als .stp, naast het bestaande bestand.",
            "Saves the active part or assembly as .stp, next to the existing file.",
          ),
        },
        {
          file: "/macros/inventor-save-all.bas",
          name: tx(locale, "Sla alles op", "Save all"),
          note: tx(
            locale,
            "Slaat elk geopend document met niet-opgeslagen wijzigingen op.",
            "Saves every open document that has unsaved changes.",
          ),
        },
        {
          file: "/macros/inventor-show-iproperties.bas",
          name: tx(locale, "Toon iProperties", "Show iProperties"),
          note: tx(
            locale,
            "Leest titel, auteur, onderwerp en trefwoorden uit het actieve document. Alleen-lezen.",
            "Reads title, author, subject and keywords from the active document. Read-only.",
          ),
        },
      ],
    },
  ];
}

function MacrosPage() {
  const { locale } = useLocale();
  const copy = toolkitCopy("macros", locale);
  return (
    <ToolkitFrame
      active="macros"
      crumbs={[
        { href: "/toolkit", label: "Toolkit" },
        { label: copy.crumb },
      ]}
      title={copy.title}
      accent={copy.accent}
      lede={copy.lede}
    >
      <JsonLd
        data={webPageJsonLd({
          name: "Macro-bibliotheek SolidWorks & Inventor",
          path: "/toolkit/macros",
          description: DESCRIPTION,
        })}
      />
      <p className="rounded-lg border border-line bg-elevated p-4 text-sm leading-relaxed text-muted">
        {tx(
          locale,
          "Basis-hulpmiddelen (VBA), geen productiecode: geen foutafhandeling voor edge cases. Test eerst op een kopie, niet op een kritiek bestand. Macro's moeten ingeschakeld zijn (Trust Center / macro-instellingen); bestanden uit onbekende bron staan standaard uit.",
          "Basic utilities (VBA), not production code: no edge-case error handling. Test on a copy first, not on a critical file. Macros must be enabled (Trust Center / macro settings); files from an unknown source are disabled by default.",
        )}
      </p>
      <div className="mt-8 space-y-10">
        {groups(locale).map((group) => (
          <section key={group.title}>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              {group.title}
            </h2>
            <p className="mt-2 text-sm text-muted">{group.install}</p>
            <ul className="mt-4 space-y-2">
              {group.macros.map((macro) => (
                <li key={macro.file}>
                  <a
                    href={macro.file}
                    download
                    className="flex items-start justify-between gap-3 rounded-lg border border-line bg-elevated p-4 transition-colors hover:border-line-strong"
                  >
                    <span>
                      <strong className="block text-ink">{macro.name}</strong>
                      <small className="mt-1 block text-sm text-muted">{macro.note}</small>
                    </span>
                    <Download className="mt-1 size-4 shrink-0 text-subtle" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-8 text-xs text-subtle">
        {tx(
          locale,
          "Eigen werk, geen commerciële band met Dassault Systèmes (SolidWorks) of Autodesk (Inventor). API's zijn stabiel over versies; ander jaartal is waarschijnlijk ook prima, niet getest.",
          "Own work, no commercial tie to Dassault Systèmes (SolidWorks) or Autodesk (Inventor). The APIs are stable across versions; a different year is probably fine too, not tested.",
        )}
      </p>
      <Faq items={copy.faq ?? []} />
    </ToolkitFrame>
  );
}
