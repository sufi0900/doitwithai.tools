import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  inputSchema,
  parseKeywords,
  quickAnalyze,
  validateOutput,
  intentPrompt,
  exportCsv,
  type IntentInput,
} from "../../features/search-intent/schema";
import { POST } from "../../features/search-intent/handler";
import { getGeminiClient, GeminiError } from "../../lib/ai-tools/gemini";
const input: IntentInput = {
  keywords: ["how to write a meta title"],
  audience: "Content creators",
  market: "English",
  notes: "",
};
const output = () => ({
  items: quickAnalyze(input).items.map(({ keyword, ...item }) => item),
});
let id = 0;
const request = (body: unknown, client = String(++id)) =>
  new NextRequest("https://example.com/api/ai-tools/search-intent", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": client },
    body: JSON.stringify(body),
  });
test("input rejects duplicate, oversized, and misattributed search-note batches", () => {
  assert.deepEqual(parseKeywords("  query one \r\n\nquery two "), [
    "query one",
    "query two",
  ]);
  for (const invalid of [
    { ...input, keywords: [] },
    { ...input, keywords: Array(11).fill("query") },
    { ...input, keywords: ["hello", "Hello"] },
    { ...input, keywords: ["x".repeat(121)] },
    { ...input, keywords: ["one query", "other query"], notes: "result notes" },
    { ...input, notes: "x".repeat(4001) },
  ])
    assert.equal(inputSchema.safeParse(invalid).success, false);
  assert.equal(
    inputSchema.safeParse({
      ...input,
      notes: "Comparison titles from a manual check",
    }).success,
    true,
  );
});
test("quick check distinguishes learning, navigation, comparison, action, and ambiguity without invented metrics", () => {
  const queries = [
    "how to write a meta title",
    "ChatGPT login",
    "best keyword research tools",
    "buy a keyword research course",
    "ChatGPT",
    "how to buy a domain",
  ];
  const report = quickAnalyze({ ...input, keywords: queries });
  assert.deepEqual(
    report.items.map((i) => i.primary),
    [
      "Informational",
      "Navigational",
      "Commercial investigation",
      "Transactional",
      "Mixed / unclear",
      "Mixed / unclear",
    ],
  );
  assert.equal(report.method, "Rule-based estimate");
  assert.ok(report.items.every((i) => i.uncertainty.length > 10));
  assert.equal(report.items[4].evidence.length, 0);
  assert.ok(!JSON.stringify(report).includes('"confidence"'));
});
test("AI results need exact coverage and source-grounded quotes", () => {
  assert.equal(
    validateOutput(output(), input).items[0].keyword,
    input.keywords[0],
  );
  assert.throws(() =>
    validateOutput({ items: [...output().items, ...output().items] }, input),
  );
  assert.throws(() =>
    validateOutput({ items: [{ ...output().items[0], index: 1 }] }, input),
  );
  assert.throws(() =>
    validateOutput(
      {
        items: [
          {
            ...output().items[0],
            evidence: [{ source: "Keyword", quote: "invented evidence" }],
          },
        ],
      },
      input,
    ),
  );
  assert.throws(() =>
    validateOutput(
      {
        items: [
          {
            ...output().items[0],
            evidence: [{ source: "Pasted notes", quote: "how" }],
          },
        ],
      },
      input,
    ),
  );
  assert.throws(() =>
    validateOutput({ items: [{ ...output().items[0], evidence: [] }] }, input),
  );
  const notesInput = {
    ...input,
    notes: "Three comparison pages and two tutorials.",
  };
  const report = validateOutput(
    {
      items: [
        {
          ...output().items[0],
          evidence: [{ source: "Pasted notes", quote: "comparison pages" }],
        },
      ],
    },
    notesInput,
  );
  assert.equal(report.method, "AI review of pasted notes");
  assert.equal(intentPrompt(notesInput).user.includes(notesInput.notes), true);
  assert.match(intentPrompt(input).system, /untrusted data/);
  assert.match(intentPrompt(input).system, /Never invent search results/);
});
test("CSV quotes multiline cells and neutralizes spreadsheet formulas", () => {
  const report = quickAnalyze({
    ...input,
    keywords: ['=HYPERLINK("bad")\nline'],
  });
  const csv = exportCsv(report);
  assert.ok(csv.includes('"\'=HYPERLINK(""bad"")\nline"'));
  assert.ok(csv.includes('"Rule-based estimate"'));
});
test("route bounds inputs, requires configuration and preserves provider diagnostics", async () => {
  const env = { ...process.env };
  const client = getGeminiClient();
  const saved = client.generate;
  try {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    const invalid = await POST(request({ ...input, keywords: [] }));
    assert.equal(invalid.status, 422);
    const missing = await POST(request(input));
    assert.equal((await missing.json()).error.code, "AI_NOT_CONFIGURED");
    process.env.GEMINI_API_KEY = "fixture-key";
    process.env.GEMINI_SEARCH_INTENT_MODEL = "fixture-model";
    Object.assign(process.env, { NODE_ENV: "test" });
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    client.generate = (async (params, options) => {
      assert.equal(params.model, "fixture-model");
      assert.equal(params.max_output_tokens, 1800);
      assert.equal(options?.timeout, 45000);
      assert.equal(options?.maxRetries, 0);
      assert.equal(params.store, false);
      assert.equal(params.input.length, 2);
      return {
        output_parsed: output(),
        provider: "groq",
        model: "fixture-backup",
      };
    }) as typeof saved;
    const response = await POST(request(input));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const body = await response.json();
    assert.equal(body.result.items.length, 1);
    assert.equal(body.meta.provider, "groq");
    assert.equal(body.meta.model, "fixture-backup");
    client.generate = (async () => {
      throw new GeminiError(
        429,
        "ALL_PROVIDERS_FAILED",
        undefined,
        undefined,
        undefined,
        { gemini: "PROVIDER_TIMEOUT", groq: "PROVIDER_RATE_LIMITED" },
      );
    }) as typeof saved;
    const failure = await POST(request(input));
    assert.equal(failure.status, 429);
    assert.match(
      (await failure.json()).error.message,
      /Groq: PROVIDER_RATE_LIMITED/,
    );
    const tooLarge = await POST(
      request({ ...input, extra: "x".repeat(25000) }),
    );
    assert.equal(tooLarge.status, 413);
  } finally {
    process.env = env;
    client.generate = saved;
  }
});
test("failed output checks refund quota while successful review bursts remain bounded", async () => {
  const env = { ...process.env };
  const client = getGeminiClient();
  const saved = client.generate;
  try {
    Object.assign(process.env, {
      NODE_ENV: "test",
      GEMINI_API_KEY: "fixture",
      GEMINI_SEARCH_INTENT_MODEL: "fixture-model",
    });
    client.generate = (async () => ({
      output_parsed: { items: [] },
    })) as typeof saved;
    const key = "intent-refund-fixture";
    for (let i = 0; i < 16; i++)
      assert.equal((await POST(request(input, key))).status, 502);
    client.generate = (async () => ({
      output_parsed: output(),
    })) as typeof saved;
    for (let i = 0; i < 5; i++)
      assert.equal((await POST(request(input, key))).status, 200);
    const denied = await POST(request(input, key));
    assert.equal(denied.status, 429);
    assert.ok(Number(denied.headers.get("retry-after")) > 0);
  } finally {
    process.env = env;
    client.generate = saved;
  }
});
test("actual shared transport tries Gemini then Groq for this tool", async () => {
  const env = { ...process.env };
  const saved = global.fetch;
  const calls: string[] = [];
  try {
    Object.assign(process.env, {
      NODE_ENV: "test",
      GEMINI_API_KEY: "primary-fixture",
      GEMINI_SEARCH_INTENT_MODEL: "fixture-model",
      GROQ_API_KEY: "backup-fixture",
    });
    global.fetch = async (url, options) => {
      calls.push(String(url));
      const headers = options?.headers as Record<string, string>;
      if (String(url).includes("googleapis.com")) {
        assert.equal(headers["x-goog-api-key"], "primary-fixture");
        return Response.json(
          { error: { status: "UNAVAILABLE" } },
          { status: 503 },
        );
      }
      assert.equal(headers.Authorization, "Bearer backup-fixture");
      return Response.json({
        choices: [
          {
            finish_reason: "stop",
            message: { content: JSON.stringify(output()) },
          },
        ],
      });
    };
    const response = await POST(request(input));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).meta.provider, "groq");
    assert.equal(calls.length, 2);
    assert.ok(calls[0].includes("googleapis.com"));
    assert.ok(calls[1].includes("groq.com"));
  } finally {
    global.fetch = saved;
    process.env = env;
  }
});
