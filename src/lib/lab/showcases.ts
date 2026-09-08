/** Order here is the display order on /lab. */
export const SHOWCASES = [
  {
    id: "zonnestelsel",
    href: "/lab/zonnestelsel",
    title: "Zonnestelsel",
    titleEn: "Solar system",
    tagline: "Interactieve orbitaalsimulatie van de acht planeten.",
    taglineEn: "Interactive orbital simulation of the eight planets.",
    blurb:
      "Sleep om te draaien, scroll om te zoomen, tik een planeet aan voor de cijfers. Snelheid instelbaar, op pauze te zetten.",
    blurbEn:
      "Drag to pan, scroll to zoom, tap a planet for the numbers. Adjustable speed, can be paused.",
  },
] as const;

export type ShowcaseId = (typeof SHOWCASES)[number]["id"];
export type Showcase = (typeof SHOWCASES)[number];

export function showcaseTitle(showcase: Showcase, locale: "nl" | "en") {
  return locale === "en" ? showcase.titleEn : showcase.title;
}

export function showcaseTagline(showcase: Showcase, locale: "nl" | "en") {
  return locale === "en" ? showcase.taglineEn : showcase.tagline;
}

export function showcaseBlurb(showcase: Showcase, locale: "nl" | "en") {
  return locale === "en" ? showcase.blurbEn : showcase.blurb;
}
