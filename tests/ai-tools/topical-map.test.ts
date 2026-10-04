import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  inputSchema,
  validateTree,
  validateOutput,
  prompt,
} from "../../features/topical-map/schema";
import {
  toTopics,
  moveTopic,
  addTopic,
  removeTopic,
  markdown,
  csv,
  parseProject,
  serializeProject,
  storageKey,
  safeUrl,
  keywords,
  type Project,
} from "../../features/topical-map/workspace";
import { POST } from "../../features/topical-map/handler";
const node = {
  id: "n1",
  parentId: null,
  title: "SEO with AI",
  keyword: "SEO with AI",
  relatedKeywords: ["AI SEO workflows"],
  intent: "informational",
  format: "hub",
  focus: "Help website owners understand practical SEO workflows.",
  why: "The root defines the overall project scope.",
};
export const fixture = {
  nodes: [
    node,
    {
      ...node,
      id: "n2",
      parentId: "n1",
      title: "Content planning",
      keyword: "AI content planning",
      format: "guide",
      why: "Planning connects the broad subject with practical reader tasks.",
    },
    {
      ...node,
      id: "n3",
      parentId: "n1",
      title: "Page editing",
      keyword: "AI page editing",
      format: "guide",
    },
    {
      ...node,
      id: "n4",
      parentId: "n2",
      title: "Reviewing outlines",
      keyword: "how to review an article outline",
      format: "tutorial",
    },
  ],
  review: [
    "Review actual search results before selecting topics.",
    "Check existing coverage before planning separate pages.",
  ],
};
const source = inputSchema.parse({ seed: "SEO with AI" });
const topics = () => toTopics(validateOutput(fixture, source));
const project = (): Project => ({
  version: 1,
  name: "SEO map",
  source,
  nodes: topics(),
  review: fixture.review,
});
test("input accepts seed or fuller brief while bounding all supplied context", () => {
  assert.ok(inputSchema.safeParse({ seed: "SEO" }).success);
  assert.ok(
    inputSchema.safeParse({
      brief: "A website helping writers review AI-generated drafts.",
    }).success,
  );
  for (const v of [
    { seed: "a" },
    { brief: "short" },
    { seed: "x".repeat(161) },
    { seed: "SEO", country: "x".repeat(101) },
    { seed: "SEO", projectType: "wrong" },
    { seed: "SEO", difficulty: 1 },
  ])
    assert.equal(inputSchema.safeParse(v).success, false);
  assert.match(
    prompt(source).system,
    /Topic breadth and hierarchy do not establish/,
  );
});
test("AI output validates a connected, unique tree and rejects invalid parents, cycles and depth", () => {
  assert.equal(validateOutput(fixture, source).nodes.length, 4);
  for (const nodes of [
    fixture.nodes.map((n) => ({ ...n, parentId: null })),
    [...fixture.nodes, fixture.nodes[0]],
    fixture.nodes.map((n) => (n.id === "n2" ? { ...n, parentId: "n99" } : n)),
    fixture.nodes.map((n) => (n.id === "n2" ? { ...n, parentId: "n4" } : n)),
    [
      ...fixture.nodes,
      { ...node, id: "n5", parentId: "n4", title: "Deep node" },
    ],
  ])
    assert.throws(() => validateOutput({ ...fixture, nodes }, source));
  assert.throws(() =>
    validateOutput(
      {
        ...fixture,
        nodes: fixture.nodes.map((n) => ({ ...n, difficulty: 10 })),
      },
      source,
    ),
  );
  assert.throws(() =>
    validateOutput(
      {
        ...fixture,
        nodes: fixture.nodes.map((n) => ({ ...n, title: "Same" })),
      },
      source,
    ),
  );
});
test("moving and adding respect three levels, reject cycles, and reset recorded reviews", () => {
  const n = topics().map((n) => ({ ...n, reviewed: true }));
  const moved = moveTopic(n, "n4", "n3");
  assert.equal(moved[3].parentId, "n3");
  assert.ok(moved.every((n) => !n.reviewed));
  assert.ok(n.every((n) => n.reviewed));
  assert.throws(() => moveTopic(n, "n2", "n4"));
  assert.throws(() => moveTopic(n, "n1", "n3"));
  const added = addTopic(n, "n3");
  assert.equal(added.length, 5);
  validateTree(added);
  assert.throws(() => addTopic(n, "n4"));
  const removed = removeTopic(n, "n2");
  assert.equal(removed.length, 2);
  assert.throws(() => removeTopic(n, "n1"));
});
test("exports retain hierarchy, human notes and unverified metrics with CSV formula protection", () => {
  const n = topics();
  n[1].notes = "Reviewed existing coverage.";
  n[1].title = "=SUM(A1)";
  assert.match(csv(n), /"'=SUM\(A1\)"/);
  assert.match(csv(n), /Not verified/);
  assert.match(markdown(n), /### =SUM/);
  assert.match(markdown(n), /Reviewed existing coverage/);
  assert.ok(keywords(n).includes("how to review an article outline"));
});
test("project restore checks version, URL safety and hierarchy before replacing data", () => {
  assert.deepEqual(parseProject(serializeProject(project())), project());
  assert.match(storageKey, /v1/);
  for (const p of [
    { ...project(), version: 2 },
    { ...project(), nodes: [] },
    {
      ...project(),
      nodes: topics().map((n) => ({ ...n, url: "javascript:alert(1)" })),
    },
    { ...project(), nodes: topics().map((n) => ({ ...n, parentId: "n99" })) },
  ])
    assert.throws(() => parseProject(JSON.stringify(p)));
  assert.throws(() => parseProject("x".repeat(250001)));
  assert.throws(() => safeUrl("https://user:pass@example.com"));
  assert.equal(safeUrl("https://example.com/page"), "https://example.com/page");
});
test("Gemini API uses bounded structured output without grounding and rejects provider failure or malformed maps", async () => {
  const originalFetch = globalThis.fetch;
  const savedKey = process.env.GEMINI_API_KEY,
    savedModel = process.env.GEMINI_TOPICAL_MAP_MODEL;
  process.env.GEMINI_API_KEY = "test-gemini-key";
  process.env.GEMINI_TOPICAL_MAP_MODEL = "test-gemini-model";
  let id = 0,
    calls = 0;
  const request = (body: unknown) =>
    new NextRequest("http://localhost/api/ai-tools/topical-map", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `topical-test-${++id}`,
      },
      body: JSON.stringify(body),
    });
  try {
    globalThis.fetch = (async (url: unknown, options: any) => {
      calls++;
      assert.equal(
        url,
        "https://generativelanguage.googleapis.com/v1beta/models/test-gemini-model:generateContent",
      );
      assert.equal(options.headers["x-goog-api-key"], "test-gemini-key");
      assert.equal(options.cache, "no-store");
      assert.ok(options.signal);
      const body = JSON.parse(options.body);
      assert.equal(body.store, false);
      assert.equal(body.tools, undefined);
      assert.equal(body.generationConfig.responseMimeType, "application/json");
      assert.equal(body.generationConfig.maxOutputTokens, 7000);
      assert.ok(body.generationConfig.responseJsonSchema.properties.nodes);
      const fields =
        body.generationConfig.responseJsonSchema.properties.nodes.items
          .properties;
      assert.equal(fields.focus.maxLength, 500);
      assert.equal(fields.why.maxLength, 300);
      assert.equal(fields.id.pattern, "^n[1-9]\\d?$");
      return Response.json({
        candidates: [
          {
            finishReason: "STOP",
            content: {
              parts: [
                { thought: true, text: "Ignore this thought." },
                { text: JSON.stringify(fixture) },
              ],
            },
          },
        ],
      });
    }) as typeof fetch;
    assert.equal((await POST(request({ seed: "a" }))).status, 422);
    assert.equal(calls, 0);
    const ok = await POST(request({ seed: "SEO" }));
    assert.equal(ok.status, 200);
    assert.equal(ok.headers.get("cache-control"), "no-store");
    assert.deepEqual((await ok.json()).result, fixture);
    globalThis.fetch = (async () =>
      Response.json({
        candidates: [
          {
            finishReason: "MAX_TOKENS",
            content: { parts: [{ text: JSON.stringify(fixture) }] },
          },
        ],
      })) as typeof fetch;
    assert.equal((await POST(request({ seed: "SEO" }))).status, 502);
    globalThis.fetch = (async () =>
      Response.json({
        candidates: [
          {
            finishReason: "STOP",
            content: { parts: [{ text: '{"nodes":[]}' }] },
          },
        ],
      })) as typeof fetch;
    assert.equal((await POST(request({ seed: "SEO" }))).status, 502);
    globalThis.fetch = (async () =>
      new Response("Provider error", { status: 429 })) as typeof fetch;
    assert.equal((await POST(request({ seed: "SEO" }))).status, 429);
    delete process.env.GEMINI_API_KEY;
    assert.equal((await POST(request({ seed: "SEO" }))).status, 503);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries({
      GEMINI_API_KEY: savedKey,
      GEMINI_TOPICAL_MAP_MODEL: savedModel,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
