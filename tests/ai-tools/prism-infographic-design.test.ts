import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { parseHTML } from "linkedom";
import { load } from "cheerio";
import { extractArticleSource } from "../../lib/blog-infographic-studio/article-source";
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
  infographicColors,
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
import {
  decontextualizeProse,
  hasTitleBodyDuplication,
  hasTrailingCliffhanger,
  scoreHeadlineHighlightPhrases,
} from "../../lib/content-intelligence/url-to-standalone-visual";

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

test("6-Layer Agentic Infographic Pipeline resolves all live screenshot defects (anti-duplication, zero cliffhangers, FAQ preservation, semantic highlight & 48 distinct icons)", () => {
  // 1. 2-Tone headline highlights never pick stop-word tails like "a section"
  assert.deepEqual(
    scoreHeadlineHighlightPhrases("Prompt to diagnose and revise a section"),
    ["diagnose and revise"],
  );
  assert.ok(
    !scoreHeadlineHighlightPhrases("A five-step ChatGPT editing workflow")
      .join(" ")
      .toLowerCase()
      .startsWith("a "),
  );

  // 2. De-contextualization scrubs "prompt above" while keeping quantitative "below 20 words" intact
  assert.doesNotMatch(
    decontextualizeProse(
      "Use the revised prompt above to avoid rigid sentence-length rules.",
    ),
    /prompt above/i,
  );
  assert.match(
    decontextualizeProse("Should every sentence be below 20 words?"),
    /below 20 words/i,
  );

  // 3. Screenshot 1, Screenshot 2 & Screenshot 3 end-to-end suite generation
  const sections = [
    sectionFromText(
      "Prompt to diagnose and revise a section",
      [
        "Use the revised prompt above to avoid rigid sentence-length rules.",
        "Provide context and important constraints with the section being edited.",
        "Compare the revision with the original before publishing.",
      ].join("\n"),
      "sec-prompt",
    ),
    sectionFromText(
      "A five-step ChatGPT editing workflow",
      [
        "Start with one coherent section, including nearby context.",
        "Identify unclear references, dense sentences, missing definitions, and weak transitions.",
        "Request a revision that preserves the meaning and the required details.",
        "Check facts, uncertainty, conditions, and who performs each action.",
        "Preview the section in the page layout and test whether a reader can complete the intended task.",
        "You remain responsible for checking the result.",
      ].join("\n"),
      "sec-workflow",
    ),
    sectionFromText(
      "Frequently Asked Questions",
      [
        "### What is a good readability score?",
        "No single score guarantees comprehension or rankings.",
        "### Are Flesch Reading Ease and Flesch-Kincaid Grade Level the same?",
        "Higher Reading Ease scores generally indicate easier text, while Grade Level estimates US school grade complexity.",
        "### Should every sentence be under 20 words?",
        "Split dense sentences when useful, but preserve natural flow and necessary relationships between ideas.",
        "### Can ChatGPT preserve all facts during rewriting?",
        "Compare the revision with the original and verify important statements.",
        "### Does readability guarantee better SEO?",
        "A score alone does not establish rankings, traffic, or conversion outcomes.",
        "### How often should teams audit readability?",
        "Review key landing and guide pages during initial drafting and quarterly content refreshes.",
      ].join("\n"),
      "sec-faq",
    ),
  ];

  const suite = buildAllArticleSectionVisuals(sections, {
    sourceUrl: "https://doitwithai.tools/guides/chatgpt-editing-workflow",
    domain: "doitwithai.tools",
  });
  assert.equal(suite.length, 3);

  // Verify Section 1 (Screenshot 1): no "a section", no "prompt above", 3 distinct icons, callout anchored
  const s1 = suite[0];
  assert.equal(s1.highlightWords, "diagnose and revise");
  assert.ok(Boolean(s1.calloutText && s1.calloutText.length > 0));
  for (const node of s1.nodes) {
    assert.doesNotMatch(`${node.title} ${node.detail}`, /prompt above/i);
    assert.equal(hasTitleBodyDuplication(node.title, node.detail), false);
    assert.equal(hasTrailingCliffhanger(node.title), false);
  }
  const s1Scene = buildInfographicScene(s1);
  assert.deepEqual(s1Scene.issues, []);
  const $s1 = load(s1Scene.svg, { xmlMode: true });
  const s1Icons = $s1("[data-semantic-icon]")
    .map((_, el) => $s1(el).attr("data-semantic-icon"))
    .get();
  assert.equal(new Set(s1Icons).size, 3);

  // Verify Section 2 (Screenshot 2): zero cliffhangers ("including", "missing", "preserves", "checking"),
  // zero title-body duplication, 6 distinct semantic icons, clean SVG fit
  const s2 = suite[1];
  assert.equal(s2.nodes.length, 6);
  for (const node of s2.nodes) {
    assert.doesNotMatch(
      node.title,
      /(?:including|missing|preserves|checking|that)$/i,
      `Dangling title detected: "${node.title}"`,
    );
    assert.equal(
      hasTrailingCliffhanger(node.title),
      false,
      `Cliffhanger title: "${node.title}"`,
    );
    assert.equal(
      hasTitleBodyDuplication(node.title, node.detail),
      false,
      `Duplicated title/detail: "${node.title}" :: "${node.detail}"`,
    );
  }
  assert.equal(
    new Set(s2.nodes.map((n) => n.icon)).size,
    6,
    "Every step node must have a distinct semantic icon assigned",
  );
  const s2Scene = buildInfographicScene(s2);
  assert.deepEqual(s2Scene.issues, []);
  const s2RibbonScene = buildInfographicScene({
    ...s2,
    prismLayout: "ribbon",
    aspectRatio: "9:16",
  });
  assert.deepEqual(s2RibbonScene.issues, []);
  const $s2 = load(s2RibbonScene.svg, { xmlMode: true });
  const s2Icons = $s2("[data-semantic-icon]")
    .map((_, el) => $s2(el).attr("data-semantic-icon"))
    .get();
  assert.equal(new Set(s2Icons).size, 6);

  // Verify Section 3 (Screenshot 3): FAQ keeps "What is a good readability score?", Q1..Q6 badges, 6 distinct icons
  const s3 = suite[2];
  assert.equal(s3.nodes.length, 6);
  assert.equal(s3.nodes[0].title, "What is a good readability score?");
  assert.equal(s3.nodes[0].badge, "Q1");
  assert.equal(s3.nodes[5].badge, "Q6");
  assert.match(s3.eyebrowLabel || "", /FAQ/i);
  const s3Scene = buildInfographicScene(s3);
  assert.deepEqual(s3Scene.issues, []);
  const $s3 = load(s3Scene.svg, { xmlMode: true });
  const s3Icons = $s3("[data-semantic-icon]")
    .map((_, el) => $s3(el).attr("data-semantic-icon"))
    .get();
  assert.equal(new Set(s3Icons).size, 6);
});

