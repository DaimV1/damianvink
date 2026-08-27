import { cn } from "@/lib/utils";

export function DisplayTitle({
  before,
  last,
  as: Tag = "h1",
  className,
}: {
  before?: string;
  last: string;
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
      {before ? (
        <>
          {before}{" "}
          <span className="text-accent">{last}</span>
        </>
      ) : (
        <span className="text-accent">{last}</span>
      )}
    </Tag>
  );
}

export function SectionTitle({
  before,
  last,
  className,
}: {
  before?: string;
  last: string;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "font-display text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-ink",
        className,
      )}
    >
      {before ? (
        <>
          {before} <span className="text-accent">{last}</span>
        </>
      ) : (
        <span className="text-accent">{last}</span>
      )}
    </h2>
  );
}
