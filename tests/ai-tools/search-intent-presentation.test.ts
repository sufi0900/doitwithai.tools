import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import IntentResults from "../../features/search-intent/Results";
import SearchIntentClient from "../../features/search-intent/Client";
import {
  copyReport,
  intentPresentation,
  reportBasis,
} from "../../features/search-intent/presentation";
import {
  quickAnalyze,
  validateOutput,
  intents,
} from "../../features/search-intent/schema";
const report = quickAnalyze({
  keywords: [
    "how to write a meta title",
    "ChatGPT login",
    "best writing tools",
    "buy an SEO course",
    "AI writing",
  ],
  audience: "Content writers",
  market: "English",
  notes: "",
});

test("every intent keeps its named meaning and a distinct color, including uncertainty", () => {
  assert.deepEqual(
    report.items.map((item) => item.primary),
    [...intents],
  );
  assert.equal(
    new Set(intents.map((intent) => intentPresentation[intent].border)).size,
    intents.length,
  );
  for (const intent of intents)
    assert.ok(intentPresentation[intent].meaning.length > 20);
  assert.match(intentPresentation["Mixed / unclear"].meaning, /context/);
});

test("results keep a compact shared toolbar before query cards and limitations after them", () => {
  const $ = load(
    renderToStaticMarkup(
      React.createElement(IntentResults, {
        report,
        onCopy() {},
        onDownload() {},
      }),
    ),
  );
  const cards = $("article");
  assert.equal(cards.length, 5);
  cards.each((index, card) => {
    assert.equal($(card).find("h4").text(), report.items[index].keyword);
    assert.equal(
      $(card).find("[data-intent]").text(),
      report.items[index].primary,
    );
    assert.match($(card).text(), /What the reader wants/);
    assert.match($(card).text(), /Suggested page format/);
    assert.equal($(card).find("details").attr("open"), undefined);
    assert.ok(
      $(card).find("details").text().includes(report.items[index].uncertainty),
    );
  });
  const text = $("body").text();
  assert.ok(text.indexOf("Informational") < text.indexOf(report.notice));
  assert.ok(
    text.indexOf("Copy results") < text.indexOf(report.items[0].keyword),
  );
  assert.ok(
    text.indexOf("Download CSV") < text.indexOf(report.items[0].keyword),
  );
  assert.equal($("button").length, 2);
  assert.equal($("button[type='button']").length, 2);
  assert.ok($("a[href='/tools/article-outline-generator']").length);
  assert.ok($("a[href='#intent-keywords']").length);
});

test("batch results retain all queries, exact evidence, secondary labels, and escaped user text", () => {
  const input = {
    keywords: [
      "how to buy a domain",
      "<script>alert('test')</script>",
      ...Array.from({ length: 8 }, (_, n) => `how to write title ${n}`),
    ],
    audience: "",
    market: "",
    notes: "",
  };
  const batch = quickAnalyze(input);
  const $ = load(
    renderToStaticMarkup(
      React.createElement(IntentResults, {
        report: batch,
        onCopy() {},
        onDownload() {},
      }),
    ),
  );
  assert.equal($("article").length, 10);
  assert.equal($("script").length, 0);
  assert.ok(
    $("article")
      .first()
      .text()
      .includes("Possible secondary intent: Transactional"),
  );
  assert.equal(
    new Set(
      $("article")
        .map((_, card) => $(card).attr("aria-labelledby"))
        .get(),
    ).size,
    10,
  );
  assert.ok($("article").eq(1).text().includes(input.keywords[1]));
  const text = copyReport(batch);
  assert.ok(text.includes("Possible secondary intent: Transactional"));
  assert.ok(text.includes("Keyword: “buy”"));
  assert.ok(text.includes("Keyword: “how”"));
  assert.ok(text.includes(batch.notice));
  batch.items.forEach((item) => assert.ok(text.includes(item.keyword)));
});

test("result basis distinguishes quick wording from reviewed pasted evidence", () => {
  assert.equal(reportBasis(report), "Keyword wording estimate");
  const input = {
    keywords: ["SEO tools"],
    audience: "",
    market: "",
    notes: "comparison pages",
  };
  const ai = validateOutput(
    {
      items: [
        {
          ...report.items[0],
          index: 0,
          evidence: [{ source: "Pasted notes", quote: "comparison pages" }],
        },
      ],
    },
    input,
  );
  assert.equal(reportBasis(ai), "AI review of your result notes");
  assert.equal(
    reportBasis({ ...ai, method: "AI estimate" }),
    "AI interpretation of your keywords",
  );
  assert.ok(copyReport(ai).includes("Pasted notes: “comparison pages”"));
});

test("the initial workspace offers an immediate keyword check before optional AI context", () => {
  const $ = load(renderToStaticMarkup(React.createElement(SearchIntentClient)));
  assert.equal(
    $("form button[type='submit']").text().trim(),
    "Check keyword intent",
  );
  const ai = $("form button").filter((_, button) =>
    $(button).text().includes("Review with AI"),
  );
  assert.equal(ai.attr("type"), "button");
  assert.equal($("form details").first().attr("open"), undefined);
  assert.equal(
    $("[role='region'][aria-label='Keyword intent results']").attr("aria-busy"),
    "false",
  );
  assert.equal($("[role='region'] [role='status']").length, 0);
  assert.equal($("[role='status']").length, 1);
  assert.equal($("article").length, 0);
  assert.equal(
    $("button").filter((_, button) => /Copy|Download/.test($(button).text()))
      .length,
    0,
  );
});