test("real flagship article 'what-is-ai-seo' skips author-note/final-thoughts, compresses H3s, diversifies palettes, and renders valid multi-archetype SVGs", () => {
  const snapPath = path.join(
    process.cwd(),
    "features",
    "articles",
    "legacy",
    "sanitySnapshot.json",
  );
  const snap = JSON.parse(fs.readFileSync(snapPath, "utf8"));
  const doc = snap["seo:what-is-ai-seo"];
  assert.ok(doc && Array.isArray(doc.content));

  let html = "<article>";
  for (const b of doc.content) {
    if (b._type === "block") {
      const text = (b.children || [])
        .map((c: { text?: string }) => c.text || "")
        .join("");
      if (!text.trim()) continue;
      if (b.listItem) html += `<li>${text}</li>`;
      else if (/^h[234]$/.test(b.style)) html += `<${b.style}>${text}</${b.style}>`;
      else html += `<p>${text}</p>`;
    }
  }
  if (Array.isArray(doc.faqs) && doc.faqs.length) {
    html += "<h2>Frequently Asked Questions</h2>";
    for (const f of doc.faqs) {
      html += `<h3>${f.question}</h3><p>${f.answer}</p>`;
    }
  }
  html += "</article>";

  const dom = parseHTML(html).document as unknown as Document;
  const extracted = extractArticleSource(
    dom,
    doc.title || "What Is AI SEO?",
  );

  // Author note & narrative wrap-up must be excluded from substantive content
  const noteSec = extracted.sections.find((s) =>
    /note before we begin/i.test(s.title),
  );
  assert.ok(noteSec, "Expected 'A Note Before We Begin' to exist in raw DOM");
  assert.notEqual(noteSec.role, "content");
  assert.equal(noteSec.archetype, "skip");

  const finalSec = extracted.sections.find((s) =>
    /final thoughts/i.test(s.title),
  );
  assert.ok(finalSec, "Expected 'Final Thoughts' to exist in raw DOM");
  assert.notEqual(finalSec.role, "content");
  assert.equal(finalSec.archetype, "skip");

  const suite = buildAllArticleSectionVisuals(extracted.sections, {
    sourceUrl: "https://doitwithai.tools/ai-seo/what-is-ai-seo",
    domain: "doitwithai.tools",
    brandTheme: {
      accent: "#4A6CF7",
      secondaryAccent: "#10B981",
      siteName: "Do It With AI Tools",
      source: "theme-color",
    },
  });

  assert.ok(
    suite.length >= 8,
    `Expected >= 8 substantive infographics, got ${suite.length}`,
  );
  assert.ok(
    !suite.some((c) => /note before|final thoughts/i.test(c.headline)),
    "Skipped sections must not appear in the generated infographic suite",
  );

  // Palette and background diversity (never all identical white backgrounds)
  const paletteIds = new Set(suite.map((c) => c.paletteId));
  assert.ok(
    paletteIds.size >= 5,
    `Expected >= 5 distinct palettes across suite, got ${paletteIds.size}: ${[...paletteIds].join(", ")}`,
  );
  const bgColors = new Set(suite.map((c) => infographicColors(c).bg));
  assert.ok(
    bgColors.size >= 5,
    `Expected >= 5 distinct background colors across suite, got ${bgColors.size}`,
  );

  // Zero verbatim conversational H3 parentheticals or rhetorical fragments
  for (const card of suite) {
    for (const node of card.nodes) {
      assert.doesNotMatch(
        node.title,
        /\(And Why Most People Only Know One\)|\(Simple Definition\)/i,
        `Conversational H3 leaked verbatim: "${node.title}"`,
      );
      assert.doesNotMatch(
        node.detail,
        /^You decide whether to use AI tools\.?$/i,
        `Rhetorical fragment selected for detail in "${node.title}"`,
      );
    }

    const scene = buildInfographicScene(card);
    assert.deepEqual(
      scene.issues,
      [],
      `SVG fit/contrast/copy issues on "${card.headline}" (${card.prismLayout}/${card.paletteId}): ${JSON.stringify(scene.issues)}`,
    );
    const $ = load(scene.svg, { xmlMode: true });
    assert.equal(
      $("[data-semantic-icon]").length >= card.nodes.length,
      true,
      `Every node in "${card.headline}" (${card.prismLayout}) should render a semantic icon`,
    );
  }
});

