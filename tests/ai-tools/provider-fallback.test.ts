import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import {
  getGeminiClient,
  geminiTextFormat,
  isAiConfigured,
  GeminiError,
  geminiFailure,
} from "../../lib/ai-tools/gemini";
import { getGroqModel } from "../../lib/ai-tools/groq";
const params = {
  model: "gemini-test",
  max_output_tokens: 1000,
  input: [
    { role: "system" as const, content: "Write a useful answer." },
    { role: "user" as const, content: "A brief." },
  ],
  text: {
    format: geminiTextFormat(
      z.object({ answer: z.string().min(2) }).strict(),
      "fallback_fixture",
    ),
  },
};
const geminiOk = () =>
  Response.json({
    candidates: [
      {
        finishReason: "STOP",
        content: { parts: [{ text: '{"answer":"Gemini answer"}' }] },
      },
    ],
  });
const groqOk = () =>
  Response.json({
    choices: [
      {
        finish_reason: "stop",
        message: { content: '{"answer":"Groq answer"}' },
      },
    ],
  });
async function scenario(run: () => Promise<void>) {
  const env = { ...process.env },
    fetch = global.fetch;
  process.env.GEMINI_API_KEY = "gemini-secret";
  process.env.GROQ_API_KEY = "groq-secret";
  delete process.env.GROQ_MODEL;
  delete process.env.GROQ_VISION_MODEL;
  try {
    await run();
  } finally {
    process.env = env;
    global.fetch = fetch;
  }
}
test("successful Gemini generation never calls Groq", () =>
  scenario(async () => {
    const calls: string[] = [];
    global.fetch = async (url) => {
      calls.push(String(url));
      return geminiOk();
    };
    const result = await getGeminiClient().generate(params);
    assert.equal(result.provider, "gemini");
    assert.equal(calls.length, 1);
    assert.ok(calls[0].includes("googleapis.com"));
  }));
test("quota, auth, server, connection and invalid JSON failures fall back in order with separate credentials", () =>
  scenario(async () => {
    for (const status of [429, 403, 503, 400, 0, 200]) {
      const calls: string[] = [];
      global.fetch = async (url, options) => {
        calls.push(String(url));
        const headers = options!.headers as Record<string, string>;
        if (String(url).includes("googleapis.com")) {
          assert.equal(headers["x-goog-api-key"], "gemini-secret");
          assert.equal(headers.Authorization, undefined);
          if (!status)
            throw new Error("connection error containing secret data");
          if (status === 200)
            return Response.json({
              candidates: [
                {
                  finishReason: "STOP",
                  content: { parts: [{ text: "not json" }] },
                },
              ],
            });
          return Response.json(
            {
              error: {
                status: "UNAVAILABLE",
                message: "private provider message",
              },
            },
            { status },
          );
        }
        assert.equal(headers.Authorization, "Bearer groq-secret");
        assert.equal(headers["x-goog-api-key"], undefined);
        const body = JSON.parse(String(options!.body));
        assert.equal(body.model, "openai/gpt-oss-120b");
        assert.equal(body.response_format.type, "json_object");
        assert.ok(body.messages[0].content.includes("JSON"));
        assert.equal(body.max_completion_tokens, 1000);
        return groqOk();
      };
      const result = await getGeminiClient().generate(params);
      assert.equal(result.provider, "groq");
      assert.deepEqual(result.output_parsed, { answer: "Groq answer" });
      assert.equal(calls.length, 2);
    }
  }));
test("Gemini timeout reserves time for Groq instead of exhausting the whole request budget", () =>
  scenario(async () => {
    let calls = 0;
    global.fetch = async (url, options) => {
      calls++;
      if (String(url).includes("groq.com")) return groqOk();
      return await new Promise<Response>((_, reject) =>
        options!.signal!.addEventListener(
          "abort",
          () => reject(new Error("aborted")),
          { once: true },
        ),
      );
    };
    assert.equal(
      (await getGeminiClient().generate(params, { timeout: 100 })).provider,
      "groq",
    );
    assert.equal(calls, 2);
  }));
test("image fallback retains image data and selects a vision model", () =>
  scenario(async () => {
    global.fetch = async (url, options) => {
      if (String(url).includes("googleapis.com"))
        return Response.json({}, { status: 429 });
      const body = JSON.parse(String(options!.body));
      assert.equal(body.model, "qwen/qwen3.8-27b");
      assert.ok(
        body.messages.some(
          (m) =>
            Array.isArray(m.content) &&
            m.content.some(
              (p) =>
                p.type === "image_url" &&
                p.image_url.url === "data:image/png;base64,aGVsbG8=",
            ),
        ),
      );
      return groqOk();
    };
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
    assert.equal(result.provider, "groq");
  }));
test("both failures return a safe error; malformed Groq results never pass validation", () =>
  scenario(async () => {
    for (const response of [
      () =>
        Response.json(
          { error: { message: "groq-secret private prompt" } },
          { status: 429 },
        ),
      () =>
        Response.json({
          choices: [
            { finish_reason: "stop", message: { content: '{"answer":1}' } },
          ],
        }),
      () =>
        Response.json({
          choices: [
            {
              finish_reason: "length",
              message: { content: '{"answer":"partial"}' },
            },
          ],
        }),
    ]) {
      let calls = 0;
      global.fetch = async (url) => {
        calls++;
        return String(url).includes("googleapis.com")
          ? Response.json({}, { status: 503 })
          : response();
      };
      await assert.rejects(getGeminiClient().generate(params), (e) => {
        assert.ok(e instanceof GeminiError);
        assert.equal(e.code, "ALL_PROVIDERS_FAILED");
        const text = JSON.stringify(geminiFailure(e));
        assert.ok(!text.includes("groq-secret"));
        assert.ok(!text.includes("private prompt"));
        return true;
      });
      assert.equal(calls, 2);
    }
  }));
test("Groq-only configuration works, but provider refusals and invalid image inputs do not trigger failover", () =>
  scenario(async () => {
    delete process.env.GEMINI_API_KEY;
    assert.equal(isAiConfigured(""), true);
    assert.equal(getGroqModel(), "openai/gpt-oss-120b");
    let calls = 0;
    global.fetch = async (url) => {
      calls++;
      assert.ok(String(url).includes("groq.com"));
      return groqOk();
    };
    assert.equal(
      (await getGeminiClient().generate({ ...params, model: "" })).provider,
      "groq",
    );
    assert.equal(calls, 1);
    process.env.GEMINI_API_KEY = "gemini-secret";
    calls = 0;
    global.fetch = async () => {
      calls++;
      return Response.json({ candidates: [{ finishReason: "SAFETY" }] });
    };
    await assert.rejects(
      getGeminiClient().generate(params),
      (e) => e instanceof GeminiError && e.code === "OUTPUT_BLOCKED",
    );
    assert.equal(calls, 1);
    calls = 0;
    await assert.rejects(
      getGeminiClient().generate({
        ...params,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_image",
                image_url: "https://example.com/private-image",
              },
            ],
          },
        ],
      }),
    );
    assert.equal(calls, 0);
  }));
