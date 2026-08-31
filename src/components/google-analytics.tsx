import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { trackPageview } from "@/lib/analytics";

export function GoogleAnalytics() {
  const href = useRouterState({
    select: (s) => s.location.pathname + s.location.searchStr + s.location.hash,
  });

  useEffect(() => {
    trackPageview(href);
  }, [href]);

  return null;
}
