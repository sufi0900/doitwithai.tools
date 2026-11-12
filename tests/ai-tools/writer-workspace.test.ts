import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { parseHTML } from "linkedom";
import { readFileSync } from "node:fs";
import JSZip from "jszip";
import {
  applyPlan,
  articleMarkdown,
  articleModel,
  articleRevision,
  blankProject,
  bodyOf,
  inputRevision,
  makeSection,
  markdownNodes,
  parseBrief,
  patchWorkspace,
  projectDocument,
  readiness,
  refreshVisual,
  setSectionBody,
  syncDocument,
  workspace,
} from "../../features/writer-workspace/model";
import {
  canApplyResponse,
  generationContext,
} from "../../features/writer-workspace/useGeneration";
import { createGenerationHandler } from "../../features/writer-workspace/generation.server";
import {
  htmlArticle,
  newsletter,
  socialDrafts,
} from "../../features/writer-workspace/assets";
import { articlePdf } from "../../features/article-conversion/pdf";
import { articleDocx } from "../../features/article-conversion/docx";
import { articleToEpub } from "../../features/article-conversion/formats";
import { defaults } from "../../features/article-conversion/model";
import {
  importBlogProjectJsonFile,
  serializeBlogProjectToJson,
} from "../../lib/blog-writer/project-storage-db";
import { buildInfographicScene } from "../../lib/blog-infographic-studio/canvas-renderer";
const paragraphs = [
  "Clean the keyword list before choosing the next page. Remove terms that do not help the intended reader. Keep distinct questions together when they share the same search intent, then inspect existing pages before deciding that another article is needed. A useful map ties each topic to a page and a purpose.",
  "Choose a small group of related questions for each page. Compare what readers need to learn with what the page already explains. A practical example can make the difference between a vague instruction and a useful next step. Check the draft against the original brief and review its sources before publishing it.",
];
function draft() {
  let p = blankProject();
  p.metaPack.h1Title = "What to Do After Keyword Research";
  p.metaPack.metaTitle = "What to Do After Keyword Research: A Practical Guide";
  p.metaPack.metaDescription =
    "Turn your keyword list into a useful content plan. Clean, group and map related queries, then write the pages that help your readers most.";
  p.sections = paragraphs.map((text, i) =>
    setSectionBody(
      makeSection(
        {
          heading: i ? "Map topics to pages" : "Clean the keyword list",
          subheadings: [],
        },
        i,
      ),
      text,
    ),
  );
  return p;
}
const brief = {
  operation: "section",
  requestId: "test-request-123",
  brief: "Write a useful guide to keyword research.",
  section: { heading: "Map keywords to pages", subheadings: [] },
  outline: [],
};
const req = (data: unknown) =>
  new NextRequest("https://example.com/api/writer-workspace/generate", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "content-type": "application/json" },
  });
