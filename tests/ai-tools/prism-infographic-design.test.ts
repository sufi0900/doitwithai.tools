import test from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { load } from "cheerio";
import {
  PRISM_LAYOUTS,
  getInfographicDimensions,
} from "../../lib/blog-infographic-studio/layout-registry";
import { BLOG_INFOGRAPHIC_PALETTES } from "../../lib/blog-infographic-studio/palettes";
import {
  buildInfographicScene,
  generateBlogInfographicSvg,
  renderBlogInfographicToCanvas,
} from "../../lib/blog-infographic-studio/canvas-renderer";
import { createLayoutSample } from "../../lib/blog-infographic-studio/samples";
import {
  brandColors,
  normalizeDepth,
} from "../../lib/blog-infographic-studio/appearance";
import { extractWebsiteBrand } from "../../lib/blog-infographic-studio/brand-source";
import {
  importInfographicProject,
  patchInfographic,
} from "../../lib/blog-infographic-studio/project";
import {
  buildAllArticleSectionVisuals,
  sectionFromText,
  shuffleInfographicVisualVariation,
} from "../../lib/blog-infographic-studio/visual-brief";

test("six distinct compositions keep every sample explanation within a fixed canvas across all eight themes", () => {
  const dimensions = {
    editorial: [1080, 1350],
    constellation: [1080, 1920],
    ribbon: [1080, 1920],
    timeline: [1080, 1920],
    comparison: [1600, 900],
    checklist: [1080, 1920],
  };
  assert.equal(PRISM_LAYOUTS.length, 6);
  for (const layout of PRISM_LAYOUTS)
    for (const paletteId of Object.keys(
      BLOG_INFOGRAPHIC_PALETTES,
    ) as (keyof typeof BLOG_INFOGRAPHIC_PALETTES)[]) {
      const c = {
        ...createLayoutSample(layout.id),
        paletteId,
        aspectRatio: "1:1" as const,
        signature: { name: "DoItWithAI.tools", placement: "footer" as const },
      };
      const scene = buildInfographicScene(c),
        $ = load(scene.svg, { xmlMode: true });
      assert.deepEqual(
        scene.issues,
        [],
        `${layout.id}/${paletteId}: ${JSON.stringify(scene.issues)}`,
      );
      assert.equal($("svg").attr("width"), String(dimensions[layout.id][0]));
      assert.equal($("svg").attr("height"), String(dimensions[layout.id][1]));
      for (const node of c.nodes)
        assert.ok($("text").text().includes(node.detail));
      assert.equal($("foreignObject,script").length, 0);
      assert.doesNotMatch(scene.svg, /NaN|Infinity|undefined/);
      assert.equal(generateBlogInfographicSvg(c), scene.svg);
    }
});

test("shadow presets serialize native SVG filters with correct case, sufficient bounds and a true flat option", () => {
  for (const preset of ["flat", "soft", "raised", "layered"] as const) {
    const c = {
      ...createLayoutSample("ribbon"),
      depth: {
        preset,
        strength: 100,
        softness: 18,
        distance: 18,
        direction: "left" as const,
        opacity: 0.35,
      },
    };
    const $ = load(generateBlogInfographicSvg(c), { xmlMode: true });
    const filter = $("filter"),
      drop = $("feDropShadow");
    assert.equal(filter.attr("filterUnits"), "userSpaceOnUse");
    assert.equal(drop.attr("stdDeviation"), "18");
    assert.equal(drop.attr("dx"), "-18");
    assert.equal(drop.attr("flood-opacity"), "0.35");
    assert.equal($("text[filter]").length, 0);
    assert.equal(filter.attr("x"), "-80");
    assert.equal(filter.attr("height"), "2080");
    assert.equal(
      $(`[filter="url(#${filter.attr("id")})"]`).length > 0,
      preset !== "flat",
    );
    assert.equal($("[std-deviation],[filter-units]").length, 0);
  }
});

test("website signature stays separate from source attribution and survives imports, geometry normalization and edits", () => {
  const c = createLayoutSample("timeline");
  c.signature = {
    name: "YourSite.example",
    placement: "header",
    align: "left",
    padding: 20,
    visible: true,
    showLogo: false,
  };
  c.depth = { preset: "layered", strength: 80, direction: "right" };
  c.aspectRatio = "16:9";
  c.renderedSvgMarkup = "STALE";
  const [restored] = importInfographicProject(
    JSON.stringify({ version: 1, cards: [c] }),
  );
  assert.equal(restored.aspectRatio, "9:16");
  assert.equal(restored.signature?.name, c.signature.name);
  assert.equal(restored.depth?.preset, "layered");
  assert.equal(restored.renderedSvgMarkup, undefined);
  const $ = load(generateBlogInfographicSvg(restored), { xmlMode: true });
  assert.ok($("text").text().includes(c.signature.name));
  assert.ok($("text").text().includes(c.footerSourceLabel));
  const hidden = buildInfographicScene({
    ...restored,
    signature: { ...c.signature, visible: false },
  }).svg;
  assert.ok(
    !load(hidden, { xmlMode: true })("text").text().includes(c.signature.name),
  );
  assert.equal(
    patchInfographic(restored, { aspectRatio: "1:1" }).aspectRatio,
    "9:16",
  );
  assert.equal(
    normalizeDepth({
      preset: "raised",
      distance: Infinity,
      strength: -50,
      opacity: 5,
    }).opacity,
    0.35,
  );
});

