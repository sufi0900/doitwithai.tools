import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parseHTML } from "linkedom";
import { extractArticleImages } from "../../features/tool-ui/article-images";
import { ArticleImageGallery } from "../../features/tool-ui/ArticleImageGallery";
import {
  buildFallbackFacebookPosts,
  DEFAULT_FACEBOOK_POST_OUTPUT,
} from "../../features/facebook-post-generator/model";
import {
  facebookPostPackage,
  facebookSourceContent,
  readFacebookResponse,
} from "../../features/facebook-post-generator/client-state";
import type { UniversalExtractResponse } from "../../features/tool-ui/UrlArticleExtractorBar";

const base = "https://example.com/blog/guide";
function images(html: string) {
  const { document } = parseHTML(html);
  return extractArticleImages(document as unknown as Document, base, "Guide");
}

test("all 40 article images survive extraction and remain selectable beyond the former sixth thumbnail", () => {
  const assets = images(
    `<article>${Array.from({ length: 40 }, (_, index) => `<img src="/photo-${index}.jpg" alt="Section ${index}">`).join("")}</article>`,
  );
  assert.equal(assets.length, 40);
  const html = renderToStaticMarkup(
    React.createElement(ArticleImageGallery, {
      images: assets,
      selectedSrc: assets[39].src,
      onSelect() {},
    }),
  );
  const { document } = parseHTML(html);
  assert.equal(document.querySelectorAll("button[aria-pressed]").length, 40);
  assert.equal(
    document
      .querySelector('button[aria-pressed="true"]')
      ?.getAttribute("aria-label"),
    "Use article image 40: Section 39",
  );
  assert.match(html, /Showing 40 of 40 images/);
  assert.match(html, /object-contain/);
});

test("lazy, responsive, picture and Next.js images resolve to useful original URLs", () => {
  const assets = images(`<article>
    <img src="data:image/gif;base64,R0lGODlh" data-src="/lazy.jpg" alt="Lazy">
    <img src="/small.jpg" srcset="/small.jpg 320w, /large.jpg 1600w" alt="Responsive">
    <picture><source srcset="/picture.webp 1x, /picture-large.webp 2x"><img src="/fallback.jpg" alt="Picture"></picture>
    <img src="/_next/image?url=%2Foriginal.png&amp;w=640&amp;q=75" alt="Next">
    <img src="/placeholder.jpg" data-lazy-src="//cdn.example.com/real.webp" alt="Deferred">
  </article>`);
  assert.deepEqual(
    assets.map((asset) => asset.src),
    [
      "https://example.com/lazy.jpg",
      "https://example.com/large.jpg",
      "https://example.com/picture-large.webp",
      "https://example.com/original.png",
      "https://cdn.example.com/real.webp",
    ],
  );
});

test("covers, content and noscript images are deduplicated without retaining unsafe or tracking sources", () => {
  const assets =
    images(`<html><head><meta property="og:image" content="/cover.jpg"><meta name="twitter:image" content="/cover.jpg"></head><body><article>
    <img src="/cover.jpg"><img src="javascript:alert(1)"><img src="http://user:pass@example.com/photo.jpg">
    <img src="/pixel.gif" width="1" height="1"><img src="/spacer.gif"><img src="/content.png#preview">
    <img src="/content.png"><noscript><img src="/fallback-only.jpg" alt="Fallback image"></noscript>
  </article></body></html>`);
  assert.deepEqual(
    assets.map((asset) => asset.src),
    [
      "https://example.com/cover.jpg",
      "https://example.com/content.png",
      "https://example.com/fallback-only.jpg",
    ],
  );
});

test("empty image gallery explains how to add a photo instead of disappearing", () => {
  const html = renderToStaticMarkup(
    React.createElement(ArticleImageGallery, { images: [], onSelect() {} }),
  );
  assert.match(html, /upload your own photo/);
});

test("full article overview respects the extractor selection instead of reverting to subtopic one", () => {
  const payload = {
    cleanText: "The entire article, including all sections.",
    title: "Guide",
    description: "Summary",
    subTopics: [{ title: "First section", content: "Only section one" }],
  } as UniversalExtractResponse;
  assert.equal(facebookSourceContent(payload), payload.cleanText);
  assert.equal(
    facebookSourceContent({ ...payload, cleanText: "Chosen second section" }),
    "Chosen second section",
  );
});

test("response validation preserves usable drafts and reports gateway, structured and string errors", async () => {
  assert.deepEqual(
    await readFacebookResponse(Response.json(DEFAULT_FACEBOOK_POST_OUTPUT)),
    DEFAULT_FACEBOOK_POST_OUTPUT,
  );
  for (const response of [
    new Response("<html>Bad gateway</html>", { status: 502 }),
    Response.json(
      { error: { message: "Try a shorter topic." } },
      { status: 422 },
    ),
    Response.json({ error: "Please retry." }, { status: 503 }),
    Response.json({ variations: [] }),
    Response.json({
      ...DEFAULT_FACEBOOK_POST_OUTPUT,
      variations: [{ fullPostText: "incomplete" }],
    }),
  ])
    await assert.rejects(
      readFacebookResponse(response),
      /preserved|shorter|retry/i,
    );
});

test("template drafts respect blank source links and the selected format, with no invented performance results", () => {
  const result = buildFallbackFacebookPosts({
    topicOrContent:
      "Explain the supplied workflow clearly. Start with the existing article. Choose an image that supports the main point.",
    targetAudience: "Writers",
    postFormat: "community-debate",
    destinationUrl: "",
    brandTone: "Warm",
  });
  assert.match(result.variations[0].styleName, /Poll/);
  assert(
    result.variations.every((variation) => variation.firstCommentText === ""),
  );
  assert.doesNotMatch(
    JSON.stringify(result),
    /doubled|tripled|60%|reach throttling|15 minutes/,
  );
  const pkg = facebookPostPackage(DEFAULT_FACEBOOK_POST_OUTPUT.variations[0]);
  assert(pkg.includes(DEFAULT_FACEBOOK_POST_OUTPUT.variations[0].fullPostText));
  assert(
    pkg.includes(DEFAULT_FACEBOOK_POST_OUTPUT.variations[0].firstCommentText),
  );
  assert(
    pkg.includes(DEFAULT_FACEBOOK_POST_OUTPUT.variations[0].hashtags.join(" ")),
  );
});
