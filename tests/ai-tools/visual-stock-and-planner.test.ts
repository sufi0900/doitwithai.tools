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
import { renderPinterestPinPreviewSvg } from "../../_archive/cauthra-reference/lib/autonomous-agents/pin-svg-preview";
import { buildLinkedinCarouselHtmlDeck } from "../../_archive/cauthra-reference/lib/autonomous-agents/pinterest-carousel-exporter";
import { createDefaultAutonomousStudioState } from "../../_archive/cauthra-reference/lib/autonomous-agents/local-storage-store";

test("vector scene stock library provides 32 recolorable MIT/CC0 scenes without script or foreignObject tags", () => {
  assert.equal(VECTOR_SCENE_CATALOG.length, 32);
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

  // 1. 80-icon searchable catalog
  assert.equal(ICON_CATALOG.length, 80);
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

  // F. Each section has 4 distinct switchable infographic concepts with tailored layouts & copy
  assert.ok(Array.isArray(mistakesCard.conceptAlternatives));
  assert.equal(mistakesCard.conceptAlternatives!.length, 4);
  const conceptLayouts = new Set(
    mistakesCard.conceptAlternatives!.map((c) => c.prismLayout),
  );
  assert.equal(conceptLayouts.size, 4);

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

test("V4 stock & diagram expansion: 80 icons across 8 categories, 18 diagram archetypes with native geometry, external CSS + inline SVG brand detection across ALL sections, and 4 unique genre concepts", async () => {
  const { parseHTML } = await import("linkedom");
  const { extractWebsiteBrand } = await import(
    "../../lib/blog-infographic-studio/brand-source"
  );
  const {
    ICON_CATALOG,
    ICON_CATEGORIES,
    searchIconCatalog,
  } = await import("../../lib/visual-stock/icon-database");
  const {
    PRISM_LAYOUTS,
    PRISM_LAYOUT_CATEGORIES,
  } = await import("../../lib/blog-infographic-studio/layout-registry");
  const { createLayoutSample } = await import(
    "../../lib/blog-infographic-studio/samples"
  );
  const { buildInfographicScene } = await import(
    "../../lib/blog-infographic-studio/canvas-renderer"
  );
  const { importInfographicProject } = await import(
    "../../lib/blog-infographic-studio/project"
  );

  // 1. 80 commercial-safe semantic SVG icons across 8 categories
  assert.equal(ICON_CATALOG.length, 80);
  assert.equal(ICON_CATEGORIES.length, 8);
  for (const icon of ICON_CATALOG) {
    assert.ok(icon.svgPaths.length >= 1, `Missing svgPaths for ${icon.id}`);
    assert.ok(icon.svgPath.trim().length > 5, `Empty svgPath for ${icon.id}`);
    assert.doesNotMatch(icon.svgPath, /<script|foreignObject/i);
  }
  assert.ok(searchIconCatalog("pyramid").some((e) => e.id === "pyramid"));
  assert.ok(searchIconCatalog("donut").some((e) => e.id === "donut-chart"));
  assert.ok(searchIconCatalog("org").some((e) => e.id === "sitemap"));
  assert.ok(searchIconCatalog("flywheel").some((e) => e.id === "repeat"));

  // 2. 21 flagship layouts across 6 categories, each flagship chart/diagram archetype renders distinct native SVG geometry
  assert.equal(PRISM_LAYOUTS.length, 21);
  assert.equal(PRISM_LAYOUT_CATEGORIES.length, 6);

  const newLayoutAssertions: Array<{
    id: (typeof PRISM_LAYOUTS)[number]["id"];
    pattern: RegExp;
  }> = [
    { id: "stat-bars", pattern: /RANK #1/ },
    { id: "donut-breakdown", pattern: /stroke-dasharray="/ },
    { id: "pie-chart", pattern: /data-composition="pie-chart"[\s\S]*A \d+[\d.]* \d+[\d.]* 0 [01] 1/ },
    { id: "vertical-bars", pattern: /data-composition="vertical-bars"[\s\S]*<polyline\s+points="/ },
    { id: "winding-roadmap", pattern: /data-composition="winding-roadmap"[\s\S]*stroke-dasharray="12 10"/ },
    { id: "hierarchy-tree", pattern: /M\s+\d+[\d.]*\s+\d+[\d.]*\s+V\s+/ },
    { id: "pyramid-tiers", pattern: /<polygon\s+points="/ },
    { id: "cycle-wheel", pattern: /rotate\(45\)"><path d="M -6 -5 L 5 0 L -6 5"/ },
    { id: "before-after", pattern: /M 792 \d+[\d.]* H 806/ },
    { id: "zigzag-flowchart", pattern: /START FLOW/ },
    { id: "kpi-bento", pattern: /data-composition="kpi-bento"[\s\S]*M \d+[\d.]* \d+[\d.]* C / },
  ];

  for (const { id, pattern } of newLayoutAssertions) {
    const sample = createLayoutSample(id);
    const scene = buildInfographicScene(sample);
    assert.deepEqual(
      scene.issues,
      [],
      `Expected zero scene issues for ${id}, got ${JSON.stringify(scene.issues)}`,
    );
    assert.match(scene.svg, pattern, `Expected native geometry for ${id}`);
    assert.doesNotMatch(scene.svg, /<script|<foreignObject|NaN|Infinity|undefined/);

    // Survives JSON project round-trip cleanly
    const [restored] = importInfographicProject(
      JSON.stringify({ version: 1, cards: [sample] }),
    );
    assert.equal(restored.prismLayout, id);
  }

  // 3. External CSS + inline header SVG logo brand extraction
  const cssOnlyDoc = parseHTML(
    "<html><head><title>Brand Test</title></head><body><header><a href='/'>Home</a></header></body></html>",
  ).document as unknown as Document;
  const fromExternalCss = extractWebsiteBrand(
    cssOnlyDoc,
    "custombrand.example",
    "https://custombrand.example/blog/guide",
    ":root { --color-primary: #E11D48; --color-secondary: #0EA5E9; }",
  );
  assert.equal(fromExternalCss.accent, "#E11D48");
  assert.equal(fromExternalCss.secondaryAccent, "#0EA5E9");

  const svgLogoDoc = parseHTML(
    '<html><head><title>SVG Brand</title></head><body><header><a href="/"><svg viewBox="0 0 24 24"><path fill="#7C3AED" d="M0 0h24v24H0z"/></svg></a></header></body></html>',
  ).document as unknown as Document;
  const fromInlineSvg = extractWebsiteBrand(
    svgLogoDoc,
    "svgbrand.example",
    "https://svgbrand.example/",
  );
  assert.equal(fromInlineSvg.accent, "#7C3AED");

  // 4. Brand color propagation across ALL generated sections (not only idx === 0) + semantic routing across diverse diagrams
  const multiSections = [
    sectionFromText(
      "AI Search Impact Benchmarks and Key Metrics",
      "### Citation Share\nStructured answers lift citation visibility across generative results.\n### Crawl Efficiency\nClean HTML improves indexing speed for AI search crawlers.\n### Conversion Lift\nQualified answer-engine visitors convert faster on landing pages.\n### Authority Signals\nVerified primary sources earn stronger model trust.",
      "v4-sec-1",
    ),
    sectionFromText(
      "Content Authority Pyramid and Priority Tiers",
      "### Technical Crawlability\nEnsure fast server-rendered pages with zero broken links.\n### Structured Entities\nMap clear schema and entity definitions on core hubs.\n### Original Evidence\nPublish benchmark studies and verifiable primary data.\n### Editorial Authority\nEarn citations across trusted industry publications.",
      "v4-sec-2",
    ),
    sectionFromText(
      "Modern AI SEO System Architecture",
      "### Discovery Layer\nTrack conversational prompts and real buyer queries.\n### Production Layer\nCreate direct, evidence-backed modular content blocks.\n### Verification Layer\nAudit claims, citations, and crawler logs weekly.\n### Distribution Layer\nRepurpose key takeaways into standalone social visuals.",
      "v4-sec-3",
    ),
    sectionFromText(
      "Continuous Citation Optimization Flywheel",
      "### Audit Queries\nIdentify high-intent questions where AI engines summarize answers.\n### Upgrade Pages\nAdd concise definitions, tables, and structured takeaways.\n### Measure Citations\nMonitor brand mentions across Search Console and AI engines.\n### Compound Winners\nRefresh top-cited pages quarterly with fresh data.",
      "v4-sec-4",
    ),
    sectionFromText(
      "Before vs. After: Legacy SEO vs. AI Search Workflow",
      "### Keyword Stuffing\nRepeating exact-match phrases without answering buyer intent.\n### Direct Answer Blocks\nLeading every section with crisp, verified takeaways.\n### Unstructured Walls of Text\nLong narratives that crawlers struggle to summarize accurately.\n### Modular Visual Evidence\nScannable charts, tables, and standalone infographics.",
      "v4-sec-5",
    ),
    sectionFromText(
      "Step-by-Step AI Search Audit Workflow",
      "### Step 1: Verify Crawler Access\nAllow search crawlers in robots.txt and confirm 200 status codes.\n### Step 2: Check Server Rendering\nEnsure primary content renders cleanly without client-side delays.\n### Step 3: Add Structured Comparisons\nUse crisp tables and definitions for key concepts.\n### Step 4: Monitor AI Reports\nTrack citations in Search Console and Bing Webmaster Tools.",
      "v4-sec-6",
    ),
  ];

  const v4Suite = buildAllArticleSectionVisuals(multiSections, {
    sourceUrl: "https://custombrand.example/blog/ai-seo-playbook",
    domain: "custombrand.example",
    articleTitle: "Complete AI Search Optimization Playbook",
    brandTheme: fromExternalCss,
    includeUniversalOverview: false,
  });

  assert.equal(v4Suite.length, 6);
  // Every single section carries the extracted website brand accent (#E11D48) — NOT dropped after section 0!
  for (const [idx, card] of v4Suite.entries()) {
    assert.ok(
      card.brand?.customColors?.accent,
      `Section ${idx + 1} must retain extracted brand customColors`,
    );
    assert.equal(card.conceptAlternatives?.length, 4);
    assert.equal(
      new Set(card.conceptAlternatives!.map((c) => c.prismLayout)).size,
      4,
      `Section ${idx + 1} must expose 4 unique diagram layouts across concepts`,
    );
    const rendered = buildInfographicScene(card);
    assert.deepEqual(rendered.issues, [], `Section ${idx + 1} (${card.prismLayout}) rendered issues`);
  }

  // All 6 sections receive genuinely diverse diagram layouts (at least 5 distinct archetypes!)
  const routedLayouts = new Set(v4Suite.map((c) => c.prismLayout));
  assert.ok(
    routedLayouts.size >= 5,
    `Expected >= 5 distinct routed diagram archetypes across 6 sections, got: ${[...routedLayouts].join(", ")}`,
  );

  // 5. Direct-click Canva-style SVG hit layers (data-layer-id + data-layer-box) & clean studio markup
  const firstSvg = buildInfographicScene(v4Suite[0]).svg;
  assert.ok(firstSvg.includes('data-layer-box="headline"'));
  assert.ok(firstSvg.includes('data-layer-box="node-0"'));
  assert.ok(firstSvg.includes('data-layer-box="node-icon-0"'));
  assert.ok(firstSvg.includes('data-layer-box="footer"'));

  const { createRequire } = await import("node:module");
  const nativeRequire = createRequire(import.meta.url);
  nativeRequire.extensions[".css"] = (module) => {
    module.exports = {};
  };
  const React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { default: BlogInfographicStudio } = await import(
    "../../features/blog-infographic-studio/BlogInfographicStudio"
  );
  const studioHtml = renderToStaticMarkup(
    React.createElement(BlogInfographicStudio),
  );
  assert.doesNotMatch(
    studioHtml,
    /Edit Card 1 &amp; Icon|Direct canvas click-to-edit hotspots/,
    "Obstructing hover button overlays must be completely removed",
  );
  assert.ok(studioHtml.includes("Upload Image"));
  assert.match(studioHtml, /(?:Choose Icon|Icon: [a-z0-9-]+) \(80\)/);
});

test("V5 Overhaul: content-aware visual-fit stops forced templates, fixes <details>/<dl>/<button> FAQs, and guarantees zero overflow on 6-card Pyramid, Funnel, Pie, Vertical Bars & Winding Roadmap", async () => {
  const { parseHTML } = await import("linkedom");
  const { extractArticleSource } = await import(
    "../../lib/blog-infographic-studio/article-source"
  );
  const { buildInfographicScene } = await import(
    "../../lib/blog-infographic-studio/canvas-renderer"
  );
  const {
    getRecommendedLayoutsForConfig,
    shuffleInfographicVisualVariation,
    withPrismLayout,
  } = await import("../../lib/blog-infographic-studio/visual-brief");

  // 1. Exact FAQ DOM extraction (<details><summary>, <dl><dt><dd>, accordion <button>)
  const faqHtml = `
    <html><head><title>What is AI SEO?</title></head><body><main><article>
      <h1>What is AI SEO?</h1>
      <h2>Common questions about AI SEO.</h2>
      <details>
        <summary>Does Google require an llms.txt file?</summary>
        <p>Not for Google. Normal structured data and clean HTML still help describe a page accurately.</p>
      </details>
      <details>
        <summary>Will Google penalize pages written with AI?</summary>
        <p>Not for being AI-generated. Quality systems evaluate originality, clarity, and helpfulness regardless of tooling.</p>
      </details>
      <dl>
        <dt>How can you measure AI search visibility today?</dt>
        <dd>With three partial views. Combine Search Console trends, Bing Webmaster reports, and direct brand citation spot checks.</dd>
      </dl>
      <div>
        <button aria-expanded="false">Does traditional SEO still matter for AI citations?</button>
        <p>Yes. Technical crawlability, clean internal linking, and deep domain authority remain essential for retrieval.</p>
      </div>
    </article></main></body></html>
  `;

  const extracted = extractArticleSource(
    parseHTML(faqHtml).document as unknown as Document,
    "https://theseoagent.ai/blog/what-is-ai-seo",
  );
  const faqVisuals = buildAllArticleSectionVisuals(extracted.sections, {
    sourceUrl: "https://theseoagent.ai/blog/what-is-ai-seo",
    domain: "theseoagent.ai",
    articleTitle: "What is AI SEO?",
    includeUniversalOverview: false,
  });

  assert.equal(faqVisuals.length, 1);
  const faqCard = faqVisuals[0];

  // Headline strips decorative trailing period & never highlights stop-word "about"
  assert.ok(
    !faqCard.headline.endsWith("."),
    `Headline must not end with trailing period: ${faqCard.headline}`,
  );
  assert.ok(
    !(faqCard.highlightWords || "").toLowerCase().includes("about"),
    `Highlight must not target stop-word "about": ${faqCard.highlightWords}`,
  );

  // All 4 real FAQ questions stay in title & full 2-sentence answers stay in detail (NEVER truncated to "Not for Google.")
  assert.equal(faqCard.nodes.length, 4);
  assert.equal(faqCard.nodes[0].title, "Does Google require an llms.txt file?");
  assert.ok(
    faqCard.nodes[0].detail.includes("Not for Google.") &&
      faqCard.nodes[0].detail.includes("Normal structured data"),
    `FAQ 1 answer must remain complete: ${faqCard.nodes[0].detail}`,
  );
  assert.equal(faqCard.nodes[1].title, "Will Google penalize pages written with AI?");
  assert.ok(
    faqCard.nodes[1].detail.includes("Not for being AI-generated.") &&
      faqCard.nodes[1].detail.includes("Quality systems"),
    `FAQ 2 answer must remain complete: ${faqCard.nodes[1].detail}`,
  );
  assert.equal(faqCard.nodes[2].title, "How can you measure AI search visibility today?");
  assert.ok(
    faqCard.nodes[2].detail.includes("With three partial views.") &&
      faqCard.nodes[2].detail.includes("Search Console"),
    `FAQ 3 answer must remain complete: ${faqCard.nodes[2].detail}`,
  );
  assert.equal(faqCard.nodes[3].title, "Does traditional SEO still matter for AI citations?");

  // 2. Strict Visual-Fit Enforcement: FAQs NEVER receive Funnels, Pyramids, Pie Charts, Vertical Bars, or Roadmaps
  const forbiddenForFaq = new Set([
    "funnel-stages",
    "pyramid-tiers",
    "pie-chart",
    "vertical-bars",
    "winding-roadmap",
    "donut-breakdown",
    "cycle-wheel",
  ]);
  const faqFit = getRecommendedLayoutsForConfig(faqCard);
  assert.equal(faqFit.intent, "faq");
  assert.ok(
    !forbiddenForFaq.has(faqCard.prismLayout!),
    `FAQ section must never route to ${faqCard.prismLayout}`,
  );
  for (const concept of faqCard.conceptAlternatives || []) {
    assert.ok(
      !forbiddenForFaq.has(concept.prismLayout),
      `FAQ concept "${concept.label}" must never force incompatible layout ${concept.prismLayout}`,
    );
  }
  const shuffledFaq = shuffleInfographicVisualVariation(faqCard, 1);
  assert.ok(
    !forbiddenForFaq.has(shuffledFaq.prismLayout!),
    `Shuffling FAQ must stay strictly within compatible FAQ layouts, got ${shuffledFaq.prismLayout}`,
  );

  // 3. Content-Aware Routing: Data Share -> Pie/Bar Charts, Roadmap -> Winding Roadmap
  const targetedSections = [
    sectionFromText(
      "AI Search Citation Traffic Share Breakdown",
      "### Brand Documentation\nAccounts for 38% of verified AI citations across technical queries.\n### Benchmark Studies\nOriginal research drives 27% of high-authority synthesis links.\n### Comparison Guides\nStructured versus pages capture 21% of commercial buyer citations.\n### Glossary Definitions\nConcise entity pages contribute 14% of informational references.",
      "v5-data-share",
    ),
    sectionFromText(
      "Quarterly AI SEO Implementation Roadmap",
      "### Step 1: Audit Technical Crawlers\nConfirm robots.txt allows primary search and AI indexing bots.\n### Step 2: Structure Core Answer Blocks\nAdd direct 40-word summaries under every primary heading.\n### Step 3: Publish Original Benchmarks\nRelease verifiable data tables that models cite directly.\n### Step 4: Track Multi-Engine Citations\nMonitor visibility trends weekly across Google, Bing, and AI chats.",
      "v5-roadmap",
    ),
  ];
  const targetedSuite = buildAllArticleSectionVisuals(targetedSections, {
    articleTitle: "AI SEO Strategy Guide",
    includeUniversalOverview: false,
  });
  assert.equal(targetedSuite[0].prismLayout, "pie-chart");
  assert.equal(targetedSuite[1].prismLayout, "winding-roadmap");

  // 4. Dense 6-card zero-overflow verification on redesigned Split-Diagram Pyramid, Funnel, Pie, Vertical Bars & Winding Roadmap
  const denseIcons = [
    "search",
    "database",
    "target",
    "chart",
    "layers",
    "award",
  ] as const;
  const denseSixCard = {
    ...faqCard,
    headline: "Six-Stage AI Search Visibility Architecture",
    subheadline:
      "Every layer builds compounding search authority across traditional and generative engines.",
    nodes: Array.from({ length: 6 }, (_, i) => ({
      id: `dense-${i}`,
      badge: `0${i + 1}`,
      title: `Priority Layer ${i + 1}: Structured Retrieval Signal`,
      detail:
        "Ensure clean semantic HTML, explicit entity markup, and verifiable primary evidence so AI engines synthesize accurate citations cleanly.",
      metricValue: `${[32, 24, 18, 12, 8, 6][i]}%`,
      icon: denseIcons[i],
    })),
  };

  for (const layoutId of [
    "pyramid-tiers",
    "funnel-stages",
    "pie-chart",
    "vertical-bars",
    "winding-roadmap",
  ] as const) {
    const rendered = buildInfographicScene(withPrismLayout(denseSixCard, layoutId));
    assert.deepEqual(
      rendered.issues,
      [],
      `Dense 6-card ${layoutId} must render with zero overflow/overlap issues, got: ${JSON.stringify(rendered.issues)}`,
    );
    assert.ok(
      rendered.svg.includes('data-layer-box="node-5"'),
      `Dense 6-card ${layoutId} must render and expose direct-click layer for 6th card`,
    );
    assert.doesNotMatch(rendered.svg, /NaN|Infinity|undefined|<script|<foreignObject/);
  }

  // 5. Studio SSR defaults gallery to smart-matched compatible layouts for an FAQ card
  const { createRequire } = await import("node:module");
  const nativeRequire = createRequire(import.meta.url);
  nativeRequire.extensions[".css"] = (module) => {
    module.exports = {};
  };
  const React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { default: BlogInfographicStudio } = await import(
    "../../features/blog-infographic-studio/BlogInfographicStudio"
  );
  const faqStudioHtml = renderToStaticMarkup(
    React.createElement(BlogInfographicStudio, { initialConfig: faqCard }),
  );
  assert.ok(faqStudioHtml.includes("Matched for FAQ &amp; Q&amp;A"));
  assert.ok(faqStudioHtml.includes("Best for this section (4)"));
  assert.ok(!faqStudioHtml.includes("Conversion Funnel layout with your content"));
  assert.ok(!faqStudioHtml.includes("Pie Chart layout with your content"));
  // Single Left Panel architecture: zero duplicate top canvas inspector bar, explicit Stage Color, Icon Size & Diagram/Funnel Size controls in Left Panel
  assert.ok(!faqStudioHtml.includes('aria-label="Direct canvas element editor"'));
  assert.ok(faqStudioHtml.includes("Stage Color"));
  assert.ok(faqStudioHtml.includes("Icon Size"));
  assert.ok(faqStudioHtml.includes("Diagram / Funnel Size"));

  // 6. Hero-scale Flywheel radius (>= 92px) + diagramScale/iconScale responsiveness + JSON round-trip
  const { createLayoutSample } = await import(
    "../../lib/blog-infographic-studio/samples"
  );
  const { importInfographicProject } = await import(
    "../../lib/blog-infographic-studio/project"
  );
  const flywheelSample = createLayoutSample("cycle-wheel");
  const defaultFlywheelSvg = buildInfographicScene(flywheelSample).svg;
  const radiusMatches = [...defaultFlywheelSvg.matchAll(/<circle[^>]*\sr="(\d+(?:\.\d+)?)"/g)].map(
    (m) => Number(m[1]),
  );
  assert.ok(
    radiusMatches.some((r) => r >= 92 && r <= 150),
    `Expected hero-scale Flywheel orbital radius >= 92px, got radii: ${radiusMatches.join(", ")}`,
  );

  const scaledFunnel = withPrismLayout(
    {
      ...createLayoutSample("funnel-stages"),
      styleOverrides: {
        diagramScale: 1.25,
        iconScale: 1.3,
      },
      nodes: createLayoutSample("funnel-stages").nodes.map((n, idx) =>
        idx === 0 ? { ...n, accentHex: "#E11D48", iconScale: 1.2 } : n,
      ),
    },
    "funnel-stages",
  );
  const scaledFunnelScene = buildInfographicScene(scaledFunnel);
  assert.deepEqual(scaledFunnelScene.issues, []);
  assert.ok(scaledFunnelScene.svg.includes("#E11D48"));

  const [restoredScaled] = importInfographicProject(
    JSON.stringify({ version: 1, cards: [scaledFunnel] }),
  );
  assert.equal(restoredScaled.styleOverrides?.diagramScale, 1.25);
  assert.equal(restoredScaled.styleOverrides?.iconScale, 1.3);
  assert.equal(restoredScaled.nodes[0].iconScale, 1.2);
  assert.equal(restoredScaled.nodes[0].accentHex, "#E11D48");

  // Historical evolution headings never force cycle-wheel or funnel-stages
  const evolutionFit = getRecommendedLayoutsForConfig({
    ...faqCard,
    headline: "The Evolution of Google Search",
    subheadline: "From Keyword Matching to AI-Generated Answers",
    nodes: denseSixCard.nodes.slice(0, 5),
  });
  assert.ok(!evolutionFit.compatibleLayouts.includes("cycle-wheel"));
  assert.ok(!evolutionFit.compatibleLayouts.includes("funnel-stages"));
});







