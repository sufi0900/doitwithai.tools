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
import { outputSchema as mapOutputSchema } from "../../features/topical-map/schema";

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
test("compact schemas remove decoder bounds but keep guidance, field names, types, enums and strict local checks", () => {
  const source = z
    .object({
      minItems: z.string().min(3).max(8),
      nodes: z
        .array(
          z
            .object({
              id: z.string().regex(/^n[1-9]$/),
              intent: z.enum(["learn", "buy"]),
            })
            .strict(),
        )
        .min(2)
        .max(25),
    })
    .strict();
  const full = geminiTextFormat(source, "full");
  const compact = geminiTextFormat(source, "compact", { compact: true });
  const props = compact.schema.properties as any;
  assert.equal(props.minItems.type, "string");
  assert.equal(props.minItems.minLength, undefined);
  assert.match(props.minItems.description, /Minimum string length: 3/);
  assert.equal(props.nodes.maxItems, undefined);
  assert.match(props.nodes.description, /Maximum item count: 25/);
  assert.equal(props.nodes.items.properties.id.pattern, undefined);
  assert.deepEqual(props.nodes.items.properties.intent.enum, ["learn", "buy"]);
  assert.equal(props.nodes.items.additionalProperties, false);
  assert.deepEqual(compact.schema.required, ["minItems", "nodes"]);
  assert.equal((full.schema.properties as any).nodes.maxItems, 25);
  assert.throws(() =>
    compact.parse({ minItems: "longer than allowed", nodes: [] }),
  );
  assert.throws(() =>
    compact.parse({
      minItems: "valid",
      nodes: [
        { id: "wrong", intent: "learn" },
        { id: "n2", intent: "buy" },
      ],
    }),
  );
  for (const schema of [
    mapOutputSchema,
    outlineOutputSchema,
    clusterOutputSchema,
  ]) {
    const encoded = geminiTextFormat(schema, "tool", { compact: true }).schema;
    assert.doesNotMatch(
      JSON.stringify(encoded),
      /"(?:minItems|maxItems|minLength|maxLength|pattern)":/,
    );
    assert.throws(() =>
      geminiTextFormat(schema, "tool", { compact: true }).parse({}),
    );
  }
});

