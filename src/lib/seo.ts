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
  ogType?: "website" | "profile" | "article";
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
      { property: "og:locale:alternate", content: "en_US" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:image", content: `${SITE_ORIGIN}/og.jpg` },
      { property: "og:image:alt", content: title },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: `${SITE_ORIGIN}/og.jpg` },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "alternate", type: "text/plain", href: `${SITE_ORIGIN}/llms.txt`, title: "llms.txt" },
    ],
  };
}

export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_ORIGIN}/#person`,
  name: "Damian Vink",
  url: `${SITE_ORIGIN}/`,
  jobTitle: "Project Engineer",
  description: DEFAULT_DESCRIPTION,
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
  inLanguage: ["nl-NL", "en"],
  description: DEFAULT_DESCRIPTION,
  publisher: { "@id": `${SITE_ORIGIN}/#person` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_ORIGIN}/toolkit?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
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
    inLanguage: ["nl-NL", "en"],
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
    inLanguage: ["nl-NL", "en"],
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_ORIGIN}/` },
    author: { "@type": "Person", name: SITE_NAME, url: `${SITE_ORIGIN}/` },
  };
}

export function articleJsonLd({
  headline,
  path,
  description,
  datePublished,
}: {
  headline: string;
  path: string;
  description: string;
  datePublished: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    url: absUrl(path),
    description,
    datePublished,
    dateModified: datePublished,
    inLanguage: "nl-NL",
    author: { "@type": "Person", name: SITE_NAME, url: `${SITE_ORIGIN}/` },
    publisher: { "@type": "Person", name: SITE_NAME, url: `${SITE_ORIGIN}/` },
    mainEntityOfPage: absUrl(path),
  };
}

export function breadcrumbJsonLd(items: { name: string; path?: string }[]) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: absUrl(item.path) } : {}),
    })),
  };
}

export function itemListJsonLd({
  name,
  path,
  items,
}: {
  name: string;
  path: string;
  items: { name: string; url: string; description?: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: absUrl(path),
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absUrl(item.url),
      ...(item.description ? { description: item.description } : {}),
    })),
  };
}
