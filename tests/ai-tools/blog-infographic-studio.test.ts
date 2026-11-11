import { autoRecommendInfographicTemplate } from "../../lib/blog-writer/deterministic-analyzers";
import { BLOG_INFOGRAPHIC_25_TEMPLATES } from "../../lib/blog-infographic-studio/templates";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRequire } from "node:module";
import HeroAnimatedInfographicShowcase from "../../features/blog-infographic-studio/HeroAnimatedInfographicShowcase";
import test from "node:test";
import assert from "node:assert/strict";
import { load } from "cheerio";
import {
  ASPECT_RATIO_DIMENSIONS,
  buildInfographicScene,
  createSampleInfographicConfig,
  generateBlogInfographicSvg,
  parseChartValue,
  renderBlogInfographicToCanvas,
} from "../../lib/blog-infographic-studio/canvas-renderer";
import {
  importInfographicProject,
  nodesFromText,
  patchInfographic,
  selectInfographicTemplate,
} from "../../lib/blog-infographic-studio/project";
import { DEFAULT_FLAGSHIP_BLOG_PROJECT } from "../../lib/blog-writer/canonical-state";
import {
  compileCleanCwvArticleHtml,
  compileWordPressGutenbergHtml,
  compileCompleteJsonLdGraph,
  compileHeadMetaTagsHtml,
} from "../../lib/blog-writer/technical-seo-compiler";

const logo =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==";

test("all 25 layouts render four valid formats with bounded geometry and escaped editable content", () => {
  const signatures = new Set<string>();
  for (let id = 1; id <= 25; id++)
    for (const ratio of Object.keys(
      ASPECT_RATIO_DIMENSIONS,
    ) as (keyof typeof ASPECT_RATIO_DIMENSIONS)[]) {
      const config = {
        ...createSampleInfographicConfig(id),
        aspectRatio: ratio,
        headline: 'Research <plan> & "publish"',
        nodes: Array.from({ length: 8 }, (_, i) => ({
          id: `n${i}`,
          badge: `${i + 1}`,
          title: `Point ${i + 1}: ${"Detailed explanation ".repeat(5)}`,
          detail: "Useful source details and practical advice. ".repeat(7),
          metricValue: `${(i + 1) * 10}%`,
        })),
      };
      const scene = buildInfographicScene(config);
      const $ = load(scene.svg, { xmlMode: true });
      assert.equal(
        $("svg").attr("width"),
        String(ASPECT_RATIO_DIMENSIONS[ratio].width),
      );
      assert.equal(
        $("svg").attr("height"),
        String(ASPECT_RATIO_DIMENSIONS[ratio].height),
      );
      assert.equal($("script,foreignObject").length, 0);
      assert.ok(scene.svg.includes("&lt;plan&gt;"));
      for (let i = 0; i < 8; i++)
        assert.ok(
          $("desc")
            .text()
            .includes(`Point ${i + 1}:`),
          `node ${i} omitted from ${id}/${ratio}`,
        );
      $("rect").each((_, el) => {
        for (const name of ["width", "height"])
          assert.ok(Number($(el).attr(name)) >= 0, `${id}/${ratio} ${name}`);
      });
      $("image").remove();
      assert.doesNotMatch($.xml(), /NaN|Infinity|undefined/);
      $("text[clip-path]").each((_, el) => {
        const id = $(el).attr("clip-path")!.slice(5, -1);
        assert.equal($(`clipPath[id="${id}"]`).length, 1);
      });
      assert.ok(
        scene.issues.length > 0,
        `Long text must be reported, ${id}/${ratio}`,
      );
      if (ratio === "4:5")
        signatures.add(
          generateBlogInfographicSvg(createSampleInfographicConfig(id)),
        );
    }
  assert.ok(signatures.size >= 20);
});

