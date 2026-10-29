import test from "node:test";
import assert from "node:assert/strict";
import { fromText } from "../../features/article-conversion/model";
import {
  articleToEpub,
  articleToMarkdown,
  buildLinkedinCarousel,
  buildNewsletter,
  buildPodcastScript,
  buildSocialPosts,
  buildVideoScript,
  carouselPdf,
  newsletterDocx,
  newsletterHtml,
  newsletterTxt,
  podcastScriptDocx,
  podcastScriptTxt,
  socialPostsCsv,
  socialPostsTxt,
  videoScriptDocx,
  videoScriptTxt,
} from "../../features/article-conversion/formats";

function sampleArticle() {
  const a = fromText(
    "# A calmer reading workflow\n\nLong pages often mix navigation, ads, and popups with the actual article text. Clean extraction keeps the reader focused on the substance.\n\n## Key implementation steps\n\n• Start with a reviewed source preview before exporting.\n\n• Preserve headings, tables, and reference links.\n\n## Measuring long-term results\n\nTeams that build repeatable content workflows can adapt their articles into scripts, e-books, carousels, and newsletters without losing source accuracy.",
    "https://example.com/guide",
  );
  a.byline = "Editorial Team";
  a.published = "2026-10-29";
  a.blocks.push({
    id: "tbl-1",
    kind: "table",
    text: "",
    header: true,
    cells: [
      ["Format", "Primary Use"],
      ["Markdown", "Documentation"],
      ["EPUB", "E-readers"],
    ],
  });
  a.links.push({
    label: "MDN Web Docs",
    url: "https://developer.mozilla.org/",
  });
  return a;
}

test("Blog to Video Script generates scenes, timing, TXT, and valid DOCX ZIP", () => {
  const a = sampleArticle();
  const yt = buildVideoScript(a, "youtube", 140, 0);
  assert(yt.scenes.length >= 3);
  assert(yt.totalWords > 10);
  assert(yt.totalSeconds > 5);

  const shorts = buildVideoScript(a, "shorts", 160, 1);
  assert(shorts.scenes.length <= 5);

  const txt = videoScriptTxt(a, yt);
  assert(txt.includes(a.title));
  assert(txt.includes("NARRATION:"));

  const docx = videoScriptDocx(a, yt);
  assert.equal(docx[0], 0x50);
  assert.equal(docx[1], 0x4b);
});

test("Blog to Social Posts generates 4 platform drafts and RFC-4180 CSV/TXT exports", () => {
  const a = sampleArticle();
  const posts = buildSocialPosts(a, "takeaways", true);
  assert.equal(posts.length, 4);
  assert.deepEqual(
    posts.map((p) => p.platform),
    ["LinkedIn", "X / Twitter Thread", "Facebook", "Instagram"],
  );
  const csv = socialPostsCsv(a, posts);
  assert(csv.startsWith("Platform,Angle,Characters,Post Copy,Source URL"));
  assert(csv.includes("LinkedIn"));
  const txt = socialPostsTxt(a, posts);
  assert(txt.includes("=== LinkedIn"));
});

test("Article to Markdown preserves frontmatter, headings, tables, and reference links", () => {
  const a = sampleArticle();
  const md = articleToMarkdown(a, {
    includeFrontmatter: true,
    includeReferences: true,
  });
  assert(md.startsWith("---\ntitle: "));
  assert(md.includes(`# ${a.title}`));
  assert(md.includes("| --- |"));
  assert(md.includes("## References"));
});

test("Article to EPUB produces a valid OCF EPUB 3 package with uncompressed mimetype first", () => {
  const a = sampleArticle();
  const { epubBytes, xhtml } = articleToEpub(a, { theme: "serif", lang: "en" });
  assert.equal(epubBytes[0], 0x50);
  assert.equal(epubBytes[1], 0x4b);
  const mimeName = new TextDecoder().decode(epubBytes.slice(30, 38));
  const mimeValue = new TextDecoder().decode(epubBytes.slice(38, 58));
  assert.equal(mimeName, "mimetype");
  assert.equal(mimeValue, "application/epub+zip");
  assert(xhtml.includes(a.title));
});

test("Blog to Newsletter generates HTML email template, plain text, and DOCX", () => {
  const a = sampleArticle();
  const draft = buildNewsletter(a);
  assert.equal(draft.subjectOptions.length, 3);
  assert(draft.takeaways.length > 0);
  const html = newsletterHtml(a, draft);
  assert(html.includes("<!DOCTYPE html>"));
  assert(html.includes(a.title));
  const txt = newsletterTxt(a, draft);
  assert(txt.includes("KEY TAKEAWAYS:"));
  const docx = newsletterDocx(a, draft);
  assert.equal(docx[0], 0x50);
  assert.equal(docx[1], 0x4b);
});

test("Blog to LinkedIn Carousel builds cover, insight, and CTA slides and exports multi-page PDF", () => {
  const a = sampleArticle();
  const slides = buildLinkedinCarousel(a, 8);
  assert(slides.length >= 3);
  assert.equal(slides[0].kind, "cover");
  assert.equal(slides[slides.length - 1].kind, "cta");
  const pdf = carouselPdf(slides, "coral", "portrait");
  const text = new TextDecoder().decode(pdf);
  assert(text.startsWith("%PDF-1.4"));
  assert(text.includes(`/Count ${slides.length}`));
});

test("Article to Podcast Script builds solo and co-host segments with TXT and DOCX exports", () => {
  const a = sampleArticle();
  const cohost = buildPodcastScript(a, "cohost", 150);
  assert(cohost.segments.some((s) => s.speaker === "Host A"));
  assert(cohost.segments.some((s) => s.speaker === "Host B"));
  const txt = podcastScriptTxt(a, cohost);
  assert(txt.includes("HOST A:"));
  const docx = podcastScriptDocx(a, cohost);
  assert.equal(docx[0], 0x50);
  assert.equal(docx[1], 0x4b);
});
