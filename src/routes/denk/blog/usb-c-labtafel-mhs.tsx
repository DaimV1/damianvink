import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { DisplayTitle } from "@/components/display-title";
import { JsonLd } from "@/components/json-ld";
import { PageWrap, SiteShell } from "@/components/site-shell";
import { Breadcrumb } from "@/components/toolkit/tool-switcher";
import { ARTICLES } from "@/lib/articles";
import { articleJsonLd, pageHead } from "@/lib/seo";

const POST = ARTICLES[0];
const MHS = "https://www.anthropic.com/news/model-hardware-standard-research-preview";
const OPUS = "https://www.anthropic.com/news/claude-opus-5";
const FABLE = "https://www.anthropic.com/news/claude-fable-5-mythos-5";
const HELIX = "https://www.figure.ai/news/helix-02";

export const Route = createFileRoute("/denk/blog/usb-c-labtafel-mhs")({
  head: () =>
    pageHead({
      title: `${POST.title} — Damian Vink`,
      description: POST.description,
      path: POST.href,
      ogType: "article",
    }),
  component: Article,
});

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="text-accent underline-offset-2 hover:underline"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

function Quote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="border-l-2 border-accent pl-4 text-base leading-relaxed text-muted">
      {children}
    </blockquote>
  );
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
      {children}
    </h2>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="text-lg leading-relaxed text-muted">{children}</p>;
}

