import type { OgSummary } from "./summary.ts";

/**
 * The 1200×630 share card. Satori (via @vercel/og) supports a flexbox subset
 * only: every container needs an explicit `display: flex`, and there is no
 * cascade — so styles are set per element on purpose.
 *
 * Colours are the site's own tokens from styles.css (dark theme), resolved to
 * literals because satori has no CSS variables:
 *   paper #0c0d11 · elevated #15171d · ink #f1efe8
 *   muted #9b9da6 · subtle #6e717a · accent #5b8cff
 */
const PAPER = "#0c0d11";
const ELEVATED = "#15171d";
const INK = "#f1efe8";
const MUTED = "#9b9da6";
const SUBTLE = "#6e717a";
const ACCENT = "#5b8cff";
const LINE = "#2a2c33";

export function OgCard({ summary }: { summary: OgSummary }) {
  const { title, standard, headline, chips } = summary;
  // Long headlines (a fit like "Ø120 H7/p6" vs a fallback blurb) need to step
  // down or they wrap into the chips.
  const headlineSize = headline.length > 46 ? 44 : headline.length > 30 ? 56 : 72;
  // Deviation pairs ("+0,021 / +0,000 mm") are far longer than a bore size, and
  // at a fixed size they wrap the unit onto its own line. Size to the longest.
  const longestChip = Math.max(0, ...chips.slice(0, 3).map((c) => c.value.length));
  const chipSize = longestChip > 17 ? 23 : longestChip > 12 ? 27 : 32;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: PAPER,
        padding: "64px 72px",
        justifyContent: "space-between",
      }}
    >
      {/* Eyebrow: site + standard */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 3,
            color: SUBTLE,
            textTransform: "uppercase",
          }}
        >
          damianvink.nl / toolkit
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 20,
            color: ACCENT,
            border: `1px solid ${ACCENT}`,
            borderRadius: 6,
            padding: "4px 12px",
          }}
        >
          {standard}
        </div>
      </div>

      {/* The answer */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", fontSize: 26, color: MUTED }}>{title}</div>
        <div
          style={{
            display: "flex",
            fontSize: headlineSize,
            color: INK,
            lineHeight: 1.1,
            letterSpacing: -1,
          }}
        >
          {headline}
        </div>
      </div>

      {/* Supporting values, mirroring the page's own result grid */}
      {chips.length > 0 ? (
        <div style={{ display: "flex", gap: 16 }}>
          {chips.slice(0, 3).map((chip) => (
            <div
              key={chip.label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                flex: 1,
                backgroundColor: ELEVATED,
                border: `1px solid ${LINE}`,
                borderRadius: 12,
                padding: "18px 22px",
              }}
            >
              <div style={{ display: "flex", fontSize: 19, color: SUBTLE }}>{chip.label}</div>
              <div style={{ display: "flex", fontSize: chipSize, color: INK, lineHeight: 1.2 }}>
                {chip.value}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", fontSize: 24, color: SUBTLE }}>
          Gratis rekenhulp — bron vermeld, waarden gecontroleerd.
        </div>
      )}
    </div>
  );
}
