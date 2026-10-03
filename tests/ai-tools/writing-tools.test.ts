import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { writingInputSchema, validateWritingOutput, writingChecks, writingPrompt } from "../../features/writing-tools/schema";
import { readBoundedJson, BodyError } from "../../lib/ai-tools/request-body";
import { checkAiToolRateLimit } from "../../lib/ai-tools/rate-limit";
import { writingHandler } from "../../features/writing-tools/handler";
import { getOpenAIClient } from "../../lib/ai-tools/openai";
const input = { brief: "An educational page explaining how to plan a container garden with seed selection and watering examples.", keyword: "container garden", audience: "New gardeners", pageTitle: "Container gardening basics", tone: "clear" as const };
const output = { candidates: [
  { text: "Learn container gardening with seed selection and watering examples for beginners.", approach: "Topic overview", explanation: "Describes the actual topics and audience in the page brief." },
  { text: "Plan a container garden with practical guidance on seeds and watering.", approach: "Action led", explanation: "Emphasizes the planning task without inventing features." },
  { text: "Container gardening basics: explore seed selection and watering for your first garden.", approach: "Topic led", explanation: "Starts with the topic and adds supported details." },
] };
test("input bounds, uniqueness and heading length are enforced", () => {
  assert.ok(writingInputSchema.safeParse(input).success);
  assert.ok(!writingInputSchema.safeParse({ ...input, brief: "short" }).success);
  assert.ok(!writingInputSchema.safeParse({ ...input, brief: "x".repeat(5001) }).success);
  assert.deepEqual(validateWritingOutput(output, "meta-description"), output);
  assert.throws(() => validateWritingOutput({ candidates: [output.candidates[0], output.candidates[0], output.candidates[2]] }, "meta-description"));
  assert.throws(() => validateWritingOutput({ candidates: output.candidates.map(c => ({ ...c, text: "x".repeat(141) })) }, "h1-heading"));
});
test("checks count Unicode code points and describe literal checks without predictions", () => {
  assert.equal(writingChecks("🌱 garden", "garden", "h1-heading").count, 8);
  assert.equal(writingChecks("container gardening", "container soil", "h1-heading").keywordIncluded, false);
  assert.equal(writingChecks("gardening", "garden", "h1-heading").keywordIncluded, false);
  assert.equal(writingChecks("garden", "", "h1-heading").keywordIncluded, null);
  assert.match(writingPrompt("meta-description", input).system, /untrusted source data/);
});
test("body reader enforces bytes even without content-length", async () => {
  const request = new Request("http://example.test", { method: "POST", body: JSON.stringify(input) });
  assert.deepEqual(await readBoundedJson(request), input);
  await assert.rejects(readBoundedJson(new Request("http://example.test", { method: "POST", body: "x".repeat(101) }), 100), (e: BodyError) => e.status === 413);
  await assert.rejects(readBoundedJson(new Request("http://example.test", { method: "POST", body: "invalid" })), (e: BodyError) => e.status === 400);
});
test("changing User-Agent cannot bypass the same address limit", async () => {
  const id = `test-${Date.now()}`;
  const a = new NextRequest("http://example.test", { headers: { "x-real-ip": "192.0.2.10", "user-agent": "first" } });
  const b = new NextRequest("http://example.test", { headers: { "x-real-ip": "192.0.2.10", "user-agent": "second" } });
  assert.equal((await checkAiToolRateLimit(a, id, { dailyLimit: 1, burstLimit: 1 })).allowed, true);
  assert.equal((await checkAiToolRateLimit(b, id, { dailyLimit: 1, burstLimit: 1 })).allowed, false);
});
test("both API handlers validate requests, use bounded structured output and surface provider failures", async () => {
  const original = { key: process.env.OPENAI_API_KEY, description: process.env.OPENAI_META_DESCRIPTION_MODEL, heading: process.env.OPENAI_H1_HEADING_MODEL };
  const request = () => new NextRequest("http://example.test", { method: "POST", headers: { "content-type": "application/json", "x-real-ip": "192.0.2.99" }, body: JSON.stringify(input) });
  delete process.env.OPENAI_META_DESCRIPTION_MODEL;
  assert.equal((await writingHandler("meta-description")(request())).status, 503);
  process.env.OPENAI_API_KEY = "test-placeholder";
  process.env.OPENAI_META_DESCRIPTION_MODEL = "test-model";
  process.env.OPENAI_H1_HEADING_MODEL = "test-model";
  const client = getOpenAIClient();
  const parse = client.responses.parse;
  try {
    client.responses.parse = (async (params: any, options: any) => {
      assert.equal(params.store, false); assert.equal(params.max_output_tokens, 1800);
      assert.equal(options.maxRetries, 0); assert.equal(options.timeout, 30000);
      return { output_parsed: output };
    }) as any;
    for (const kind of ["meta-description", "h1-heading"] as const) {
      const response = await writingHandler(kind)(request());
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.equal((await response.json()).result.candidates.length, 3);
    }
    client.responses.parse = (async () => { throw new Error("provider unavailable"); }) as any;
    assert.equal((await writingHandler("meta-description")(request())).status, 502);
  } finally {
    client.responses.parse = parse;
    for (const [key, value] of [["OPENAI_API_KEY", original.key], ["OPENAI_META_DESCRIPTION_MODEL", original.description], ["OPENAI_H1_HEADING_MODEL", original.heading]]) { if (value === undefined) delete process.env[key!]; else process.env[key!] = value; }
  }
});
