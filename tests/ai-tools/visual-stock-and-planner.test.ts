import assert from "node:assert/strict";
import test from "node:test";
import {
  VECTOR_SCENE_CATALOG,
  getVectorSceneById,
  matchVectorSceneForTopic,
} from "../../lib/visual-stock/vector-scenes";
import {
  SHARED_VECTOR_STOCK_CATALOG,
  resolveSectionVisualStock,
  selectVerifiedStockAsset,
} from "../../lib/visual-stock/stock-resolver";
import {
  percentageValues,
  reviewCardPercentages,
} from "../../lib/blog-infographic-studio/percentage-review";
import { synthesizeInfographicHeadlineAndSubheadline } from "../../lib/blog-infographic-studio/skills/topic-intelligence";
import {
  buildAllArticleSectionVisuals,
  createPrismSample,
  sectionFromText,
} from "../../lib/blog-infographic-studio/visual-brief";
import { generateBlogInfographicSvg } from "../../lib/blog-infographic-studio/canvas-renderer";
import { renderPinterestPinPreviewSvg } from "../../lib/autonomous-agents/pin-svg-preview";
import { buildLinkedinCarouselHtmlDeck } from "../../lib/autonomous-agents/pinterest-carousel-exporter";
import { createDefaultAutonomousStudioState } from "../../lib/autonomous-agents/local-storage-store";

test("vector scene stock library provides 16 recolorable MIT/CC0 scenes without script or foreignObject tags", () => {
  assert.equal(VECTOR_SCENE_CATALOG.length, 16);
  for (const scene of VECTOR_SCENE_CATALOG) {
    const svg = scene.renderSvgNodes({
      primary: "#6366f1",
      secondary: "#10b981",
      surface: "#0f172a",
      ink: "#f8fafc",
      muted: "#94a3b8",
    });
    assert.ok(svg.includes(`data-scene="${scene.id}"`));
    assert.ok(svg.includes("#6366f1"));
    assert.doesNotMatch(svg, /<script|<foreignObject|undefined|NaN/i);
    assert.equal(getVectorSceneById(scene.id)?.id, scene.id);
  }

  const aiMatch = matchVectorSceneForTopic(
    "Answer engine optimization and AI search citations",
    "editorial",
    0,
  );
  assert.equal(aiMatch.id, "ai-search-intelligence");

  const compMatch = matchVectorSceneForTopic(
    "Traditional SEO vs AI Search comparison matrix",
    "comparison",
    1,
  );
  assert.equal(compMatch.id, "side-by-side-comparison-scale");
});

test("stock resolver enforces tenant scope, rights record, destination, and credit display rules", () => {
  const picked = selectVerifiedStockAsset(SHARED_VECTOR_STOCK_CATALOG, {
    tenant: "client-a",
    destination: "pinterest",
    topics: ["seo", "search", "citation"],
    canDisplayCredit: false,
  });
  assert.ok(picked);
  assert.equal(picked.vectorSceneId, "ai-search-intelligence");

  // Rejects another tenant's private asset and credit-required asset when canDisplayCredit=false
  const customCatalog = [
    {
      assetId: "tenant-b-private",
      origin: "https://client-b.com/hero.png",
      rightsRecord: "Client B Owned",
      approvedDestinations: ["blog" as const],
      ownerScope: "client-b",
      topics: ["seo", "search"],
      credit: "",
      kind: "client-media" as const,
    },
    {
      assetId: "photo-needs-credit",
      origin: "https://pexels.com/photo/1",
      rightsRecord: "Pexels License",
      approvedDestinations: ["blog" as const],
      ownerScope: "shared",
      topics: ["seo", "search"],
      credit: "Photo by Jane on Pexels",
      kind: "photo" as const,
    },
  ];
  assert.equal(
    selectVerifiedStockAsset(customCatalog, {
      tenant: "client-a",
      destination: "blog",
      topics: ["seo"],
      canDisplayCredit: false,
    }),
    null,
  );
  assert.equal(
    selectVerifiedStockAsset(customCatalog, {
      tenant: "client-a",
      destination: "blog",
      topics: ["seo"],
      canDisplayCredit: true,
    })?.assetId,
    "photo-needs-credit",
  );
});

