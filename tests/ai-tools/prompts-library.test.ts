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

test("detail routes are unique and only completed workflows are indexable", async () => {
  const { promptDetails, promptPath, findPromptDetail } =
    await import("../../features/prompts/details");
  const slugs = Object.values(promptDetails).map((detail) => detail.slug);
  assert.equal(new Set(slugs).size, promptPreviews.length);
  for (const prompt of promptPreviews) {
    const detail = promptDetails[prompt.id];
    assert.match(detail.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(findPromptDetail(detail.slug)?.prompt.id, prompt.id);
    assert.equal(promptPath(prompt.id), `/prompts/${detail.slug}`);
    assert.deepEqual(
      Object.keys(detail.example).sort(),
      [...prompt.inputs].sort(),
    );
  }
  assert.equal(findPromptDetail("missing-page"), undefined);
  assert.deepEqual(
    Object.entries(promptDetails)
      .filter(([, detail]) => detail.ready)
      .map(([id]) => id),
    ["meta-title"],
  );
});
