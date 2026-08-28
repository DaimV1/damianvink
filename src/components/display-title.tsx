import { cn } from "@/lib/utils";

/**
 * Full title stays one string in the DOM (screen readers / crawlers).
 * `accent` is a suffix of `text` and is only colored — no extra space.
 */
export function DisplayTitle({
  text,
  accent,
  as: Tag = "h1",
  className,
}: {
  text: string;
  accent?: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "font-display text-[clamp(2.25rem,6vw,4.75rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink",
        className,
      )}
    >
      <TitleParts text={text} accent={accent} />
    </Tag>
  );
}

export function SectionTitle({
  text,
  accent,
  className,
}: {
  text: string;
  accent?: string;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "font-display text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-ink",
        className,
      )}
    >
      <TitleParts text={text} accent={accent} />
    </h2>
  );
}

function TitleParts({ text, accent }: { text: string; accent?: string }) {
  const tail = accent && text.endsWith(accent) ? accent : text;
  const head = text.slice(0, text.length - tail.length);
  return (
    <>
      {head}
      <span className="text-accent">{tail}</span>
    </>
  );
}
