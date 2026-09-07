#!/usr/bin/env node
/**
 * Stage the four binary assets @vercel/og needs into ONE directory.
 *
 * They live in two packages (@vercel/og/dist and harfbuzzjs) but the emscripten
 * glue finds them via a single `__dirname`, which src/lib/og/render.ts sets —
 * so they have to be co-located. This build does not copy non-JS files next to
 * the server bundle on its own (the same gap that broke PGLite), hence this
 * step, which runs after `vite build` and also seeds a dev/test copy.
 *
 * Idempotent: safe to run repeatedly, and it fails loudly if a source file
 * moved in a dependency update rather than leaving a half-staged directory.
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

function pkgDir(pkg) {
  return dirname(require.resolve(`${pkg}/package.json`));
}

const SOURCES = [
  join(pkgDir("@vercel/og"), "dist/resvg.wasm"),
  join(pkgDir("@vercel/og"), "dist/yoga.wasm"),
  join(pkgDir("@vercel/og"), "dist/Geist-Regular.ttf"),
  join(pkgDir("harfbuzzjs"), "hb.wasm"),
];

// Deployed function bundle first; the cache copy keeps dev and `npm test`
// working without a build.
const TARGETS = [
  ".vercel/output/functions/__server.func/og-assets",
  "node_modules/.cache/og-assets",
];

const missing = SOURCES.filter((src) => !existsSync(src));
if (missing.length) {
  console.error(`[og-assets] source file(s) missing:\n  ${missing.join("\n  ")}`);
  console.error("[og-assets] a dependency update probably moved them — check @vercel/og/harfbuzzjs.");
  process.exit(1);
}

let staged = 0;
for (const target of TARGETS) {
  // Only create the function-bundle copy when a build actually produced one.
  if (target.startsWith(".vercel") && !existsSync(".vercel/output/functions/__server.func")) {
    continue;
  }
  mkdirSync(target, { recursive: true });
  for (const src of SOURCES) {
    copyFileSync(src, join(target, src.split("/").pop()));
  }
  staged += 1;
  console.log(`[og-assets] staged ${SOURCES.length} files -> ${target}`);
}

if (staged === 0) console.log("[og-assets] nothing to stage.");
