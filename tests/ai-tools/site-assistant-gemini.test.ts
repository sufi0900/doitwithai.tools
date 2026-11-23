import assert from "node:assert/strict";
import test from "node:test";
import {
  currentSiteDocuments,
  publicDocument,
  relevantExcerpt,
} from "../../features/site-assistant/server/live-knowledge";
import { answerSiteAssistant } from "../../features/site-assistant/server/chat";
import { getGeminiClient } from "../../lib/ai-tools/gemini";

test("live registry exposes executable canonical tools and filters unpublished documents", () => {
  assert.ok(
    currentSiteDocuments().some((d) =>
      d.url.endsWith("/tools/meta-title-generator"),
    ),
  );
  assert.equal(
    publicDocument({
      _id: "drafts.x",
      _type: "seo",
      title: "Draft",
      slug: "draft",
    }),
    null,
  );
  assert.equal(
    publicDocument({
      _id: "x",
      _type: "private",
      title: "Private",
      slug: "private",
    }),
    null,
  );
  assert.equal(
    publicDocument({
      _id: "x",
      _type: "seo",
      title: "Unsafe",
      slug: "../../api/private",
    }),
    null,
  );
  assert.equal(
    publicDocument({
      _id: "scheduled",
      _type: "guide",
      title: "Future guide",
      slug: "future-guide",
      publishedAt: "2099-01-01T00:00:00Z",
    }),
    null,
  );
  assert.equal(
    publicDocument({
      _id: "x",
      _type: "guide",
      title: "Outline",
      slug: "article-outline",
      publishedAt: "2025-01-01T00:00:00Z",
    })?.url,
    "https://doitwithai.tools/guides/article-outline",
  );
});
test("excerpts preserve relevant content beyond the beginning of a long article", () => {
  const content =
    "Generic introduction. ".repeat(500) +
    "Keep sentence variation when improving readability." +
    " Other details.".repeat(200);
  assert.match(
    relevantExcerpt(content, "sentence variation readability"),
    /Keep sentence variation/,
  );
});
test("Gemini answers from freshly read published content, with controlled source cards and no OpenAI calls", async () => {
  const fetchOriginal = globalThis.fetch;
  const generateOriginal = getGeminiClient().generate;
  const previous = {
    project: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    model: process.env.GEMINI_MODEL,
  };
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "testproject";
  process.env.GEMINI_MODEL = "gemini-test";
  let version = 1,
    calls = 0;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /^https:\/\/testproject\.api\.sanity\.io/);
    assert.equal(
      new URL(String(url)).searchParams.get("perspective"),
      "published",
    );
    calls++;
    return new Response(
      JSON.stringify({
        result: [
          {
            _id: "published",
            _type: "seo",
            title: "Readability guide",
            slug: "readability",
            overview: "Readable sentences",
            text: `Sentence variation guidance version ${version}`,
          },
        ],
      }),
      { status: 200 },
    );
  };
  getGeminiClient().generate = (async (params: any) => {
    assert.equal(params.model, "gemini-test");
    const payload = JSON.parse(params.input[1].content);
    const id = payload.retrievedKnowledge.findIndex(
      (d: any) => d.title === "Readability guide",
    );
    assert.ok(id >= 0);
    assert.match(
      payload.retrievedKnowledge[id].content,
      new RegExp(`version ${version}`),
    );
    return {
      output_parsed: {
        answer: "Keep a natural mix of sentence lengths.",
        sourceIds: [id, id],
      },
    };
  }) as typeof generateOriginal;
  try {
    const input = {
      messages: [
        {
          role: "user" as const,
          content: "Explain readability and sentence variation",
        },
      ],
    };
    const first = await answerSiteAssistant(input);
    assert.deepEqual(first.sources, [
      {
        title: "Readability guide",
        url: "https://doitwithai.tools/ai-seo/readability",
        kind: "published-article",
      },
    ]);
    version = 2;
    await answerSiteAssistant(input);
    assert.equal(
      calls,
      4,
      "Both metadata and article content must be refreshed per question",
    );
    globalThis.fetch = async () => new Response("unavailable", { status: 503 });
    await assert.rejects(answerSiteAssistant(input), /KNOWLEDGE_UNAVAILABLE/);
  } finally {
    globalThis.fetch = fetchOriginal;
    getGeminiClient().generate = generateOriginal;
    if (previous.project === undefined)
      delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    else process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = previous.project;
    if (previous.model === undefined) delete process.env.GEMINI_MODEL;
    else process.env.GEMINI_MODEL = previous.model;
  }
});

test("chat API works with Gemini alone and returns safe quota errors", async () => {
  const { POST } = await import("../../app/api/ai-assistant/chat/route");
  const { NextRequest } = await import("next/server");
  const { GeminiError } = await import("../../lib/ai-tools/gemini");
  const originalFetch = globalThis.fetch;
  const originalGenerate = getGeminiClient().generate;
  const keys = [
    "GEMINI_API_KEY",
    "GEMINI_MODEL",
    "NEXT_PUBLIC_SANITY_PROJECT_ID",
    "OPENAI_API_KEY",
    "OPENAI_SITE_ASSISTANT_VECTOR_STORE_ID",
  ];
  const previous = keys.map((key) => process.env[key]);
  process.env.GEMINI_API_KEY = "test-only-key";
  process.env.GEMINI_MODEL = "gemini-test";
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "testproject";
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_SITE_ASSISTANT_VECTOR_STORE_ID;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ result: [] }), { status: 200 });
  getGeminiClient().generate = (async () => ({
    output_parsed: { answer: "Explore our current AI tools.", sourceIds: [1] },
  })) as typeof originalGenerate;
  const request = () =>
    new NextRequest("https://doitwithai.tools/api/ai-assistant/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.0.2.12",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Show me the current tools" }],
      }),
    });
  try {
    const response = await POST(request());
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.sources[0].url, "https://doitwithai.tools/tools");
    getGeminiClient().generate = (async () => {
      throw new GeminiError(429, "PROVIDER_RATE_LIMITED");
    }) as typeof originalGenerate;
    const limited = await POST(request());
    assert.equal(limited.status, 429);
    assert.equal((await limited.json()).error.code, "PROVIDER_RATE_LIMITED");
    delete process.env.GEMINI_API_KEY;
    assert.equal((await POST(request())).status, 503);
  } finally {
    globalThis.fetch = originalFetch;
    getGeminiClient().generate = originalGenerate;
    keys.forEach((key, i) => {
      if (previous[i] === undefined) delete process.env[key];
      else process.env[key] = previous[i];
    });
  }
});
