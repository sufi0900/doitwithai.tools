import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isGeminiConfigured,
  GeminiError,
  geminiFailure,
} from "../../lib/ai-tools/gemini";
import { metaTitleOutputSchema } from "../../features/meta-title-generator/schema";
import { slugOutputSchema } from "../../features/slug-generator/schema";
import { schemaAnalysisOutputSchema } from "../../features/schema-generator/schema";
import { writingOutputSchema } from "../../features/writing-tools/schema";
import { outlineOutputSchema } from "../../features/article-outline/schema";
import { readabilityOutputSchema } from "../../features/readability/schema";
import { altOutputSchema } from "../../features/alt-text/schema";
import { clusterOutputSchema } from "../../features/keyword-clustering/schema";

const format = geminiTextFormat(
  z.object({ answer: z.string().min(2) }).strict(),
  "example",
);
const params = {
  model: "test-flash-lite",
  max_output_tokens: 1000,
  input: [
    { role: "system" as const, content: "Use the supplied brief." },
    { role: "user" as const, content: "A brief" },
  ],
  text: { format },
};
const envelope = (text: string, finishReason = "STOP") =>
  Response.json({
    candidates: [
      {
        finishReason,
        content: { parts: [{ thought: true, text: "Hidden" }, { text }] },
      },
    ],
  });

test("shared Gemini model and overrides do not read old OpenAI settings", () => {
  const saved = { ...process.env };
  try {
    delete process.env.GEMINI_MODEL;
    delete process.env.GEMINI_ALT_TEXT_MODEL;
    process.env.OPENAI_META_TITLE_MODEL = "old-model";
    assert.equal(getGeminiModel("META_TITLE"), "");
    process.env.GEMINI_MODEL = "gemini-3.5-flash-lite";
    assert.equal(getGeminiModel("ALT_TEXT"), "gemini-3.5-flash-lite");
    process.env.GEMINI_ALT_TEXT_MODEL = "test-vision";
    assert.equal(getGeminiModel("ALT_TEXT"), "test-vision");
    process.env.GEMINI_API_KEY = "test-key";
    assert.equal(isGeminiConfigured("models/invalid"), false);
    assert.equal(isGeminiConfigured("test-vision"), true);
  } finally {
    process.env = saved;
  }
});
test("all migrated output schemas serialize without relying on OpenAI helpers", () => {
  for (const schema of [
    metaTitleOutputSchema,
    slugOutputSchema,
    schemaAnalysisOutputSchema,
    writingOutputSchema,
    outlineOutputSchema,
    readabilityOutputSchema,
    altOutputSchema,
    clusterOutputSchema,
  ]) {
    const f = geminiTextFormat(schema, "tool");
    assert.equal(f.schema.type, "object");
    assert.equal(f.schema.$schema, undefined);
    assert.ok(f.schema.properties);
    assert.throws(() => f.parse({}));
  }
});
test("native Gemini transport validates JSON, sends images inline, and does not call OpenAI", async () => {
  const oldFetch = globalThis.fetch,
    oldKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-key";
  let calls = 0;
  try {
    globalThis.fetch = (async (url: unknown, options: any) => {
      calls++;
      assert.equal(
        url,
        "https://generativelanguage.googleapis.com/v1beta/models/test-flash-lite:generateContent",
      );
      assert.equal(options.headers["x-goog-api-key"], "test-key");
      assert.equal(options.headers.Authorization, undefined);
      const body = JSON.parse(options.body);
      assert.equal(body.store, false);
      assert.equal(body.tools, undefined);
      assert.equal(body.generationConfig.responseMimeType, "application/json");
      assert.equal(body.generationConfig.maxOutputTokens, 1000);
      assert.deepEqual(body.contents[0].parts[1], {
        inlineData: { mimeType: "image/png", data: "aGVsbG8=" },
      });
      return envelope('{"answer":"Valid output"}');
    }) as typeof fetch;
    const result = await getGeminiClient().generate({
      ...params,
      input: [
        params.input[0],
        {
          role: "user",
          content: [
            { type: "input_text", text: "Image context" },
            {
              type: "input_image",
              image_url: "data:image/png;base64,aGVsbG8=",
            },
          ],
        },
      ],
    });
    assert.deepEqual(result.output_parsed, { answer: "Valid output" });
    assert.equal(calls, 1);
    for (const response of [
      envelope('{"answer":"ok"}', "MAX_TOKENS"),
      envelope("not JSON"),
      envelope('{"answer":"x"}'),
      Response.json({ candidates: [] }),
      new Response("x".repeat(500001)),
    ]) {
      globalThis.fetch = (async () => response) as typeof fetch;
      await assert.rejects(getGeminiClient().generate(params));
    }
  } finally {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = oldKey;
  }
});
test("Gemini quota, authentication, and unavailable models return safe errors without retries", async () => {
  const oldFetch = globalThis.fetch,
    oldKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-key";
  try {
    for (const status of [429, 403, 404]) {
      let calls = 0;
      globalThis.fetch = (async () => {
        calls++;
        return new Response("secret provider details", { status });
      }) as typeof fetch;
      await assert.rejects(getGeminiClient().generate(params), (error) => {
        assert.ok(error instanceof GeminiError);
        assert.ok(geminiFailure(error));
        assert.equal(error.message.includes("secret"), false);
        return true;
      });
      assert.equal(calls, 1);
    }
    globalThis.fetch = (async (_url: unknown, options: any) =>
      new Promise((_resolve, reject) =>
        options.signal.addEventListener("abort", () =>
          reject(new Error("Aborted")),
        ),
      )) as typeof fetch;
    await assert.rejects(
      getGeminiClient().generate(params, { timeout: 5 }),
      /Aborted/,
    );
  } finally {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = oldKey;
  }
});
