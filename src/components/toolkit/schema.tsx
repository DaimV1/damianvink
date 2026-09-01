import type { ReactNode } from "react";
import { useId } from "react";
import { tx, useLocale } from "@/lib/i18n/locale";
import { fmtMm } from "@/lib/utils";
import { HOLE, SHAFT } from "@/lib/toolkit/iso286";
import { HOUSING_CHART, SHAFT_CHART } from "@/lib/toolkit/bearing";
import type { FastenerRow } from "@/lib/toolkit/fastener";
import type { SeegerKind } from "@/lib/toolkit/seeger";
import type { OringKind } from "@/lib/toolkit/oring";
import { dashMm, type Kind as BendKind } from "@/lib/toolkit/kanten";
import { END_CONDITIONS, type EndConditionId } from "@/lib/toolkit/knik";

const FONT = "IBM Plex Mono, ui-monospace, monospace";

export function SchemaPanel({
  caption,
  children,
}: {
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className="mt-4 overflow-hidden rounded-lg border border-line bg-elevated">
      <figcaption className="border-b border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
        {caption}
      </figcaption>
      <div className="px-2 py-3 sm:px-4">{children}</div>
    </figure>
  );
}

function HatchDefs({ uid }: { uid: string }) {
  return (
    <defs>
      <pattern
        id={`${uid}-a`}
        width="7"
        height="7"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" strokeWidth="0.9" opacity="0.32" />
      </pattern>
      <pattern
        id={`${uid}-b`}
        width="7"
        height="7"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(-45)"
      >
        <line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" strokeWidth="0.9" opacity="0.22" />
      </pattern>
    </defs>
  );
}

function DimH({
  x1,
  x2,
  y,
  label,
  side = "down",
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
  side?: "up" | "down";
}) {
  const a = Math.min(x1, x2);
  const b = Math.max(x1, x2);
  const mid = (a + b) / 2;
  const tick = side === "down" ? 5 : -5;
  const ty = y + (side === "down" ? 16 : -7);
  return (
    <g stroke="currentColor" fill="none" strokeWidth="1">
      <line x1={a} y1={y} x2={b} y2={y} />
      <line x1={a} y1={y - tick} x2={a} y2={y + tick} />
      <line x1={b} y1={y - tick} x2={b} y2={y + tick} />
      <text
        x={mid}
        y={ty}
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontSize="12"
        fontFamily={FONT}
      >
        {label}
      </text>
    </g>
  );
}

function DimV({
  x,
  y1,
  y2,
  label,
  side = "left",
}: {
  x: number;
  y1: number;
  y2: number;
  label: string;
  side?: "left" | "right";
}) {
  const a = Math.min(y1, y2);
  const b = Math.max(y1, y2);
  const mid = (a + b) / 2;
  const tick = side === "left" ? -5 : 5;
  const txPos = x + (side === "left" ? -8 : 8);
  return (
    <g stroke="currentColor" fill="none" strokeWidth="1">
      <line x1={x} y1={a} x2={x} y2={b} />
      <line x1={x - 5} y1={a} x2={x + 5} y2={a} />
      <line x1={x - 5} y1={b} x2={x + 5} y2={b} />
      <text
        x={txPos}
        y={mid + 4}
        textAnchor={side === "left" ? "end" : "start"}
        fill="currentColor"
        stroke="none"
        fontSize="12"
        fontFamily={FONT}
      >
        {label}
      </text>
    </g>
  );
}

