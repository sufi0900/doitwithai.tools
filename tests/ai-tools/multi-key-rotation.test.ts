import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import {
  DEFAULT_GEMINI_MODEL,
  getGeminiClient,
  getGeminiModel,
  geminiTextFormat,
  getGeminiApiKeys,
} from "../../lib/ai-tools/gemini";

const params = {
  model: "gemini-test",
  max_output_tokens: 1000,
  input: [
    { role: "system" as const, content: "Test system." },
    { role: "user" as const, content: "Test prompt." },
  ],
  text: {
    format: geminiTextFormat(
      z.object({ answer: z.string() }).strict(),
      "rotation_test",
    ),
  },
};

const geminiOk = (text = "Success from Key 2") =>
  Response.json({
    candidates: [
      {
        finishReason: "STOP",
        content: { parts: [{ text: JSON.stringify({ answer: text }) }] },
      },
    ],
  });

test("getGeminiApiKeys gathers primary, comma-separated, numbered and backup keys", () => {
  const env = { ...process.env };
  try {
    process.env.GEMINI_API_KEY = "key-primary";
    process.env.GEMINI_API_KEYS = "key-extra-1, key-extra-2";
    process.env.GEMINI_API_KEY_2 = "key-numbered-2";
    process.env.GEMINI_API_KEY_BACKUP = "key-backup";

    const keys = getGeminiApiKeys();
    assert.deepEqual(keys, [
      "key-primary",
      "key-extra-1",
      "key-extra-2",
      "key-numbered-2",
      "key-backup",
    ]);
  } finally {
    process.env = env;
  }
});

test("when Key 1 hits 429 rate limit, it automatically rotates to Key 2", async () => {
  const env = { ...process.env };
  const origFetch = global.fetch;

  process.env.GEMINI_API_KEY = "key-1-rate-limited";
  process.env.GEMINI_API_KEY_2 = "key-2-healthy";
  delete process.env.GROQ_API_KEY;

  const attemptedKeys: string[] = [];

  global.fetch = async (url, options) => {
    const headers = options?.headers as Record<string, string>;
    const usedKey = headers["x-goog-api-key"];
    attemptedKeys.push(usedKey);

    if (usedKey === "key-1-rate-limited") {
      return Response.json(
        { error: { status: "RESOURCE_EXHAUSTED", message: "Quota exceeded" } },
        { status: 429 },
      );
    }

    if (usedKey === "key-2-healthy") {
      return geminiOk("Recovered from key 2");
    }

    throw new Error("Unexpected key: " + usedKey);
  };

  try {
    const res = await getGeminiClient().generate(params);
    assert.equal(res.provider, "gemini");
    assert.equal(res.output_parsed.answer, "Recovered from key 2");
    assert.deepEqual(attemptedKeys, ["key-1-rate-limited", "key-2-healthy"]);
  } finally {
    process.env = env;
    global.fetch = origFetch;
  }
});


test("when Gemini is exhausted and OpenRouter is configured, it falls back to OpenRouter", async () => {
  const env = { ...process.env };
  const origFetch = global.fetch;

  process.env.GEMINI_API_KEY = "gemini-exhausted";
  process.env.OPENROUTER_API_KEY = "openrouter-free-key";
  delete process.env.GROQ_API_KEY;

  const calls: string[] = [];

  global.fetch = async (url) => {
    calls.push(String(url));
    if (String(url).includes("googleapis.com")) {
      return Response.json(
        { error: { status: "RESOURCE_EXHAUSTED", message: "Quota exhausted" } },
        { status: 429 },
      );
    }
    if (String(url).includes("openrouter.ai")) {
      return Response.json({
        choices: [
          {
            finish_reason: "stop",
            message: {
              content: JSON.stringify({ answer: "Success from OpenRouter" }),
            },
          },
        ],
      });
    }
    throw new Error("Unexpected URL: " + url);
  };

  try {
    const res = await getGeminiClient().generate(params);
    assert.equal(res.provider, "openrouter");
    assert.equal(res.output_parsed.answer, "Success from OpenRouter");
    assert.equal(calls.length, 2);
  } finally {
    process.env = env;
    global.fetch = origFetch;
  }
});

test("getGeminiModel defaults to gemini-flash-lite-latest when GEMINI_MODEL is unset", () => {
  const env = { ...process.env };
  try {
    delete process.env.GEMINI_MODEL;
    delete process.env.GEMINI_AUDIENCE_RESEARCH_MODEL;
    assert.equal(getGeminiModel("AUDIENCE_RESEARCH"), DEFAULT_GEMINI_MODEL);
    assert.equal(getGeminiModel(), "gemini-flash-lite-latest");
  } finally {
    process.env = env;
  }
});

test("HTTP 400 schemaRejected retries in JSON mode for audience_research and any other tool", async () => {
  const env = { ...process.env };
  const origFetch = global.fetch;
  process.env.GEMINI_API_KEY = "key-1";
  delete process.env.GROQ_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  let calls = 0;
  global.fetch = (async (_url, options) => {
    calls++;
    const body = JSON.parse(String(options?.body));
    if (calls === 1) {
      assert.ok(body.generationConfig.responseJsonSchema);
      return Response.json(
        { error: { status: "INVALID_ARGUMENT", message: "response_json_schema has too many states" } },
        { status: 400 },
      );
    }
    assert.equal(body.generationConfig.responseJsonSchema, undefined);
    return geminiOk("Recovered via JSON mode");
  }) as typeof fetch;
  try {
    const res = await getGeminiClient().generate({
      ...params,
      text: {
        format: geminiTextFormat(
          z.object({ answer: z.string() }).strict(),
          "audience_research",
        ),
      },
    });
    assert.equal(res.provider, "gemini");
    assert.equal(res.output_parsed.answer, "Recovered via JSON mode");
    assert.equal(calls, 2);
  } finally {
    process.env = env;
    global.fetch = origFetch;
  }
});

test("HTTP 404 on a deprecated gemini-* model cascades automatically to gemini-flash-lite-latest", async () => {
  const env = { ...process.env };
  const origFetch = global.fetch;
  process.env.GEMINI_API_KEY = "key-1";
  delete process.env.GROQ_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  const calledUrls: string[] = [];
  global.fetch = (async (url) => {
    const s = String(url);
    calledUrls.push(s);
    if (s.includes("gemini-2.5-flash")) {
      return Response.json({ error: { message: "no longer available" } }, { status: 404 });
    }
    if (s.includes("gemini-flash-lite-latest")) {
      return geminiOk("Cascaded to flash-lite-latest");
    }
    throw new Error("Unexpected URL: " + s);
  }) as typeof fetch;
  try {
    const res = await getGeminiClient().generate({
      ...params,
      model: "gemini-2.5-flash",
    });
    assert.equal(res.provider, "gemini");
    assert.equal(res.output_parsed.answer, "Cascaded to flash-lite-latest");
    assert.equal(calledUrls.length, 2);
  } finally {
    process.env = env;
    global.fetch = origFetch;
  }
});