test("percentage review blocks invented percentages and preserves source qualifiers", () => {
  assert.deepEqual(percentageValues("Traffic rose by up to 42% in Q4."), [
    { value: "42%", qualified: true },
  ]);
  const validQualified = reviewCardPercentages(
    " AI citations increased by up to 42%.",
    ["In our benchmark, AI citations increased by up to 42% across pages."],
  );
  assert.equal(validQualified.valid, true);

  const strippedQualifier = reviewCardPercentages(
    "AI citations increased by 42%.",
    ["In our benchmark, AI citations increased by up to 42% across pages."],
  );
  assert.equal(strippedQualifier.valid, false);

  const invented = reviewCardPercentages("Conversions jumped 85%.", [
    "Conversions improved steadily across tested landing pages.",
  ]);
  assert.equal(invented.valid, false);
});

test("definitional question headings are reframed into thesis headlines and multi-section articles get an executive overview", () => {
  const reframed = synthesizeInfographicHeadlineAndSubheadline(
    "What Is AI SEO?",
    "What Is AI SEO? Meaning, Examples & Practical Workflow",
  );
  assert.notEqual(reframed.headline, "What Is AI SEO?");
  assert.ok(reframed.headline.includes("AI SEO:"));

  const sections = [
    sectionFromText(
      "What Is Digital PR?",
      "Digital PR builds authority through original research and earned media.\nJournalists cite verifiable data studies and expert commentary.",
      "sec-1",
    ),
    sectionFromText(
      "How to Run a Data Study Campaign",
      "### Step 1: Collect Original Survey Data\nSurvey 500 practitioners to uncover benchmark trends.\n### Step 2: Package Visual Assets\nBuild standalone charts and infographics for editors.",
      "sec-2",
    ),
    sectionFromText(
      "Digital PR vs Traditional Link Building",
      "Traditional outreach relies on cold guest post pitches.\nDigital PR earns editorial citations from high-authority publications.",
      "sec-3",
    ),
  ];

  const visuals = buildAllArticleSectionVisuals(sections, {
    domain: "doitwithai.tools",
    includeUniversalOverview: true,
  });
  assert.ok(visuals.length >= 4);
  assert.equal(visuals[0].id, "article-executive-overview");

  const resolved = resolveSectionVisualStock({
    headline: visuals[0].headline,
    prismLayout: visuals[0].prismLayout,
  });
  const svg = generateBlogInfographicSvg({
    ...createPrismSample(),
    sceneIllustration: resolved.scene.id,
  });
  assert.ok(svg.includes(`data-vector-scene="${resolved.scene.id}"`));
});

test("Pinterest 2:3 Pins and LinkedIn 4:5 Carousel slides render distinct visual archetypes with embedded vector scenes", () => {
  const basePin = {
    id: "pin-test",
    hookArchetype: "curiosity-gap" as const,
    pinTitle: "AI SEO Playbook",
    pinDescription: "How to optimize for answer engines and citations.",
    overlayHeadline: "AI SEO Playbook 2026",
    overlaySubheadline: "Optimize for answer engines and generative search",
    altText: "AI SEO Playbook 2026",
    boardSuggestion: "AI SEO Strategy",
    aspectRatio: "2:3" as const,
    width: 1000 as const,
    height: 1500 as const,
    ctaBadgeText: "Read Full Guide",
    destinationUrl: "https://doitwithai.tools/ai-seo/what-is-ai-seo",
  };

  const pin1 = renderPinterestPinPreviewSvg({ ...basePin, pinVariantIndex: 1 });
  const pin2 = renderPinterestPinPreviewSvg({ ...basePin, pinVariantIndex: 2 });
  const pin3 = renderPinterestPinPreviewSvg({ ...basePin, pinVariantIndex: 3 });

  assert.ok(pin1.includes('data-pin-archetype="variant-1"'));
  assert.ok(pin2.includes('data-pin-archetype="variant-2"'));
  assert.ok(pin3.includes('data-pin-archetype="variant-3"'));
  assert.ok(pin1.includes("data-pin-scene="));
  assert.ok(pin2.includes("stroke-dasharray="));
  assert.ok(pin3.includes("✓"));

  const state = createDefaultAutonomousStudioState();
  const website = state.websites[0];
  const job = state.campaigns[0].jobs[0];
  const deckHtml = buildLinkedinCarouselHtmlDeck(job, website);
  assert.ok(deckHtml.includes('data-slide-archetype="magazine-cover"'));
  assert.ok(deckHtml.includes('data-slide-archetype="step-flow"'));
  assert.ok(deckHtml.includes('data-slide-archetype="spotlight-stack"'));
  assert.ok(deckHtml.includes('data-slide-archetype="vs-comparison"'));
  assert.ok(deckHtml.includes("data-vector-scene="));
});