/** Dimension line running parallel to a feature (e.g. an angled leg), offset to its outer side. */
function DimAligned({
  x1,
  y1,
  x2,
  y2,
  offset,
  label,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  offset: number;
  label: string;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const ax1 = x1 + px * offset;
  const ay1 = y1 + py * offset;
  const ax2 = x2 + px * offset;
  const ay2 = y2 + py * offset;
  const tick = 5;
  const mx = (ax1 + ax2) / 2 + px * 12;
  const my = (ay1 + ay2) / 2 + py * 12;
  return (
    <g>
      <Ext x1={x1} y1={y1} x2={ax1} y2={ay1} />
      <Ext x1={x2} y1={y2} x2={ax2} y2={ay2} />
      <g stroke="currentColor" fill="none" strokeWidth="1">
        <line x1={ax1} y1={ay1} x2={ax2} y2={ay2} />
        <line x1={ax1 - px * tick} y1={ay1 - py * tick} x2={ax1 + px * tick} y2={ay1 + py * tick} />
        <line x1={ax2 - px * tick} y1={ay2 - py * tick} x2={ax2 + px * tick} y2={ay2 + py * tick} />
      </g>
      <text
        x={mx}
        y={my}
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontSize="12"
        fontFamily={FONT}
      >
        {label}
      </text>
    </g>
  );
}

function Ext({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="currentColor"
      strokeWidth="0.75"
      opacity="0.45"
    />
  );
}

export function BoltSection({
  row,
  hole,
}: {
  row: FastenerRow | null;
  hole: number | null;
}) {
  const { locale } = useLocale();
  const uid = useId().replace(/:/g, "");
  const d = row ? `d M${row.d}` : "d";
  const D = hole != null ? `D ${fmtMm(hole)}` : "D";
  const k = row ? `k ${fmtMm(row.k)}` : "k";
  const sw = row ? `SW ${fmtMm(row.sw)}` : "SW";
  const plate = tx(locale, "plaat", "plate");

  return (
    <svg
      className="w-full max-w-xl text-ink"
      viewBox="0 0 460 300"
      role="img"
      aria-label={tx(
        locale,
        "Doorsnede: zeskantbout door twee platen, met kop k, doorlaat D, draad d en SW",
        "Section: hex bolt through two plates, head k, clearance D, thread d and SW",
      )}
    >
      <HatchDefs uid={uid} />
      <line
        x1="168"
        y1="28"
        x2="168"
        y2="272"
        stroke="currentColor"
        strokeDasharray="4 5"
        strokeWidth="0.8"
        opacity="0.4"
      />
      {/* plates */}
      <rect x="48" y="96" width="92" height="38" fill={`url(#${uid}-a)`} stroke="currentColor" />
      <rect x="196" y="96" width="92" height="38" fill={`url(#${uid}-a)`} stroke="currentColor" />
      <rect x="48" y="134" width="92" height="38" fill={`url(#${uid}-b)`} stroke="currentColor" />
      <rect x="196" y="134" width="92" height="38" fill={`url(#${uid}-b)`} stroke="currentColor" />
      <text x="64" y="120" fill="currentColor" fontSize="11" fontFamily={FONT} opacity="0.75">
        {plate}
      </text>
      <text x="64" y="158" fill="currentColor" fontSize="11" fontFamily={FONT} opacity="0.75">
        {plate}
      </text>
      {/* clearance D */}
      <rect x="140" y="96" width="56" height="76" fill="var(--paper)" />
      {/* shank d */}
      <rect x="150" y="80" width="36" height="148" fill="var(--accent)" />
      {/* hex head */}
      <path d="M132 48 h72 l10 32 H122 Z" fill="var(--accent)" stroke="currentColor" strokeWidth="1" />
      {/* nut */}
      <path
        d="M128 228 h80 l8 24 H120 Z"
        fill="var(--paper)"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <rect x="150" y="228" width="36" height="24" fill="var(--accent)" />

      <Ext x1={122} y1={48} x2={122} y2={40} />
      <Ext x1={214} y1={48} x2={214} y2={40} />
      <DimH x1={122} x2={214} y={36} label={sw} side="up" />

      <Ext x1={304} y1={48} x2={318} y2={48} />
      <Ext x1={304} y1={80} x2={318} y2={80} />
      <DimV x={324} y1={48} y2={80} label={k} side="right" />

      <Ext x1={140} y1={172} x2={140} y2={214} />
      <Ext x1={196} y1={172} x2={196} y2={214} />
      <DimH x1={140} x2={196} y={222} label={D} />

      <Ext x1={150} y1={252} x2={150} y2={268} />
      <Ext x1={186} y1={252} x2={186} y2={268} />
      <DimH x1={150} x2={186} y={276} label={d} />
    </svg>
  );
}

export function KeywaySection({
  row,
}: {
  row: { b: number; h: number; t1: number; t2: number } | null;
}) {
  const { locale } = useLocale();
  const uid = useId().replace(/:/g, "");
  const cx = 150;
  const cy = 150;
  const rHub = 112;
  const rShaft = 74;
  const bw = 30;
  const t2 = 20;
  const t1 = 26;
  const keyTop = cy - rShaft - t2;
  const keyBot = cy - rShaft + t1;
  const keyL = cx - bw / 2;
  const keyR = cx + bw / 2;
  const t1l = row ? `t₁ ${fmtMm(row.t1)}` : "t₁";
  const t2l = row ? `t₂ ${fmtMm(row.t2)}` : "t₂";
  const bl = row ? `b ${row.b}` : "b";
  const hl = row ? `h ${row.h}` : "h";

  return (
    <svg
      className="w-full max-w-xl text-ink"
      viewBox="0 0 420 310"
      role="img"
      aria-label={tx(
        locale,
        "Dwarsdoorsnede as, spie en naaf met t1, t2, b en h",
        "Cross-section of shaft, key and hub with t1, t2, b and h",
      )}
    >
      <HatchDefs uid={uid} />
      <circle cx={cx} cy={cy} r={rHub} fill={`url(#${uid}-a)`} stroke="currentColor" />
      <circle cx={cx} cy={cy} r={rShaft} fill="var(--paper)" stroke="none" />
      <circle cx={cx} cy={cy} r={rShaft} fill={`url(#${uid}-b)`} stroke="currentColor" />
      {/* key sits in both grooves */}
      <rect
        x={keyL}
        y={keyTop}
        width={bw}
        height={t1 + t2}
        rx="1.5"
        fill="var(--accent)"
        stroke="currentColor"
        strokeWidth="1"
      />
      {/* groove walls */}
      <line x1={keyL} y1={keyTop} x2={keyL} y2={keyBot} stroke="currentColor" strokeWidth="1.2" />
      <line x1={keyR} y1={keyTop} x2={keyR} y2={keyBot} stroke="currentColor" strokeWidth="1.2" />
      <text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        fill="currentColor"
        fontSize="12"
        fontFamily={FONT}
      >
        {tx(locale, "as", "shaft")}
      </text>
      <text
        x={58}
        y={cy - 48}
        fill="currentColor"
        fontSize="12"
        fontFamily={FONT}
      >
        {tx(locale, "naaf", "hub")}
      </text>

      <Ext x1={keyR} y1={keyTop} x2={292} y2={keyTop} />
      <Ext x1={keyR} y1={cy - rShaft} x2={292} y2={cy - rShaft} />
      <DimV x={300} y1={keyTop} y2={cy - rShaft} label={t2l} side="right" />

      <Ext x1={keyR} y1={cy - rShaft} x2={332} y2={cy - rShaft} />
      <Ext x1={keyR} y1={keyBot} x2={332} y2={keyBot} />
      <DimV x={340} y1={cy - rShaft} y2={keyBot} label={t1l} side="right" />

      <Ext x1={keyL} y1={keyTop} x2={keyL} y2={36} />
      <Ext x1={keyR} y1={keyTop} x2={keyR} y2={36} />
      <DimH x1={keyL} x2={keyR} y={28} label={bl} side="up" />

      <Ext x1={keyL} y1={keyTop} x2={48} y2={keyTop} />
      <Ext x1={keyL} y1={keyBot} x2={48} y2={keyBot} />
      <DimV x={40} y1={keyTop} y2={keyBot} label={hl} side="left" />
    </svg>
  );
}

export function CirclipSection({
  kind,
  d1,
  d2,
  b,
  t,
}: {
  kind: SeegerKind;
  d1?: number;
  d2?: number;
  b?: number;
  t?: number;
}) {
  const { locale } = useLocale();
  const uid = useId().replace(/:/g, "");
  const asShaft = kind === "as";
  const d1l = d1 != null ? `d₁ ${d1}` : "d₁";
  const d2l = d2 != null ? `d₂ ${fmtMm(d2)}` : "d₂";
  const bl = b != null ? `b ${fmtMm(b)}` : "b";
  const tl = t != null ? `t ${fmtMm(t)}` : "t";

  const bodyY = 70;
  const bodyH = 110;
  const bodyX = 50;
  const bodyW = 250;
  const grooveX = 168;
  const grooveW = 22;
  const grooveD = 16;

  return (
    <svg
      className="w-full max-w-xl text-ink"
      viewBox="0 0 460 250"
      role="img"
      aria-label={
        asShaft
          ? tx(locale, "Lengtedoorsnede as met seegerringgroef DIN 471", "Longitudinal section, shaft circlip groove DIN 471")
          : tx(locale, "Lengtedoorsnede boring met seegerringgroef DIN 472", "Longitudinal section, bore circlip groove DIN 472")
      }
    >
      <HatchDefs uid={uid} />
      <line
        x1={bodyX}
        y1={bodyY + bodyH / 2}
        x2={bodyX + bodyW}
        y2={bodyY + bodyH / 2}
        stroke="currentColor"
        strokeDasharray="4 5"
        strokeWidth="0.8"
        opacity="0.4"
      />

      {asShaft ? (
        <>
          <rect
            x={bodyX}
            y={bodyY}
            width={bodyW}
            height={bodyH}
            fill={`url(#${uid}-a)`}
            stroke="currentColor"
          />
          {/* OD grooves: notches into the shaft */}
          <rect x={grooveX} y={bodyY} width={grooveW} height={grooveD} fill="var(--paper)" />
          <rect
            x={grooveX}
            y={bodyY + bodyH - grooveD}
            width={grooveW}
            height={grooveD}
            fill="var(--paper)"
          />
          <rect x={grooveX + 3} y={bodyY + 2} width={grooveW - 6} height={grooveD - 2} fill="var(--accent)" />
          <rect
            x={grooveX + 3}
            y={bodyY + bodyH - grooveD}
            width={grooveW - 6}
            height={grooveD - 2}
            fill="var(--accent)"
          />
        </>
      ) : (
        <>
          <rect
            x={bodyX}
            y={bodyY - 28}
            width={bodyW}
            height={bodyH + 56}
            fill={`url(#${uid}-a)`}
            stroke="currentColor"
          />
          <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} fill="var(--paper)" stroke="currentColor" />
          {/* ID grooves: notches into the housing wall */}
          <rect
            x={grooveX}
            y={bodyY - grooveD}
            width={grooveW}
            height={grooveD}
            fill="var(--paper)"
            stroke="currentColor"
          />
          <rect
            x={grooveX}
            y={bodyY + bodyH}
            width={grooveW}
            height={grooveD}
            fill="var(--paper)"
            stroke="currentColor"
          />
          <rect x={grooveX + 3} y={bodyY - grooveD} width={grooveW - 6} height={grooveD} fill="var(--accent)" />
          <rect x={grooveX + 3} y={bodyY + bodyH} width={grooveW - 6} height={grooveD} fill="var(--accent)" />
        </>
      )}

      <text x={bodyX + 8} y={bodyY + bodyH / 2 + 4} fill="currentColor" fontSize="12" fontFamily={FONT}>
        {asShaft ? tx(locale, "as", "shaft") : tx(locale, "boring", "bore")}
      </text>
      <text
        x={grooveX + grooveW + 8}
        y={asShaft ? bodyY + 12 : bodyY - grooveD - 8}
        fill="var(--accent)"
        fontSize="11"
        fontFamily={FONT}
      >
        {tx(locale, "ring", "ring")}
      </text>

      <Ext x1={bodyX} y1={asShaft ? bodyY : bodyY} x2={36} y2={asShaft ? bodyY : bodyY} />
      <Ext x1={bodyX} y1={asShaft ? bodyY + bodyH : bodyY + bodyH} x2={36} y2={asShaft ? bodyY + bodyH : bodyY + bodyH} />
      <DimV x={28} y1={bodyY} y2={bodyY + bodyH} label={d1l} side="left" />

      {asShaft ? (
        <>
          <Ext x1={grooveX} y1={bodyY + grooveD} x2={328} y2={bodyY + grooveD} />
          <Ext x1={grooveX} y1={bodyY + bodyH - grooveD} x2={328} y2={bodyY + bodyH - grooveD} />
          <DimV x={336} y1={bodyY + grooveD} y2={bodyY + bodyH - grooveD} label={d2l} side="right" />
        </>
      ) : (
        <>
          <Ext x1={grooveX + grooveW} y1={bodyY - grooveD} x2={328} y2={bodyY - grooveD} />
          <Ext x1={grooveX + grooveW} y1={bodyY + bodyH + grooveD} x2={328} y2={bodyY + bodyH + grooveD} />
          <DimV x={336} y1={bodyY - grooveD} y2={bodyY + bodyH + grooveD} label={d2l} side="right" />
        </>
      )}

      <Ext x1={grooveX} y1={asShaft ? bodyY : bodyY - grooveD} x2={grooveX} y2={28} />
      <Ext x1={grooveX + grooveW} y1={asShaft ? bodyY : bodyY - grooveD} x2={grooveX + grooveW} y2={28} />
      <DimH x1={grooveX} x2={grooveX + grooveW} y={20} label={bl} side="up" />

      <Ext
        x1={grooveX + grooveW}
        y1={asShaft ? bodyY : bodyY - grooveD}
        x2={380}
        y2={asShaft ? bodyY : bodyY - grooveD}
      />
      <Ext
        x1={grooveX + grooveW}
        y1={asShaft ? bodyY + grooveD : bodyY}
        x2={380}
        y2={asShaft ? bodyY + grooveD : bodyY}
      />
      <DimV
        x={388}
        y1={asShaft ? bodyY : bodyY - grooveD}
        y2={asShaft ? bodyY + grooveD : bodyY}
        label={tl}
        side="right"
      />
    </svg>
  );
}

