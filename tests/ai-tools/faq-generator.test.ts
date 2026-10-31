import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  example,
  inputSchema,
  prepareSource,
  MAX_CONTEXT_CHARS,
  faqPrompt,
  validateOutput,
  type FaqInput,
} from "../../features/faq-generator/schema";
import {
  exportFaq,
  exportReviewNotes,
  sourceWording,
  inputKey,
} from "../../features/faq-generator/workspace";
import { POST } from "../../features/faq-generator/handler";
import { getGeminiClient, GeminiError } from "../../lib/ai-tools/gemini";
const input: FaqInput = { ...example, questions: [] };
const quote =
  "A character count is a drafting aid, not a fixed Google display rule.";
const question = "Is character count a fixed display rule?";
export function fixture() {
  return {
    items: [
      {
        question,
        answer:
          "No. Character count is a drafting aid, rather than a fixed display rule.",
        evidence: [{ passageId: 3, quote }],
        missingReason: null,
      },
      {
        question: "Is a first-page ranking guaranteed?",
        answer: null,
        evidence: [],
        missingReason:
          "The source supplies no evidence of guaranteed rankings. Research this claim.",
      },
    ],
  };
}
let id = 0;
const request = (body: unknown, ip = `faq-${++id}`) =>
  new NextRequest("https://example.com/api/ai-tools/faq-generator", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
test("FAQ inputs bound source size and reject ambiguous custom-question coverage", () => {
  assert.ok(inputSchema.safeParse(example).success);
  for (const value of [
    { ...input, content: "too short" },
    { ...input, content: "x".repeat(60001) },
    { ...input, content: "a" + " ".repeat(200) + "b" },
    { ...input, count: 10 },
    { ...input, count: 3, questions: Array(4).fill("What does it do?") },
    { ...input, questions: ["What is AI?", "what is ai"] },
  ])
    assert.equal(inputSchema.safeParse(value).success, false);
});
test("long source selection preserves head, middle, tail, targeted passages and a strict budget", () => {
  const content = Array.from(
    { length: 60 },
    (_, i) =>
      `Section ${i + 1}. ${i === 47 ? "quartzneedle " : ""}${"Useful material about a distinct topic and its important limits. ".repeat(12)}`,
  ).join("\n\n");
  const value = {
    ...input,
    topic: "quartzneedle",
    content: content.slice(0, 60000),
  };
  const prepared = prepareSource(value);
  assert.ok(prepared.partial);
  assert.ok(prepared.selectedCharacters <= MAX_CONTEXT_CHARS);
  assert.ok(prepared.passages.some((p) => p.id === 1));
  assert.ok(prepared.passages.some((p) => p.id === prepared.totalPassages));
  assert.ok(prepared.passages.some((p) => p.text.includes("quartzneedle")));
  assert.deepEqual(prepareSource(value), prepared);
  const single = prepareSource({
    ...input,
    content:
      "Single long paragraph. " +
      ("x".repeat(999) + " ").repeat(40) +
      " Important ending.",
  });
  assert.ok(single.partial);
  assert.ok(single.passages.some((p) => p.text.endsWith("Important ending.")));
  const prompt = faqPrompt(value, prepared);
  assert.equal(
    JSON.parse(prompt.user).passages.length,
    prepared.passages.length,
  );
  assert.ok(!prompt.user.includes("Useful material".repeat(300)));
});
test("answers require matched quotes from the selected passage and preserve research gaps", () => {
  const result = validateOutput(fixture(), input);
  assert.equal(result.items[0].status, "draft");
  assert.equal(result.items[0].reviewed, false);
  assert.equal(result.items[1].status, "needs-information");
  assert.equal(result.items[1].answer, "");
  for (const evidence of [
    [{ passageId: 1, quote }],
    [{ passageId: 3, quote: "This quotation was invented by a model." }],
    [],
  ]) {
    const raw = fixture();
    raw.items[0].evidence = evidence;
    const checked = validateOutput(raw, input);
    assert.equal(checked.items[0].status, "needs-information");
    assert.equal(checked.items[0].answer, "");
    assert.deepEqual(checked.items[0].evidence, []);
  }
  const absent = prepareSource(input);
  absent.passages = absent.passages.filter((p) => p.id !== 3);
  assert.equal(
    validateOutput(fixture(), input, absent).items[0].status,
    "needs-information",
  );
});
test("normalizes quote whitespace, deduplicates questions, and keeps omitted custom questions visible", () => {
  const raw = fixture();
  raw.items[0].evidence[0].quote = quote.replace(/ /g, "\n");
  raw.items.push({ ...raw.items[0], question: question.toUpperCase() });
  const result = validateOutput(raw, {
    ...input,
    questions: ["What should I research before purchasing?"],
  });
  assert.equal(result.items.length, 3);
  assert.equal(
    result.items[0].question,
    "What should I research before purchasing?",
  );
  assert.equal(result.items[0].status, "needs-information");
  assert.equal(result.items[1].evidence[0].quote, quote);
  assert.throws(() =>
    validateOutput(
      {
        items: [
          {
            question: "????????",
            answer: null,
            evidence: [],
            missingReason: null,
          },
        ],
      },
      input,
    ),
  );
});
test("exports require explicit review, exclude research tasks, escape HTML, and reject edited duplicates", () => {
  const result = validateOutput(fixture(), input);
  assert.throws(() => exportFaq(result.items, "markdown"), /Review and select/);
  result.items[0].reviewed = true;
  result.items[0].question = "Can <script>alert(1)</script> run?";
  result.items[0].answer = 'Use <b>literal</b> text & check "quotes".';
  const html = exportFaq(result.items, "html");
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("&amp;"));
  assert.ok(!html.includes("first-page"));
  assert.ok(
    exportFaq(result.items, "markdown").includes(result.items[0].answer),
  );
  assert.ok(exportReviewNotes(result.items).includes("Research needed:"));
  assert.ok(exportReviewNotes(result.items).includes(quote));
  assert.throws(
    () =>
      exportFaq(
        [result.items[0], { ...result.items[0], id: "duplicate" }],
        "markdown",
      ),
    /duplicates/,
  );
  assert.throws(
    () => exportFaq([{ ...result.items[0], answer: "" }], "html"),
    /nonempty/,
  );
  const source = sourceWording({
    ...result.items[0],
    evidence: [
      { passageId: 1, quote: "a".repeat(500) },
      { passageId: 2, quote: "b".repeat(500) },
    ],
  });
  assert.equal(source, "a".repeat(500));
});
test("FAQ handler bounds bodies, preserves diagnostics, refunds invalid outputs, and rate limits successes", async () => {
  const env = { ...process.env };
  const client = getGeminiClient();
  const saved = client.generate;
  try {
    Object.assign(process.env, {
      NODE_ENV: "test",
      GEMINI_API_KEY: "fixture",
      GEMINI_FAQ_MODEL: "fixture-model",
    });
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    assert.equal((await POST(request({}))).status, 422);
    assert.equal(
      (await POST(request({ ...input, extra: "x".repeat(260001) }))).status,
      413,
    );
    client.generate = (async () => ({
      output_parsed: { items: [] },
    })) as typeof saved;
    for (let i = 0; i < 16; i++)
      assert.equal((await POST(request(input, "faq-refund"))).status, 502);
    client.generate = (async (params, options) => {
      assert.equal(params.model, "fixture-model");
      assert.equal(params.max_output_tokens, 3500);
      assert.equal(options?.timeout, 45000);
      assert.equal(options?.maxRetries, 0);
      return {
        output_parsed: fixture(),
        provider: "groq",
        model: "fixture-backup",
      };
    }) as typeof saved;
    for (let i = 0; i < 5; i++) {
      const response = await POST(request(input, "faq-refund"));
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.equal((await response.json()).meta.provider, "groq");
    }
    const limited = await POST(request(input, "faq-refund"));
    assert.equal(limited.status, 429);
    assert.ok(Number(limited.headers.get("retry-after")) > 0);
    client.generate = (async () => {
      throw new GeminiError(
        503,
        "ALL_PROVIDERS_FAILED",
        undefined,
        undefined,
        undefined,
        { gemini: "PROVIDER_TIMEOUT", groq: "PROVIDER_RATE_LIMITED" },
      );
    }) as typeof saved;
    const fail = await POST(request(input));
    assert.equal(fail.status, 503);
    assert.match(
      (await fail.json()).error.message,
      /Groq: PROVIDER_RATE_LIMITED/,
    );
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    const missing = await POST(request(input));
    assert.equal((await missing.json()).error.code, "AI_NOT_CONFIGURED");
  } finally {
    process.env = env;
    client.generate = saved;
  }
});
test("FAQ shared transport falls back from Gemini to Groq without separate per-answer calls", async () => {
  const env = { ...process.env };
  const saved = global.fetch;
  const calls: string[] = [];
  try {
    Object.assign(process.env, {
      NODE_ENV: "test",
      GEMINI_API_KEY: "primary-fixture",
      GEMINI_FAQ_MODEL: "fixture-model",
      GROQ_API_KEY: "backup-fixture",
    });
    global.fetch = async (url, options) => {
      calls.push(String(url));
      if (String(url).includes("googleapis.com"))
        return Response.json(
          { error: { status: "UNAVAILABLE" } },
          { status: 503 },
        );
      return Response.json({
        choices: [
          {
            finish_reason: "stop",
            message: { content: JSON.stringify(fixture()) },
          },
        ],
      });
    };
    const response = await POST(request(input));
    assert.equal(response.status, 200);
    const report = await response.json();
    assert.equal(report.meta.provider, "groq");
    assert.equal(report.result.items[0].status, "draft");
    assert.equal(calls.length, 2);
    assert.match(calls[0], /googleapis.com/);
    assert.match(calls[1], /groq.com/);
  } finally {
    process.env = env;
    global.fetch = saved;
  }
});

test("source snapshots compare field values rather than object property order", () => {
  const reordered = {
    questions: input.questions,
    count: input.count,
    content: input.content,
    audience: input.audience,
    topic: input.topic,
  };
  assert.equal(inputKey(reordered), inputKey(input));
  assert.equal(
    inputKey({ ...input, topic: " " + input.topic + " " }),
    inputKey(input),
  );
  assert.notEqual(
    inputKey({ ...input, content: input.content + " New detail." }),
    inputKey(input),
  );
});
