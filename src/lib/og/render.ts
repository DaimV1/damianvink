import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { ReactElement } from "react";

/**
 * @vercel/og in a bundled Nitro/Vercel function needs three things it does not
 * get on its own:
 *
 *  1. `require` — the package ships `"type": "module"` but its esbuild bundle
 *     still calls an internal `__require("fs")` shim, which only resolves when
 *     a GLOBAL `require` exists. Under plain ESM it throws
 *     `Dynamic require of "fs" is not supported`.
 *  2. `__dirname` — undefined in ESM, and the emscripten glue reads it to find
 *     its wasm.
 *  3. The asset files themselves. resvg.wasm/yoga.wasm/Geist-Regular.ttf ship
 *     in @vercel/og/dist, hb.wasm ships in harfbuzzjs — two different
 *     directories, but only one `__dirname` global to point at them. So
 *     scripts/og-assets.mjs stages all four into ONE directory, and that is
 *     what `__dirname` points at.
 *
 * Same class of problem as the PGLite asset that broke the feedback endpoint:
 * this build does not copy non-JS files next to the server bundle, so anything
 * doing `readFileSync(__dirname + '/x.wasm')` has to be staged deliberately.
 */
const ASSET_DIR_NAME = "og-assets";

function resolveAssetDir(): string {
  const candidates = [
    // Deployed: staged next to the function bundle (cwd is /var/task).
    join(process.cwd(), ASSET_DIR_NAME),
    // vite preview / local build output.
    join(process.cwd(), ".vercel/output/functions/__server.func", ASSET_DIR_NAME),
    // Dev server: staged into node_modules/.cache by the same script.
    join(process.cwd(), "node_modules/.cache", ASSET_DIR_NAME),
  ];
  const found = candidates.find((dir) => existsSync(join(dir, "resvg.wasm")));
  if (!found) {
    throw new Error(
      `OG assets not found (looked in: ${candidates.join(", ")}). Run scripts/og-assets.mjs.`,
    );
  }
  return found;
}

type ImageResponseCtor = new (
  element: ReactElement,
  options: { width: number; height: number; headers?: Record<string, string> },
) => Response;

let ctor: Promise<ImageResponseCtor> | null = null;

function loadImageResponse(): Promise<ImageResponseCtor> {
  ctor ??= (async () => {
    const g = globalThis as typeof globalThis & {
      require?: unknown;
      __dirname?: string;
    };
    g.require ??= createRequire(import.meta.url);
    g.__dirname ??= resolveAssetDir();
    const mod = (await import("@vercel/og")) as unknown as {
      ImageResponse: ImageResponseCtor;
    };
    return mod.ImageResponse;
  })().catch((err) => {
    ctor = null; // don't memoize a failure — let the next request retry
    throw err;
  });
  return ctor;
}

/** Render `element` to a 1200×630 PNG response, cached hard at the edge. */
export async function renderOgImage(element: ReactElement): Promise<Response> {
  const ImageResponse = await loadImageResponse();
  return new ImageResponse(element, {
    width: 1200,
    height: 630,
    headers: {
      // Deterministic for a given query string, so let crawlers and the CDN
      // keep it; a redeploy changes the URL's content only if the data changed.
      "cache-control": "public, immutable, no-transform, max-age=86400",
    },
  });
}