export function OringGroove({
  kind,
  t,
  b,
}: {
  kind: OringKind;
  t?: number;
  b?: number;
}) {
  const { locale } = useLocale();
  const uid = useId().replace(/:/g, "");
  const axial = kind === "axial";
  const tl = t != null ? `t ${fmtMm(t)}` : "t";
  const bl = b != null ? `b ${fmtMm(b)}` : "b";

  const grooveX = 194;
  const grooveW = 52;
  const grooveD = 26;
  const grooveFloorY = 150 + grooveD;

  return (
    <svg
      className="w-full max-w-xl text-ink"
      viewBox="0 0 440 260"
      role="img"
      aria-label={
        axial
          ? tx(
              locale,
              "Doorsnede flensgroef met O-ring, geklemd tussen twee vlakke platen",
              "Section of a flange groove with O-ring, clamped between two flat faces",
            )
          : tx(
              locale,
              "Doorsnede as met radiale O-ringgroef, afdichtend tegen de boring",
              "Section of a shaft with radial O-ring groove, sealing against the bore",
            )
      }
    >
      <HatchDefs uid={uid} />
      {axial ? (
        <line
          x1="220"
          y1="20"
          x2="220"
          y2="240"
          stroke="currentColor"
          strokeDasharray="4 5"
          strokeWidth="0.8"
          opacity="0.4"
        />
      ) : null}

      {axial ? (
        <>
          {/* upper flange, clamped face down */}
          <rect x="40" y="36" width="360" height="54" fill={`url(#${uid}-b)`} stroke="currentColor" />
          {/* lower flange with groove cut into its top face */}
          <rect x="40" y={150} width="360" height="60" fill={`url(#${uid}-a)`} stroke="currentColor" />
          <rect x={grooveX} y="150" width={grooveW} height={grooveD} fill="var(--paper)" />
          <line x1={grooveX} y1="150" x2={grooveX} y2={grooveFloorY} stroke="currentColor" strokeWidth="1.2" />
          <line x1={grooveX + grooveW} y1="150" x2={grooveX + grooveW} y2={grooveFloorY} stroke="currentColor" strokeWidth="1.2" />
          <circle cx="220" cy="133" r="43" fill="var(--accent)" stroke="currentColor" strokeWidth="1.5" />
          <text x="56" y="68" fill="currentColor" fontSize="12" fontFamily={FONT}>
            {tx(locale, "flens boven", "upper flange")}
          </text>
          <text x="56" y="184" fill="currentColor" fontSize="12" fontFamily={FONT}>
            {tx(locale, "flens onder", "lower flange")}
          </text>
        </>
      ) : (
        <>
          {/* housing / bore */}
          <rect x="40" y="56" width="360" height="54" fill={`url(#${uid}-b)`} stroke="currentColor" />
          {/* shaft with groove cut into its OD */}
          <rect x="40" y="150" width="360" height="64" fill={`url(#${uid}-a)`} stroke="currentColor" />
          <rect x={grooveX} y="150" width={grooveW} height={grooveD} fill="var(--paper)" />
          <line x1={grooveX} y1="150" x2={grooveX} y2={grooveFloorY} stroke="currentColor" strokeWidth="1.2" />
          <line x1={grooveX + grooveW} y1="150" x2={grooveX + grooveW} y2={grooveFloorY} stroke="currentColor" strokeWidth="1.2" />
          <circle cx="220" cy="143" r="34" fill="var(--accent)" stroke="currentColor" strokeWidth="1.5" />
          <text x="56" y="88" fill="currentColor" fontSize="12" fontFamily={FONT}>
            {tx(locale, "behuizing / boring", "housing / bore")}
          </text>
          <text x="56" y="188" fill="currentColor" fontSize="12" fontFamily={FONT}>
            {tx(locale, "as", "shaft")}
          </text>
        </>
      )}

      <Ext x1={grooveX} y1={150} x2={grooveX} y2={204} />
      <Ext x1={grooveX + grooveW} y1={150} x2={grooveX + grooveW} y2={204} />
      <DimH x1={grooveX} x2={grooveX + grooveW} y={210} label={bl} side="down" />

      <Ext x1={grooveX + grooveW} y1={150} x2={330} y2={150} />
      <Ext x1={grooveX + grooveW} y1={grooveFloorY} x2={330} y2={grooveFloorY} />
      <DimV x={338} y1={150} y2={grooveFloorY} label={tl} side="right" />
    </svg>
  );
}

