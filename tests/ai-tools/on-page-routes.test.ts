import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST as analyze } from "../../app/api/ai-tools/on-page/analyze/route";
import { POST as improve } from "../../app/api/ai-tools/on-page/improve/route";
import { POST as review } from "../../app/api/ai-tools/on-page/review/route";
import { getGeminiClient } from "../../lib/ai-tools/gemini";
import { EXAMPLE_HTML } from "../../features/on-page-analyzer/example";
const request = (data: unknown) =>
  new NextRequest("https://doitwithai.tools/api/ai-tools/on-page/analyze", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "192.0.2.91",
    },
    body: JSON.stringify(data),
  });
test("pasted HTML returns a usable report without network or provider configuration", async () => {
  const response = await analyze(
    request({
      html: EXAMPLE_HTML,
      url: "https://example.com/content-planning",
    }),
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = await response.json();
  assert.equal(body.result.source, "paste");
  assert.equal(body.result.resources.robots, "unknown");
  assert.equal(body.result.title, "Content planning");
});
test("invalid input, oversized content, and private URL imports produce clear failures", async () => {
  assert.equal(
    (await analyze(request({ url: "javascript:alert(1)" }))).status,
    422,
  );
  assert.equal(
    (await analyze(request({ html: "x".repeat(1000100) }))).status,
    413,
  );
  const response = await analyze(request({ url: "http://127.0.0.1" }));
  assert.notEqual(response.status, 200);
  const body = await response.json();
  assert.ok(body.error.message);
  assert.ok(!body.result);
});
test("improvement and editorial routes validate inputs and retain source evidence", async () => {
  assert.equal((await improve(request({ kind: "unexpected" }))).status, 422);
  assert.equal(
    (await review(request({ title: "Page", blocks: [] }))).status,
    422,
  );
  const previous = {
      key: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL,
    },
    client = getGeminiClient(),
    original = client.generate;
  process.env.GEMINI_API_KEY = "test-key";
  process.env.GEMINI_MODEL = "test-model";
  try {
    client.generate = (async () => ({
      output_parsed: {
        options: [
          {
            text: "First descriptive title",
            reason: "Matches the supplied page context.",
          },
          {
            text: "Another descriptive title",
            reason: "Makes the reader task clearer.",
          },
          {
            text: "A third descriptive title",
            reason: "Keeps the original meaning intact.",
          },
        ],
      },
    })) as typeof original;
    const response = await improve(
      request({
        kind: "title",
        original: "Original",
        context: "A sufficiently detailed page context for useful suggestions.",
      }),
    );
    assert.equal(response.status, 200);
    assert.equal((await response.json()).result.options.length, 3);
    client.generate = (async () => ({
      output_parsed: {
        summary: "Review covers the supplied source excerpt only.",
        insights: [
          {
            blockId: "block:0",
            quote: "This source passage",
            topic: "clarity",
            observation: "This source wording could use an example.",
            action: "Add a concrete example for the intended audience.",
          },
          {
            blockId: "block:9",
            quote: "Imaginary source quote",
            topic: "evidence",
            observation: "This is not supported by the source.",
            action: "This observation must be removed automatically.",
          },
        ],
      },
    })) as typeof original;
    const editorial = await review(
      request({
        title: "Page",
        blocks: [
          {
            id: "block:0",
            tag: "p",
            text: "This source passage is sufficiently detailed for a review.",
          },
        ],
      }),
    );
    assert.equal(editorial.status, 200);
    assert.equal((await editorial.json()).result.insights.length, 1);
  } finally {
    client.generate = original;
    if (previous.key === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previous.key;
    if (previous.model === undefined) delete process.env.GEMINI_MODEL;
    else process.env.GEMINI_MODEL = previous.model;
  }
});
