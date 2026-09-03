/**
 * Registers public/sw.js so a previously-visited /toolkit page still opens
 * with no connection (workshop wifi). Production only — a cached dev build
 * would fight Vite's own HMR/module graph.
 */
import { useEffect } from "react";

export function ToolkitOfflineCache() {
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline caching is a nice-to-have; a failed registration should never block the app */
    });
  }, []);

  return null;
}