export function BendSection({
  kind,
  ri,
  s,
  w,
}: {
  kind: BendKind;
  ri: number | null;
  s: number | null;
  w: number | null;
}) {
  const { locale } = useLocale();
  const uid = useId().replace(/:/g, "");
  const sharp = kind === "scherp";

  // The sheet sits in the die's V-groove at the bottom of the stroke, legs
  // following the die's own 45°/45° walls out into the open air — this is
  // the same for every bend kind; only the Ri/s/w values differ.
  const bendX = 220;
  const bendY = 224;
  const leg1End = { x: 370, y: 74 };
  const leg2End = { x: 70, y: 74 };
  const path = `M${leg1End.x},${leg1End.y} L${bendX},${bendY} L${leg2End.x},${leg2End.y}`;

  const wl = w != null ? `w ${dashMm(w)}` : "w";
  const sl = s != null ? `s ${dashMm(s)}` : "s";
  const ril = ri != null ? `Ri ${dashMm(ri)}` : "Ri";

  return (
    <svg
      className="w-full max-w-xl text-ink"
      viewBox="0 0 440 260"
      role="img"
      aria-label={
        sharp
          ? tx(
              locale,
              "Doorsnede scherpe kant in de matrijs, met groefwijdte w, minimale beenlengte s en inwendige radius Ri",
              "Section of a sharp bend in the die, with die width w, minimum leg length s and inner radius Ri",
            )
          : tx(
              locale,
              "Doorsnede haakse kant (90°) in de matrijs, met groefwijdte w, minimale beenlengte s en inwendige radius Ri",
              "Section of a right-angle bend (90°) in the die, with die width w, minimum leg length s and inner radius Ri",
            )
      }
    >
      <HatchDefs uid={uid} />
      {/* die */}
      <rect x="40" y="190" width="360" height="54" fill={`url(#${uid}-a)`} stroke="currentColor" />
      <path d={`M186,190 L${bendX},224 L254,190 Z`} fill="var(--paper)" />
      <text x="56" y="228" fill="currentColor" fontSize="12" fontFamily={FONT}>
        {tx(locale, "matrijs", "die")}
      </text>

      {/* bent sheet — square-cut ends (butt cap), rounded only at the bend itself */}
      <path d={path} fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="butt" strokeLinejoin="round" />
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="17" strokeLinecap="butt" strokeLinejoin="round" />

      <text x={bendX - 65} y={bendY + 14} fill="currentColor" fontSize="11" fontFamily={FONT}>
        {ril}
      </text>

      <Ext x1={186} y1={190} x2={186} y2={144} />
      <Ext x1={254} y1={190} x2={254} y2={144} />
      <DimH x1={186} x2={254} y={144} label={wl} side="up" />

      {/* s starts past the shared bend fillet, not at the centerline apex */}
      <DimAligned x1={237} y1={207} x2={leg1End.x} y2={leg1End.y} offset={18} label={sl} />
    </svg>
  );
}

