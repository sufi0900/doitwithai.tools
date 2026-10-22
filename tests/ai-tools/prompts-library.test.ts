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