test("no portraits, invented rankings or percentage bars are produced from sample copy", () => {
  const c = createSampleInfographicConfig(13);
  c.nodes = c.nodes.map((n) => ({ ...n, metricValue: "No verified value" }));
  const { svg, issues } = buildInfographicScene(c);
  assert.doesNotMatch(svg, /portrait|male-avatars|98% Fit|100 CWV|Ranks #1/);
  assert.ok(issues.some((i) => i.field === "Values"));
  assert.equal(parseChartValue("98% Fit"), null);
  assert.equal(parseChartValue("42 pixels"), null);
  assert.deepEqual(parseChartValue("$1,200"), { value: 1200, unit: "$" });
  assert.deepEqual(parseChartValue("42%"), { value: 42, unit: "%" });
});

test("brand, wording and nodes survive template changes; derived export caches are invalidated", () => {
  const original = {
    ...createSampleInfographicConfig(),
    headline: "My own section",
    brand: {
      logoDataUrl: logo,
      customColors: { accent: "#FF0000" },
      illustration: "paper-steps" as const,
    },
    renderedSvgMarkup: "stale",
    renderedPngDataUrl: "stale",
  };
  const next = selectInfographicTemplate(original, 14);
  assert.equal(next.headline, original.headline);
  assert.deepEqual(next.nodes, original.nodes);
  assert.deepEqual(next.brand, original.brand);
  assert.equal(next.renderedSvgMarkup, undefined);
  assert.equal(next.renderedPngDataUrl, undefined);
  const svg = generateBlogInfographicSvg(next);
  assert.ok(svg.includes(logo));
  assert.ok(svg.includes("#FF0000"));
  assert.ok(svg.includes("data:image/png;base64,"));
  assert.equal(
    patchInfographic(original, { aspectRatio: "9:16" }).renderedSvgMarkup,
    undefined,
  );
});

test("project round trip preserves brand and text and rejects unsafe or invalid inputs", () => {
  const c = {
    ...createSampleInfographicConfig(),
    brand: {
      logoDataUrl: logo,
      logoScale: 1.2,
      logoStyle: "white" as const,
      illustration: "paper-steps" as const,
    },
  };
  const restored = importInfographicProject(
    JSON.stringify({ version: 1, cards: [c] }),
  )[0];
  assert.deepEqual(JSON.parse(JSON.stringify(restored.brand)), c.brand);
  assert.equal(restored.headline, c.headline);
  assert.equal(restored.nodes.length, c.nodes.length);
  for (const value of [
    "{}",
    "{",
    JSON.stringify({ version: 1, cards: [{ ...c, aspectRatio: "bad" }] }),
    JSON.stringify({
      version: 1,
      cards: [{ ...c, brand: { logoDataUrl: "javascript:alert(1)" } }],
    }),
  ])
    assert.throws(() => importInfographicProject(value));
  assert.throws(() =>
    importInfographicProject(
      JSON.stringify({ version: 1, cards: [{ ...c, paletteId: "toString" }] }),
    ),
  );
});

test("paragraph extraction retains the actual source and never substitutes sample statistics", () => {
  const source =
    "Check sources: Review the original study.\nMap pages: Match each question to a useful page.";
  const nodes = nodesFromText(source);
  assert.equal(nodes.length, 2);
  assert.equal(nodes[0].title, "Check sources");
  assert.equal(nodes[0].detail, "Review the original study.");
  assert.ok(nodes.every((n) => n.metricValue === ""));
  const many = nodesFromText(
    Array.from({ length: 10 }, (_, i) => `Sentence ${i + 1}.`).join(" "),
  );
  assert.equal(many.length, 8);
  assert.ok(many[7].detail.includes("Sentence 10."));
});

test("writer HTML and WordPress use selected dimensions and the ZIP file naming contract", () => {
  const project = structuredClone(DEFAULT_FLAGSHIP_BLOG_PROJECT),
    c = createSampleInfographicConfig(2);
  c.aspectRatio = "9:16";
  c.headline = "Latest version";
  c.renderedSvgMarkup = "<svg>STALE</svg>";
  project.sections[0].infographicConfig = c;
  for (const html of [
    compileCleanCwvArticleHtml(project),
    compileWordPressGutenbergHtml(project),
  ]) {
    assert.ok(html.includes('width="1080"'));
    assert.ok(html.includes('height="1920"'));
    assert.ok(html.includes("/visuals/section-1-infographic.svg"));
  }
  const schema = compileCompleteJsonLdGraph(project);
  const graph = JSON.parse(schema)["@graph"];
  assert.equal(
    graph.find((n: any) => n["@type"] === "BlogPosting").image[0].height,
    1920,
  );
  const head = compileHeadMetaTagsHtml(project);
  assert.ok(head.includes('og:image:height" content="1920"'));
  assert.ok(head.includes("/visuals/section-1-infographic.svg"));
  const inline = compileCleanCwvArticleHtml(project, {
    inlineSvgDataUri: true,
  });
  assert.ok(inline.includes(encodeURIComponent("Latest version")));
  assert.ok(!inline.includes("STALE"));
});

test("async canvas rasterization waits for SVG decoding and ignores a stale preview request", async () => {
  const OriginalImage = globalThis.Image;
  const pending: any[] = [];
  const draws: any[] = [];
  class FakeImage {
    onload?: () => void;
    onerror?: () => void;
    src = "";
    constructor() {
      pending.push(this);
    }
  }
  globalThis.Image = FakeImage as any;
  try {
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({ drawImage: (image: any) => draws.push(image) }),
    } as any;
    const first = renderBlogInfographicToCanvas(
      canvas,
      createSampleInfographicConfig(1),
    );
    const second = renderBlogInfographicToCanvas(canvas, {
      ...createSampleInfographicConfig(2),
      aspectRatio: "9:16",
    });
    assert.equal(draws.length, 0);
    pending[1].onload();
    await second;
    pending[0].onload();
    await first;
    assert.equal(draws.length, 1);
    assert.equal(draws[0], pending[1]);
    assert.equal(canvas.height, 1920);
  } finally {
    globalThis.Image = OriginalImage;
  }
});