const allowed = async () => ({
  allowed: true,
  remaining: 99,
  retryAfterSeconds: 0,
  release: async () => {},
});
const provider = (data: unknown) => () => ({
  generate: async () => ({ output_parsed: data, provider: "gemini" }),
});
test("new projects have no seeded article, author identity, source claims or score", () => {
  const p = blankProject();
  assert.equal(p.authorName, "");
  assert.equal(p.brandSiteUrl, "");
  assert.equal(p.sections.length, 0);
  assert.equal(p.metaPack.h1Title, "");
  assert.equal(readiness(p).score, 0);
  assert.deepEqual(p.eeatCitations, []);
});
test("freeform intake preserves explicit H2/H3 outline and keyword without forcing a mode", () => {
  const b = parseBrief(
    "Topic: A balcony garden\nKeyword: balcony gardening\nH2: Choose the plants\nH3: Sun and shade\n## Plan the watering\n### Test the soil",
  );
  assert.equal(b.keyword, "balcony gardening");
  assert.equal(b.topic, "A balcony garden");
  assert.deepEqual(
    b.outline.map((x) => [x.heading, x.subheadings]),
    [
      ["Choose the plants", ["Sun and shade"]],
      ["Plan the watering", ["Test the soil"]],
    ],
  );
  assert.equal(
    parseBrief("I want to help beginners grow herbs.").outline.length,
    0,
  );
});
test("a supplied outline takes precedence over generated heading suggestions", () => {
  const p = applyPlan(
    blankProject(),
    {
      title: "Garden guide",
      metaTitle: "Garden Guide",
      metaDescription:
        "Learn how to plan a garden for a small balcony with useful steps.",
      slug: "garden-guide",
      introduction: "Start with the space you have.",
      titles: ["Garden Ideas", "Plan a Garden"],
      descriptions: [],
      sections: [{ heading: "Wrong outline", subheadings: [] }],
    },
    [{ heading: "My exact heading", subheadings: ["My exact subheading"] }],
  );
  assert.equal(p.sections[0].h2Text, "My exact heading");
  assert.equal(p.sections[0].subHeadings[0].h3Text, "My exact subheading");
  assert.equal(p.sections[0].bodyMarkdown, "");
  assert.equal(p.metaPack.metaTitle, "Garden Guide");
});
test("rich document round trip keeps emphasis, links, lists, tables, H3 and stable section ids", () => {
  let p = draft();
  p.sections[0] = setSectionBody(
    p.sections[0],
    paragraphs[0] +
      "\n\n### A useful example\n\nUse **natural language** with a [reference](https://example.com/source).\n\n- One page\n- Related questions\n\n| Page | Intent |\n| --- | --- |\n| Guide | Learn |",
  );
  const doc = projectDocument(p),
    firstId = p.sections[0].id;
  p = syncDocument(p, doc);
  const markdown = articleMarkdown(p);
  assert.match(markdown, /\*\*natural language\*\*/);
  assert.match(markdown, /\[reference\]\(https:\/\/example.com\/source\)/);
  assert.match(markdown, /- One page\n- Related questions/);
  assert.match(markdown, /\| Guide \| Learn \|/);
  assert.equal(p.sections[0].id, firstId);
  assert.equal(p.sections[0].subHeadings[0].h3Text, "A useful example");
  assert.ok(!markdown.includes("metaDescription"));
  assert.equal(
    articleModel(p).blocks.filter((x) => x.kind === "table").length,
    1,
  );
});
test("new manual headings gain stable ids and renamed H2 keeps its body", () => {
  let p = blankProject();
  const doc = {
    type: "doc",
    content: markdownNodes(
      "# My article\n\nIntroduction.\n\n## First topic\n\nKeep this explanation.",
    ),
  };
  p = syncDocument(p, doc);
  const sid = p.sections[0].id,
    next = structuredClone(projectDocument(p));
  next.content![2].content = [{ type: "text", text: "A renamed topic" }];
  p = syncDocument(p, next);
  assert.equal(p.sections[0].id, sid);
  assert.match(bodyOf(p.sections[0]), /Keep this explanation/);
});
test("late responses are rejected after edits, brief changes or project switches", () => {
  const p = draft(),
    r = articleRevision(p),
    h = inputRevision(p);
  assert.ok(canApplyResponse(p, p.projectId, h, r));
  assert.equal(
    canApplyResponse(
      { ...p, metaPack: { ...p.metaPack, metaTitle: "A changed title" } },
      p.projectId,
      h,
      r,
    ),
    false,
  );
  assert.equal(
    canApplyResponse(
      { ...p, rawUserBriefOrSourceText: "Another topic" },
      p.projectId,
      h,
      r,
    ),
    false,
  );
  assert.equal(
    canApplyResponse({ ...p, projectId: "another" }, p.projectId, h, r),
    false,
  );
});
test("infographics derive explanation bodies and export models include real image blocks", () => {
  let p = draft();
  p.sections = p.sections.map((s) => refreshVisual(s, p));
  const s = p.sections[0],
    scene = buildInfographicScene(s.infographicConfig);
  assert.ok(s.infographicConfig.nodes.length >= 2);
  assert.ok(s.infographicConfig.nodes.every((n) => n.detail.length > 15));
  assert.equal(scene.issues.length, 0, JSON.stringify(scene.issues));
  assert.ok(
    articleModel(p).blocks.some(
      (b) => b.kind === "image" && b.id === `visual-${s.id}`,
    ),
  );
  assert.match(htmlArticle(p), /<figure><img width=/);
});
test("safe HTML keeps formatting and separates metadata from article content", () => {
  const p = syncDocument(draft(), {
    type: "doc",
    content: markdownNodes(
      "# Article <unsafe>\n\nUse **careful** language and [bad](javascript:alert).\n\n## Notes\n\nA source is needed.",
    ),
  });
  p.metaPack.metaDescription = "Metadata only";
  const html = htmlArticle(p);
  assert.match(html, /<h1>Article &lt;unsafe&gt;<\/h1>/);
  assert.match(html, /<strong>careful<\/strong>/);
  assert.ok(!html.includes('href="javascript:'));
  const body = html.split("<body>")[1];
  assert.ok(!body.includes("Metadata only"));
});
test("social drafts and newsletter overrides follow article revisions and survive backup import", () => {
  let p = draft();
  const posts = socialDrafts(p);
  assert.equal(posts.length, 9);
  assert.ok(
    posts.some((x) => x.channel === "YouTube" && x.caption.length > 100),
  );
  p = patchWorkspace(p, {
    social: {
      Facebook: {
        caption: "My own caption",
        sourceRevision: articleRevision(p),
      },
    },
    email: {
      subject: "My subject",
      body: "My own email body.",
      sourceRevision: articleRevision(p),
    },
  });
  const imported = importBlogProjectJsonFile(serializeBlogProjectToJson(p));
  assert.equal(workspace(imported).social.Facebook.caption, "My own caption");
  assert.match(newsletter(imported).text, /My own email body/);
  p.metaPack.metaTitle = "An edited title";
  assert.equal(
    socialDrafts(p).find((x) => x.channel === "Facebook")!.stale,
    true,
  );
});
test("source text is bounded in the shared model context and never represented as verified citations", () => {
  const p = draft();
  p.writerWorkspace = {
    ...workspace(p),
    references: [
      {
        id: "ref",
        url: "https://example.com",
        title: "Example",
        text: "x".repeat(10000),
      },
    ],
  };
  assert.equal(generationContext(p).sources[0].text.length, 8000);
  assert.equal(p.eeatCitations.length, 0);
  assert.match(
    readiness(p).checks.find((c) => c.id === "sources")!.detail,
    /human verification/,
  );
});
test("missing providers return 503 with no demo project or success response", async () => {
  const response = await createGenerationHandler({ configured: () => false })(
    req(brief),
  );
  assert.equal(response.status, 503);
  const result = await response.json();
  assert.match(result.error, /not configured/);
  assert.equal(result.ok, undefined);
  assert.equal(result.project, undefined);
});
test("a provider failure refunds the failed step and returns a real error", async () => {
  let refunded = 0;
  const response = await createGenerationHandler({
    configured: () => true,
    limit: async () => ({
      ...(await allowed()),
      release: async () => {
        refunded++;
      },
    }),
    generate: () =>
      ({
        generate: async () => {
          throw new Error("upstream failed");
        },
      }) as any,
  })(req(brief));
  assert.equal(response.status, 503);
  assert.equal(refunded, 1);
  assert.match((await response.json()).error, /draft is unchanged/);
});
test("invalid or heading-only responses fail validation and missing H3 is not accepted", async () => {
  for (const output of [
    { bodyMarkdown: "Heading only" },
    { bodyMarkdown: paragraphs[0] },
  ]) {
    const response = await createGenerationHandler({
      configured: () => true,
      limit: allowed as any,
      generate: provider(output) as any,
    })(
      req({
        ...brief,
        section: { ...brief.section, subheadings: ["Required detail"] },
      }),
    );
    assert.ok([422, 503].includes(response.status));
    assert.equal((await response.json()).ok, undefined);
  }
});
test("a valid section responds with the original request id and review requirement", async () => {
  const response = await createGenerationHandler({
    configured: () => true,
    limit: allowed as any,
    generate: provider({ bodyMarkdown: paragraphs[0] }) as any,
  })(req(brief));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.requestId, brief.requestId);
  assert.equal(result.reviewRequired, true);
  assert.equal(result.data.bodyMarkdown, paragraphs[0]);
});
test("rate limiting returns retry information and never invokes the model", async () => {
  let called = false;
  const response = await createGenerationHandler({
    configured: () => true,
    limit: async () => ({ allowed: false, retryAfterSeconds: 30 }) as any,
    generate: () => {
      called = true;
      return {} as any;
    },
  })(req(brief));
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "30");
  assert.equal(called, false);
});
test("exports are real PDF, DOCX and EPUB documents, not renamed text files", async () => {
  const article = articleModel(draft()),
    fonts = {
      sans: readFileSync(
        "public/fonts/article-export/NotoSans-Regular.ttf",
      ).toString("base64"),
      arabic: readFileSync(
        "public/fonts/article-export/NotoNaskhArabic-Regular.ttf",
      ).toString("base64"),
      images: {},
    };
  const pdf = await articlePdf(article, defaults, fonts);
  assert.equal(
    new TextDecoder().decode(new Uint8Array(pdf.bytes).slice(0, 5)),
    "%PDF-",
  );
  const docx = await articleDocx(article, defaults),
    zip = await JSZip.loadAsync(docx.bytes);
  assert.ok(zip.file("word/document.xml"));
  const epub = articleToEpub(article),
    book = await JSZip.loadAsync(epub.epubBytes);
  assert.equal(
    await book.file("mimetype")!.async("string"),
    "application/epub+zip",
  );
});

