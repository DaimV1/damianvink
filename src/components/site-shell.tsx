import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function SiteShell({
  children,
  subnav,
}: {
  children: ReactNode;
  subnav?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-paper text-ink">
      <div className="grid-bg print:hidden" aria-hidden="true" />
      <div className="sticky top-0 z-40 bg-paper print:hidden">
        <SiteHeader />
        {subnav}
      </div>
      <main id="inhoud" className="relative z-[1] flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function PageWrap({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={
        wide
          ? "mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14"
          : "mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14"
      }
    >
      {children}
    </div>
  );
}
