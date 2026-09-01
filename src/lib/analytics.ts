export const GA_MEASUREMENT_ID = "G-C0F8CBQPT0";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Official Google tag snippet (inline config). */
export const GA_BOOT_SCRIPT = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`;

export function trackPageview(path: string) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/** Cookie consent: GA only loads after explicit opt-in, per visitor. */
export const CONSENT_STORAGE_KEY = "cookie-consent";
export type ConsentChoice = "granted" | "denied";

export function getStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(CONSENT_STORAGE_KEY);
  return v === "granted" || v === "denied" ? v : null;
}

export function setStoredConsent(choice: ConsentChoice) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  }
}

export function clearStoredConsent() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  }
}

let gaInjected = false;

/** Injects the GA loader + boot snippet. Only call after consent is granted. */
export function loadGoogleAnalytics() {
  if (typeof document === "undefined" || gaInjected) return;
  gaInjected = true;
  const loader = document.createElement("script");
  loader.async = true;
  loader.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(loader);
  const boot = document.createElement("script");
  boot.textContent = GA_BOOT_SCRIPT;
  document.head.appendChild(boot);
}