test("section queue checkpoints completed work and resumes only unfinished sections", async () => {
  const { draftPendingSections, pendingSections } =
    await import("../../features/writer-workspace/jobs");
  let p = draft();
  p.sections = p.sections.map((s) => ({
    ...s,
    bodyMarkdown: "",
    subHeadings: [],
  }));
  let saved = 0,
    calls = 0;
  const options = {
    get: () => p,
    commit: (f: any) => (p = f(p)),
    save: async () => {
      saved++;
    },
    signal: new AbortController().signal,
    active: () => true,
    request: async () => {
      calls++;
      if (calls === 2) throw new Error("provider unavailable");
      return { data: { bodyMarkdown: paragraphs[0] } };
    },
  };
  await assert.rejects(draftPendingSections(options), /provider unavailable/);
  assert.equal(saved, 1);
  assert.equal(pendingSections(p).length, 1);
  const firstBody = p.sections[0].bodyMarkdown;
  await draftPendingSections({
    ...options,
    request: async () => ({ data: { bodyMarkdown: paragraphs[1] } }),
  });
  assert.equal(pendingSections(p).length, 0);
  assert.equal(p.sections[0].bodyMarkdown, firstBody);
  assert.equal(saved, 2);
});
test("cancelled or edited section requests never commit the delayed body", async () => {
  const { draftPendingSections } =
    await import("../../features/writer-workspace/jobs");
  for (const mode of ["cancel", "edit", "switch"]) {
    let p = draft();
    p.sections = [{ ...p.sections[0], bodyMarkdown: "", subHeadings: [] }];
    const controller = new AbortController();
    let commits = 0;
    await assert.rejects(
      draftPendingSections({
        get: () => p,
        commit: (f: any) => (p = f(p)),
        save: async () => {
          commits++;
        },
        signal: controller.signal,
        active: () => true,
        request: async () => {
          if (mode === "cancel") controller.abort();
          else if (mode === "edit")
            p = {
              ...p,
              metaPack: {
                ...p.metaPack,
                aeoDirectAnswer50Words: "My human edit.",
              },
            };
          else p = { ...p, projectId: "new-project" };
          return { data: { bodyMarkdown: paragraphs[0] } };
        },
      }),
    );
    assert.equal(commits, 0);
    assert.equal(p.sections[0].bodyMarkdown, "");
  }
});
test("social and newsletter defaults contain source text without invented links or team claims", () => {
  const p = draft();
  p.metaPack.h1Title = "Growing balcony herbs";
  p.sections[0].h2Text = "Choose suitable containers";
  p.sections[0].bodyMarkdown =
    "Choose containers with drainage holes. Place saucers under the pots to protect the balcony floor. Match the pot size to the herb before planting it.";
  const post = socialDrafts(p).find((s) => s.channel === "Facebook")!;
  assert.match(post.caption, /Growing balcony herbs/);
  assert.match(post.caption, /drainage holes/);
  assert.ok(!post.caption.includes("doitwithai.tools"));
  assert.ok(!post.caption.includes("Your workflow can use"));
  const email = newsletter(p);
  assert.equal(email.draft.ctaUrl, "");
  assert.ok(!email.draft.subjectOptions.some((s) => s.includes("most teams")));
});

