import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  writingInputSchema,
  validateWritingOutput,
  writingChecks,
  writingPrompt,
} from "../../features/writing-tools/schema";
import { readBoundedJson, BodyError } from "../../lib/ai-tools/request-body";
import { checkAiToolRateLimit } from "../../lib/ai-tools/rate-limit";
import { writingHandler } from "../../features/writing-tools/handler";
import { getGeminiClient } from "../../lib/ai-tools/gemini";
const input = writingInputSchema.parse({
  brief:
    "An educational page explaining how to plan a container garden with seed selection and watering examples.",
  keyword: "container garden",
  audience: "New gardeners",
  pageTitle: "Container gardening basics",
  tone: "clear",
});
const texts = [
  "Container garden basics: seeds and watering",
  "Container gardening with practical examples",
  "Plan your first container garden",
  "Choose seeds and watering methods for containers",
  "A container garden guide for new gardeners",
  "New to gardening? Explore containers and seeds",
];
const makeOutput = (kind: "meta-description" | "h1-heading") => ({
  candidates: texts.map((text, index) => ({
    text,
    approach: (kind === "meta-description"
      ? ["Clear summary", "Reader benefit", "Next step"]
      : ["Topic first", "Task first", "Audience first"])[Math.floor(index / 2)],
    explanation: "Describes the supported topics and audience in the brief.",
  })),
});
const output = makeOutput("meta-description");
test("input bounds, uniqueness and heading length are enforced", () => {
  assert.ok(writingInputSchema.safeParse(input).success);
  assert.ok(
    !writingInputSchema.safeParse({ ...input, brief: "short" }).success,
  );
  assert.ok(
    !writingInputSchema.safeParse({ ...input, brief: "x".repeat(5001) })
      .success,
  );
  assert.deepEqual(validateWritingOutput(output, "meta-description"), output);
  assert.throws(() =>
    validateWritingOutput(
      {
        candidates: output.candidates.map((c) => ({
          ...c,
          approach: "Clear summary",
        })),
      },
      "meta-description",
    ),
  );
  assert.throws(() =>
    validateWritingOutput(
      {
        candidates: [
          output.candidates[0],
          output.candidates[0],
          ...output.candidates.slice(2),
        ],
      },
      "meta-description",
    ),
  );
  assert.throws(() =>
    validateWritingOutput(
      {
        candidates: makeOutput("h1-heading").candidates.map((c, index) => ({
          ...c,
          text: "x".repeat(140) + index,
        })),
      },
      "h1-heading",
    ),
  );
});
test("checks count Unicode code points and describe literal checks without predictions", () => {
  assert.equal(writingChecks("🌱 garden", "garden", "h1-heading").count, 8);
  assert.equal(
    writingChecks("container gardening", "container soil", "h1-heading")
      .keywordIncluded,
    false,
  );
  assert.equal(
    writingChecks("gardening", "garden", "h1-heading").keywordIncluded,
    false,
  );
  assert.equal(writingChecks("garden", "", "h1-heading").keywordIncluded, null);
  assert.match(
    writingPrompt("meta-description", input).system,
    /untrusted source data/,
  );
});
test("body reader enforces bytes even without content-length", async () => {
  const request = new Request("http://example.test", {
    method: "POST",
    body: JSON.stringify(input),
  });
  assert.deepEqual(await readBoundedJson(request), input);
  await assert.rejects(
    readBoundedJson(
      new Request("http://example.test", {
        method: "POST",
        body: "x".repeat(101),
      }),
      100,
    ),
    (e: BodyError) => e.status === 413,
  );
  await assert.rejects(
    readBoundedJson(
      new Request("http://example.test", { method: "POST", body: "invalid" }),
    ),
    (e: BodyError) => e.status === 400,
  );
});
test("changing User-Agent cannot bypass the same address limit", async () => {
  const id = `test-${Date.now()}`;
  const a = new NextRequest("http://example.test", {
    headers: { "x-real-ip": "192.0.2.10", "user-agent": "first" },
  });
  const b = new NextRequest("http://example.test", {
    headers: { "x-real-ip": "192.0.2.10", "user-agent": "second" },
  });
  assert.equal(
    (await checkAiToolRateLimit(a, id, { dailyLimit: 1, burstLimit: 1 }))
      .allowed,
    true,
  );
  assert.equal(
    (await checkAiToolRateLimit(b, id, { dailyLimit: 1, burstLimit: 1 }))
      .allowed,
    false,
  );
});
test("both API handlers validate requests, use bounded structured output and surface provider failures", async () => {
  const original = {
    key: process.env.GEMINI_API_KEY,
    description: process.env.GEMINI_META_DESCRIPTION_MODEL,
    heading: process.env.GEMINI_H1_HEADING_MODEL,
  };
  const request = () =>
    new NextRequest("http://example.test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-real-ip": "192.0.2.99",
      },
      body: JSON.stringify(input),
    });
  delete process.env.GEMINI_META_DESCRIPTION_MODEL;
  assert.equal(
    (await writingHandler("meta-description")(request())).status,
    503,
  );
  process.env.GEMINI_API_KEY = "test-placeholder";
  process.env.GEMINI_META_DESCRIPTION_MODEL = "test-model";
  process.env.GEMINI_H1_HEADING_MODEL = "test-model";
  const client = getGeminiClient();
  const parse = client.generate;
  try {
    client.generate = (async (params: any, options: any) => {
      assert.equal(params.model, "test-model");
      const h1 = params.input[0].content.includes("H1 headings");
      const fields =
        params.text.format.schema.properties.candidates.items.properties;
      assert.deepEqual(
        fields.approach.enum,
        h1
          ? ["Topic first", "Task first", "Audience first"]
          : ["Clear summary", "Reader benefit", "Next step"],
      );
      assert.equal(fields.text.maxLength, h1 ? 140 : 320);
      assert.equal(params.store, false);
      assert.equal(params.max_output_tokens, 2500);
      assert.equal(options.maxRetries, 0);
      assert.equal(options.timeout, 30000);
      return {
        output_parsed: makeOutput(
          params.input[0].content.includes("H1 headings")
            ? "h1-heading"
            : "meta-description",
        ),
      };
    }) as any;
    for (const kind of ["meta-description", "h1-heading"] as const) {
      const response = await writingHandler(kind)(request());
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.equal((await response.json()).result.candidates.length, 6);
    }
    client.generate = (async () => {
      throw new Error("provider unavailable");
    }) as any;
    assert.equal(
      (await writingHandler("meta-description")(request())).status,
      502,
    );
  } finally {
    client.generate = parse;
    for (const [key, value] of [
      ["GEMINI_API_KEY", original.key],
      ["GEMINI_META_DESCRIPTION_MODEL", original.description],
      ["GEMINI_H1_HEADING_MODEL", original.heading],
    ]) {
      if (value === undefined) delete process.env[key!];
      else process.env[key!] = value;
    }
  }
});

test("editing checks distinguish literal wording, title overlap, repetition and unsupported claim cues", async () => {
  const { reviewWriting, exportMarkup } =
    await import("../../features/writing-tools/evaluator");
  const a = reviewWriting(
    "container garden container garden container garden",
    input,
    "meta-description",
  );
  assert.equal(a.phraseOccurrences, 3);
  assert.ok(a.rows.find((row) => row.label === "Repeated wording")?.warn);
  assert.equal(
    reviewWriting(input.pageTitle, input, "meta-description").overlap,
    100,
  );
  assert.equal(
    reviewWriting("Guaranteed results for your #1 garden", input, "h1-heading")
      .claimWords,
    true,
  );
  assert.equal(reviewWriting("", input, "h1-heading").empty, true);
  assert.equal(
    exportMarkup('A "quoted" <heading> & text', "h1-heading"),
    "<h1>A &quot;quoted&quot; &lt;heading&gt; &amp; text</h1>",
  );
  assert.equal(
    exportMarkup('"><script>alert(1)</script>', "meta-description"),
    '<meta name="description" content="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;">',
  );
});
