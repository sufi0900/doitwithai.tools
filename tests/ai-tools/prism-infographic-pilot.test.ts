import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseHTML } from "linkedom";
import { load } from "cheerio";
import { extractArticleSource } from "../../lib/blog-infographic-studio/article-source";
import {
  buildSectionVisual,
  createPrismSample,
  PRISM_LAYOUTS,
  sectionFromText,
  visualFromWriterSection,
  withPrismLayout,
} from "../../lib/blog-infographic-studio/visual-brief";
import {
  buildInfographicScene,
  generateBlogInfographicSvg,
} from "../../lib/blog-infographic-studio/canvas-renderer";
import {
  importInfographicProject,
  patchInfographic,
  selectInfographicTemplate,
} from "../../lib/blog-infographic-studio/project";
import { DEFAULT_FLAGSHIP_BLOG_PROJECT } from "../../lib/blog-writer/canonical-state";
import { compileCleanCwvArticleHtml } from "../../lib/blog-writer/technical-seo-compiler";

const fixture = readFileSync(
  new URL("../fixtures/ai-seo-framework-section.html", import.meta.url),
  "utf8",
);
const extract = (html = fixture) =>
  extractArticleSource(
    parseHTML(html).document as unknown as Document,
    "What Is AI SEO?",
  );

test("article extraction preserves nested H3 bodies, lists and table cells and skips site chrome", () => {
  const result = extract();
  assert.equal(result.coverage.truncated, false);
  assert.equal(result.sections.length, 3);
  const framework = result.sections.find(
    (s) => s.id === result.recommendedSectionId,
  )!;
  assert.match(framework.title, /Framework/);
  assert.ok(
    framework.blocks.some(
      (b) => b.heading?.startsWith("What Is GEO") && b.kind === "paragraph",
    ),
  );
  assert.equal(result.sections[0].role, "introduction");
  assert.ok(!JSON.stringify(result.sections).includes("newsletter"));
  assert.match(
    result.sections[2].blocks.find((b) => b.kind === "table")!.text,
    /Year \| Topic\n2026 \| Example only/,
  );
});

test("selected section creates three supported concepts, never the author's introduction or a year-as-KPI", () => {
  const source = extract(),
    section = source.sections.find(
      (s) => s.id === source.recommendedSectionId,
    )!;
  const { nodes, brief } = buildSectionVisual(
    section,
    "https://doitwithai.tools/ai-seo/what-is-ai-seo",
  );
  assert.equal(nodes.length, 3);
  assert.deepEqual(
    nodes.map((n) => n.badge),
    ["AEO", "GEO", "AI"],
  );
  assert.ok(
    nodes.every(
      (n) =>
        n.detail.length > 30 && n.detail !== n.title && n.metricValue === "",
    ),
  );
  assert.ok(
    nodes.every((n) =>
      n.sourceBlockIds!.every((id) => section.blocks.some((b) => b.id === id)),
    ),
  );
  assert.doesNotMatch(
    JSON.stringify(nodes),
    /Sufian|founder|2026|98%|Verified/,
  );
  assert.equal(brief.relationship, "concepts");
});

test("traversal reaches later nested paragraphs, exposes limits, and never fabricates from headings", () => {
  const html = `<article><h2>Steps in a workflow</h2>${Array.from({ length: 45 }, (_, i) => `<div><p>Step ${i + 1}: Complete a distinct, useful action and check the source before moving on.</p></div>`).join("")}</article>`;
  const result = extract(html);
  assert.equal(result.sections[0].blocks.length, 45);
  const brief = buildSectionVisual(result.sections[0]);
  assert.equal(brief.nodes.length, 6);
  assert.equal(brief.brief.omittedPoints, 39);
  assert.match(brief.brief.warnings.join(" "), /39 additional/);
  assert.equal(
    buildSectionVisual(
      sectionFromText("A heading", "### Heading only\n### Another heading"),
    ).nodes.length,
    0,
  );
  const large = extract(
    `<article><h2>Large source</h2>${Array.from({ length: 100 }, (_, i) => `<p>${i} ${"Complete explanatory text. ".repeat(70)}</p>`).join("")}</article>`,
  );
  assert.equal(large.coverage.truncated, true);
  assert.ok(large.coverage.blocksFound > large.coverage.blocksIncluded);
});

test("three AntV compositions render the real source with complete text, semantic icons and exact portrait dimensions", () => {
  const source = extract(),
    section = source.sections.find(
      (s) => s.id === source.recommendedSectionId,
    )!;
  const { nodes } = buildSectionVisual(section);
  const structures = new Set<string>();
  for (const layout of PRISM_LAYOUTS) {
    const config = {
      ...withPrismLayout(createPrismSample(), layout.id),
      headline: section.title,
      subheadline: "",
      nodes,
    };
    const scene = buildInfographicScene(config),
      $ = load(scene.svg, { xmlMode: true });
    assert.deepEqual(scene.issues, []);
    assert.equal($("svg").attr("width"), "1080");
    assert.equal($("svg").attr("height"), "1350");
    assert.equal(
      $("[data-visual-engine]").attr("data-visual-engine"),
      "prism-antv",
    );
    assert.ok($("[data-semantic-icon=answer]").length >= 1);
    assert.ok($("[data-semantic-icon=evidence]").length >= 1);
    assert.ok($("[data-semantic-icon=workflow]").length >= 1);
    for (const n of nodes) assert.ok($("text").text().includes(n.detail));
    assert.equal($("foreignObject,script").length, 0);
    assert.equal(generateBlogInfographicSvg(config), scene.svg);
    structures.add(scene.svg);
  }
  assert.equal(structures.size, PRISM_LAYOUTS.length);
});

