import test from "node:test";
import assert from "node:assert/strict";
import {
  fillPreview,
  filterPreviews,
  promptPreviews,
  promptCategories,
} from "../../features/prompts/catalog";
import registry from "../../features/tool-catalog/registry.json";

test("prompt browsing intersects category and all search terms", () => {
  assert.deepEqual(
    filterPreviews("on-page", "  META   TITLES ").map((p) => p.id),
    ["meta-title"],
  );
  assert.equal(filterPreviews("technical", "meta titles").length, 0);
  assert.equal(filterPreviews("all", "not-a-real-task").length, 0);
  assert.equal(filterPreviews("all", "").length, promptPreviews.length);
});
test("prompt compilation preserves missing fields and treats user input literally", () => {
  assert.equal(
    fillPreview("Task: {{Topic}}; reader: {{Reader}}", {
      Topic: "  $& {{Reader}} <test>  ",
      Reader: "",
    }),
    "Task: $& {{Reader}} <test>; reader: {{Reader}}",
  );
});
test("every sample has valid categories, declared inputs, and a live tool destination", () => {
  const paths = new Set([
    "/tools",
    ...registry.tools
      .filter((p) => p.status === "live")
      .map((p) => `/tools/${p.slug}`),
  ]);
  assert.equal(
    new Set(promptPreviews.map((p) => p.id)).size,
    promptPreviews.length,
  );
  for (const prompt of promptPreviews) {
    assert.ok(promptCategories.some((c) => c.id === prompt.category));
    assert.ok(paths.has(prompt.tool.href), prompt.tool.href);
    const inputs = [...prompt.template.matchAll(/\{\{([^{}]+)\}\}/g)].map(
      (m) => m[1],
    );
    assert.deepEqual([...new Set(inputs)].sort(), [...prompt.inputs].sort());
    assert.ok(prompt.checks.length > 0);
  }
});

test("only published guides appear in public search and resolve as detail routes", async () => {
  const { promptDetails, promptPath, findPromptDetail, publishedPrompts } =
    await import("../../features/prompts/details");
  const slugs = Object.values(promptDetails).map((detail) => detail.slug);
  assert.equal(new Set(slugs).size, promptPreviews.length);
  for (const prompt of promptPreviews) {
    const detail = promptDetails[prompt.id];
    assert.match(detail.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(
      findPromptDetail(detail.slug)?.prompt.id,
      detail.ready ? prompt.id : undefined,
    );
    assert.equal(promptPath(prompt.id), `/prompts/${detail.slug}`);
    assert.deepEqual(
      Object.keys(detail.example).sort(),
      [...prompt.inputs].sort(),
    );
  }
  assert.equal(findPromptDetail("missing-page"), undefined);
  assert.deepEqual(
    filterPreviews("all", "", publishedPrompts).map((p) => p.id),
    ["search-intent", "meta-title"],
  );
  assert.deepEqual(
    filterPreviews("on-page", "meta descriptions", publishedPrompts).map(
      (p) => p.id,
    ),
    ["meta-title"],
  );
  assert.deepEqual(filterPreviews("technical", "", publishedPrompts), []);
  assert.deepEqual(filterPreviews("all", "outreach", publishedPrompts), []);
  assert.deepEqual(
    Object.entries(promptDetails)
      .filter(([, detail]) => detail.ready)
      .map(([id]) => id),
    ["search-intent", "meta-title"],
  );
});

test("the metadata sequence carries its own context and only known placeholders", async () => {
  const { metaPromptSeries, contextFields, articleSlug } =
    await import("../../features/prompts/meta-workflow");
  const { promptDetails } = await import("../../features/prompts/details");
  assert.equal(metaPromptSeries.length, 9);
  assert.equal(new Set(metaPromptSeries.map((p) => p.id)).size, 9);
  assert.equal(promptDetails["meta-title"].slug, articleSlug);
  for (const prompt of metaPromptSeries) {
    assert.ok(
      prompt.template.includes(
        prompt.id === "unique-pages" ? "{{Related pages}}" : "{{Page content}}",
      ),
    );
    for (const match of prompt.template.matchAll(/\{\{([^{}]+)\}\}/g))
      assert.ok((contextFields as readonly string[]).includes(match[1]));
  }
});

test("ChatGPT handoff encodes content and falls back for oversized URLs", async () => {
  const { chatGPTLink } = await import("../../features/prompts/meta-workflow");
  const text = "Check café & title? #keep = facts";
  const url = new URL(chatGPTLink(text)!);
  assert.equal(url.origin, "https://chatgpt.com");
  assert.equal(url.searchParams.get("prompt"), text);
  assert.deepEqual([...url.searchParams.keys()], ["prompt"]);
  assert.equal(chatGPTLink("long ".repeat(10000)), null);
});

test("the supplied context example fills every prompt without unresolved placeholders", async () => {
  const { contextFields, exampleContext, metaPromptSeries, promptCount } =
    await import("../../features/prompts/meta-workflow");
  const { promptDetails } = await import("../../features/prompts/details");
  assert.equal(promptCount, promptDetails["meta-title"].promptCount);
  for (const field of contextFields)
    assert.ok(exampleContext[field]?.trim(), field);
  for (const prompt of metaPromptSeries)
    assert.doesNotMatch(
      fillPreview(prompt.template, exampleContext),
      /\{\{[^{}]+\}\}/,
    );
  assert.deepEqual(
    filterPreviews("all", "bulk").map((p) => p.id),
    ["meta-title"],
  );
});

test("intent workflows carry independent context and preserve evidence limits", async () => {
  const { intentPrompts, intentExample } =
    await import("../../features/prompts/intent-workflow");
  const { promptDetails, findPromptDetail } =
    await import("../../features/prompts/details");
  assert.equal(intentPrompts.length, 6);
  assert.equal(
    promptDetails["search-intent"].promptCount,
    intentPrompts.length,
  );
  assert.equal(
    findPromptDetail("chatgpt-prompts-for-search-intent")?.prompt.id,
    "search-intent",
  );
  assert.equal(new Set(intentPrompts.map((p) => p.id)).size, 6);
  for (const prompt of intentPrompts) {
    const fields = [...prompt.template.matchAll(/\{\{([^{}]+)\}\}/g)].map(
      (match) => match[1],
    );
    assert.deepEqual([...new Set(fields)].sort(), [...prompt.inputs].sort());
    assert.doesNotMatch(
      fillPreview(prompt.template, intentExample),
      /\{\{[^{}]+\}\}/,
    );
    assert.match(prompt.template, /Never invent browsing/);
    assert.match(prompt.template, /observations from interpretations/);
    assert.equal(prompt.tool.href, "/tools/search-intent-checker");
  }
});
