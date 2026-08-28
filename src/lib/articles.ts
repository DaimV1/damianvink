export type Article = {
  slug: string;
  href: string;
  title: string;
  date: string;
  dateLabel: string;
  description: string;
};

export const ARTICLES: Article[] = [
  {
    slug: "usb-c-labtafel-mhs",
    href: "/denk/blog/usb-c-labtafel-mhs",
    title: "USB-C voor de labtafel: Anthropic’s Model Hardware Standard",
    date: "2026-08-27",
    dateLabel: "27 augustus 2026",
    description:
      "Niet slimmer, maar aangesloten. Anthropic’s Model Hardware Standard: een drivercontract voor agents op programmeerbare hardware. USB-C is een metafoor, geen IEC-connector.",
  },
];
