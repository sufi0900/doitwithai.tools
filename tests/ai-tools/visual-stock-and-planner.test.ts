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

test("V3 regression: Neil Patel GEO vs AEO anaphora resolution, leading-period fix, cross-domain logo reset, brand background lock, 3 concepts per section & Canva styleOverrides", async () => {
  const { extractWebsiteBrand } = await import(
    "../../lib/blog-infographic-studio/brand-source"
  );
  const { parseHTML } = await import("linkedom");
  const { searchIconCatalog, ICON_CATALOG } = await import(
    "../../lib/visual-stock/icon-database"
  );
  const { importInfographicProject } = await import(
    "../../lib/blog-infographic-studio/project"
  );

  // 1. 56-icon searchable catalog
  assert.equal(ICON_CATALOG.length, 56);
  assert.ok(searchIconCatalog("aeo").some((e) => e.id === "answer"));
  assert.ok(searchIconCatalog("schema").some((e) => e.id === "code" || e.id === "braces"));

  // 2. Brand color detection for Neil Patel (#F26322) and DoItWithAI (#4A6CF7)
  const npDoc = parseHTML(
    "<html><head><title>GEO vs AEO - Neil Patel</title></head><body></body></html>",
  ).document;
  const npHint = extractWebsiteBrand(
    npDoc,
    "neilpatel.com",
    "https://neilpatel.com/blog/geo-vs-aeo/",
  );
  assert.equal(npHint.accent, "#F26322");

  const diwaiDoc = parseHTML(
    "<html><head><title>What Is AI SEO - DoItWithAI.tools</title></head><body></body></html>",
  ).document;
  const diwaiHint = extractWebsiteBrand(
    diwaiDoc,
    "doitwithai.tools",
    "https://doitwithai.tools/ai-seo/what-is-ai-seo",
  );
  assert.equal(diwaiHint.accent, "#4A6CF7");

  // 3. Simulate extracting neilpatel.com AFTER a previous doitwithai.tools session
  const previousDoItWithAiCard = {
    ...createPrismSample(),
    visualBrief: {
      sourceUrl: "https://doitwithai.tools/ai-seo/what-is-ai-seo",
      sectionId: "old-sec",
      relationship: "concepts" as const,
      sourceBlocks: [],
      excludedBlocks: 0,
      omittedPoints: 0,
      warnings: [],
    },
    signature: {
      name: "DoItWithAI.tools",
      visible: true,
      showLogo: true,
      placement: "footer" as const,
      align: "right" as const,
      padding: 12,
    },
    brand: {
      logoUrl: "https://doitwithai.tools/logo.png",
      logoDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      logoScale: 1,
      logoStyle: "plain" as const,
      illustration: "none" as const,
      customColors: {},
    },
  };

  const articleTitle = "GEO vs SEO vs AEO vs LLMO: What's The Difference?";
  const neilSections = [
    {
      id: "sec-mistakes",
      title: "Common Mistakes When Implementing These Strategies",
      level: 2 as const,
      role: "content" as const,
      blocks: [
        {
          id: "m-b1",
          kind: "paragraph" as const,
          heading: "Treating Them as Mutually Exclusive",
          headingLevel: 3 as const,
          text: "Treating them as mutually exclusive. You don't pick one optimization path and ignore the rest because organic rankings, direct answers, and AI citations reinforce each other.",
        },
        {
          id: "m-b2",
          kind: "paragraph" as const,
          heading: "Ignoring Brand Mentions Outside Your Website",
          headingLevel: 3 as const,
          text: "Ignoring brand mentions outside your website. This hurts GEO and LLMO the most. If nobody talks about your brand on Reddit, industry publications, or review sites, AI models have a weaker signal to work with.",
        },
      ],
    },
    {
      id: "sec-faqs",
      title: "FAQs",
      level: 2 as const,
      role: "content" as const,
      blocks: [
        {
          id: "f-b1",
          kind: "paragraph" as const,
          heading: "What is the difference between GEO and AEO?",
          headingLevel: 3 as const,
          text: "AEO structures concise direct answers for featured snippets and voice assistants, whereas GEO optimizes comprehensive authority and citations for generative AI responses.",
        },
        {
          id: "f-b2",
          kind: "paragraph" as const,
          heading: "Does traditional SEO still matter for LLMO?",
          headingLevel: 3 as const,
          text: "Yes. Strong technical SEO, clean site architecture, and authoritative backlinks remain the primary crawl foundation that AI retrieval systems trust.",
        },
      ],
    },
  ];

  const suite = buildAllArticleSectionVisuals(neilSections, {
    sourceUrl: "https://neilpatel.com/blog/geo-vs-aeo/",
    domain: "neilpatel.com",
    articleTitle,
    baseConfig: previousDoItWithAiCard,
    brandTheme: {
      ...npHint,
      siteName: "Neil Patel",
      logoDataUrl: undefined,
    },
    includeUniversalOverview: false,
  });

  assert.equal(suite.length, 2);
  const mistakesCard = suite[0];
  const faqCard = suite[1];

  // A. Anaphoric section heading & card title resolved with explicit subject
  assert.doesNotMatch(mistakesCard.headline, /these strategies/i);
  assert.match(mistakesCard.headline, /GEO, SEO, AEO & LLMO/i);
  assert.match(mistakesCard.headline, /Common Mistakes/i);
  assert.doesNotMatch(mistakesCard.nodes[0].title, /\bThem\b/);
  assert.match(mistakesCard.nodes[0].title, /GEO, SEO, AEO & LLMO/i);

  // B. Bare "FAQs" heading contextualized with subject
  assert.notEqual(faqCard.headline.trim(), "FAQs");
  assert.match(faqCard.headline, /GEO, SEO, AEO & LLMO/i);

  // C. Zero leading periods on card details
  for (const card of suite) {
    for (const node of card.nodes) {
      assert.doesNotMatch(node.detail, /^[.,;:!?\-–—]/);
    }
  }

  // D. Zero cross-website logo or signature leakage from previous DoItWithAI session
  assert.equal(mistakesCard.signature?.name, "Neil Patel");
  assert.equal(mistakesCard.brand?.logoDataUrl, undefined);
  assert.equal(mistakesCard.footerSourceLabel, "Source: neilpatel.com");

  // E. 2-card section is NEVER placed on a tall 9:16 layout with 45% bottom whitespace
  assert.notEqual(mistakesCard.aspectRatio, "9:16");

  // F. Each section has 3 distinct switchable infographic concepts with tailored layouts & copy
  assert.ok(Array.isArray(mistakesCard.conceptAlternatives));
  assert.equal(mistakesCard.conceptAlternatives!.length, 3);
  const conceptLayouts = new Set(
    mistakesCard.conceptAlternatives!.map((c) => c.prismLayout),
  );
  assert.ok(conceptLayouts.size >= 2);

  // G. Single vector scene in header (no duplicate stacked shields) & responsive callout banner
  const customCard = {
    ...mistakesCard,
    styleOverrides: {
      headlineScale: 1.05,
      cardTitleScale: 1.05,
      bodyScale: 1.0,
      cardPaddingY: 8,
      cardGap: 10,
      cardRadius: 26,
      accentBarWidth: 10,
      calloutStyle: "gold-pill" as const,
      footerBarStyle: "dark-dock" as const,
      brandBackgroundMode: "brand-vibrant" as const,
    },
    nodes: mistakesCard.nodes.map((n, idx) =>
      idx === 0
        ? {
            ...n,
            accentHex: "#F26322",
            customIconDataUrl:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          }
        : n,
    ),
  };
  const svg = generateBlogInfographicSvg(customCard);
  const sceneMatches = svg.match(/data-vector-scene="/g) || [];
  assert.ok(sceneMatches.length <= 1, "Must never render duplicate vector scenes");
  assert.doesNotMatch(svg, /\bStra\b/, "Callout text must never truncate mid-word");
  assert.ok(svg.includes('data-layer-id="headline"'));
  assert.ok(svg.includes('data-layer-id="node-0"'));

  // H. Project JSON round-trip preserves styleOverrides, customIconDataUrl, and accentHex
  const roundTripped = importInfographicProject(
    JSON.stringify({ version: 1, cards: [customCard] }),
  );
  assert.equal(
    roundTripped[0].styleOverrides?.brandBackgroundMode,
    "brand-vibrant",
  );
  assert.equal(roundTripped[0].styleOverrides?.calloutStyle, "gold-pill");
  assert.equal(roundTripped[0].nodes[0].accentHex, "#F26322");
  assert.ok(roundTripped[0].nodes[0].customIconDataUrl?.startsWith("data:image/png"));
});

test("regression: theseoagent.ai/blog/what-is-ai-seo filters video/pricing promos, preserves table acronyms (GEO/AI), extracts bold-headed paragraphs without H3s, and assigns diverse diagram archetypes", async () => {
  const { parseHTML } = await import("linkedom");
  const { extractArticleSource } = await import(
    "../../lib/blog-infographic-studio/article-source"
  );
  const { importInfographicProject } = await import(
    "../../lib/blog-infographic-studio/project"
  );

  const html = `<!doctype html><html><body><article>
    <h2>What is AI SEO?</h2>
    <p>AI SEO means two things. AI-driven SEO is using AI models such as ChatGPT, Claude or Gemini to do SEO work, from keyword clustering to drafts, titles and schema. SEO for AI search is getting your pages read and cited in answers from Google AI Overviews and AI Mode, ChatGPT search, Perplexity and Claude.</p>
    <h2>What an AI SEO agent actually does, one agent at a time</h2>
    <p>The ten agents inside The SEO Agent on one real site: five plan the keywords, five research, outline, draft, check the claims and save the article. And the two SEO jobs none of them does: indexing and links.</p>
    <h2>1. What is AI SEO? One name, two meanings.</h2>
    <table>
      <tr><th>Aspect</th><th>AI-driven SEO</th><th>SEO for AI search</th></tr>
      <tr><td>What it means</td><td>AI models and tools do SEO work: research, briefs, drafts, titles, schema, links.</td><td>Your pages get read, retrieved and cited when an AI engine answers a question.</td></tr>
      <tr><td>Also called</td><td>AI-driven SEO, AI-powered SEO, SEO with AI.</td><td>GEO, AEO, LLMO, AI search optimization.</td></tr>
      <tr><td>The AI involved</td><td>ChatGPT, Claude, Gemini and tools built on models like them.</td><td>AI Overviews, AI Mode, ChatGPT search, Perplexity, Claude, Copilot.</td></tr>
    </table>
    <h2>7. Getting started: six checks for this quarter.</h2>
    <p><strong>Confirm the base.</strong> In Search Console, check that the pages you want cited are indexed, carry no nosnippet rule, and have their main content in server-rendered HTML.</p>
    <p><strong>Decide AI crawler access one bot at a time.</strong> Allow the search crawlers you want to be cited by (OAI-SearchBot, Claude-SearchBot, PerplexityBot) and decide separately on training crawlers.</p>
    <p><strong>Turn on the AI reports.</strong> Open the generative AI performance report in Search Console and AI Performance in Bing Webmaster Tools to track citations.</p>
    <p><strong>Pick topics from measured data.</strong> Take queries from Search Console and volume from a keyword tool export, let an AI assistant cluster them, and verify every figure.</p>
    <h2>Common mistakes with AI SEO.</h2>
    <p><strong>Treating AI SEO as a replacement for SEO.</strong> Google says its AI features run on its core ranking systems and calls the work still SEO. Fix crawling, indexing and content first.</p>
    <p><strong>Paying for llms.txt files, chunking and AI schema.</strong> Google's guide lists each one as unnecessary for its AI features. Spend the money on pages worth citing.</p>
    <p><strong>Blocking every AI crawler with one copied rule.</strong> A rule meant to stop training often lists the search crawlers too, which takes the site out of ChatGPT search and Perplexity answers.</p>
    <h2>Answer-first, source-checked articles every day, for Google and the AI answers built on it.</h2>
    <p>The SEO Agent picks keywords from live search volume and difficulty, researches the pages that rank, puts the answer first, checks every claim against its sources, and publishes natively to WordPress, Webflow, Shopify, Wix, Ghost or Framer. Cancel in one click.</p>
    <p>US$1 for your first 3 articles, then US$99/month.</p>
  </article></body></html>`;

  const doc = parseHTML(html).document;
  const tree = extractArticleSource(
    doc,
    "What is AI SEO? The two meanings, and how it differs from traditional SEO.",
  );
  const contentSections = tree.sections.filter((s) => s.role === "content");

  // 1. Video promo teaser and bottom pricing CTA box are filtered out as promotional
  assert.ok(
    !contentSections.some((s) =>
      /What an AI SEO agent actually does/i.test(s.title),
    ),
  );
  assert.ok(
    !contentSections.some((s) =>
      /Answer-first, source-checked articles every day/i.test(s.title),
    ),
  );

  const suite = buildAllArticleSectionVisuals(tree.sections, {
    sourceUrl: "https://www.theseoagent.ai/blog/what-is-ai-seo",
    domain: "theseoagent.ai",
    articleTitle:
      "What is AI SEO? The two meanings, and how it differs from traditional SEO.",
    includeUniversalOverview: false,
  });

  // 2. Table cells preserve "GEO, AEO, LLMO" and "AI Overviews" (never "gEO" or "aI Overviews") and have no ".." double periods
  const tableSection = suite.find((c) =>
    c.nodes.some((n) => /Also Called/i.test(n.title)),
  );
  assert.ok(tableSection, "Table section must be generated");
  for (const node of tableSection!.nodes) {
    assert.doesNotMatch(node.detail, /\bgEO\b/);
    assert.doesNotMatch(node.detail, /\baI Overviews\b/);
    assert.doesNotMatch(node.detail, /\.\.$/);
  }

  // 3. Bold-headed paragraphs without H3s ("Confirm the base.", "Decide AI crawler access...") extract clean concept titles
  const checksSection = suite.find((c) => /Six Checks|Getting Started/i.test(c.headline));
  assert.ok(checksSection);
  assert.equal(checksSection!.nodes.length, 4);
  assert.match(checksSection!.nodes[0].title, /Confirm the Base/i);

  // 4. Every section receives a distinct infographic diagram type across the article
  const layouts = suite.map((c) => c.prismLayout);
  const uniqueLayouts = new Set(layouts);
  assert.ok(
    uniqueLayouts.size >= 3,
    `Expected diverse layouts across sections, got: ${layouts.join(", ")}`,
  );

  // 5. Custom uploaded scene illustration object renders <image data-layer-id="scene-illustration"> and survives round-trip
  const cardWithCustomScene = {
    ...suite[0],
    customSceneImageUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  };
  const svgWithCustomScene = generateBlogInfographicSvg(cardWithCustomScene);
  assert.ok(svgWithCustomScene.includes('data-layer-id="scene-illustration"'));
  const imported = importInfographicProject(
    JSON.stringify({ version: 1, cards: [cardWithCustomScene] }),
  );
  assert.ok(
    imported[0].customSceneImageUrl?.startsWith("data:image/png;base64,"),
  );
});