test("regression: nested lists, tool directories, FAQs, sequential badges, callouts & brand logos are clean and standalone", async () => {
  const { parseHTML } = await import("linkedom");
  const { extractArticleSource } = await import(
    "../../lib/blog-infographic-studio/article-source"
  );
  const { extractWebsiteBrand } = await import(
    "../../lib/blog-infographic-studio/brand-source"
  );

  const html = `<!doctype html>
  <html>
    <head>
      <link rel="apple-touch-icon" href="/images/logo-icon.png" />
    </head>
    <body>
      <header><a class="bg-indigo-600 text-white" href="/">Home</a></header>
      <article>
        <h2>AI SEO Tools and Resources for 2026</h2>
        <h3>Core AI Tools for AI SEO</h3>
        <ul>
          <li><strong>ChatGPT</strong><br/>A complete AI SEO assistant for research, content creation, and technical tasks.</li>
          <li><strong>Gemini</strong><br/>Strong for content generation, image creation, and alt text optimization.</li>
          <li><strong>Claude AI</strong><br/>Great for generating full-length, high-quality AI SEO articles with detailed prompts.</li>
          <li><strong>Perplexity AI</strong><br/>Best for real-time research and discovering AI SEO topics with citations.</li>
        </ul>
        <h3>Technical AI SEO Tool</h3>
        <ul>
          <li><strong>Adamigo A</strong><br/>It helps you:<ul><li>Check your robots.txt file</li><li>Detect blocked AI crawlers like GPTBot</li><li>Identify technical issues affecting AI visibility</li></ul></li>
        </ul>
        <h2>Frequently Asked Questions</h2>
        <h3>Does first-person writing prove experience?</h3>
        <p>No. Describe genuine work and evidence. Do not invent testing or success stories.</p>
        <h3>Does Google automatically penalize AI-written content?</h3>
        <p>AI use alone does not establish a violation. Content must meet Search requirements and policies, including rules about scaled content abuse.</p>
      </article>
    </body>
  </html>`;

  const doc = parseHTML(html).document as unknown as Document;
  const brand = extractWebsiteBrand(doc, "doitwithai.tools", "https://doitwithai.tools/ai-seo/what-is-ai-seo");
  assert.equal(brand.accent, "#4F46E5");
  assert.equal(brand.logoUrl, "https://doitwithai.tools/images/logo-icon.png");

  const extracted = extractArticleSource(doc, "What Is AI SEO?");
  const suite = buildAllArticleSectionVisuals(extracted.sections, {
    domain: "doitwithai.tools",
    brandTheme: brand,
  });

  const toolsCard = suite.find((c) => /tools and resources/i.test(c.headline));
  assert.ok(toolsCard);
  assert.equal(toolsCard.nodes[0].badge, "01");
  assert.equal(toolsCard.nodes[1].badge, "02");
  // Category rollup names multiple real tools rather than one random bullet
  assert.match(toolsCard.nodes[0].detail, /ChatGPT.*Gemini.*Claude AI/i);
  // Nested list items have clean separators, zero glued words like "fileDetect"
  assert.doesNotMatch(toolsCard.nodes[1].detail, /fileDetect|GPTBotIdentify/);

  const faqCard = suite.find((c) => /frequently asked/i.test(c.headline));
  assert.ok(faqCard);
  assert.equal(faqCard.nodes[0].badge, "Q1");
  assert.equal(faqCard.nodes[1].badge, "Q2");
  // FAQ polarity "No — ..." and second sentence are preserved
  assert.match(faqCard.nodes[0].detail, /^No\s+—/i);
  assert.match(faqCard.nodes[0].detail, /genuine work and evidence/i);
  assert.match(faqCard.nodes[1].detail, /scaled content abuse/i);

  // Callout bar never duplicates subheadline verbatim or joins card titles with middots
  for (const card of suite) {
    if (card.calloutText) {
      assert.notEqual(
        card.calloutText.trim().toLowerCase(),
        card.subheadline.trim().toLowerCase(),
      );
      assert.doesNotMatch(card.calloutText, /\s·\s.*\s·\s/);
    }
  }
});