function bucklePathH(x0: number, x1: number, cy: number, amp: number, shape: (t: number) => number) {
  const N = 24;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = x0 + (x1 - x0) * t;
    const y = cy - amp * shape(t);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

function GroundHatchH({ x, y, dir }: { x: number; y: number; dir: 1 | -1 }) {
  const h = 30;
  const n = 4;
  const ticks = [];
  for (let i = 0; i <= n; i++) {
    const ty = y - h / 2 + (i * h) / n;
    ticks.push(
      <line
        key={i}
        x1={x}
        y1={ty}
        x2={x + dir * 9}
        y2={ty - 7}
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.55"
      />,
    );
  }
  return (
    <g>
      <line x1={x} y1={y - h / 2} x2={x} y2={y + h / 2} stroke="currentColor" strokeWidth="1.3" />
      {ticks}
    </g>
  );
}

function BuckleSupportH({
  kind,
  x,
  y,
  dir,
}: {
  kind: "pin" | "fixed" | "free";
  x: number;
  y: number;
  dir: 1 | -1;
}) {
  if (kind === "free") return null;
  if (kind === "fixed") return <GroundHatchH x={x} y={y} dir={dir} />;
  return (
    <>
      <circle cx={x} cy={y} r="4" fill="var(--paper)" stroke="currentColor" strokeWidth="1.2" />
      <GroundHatchH x={x + dir * 11} y={y} dir={dir} />
    </>
  );
}

const BUCKLE_CASES: {
  id: EndConditionId;
  near: "pin" | "fixed";
  far: "pin" | "fixed" | "free";
  shape: (t: number) => number;
}[] = [
  { id: "hh", near: "pin", far: "pin", shape: (t) => Math.sin(Math.PI * t) },
  { id: "fc", near: "fixed", far: "free", shape: (t) => 1 - Math.cos((Math.PI / 2) * t) },
  { id: "ff", near: "fixed", far: "fixed", shape: (t) => (1 - Math.cos(2 * Math.PI * t)) / 2 },
  { id: "fp", near: "fixed", far: "pin", shape: (t) => Math.sin(Math.PI * t) * (1 - 0.3 * t) },
];

/** Only the selected case, drawn as a horizontal beam (load applied at the far/right end). */
export function BucklingModes({ active }: { active: EndConditionId }) {
  const { locale } = useLocale();
  const c = BUCKLE_CASES.find((entry) => entry.id === active) ?? BUCKLE_CASES[0];
  const cond = END_CONDITIONS.find((e) => e.id === c.id);
  const x0 = 90;
  const x1 = 560;
  const cy = 108;
  const amp = 34;
  const d = bucklePathH(x0, x1, cy, amp, c.shape);

  return (
    <svg
      className="w-full max-w-2xl text-ink"
      viewBox="0 0 640 200"
      role="img"
      aria-label={
        cond
          ? tx(
              locale,
              `Knikvorm ${cond.label}, horizontale staaf, last aan het verre uiteinde`,
              `Buckling mode ${cond.labelEn}, horizontal strut, load at the far end`,
            )
          : ""
      }
    >
      <line
        x1={x0}
        y1={cy}
        x2={x1}
        y2={cy}
        stroke="currentColor"
        strokeWidth="0.75"
        strokeDasharray="3 4"
        opacity="0.3"
      />
      <path
        d={d}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <BuckleSupportH kind={c.near} x={x0} y={cy} dir={-1} />
      <BuckleSupportH kind={c.far} x={x1} y={cy} dir={1} />
      <line x1={x1 + 30} y1={cy} x2={x1 + 6} y2={cy} stroke="currentColor" strokeWidth="1.4" opacity="0.75" />
      <path
        d={`M${x1 + 12},${cy - 4} L${x1 + 6},${cy} L${x1 + 12},${cy + 4}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.75"
      />
      <text x={(x0 + x1) / 2} y={172} textAnchor="middle" fill="var(--accent)" fontSize="13" fontFamily={FONT} fontWeight={500}>
        {cond ? tx(locale, cond.label, cond.labelEn) : ""}
      </text>
      <text x={(x0 + x1) / 2} y={190} textAnchor="middle" fill="currentColor" fontSize="11" fontFamily={FONT} opacity="0.75">
        k = {cond ? cond.k : ""}
      </text>
    </svg>
  );
}

function ZoneBar({
  x,
  zeroY,
  labelY,
  hi,
  lo,
  scale,
  label,
  active,
  alt,
}: {
  x: number;
  zeroY: number;
  labelY: number;
  hi: number;
  lo: number;
  scale: number;
  label: string;
  active: boolean;
  alt?: boolean;
}) {
  const y1 = zeroY - hi * scale;
  const y2 = zeroY - lo * scale;
  const top = Math.min(y1, y2);
  const h = Math.max(Math.abs(y2 - y1), 2);
  const fill = active
    ? "var(--accent)"
    : alt
      ? "color-mix(in oklab, var(--accent) 45%, transparent)"
      : "color-mix(in oklab, var(--ink) 38%, transparent)";
  return (
    <g>
      <rect
        x={x - 5}
        y={top}
        width={10}
        height={h}
        rx={1}
        fill={fill}
        stroke={active ? "currentColor" : "none"}
        strokeWidth={active ? 1 : 0}
      />
      <text
        x={x}
        y={labelY}
        textAnchor="middle"
        fill={active ? "var(--accent)" : "currentColor"}
        fontSize="9"
        fontFamily={FONT}
        fontWeight={active ? 500 : 400}
      >
        {label}
      </text>
    </g>
  );
}

export function BearingFitChart({
  bandIndex,
  shaft,
  hole,
  holeAlt,
}: {
  bandIndex: number;
  shaft?: string;
  hole?: string;
  holeAlt?: string | null;
}) {
  const { locale } = useLocale();
  const uid = useId().replace(/:/g, "");
  const i = bandIndex >= 0 ? bandIndex : 3;

  const ums: number[] = [];
  for (const k of HOUSING_CHART) {
    ums.push(HOLE[k].ES[i], HOLE[k].EI[i]);
  }
  for (const k of SHAFT_CHART) {
    ums.push(SHAFT[k].es[i], SHAFT[k].ei[i]);
  }
  const maxAbs = Math.max(12, ...ums.map((n) => Math.abs(n)));
  const scale = 52 / maxAbs;

  const chartX = 188;
  const chartW = 460;
  const stepH = chartW / HOUSING_CHART.length;
  const stepS = chartW / SHAFT_CHART.length;
  const houseZero = 92;
  const shaftZero = 268;

  return (
    <svg
      className="w-full text-ink"
      viewBox="0 0 680 360"
      role="img"
      aria-label={tx(
        locale,
        "Tolerantievelden voor lagerhuis en as, ISO 286, aanbevolen klasse gemarkeerd",
        "Tolerance zones for housing and shaft, ISO 286, recommended class highlighted",
      )}
    >
      <HatchDefs uid={uid} />
      <rect
        x="24"
        y="22"
        width="140"
        height="36"
        rx="4"
        fill={`url(#${uid}-a)`}
        stroke="currentColor"
      />
      <text x="94" y="45" textAnchor="middle" fill="currentColor" fontSize="12" fontFamily={FONT}>
        {tx(locale, "Lagerhuis", "Housing")}
      </text>
      <rect
        x="24"
        y="302"
        width="140"
        height="36"
        rx="4"
        fill={`url(#${uid}-b)`}
        stroke="currentColor"
      />
      <text x="94" y="325" textAnchor="middle" fill="currentColor" fontSize="12" fontFamily={FONT}>
        {tx(locale, "As", "Shaft")}
      </text>
      <rect
        x="44"
        y="66"
        width="100"
        height="88"
        rx="8"
        fill="color-mix(in oklab, var(--accent) 22%, var(--paper))"
        stroke="currentColor"
      />
      <rect
        x="56"
        y="206"
        width="76"
        height="88"
        rx="8"
        fill="var(--paper-muted)"
        stroke="currentColor"
      />
      <circle
        cx="94"
        cy="180"
        r="28"
        fill="color-mix(in oklab, var(--accent) 40%, var(--paper))"
        stroke="currentColor"
      />
      <circle cx="84" cy="170" r="8" fill="var(--paper)" opacity="0.5" />
      <text
        x="16"
        y="190"
        fill="currentColor"
        fontSize="10"
        fontFamily={FONT}
        transform="rotate(-90 16 190)"
        opacity="0.7"
      >
        {tx(locale, "Tolerantievelden", "Tolerance zones")}
      </text>

      <line
        x1={chartX}
        y1={houseZero}
        x2={chartX + chartW}
        y2={houseZero}
        stroke="currentColor"
        strokeWidth="1"
      />
      <text
        x={chartX - 8}
        y={houseZero + 4}
        textAnchor="end"
        fill="currentColor"
        fontSize="10"
        fontFamily={FONT}
      >
        +0
      </text>
      {HOUSING_CHART.map((k, idx) => (
        <ZoneBar
          key={k}
          x={chartX + stepH * (idx + 0.5)}
          zeroY={houseZero}
          labelY={houseZero + 66}
          hi={HOLE[k].ES[i]}
          lo={HOLE[k].EI[i]}
          scale={scale}
          label={k}
          active={k === hole}
          alt={k === holeAlt}
        />
      ))}

      <line
        x1={chartX}
        y1={shaftZero}
        x2={chartX + chartW}
        y2={shaftZero}
        stroke="currentColor"
        strokeWidth="1"
      />
      <text
        x={chartX - 8}
        y={shaftZero + 4}
        textAnchor="end"
        fill="currentColor"
        fontSize="10"
        fontFamily={FONT}
      >
        +0
      </text>
      {SHAFT_CHART.map((k, idx) => (
        <ZoneBar
          key={k}
          x={chartX + stepS * (idx + 0.5)}
          zeroY={shaftZero}
          labelY={shaftZero - 58}
          hi={SHAFT[k].es[i]}
          lo={SHAFT[k].ei[i]}
          scale={scale}
          label={k}
          active={k === shaft}
        />
      ))}
    </svg>
  );
}
