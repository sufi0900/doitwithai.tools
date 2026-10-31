import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  inputSchema,
  template,
  validateOutput,
  exportMarkdown,
  type BriefInput,
} from "../../features/content-brief/schema";
import { POST } from "../../features/content-brief/handler";
import { getGeminiClient, GeminiError } from "../../lib/ai-tools/gemini";
const input: BriefInput = {
  topic: "How to write meta titles",
  audience: "New SEO writers",
  goal: "Draft an accurate page title",
  intent: "Informational",
  notes: "Use a worked example",
  links: [{ title: "Title guide", url: "https://example.com/title" }],
};
let id = 0;
const request = (body: unknown, ip = `brief-${++id}`) =>
  new NextRequest("https://example.com/api/ai-tools/content-brief", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
test("brief inputs bound notes, candidates, and URL protocols", () => {
  assert.ok(inputSchema.safeParse(input).success);
  for (const value of [
    { ...input, topic: "" },
    { ...input, notes: "x".repeat(6001) },
    { ...input, links: Array(9).fill(input.links[0]) },
    { ...input, links: [{ title: "Unsafe link", url: "javascript:alert(1)" }] },
  ])
    assert.equal(inputSchema.safeParse(value).success, false);
});
test("local template and handoff preserve context without invented links", () => {
  const brief = validateOutput(template(input), input);
  assert.equal(brief.linkPlan.length, 0);
  assert.ok(brief.sections.every((s) => s.evidenceNeeded));
  const md = exportMarkdown(brief, input, "Local template");
  for (const value of [
    input.audience,
    input.goal,
    input.notes,
    "Research gaps",
    "Editorial checklist",
    "unverified",
  ])
    assert.ok(md.includes(value));
});
test("AI link references must exist and cannot repeat", () => {
  const base = template(input),
    link = {
      index: 0,
      anchor: "title guide",
      placement: "After the worked example",
    };
  assert.equal(
    validateOutput({ ...base, linkPlan: [link] }, input).linkPlan.length,
    1,
  );
  assert.throws(() =>
    validateOutput({ ...base, linkPlan: [{ ...link, index: 1 }] }, input),
  );
  assert.throws(() =>
    validateOutput({ ...base, linkPlan: [link, link] }, input),
  );
});
test("route bounds bodies, validates structure, refunds failures, and reports provider errors", async () => {
  const env = { ...process.env };
  const client = getGeminiClient();
  const generate = client.generate;
  try {
    Object.assign(process.env, {
      NODE_ENV: "test",
      GEMINI_CONTENT_BRIEF_MODEL: "fixture-model",
    });
    process.env.GEMINI_API_KEY = "fixture-key";
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    assert.equal((await POST(request({}))).status, 422);
    assert.equal(
      (await POST(request({ ...input, notes: "x".repeat(33000) }))).status,
      413,
    );
    client.generate = async () =>
      ({
        output_parsed: {
          ...template(input),
          linkPlan: [
            { index: 7, anchor: "Bad link", placement: "After introduction" },
          ],
        },
      }) as any;
    for (let n = 0; n < 16; n++)
      assert.equal((await POST(request(input, "refund-brief"))).status, 502);
    client.generate = async () =>
      ({
        output_parsed: template(input),
        provider: "groq",
        model: "fixture-model",
      }) as any;
    const response = await POST(request(input, "refund-brief"));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal((await response.json()).meta.provider, "groq");
    client.generate = async () => {
      throw new GeminiError(
        503,
        "ALL_PROVIDERS_FAILED",
        undefined,
        undefined,
        undefined,
        { gemini: "PROVIDER_TIMEOUT", groq: "PROVIDER_RATE_LIMITED" },
      );
    };
    const fail = await POST(request(input));
    assert.equal(fail.status, 503);
    assert.equal((await fail.json()).error.code, "ALL_PROVIDERS_FAILED");
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    assert.equal((await POST(request(input))).status, 503);
  } finally {
    client.generate = generate;
    for (const key of Object.keys(process.env))
      if (!(key in env)) delete process.env[key];
    Object.assign(process.env, env);
  }
});
