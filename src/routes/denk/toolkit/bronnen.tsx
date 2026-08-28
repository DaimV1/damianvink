import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { ToolkitFrame } from "@/components/toolkit/toolkit-frame";
import { pageHead, webPageJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "CAD-bibliotheken en naslag voor machinebouw: TraceParts, 3Dfindit, MISUMI, 247 Tailor Steel, SKF, Fabory, ISO OBP.";

export const Route = createFileRoute("/denk/toolkit/bronnen")({
  head: () =>
    pageHead({
      title: "CAD-bibliotheken machinebouw — Damian Vink",
      description: DESCRIPTION,
      path: "/denk/toolkit/bronnen",
    }),
  component: BronnenPage,
});

const GROUPS = [
  {
    title: "CAD-bibliotheken",
    links: [
      {
        href: "https://www.traceparts.com/",
        name: "TraceParts",
        note: "Grote fabrikantencatalogus. STEP, native CAD. Bouten, lagers, pneumatiek.",
      },
      {
        href: "https://www.3dfindit.com/",
        name: "3Dfindit (CADENAS)",
        note: "Zoeken op merk of DIN/ISO. Zelfde familie als PARTcommunity.",
      },
      {
        href: "https://b2b.partcommunity.com/",
        name: "PARTcommunity",
        note: "Componenten per leverancier, configureerbaar, download in SolidWorks / STEP.",
      },
      {
        href: "https://www.mcmaster.com/",
        name: "McMaster-Carr",
        note: "Snel een STEP van standaardhardware. Maten zijn inch-gericht; wel handig als referentie.",
      },
      {
        href: "https://uk.misumi-ec.com/",
        name: "MISUMI",
        note: "Asjes, geleiders, platen op maat. CAD volgt de configuratie.",
      },
      {
        href: "https://grabcad.com/library",
        name: "GrabCAD Library",
        note: "Community-modellen. Kwaliteit wisselt; controleren voor je het in een assemblage zet.",
      },
    ],
  },
  {
    title: "Componenten",
    links: [
      {
        href: "https://www.skf.com/nl",
        name: "SKF",
        note: "Lagers, passingadvies, CAD en levensduurberekening.",
      },
      {
        href: "https://www.igus.nl/",
        name: "igus",
        note: "Kunststof glijlagers, energiekettingen, lineair. Eigen CAD-configurator.",
      },
      {
        href: "https://www.elesa-ganter.com/nl",
        name: "Elesa+Ganter",
        note: "Handgrepen, stelvoeten, indexpennen. DIN 6885-tabellen in hun docs.",
      },
      {
        href: "https://www.norelem.com/nl/nl/Home.html",
        name: "norelem",
        note: "Normdelen voor mallen en machines. CAD per artikel.",
      },
      {
        href: "https://www.fabory.com/nl",
        name: "Fabory",
        note: "Bevestigers, DIN/ISO-kruistabel, technische bladen.",
      },
    ],
  },
  {
    title: "Plaatwerk",
    links: [
      {
        href: "https://www.247tailorsteel.com/nl",
        name: "247TailorSteel",
        note: "Kantlijnen, radii, materiaaldiktes. Ontwerprichtlijnen + DXF-upload.",
      },
    ],
  },
  {
    title: "Naslag",
    links: [
      {
        href: "https://www.iso.org/obp/ui/",
        name: "ISO Online Browsing Platform",
        note: "Normteksten inzien (vaak preview). Startpunt voor ISO 286, GPS, safety.",
      },
      {
        href: "https://amesweb.info/fits-tolerances/preferred-tolerances-table.aspx",
        name: "Amesweb — ISO-passingen",
        note: "Rekenhulp voor H7/g6 en verwanten. Controleren tegen de norm.",
      },
      {
        href: "https://duursma.nl/kennis/Kennis/Lagerpassingen-en-toleranties",
        name: "Duursma — Lagerpassingen",
        note: "Rotatie, SKF-tabellen, huis en as. Ook op deze site onder Lagerpassingen.",
      },
      {
        href: "https://verspanenmuzo.wordpress.com/2015/02/24/seegerring-groef-tabbel/",
        name: "verspanen-metaal — Seegerringgroef",
        note: "Werkplaatstabel DIN 471/472. Ook op deze site onder Seegerringgroef.",
      },
      {
        href: "https://www.wurth.nl/nl/wuerth_nl/uw_branche/architecten_en_planners/din__en_normdelen/voorspan_en_aandraaimoment_3/voorspanaandraai.php",
        name: "Würth — Aandraaimoment (VDI 2230)",
        note: "Tabel A1, μ = 0,14. Ook op deze site onder Bevestigingsmateriaal.",
      },
      {
        href: "https://www.engineeringtoolbox.com/",
        name: "Engineering Toolbox",
        note: "Dichtheden, schroefdraad, eenheden. Snel, niet altijd de primaire bron.",
      },
    ],
  },
];

function BronnenPage() {
  return (
    <ToolkitFrame
      active="bronnen"
      crumbs={[
        { href: "/denk/toolkit", label: "Toolkit" },
        { label: "CAD-bibliotheken" },
      ]}
      before="CAD-biblio"
      last="theken."
      lede="CAD-modellen, componenten, plaatwerk en norm-naslag. Kantlijnen bij 247 Tailor Steel. Links openen in een nieuw tabblad."
    >
      <JsonLd
        data={webPageJsonLd({
          name: "CAD-bibliotheken machinebouw",
          path: "/denk/toolkit/bronnen",
          description: DESCRIPTION,
        })}
      />
      <div className="space-y-10">
        {GROUPS.map((group) => (
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
        Geen commerciële band. Bronnen voor ontwerp in machinebouw; altijd de norm of catalogus nalopen.
      </p>
    </ToolkitFrame>
  );
}
