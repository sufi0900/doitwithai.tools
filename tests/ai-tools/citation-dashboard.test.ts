import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { load } from "cheerio";
import { Schema } from "@tiptap/pm/model";
import { draftPage } from "../../features/citation-readiness/draft-html";
import { citationReview } from "../../features/citation-readiness/review";
import {
  evidenceCoverage,
  markerTone,
  passageFlags,
  workspaceReport,
  categoryRows,
  articleMarkerTones,
} from "../../features/citation-readiness/workspace";
import {
  EMPTY_REVIEW,
  type Review,
} from "../../features/content-evidence/analyze";
import {
  claimReviewInput,
  reviewClaim,
} from "../../features/citation-readiness/claim-review-client";
import {
  reviewBlockPositions,
  locateReviewBlock,
} from "../../features/citation-readiness/editor-markers";
import { createRequire } from "node:module";
const fixture = () =>
  draftPage(
    "# Article results\n\nWe tested 25% more examples.\n\n## Details\n\nIn this guide, we explore the subject.\n\n" +
      "A long explanatory paragraph contains useful details. ".repeat(30),
  );
test("audit coverage counts available evidence without treating restrictions as passes or optional files as requirements", () => {
  const report = citationReview(fixture());
  const rows = report.rows.slice(0, 4).map((r, i) => ({
    ...r,
    optional: false,
    state: ["restriction", "observed", "review", "unknown"][
      i
    ] as typeof r.state,
  }));
  assert.deepEqual(evidenceCoverage(rows), {
    available: 3,
    total: 4,
    percentage: 75,
  });
  assert.deepEqual(evidenceCoverage([]), {
    available: 0,
    total: 0,
    percentage: null,
  });
  const p = fixture(),
    before = evidenceCoverage(citationReview(p).rows);
  p.resources.llms = "found";
  assert.deepEqual(evidenceCoverage(citationReview(p).rows), before);
  assert.ok(
    categoryRows(citationReview(p), "schema").some(
      (r) => r.id === "llms" && r.optional,
    ),
  );
});
test("claim decisions change human review progress while leaving measured coverage and citations unverified", () => {
  const p = fixture(),
    claim = citationReview(p).claims[0];
  const before = workspaceReport(p, {}),
    reviews: Record<string, Review> = {
      [claim.id]: {
        status: "recorded",
        note: "Reviewer checked the original research record.",
        evidenceUrl: "",
      },
      other: { ...EMPTY_REVIEW, status: "dismissed" },
    };
  const after = workspaceReport(p, reviews);
  assert.equal(before.manualProgress.reviewed, 0);
  assert.equal(after.manualProgress.reviewed, 1);
  assert.deepEqual(after.coverage, before.coverage);
  assert.ok(!("other" in after.manualReviews));
  assert.match(after.manualLimit, /do not establish factual accuracy/);
  reviews[claim.id] = { status: "recorded", note: "", evidenceUrl: "" };
  assert.equal(workspaceReport(p, reviews).manualProgress.reviewed, 0);
});
test("passage markers retain actual source positions and never declare missing online evidence", () => {
  const p = fixture(),
    flags = passageFlags(p);
  assert.ok(flags.some((f) => f.kind === "claim"));
  assert.ok(flags.some((f) => f.kind === "length"));
  for (const flag of flags) assert.equal(p.blocks[flag.index].id, flag.blockId);
  assert.match(
    flags.find((f) => f.kind === "claim")!.detail,
    /Evidence may exist elsewhere/,
  );
  const claim = citationReview(p).claims[0],
    mark = flags.filter((f) => f.blockId === claim.id && f.kind === "claim");
  assert.equal(markerTone(claim.id, mark, {}), "review");
  assert.equal(
    markerTone(claim.id, mark, {
      [claim.id]: {
        status: "recorded",
        note: "Source checked by me",
        evidenceUrl: "",
      },
    }),
    "recorded",
  );
  assert.equal(
    markerTone(claim.id, mark, {
      [claim.id]: { ...EMPTY_REVIEW, status: "revise" },
    }),
    "revision",
  );
});
test("recorded evidence does not erase an independent dense-paragraph cue", () => {
  const p = fixture(),
    flags = passageFlags(p),
    dense = flags.find((f) => f.kind === "length")!;
  assert.equal(
    markerTone(dense.blockId, flags, {
      [dense.blockId]: {
        status: "recorded",
        note: "Source checked",
        evidenceUrl: "",
      },
    }),
    "review",
  );
});
test("article location skips empty paragraphs and refuses mismatched or stale text", () => {
  const schema = new Schema({
    nodes: {
      doc: { content: "block+" },
      paragraph: { group: "block", content: "inline*" },
      text: { group: "inline" },
      hard_break: { inline: true, group: "inline" },
    },
  });
  const doc = schema.node("doc", null, [
    schema.node("paragraph"),
    schema.node("paragraph", null, [
      schema.text("First"),
      schema.node("hard_break"),
      schema.text("passage"),
    ]),
    schema.node("paragraph"),
    schema.node("paragraph", null, schema.text("Second passage")),
  ]);
  const positions = reviewBlockPositions(doc);
  assert.equal(positions.length, 2);
  assert.equal(positions[0].text, "First passage");
  assert.equal(locateReviewBlock(doc, 0, "First passage"), 3);
  assert.equal(
    locateReviewBlock(doc, 1, "Second passage"),
    positions[1].pos + 1,
  );
  assert.equal(locateReviewBlock(doc, 0, "An older draft"), null);
  assert.equal(locateReviewBlock(doc, 8, "Missing"), null);
});
test("selected claim requests are bounded and invalid evidence links never become review input", () => {
  const claim = citationReview(fixture()).claims[0];
  const input = claimReviewInput(
    { ...claim, text: "x".repeat(9000) },
    { status: "pending", note: "y".repeat(9000), evidenceUrl: "" },
  );
  assert.ok(input.blocks.every((b) => b.text.length <= 1600));
  assert.equal(input.blocks.length, 3);
  assert.throws(
    () =>
      claimReviewInput(claim, {
        ...EMPTY_REVIEW,
        evidenceUrl: "javascript:alert(1)",
      }),
    /http or https/,
  );
});
test("AI passage review uses the existing limited endpoint and rejects invented quotations", async () => {
  const original = globalThis.fetch,
    controller = new AbortController(),
    claim = citationReview(fixture()).claims[0];
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "/api/ai-tools/on-page/review");
      assert.equal(options?.signal, controller.signal);
      const input = JSON.parse(String(options?.body));
      assert.equal(input.blocks[1].text, claim.text);
      return new Response(
        JSON.stringify({
          result: {
            summary: "Only the supplied passage was reviewed.",
            insights: [
              {
                blockId: "block:1",
                quote: "This quote was invented",
                topic: "evidence",
                observation:
                  "This unsupported quotation should not be accepted.",
                action: "Review the actual source passage instead.",
              },
            ],
          },
        }),
      );
    };
    const result = await reviewClaim(claim, EMPTY_REVIEW, controller.signal);
    assert.deepEqual(result.insights, []);
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          error: {
            message: "Review limit reached. Continue with manual review.",
          },
        }),
        { status: 429 },
      );
    await assert.rejects(
      reviewClaim(claim, EMPTY_REVIEW, controller.signal),
      /Review limit reached/,
    );
  } finally {
    globalThis.fetch = original;
  }
});
test("initial results render coverage, statuses, and an article action without rendering the editor or running optional requests", async () => {
  const require = createRequire(import.meta.url);
  const previous = require.extensions[".css"];
  require.extensions[".css"] = (module) => {
    module.exports = new Proxy(
      {},
      { get: (_, key) => (key === "__esModule" ? false : String(key)) },
    );
  };
  const { default: Dashboard } =
    await import("../../features/citation-readiness/Dashboard");
  if (previous) require.extensions[".css"] = previous;
  else delete require.extensions[".css"];
  const html = renderToString(
    createElement(Dashboard, {
      page: fixture(),
      reviews: {},
      onSave() {},
      onLocate() {},
      onOpenArticle() {},
    }),
  );
  const $ = load(html);
  assert.match(
    $("section").first().attr("aria-label") || "",
    /results dashboard/,
  );
  assert.match($.text(), /Audit coverage/);
  assert.match($.text(), /not quality or citation probability/);
  assert.ok(
    $("button")
      .toArray()
      .some((b) => $(b).text().includes("Open article review")),
  );
  assert.equal($(".tiptap").length, 0);
  assert.equal($("nav[aria-label='Review categories'] button").length, 6);
  assert.ok($("div[hidden]").length >= 2);
});

test("batched marker tones preserve independent cues and reviewer decisions", () => {
  const p = fixture(),
    flags = passageFlags(p),
    ids = [...new Set(flags.map((f) => f.blockId))];
  const reviews: Record<string, Review> = {
    [ids[0]]: {
      status: "recorded",
      note: "Checked source record",
      evidenceUrl: "",
    },
  };
  const tones = articleMarkerTones(flags, reviews);
  for (const id of ids)
    assert.equal(tones.get(id), markerTone(id, flags, reviews));
});