test("text overflow, incomplete points and low contrast block exports with actionable messages", () => {
  const sample = createPrismSample();
  assert.throws(
    () =>
      generateBlogInfographicSvg({
        ...sample,
        nodes: sample.nodes.map((n) => ({
          ...n,
          detail: "Detailed source text that needs more space. ".repeat(30),
        })),
      }),
    /needs more space/,
  );
  assert.throws(
    () =>
      generateBlogInfographicSvg({
        ...sample,
        nodes: sample.nodes.map((n) => ({ ...n, detail: n.title })),
      }),
    /distinct title/,
  );
  assert.throws(
    () =>
      generateBlogInfographicSvg({
        ...sample,
        brand: {
          customColors: {
            textMain: "#FFFFFF",
            bgStart: "#FFFFFF",
            surface: "#FFFFFF",
          },
        },
      }),
    /contrast/,
  );
  const escaped = buildInfographicScene({
    ...sample,
    headline: 'A <script> & "quoted" heading',
  }).svg;
  assert.ok(!escaped.includes("<script>"));
  assert.ok(escaped.includes("&lt;script&gt;"));
});

test("project round-trip retains composition, cited source, icons and brand, then discards rendered caches", () => {
  const source = extract(),
    section = source.sections.find(
      (s) => s.id === source.recommendedSectionId,
    )!;
  const { nodes, brief } = buildSectionVisual(
    section,
    "https://doitwithai.tools/ai-seo/what-is-ai-seo",
  );
  const card = {
    ...createPrismSample(),
    nodes: nodes.map((n) => ({ ...n, icon: "evidence" as const })),
    visualBrief: brief,
    renderedSvgMarkup: "STALE",
    brand: { customColors: { accent: "#3452D1" } },
  };
  const [restored] = importInfographicProject(
    JSON.stringify({ version: 1, cards: [card] }),
  );
  assert.equal(restored.templateSlug, "prism-editorial");
  assert.equal(restored.nodes[0].icon, "evidence");
  assert.deepEqual(
    restored.nodes[0].sourceBlockIds,
    card.nodes[0].sourceBlockIds,
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(restored.visualBrief)),
    JSON.parse(JSON.stringify(brief)),
  );
  assert.equal(restored.brand?.customColors?.accent, "#3452D1");
  assert.equal(restored.renderedSvgMarkup, undefined);
  const [emptyDraft] = importInfographicProject(
    JSON.stringify({ version: 1, cards: [{ ...card, nodes: [] }] }),
  );
  assert.deepEqual(emptyDraft.nodes, []);
  assert.throws(
    () => generateBlogInfographicSvg(emptyDraft),
    /2–6 explained points/,
  );
  assert.equal(selectInfographicTemplate(restored, 2).visualEngine, undefined);
  assert.equal(
    patchInfographic(restored, { headline: "New heading" }).visualEngine,
    "prism-antv",
  );
  const unsafe = {
    ...card,
    visualBrief: { ...brief, sourceUrl: "javascript:alert(1)" },
  };
  assert.equal(
    importInfographicProject(JSON.stringify({ version: 1, cards: [unsafe] }))[0]
      .visualBrief?.sourceUrl,
    undefined,
  );
});

test("writer adapter uses section and H3 bodies directly; HTML compiles the same freshly edited graphic", () => {
  const section = structuredClone(DEFAULT_FLAGSHIP_BLOG_PROJECT.sections[0]);
  section.h2Text = "Search content framework";
  section.bodyMarkdown = "";
  section.subHeadings = [
    {
      id: "a",
      h3Text: "Answer engine optimization",
      keyPoints: [],
      bodyMarkdown:
        "Answer engine optimization focuses on giving readers clear answers to specific questions.",
    },
    {
      id: "b",
      h3Text: "Generative engine optimization",
      keyPoints: [],
      bodyMarkdown:
        "Generative engine optimization focuses on useful evidence that can inform generated answers.",
    },
  ];
  section.infographicConfig = visualFromWriterSection(section);
  assert.equal(section.infographicConfig.nodes.length, 2);
  assert.equal(section.infographicConfig.visualEngine, "prism-antv");
  section.infographicConfig = patchInfographic(section.infographicConfig, {
    headline: "Current edited graphic",
    renderedSvgMarkup: "STALE",
  });
  const project = {
    ...structuredClone(DEFAULT_FLAGSHIP_BLOG_PROJECT),
    sections: [section],
  };
  const html = compileCleanCwvArticleHtml(project, { inlineSvgDataUri: true });
  assert.ok(html.includes(encodeURIComponent("Current edited graphic")));
  assert.ok(!html.includes("STALE"));
  const empty = { ...section, bodyMarkdown: "", subHeadings: [] };
  assert.equal(visualFromWriterSection(empty).nodes.length, 0);
});
