import test from "node:test";
import assert from "node:assert/strict";
import {
  addRecentUrl,
  recentUrls,
  suggestionUrl,
} from "../../features/tool-ui/recent-urls/storage";
import { criterionBasis } from "../../features/citation-readiness/criteria";
import {
  sanitizeArticleHtml,
  snapshotDocument,
  reviewDraft,
  MAX_EDITOR_TEXT,
} from "../../features/citation-readiness/rich-snapshot";
import { draftPage } from "../../features/citation-readiness/draft-html";
import { extractHtml } from "../../features/on-page-analyzer/server/extract";
import { answerReadiness } from "../../features/on-page-analyzer/readiness";
import {
  citationReview,
  readinessCsv,
} from "../../features/citation-readiness/review";
import { fetchAuditPage } from "../../features/on-page-analyzer/server/fetch";
import {
  importFailure,
  PageImportError,
} from "../../features/on-page-analyzer/import-errors";
import {
  inspectCrawlerPath,
  parseCrawlerPolicy,
} from "../../features/robots-generator/access";

test("recent URLs strip queries and fragments, reject credentials, and exclude local targets", () => {
  assert.equal(
    suggestionUrl("https://example.com/article?token=private#paragraph"),
    "https://example.com/article",
  );
  for (const url of [
    "javascript:alert(1)",
    "https://user:secret@example.com/",
    "http://127.0.0.1",
    "http://localhost",
    "http://[::1]",
    "http://intranet.local",
    "https://example.com:8443",
    "https://example.com/" + "a".repeat(2048),
  ])
    assert.equal(suggestionUrl(url), null);
  assert.deepEqual(
    recentUrls([
      1,
      null,
      "https://example.com/?token=x",
      "https://example.com/#same",
    ]),
    ["https://example.com/"],
  );
});
test("recent URL history is deduplicated, ordered, and bounded", () => {
  let urls: string[] = [];
  for (let i = 0; i < 12; i++)
    urls = addRecentUrl(urls, `https://example.com/${i}`);
  assert.equal(urls.length, 10);
  assert.equal(urls[0], "https://example.com/11");
  urls = addRecentUrl(urls, "https://example.com/5?private=token");
  assert.equal(urls[0], "https://example.com/5");
  assert.equal(new Set(urls).size, 10);
});
test("editor sanitizer retains useful structure without scripts, media, unsafe links, or handlers", () => {
  const html = sanitizeArticleHtml(
    '<h2 onclick="alert(1)">Topic</h2><p>Hello <strong>reader</strong>.</p><ul><li>One</li><li>Two</li></ul><blockquote>Quote</blockquote><script>alert(1)</script><img src="https://tracker.example/pixel"><iframe src="https://tracker.example"></iframe><a href="javascript:alert(1)">Unsafe</a><a href="https://source.example/report">Source</a><table><tr><td>Cell one</td><td>Cell two</td></tr></table>',
  );
  assert.match(html, /<strong>reader<\/strong>/);
  assert.match(html, /<li>One<\/li>/);
  assert.match(html, /<p>Cell one<\/p><p>Cell two<\/p>/);
  assert.ok(!/script|onclick|img|iframe|tracker|javascript:/.test(html));
  assert.match(html, /href="https:\/\/source.example\/report"/);
  assert.throws(() => sanitizeArticleHtml("x".repeat(750_001)), /smaller/);
});
test("rich drafts retain independent lists, headings, safe source links, and import provenance", () => {
  const original = extractHtml(
    '<main><h1>Topic</h1><p>Read the <a href="https://source.example/report">source report</a>.</p><ul><li>First item</li><li>Second item</li></ul></main>',
    "https://example.com/article",
  );
  original.source = "url";
  original.status = 200;
  original.resources.robots = "missing";
  const document = snapshotDocument(original),
    draft = reviewDraft(original, document);
  assert.equal(draft.contentEdited, true);
  assert.equal(draft.status, 200);
  assert.equal(draft.resources.robots, "missing");
  assert.deepEqual(
    draft.blocks.map((b) => b.tag),
    ["h1", "p", "li", "li"],
  );
  assert.equal(draft.links[0].href, "https://source.example/report");
  assert.equal(original.contentEdited, undefined);
  assert.match(draft.warnings.at(-1)!, /original import/);
});
test("review drafts reject oversized, empty, deeply nested, and unsafe content without fabricating sources", () => {
  const base = draftPage("");
  assert.throws(
    () =>
      reviewDraft(base, {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "x".repeat(MAX_EDITOR_TEXT + 1) }],
          },
        ],
      }),
    /160,000/,
  );
  assert.throws(() => reviewDraft(base, { type: "doc" }), /Add article/);
  let document: any = { type: "paragraph" };
  for (let i = 0; i < 32; i++)
    document = { type: "blockquote", content: [document] };
  assert.throws(() => reviewDraft(base, document), /complex/);
  const result = reviewDraft(base, {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Claim",
            marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
          },
        ],
      },
    ],
  });
  assert.deepEqual(result.links, []);
});
test("framing labels expose exact cues and do not use paragraph length as answer quality", () => {
  const p = extractHtml(
    "<main><h1>AI SEO explained</h1><p>We have seen a major change in online discovery.</p></main>",
  );
  let opening = answerReadiness(p).opening;
  assert.equal(opening.signals.rule, "framing-without-lexical-explanation");
  assert.equal(opening.signals.framing.toLowerCase(), "we have seen");
  assert.ok(opening.signals.topicTerms.includes("seo"));
  assert.deepEqual(opening.signals.matchedTerms, []);
  p.blocks[1].text =
    "AI SEO helps content research. " +
    "Useful details and exceptions follow. ".repeat(50);
  opening = answerReadiness(p).opening;
  assert.equal(opening.status, "available");
  assert.ok(opening.signals.wordCount > 180);
  assert.ok(opening.signals.matchedTerms.includes("seo"));
  p.language = "ur-PK";
  assert.equal(answerReadiness(p).opening.status, "unknown");
});
test("H1 and density measurements remain optional and never add citation penalties", () => {
  const p = draftPage("A complete opening paragraph.");
  let report = citationReview(p);
  for (const id of ["structure", "paragraphs"]) {
    const row = report.rows.find((r) => r.id === id)!;
    assert.equal(row.optional, true);
    assert.equal(row.state, "observed");
    assert.equal(row.basis.label, "Editorial heuristic");
  }
  p.blocks[0].text = "An additional explanation. ".repeat(200);
  report = citationReview(p);
  assert.equal(
    report.rows.find((r) => r.id === "paragraphs")!.state,
    "observed",
  );
  assert.match(readinessCsv(report), /Editorial heuristic/);
});
test("claim previews reuse evidence cues, source candidates, and explicit non-verification", () => {
  const p = extractHtml(
    '<main><h1>Results</h1><p>We tested 20% more examples with a <a href="https://example.org/report">report</a>.</p></main>',
    "https://example.com",
  );
  const report = citationReview(p);
  assert.equal(report.claims.length, 1);
  assert.ok(report.claims[0].cues.includes("experience"));
  assert.equal(report.claims[0].sources[0].href, "https://example.org/report");
  assert.match(readinessCsv(report), /Not verified/);
});
test("documented controls and editorial suggestions have different evidence labels", () => {
  assert.equal(criterionBasis("snippets").label, "Documented Google control");
  assert.equal(criterionBasis("openings").label, "Editorial heuristic");
  assert.match(
    criterionBasis("crawler-OAI-SearchBot").references[0].url,
    /openai/,
  );
  assert.match(
    criterionBasis("crawler-PerplexityBot").references[0].url,
    /perplexity/,
  );
  assert.match(
    criterionBasis("crawler-Claude-SearchBot").references[0].url,
    /claude/,
  );
});
test("source refusals preserve typed status, cancel bodies, and are not retried or treated as citation failures", async () => {
  let calls = 0,
    canceled = false;
  const body = new ReadableStream({
    cancel() {
      canceled = true;
    },
  });
  await assert.rejects(
    fetchAuditPage("https://example.com", {
      safeUrl: async (url) => new URL(url),
      fetcher: async () => {
        calls++;
        return new Response(body, { status: 403 });
      },
    }),
    (error: unknown) => {
      assert.ok(error instanceof PageImportError);
      const failure = importFailure(error);
      assert.equal(failure.code, "SOURCE_ACCESS_DENIED");
      assert.equal(failure.targetStatus, 403);
      assert.match(failure.message, /No content verdict/);
      return true;
    },
  );
  assert.equal(calls, 1);
  assert.equal(canceled, true);
});
test("successful access challenge pages cannot become article reports", async () => {
  await assert.rejects(
    fetchAuditPage("https://example.com", {
      safeUrl: async (url) => new URL(url),
      fetcher: async () =>
        new Response(
          "<html><title>Just a moment...</title><p>Verify access.</p></html>",
          { headers: { "content-type": "text/html" } },
        ),
    }),
    (error: unknown) => {
      assert.ok(error instanceof PageImportError);
      assert.equal(error.code, "SOURCE_CHALLENGE");
      return true;
    },
  );
});
test("equivalent crawler product-token groups merge despite version spelling", () => {
  const policy = parseCrawlerPolicy(
    "User-agent: OAI-SearchBot\nDisallow: /private\nUser-agent: OAI-SearchBot/1.4\nAllow: /private/public",
  );
  const result = inspectCrawlerPath(
    policy,
    "OAI-SearchBot",
    "/private/public/page",
  );
  assert.equal(result.status, "allowed");
  assert.match(result.matchedAgent, /OAI-SearchBot/);
  assert.equal(
    inspectCrawlerPath(policy, "OAI-SearchBot", "/private/secret").status,
    "blocked",
  );
});

test("hidden pasted content is excluded and ordinary short titles are not access challenges", async () => {
  const clean = sanitizeArticleHtml(
    '<p>Visible content.</p><p hidden>Hidden claim</p><p style="display:none">Hidden style</p><nav>Menu</nav>',
  );
  assert.equal(clean, "<p>Visible content.</p>");
  const result = await fetchAuditPage("https://example.com", {
    safeUrl: async (url) => new URL(url),
    fetcher: async (input) =>
      new Response(
        String(input).endsWith(".txt")
          ? "User-agent: *\nAllow: /"
          : "<html><title>Just a moment...</title><main><h1>A moment</h1><p>A short reflection on time.</p></main></html>",
        {
          headers: {
            "content-type": String(input).endsWith(".txt")
              ? "text/plain"
              : "text/html",
          },
        },
      ),
  });
  assert.equal(result.title, "Just a moment...");
});
