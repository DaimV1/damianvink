import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { tx, useLocale, type Locale } from "@/lib/i18n/locale";
import { pageHead, webPageJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "CAD-bibliotheken en naslag voor machinebouw: TraceParts, 3Dfindit, MISUMI, 247 Tailor Steel, SKF, Fabory, ISO OBP.";

export const Route = createFileRoute("/toolkit/bronnen")({
  head: () =>
    pageHead({
      title: "CAD-bibliotheken machinebouw — Damian Vink",
      description: DESCRIPTION,
      path: "/toolkit/bronnen",
    }),
  component: BronnenPage,
});

function groups(locale: Locale) {
  return [
    {
      title: tx(locale, "CAD-bibliotheken", "CAD libraries"),
      links: [
        { href: "https://www.traceparts.com/", name: "TraceParts", note: tx(locale, "Grote fabrikantencatalogus. STEP, native CAD. Bouten, lagers, pneumatiek.", "Large manufacturer catalogue. STEP, native CAD. Bolts, bearings, pneumatics.") },
        { href: "https://www.3dfindit.com/", name: "3Dfindit (CADENAS)", note: tx(locale, "Zoeken op merk of DIN/ISO. Zelfde familie als PARTcommunity.", "Search by brand or DIN/ISO. Same family as PARTcommunity.") },
        { href: "https://b2b.partcommunity.com/", name: "PARTcommunity", note: tx(locale, "Componenten per leverancier, configureerbaar, download in SolidWorks / STEP.", "Components per supplier, configurable, download in SolidWorks / STEP.") },
        { href: "https://www.mcmaster.com/", name: "McMaster-Carr", note: tx(locale, "Snel een STEP van standaardhardware. Maten zijn inch-gericht; wel handig als referentie.", "Quick STEP of standard hardware. Sizes are inch-oriented; still useful as a reference.") },
        { href: "https://uk.misumi-ec.com/", name: "MISUMI", note: tx(locale, "Asjes, geleiders, platen op maat. CAD volgt de configuratie.", "Shafts, guides, plates to size. CAD follows the configuration.") },
        { href: "https://grabcad.com/library", name: "GrabCAD Library", note: tx(locale, "Community-modellen. Kwaliteit wisselt; controleren voor je het in een assemblage zet.", "Community models. Quality varies; check before putting it in an assembly.") },
      ],
    },
    {
      title: tx(locale, "Componenten", "Components"),
      links: [
        { href: "https://www.skf.com/nl", name: "SKF", note: tx(locale, "Lagers, passingadvies, CAD en levensduurberekening.", "Bearings, fit advice, CAD and life calculation.") },
        { href: "https://www.igus.nl/", name: "igus", note: tx(locale, "Kunststof glijlagers, energiekettingen, lineair. Eigen CAD-configurator.", "Plastic plain bearings, energy chains, linear. Own CAD configurator.") },
        { href: "https://www.elesa-ganter.com/nl", name: "Elesa+Ganter", note: tx(locale, "Handgrepen, stelvoeten, indexpennen. DIN 6885-tabellen in hun docs.", "Handles, levelling feet, indexing plungers. DIN 6885 tables in their docs.") },
        { href: "https://www.norelem.com/nl/nl/Home.html", name: "norelem", note: tx(locale, "Normdelen voor mallen en machines. CAD per artikel.", "Standard parts for dies and machines. CAD per article.") },
        { href: "https://www.fabory.com/nl", name: "Fabory", note: tx(locale, "Bevestigers, DIN/ISO-kruistabel, technische bladen.", "Fasteners, DIN/ISO cross table, technical sheets.") },
      ],
    },
    {
      title: tx(locale, "Plaatwerk", "Sheet metal"),
      links: [
        { href: "https://247tailorsteel.com/nl/aanleverspecificaties/richtlijnen-voor-kanten", name: "247TailorSteel", note: tx(locale, "Kantlijnen, radii, materiaaldiktes. Rekenhulp op deze site onder Richtlijnen kanten; altijd hun pagina nalopen.", "Bend lines, radii, material thicknesses. Calculator on this site under Bending guidelines; always check their page.") },
      ],
    },
    {
      title: tx(locale, "Naslag", "Reference"),
      links: [
        { href: "https://www.iso.org/obp/ui/", name: "ISO Online Browsing Platform", note: tx(locale, "Normteksten inzien (vaak preview). Startpunt voor ISO 286, GPS, safety.", "View standard texts (often preview). Starting point for ISO 286, GPS, safety.") },
        { href: "https://amesweb.info/fits-tolerances/preferred-tolerances-table.aspx", name: "Amesweb — ISO-passingen", note: tx(locale, "Rekenhulp voor H7/g6 en verwanten. Controleren tegen de norm.", "Calculator for H7/g6 and related fits. Check against the standard.") },
        { href: "https://duursma.nl/kennis/Kennis/Lagerpassingen-en-toleranties", name: "Duursma — Lagerpassingen", note: tx(locale, "Rotatie, SKF-tabellen, huis en as. Ook op deze site onder Lagerpassingen.", "Rotation, SKF tables, housing and shaft. Also on this site under Bearing fits.") },
        { href: "https://verspanenmuzo.wordpress.com/2015/02/24/seegerring-groef-tabbel/", name: "verspanen-metaal — Seegerringgroef", note: tx(locale, "Werkplaatstabel DIN 471/472. Ook op deze site onder Seegerringgroef.", "Shop table DIN 471/472. Also on this site under Circlip groove.") },
        { href: "https://www.wurth.nl/nl/wuerth_nl/uw_branche/architecten_en_planners/din__en_normdelen/voorspan_en_aandraaimoment_3/voorspanaandraai.php", name: "Würth — Aandraaimoment (VDI 2230)", note: tx(locale, "Tabel A1, μ = 0,14. Ook op deze site onder Bevestigingsmateriaal.", "Table A1, μ = 0.14. Also on this site under Fasteners.") },
        { href: "https://www.engineeringtoolbox.com/", name: "Engineering Toolbox", note: tx(locale, "Dichtheden, schroefdraad, eenheden. Snel, niet altijd de primaire bron.", "Densities, thread, units. Fast, not always the primary source.") },
      ],
    },
  ];
}

function BronnenPage() {
  const { locale } = useLocale();
  const copy = toolkitCopy("bronnen", locale);
  return (
    <ToolkitFrame
      active="bronnen"
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
          name: "CAD-bibliotheken machinebouw",
          path: "/toolkit/bronnen",
          description: DESCRIPTION,
        })}
      />
      <div className="space-y-10">
        {groups(locale).map((group) => (
          <section key={group.title}>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              {group.title}
            </h2>
            <ul className="mt-4 space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between gap-3 rounded-lg border border-line bg-elevated p-4 transition-colors hover:border-line-strong"
                  >
                    <span>
                      <strong className="block text-ink">{link.name}</strong>
                      <small className="mt-1 block text-sm text-muted">{link.note}</small>
                    </span>
                    <ArrowUpRight className="mt-1 size-4 shrink-0 text-subtle" />
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
          "Geen commerciële band. Bronnen voor ontwerp in machinebouw; altijd de norm of catalogus nalopen.",
          "No commercial tie. Sources for machine-building design; always check the standard or catalogue.",
        )}
      </p>
    </ToolkitFrame>
  );
}
