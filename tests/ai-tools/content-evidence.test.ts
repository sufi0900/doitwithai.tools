import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../../app/api/ai-tools/on-page/analyze/route";
import { extractHtml } from "../../features/on-page-analyzer/server/extract";
import {
  analyzeEvidence,
  textInput,
  validateReview,
  reviewProgress,
  evidenceCsv,
  safeSourceUrl,
  MAX_TEXT,
} from "../../features/content-evidence/analyze";

test("the shared HTML import returns source context usable by the dedicated review", async () => {
  const response = await POST(
    new NextRequest("https://doitwithai.tools/api/ai-tools/on-page/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        url: "https://example.com/article",
        html: '<main><h1>Review</h1><p>According to this study, 42% agreed. <a href="https://study.example/report">Source</a></p></main>',
      }),
    }),
  );
  assert.equal(response.status, 200);
  const report = analyzeEvidence((await response.json()).result);
  assert.equal(report.claims.length, 1);
  assert.equal(report.claims[0].sources[0].placement, "Same passage");
  assert.equal(
    report.claims[0].sources[0].href,
    "https://study.example/report",
  );
});

test("claim passages keep exact content and source links retain their actual block context", () => {
  const page = extractHtml(
    '<nav><a href="https://ads.example">A survey found 99%.</a></nav><main><h1>Research</h1><p>According to this study, 42% of respondents agreed. <a href="/research">Read study</a>.</p><p>More context.</p><h2>Other claims</h2><p>This always works.</p><script>research shows 80%</script></main>',
    "https://example.com/article",
  );
  const report = analyzeEvidence(page);
  assert.equal(report.claims.length, 2);
  assert.equal(
    report.claims[0].text,
    "According to this study, 42% of respondents agreed. Read study.",
  );
  assert.deepEqual(report.claims[0].cues, ["numbers", "research"]);
  assert.equal(
    report.claims[0].sources[0].href,
    "https://example.com/research",
  );
  assert.equal(report.claims[0].sources[0].placement, "Same passage");
  assert.equal(report.claims[0].sources[0].kind, "Internal");
  assert.equal(report.claims[1].sources.length, 0);
  assert.equal(report.sourceCount, 1);
});
test("nearby candidates never cross heading boundaries or match by repeated anchor wording", () => {
  const page = extractHtml(
    '<main><h1>Intro</h1><p><a href="https://research.example">Details</a></p><h2>Another section</h2><p>Research shows this is the best choice.</p><p>Details about the claim.</p><p><a href="https://wrong.example">Details</a></p></main>',
    "https://example.com/article",
  );
  const report = analyzeEvidence(page);
  assert.equal(report.claims.length, 1);
  assert.equal(report.claims[0].section, "Another section");
  assert.equal(report.claims[0].sources.length, 0);
});
test("same-passage candidates win over repeated neighboring links and are not marked verified", () => {
  const page = extractHtml(
    '<main><h1>Tests</h1><p><a href="https://source.example/report">Earlier</a></p><p>We tested a workflow with 20% less time. <a href="https://source.example/report">Method</a></p><p><a href="https://other.example">Follow-up</a></p></main>',
    "https://example.com/article",
  );
  const [claim] = analyzeEvidence(page).claims;
  assert.equal(claim.sources.length, 2);
  assert.equal(claim.sources[0].placement, "Same passage");
  assert.equal(claim.sources[1].placement, "Following passage");
  assert.equal(claim.sources[0].kind, "External");
  assert.ok(!("verified" in claim.sources[0]));
});
test("plain text keeps list boundaries and ignores cue words found only in URLs", () => {
  const report = analyzeEvidence(
    textInput(
      "# Draft\n- We tested a method.\n- A survey found 45% preferred it.\nRead https://example.com/best-research-shows-100%.",
      "https://example.com/article",
    ),
  );
  assert.equal(report.claims.length, 2);
  assert.equal(report.input.blocks[1].tag, "li");
  assert.equal(report.input.blocks[2].tag, "li");
  assert.equal(
    report.input.links[0].href,
    "https://example.com/best-research-shows-100%",
  );
});
test("manual evidence needs a note or safe URL and progress never changes the detected findings", () => {
  assert.ok(validateReview({ status: "recorded", note: "", evidenceUrl: "" }));
  assert.equal(
    validateReview({
      status: "recorded",
      note: "Book title, page 37. Checked the original result.",
      evidenceUrl: "",
    }),
    null,
  );
  assert.ok(
    validateReview({
      status: "recorded",
      note: "",
      evidenceUrl: "javascript:alert(1)",
    }),
  );
  assert.ok(
    validateReview({
      status: "recorded",
      note: "",
      evidenceUrl: "https://name:secret@example.com",
    }),
  );
  assert.equal(safeSourceUrl("/relative"), null);
  const report = analyzeEvidence(
    textInput("Research shows 12% improved.\nThis always works."),
  );
  const before = JSON.stringify(report);
  const progress = reviewProgress(report.claims, {
    [report.claims[0].id]: {
      status: "revise",
      note: "Check the sample.",
      evidenceUrl: "",
    },
  });
  assert.deepEqual(progress, {
    reviewed: 1,
    total: 2,
    percentage: 50,
    revise: 1,
  });
  assert.equal(JSON.stringify(report), before);
});
test("CSV exports every detected passage and neutralizes formula-like notes and content", () => {
  const report = analyzeEvidence(
    textInput(
      Array.from(
        { length: 45 },
        (_, i) => `=SUM(A1) Research shows ${i}% improved.`,
      ).join("\n"),
    ),
  );
  const csv = evidenceCsv(report, {
    [report.claims[0].id]: {
      status: "recorded",
      note: '  =HYPERLINK("bad")',
      evidenceUrl: "",
    },
  });
  assert.equal(report.claims.length, 45);
  assert.equal(csv.split("\r\n").length, 46);
  assert.ok(csv.includes('"\'=SUM(A1) Research shows 0% improved."'));
  assert.ok(csv.includes('"\'  =HYPERLINK(""bad"")"'));
  assert.ok(csv.includes("Evidence recorded by you"));
});
test("long and partial inputs expose coverage limits rather than claiming accuracy", () => {
  assert.throws(() => textInput("x".repeat(MAX_TEXT + 1)), /150,000/);
  assert.throws(() => textInput("  "), /Paste/);
  const input = textInput(
    Array.from({ length: 1201 }, () => "A short paragraph.").join("\n"),
  );
  assert.equal(input.partial, true);
  assert.equal(input.blocks.length, 1200);
  assert.ok(input.warnings.length);
  assert.equal(analyzeEvidence(input).claims.length, 0);
});
