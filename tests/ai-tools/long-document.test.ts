import { test } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { randomBytes } from "node:crypto";
import { gzipSync, brotliCompressSync, deflateSync } from "node:zlib";
import {
  compactHtml,
  readDocument,
} from "../../features/internal-linking/document-reader";
import { extractPage } from "../../features/internal-linking/server";
import {
  selectReviewPassages,
  textMatches,
  type Page,
} from "../../features/internal-linking/core";
const url = "https://example.com/long-article";
const body = `<html><head><title>Long SEO guide</title></head><body><nav><p>Ignore this navigation and unrelated links in menu content.</p></nav><article><h1>SEO guide</h1><p>This opening article paragraph explains practical content planning for new website owners.</p><script>${"x".repeat(2_000_000)}</script><p>Check search intent before choosing which keywords deserve a separate article for your website.</p></article><svg><path d="${"a".repeat(100000)}" /></svg></body></html>`;
test("large HTML survives identity, gzip, Brotli and deflate decoding while scripts never enter extracted content", async () => {
  for (const [format, buffer] of [
    ["identity", Buffer.from(body)],
    ["gzip", gzipSync(body)],
    ["br", brotliCompressSync(body)],
    ["deflate", deflateSync(body)],
  ] as [string, Buffer][]) {
    const result = await readDocument(
      Readable.from([buffer]),
      format,
      "html",
      new AbortController().signal,
    );
    assert.equal(result.truncated, false);
    assert.ok(result.body.length < 1000);
    const page = extractPage(result.body, url);
    assert.equal(page.paragraphs.length, 2);
    assert.ok(page.paragraphs[1].includes("search intent"));
    assert.ok(!result.body.includes("<script"));
    assert.ok(!result.body.includes("<svg"));
    assert.ok(!result.body.includes("navigation"));
  }
});
test("streaming parser preserves entities, UTF-8 splits, existing anchors and noindex", async () => {
  const bytes = Buffer.from(
    '<html><head><meta name="robots" content="noindex"></head><body><article><p>Résumé writing &amp; research with <a href="/intent">search intent</a> are useful article topics for readers.</p></article></body></html>',
  );
  const result = await readDocument(
    Readable.from(Array.from(bytes, (byte) => Buffer.from([byte]))),
    "",
    "html",
    new AbortController().signal,
  );
  assert.throws(() => extractPage(result.body, url), /noindex/);
  const page = extractPage(result.body.replace("noindex", "index"), url);
  assert.ok(page.paragraphs[0].includes("Résumé writing & research"));
  assert.equal(page.links[0].text, "search intent");
});
test("safety limits return marked partial HTML, while corrupt compression fails instead of faking content", async () => {
  const prefix =
    "<article><p>This readable article paragraph should survive a bounded partial download for review.</p>";
  const result = await readDocument(
    Readable.from([
      Buffer.from(prefix),
      Buffer.from("<script>" + "x".repeat(10000)),
    ]),
    "",
    "html",
    new AbortController().signal,
    { wire: 20000, decoded: 1000, compact: 500 },
  );
  const wireLimited = await readDocument(
    Readable.from([Buffer.from(prefix), Buffer.from("x".repeat(10000))]),
    "",
    "html",
    new AbortController().signal,
    { wire: 200, decoded: 20000, compact: 500 },
  );
  assert.equal(wireLimited.truncated, true);
  assert.equal(extractPage(wireLimited.body, url).paragraphs.length, 1);
  assert.equal(result.truncated, true);
  assert.equal(extractPage(result.body, url).paragraphs.length, 1);
  await assert.rejects(
    readDocument(
      Readable.from([Buffer.from("not gzip")]),
      "gzip",
      "html",
      new AbortController().signal,
    ),
  );
  for (const [encoding, compress] of [
    ["gzip", gzipSync],
    ["br", brotliCompressSync],
    ["deflate", deflateSync],
  ] as const) {
    const compressed = compress(
      prefix + "<script>" + randomBytes(10000).toString("base64") + "</script>",
    );
    const partial = await readDocument(
      Readable.from([compressed]),
      encoding,
      "html",
      new AbortController().signal,
      { wire: 1000, decoded: 20000, compact: 1000 },
    );
    assert.equal(partial.truncated, true);
    assert.equal(extractPage(partial.body, url).paragraphs.length, 1);
  }
  const parser = compactHtml(100);
  parser.write("<p>" + "word ".repeat(100) + "</p>");
  assert.equal(parser.end().truncated, true);
});
test("late article passages remain available and AI review text stays within a fixed budget", () => {
  const filler = Array.from(
    { length: 150 },
    (_, i) =>
      `<p>Section ${i} explains gardening schedules, soil health, planting cycles, and seasonal care for healthy outdoor plants.</p>`,
  ).join("");
  const page = extractPage(
    `<article><h1>Research guide</h1>${filler}<p>Check search intent before choosing which keywords deserve a separate article for your website.</p></article>`,
    url,
  );
  assert.equal(page.paragraphs.length, 151);
  const destination: Page = {
    url: "https://example.com/search-intent",
    title: "How to check search intent",
    paragraphs: [
      "Search intent explains what readers want when researching a topic.",
    ],
    links: [],
  };
  const selected = selectReviewPassages(page, [destination]);
  assert.ok(selected.some((p) => p.paragraphIndex === 150));
  assert.ok(selected.length <= 16);
  assert.ok(selected.reduce((sum, p) => sum + p.passage.length, 0) <= 8000);
  assert.equal(textMatches(page, [destination])[0].paragraphIndex, 150);
});

test("landing text survives streaming cleanup while media payloads stay out of article evidence", () => {
  const parser = compactHtml();
  parser.write(
    '<main><div>Check search intent before choosing keywords for a useful article.</div><video>PRIVATE_VIDEO_PAYLOAD</video><audio>PRIVATE_AUDIO_PAYLOAD</audio><iframe>PRIVATE_FRAME_PAYLOAD</iframe><img src="https://example.com/photo.jpg"></main>',
  );
  const document = parser.end();
  assert.ok(!document.body.includes("PRIVATE_"));
  assert.ok(!document.body.includes("photo.jpg"));
  assert.equal(extractPage(document.body, url).paragraphs.length, 1);
});
