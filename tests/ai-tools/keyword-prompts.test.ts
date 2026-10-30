import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ImageConfigContext } from "next/dist/shared/lib/image-config-context.shared-runtime";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import { load } from "cheerio";
import prompts from "../../features/prompts/keyword-prompts.json";
import categories from "../../features/prompts/keyword-categories.json";
import Library from "../../features/prompts/KeywordPromptLibrary";
import Article from "../../features/prompts/KeywordPromptArticle";
import { fillPreview } from "../../features/prompts/catalog";
import {
  publishedPrompts,
  promptDetails,
  promptPath,
} from "../../features/prompts/details";

// Supply the same remote image policy that Next.js loads when serving this page.
function renderPromptMarkup(element: React.ReactElement) {
  return renderToStaticMarkup(
    React.createElement(
      ImageConfigContext.Provider,
      {
        value: {
          ...imageConfigDefault,
          remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
        },
      },
      element,
    ),
  );
}

test("one hundred distinct prompts cover ten complete workflows with bounded, actionable briefs", () => {
  assert.equal(prompts.length, 100);
  assert.equal(categories.length, 10);
  for (const field of ["id", "title", "task", "template"])
    assert.equal(
      new Set(prompts.map((p) => p[field as keyof typeof p])).size,
      100,
    );
  assert.deepEqual(
    prompts.map((p) => p.number),
    Array.from({ length: 100 }, (_, i) => i + 1),
  );
  for (const c of categories)
    assert.equal(prompts.filter((p) => p.category === c.id).length, 10);
  for (const p of prompts) {
    assert.ok(p.template.split(/\s+/).length >= 100);
    assert.ok(p.inputs.length > 10);
    assert.ok(p.output.length > 20);
    assert.match(p.template, /Do not invent search volume/);
    for (const key of ["Business", "Audience", "Market"])
      assert.ok(p.template.includes(`{{${key}}}`));
    assert.ok(p.template.includes(p.task));
    assert.ok(p.template.includes(p.inputs));
    assert.ok(!p.template.includes("—"));
  }
});
test("the ready guide resolves through the shared editorial registry without placeholder pages", () => {
  assert.equal(
    publishedPrompts.filter((p) => p.id === "keyword-research").length,
    1,
  );
  assert.equal(promptDetails["keyword-research"].promptCount, 100);
  assert.equal(
    promptPath("keyword-research"),
    "/prompts/keyword-research-prompts",
  );
  const filled = fillPreview(prompts[0].template, {
    Business: "Coffee $& classes",
    Audience: "Home brewers",
    Market: "United Kingdom",
  });
  assert.ok(filled.includes("Coffee $& classes"));
  assert.ok(filled.includes(`[${prompts[0].inputs}: paste here]`));
});
test("the server-rendered library exposes all one hundred prompts, navigation, and usable copy alternatives", () => {
  const $ = load(renderPromptMarkup(React.createElement(Library)));
  assert.equal($('details[id^="keyword-prompt-"]').length, 100);
  assert.equal($('nav[aria-label="Keyword prompt workflows"] a').length, 10);
  const ids = $("[id]")
    .toArray()
    .map((n) => $(n).attr("id"));
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(
    $("button").filter((_, n) => $(n).text() === "Copy prompt").length,
    100,
  );
  const links = $("a").filter((_, n) =>
    $(n).text().includes("Open in ChatGPT"),
  );
  assert.equal(links.length, 100);
  links.each((_, n) => {
    const u = new URL($(n).attr("href")!);
    assert.equal(u.origin, "https://chatgpt.com");
    assert.ok(u.searchParams.get("prompt")!.includes("Research boundaries"));
    assert.ok($(n).attr("rel")!.includes("noopener"));
  });
  for (const p of prompts) {
    const card = $(`#${p.id}`);
    assert.equal(card.length, 1);
    assert.ok(card.text().includes(p.task));
    assert.equal(card.find("label textarea").length, 1);
  }
  assert.ok($('textarea[aria-label="Manual prompt copy fallback"]').length);
});

test("workflow tool links use names and appear once per destination", () => {
  const $ = load(renderPromptMarkup(React.createElement(Library)));
  const links = $('a[href^="/tools/"]').toArray();
  const hrefs = links.map((node) => $(node).attr("href"));
  assert.equal(new Set(hrefs).size, hrefs.length);
  assert.equal(links.length, 6);
  for (const node of links) assert.ok(!$(node).text().includes("related tool"));
});

test("the complete article bounds repeated tool links and uses the supplied author portrait", () => {
  const $ = load(
    renderPromptMarkup(
      React.createElement(Article, { schema: { "@graph": [] } }),
    ),
  );
  const counts = new Map<string, number>();
  $('a[href^="/tools/"]').each((_, node) => {
    const path = $(node).attr("href")!;
    counts.set(path, (counts.get(path) || 0) + 1);
  });
  for (const [path, count] of counts)
    assert.ok(count <= 3, `${path} repeated ${count} times`);
  assert.equal(counts.get("/tools/keyword-research-tool"), 3);
  const portrait = $('img[alt="Sufian Mustafa"]');
  assert.equal(portrait.length, 1);
  assert.ok(portrait.attr("src")!.includes("sufian-mustafa-portrait"));
  assert.equal(portrait.attr("width"), portrait.attr("height"));
});

test("editorial cards follow relevant workflows without exposing competitor source links", () => {
  const $ = load(
    renderPromptMarkup(
      React.createElement(Article, { schema: { "@graph": [] } }),
    ),
  );
  assert.equal($("aside").length, 3);
  assert.equal(
    $("#workflow-intent").next("aside").find("a").attr("href"),
    "/prompts/chatgpt-prompts-for-search-intent",
  );
  assert.equal(
    $("#workflow-metrics").next("aside").find("a").attr("href"),
    "/ai-seo/ai-vs-traditional-keyword-research",
  );
  assert.equal($('a[href*="ahrefs.com"], a[href*="semrush.com"]').length, 0);
  assert.ok(!$("h2").text().includes("Research notes and sources"));
  assert.equal(
    $("header")
      .next("figure")
      .find("img")
      .attr("src")
      ?.includes("keyword-research-prompts-hero-v2"),
    true,
  );
  assert.equal(
    promptDetails["keyword-research"].cover?.src,
    "/prompts/keyword-research-prompts-hero-v2.webp",
  );
  const counts = new Map<string, number>();
  $('a[href^="/ai-seo/"], a[href^="/tools/"], a[href^="/prompts/"]').each(
    (_, node) => {
      const path = $(node).attr("href")!;
      counts.set(path, (counts.get(path) || 0) + 1);
    },
  );
  for (const [path, count] of counts)
    assert.ok(count <= 3, `${path} repeated ${count} times`);
});
