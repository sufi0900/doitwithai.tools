import test from "node:test";
import assert from "node:assert/strict";
import { extractHtml } from "../../features/on-page-analyzer/server/extract";
import {
  inspectLinks,
  linksCsv,
  relationshipAdvice,
  EMPTY_DECISION,
} from "../../features/external-links/analyze";
const parse = (html: string, url = "https://example.com/article") =>
  inspectLinks(extractHtml(`<main><h1>Sources</h1>${html}</main>`, url));
test("external occurrences retain exact anchor, section, context, and relationship tokens", () => {
  const rows = parse(
    '<p>A source <a href="https://other.example/report" rel="UGC,nofollow sponsored">Read report</a>.</p><p><a href="/internal">Internal</a></p>',
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].context, "A source Read report.");
  assert.deepEqual(rows[0].rel, ["ugc", "nofollow", "sponsored"]);
  assert.equal(rows[0].classification, "External");
  assert.equal(rows[0].section, "Sources");
});
test("unknown origin never produces a confident external classification", () => {
  const rows = parse('<p><a href="https://other.example">Source</a></p>', "");
  assert.equal(rows[0].classification, "Origin unknown");
});
test("duplicate destinations retain their separate anchors and review IDs", () => {
  const rows = parse(
    '<p><a href="https://other.example">Detailed study</a></p><p><a href="https://other.example">click here</a></p>',
  );
  assert.equal(rows.length, 2);
  assert.equal(rows[0].occurrences, 2);
  assert.notEqual(rows[0].id, rows[1].id);
  assert.equal(rows[0].generic, false);
  assert.equal(rows[1].generic, true);
});
test("unsafe schemes and navigation links cannot become source review candidates", () => {
  assert.equal(
    parse(
      '<p><a href="javascript:alert(1)">Bad</a><a href="https://user:pass@other.example">Bad</a></p>',
    ).length,
    0,
  );
  const page = extractHtml(
    '<nav><a href="https://other.example">Menu</a></nav><main><p>Article</p></main>',
    "https://example.com",
  );
  assert.equal(inspectLinks(page).length, 0);
});
test("paid guidance depends on user context and accepts the documented nofollow alternative", () => {
  const row = parse(
    '<p><a href="https://competitor.example">Competitor</a></p>',
  )[0];
  assert.match(relationshipAdvice(row, EMPTY_DECISION), /Ordinary editorial/);
  assert.match(
    relationshipAdvice(row, { ...EMPTY_DECISION, purpose: "paid" }),
    /Add sponsored/,
  );
  assert.match(
    relationshipAdvice(
      { ...row, rel: ["nofollow"] },
      { ...EMPTY_DECISION, purpose: "paid" },
    ),
    /qualification is present/,
  );
  assert.match(
    relationshipAdvice(row, { ...EMPTY_DECISION, purpose: "ugc" }),
    /ugc or nofollow/,
  );
  assert.ok(!("authority" in row));
  assert.ok(!("status" in row));
});
test("exports retain every occurrence and disarm formula-like context and notes", () => {
  const rows = parse(
    Array.from(
      { length: 25 },
      () => '<p>=SUM(A1) <a href="https://other.example">Source</a></p>',
    ).join(""),
  );
  const csv = linksCsv(rows, {
    [rows[0].id]: { ...EMPTY_DECISION, note: " @SUM(A1)" },
  });
  assert.equal(csv.split("\r\n").length, 26);
  assert.ok(csv.includes('"\'=SUM(A1) Source"'));
  assert.ok(csv.includes('"\' @SUM(A1)"'));
  assert.ok(csv.includes("Not fetched"));
});