test("EPUB carries real section illustrations and the export image inclusion flag is explicit", async () => {
  const { epubBytes } = await import("../../features/writer-workspace/assets");
  let p = draft();
  p.sections = p.sections.map((s) => refreshVisual(s, p));
  const images = articleModel(p).blocks.filter((b) => b.kind === "image");
  assert.equal(images.length, 2);
  assert.ok(images.every((b) => b.included === true));
  const out = await epubBytes(p),
    zip = await JSZip.loadAsync(out.bytes);
  assert.equal(out.warnings.length, 0);
  assert.equal(
    Object.keys(zip.files).filter((n) => n.endsWith(".svg")).length,
    2,
  );
  assert.match(
    await zip.file("OEBPS/article.xhtml")!.async("string"),
    /<figure><img src="images\//,
  );
  assert.match(
    await zip.file("OEBPS/content.opf")!.async("string"),
    /media-type="image\/svg\+xml"/,
  );
});

test("carousel slides use section evidence without adding placeholder steps", async () => {
  const { carouselSlides } =
    await import("../../features/writer-workspace/assets");
  const p = draft(),
    slides = carouselSlides(p);
  assert.equal(slides.length, 3);
  assert.equal(slides[0].headline, p.metaPack.h1Title);
  assert.match(slides[1].body, /Remove terms/);
  assert.equal(slides[2].headline, p.sections[1].h2Text);
});
test("writer DOCX can include ten images while the standalone six-image default is preserved", async () => {
  const a = articleModel(draft()),
    png =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZgmsAAAAASUVORK5CYII=",
    images = Object.fromEntries(
      Array.from({ length: 8 }, (_, i) => [`img${i}`, png]),
    );
  a.blocks.push(
    ...Object.keys(images).map((id) => ({
      id,
      kind: "image" as const,
      text: "",
      included: true,
      alt: "Example pixel",
    })),
  );
  const full = await articleDocx(a, defaults, { images, maxImages: 10 }),
    base = await articleDocx(a, defaults, { images });
  const zip = await JSZip.loadAsync(full.bytes);
  assert.equal(
    Object.keys(zip.files).filter((n) => n.startsWith("word/media/")).length,
    8,
  );
  assert.equal(full.warnings.length, 0);
  assert.equal(base.warnings.length, 2);
});
