import { test } from "node:test";
import assert from "node:assert/strict";
import { validateDemoInput, examples, modes } from "../src/lib/ai/demo.ts";
import { generate } from "../src/lib/ai/provider.server.ts";

test("AI input rejects unsupported modes, locales and lengths", () => {
  const valid = { mode: "rewrite", locale: "nl", text: "Some text to improve" };
  assert.deepEqual(validateDemoInput(valid), valid);
  for (const invalid of [
    null,
    { ...valid, mode: "admin" },
    { ...valid, locale: "fr" },
    { ...valid, text: "short" },
    { ...valid, text: "x".repeat(3001) },
  ])
    assert.throws(() => validateDemoInput(invalid));
  for (const locale of ["nl", "en"])
    for (const mode of modes) assert.ok(examples[locale][mode].output.length > 50);
});

test("AI provider handles configuration, completed output and failure without leaking errors", async () => {
  const original = globalThis.fetch;
  const previousKey = process.env.OPENAI_API_KEY;
  const previousEnabled = process.env.AI_DEMO_ENABLED;
  const data = { mode: "rewrite", locale: "nl", text: "Some text to improve" };
  try {
    process.env.AI_DEMO_ENABLED = "false";
    globalThis.fetch = async () => {
      throw new Error("must not call provider");
    };
    assert.equal((await generate(data)).error, "unavailable");
    process.env.AI_DEMO_ENABLED = "true";
    process.env.OPENAI_API_KEY = "test-only";
    globalThis.fetch = async (_url, options) => {
      const body = JSON.parse(options.body);
      assert.equal(body.store, false);
      assert.equal(body.max_output_tokens, 800);
      assert.equal(body.input, data.text);
      return Response.json({
        status: "completed",
        output: [{ content: [{ type: "output_text", text: "Improved text" }] }],
      });
    };
    assert.deepEqual(await generate(data), { ok: true, text: "Improved text" });
    globalThis.fetch = async () =>
      Response.json({
        status: "incomplete",
        output: [{ content: [{ type: "output_text", text: "Partial" }] }],
      });
    assert.equal((await generate(data)).error, "failed");
    globalThis.fetch = async () => new Response("private provider detail", { status: 429 });
    assert.equal((await generate(data)).error, "busy");
    globalThis.fetch = async () => {
      throw new Error("secret provider detail");
    };
    assert.deepEqual(await generate(data), { ok: false, error: "failed" });
  } finally {
    globalThis.fetch = original;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousEnabled === undefined) delete process.env.AI_DEMO_ENABLED;
    else process.env.AI_DEMO_ENABLED = previousEnabled;
  }
});
