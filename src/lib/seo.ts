export const SITE_ORIGIN = "https://www.damianvink.nl";
export const SITE_NAME = "Damian Vink";
export const DEFAULT_DESCRIPTION =
  "Damian Vink, Project Engineer werktuigbouwkunde. Engineering toolkit (ISO 286, DIN 6885, lagerpassingen) en contact.";

export function absUrl(path: string) {
  if (path === "/") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${path}`;
}

export function pageHead({
  title,
  description,
  path,
  noindex = false,
  ogType = "website",
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  ogType?: "website" | "profile";
}) {
  const url = absUrl(path);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: noindex ? "noindex, follow" : "index, follow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: ogType },
      { property: "og:locale", content: "nl_NL" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:image", content: `${SITE_ORIGIN}/og.jpg` },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Damian Vink",
  url: `${SITE_ORIGIN}/`,
  jobTitle: "Project Engineer",
  description: DEFAULT_DESCRIPTION,
  email: "mailto:damianvink@live.nl",
  nationality: "NL",
  knowsLanguage: ["nl", "en"],
  worksFor: {
    "@type": "Organization",
    name: "Protakt",
    url: "https://www.protakt.nl",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Hogeschool Rotterdam",
  },
  sameAs: [
    "https://www.linkedin.com/in/damianvink",
    "https://x.com/damianvink_",
    "https://www.instagram.com/damianvink_",
    "https://github.com/DaimV1",
  ],
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: `${SITE_ORIGIN}/`,
  inLanguage: "nl-NL",
  description: DEFAULT_DESCRIPTION,
  publisher: { "@id": `${SITE_ORIGIN}/#person` },
};

export function softwareJsonLd({
  name,
  path,
  description,
  featureList,
}: {
  name: string;
  path: string;
  description: string;
  featureList: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url: absUrl(path),
    applicationCategory: "EngineeringApplication",
    operatingSystem: "Web",
    inLanguage: "nl-NL",
    description,
    featureList,
    author: { "@type": "Person", name: SITE_NAME, url: `${SITE_ORIGIN}/` },
    isAccessibleForFree: true,
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function webPageJsonLd({
  name,
  path,
  description,
}: {
  name: string;
  path: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    url: absUrl(path),
    description,
    inLanguage: "nl-NL",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_ORIGIN}/` },
    author: { "@type": "Person", name: SITE_NAME, url: `${SITE_ORIGIN}/` },
  };
}
