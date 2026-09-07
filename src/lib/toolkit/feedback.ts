import { createServerFn } from "@tanstack/react-start";
// Relative + explicit .ts: this module is imported by toolkit.test.ts under
// `node --experimental-strip-types`, which does not resolve the "@/" alias.
import { TOOLS } from "./tools.ts";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_URL_LENGTH = 500;

/** Everything under this prefix is one feedback report per object. */
export const FEEDBACK_PREFIX = "feedback/";

export type SubmitFeedbackInput = {
  toolId: string;
  path: string;
  url?: string;
  message?: string;
  locale?: string;
};

export type FeedbackRecord = SubmitFeedbackInput & {
  /** ISO timestamp, also the sort key baked into the object's pathname. */
  createdAt: string;
};

export function validateFeedbackInput(input: unknown): SubmitFeedbackInput {
  if (!input || typeof input !== "object") throw new Error("invalid input");
  const { toolId, path, url, message, locale } = input as Record<string, unknown>;
  if (typeof toolId !== "string" || !TOOLS.some((t) => t.id === toolId)) {
    throw new Error("invalid toolId");
  }
  if (typeof path !== "string" || !path.startsWith("/toolkit/")) {
    throw new Error("invalid path");
  }
  return {
    toolId,
    path,
    url: typeof url === "string" ? url.slice(0, MAX_URL_LENGTH) : undefined,
    message:
      typeof message === "string" && message.trim()
        ? message.trim().slice(0, MAX_MESSAGE_LENGTH)
        : undefined,
    locale: locale === "en" ? "en" : "nl",
  };
}

/**
 * One object per report, named so a plain lexical `list()` comes back in
 * chronological order: `feedback/<iso>-<rand>.json`. Colons and dots are not
 * great in object keys, so the timestamp is flattened to dashes.
 */
export function buildFeedbackRecord(
  input: SubmitFeedbackInput,
  now: Date,
  rand: string,
): { pathname: string; record: FeedbackRecord } {
  const createdAt = now.toISOString();
  const stamp = createdAt.replace(/[:.]/g, "-");
  return {
    pathname: `${FEEDBACK_PREFIX}${stamp}-${rand}.json`,
    record: { ...input, createdAt },
  };
}

/**
 * "This number looks wrong" feedback from a toolkit calculator. Public and
 * anonymous — this site has no sign-in wired up (see src/lib/auth), so this
 * intentionally does not use authMiddleware. assertSameSiteRequest still
 * blocks scripted cross-site/sibling POSTs (see isolation.server.ts); a real
 * visitor's own page always sends the request same-origin.
 *
 * Storage is Vercel Blob (private store), one JSON object per report — not the
 * Postgres layer in src/lib/db.ts, which has no DATABASE_URL on this project
 * and whose PGLite fallback does not survive a serverless cold start. Reports
 * are append-only and read rarely, so object storage fits; read them back with
 * `npm run feedback:list`.
 */
export const submitToolkitFeedback = createServerFn({ method: "POST" })
  .validator(validateFeedbackInput)
  .handler(async ({ data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // Local dev without the token: keep the report visible in the server log
      // rather than failing the visitor's submit for a config gap.
      console.warn("[feedback] BLOB_READ_WRITE_TOKEN not set — not stored:", data);
      return { ok: true, stored: false } as const;
    }

    const { put } = await import("@vercel/blob");
    const { pathname, record } = buildFeedbackRecord(
      data,
      new Date(),
      crypto.randomUUID().slice(0, 8),
    );
    await put(pathname, JSON.stringify(record, null, 2), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    return { ok: true, stored: true } as const;
  });
