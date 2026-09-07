#!/usr/bin/env node
/**
 * Read the "Klopt dit niet?" reports out of the Vercel Blob store.
 *
 *   npm run feedback:list           # newest 50, newest first
 *   npm run feedback:list -- --all  # everything
 *
 * Needs BLOB_READ_WRITE_TOKEN. Easiest way to get it locally:
 *   npx vercel link && npx vercel env pull .env.local
 * then run with it loaded, e.g. `set -a && . ./.env.local && set +a`.
 *
 * The store is private, so blob contents are fetched through the SDK's get()
 * rather than by plain URL — the URLs in the listing are not readable without
 * a token, which is the point.
 */
import { get, list } from "@vercel/blob";

const FEEDBACK_PREFIX = "feedback/";

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error(
    "BLOB_READ_WRITE_TOKEN is not set.\n" +
      "Pull it with:  npx vercel env pull .env.local\n" +
      "then load it:  set -a && . ./.env.local && set +a",
  );
  process.exit(1);
}

const all = process.argv.includes("--all");

async function collect() {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix: FEEDBACK_PREFIX, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  // Pathnames start with the ISO timestamp, so lexical desc == newest first.
  blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
  return all ? blobs : blobs.slice(0, 50);
}

async function readRecord(pathname) {
  const res = await get(pathname, { access: "private", useCache: false });
  if (!res || res.statusCode !== 200) return null;
  return JSON.parse(await new Response(res.stream).text());
}

const blobs = await collect();
if (blobs.length === 0) {
  console.log("No feedback yet.");
  process.exit(0);
}

console.log(`${blobs.length} report(s)${all ? "" : " (newest 50, pass --all for everything)"}:\n`);
for (const blob of blobs) {
  let record;
  try {
    record = await readRecord(blob.pathname);
  } catch (err) {
    console.log(`- ${blob.pathname}  [unreadable: ${err?.message || err}]`);
    continue;
  }
  if (!record) {
    console.log(`- ${blob.pathname}  [missing]`);
    continue;
  }
  console.log(`${record.createdAt}  ${record.toolId}  (${record.locale})`);
  console.log(`  ${record.url || record.path}`);
  console.log(`  ${record.message ? record.message.replace(/\n/g, "\n  ") : "(no message)"}`);
  console.log("");
}
