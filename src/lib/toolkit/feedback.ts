import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { TOOLS } from "@/lib/toolkit/tools";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_URL_LENGTH = 500;

export type SubmitFeedbackInput = {
  toolId: string;
  path: string;
  url?: string;
  message?: string;
  locale?: string;
};

function validate(input: unknown): SubmitFeedbackInput {
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
 * "This number looks wrong" feedback from a toolkit calculator. Public and
 * anonymous — this site has no sign-in wired up (see src/lib/auth), so this
 * intentionally does not use authMiddleware. assertSameSiteRequest still
 * blocks scripted cross-site/sibling POSTs (see isolation.server.ts); a real
 * visitor's own page always sends the request same-origin.
 *
 * Storage note: this writes through the shared getSql() (Neon in production
 * when DATABASE_URL is set, otherwise an in-memory PGLite fallback that does
 * NOT persist across serverless cold starts). Point DATABASE_URL at a real
 * Postgres instance before relying on this for anything beyond local/preview
 * testing — see migrations/0002_toolkit_feedback.sql.
 */
export const submitToolkitFeedback = createServerFn({ method: "POST" })
  .validator(validate)
  .handler(async ({ data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const sql = await getSql();
    await sql`
      insert into toolkit_feedback (tool_id, path, url, message, locale)
      values (${data.toolId}, ${data.path}, ${data.url ?? null}, ${data.message ?? null}, ${data.locale ?? "nl"})
    `;
    return { ok: true } as const;
  });