function Article() {
  return (
    <SiteShell>
      <JsonLd
        data={articleJsonLd({
          headline: POST.title,
          path: POST.href,
          description: POST.description,
          datePublished: POST.date,
        })}
      />
      <PageWrap>
        <Breadcrumb
          items={[
            { href: "/denk", label: "Artikelen" },
            { href: "/denk/blog", label: "Blog" },
            { label: POST.title },
          ]}
        />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          Artikelen
        </p>
        <DisplayTitle
          before="USB-C voor de labtafel: Anthropic’s Model Hardware"
          last="Standard."
          className="mt-3 text-[clamp(1.65rem,4vw,3rem)]"
        />
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.16em] text-accent">
          {POST.dateLabel}
        </p>
        <article className="mt-8 max-w-2xl space-y-5">
          <p className="text-lg leading-relaxed text-ink">
            <strong>Niet slimmer, maar aangesloten.</strong> De agent mag de machine
            aanraken — maar alleen via een driver. USB-C in de titel is een metafoor:
            geen IEC- of ISO-connector, geen drop-in kabel, en geen stekker die al op
            elke labtafel zit.
          </p>

          <H2>De integratie die elk project kent</H2>
          <P>
            Twee dagen om een robotarm te kopen. Zes weken om hem te laten praten met
            de liquid handler, de camera en de PLC. Dat is geen modelnieuws. Dat is
            projectnieuws.
          </P>
          <P>
            De arm heeft een SDK, de handler een API, de camera Ethernet, de PLC
            Profinet of OPC UA. Geen van die interfaces is fout. Ze zijn alleen niet
            hetzelfde. Iemand moet een vertaler bouwen, testen, begrenzen en
            onderhouden. Daarna nog een tweede, omdat de volgende cell een andere
            vendor heeft.
          </P>
          <P>
            Dat werk ken ik uit de machinebouw: asset, interface, safety, en dan pas
            iets slims erop. De bottleneck zit zelden in het kopen van de as. Die zit
            in het laten samenwerken van spullen die al programmeerbaar zijn — en in
            de vraag wie er mag schrijven naar de machine.
          </P>
          <P>Dit stuk leest een leveranciers-RFC. Geen brochure.</P>

          <H2>Wat er 27 augustus écht is gedropt</H2>
          <P>
            Op 27 augustus 2026 opent Anthropic een research preview van de Model
            Hardware Standard, afgekort MHS. Geen open-source drop. Geen algemeen
            product. Geen connector op de bank.
          </P>
          <P>
            In{" "}
            <Ext href={MHS}>Previewing the Model Hardware Standard</Ext> schrijft
            Anthropic:
          </P>
          <Quote>
            “We’re opening a research preview of the Model Hardware Standard (MHS), a
            shared specification for AI agents to safely operate physical devices, to
            a first group of scientific research labs and advanced manufacturers.”
          </Quote>
          <P>
            Eerste toegang: scientific research labs en advanced manufacturers.
            Ontwikkeling begon met HHMI Janelia Research Campus. Open source later,
            mét findings. Vandaag niet. Een publieke GitHub-spec is hier niet
            gevonden.
          </P>
          <P>
            MHS werkt alleen op hardware met een programmeerbare interface. Het is
            model-agnostisch. Agents praten via MCP, CLI en code files. Dat is geen
            Claude-feature. Het is een drivercontract. Welk model erachter hangt, is
            secundair. De vraag is of de machine ontdekt, begrensd en bediend kan
            worden zonder een nieuwe vertaler per vendor.
          </P>
          <P>
            Anthropic claimt zelf dat integratiewerk van weken of maanden naar uren
            of minuten gaat. Dat is hun regel, geen onafhankelijke meting.
          </P>

          <H2>Hoe de driver werkt</H2>
          <P>
            MHS is een gestandaardiseerde driver: software tussen besturingssysteem
            en apparaat. <Ext href={MHS}>Anthropic</Ext>:
          </P>
          <Quote>
            “The MHS driver uses a simple set of primitives—commands like “read” (for
            example, “get temperature”) or “write” (for example, “set
            temperature”)—that any hardware device can understand and act on.”
          </Quote>
          <P>
            Read en write. Discoverability hoort erbij: elk apparaat in een
            standaardformaat, zodat agent en machine elkaar vinden zonder
            maatwerk-vertaler.
          </P>
          <P>
            Kenmerken die je uit code niet haalt — massa van een arm, meetbereik,
            safety limits — staan in handleidingen of nergens. De driver laat die in
            natuurlijke taal vastleggen. Daaruit komt een referentiebestand: wat het
            apparaat kan meten, wat je mag zetten, welke grenzen gelden. Dat bestand
            krijgt de agent voordat hij schrijft.
          </P>
          <P>
            Aansturing via MCP, CLI en code files. Online redeneren mag voor
            sequentie en monitoring. De cyclus mag niet op LLM-latentie draaien (
            <Ext href={MHS}>Anthropic</Ext>):
          </P>
          <Quote>
            “When the agent needs to execute long-running tasks or operate devices
            faster than its online reasoning would allow, it can chain together
            driver commands from one or more devices in code files. This allows the
            devices to carry out operations themselves, without the agent needing to
            reason at every step.”
          </Quote>
          <P>
            Dat is de duurzame methode. Eerst verkennen, dan een deterministisch
            script. De machine voert uit; de agent denkt niet bij elke stap.
          </P>

          <H2>De laser, niet de brochure</H2>
          <P>
            De bruikbare test is een laser, een camera, daarna code. Anthropic, in
            dezelfde <Ext href={MHS}>Anthropic</Ext>, over tests — MHS begon met
            Janelia:
          </P>
          <Quote>
            “As we’ve tested MHS, we’ve found that Claude interacts with experiments
            and hardware in an exploratory manner, much as a scientist would. For
            example, we observed Claude make an adjustment to a laser, observe the
            results through a camera to assess how its adjustment moved the laser
            beam, and repeat the process, seeking to understand the sequence of
            events. Claude then packaged what it learned into code files, writing a
            deterministic script that let it align the laser without having to reason
            at each step, so the whole process could run as a single command.”
          </Quote>
          <P>
            Die hardwarelaag is alleen zinvol als software een machine al kan
            reconstrueren. Dat is geen MHS. Dat is 24 juli 2026,{" "}
            <Ext href={OPUS}>Introducing Claude Opus 5</Ext>:
          </P>
          <Quote>
            “On one Frontier-Bench task, Opus 5 was given a drawing of a machine part
            and asked to write code to rebuild it as a 3D FreeCAD model. However, in
            this task, the model was intentionally given no way to directly{" "}
            <em>view</em> the drawing. Opus 5 responded by writing its own computer
            vision pipeline to pull the geometry from the raw pixels, then
            reconstructed the full machine part. It succeeded in doing so repeatedly;
            no competing model with the same setup could solve it after five
            attempts.”
          </Quote>
          <P>
            Opus 5 is de softwarekant. MHS is de ontbrekende hardwarekant. Fable 5 en
            Mythos 5 hebben MHS niet gedraaid; het zijn opeenvolgende stappen uit hetzelfde lab, geen stack.
          </P>
          <P>
            De laag ervoor, 9 juni 2026: agents zaten al in de workflow, met
            wetenschappelijke tools, zonder hardwarestandaard. In{" "}
            <Ext href={FABLE}>Claude Fable 5 and Claude Mythos 5</Ext>:
          </P>
          <Quote>
            “Using Mythos 5, our internal protein design experts accelerated aspects
            of the drug design process by around 10 times. In one example, they found
            that Mythos 5, with protein design and bioinformatics tools but no human
            assistance, matches or beats skilled human operators.”
          </Quote>
          <P>
            Dat is de aanleiding, niet MHS. Mythos 5 is restricted access. De lezer
            kan dit niet aanzetten. De bottleneck na tools in software is het echte
            apparaat. Vandaar een driverlaag.
          </P>

          <H2>Wat partners claimen, en hoe dun dat is</H2>
          <P>
            Alles hieronder komt uit dezelfde{" "}
            <Ext href={MHS}>Anthropic-post</Ext>. Vroege voorbeelden, door Anthropic
            gerapporteerd. Geen onafhankelijke papers.
          </P>
          <P>
            Carnegie Mellon: seriële verdunning “about three times faster” (~3×,{" "}
            <Ext href={MHS}>Anthropic</Ext>) dan eerder, met een agent over liquid
            handler, plate reader, robotarm en camera’s op drie computers met
            incompatibele interfaces.
          </P>
          <P>
            QuEra: een agent-controller herstelt de laser-lock 99,3% van de tijd
            zonder menselijke ingreep (<Ext href={MHS}>Anthropic</Ext>). Dat is één
            lock-controller, in Anthropics post. Geen algemene uitspraak dat AI
            quantumcomputers bestuurt.
          </P>
          <P>
            Genentech testte MHS als proof of concept op de BCA-proteïne-assay
            (liquid handler, robotarm, plate reader). Dezelfde post gebruikt
            Genentech vooral als limiet: schuim in een monster is een fysieke fout,
            geen softwarebug.
          </P>
          <P>
            Vendors in die post zijn intentie, geen geleverde driver. AWS{" "}
            <em>will support</em> MHS via Strands Robots, private pre-release tijdens
            de preview. Universal Robots <em>plans to add support</em>. Doosan{" "}
            <em>is testing</em> met hun armen. Hugging Face <em>are adding</em> MHS
            in LeRobot. Raspberry Pi <em>are enabling</em> integratie na tests met
            een Camera MHS Driver. Een publieke LeRobot- of Raspberry Pi-driver is
            hier niet gevonden. “Adding” en “planning” is wat er staat.
          </P>

          <H2>De limieten die Anthropic zelf opschrijft</H2>
          <P>
            Geen interface, geen MHS. <Ext href={MHS}>Anthropic</Ext>:
          </P>
          <Quote>
            “MHS also doesn’t yet work with hardware that lacks a programming
            interface”
          </Quote>
          <P>
            Fysieke fouten zijn geen softwarefouten. <Ext href={MHS}>Anthropic</Ext>:
          </P>
          <Quote>
            “As a large language model, Claude learns about the physical world
            through text and images, meaning its spatial and physical reasoning have
            limitations that still require expert oversight. When working with
            protein samples, for example, Genentech researchers had to guide Claude
            to recognize that errors caused by foaming in samples were physical
            failures, not software bugs, that could only be mitigated through the
            appropriate physical corrections.”
          </Quote>
          <P>
            Schuim is geen exception in de logger. Claude redeneert niet als een
            mechanical engineer. Anthropic zegt het omgekeerde: ruimtelijk en fysiek
            redeneren blijft beperkt; expert oversight blijft staan.
          </P>
          <P>
            De physical safety roadmap is in ontwikkeling. Extra evaluations met
            launch partners komen in de preview. Open source volgt later, met
            findings. MHS is niet veiliger dan een operator. Dat claimt Anthropic
            niet.
          </P>

          <H2>Wat een Nederlands project nu wél kan doen</H2>
          <P>
            Niet: MHS implementeren. Niet: morgen op een UR-cel of een Siemens-lijn.
            De preview is geen fabrieksproduct.
          </P>
          <P>Wel drie dingen, zonder de RFC te adopteren.</P>
          <P>
            Inventariseer welke assets al een programmeerbare interface hebben. SDK,
            OPC UA, REST, serial, CLI. Wat geen interface heeft, valt buiten MHS. Wat
            er wél een heeft, is de enige kandidaat voor een latere driver. Dat is
            een assetlijst, geen AI-project.
          </P>
          <P>
            Scheid de safety-PLC van agent-write. De agent mag in dit model alleen
            via een driver schrijven, en die driver draagt limits. De
            veiligheidsbesturing blijft een aparte keten.
          </P>
          <P>
            Behandel MCP en de driver als een OT-vraag, niet als een chatbot-plugin.
            Netwerk, accounts, write-rechten, logging, wie de referentiefile mag
            wijzigen: dezelfde discussie als bij een nieuwe HMI op de cell. Niet
            dezelfde als bij een samenvatting in de browser.
          </P>
          <P>
            Twee wegen om AI in de fysieke wereld te krijgen. Anthropic kiest de
            specificatie: een model-agnostische driver op bestaande, programmeerbare
            machines. Figure kiest een end-to-end neuraal lichaam. In{" "}
            <Ext href={HELIX}>Introducing Helix 02</Ext> (27 januari 2026):
          </P>
          <Quote>
            “System 0 replaces 109,504 lines of hand‑engineered C++ with a single
            neural prior for stable, natural motion.”
          </Quote>
          <P>
            109.504 regels C++ eruit (<Ext href={HELIX}>Helix 02</Ext>), één neurale
            prior erin. Dat is geen driverstandaard. Alleen de eerste weg is vandaag
            een specificatie — en die is een research preview, geen product op de
            labtafel. USB-C was de metafoor. De connector is er nog niet.
          </P>

          <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
            Bronnen
          </h3>
          <ul className="space-y-2 text-base text-muted">
            <li>
              <Ext href={MHS}>Previewing the Model Hardware Standard</Ext> — Anthropic,
              27 augustus 2026
            </li>
            <li>
              <Ext href={OPUS}>Introducing Claude Opus 5</Ext> — Anthropic, 24 juli 2026
            </li>
            <li>
              <Ext href={FABLE}>Claude Fable 5 and Claude Mythos 5</Ext> — Anthropic, 9
              juni 2026
            </li>
            <li>
              <Ext href={HELIX}>Helix 02</Ext> — Figure, 27 januari 2026
            </li>
          </ul>
        </article>
      </PageWrap>
    </SiteShell>
  );
}