test("server-rendered editor and hero expose real infographic previews without portrait controls", async () => {
  const nativeRequire = createRequire(import.meta.url);
  nativeRequire.extensions[".css"] = (module) => {
    module.exports = {};
  };
  const { default: BlogInfographicStudio } =
    await import("../../features/blog-infographic-studio/BlogInfographicStudio");
  const html = renderToStaticMarkup(
    React.createElement(BlogInfographicStudio, {
      mode: "embedded-modal",
      initialConfig: createSampleInfographicConfig(2),
    }),
  );
  const $ = load(html);
  assert.equal($('[aria-label="Editor controls"] button').length, 3);
  assert.equal($('button[role="tab"][tabindex="0"]').length, 1);
  assert.ok($("img").length >= 26);
  assert.doesNotMatch(
    html,
    /male-avatars|Marcus Vance|Daniel Mercer|Author \/ Executive|portraitFrame|Photo Zoom/,
  );
  const hero = renderToStaticMarkup(
    React.createElement(HeroAnimatedInfographicShowcase),
  );
  assert.ok(hero.includes("data:image/svg+xml"));
  assert.ok(hero.includes("Use this layout in the studio"));
  assert.doesNotMatch(hero, /male-avatars|executive portrait/);
});

test("writer recommendations resolve through the public infographic catalog", () => {
  const cases: [string, number][] = [
    ["Compare two tools", 6],
    ["How to publish", 1],
    ["Roadmap", 2],
    ["Pros and cons", 9],
    ["Cost breakdown", 14],
    ["Survey data", 11],
    ["Launch checklist", 20],
    ["Common myth", 23],
    ["Strategy hierarchy", 17],
    ["Overview", 21],
  ];
  for (const [heading, id] of cases) {
    const result = autoRecommendInfographicTemplate(heading);
    assert.equal(result.templateId, id);
    assert.equal(
      result.templateName,
      BLOG_INFOGRAPHIC_25_TEMPLATES[id - 1].name,
    );
  }
});
