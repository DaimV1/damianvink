import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

/**
 * Every route's search schema is flat strings (q, d, fit) — the default
 * JSON-based serializer quotes any value that looks numeric (e.g. d=20
 * becomes d="20" in the URL), which defeats the point of a pasteable share
 * link. Plain URLSearchParams keeps ?d=20&fit=H7%2Fg6 readable.
 */
function parseSearch(searchStr: string): Record<string, unknown> {
  const params = new URLSearchParams(searchStr[0] === "?" ? searchStr.slice(1) : searchStr);
  const out: Record<string, unknown> = {};
  for (const [key, value] of params) out[key] = value;
  return out;
}

function stringifySearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    defaultPreload: "intent",
    scrollRestoration: true,
    parseSearch,
    stringifySearch,
  });
}