test("brand hints prefer colored metadata, ignore neutral chrome, and fall back to bounded CSS variables", () => {
  const from = (html: string) =>
    extractWebsiteBrand(
      parseHTML(html).document as unknown as Document,
      "example.com",
    );
  assert.deepEqual(
    from(
      '<meta name="theme-color" content="#5271FF"><meta property="og:site_name" content="Example Studio">',
    ),
    { accent: "#5271FF", siteName: "Example Studio", source: "theme-color" },
  );
  assert.equal(
    from(
      '<meta name="theme-color" content="#fff"><style>:root{--brand-color:rgb(20, 120, 180)}</style>',
    ).accent,
    "#1478B4",
  );
  assert.deepEqual(from('<meta name="theme-color" content="#000000">'), {
    siteName: "example.com",
    source: "site-name",
  });
  assert.equal(
    from("<style>body{color:red} :root{--primary-color:#28a}</style>").accent,
    "#2288AA",
  );
  for (const accent of ["#FFFF00", "#0000FF", "#FFAAEE", "#005533"])
    for (const dark of [false, true]) {
      const c = createLayoutSample("ribbon");
      c.brand = { customColors: brandColors(accent, dark) };
      assert.deepEqual(
        buildInfographicScene(c).issues,
        [],
        `${accent}/${dark}`,
      );
    }
});

test("incomplete comparisons and overflowing content cannot download misleading or cropped artwork", () => {
  const c = createLayoutSample("comparison");
  assert.throws(
    () => generateBlogInfographicSvg({ ...c, nodes: c.nodes.slice(0, 3) }),
    /complete pairs/,
  );
  assert.throws(
    () =>
      generateBlogInfographicSvg({
        ...c,
        headline: "An excessively long headline. ".repeat(10),
      }),
    /fixed composition is full/,
  );
});

test("raster export uses the same fixed viewBox even when an older saved project carries a conflicting ratio", async () => {
  const OriginalImage = globalThis.Image;
  class DecodedImage {
    onload = () => {};
    onerror = () => {};
    set src(value: string) {
      assert.match(decodeURIComponent(value), /viewBox="0 0 1080 1920"/);
      queueMicrotask(() => this.onload());
    }
  }
  globalThis.Image = DecodedImage as any;
  try {
    let drew = false;
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({
        drawImage: () => {
          drew = true;
        },
      }),
    } as any;
    await renderBlogInfographicToCanvas(canvas, {
      ...createLayoutSample("timeline"),
      aspectRatio: "16:9",
    });
    assert.deepEqual([canvas.width, canvas.height], [1080, 1920]);
    assert.equal(drew, true);
  } finally {
    globalThis.Image = OriginalImage;
  }
});

