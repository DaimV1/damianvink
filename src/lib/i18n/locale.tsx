import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "nl" | "en";

const STORAGE_KEY = "locale";

const LocaleContext = createContext<{
  locale: Locale;
  toggle: () => void;
  setLocale: (next: Locale) => void;
} | null>(null);

function readLocale(): Locale {
  if (typeof document === "undefined") return "nl";
  const attr = document.documentElement.getAttribute("lang");
  if (attr === "en" || attr === "nl") return attr;
  return "nl";
}

function applyLocale(next: Locale) {
  document.documentElement.setAttribute("lang", next);
  localStorage.setItem(STORAGE_KEY, next);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("nl");

  useEffect(() => {
    setLocaleState(readLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    applyLocale(next);
    setLocaleState(next);
  }, []);

  const toggle = useCallback(() => {
    setLocaleState((prev) => {
      const next: Locale = prev === "nl" ? "en" : "nl";
      applyLocale(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ locale, toggle, setLocale }), [locale, toggle, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

/** Pick Dutch or English inline. Keep both strings next to the call site. */
export function tx(locale: Locale, nl: string, en: string) {
  return locale === "en" ? en : nl;
}
