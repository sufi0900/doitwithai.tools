import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  inputSchema,
  outputSchema,
  validateOutput,
  exampleReport,
} from "../../features/keyword-research/schema";
import {
  importMetrics,
  exportCsv,
} from "../../features/keyword-research/metrics";
import { POST } from "../../features/keyword-research/handler";
import { getGeminiClient } from "../../lib/ai-tools/gemini";
const input = inputSchema.parse({
  seeds: ["espresso"],
  country: "United States",
  language: "English",
});
test("research inputs and output reject unbounded or fabricated metric fields", () => {
  assert.equal(
    inputSchema.safeParse({ ...input, seeds: [], context: "" }).success,
    false,
  );
  assert.equal(
    inputSchema.safeParse({
      ...input,
      seeds: [],
      context: "Coffee classes for beginner home brewers.",
    }).success,
    true,
  );
  assert.equal(
    inputSchema.safeParse({ ...input, seeds: Array(11).fill("espresso") })
      .success,
    false,
  );
  assert.equal(
    inputSchema.safeParse({ ...input, exclude: Array(121).fill("espresso") })
      .success,
    false,
  );
  const raw = exampleReport();
  (raw.keywords[0] as any).volume = 12345;
  assert.equal("volume" in outputSchema.parse(raw).keywords[0], false);
  const result = validateOutput(raw, {
    ...input,
    exclude: [raw.keywords[0].keyword.toUpperCase()],
  });
  assert.equal(result.keywords.length, 5);
  assert.throws(() =>
    validateOutput(raw, {
      ...input,
      exclude: raw.keywords.map((k) => k.keyword),
    }),
  );
});
test("metric imports preserve zeros and ranges, tolerate preambles, and never substitute impressions", () => {
  const r = importMetrics(
    'Keyword Stats report\nDownloaded today\nKeyword,Avg. monthly searches,Competition\n"espresso classes","1,000–10,000",Low\ncoffee school,0,High\nespresso classes,9000,High\ncoffee class,,Low',
  );
  assert.equal(r.metrics.length, 3);
  assert.equal(r.duplicates, 1);
  assert.equal(r.metrics[0].volume, "1,000–10,000");
  assert.equal(r.metrics[1].volume, "0");
  assert.equal(r.metrics[2].volume, "");
  assert.equal(
    importMetrics("Query,Impressions\nespresso,1900").hasVolume,
    false,
  );
  assert.equal(importMetrics("Keyword\tespresso\ncoffee\t20").hasVolume, false);
  assert.throws(() => importMetrics("Keyword,Volume\nespresso,-5"));
  assert.throws(() => importMetrics('Keyword,Volume\n"unfinished,30'));
  assert.throws(() => importMetrics("x".repeat(100001)));
  assert.throws(() =>
    importMetrics(
      "Keyword\n" +
        Array.from({ length: 501 }, (_, i) => `keyword ${i}`).join("\n"),
    ),
  );
});
test("exports retain source provenance, unavailable metrics, and spreadsheet formula protection", () => {
  const rows = exampleReport().keywords.map((r) => ({
    ...r,
    origin: "Illustrative example",
  }));
  rows[0].keyword = '=HYPERLINK("unsafe")';
  const csv = exportCsv(rows, [], "United States · English");
  assert.ok(csv.includes('"\'=HYPERLINK(""unsafe"")"'));
  assert.match(csv, /Illustrative example/);
  assert.match(csv, /Unavailable/);
  const second = exportCsv(
    rows,
    [
      {
        keyword: rows[1].keyword,
        volume: "0",
        competition: "Low",
        bidLow: "",
        bidHigh: "",
      },
    ],
    "Supplied market",
  );
  assert.match(second, /"0"/);
});
const request = (body: unknown) =>
  new NextRequest("https://example.com/api/ai-tools/keyword-research", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "keyword-research-fixture",
    },
    body: JSON.stringify(body),
  });
test("route validates input, uses existing fallback, refunds invalid output, and applies burst limits", async () => {
  const env = { ...process.env },
    client = getGeminiClient(),
    original = client.generate;
  try {
    Object.assign(process.env, { NODE_ENV: "test" });
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    assert.equal((await POST(request({ ...input, seeds: [] }))).status, 422);
    assert.equal((await POST(request(input))).status, 503);
    process.env.GEMINI_API_KEY = "fixture";
    process.env.GEMINI_KEYWORD_RESEARCH_MODEL = "fixture-model";
    client.generate = (async () => ({
      output_parsed: { keywords: [] },
    })) as typeof original;
    for (let i = 0; i < 7; i++)
      assert.equal((await POST(request(input))).status, 502);
    client.generate = (async (params, options) => {
      assert.equal(params.max_output_tokens, 6500);
      assert.equal(options?.maxRetries, 0);
      assert.equal(options?.timeout, 45000);
      return { output_parsed: exampleReport(), provider: "groq" };
    }) as typeof original;
    for (let i = 0; i < 5; i++)
      assert.equal((await POST(request(input))).status, 200);
    assert.equal((await POST(request(input))).status, 429);
  } finally {
    process.env = env;
    client.generate = original;
  }
});
