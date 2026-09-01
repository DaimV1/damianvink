import { useEffect, useState } from "react";
import { tx, useLocale } from "@/lib/i18n/locale";
import {
  clearStoredConsent,
  getStoredConsent,
  loadGoogleAnalytics,
  setStoredConsent,
} from "@/lib/analytics";
import { Button } from "@/components/ui/button";

/** Fires when a footer link wants to reopen the banner (e.g. to change a prior choice). */
const REOPEN_EVENT = "cookie-consent:reopen";

export function reopenCookieConsent() {
  clearStoredConsent();
  window.dispatchEvent(new Event(REOPEN_EVENT));
}

export function CookieConsent() {
  const { locale } = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored === "granted") {
      loadGoogleAnalytics();
    } else if (stored === null) {
      setVisible(true);
    }
    const onReopen = () => setVisible(true);
    window.addEventListener(REOPEN_EVENT, onReopen);
    return () => window.removeEventListener(REOPEN_EVENT, onReopen);
  }, []);

  function accept() {
    setStoredConsent("granted");
    loadGoogleAnalytics();
    setVisible(false);
  }

  function decline() {
    setStoredConsent("denied");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={tx(locale, "Cookievoorkeuren", "Cookie preferences")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line-strong bg-elevated px-4 py-4 shadow-[var(--shadow)] sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-muted">
          {tx(
            locale,
            "Deze site gebruikt Google Analytics om bezoek te meten. Cookies worden alleen geplaatst na akkoord.",
            "This site uses Google Analytics to measure visits. Cookies are only set after you agree.",
          )}
        </p>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={decline}>
            {tx(locale, "Weigeren", "Decline")}
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={accept}>
            {tx(locale, "Accepteren", "Accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
