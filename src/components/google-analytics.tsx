import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { trackPageview } from "@/lib/analytics";

export function GoogleAnalytics() {
  const href = useRouterState({
    select: (s) => s.location.pathname + s.location.searchStr + s.location.hash,
  });
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    trackPageview(href);
  }, [href]);

  return null;
}