test("token exhaustion, safety refusal and missing candidates remain distinct and never accept partial output", async () => {
  const savedFetch = globalThis.fetch;
  const savedKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-key";
  try {
    for (const [response, expected, reason] of [
      [
        envelope('{"answer":"partial"}', "MAX_TOKENS"),
        "OUTPUT_LIMIT_REACHED",
        "MAX_TOKENS",
      ],
      [envelope('{"answer":"blocked"}', "SAFETY"), "OUTPUT_BLOCKED", "SAFETY"],
      [
        Response.json({
          promptFeedback: { blockReason: "PROHIBITED_CONTENT" },
        }),
        "OUTPUT_BLOCKED",
        "PROHIBITED_CONTENT",
      ],
      [
        Response.json({ candidates: [] }),
        "INCOMPLETE_OUTPUT",
        "OTHER_OR_MISSING",
      ],
      [
        envelope("bad", "private-reason"),
        "INCOMPLETE_OUTPUT",
        "OTHER_OR_MISSING",
      ],
    ] as const) {
      let calls = 0;
      globalThis.fetch = (async () => {
        calls++;
        return response;
      }) as typeof fetch;
      await assert.rejects(getGeminiClient().generate(params), (error) => {
        assert.ok(error instanceof GeminiError);
        assert.equal(error.code, expected);
        assert.equal(error.finishReason, reason);
        assert.equal(error.upstreamStatus, 200);
        return true;
      });
      assert.equal(calls, 1);
    }
  } finally {
    globalThis.fetch = savedFetch;
    if (savedKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = savedKey;
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
    for (const status of [400, 429, 403, 404]) {
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
      /PROVIDER_TIMEOUT/,
    );
  } finally {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = oldKey;
  }
});

test("provider diagnostics retain upstream status without logging submitted or provider content", async () => {
  const savedFetch = globalThis.fetch;
  const savedKey = process.env.GEMINI_API_KEY;
  const savedWrite = process.stderr.write;
  const logs: string[] = [];
  process.env.GEMINI_API_KEY = "private-key-never-log";
  process.stderr.write = ((value: string) => {
    logs.push(value);
    return true;
  }) as typeof process.stderr.write;
  try {
    for (const [status, upstreamEnum, expected] of [
      [500, "INTERNAL", "PROVIDER_INTERNAL_ERROR"],
      [503, "UNAVAILABLE", "PROVIDER_UNAVAILABLE"],
      [400, "INVALID_ARGUMENT", "PROVIDER_BAD_REQUEST"],
      [502, "private-status-never-log", "PROVIDER_FAILED"],
    ] as const) {
      globalThis.fetch = (async () =>
        Response.json(
          {
            error: {
              status: upstreamEnum,
              message: "private-provider-message-never-log",
            },
          },
          { status },
        )) as typeof fetch;
      await assert.rejects(
        getGeminiClient().generate({
          ...params,
          input: [
            {
              role: "user",
              content: [
                { type: "input_text", text: "private-prompt-never-log" },
                {
                  type: "input_image",
                  image_url: "data:image/png;base64,aGVsbG8=",
                },
              ],
            },
          ],
        }),
        (error) => {
          assert.ok(error instanceof GeminiError);
          assert.equal(error.code, expected);
          assert.equal(error.upstreamStatus, status);
          assert.match(
            geminiFailure(error)!.message,
            /Reference: [a-f0-9-]{36}/,
          );
          const diagnostic = JSON.parse(logs.at(-1)!);
          assert.equal(diagnostic.upstreamStatus, status);
          assert.equal(diagnostic.inputMode, "image");
          assert.equal(diagnostic.requestId, error.requestId);
          assert.equal(
            diagnostic.providerStatus,
            status === 502 ? undefined : upstreamEnum,
          );
          return true;
        },
      );
    }
    assert.doesNotMatch(logs.join(""), /private-|aGVsbG8=/);
  } finally {
    globalThis.fetch = savedFetch;
    process.stderr.write = savedWrite;
    if (savedKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = savedKey;
  }
});

test("schema-specific JSON mode recovery is bounded and still rejects invalid drafts", async () => {
  const savedFetch = globalThis.fetch,
    savedKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-key";
  const recoveryParams = {
    ...params,
    text: { format: { ...format, name: "article_outline" } },
  };
  try {
    for (const text of ['{"answer":"Valid answer"}', '{"answer":"x"}']) {
      let calls = 0;
      let firstSignal: AbortSignal;
      globalThis.fetch = (async (_url: unknown, options: any) => {
        calls++;
        const body = JSON.parse(options.body);
        if (calls === 1) {
          firstSignal = options.signal;
          assert.ok(body.generationConfig.responseJsonSchema);
          return Response.json(
            {
              error: {
                status: "INVALID_ARGUMENT",
                message: "response_json_schema has too many states for serving",
              },
            },
            { status: 400 },
          );
        }
        assert.equal(options.signal, firstSignal);
        assert.equal(body.generationConfig.responseJsonSchema, undefined);
        assert.equal(
          body.generationConfig.responseMimeType,
          "application/json",
        );
        assert.match(
          body.systemInstruction.parts.at(-1).text,
          /output contract/,
        );
        assert.deepEqual(body.contents[0].parts, [{ text: "A brief" }]);
        return envelope(text);
      }) as typeof fetch;
      if (text.includes("Valid"))
        assert.deepEqual(
          (await getGeminiClient().generate(recoveryParams)).output_parsed,
          { answer: "Valid answer" },
        );
      else
        await assert.rejects(
          getGeminiClient().generate(recoveryParams),
          /MODEL_OUTPUT_INVALID/,
        );
      assert.equal(calls, 2);
    }
    for (const [name, message] of [
      ["article_outline", "Invalid maxOutputTokens"],
      ["example", "response_json_schema unsupported"],
    ]) {
      let calls = 0;
      globalThis.fetch = (async () => {
        calls++;
        return Response.json({ error: { message } }, { status: 400 });
      }) as typeof fetch;
      await assert.rejects(
        getGeminiClient().generate({
          ...recoveryParams,
          text: { format: { ...format, name } },
        }),
        /PROVIDER_BAD_REQUEST/,
      );
      assert.equal(calls, 1);
    }
    let calls = 0;
    globalThis.fetch = (async (_url: unknown, options: any) => {
      if (++calls === 1)
        return Response.json(
          { error: { message: "response_json_schema unsupported" } },
          { status: 400 },
        );
      return new Promise((_resolve, reject) =>
        options.signal.addEventListener("abort", () =>
          reject(new Error("Aborted")),
        ),
      );
    }) as typeof fetch;
    await assert.rejects(
      getGeminiClient().generate(recoveryParams, { timeout: 20 }),
      /PROVIDER_TIMEOUT/,
    );
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = savedFetch;
    if (savedKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = savedKey;
  }
});
