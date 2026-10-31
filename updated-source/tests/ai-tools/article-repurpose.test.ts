import test from "node:test";
import assert from "node:assert/strict";
import { fromText } from "../../features/article-conversion/model";
import { extractArticle } from "../../features/article-conversion/extract";
import {
  articleToEpub,
  articleToMarkdown,
  buildLinkedinCarousel,
  buildNewsletter,
  buildPodcastScript,
  buildRasterCarouselPdf,
  buildSocialPosts,
  buildVideoScript,
  carouselPdf,
  cleanTopicTitle,
  ensureStructuredSocialText,
  newsletterDocx,
  newsletterHtml,
  newsletterTxt,
  podcastScriptDocx,
  podcastScriptTxt,
  recommendCarouselTemplate,
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

test("cleanTopicTitle strips SEO pipe and dash suffixes for natural spoken and social prose", () => {
  assert.equal(
    cleanTopicTitle("ChatGPT readability editing | Prompts and examples"),
    "ChatGPT readability editing",
  );
  assert.equal(
    cleanTopicTitle("AI Schema Markup — Do It With AI Tools"),
    "AI Schema Markup",
  );
});

test("ensureStructuredSocialText expands squashed single-line paragraphs into structured multi-line posts", () => {
  const squashed =
    "Chasing a generic readability score often destroys technical precision. You draft a guide and watch it strip out key terms. • Define your reader and task first. • Request a diagnosis before rewriting. • Compare original and revised versions line-by-line. For a deeper dive, read our full article: https://doitwithai.tools/ai-seo/ai-readability-tools #ChatGPT #Readability #SEO";
  const structured = ensureStructuredSocialText(squashed, "LinkedIn");
  assert(structured.includes("\n• Define your reader"));
  assert(structured.includes("\n• Request a diagnosis"));
  assert(structured.includes("\n• Compare original"));
  assert(structured.includes("\n\n🌐 For a deeper dive"));
  assert(structured.includes("\n\n#ChatGPT #Readability #SEO"));
});

test("Blog to Video Script generates sentence-by-sentence visual beats, timing, TXT, and valid DOCX ZIP", () => {
  const a = sampleArticle();
  const yt = buildVideoScript(a, "youtube", 140, 0);
  assert(yt.scenes.length >= 3);
  assert(yt.scenes.every((s) => s.beats && s.beats.length >= 1));
  assert(yt.totalWords > 20);
  assert(yt.totalSeconds > 10);

  const shorts = buildVideoScript(a, "shorts", 160, 1);
  assert(shorts.scenes.length >= 2);

  const txt = videoScriptTxt(a, yt);
  assert(txt.includes(a.title));
  assert(txt.includes("VOICEOVER:"));
  assert(txt.includes("BACKGROUND VISUAL:"));

  const docx = videoScriptDocx(a, yt);
  assert.equal(docx[0], 0x50);
  assert.equal(docx[1], 0x4b);
});

test("Blog to Social Posts generates 5 platforms with 3 structured emoji-enriched post ideas each and RFC-4180 CSV/TXT exports", () => {
  const a = sampleArticle();
  const posts = buildSocialPosts(a, "takeaways", true);
  assert.equal(posts.length, 5);
  assert.deepEqual(
    posts.map((p) => p.platform),
    ["LinkedIn", "X / Twitter Thread", "Facebook", "Instagram", "Threads"],
  );
  assert(posts.every((p) => p.ideas && p.ideas.length === 3));
  assert(posts[0].content.includes("\n• "));
  assert(posts[0].content.includes("🌐"));
  const csv = socialPostsCsv(a, posts);
  assert(csv.startsWith("Platform,Variation,Characters,Post Copy,Source URL"));
  assert(csv.includes("LinkedIn"));
  const txt = socialPostsTxt(a, posts);
  assert(txt.includes("PLATFORM: LinkedIn"));
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

test("Blog to Newsletter generates 5 subject lines, Why It Matters, checklist, HTML email template, plain text, and DOCX", () => {
  const a = sampleArticle();
  const draft = buildNewsletter(a, "executive");
  assert.equal(draft.subjectOptions.length, 5);
  assert(draft.whyItMatters.length > 10);
  assert(draft.checklist.length >= 2);
  const html = newsletterHtml(a, draft);
  assert(html.includes("<!DOCTYPE html>"));
  assert(html.includes(a.title));
  const txt = newsletterTxt(a, draft);
  assert(txt.includes("KEY TAKEAWAYS:"));
  const docx = newsletterDocx(a, draft);
  assert.equal(docx[0], 0x50);
  assert.equal(docx[1], 0x4b);
});

test("Blog to LinkedIn Carousel recommends template, extracts brand metadata, and builds Cover, Middle, and CTA slides", () => {
  const html = `<html><head><meta property="og:site_name" content="Do It With AI Tools"><meta name="theme-color" content="#1D4ED8"></head><body><header><img src="/logoForHeader.png" alt="Brand Logo"></header><article><h1>Before vs After Readability Editing</h1><p>Long technical articles require careful editing so you do not strip out key domain terminology when simplifying sentences for readers.</p><h2>Step 1: Define the reader task</h2><p>Set a clear brief before prompting AI.</p></article></body></html>`;
  const extracted = extractArticle(
    html,
    "https://doitwithai.tools/ai-seo/ai-readability-tools",
  );
  assert.equal(extracted.brand?.siteName, "Do It With AI Tools");
  assert.equal(extracted.brand?.domain, "doitwithai.tools");
  assert.equal(extracted.brand?.themeColor, "#1D4ED8");
  assert.equal(
    extracted.brand?.logoUrl,
    "https://doitwithai.tools/logoForHeader.png",
  );
  assert.equal(recommendCarouselTemplate(extracted), "before-after");

  const slides = buildLinkedinCarousel(extracted, 8);
  assert(slides.length >= 5);
  assert.equal(slides[0].kind, "cover");
  assert(slides[0].bullets && slides[0].bullets.length >= 3);
  assert.equal(slides[slides.length - 1].kind, "cta");
  assert(slides[slides.length - 1].bullets && slides[slides.length - 1].bullets!.length >= 3);

  const pdf = carouselPdf(slides, "coral", "portrait");
  const text = new TextDecoder().decode(pdf);
  assert(text.startsWith("%PDF-1.4"));
  assert(text.includes(`/Count ${slides.length}`));

  const rasterPdf = buildRasterCarouselPdf(
    [
      {
        bytes: new Uint8Array([0xff, 0xd8, 0xff, 0xd9]),
        width: 1080,
        height: 1350,
      },
    ],
    540,
    675,
  );
  assert(new TextDecoder().decode(rasterPdf.slice(0, 8)).startsWith("%PDF-1.4"));
});

test("Article to Podcast Script builds solo and co-host segments with show notes, TXT, and DOCX exports", () => {
  const a = sampleArticle();
  const cohost = buildPodcastScript(a, "cohost", 150);
  assert(cohost.segments.some((s) => s.speaker === "Host A"));
  assert(cohost.segments.some((s) => s.speaker === "Host B"));
  assert(cohost.showNotes.length >= 2);
  const txt = podcastScriptTxt(a, cohost);
  assert(txt.includes("HOST A:"));
  const docx = podcastScriptDocx(a, cohost);
  assert.equal(docx[0], 0x50);
  assert.equal(docx[1], 0x4b);
});