test("multiple inline exports keep independent gradient and shadow definitions", () => {
  const a = buildInfographicScene(createLayoutSample("editorial")).svg;
  const b = buildInfographicScene(createLayoutSample("checklist")).svg;
  const $ = load(`<root>${a}${b}</root>`, { xmlMode: true });
  const ids = $("defs [id]")
    .map((_, node) => $(node).attr("id"))
    .get();
  assert.equal(new Set(ids).size, ids.length);
  $("svg").each((_, svg) => {
    const local = $(svg);
    local.find("[fill],[filter]").each((_, node) => {
      const reference = (
        $(node).attr("fill") ||
        $(node).attr("filter") ||
        ""
      ).match(/^url\(#(.+)\)$/)?.[1];
      if (reference) assert.equal(local.find(`[id="${reference}"]`).length, 1);
    });
  });
});

test("writer export adapter normalizes a saved project's stale ratios without changing its content or mutating the original", async () => {
  const { DEFAULT_FLAGSHIP_BLOG_PROJECT } =
    await import("../../lib/blog-writer/canonical-state");
  const {
    withFixedInfographicGeometry,
    compileCleanCwvArticleHtml,
    compileCompleteJsonLdGraph,
    compileHeadMetaTagsHtml,
  } = await import("../../lib/blog-infographic-studio/writer-export");
  const aliasedCompiler = await import(
    "@/lib/blog-writer/technical-seo-compiler"
  );
  assert.equal(
    aliasedCompiler.compileCleanCwvArticleHtml,
    compileCleanCwvArticleHtml,
  );
  const project = structuredClone(DEFAULT_FLAGSHIP_BLOG_PROJECT);
  project.sections = [project.sections[0]];
  const config = {
    ...createLayoutSample("timeline"),
    aspectRatio: "16:9" as const,
  };
  project.sections[0].infographicConfig = config;
  const normalized = withFixedInfographicGeometry(project);
  assert.equal(project.sections[0].infographicConfig.aspectRatio, "16:9");
  assert.equal(normalized.sections[0].infographicConfig.aspectRatio, "9:16");
  assert.deepEqual(
    normalized.sections[0].infographicConfig.nodes,
    config.nodes,
  );
  const html = compileCleanCwvArticleHtml(project, {
    includeFullHtmlDocumentShell: false,
    inlineSvgDataUri: true,
  });
  assert.ok(html.includes('width="1080"') && html.includes('height="1920"'));
  const graph = JSON.parse(
    compileCompleteJsonLdGraph(project, { asScriptTag: false }),
  )["@graph"];
  assert.equal(
    graph.find((n: any) => n["@type"] === "BlogPosting").image[0].height,
    1920,
  );
  assert.ok(
    compileHeadMetaTagsHtml(project).includes(
      'og:image:height" content="1920"',
    ),
  );
});

test("programmatic visual engine builds unique per-section infographics with procedural shaders, 2-tone highlights and editable layers", () => {
  const sections = [
    sectionFromText(
      "The AI SEO Framework: AEO, GEO and AI Workflows",
      "### Answer Engine Optimization\nAnswer engine optimization structures pages so direct questions are resolved in the first paragraph.\n### Generative Engine Optimization\nGenerative engine optimization supplies verifiable facts and citations that AI engines can reference.\n### AI-Assisted Workflows\nAI-assisted workflows accelerate research and schema validation while keeping human review in control.",
      "sec-1",
    ),
    sectionFromText(
      "Step-by-Step Implementation Process",
      "### Audit Search Intent\nMap each target query to the exact problem the reader wants solved before drafting.\n### Structure Direct Answers\nPlace a concise 50-word explanation immediately under every H2 question heading.\n### Validate Technical Schema\nAttach BlogPosting and FAQPage JSON-LD markup so search crawlers parse entities cleanly.",
      "sec-2",
    ),
    sectionFromText(
      "Pre-Publish Quality Checklist",
      "### Verify Primary Sources\nConfirm every statistic and benchmark links to its original study or primary dataset.\n### Check Mobile Readability\nInspect every diagram and comparison table on a narrow screen before publishing.",
      "sec-3",
    ),
  ];

  const suite = buildAllArticleSectionVisuals(sections, {
    sourceUrl: "https://doitwithai.tools/ai-seo/what-is-ai-seo",
    domain: "doitwithai.tools",
    brandTheme: {
      accent: "#4A6CF7",
      secondaryAccent: "#FBB040",
      isDark: true,
      siteName: "DoItWithAI.tools",
      source: "theme-color",
    },
  });

  assert.equal(suite.length, 3);
  // Consecutive sections receive distinct compositions and procedural background patterns
  assert.notEqual(suite[0].prismLayout, suite[1].prismLayout);
  assert.notEqual(suite[0].backgroundPattern, suite[1].backgroundPattern);
  assert.equal(suite[0].paletteId, "indigo-cyber");
  assert.equal(suite[0].slideCounter, "01 / 03");
  assert.ok(suite[0].eyebrowLabel?.includes("SECTION 01"));
  assert.ok(suite[0].highlightWords && suite[0].highlightWords.length > 0);

  // Add a bottom callout bar and verify SVG rendering + JSON round-trip persistence
  const customized = patchInfographic(suite[0], {
    calloutBadge: "FREE TOOL",
    calloutText: "Validate your schema with the JSON-LD Generator",
    backgroundPattern: "svg-waves",
    cardStyle: "playbook-contrast",
    fontFamily: "inter-jakarta",
  });
  const scene = buildInfographicScene(customized);
  assert.deepEqual(scene.issues, []);
  const $ = load(scene.svg, { xmlMode: true });
  assert.equal($("[data-bg-pattern]").attr("data-bg-pattern"), "svg-waves");
  assert.ok($("text").text().includes(customized.headline));
  assert.ok($("text").text().includes("FREE TOOL"));
  assert.ok($("text").text().includes("Validate your schema"));

  const [restored] = importInfographicProject(
    JSON.stringify({ version: 1, cards: [customized] }),
  );
  assert.equal(restored.backgroundPattern, "svg-waves");
  assert.equal(restored.cardStyle, "playbook-contrast");
  assert.equal(restored.fontFamily, "inter-jakarta");
  assert.equal(restored.calloutBadge, "FREE TOOL");
  assert.equal(
    restored.calloutText,
    "Validate your schema with the JSON-LD Generator",
  );

  const shuffled = shuffleInfographicVisualVariation(restored, 1);
  assert.notEqual(shuffled.backgroundPattern, restored.backgroundPattern);
});