test("article graphics preserve nested technical subjects and source sentence boundaries", async () => {
  const { extractArticleSource } = await import(
    "../../lib/blog-infographic-studio/article-source"
  );
  const { document } = parseHTML(`<main><article><h2>Search visibility signals</h2>
    <h3>Technical checks</h3><h4>Page speed</h4>
    <p>Measure load time on the published page.<br>Repeat the measurement after changes.</p>
    <h4>Backlink sources</h4><p>Inspect referring domains for relevant links to the published page.</p>
    <h2>Final Thoughts: Search visibility</h2><p>Review the full guide for additional context.</p></article></main>`);
  const { sections } = extractArticleSource(
    document as unknown as Document,
    "Search visibility",
  );
  const [visual, ...rest] = buildAllArticleSectionVisuals(sections);
  assert.equal(rest.length, 0);
  assert.deepEqual(
    visual.nodes.map((n) => n.title),
    ["Page speed", "Backlink sources"],
  );
  assert.match(
    sections[0].blocks.find((b) => b.kind === "paragraph")!.text,
    /page\. Repeat/,
  );
  for (const node of visual.nodes) {
    assert.ok(
      sections[0].blocks.some(
        (b) => node.sourceBlockIds?.includes(b.id) && b.text.includes(node.detail),
      ),
    );
  }
});
