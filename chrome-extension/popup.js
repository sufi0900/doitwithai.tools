// Do It With AI Tools — Chrome Extension Inspector, Keyword & Audience Spy, Converter & Social Studio (Manifest V3 v2.0.0)
(function () {
  "use strict";

  let currentPageData = null;
  let activeLinkFilter = "all";
  let activeImgFilter = "all";
  let activeNgramFilter = "all";
  let activeSocialPlatform = "LinkedIn";
  let activeSocialAngle = 0;
  let activeYtSubTab = "transcript";
  let currentYoutubePack = null;
  let hasAutoSwitchedYoutube = false;

  const STOP_WORDS = new Set([
    "the", "and", "for", "that", "this", "with", "from", "your", "have", "more",
    "are", "was", "were", "will", "can", "into", "about", "what", "when", "where",
    "which", "their", "there", "been", "they", "them", "then", "than", "some",
    "such", "only", "other", "also", "over", "after", "before", "most", "many",
    "each", "very", "just", "like", "make", "made", "using", "used", "does",
    "how", "why", "who", "you", "our", "out", "all", "any", "not", "but", "his",
    "her", "its", "has", "had", "would", "could", "should", "these", "those",
    "between", "through", "during", "without", "within", "along", "following",
    "across", "behind", "beyond", "plus", "except", "but", "up", "down", "in",
    "on", "at", "to", "of", "by", "as", "is", "it", "or", "be", "an", "a", "if",
    "we", "my", "so", "do", "no", "yes", "one", "two", "three", "need", "help"
  ]);

  // Fallback demo snapshot when opened on chrome:// or restricted browser pages
  const DEMO_PAGE_DATA = {
    url: "https://doitwithai.tools/prompts/keyword-research-prompts",
    domain: "doitwithai.tools",
    title: "100 Keyword Research Prompts for SEO and YouTube | Do It With AI Tools",
    description:
      "Use 100 keyword research prompts for discovery, intent, competitors, clustering, FAQs, YouTube, local SEO, and agency workflows. Customize and copy each prompt.",
    canonicalRendered: "https://doitwithai.tools/prompts/keyword-research-prompts",
    canonicalRaw: "https://doitwithai.tools/prompts/keyword-research-prompts",
    robotsMeta: "index, follow",
    googlebotMeta: "index, follow",
    publishedDate: "2026-10-25",
    modifiedDate: "2026-10-30",
    wordCount: 3420,
    headings: [
      { level: 1, text: "100 keyword research prompts for a useful content strategy", id: "top" },
      { level: 2, text: "What this collection helps you do", id: "what-this-collection-helps-you-do" },
      { level: 3, text: "Put your keyword prompts into a useful workflow", id: "put-your-keyword-prompts-into-a-useful-workflow" },
      { level: 2, text: "How to use these keyword research prompts", id: "how-to-use-these-keyword-research-prompts" },
      { level: 3, text: "Prepare the source and target audience brief", id: "prepare-the-source" },
      { level: 3, text: "Review before publishing", id: "review-before-publishing" },
      { level: 2, text: "100 keyword research prompts by task", id: "prompts-by-task" },
    ],
    paragraphs: [
      "Start with audience needs, discover relevant phrases, review search intent, and decide whether a topic deserves a dedicated page.",
      "In our test of 100 SEO prompt workflows across 45 content sites, grouping keywords by search intent reduced cannibalization by 38.4%.",
      "Use these structured keyword research prompts alongside Google Search Console data to uncover high-converting long-tail queries for YouTube and local SEO.",
      "B2B marketers, SEO strategists, and content creators can copy these keyword clustering prompts to speed up topical map planning and competitor gap analysis.",
    ],
    links: [
      { href: "https://doitwithai.tools/", anchor: "Home", rel: "dofollow", isExternal: false, anchorType: "Branded" },
      { href: "https://doitwithai.tools/tools", anchor: "Tools Workspace", rel: "dofollow", isExternal: false, anchorType: "Partial Match" },
      { href: "https://doitwithai.tools/ai-seo", anchor: "SEO Hub", rel: "dofollow", isExternal: false, anchorType: "Partial Match" },
      { href: "https://developers.google.com/search/docs", anchor: "Google Search Central Documentation", rel: "dofollow", isExternal: true, anchorType: "Descriptive" },
    ],
    images: [
      {
        src: "https://doitwithai.tools/ogimage.png",
        alt: "100 keyword research prompts beside a desktop screen with discover, group, review, and copy prompt controls.",
        width: 1600,
        height: 900,
      },
      {
        src: "https://doitwithai.tools/logoForHeader.png",
        alt: "Do It With AI Tools Logo",
        width: 434,
        height: 575,
      },
    ],
    schemas: [
      {
        type: "BreadcrumbList",
        raw: {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://doitwithai.tools" },
            { "@type": "ListItem", position: 2, name: "Prompts", item: "https://doitwithai.tools/prompts" },
          ],
        },
      },
      {
        type: "Article",
        raw: {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "100 Keyword Research Prompts for SEO and YouTube",
          author: { "@type": "Person", name: "Sufian Mustafa" },
          datePublished: "2026-10-25",
        },
      },
      {
        type: "FAQPage",
        raw: {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "How do I use AI prompts for keyword research?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Combine seed topics with audience pain points and verify search intent against live SERP results.",
              },
            },
          ],
        },
      },
    ],
    og: {
      title: "100 Keyword Research Prompts for SEO and YouTube",
      description:
        "Use 100 keyword research prompts for discovery, intent, competitors, clustering, FAQs, YouTube, local SEO, and agency workflows.",
      image: "https://doitwithai.tools/ogimage.png",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: "100 Keyword Research Prompts for SEO and YouTube",
      description:
        "Use 100 keyword research prompts for discovery, intent, competitors, clustering, FAQs, YouTube, and local SEO.",
      image: "https://doitwithai.tools/ogimage.png",
    },
    hreflangs: [],
    hasAuthorSignal: true,
    hasAboutContactLinks: true,
    quantitativeMatches: ["100", "38.4%", "45"],
    firstHandMatches: ["in our test"],
  };

  // Self-contained DOM extractor executed inside the active tab via chrome.scripting.executeScript
  function extractPageDomSnapshot() {
    const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
    const url = location.href;
    const domain = location.hostname.replace(/^www\./i, "");

    const title = clean(document.title);
    const metaDesc = clean(
      document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
    );
    const canonicalRendered =
      document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
    const robotsMeta = clean(
      document.querySelector('meta[name="robots"]')?.getAttribute("content") ||
        "index, follow",
    );
    const googlebotMeta = clean(
      document.querySelector('meta[name="googlebot"]')?.getAttribute("content") ||
        robotsMeta,
    );

    const publishedDate = clean(
      document
        .querySelector('meta[property="article:published_time"], meta[name="date"], time[datetime]')
        ?.getAttribute("content") ||
        document.querySelector("time[datetime]")?.getAttribute("datetime") ||
        "",
    );
    const modifiedDate = clean(
      document
        .querySelector('meta[property="article:modified_time"], meta[property="og:updated_time"]')
        ?.getAttribute("content") || "",
    );

    const slugify = (txt) =>
      txt
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 64) || "section";

    const usedSlugs = {};
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
      .map((el) => {
        const text = clean(el.textContent);
        if (!text) return null;
        const level = Number(el.tagName.slice(1));
        const baseSlug = el.id || slugify(text);
        usedSlugs[baseSlug] = (usedSlugs[baseSlug] || 0) + 1;
        const id =
          usedSlugs[baseSlug] === 1
            ? baseSlug
            : `${baseSlug}-${usedSlugs[baseSlug]}`;
        return { level, text, id };
      })
      .filter(Boolean);

    const mainRoot =
      document.querySelector("article, main, [role='main']") || document.body;
    const bodyText = clean(mainRoot ? mainRoot.innerText : document.body.innerText);
    const wordCount = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0;

    const paragraphs = Array.from(
      (mainRoot || document.body).querySelectorAll("p"),
    )
      .map((p) => clean(p.textContent))
      .filter((t) => t.length >= 45)
      .slice(0, 45);

    const links = Array.from(document.querySelectorAll("a[href]"))
      .map((a) => {
        const rawHref = a.getAttribute("href") || "";
        if (!rawHref || rawHref.startsWith("javascript:") || rawHref.startsWith("#"))
          return null;
        let resolved = "";
        try {
          resolved = new URL(rawHref, url).href;
        } catch {
          return null;
        }
        if (!/^https?:/i.test(resolved)) return null;
        const linkHost = new URL(resolved).hostname.replace(/^www\./i, "");
        const isExternal = linkHost !== domain;
        const relAttr = (a.getAttribute("rel") || "").toLowerCase();
        const rel = relAttr.includes("nofollow")
          ? "nofollow"
          : relAttr.includes("sponsored")
            ? "sponsored"
            : relAttr.includes("ugc")
              ? "ugc"
              : "dofollow";
        const anchor =
          clean(a.textContent) ||
          clean(a.querySelector("img")?.getAttribute("alt")) ||
          "[No Anchor Text]";
        const lowerAnchor = anchor.toLowerCase();
        const anchorType = /^(click here|read more|learn more|here|link|website|this page)$/i.test(
          lowerAnchor,
        )
          ? "Generic"
          : /^https?:\/\//i.test(anchor)
            ? "Naked URL"
            : lowerAnchor.includes(domain.split(".")[0])
              ? "Branded"
              : "Descriptive";
        return { href: resolved, anchor, rel, isExternal, anchorType };
      })
      .filter(Boolean)
      .slice(0, 250);

    const images = Array.from(document.querySelectorAll("img"))
      .map((img) => {
        const src = img.currentSrc || img.src || img.getAttribute("data-src") || "";
        if (!src) return null;
        return {
          src,
          alt: clean(img.getAttribute("alt") || ""),
          width: img.naturalWidth || img.width || 0,
          height: img.naturalHeight || img.height || 0,
        };
      })
      .filter(Boolean)
      .slice(0, 100);

    const schemas = [];
    Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    ).forEach((s) => {
      try {
        const parsed = JSON.parse(s.textContent || "");
        const items = Array.isArray(parsed)
          ? parsed
          : parsed["@graph"] && Array.isArray(parsed["@graph"])
            ? parsed["@graph"]
            : [parsed];
        items.forEach((item) => {
          if (item && typeof item === "object") {
            const t = Array.isArray(item["@type"])
              ? item["@type"].join(", ")
              : item["@type"] || "SchemaObject";
            schemas.push({ type: String(t), raw: item });
          }
        });
      } catch {}
    });

    const og = {
      title:
        clean(
          document.querySelector('meta[property="og:title"]')?.getAttribute("content"),
        ) || title,
      description:
        clean(
          document
            .querySelector('meta[property="og:description"]')
            ?.getAttribute("content"),
        ) || metaDesc,
      image:
        document.querySelector('meta[property="og:image"]')?.getAttribute("content") ||
        "",
      type:
        document.querySelector('meta[property="og:type"]')?.getAttribute("content") ||
        "website",
    };

    const twitter = {
      card:
        document.querySelector('meta[name="twitter:card"]')?.getAttribute("content") ||
        "summary_large_image",
      title:
        clean(
          document.querySelector('meta[name="twitter:title"]')?.getAttribute("content"),
        ) || og.title,
      description:
        clean(
          document
            .querySelector('meta[name="twitter:description"]')
            ?.getAttribute("content"),
        ) || og.description,
      image:
        document.querySelector('meta[name="twitter:image"]')?.getAttribute("content") ||
        og.image,
    };

    const hreflangs = Array.from(
      document.querySelectorAll('link[rel="alternate"][hreflang]'),
    ).map((l) => ({
      lang: l.getAttribute("hreflang") || "",
      href: l.getAttribute("href") || "",
    }));

    const hasAuthorSignal =
      !!document.querySelector('[rel="author"], .author, [itemprop="author"], meta[name="author"]') ||
      schemas.some((s) => JSON.stringify(s.raw).includes('"author"'));

    const hasAboutContactLinks = links.some((l) =>
      /\/(about|contact|privacy|terms|editorial)/i.test(l.href),
    );

    const quantitativeMatches = (
      bodyText.match(/\b\d+(?:\.\d+)?%|\$\d[\d,.]*|\b\d{2,5}\s+(?:sites|pages|users|days|ms|seconds|queries|links)\b/gi) || []
    ).slice(0, 15);

    const firstHandMatches = (
      bodyText.match(/\b(we tested|in our test|our benchmark|we measured|in our audit|case study|step-by-step|our dataset)\b/gi) || []
    ).slice(0, 10);

    
    let youtubeComments = [];
    if (/youtube\.com/i.test(domain)) {
      const cNodes = Array.from(document.querySelectorAll("ytd-comment-thread-renderer #content-text")).slice(0, 12);
      const aNodes = Array.from(document.querySelectorAll("ytd-comment-thread-renderer #author-text")).slice(0, 12);
      youtubeComments = cNodes.map((n, idx) => ({
        author: clean(aNodes[idx]?.textContent || "Viewer #" + (idx + 1)),
        text: clean(n.textContent || ""),
      }));
    }

    return {
      youtubeComments,
      url,
      domain,
      title,
      description: metaDesc,
      canonicalRendered,
      canonicalRaw: canonicalRendered,
      robotsMeta,
      googlebotMeta,
      publishedDate,
      modifiedDate,
      wordCount,
      headings,
      paragraphs,
      links,
      images,
      schemas,
      og,
      twitter,
      hreflangs,
      hasAuthorSignal,
      hasAboutContactLinks,
      quantitativeMatches,
      firstHandMatches,
    };
  }

  // =========================================================================
  // COMPETITOR KEYWORD, N-GRAM & SUB-TOPIC SPY ENGINE
  // =========================================================================
  function analyzeKeywordsAndTopics(data) {
    const titleLower = (data.title || "").toLowerCase();
    const h1Text = data.headings
      .filter((h) => h.level === 1)
      .map((h) => h.text)
      .join(" ")
      .toLowerCase();
    const h2Text = data.headings
      .filter((h) => h.level === 2)
      .map((h) => h.text)
      .join(" ")
      .toLowerCase();
    const descLower = (data.description || "").toLowerCase();
    const firstParaLower = (data.paragraphs[0] || "").toLowerCase();
    let urlSlug = "";
    try {
      urlSlug = new URL(data.url).pathname.toLowerCase().replace(/[^a-z0-9]+/g, " ");
    } catch {}

    const fullCorpus = [
      data.title,
      data.title,
      h1Text,
      h2Text,
      data.description,
      ...(data.paragraphs || []),
    ]
      .join(" ")
      .toLowerCase();

    const rawTokens = (fullCorpus.match(/[a-z0-9]{3,}/g) || []).filter(
      (w) => !STOP_WORDS.has(w) && !/^\d+$/.test(w),
    );
    const totalTokens = Math.max(1, rawTokens.length);

    const unigrams = new Map();
    const bigrams = new Map();
    const trigrams = new Map();

    for (let i = 0; i < rawTokens.length; i++) {
      const w1 = rawTokens[i];
      unigrams.set(w1, (unigrams.get(w1) || 0) + 1);
      if (i + 1 < rawTokens.length) {
        const b = `${w1} ${rawTokens[i + 1]}`;
        bigrams.set(b, (bigrams.get(b) || 0) + 1);
      }
      if (i + 2 < rawTokens.length) {
        const t = `${w1} ${rawTokens[i + 1]} ${rawTokens[i + 2]}`;
        trigrams.set(t, (trigrams.get(t) || 0) + 1);
      }
    }

    function scoreKeywordCandidate(phrase, count, ngramSize) {
      const inTitle = titleLower.includes(phrase);
      const inH1 = h1Text.includes(phrase);
      const inH2 = h2Text.includes(phrase);
      const inDesc = descLower.includes(phrase);
      const inSlug = urlSlug.includes(phrase);
      const inIntro = firstParaLower.includes(phrase);

      let weight = count * (ngramSize === 2 ? 2.4 : ngramSize === 3 ? 2.8 : 1.0);
      if (inTitle) weight += 12;
      if (inH1) weight += 10;
      if (inSlug) weight += 8;
      if (inH2) weight += 6;
      if (inDesc) weight += 5;
      if (inIntro) weight += 4;

      const zones = [];
      if (inTitle) zones.push("Title");
      if (inH1) zones.push("H1");
      if (inH2) zones.push("H2");
      if (inDesc) zones.push("Meta");
      if (inSlug) zones.push("URL");

      const density = ((count * ngramSize) / Math.max(100, data.wordCount || totalTokens)) * 100;
      return {
        phrase,
        count,
        ngramSize,
        weight,
        density: Math.min(9.9, density).toFixed(2),
        zones,
      };
    }

    const allCandidates = [];
    bigrams.forEach((cnt, phrase) => {
      if (cnt >= 2 || titleLower.includes(phrase)) {
        allCandidates.push(scoreKeywordCandidate(phrase, cnt, 2));
      }
    });
    trigrams.forEach((cnt, phrase) => {
      if (cnt >= 2 || titleLower.includes(phrase)) {
        allCandidates.push(scoreKeywordCandidate(phrase, cnt, 3));
      }
    });
    unigrams.forEach((cnt, phrase) => {
      if (cnt >= 2) {
        allCandidates.push(scoreKeywordCandidate(phrase, cnt, 1));
      }
    });

    allCandidates.sort((a, b) => b.weight - a.weight || b.count - a.count);

    // Pick Primary Focus Keyword (prefer 2- or 3-word phrase present in Title or H1)
    const primaryObj =
      allCandidates.find((c) => c.ngramSize >= 2 && (c.zones.includes("Title") || c.zones.includes("H1"))) ||
      allCandidates.find((c) => c.ngramSize >= 2) ||
      allCandidates[0] || {
        phrase: (data.title || "content strategy").split("|")[0].trim().toLowerCase(),
        count: 1,
        ngramSize: 2,
        zones: ["Title"],
        density: "1.20",
      };

    const primaryPhrase = primaryObj.phrase;
    const placementChecks = [
      { label: "In <title> Tag", passed: titleLower.includes(primaryPhrase) },
      { label: "In H1 Heading", passed: h1Text.includes(primaryPhrase) },
      { label: "In URL Slug", passed: urlSlug.includes(primaryPhrase) },
      { label: "In Meta Description", passed: descLower.includes(primaryPhrase) },
      { label: "In First Paragraph", passed: firstParaLower.includes(primaryPhrase) },
    ];

    // Classify Search Intent
    let searchIntent = "Informational (Guide / How-To)";
    if (/\b(best|top|vs|comparison|review|alternatives|pricing|benchmark)\b/i.test(data.title + " " + h1Text)) {
      searchIntent = "Commercial Investigation";
    } else if (/\b(buy|tool|generator|calculator|checker|download|free|studio|template)\b/i.test(data.title + " " + h1Text)) {
      searchIntent = "Transactional / Interactive Tool";
    }

    // Build H2 Sub-Topics list
    const h2Headings = data.headings.filter((h) => h.level === 2);
    const subTopics = h2Headings.map((h, i) => ({
      index: i + 1,
      title: h.text,
      summary: data.paragraphs[i] || data.description || "Section breakdown ready for social or blog repurposing.",
    }));

    return {
      primaryPhrase,
      searchIntent,
      placementChecks,
      passedZonesCount: placementChecks.filter((c) => c.passed).length,
      keywords: allCandidates.slice(0, 24),
      subTopics,
    };
  }

  // =========================================================================
  // TARGET AUDIENCE PERSONA, FUNNEL STAGE & CONTENT GAP ANALYZER
  // =========================================================================
  function analyzeTargetAudience(data, kwAnalysis) {
    const combined = `${data.title} ${data.description} ${(data.paragraphs || []).join(" ")}`.toLowerCase();

    let persona = "Digital Marketers & Content Creators";
    const signals = [];

    if (/\b(seo|serp|backlink|keyword|canonical|schema|crawl|indexing|gsc|search console)\b/.test(combined)) {
      persona = "SEO Strategists & Content Marketing Teams";
      signals.push("Technical & On-Page SEO Terminology");
      signals.push("Search Ranking & Organic Traffic Focus");
    } else if (/\b(api|javascript|typescript|react|python|sdk|github|deploy|docker|code|developer)\b/.test(combined)) {
      persona = "Software Developers & Technical Engineers";
      signals.push("Code & Engineering Implementation Focus");
      signals.push("Developer Documentation Structure");
    } else if (/\b(saas|b2b|founder|pipeline|lead|enterprise|roi|revenue|crm|outreach)\b/.test(combined)) {
      persona = "B2B Founders, Growth Leads & Executives";
      signals.push("ROI & Pipeline Conversion Vocabulary");
      signals.push("B2B Decision-Maker Framing");
    } else if (/\b(local|google business|maps|reviews|clinic|plumber|agency|near me|nap)\b/.test(combined)) {
      persona = "Local Business Owners & Agency Operators";
      signals.push("Local Search & Map Pack Signals");
    } else {
      signals.push("Practical Step-by-Step Action Orientation");
    }

    if (data.schemas.length > 0) {
      signals.push(`Structured Data (${data.schemas.map((s) => s.type).slice(0, 2).join(", ")})`);
    }
    if (data.wordCount > 1500) {
      signals.push("Long-Form Deep-Dive Reader Profile");
    } else {
      signals.push("Fast-Scanning Action-Taker Profile");
    }

    // Funnel stage
    let funnelStage = "TOFU · Awareness & Education";
    if (kwAnalysis.searchIntent.includes("Commercial")) {
      funnelStage = "MOFU · Evaluation & Comparison";
    } else if (kwAnalysis.searchIntent.includes("Transactional")) {
      funnelStage = "BOFU · Solution & Tool Adoption";
    }

    // Reading level & tone
    const sentences = (data.paragraphs || [])
      .join(" ")
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 8);
    const totalWordsInParas = (data.paragraphs || [])
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;
    const avgWordsPerSentence = sentences.length
      ? Math.round(totalWordsInParas / sentences.length)
      : 16;

    const readingLevel =
      avgWordsPerSentence <= 14
        ? "Grade 7–8 (Easy & Scannable)"
        : avgWordsPerSentence <= 20
          ? "Grade 9–11 (Professional Standard)"
          : "Grade 12+ (Academic / Technical)";

    let tone = "Instructional & Actionable";
    if ((data.quantitativeMatches?.length || 0) >= 2) {
      tone = "Data-Driven & Analytical";
    } else if (/\b(you|your|let's|we)\b/.test(combined)) {
      tone = "Conversational & Peer-to-Peer";
    }

    // Pain points addressed (derived from H2/H3 headings)
    const painPoints = data.headings
      .filter((h) => h.level === 2 || h.level === 3)
      .slice(0, 5)
      .map((h) => `Solves reader question around: "${h.text}"`);
    if (!painPoints.length) {
      painPoints.push(`Addresses core topic: "${data.title}"`);
    }

    // Content gaps to beat this competitor page
    const gaps = [];
    if (!data.schemas.some((s) => /FAQPage/i.test(s.type))) {
      gaps.push("Missing FAQPage JSON-LD Schema — add 4–5 structured Q&As to win rich results & AI citations.");
    }
    if ((data.quantitativeMatches?.length || 0) < 3) {
      gaps.push("Low original data density — include 3+ benchmark stats, percentages, or first-hand test metrics.");
    }
    if (data.images.filter((i) => i.alt).length < 3) {
      gaps.push("Limited descriptive visual assets — add comparison tables, diagrams, or downloadable templates with keyword Alt Text.");
    }
    if (data.wordCount < 1200) {
      gaps.push(`Page is only ${data.wordCount} words — expand sub-topic depth to 1,500+ words with a jump-link Table of Contents.`);
    }
    if (!gaps.length) {
      gaps.push("Outperform this page by adding an interactive calculator, downloadable checklist PDF, or embedded YouTube video summary.");
    }

    return {
      persona,
      funnelStage,
      readingLevel,
      tone,
      summaryText: `This page is engineered for ${persona} in the "${funnelStage}" stage, using a ${tone.toLowerCase()} style (~${avgWordsPerSentence} words/sentence) focused on "${kwAnalysis.primaryPhrase}".`,
      signals,
      painPoints,
      gaps,
    };
  }

  function computeScores(data) {
    let eeat = 32;
    if (data.hasAuthorSignal) eeat += 18;
    if (data.publishedDate || data.modifiedDate) eeat += 14;
    if (data.hasAboutContactLinks) eeat += 12;
    if (data.schemas.length > 0) eeat += 12;
    if (data.links.some((l) => l.isExternal && l.rel === "dofollow")) eeat += 12;
    eeat = Math.min(98, eeat);

    let infoGain = 28;
    infoGain += Math.min(28, (data.quantitativeMatches?.length || 0) * 7);
    infoGain += Math.min(24, (data.firstHandMatches?.length || 0) * 10);
    infoGain += Math.min(20, Math.floor((data.headings?.length || 0) * 2.5));
    infoGain = Math.min(97, infoGain);

    let vetting = 50;
    const isIndexable = !/noindex/i.test(data.robotsMeta);
    if (isIndexable) vetting += 20;
    else vetting -= 35;
    if (data.wordCount >= 800) vetting += 15;
    if (data.hasAuthorSignal) vetting += 10;
    const dofollowCount = data.links.filter((l) => l.rel === "dofollow").length;
    if (dofollowCount > 0) vetting += 5;
    vetting = Math.max(10, Math.min(99, vetting));

    return { eeat, infoGain, vetting };
  }

  function setGauge(ringId, valId, labelId, score) {
    const ring = document.getElementById(ringId);
    const val = document.getElementById(valId);
    const lbl = document.getElementById(labelId);
    if (!ring || !val || !lbl) return;

    const circumference = 207;
    const offset =
      circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;
    ring.style.strokeDashoffset = String(offset);
    const color =
      score >= 74 ? "#10b981" : score >= 48 ? "#f59e0b" : "#f43f5e";
    ring.style.stroke = color;
    val.textContent = `${score}`;
    lbl.textContent =
      score >= 74
        ? "Strong Signal (74+)"
        : score >= 48
          ? "Moderate (Add Proof)"
          : "Needs Improvement";
  }

  function showToast(msg) {
    const toast = document.getElementById("status-toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 2800);
  }

  function buildTocHtml(headings) {
    const h2h3 = headings.filter((h) => h.level === 2 || h.level === 3);
    if (!h2h3.length) return "<!-- No H2/H3 headings found on this page -->";
    const items = h2h3
      .map(
        (h) =>
          `    <li${h.level === 3 ? ' style="margin-left:16px"' : ""}><a href="#${h.id}">${h.text}</a></li>`,
      )
      .join("\n");
    return `<nav aria-label="Table of Contents" class="seo-toc">\n  <h2>Table of Contents</h2>\n  <ol>\n${items}\n  </ol>\n</nav>`;
  }

  function generateSocialPost(data, platform, angleIdx) {
    const title = data.title || "Practical Guide";
    const url = data.url || "https://doitwithai.tools";
    const h2s = data.headings
      .filter((h) => h.level === 2)
      .map((h) => h.text)
      .slice(0, 4);
    const bullets =
      h2s.length > 0
        ? h2s.map((h) => `✅ ${h}`).join("\n")
        : data.paragraphs
            .slice(0, 3)
            .map((p) => `• ${p.slice(0, 90)}...`)
            .join("\n");

    const leadP =
      data.paragraphs[0] ||
      data.description ||
      "Here is a structured breakdown you can apply immediately.";

    if (platform === "TikTok") {
      return `[0:00 - 0:03 HOOK]\n🎙️ Stop scrolling if you care about "${title}"—here is the 30-second cheat sheet.\n🎥 (Point at green-screen headline behind you)\n\n[0:03 - 0:20 CORE BREAKDOWN]\n${bullets}\n\n[0:20 - 0:30 CTA]\n🎙️ Save this video for your next sprint & check the full guide at ${data.domain}!\n\nCaption: ${title} — Full breakdown in 30 seconds! #LearnOnTikTok #ContentStrategy #SEO`;
    }

    if (platform === "X" || platform === "Threads") {
      if (angleIdx === 0) {
        return `Most teams overcomplicate "${title}".\n\nHere is the streamlined checklist that actually moves the needle:\n\n${bullets}\n\nFull breakdown 👇\n🌐 ${url}`;
      }
      if (angleIdx === 1) {
        return `Unpopular opinion on ${title}:\n\n${leadP.slice(0, 180)}\n\nStop guessing and audit these signals first:\n${bullets}\n\n🌐 ${url}`;
      }
      return `3-Step Playbook from "${title}":\n\n${bullets}\n\nBookmark this for your next content sprint.\n🌐 ${url}`;
    }

    if (angleIdx === 0) {
      return `📌 ${title}\n\n${leadP}\n\nKey sections covered in this guide:\n${bullets}\n\nWhich of these steps is your biggest bottleneck right now?\n\n🌐 Read the full guide: ${url}\n\n#SEO #ContentStrategy #DigitalMarketing #AIWorkflows`;
    }
    if (angleIdx === 1) {
      return `💡 Why most "${title}" advice falls short (and what to do instead):\n\n${leadP}\n\nInstead of repeating generic checklists, focus on these high-impact areas:\n${bullets}\n\n🌐 Full breakdown & tools: ${url}\n\n#SEOTools #ContentMarketing #OrganicGrowth`;
    }
    return `🚀 Step-by-Step Implementation Playbook: ${title}\n\nSave this checklist for your next audit:\n\n${bullets}\n\n${data.paragraphs[1] || ""}\n\n🌐 Explore the complete guide: ${url}\n\n#MarketingStrategy #OnPageSEO #GrowthMarketing`;
  }

  
  function buildFallbackYoutubePack(data) {
    const cleanTitle = (data.title || "YouTube Video").replace(/\s*-\s*YouTube$/i, "").trim();
    const paras = (data.paragraphs && data.paragraphs.length) ? data.paragraphs : [data.description || cleanTitle];
    const segments = paras.map((p, idx) => {
      const sec = idx * 22;
      const m = Math.floor(sec / 60);
      const r = sec % 60;
      return {
        startSeconds: sec,
        timestamp: `${m}:${r < 10 ? "0" : ""}${r}`,
        text: p,
      };
    });
    return {
      title: cleanTitle,
      channelName: "YouTube Creator",
      url: data.url,
      segments,
      summaryBullets: paras.slice(0, 4),
      insights: [
        `Primary Video Topic: ${cleanTitle}`,
        paras[0] || "Step-by-step video walkthrough ready for repurposing.",
        paras[1] || "Includes timestamped sections and actionable takeaways.",
      ],
      faqs: [
        { q: `What is "${cleanTitle}" about?`, a: paras[0] || cleanTitle },
        { q: "How do I turn this video into a blog post or Shorts script?", a: "Use the 1-Click buttons below to open this video URL directly inside the DoItWithAI Video-to-Blog or Shorts Script Studio." },
      ],
      comments: data.youtubeComments || [],
    };
  }

  function renderYoutubeStudioContent() {
    const box = document.getElementById("yt-studio-content-box");
    if (!box) return;
    const pack = currentYoutubePack || (currentPageData ? buildFallbackYoutubePack(currentPageData) : null);
    if (!pack) return;

    const titleEl = document.getElementById("yt-studio-title");
    if (titleEl) titleEl.textContent = pack.title || "YouTube Video";
    const chanEl = document.getElementById("yt-studio-channel");
    if (chanEl) chanEl.textContent = `▶ YOUTUBE STUDIO · ${(pack.channelName || "ACTIVE VIDEO").toUpperCase()}`;

    if (activeYtSubTab === "transcript") {
      box.innerHTML = (pack.segments || [])
        .map(
          (s) => `
          <div class="item-row">
            <div style="min-width:0;flex:1">
              <span class="status-pill" style="margin-right:6px;font-family:monospace">${s.timestamp}</span>
              <span style="color:var(--text-main);font-weight:500">${s.text}</span>
            </div>
          </div>
        `
        )
        .join("");
    } else if (activeYtSubTab === "summary") {
      box.innerHTML = (pack.summaryBullets || [])
        .map(
          (b, i) => `
          <div class="item-row">
            <div style="min-width:0;flex:1">
              <strong style="color:var(--link-color)">Takeaway #${i + 1}:</strong> ${b}
            </div>
          </div>
        `
        )
        .join("");
    } else if (activeYtSubTab === "insights") {
      box.innerHTML = (pack.insights || [])
        .map(
          (ins) => `
          <div class="item-row">
            <div style="min-width:0;flex:1">💡 ${ins}</div>
          </div>
        `
        )
        .join("");
    } else if (activeYtSubTab === "faqs") {
      box.innerHTML = (pack.faqs || [])
        .map(
          (f) => `
          <div class="item-row">
            <div style="min-width:0;flex:1">
              <div class="item-title">Q: ${f.q}</div>
              <div class="text-muted" style="margin-top:3px">A: ${f.a}</div>
            </div>
          </div>
        `
        )
        .join("");
    } else if (activeYtSubTab === "comments") {
      const comms = pack.comments || [];
      if (!comms.length) {
        box.innerHTML = `<p class="text-muted">Scroll slightly down on the YouTube page so comments load, then click "↻ Rescan Page" above to inspect viewer comments.</p>`;
      } else {
        box.innerHTML = comms
          .map(
            (c) => `
            <div class="item-row">
              <div style="min-width:0;flex:1">
                <div class="item-title">${c.author}</div>
                <div class="text-muted">${c.text}</div>
              </div>
            </div>
          `
          )
          .join("");
      }
    }
  }

  function polishSocialTextareaContent(action) {
    const area = document.getElementById("social-post-output");
    if (!area) return;
    const raw = (area.value || "").trim();
    const url = currentPageData?.url || "https://doitwithai.tools";
    const title = currentPageData?.title || "Growth & SEO Playbook";
    const lines = raw.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const firstLine = lines[0] || title;

    if (action === "hook") {
      area.value = `🔥 Stop scrolling if you care about ${title.replace(/\s*\|\s*[^|]+$/g, "")}:

Most teams waste hours on the wrong steps. Here is what actually moves the needle:

${lines.slice(1).join("\n\n") || raw}`;
    } else if (action === "bullets") {
      const sentences = raw.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter((s) => s.length > 10);
      const bullets = sentences.slice(0, 5).map((s) => `✅ ${s.replace(/^[•✅📌🚀💡]\s*/, "")}`).join("\n");
      area.value = `📌 ${title.replace(/\s*\|\s*[^|]+$/g, "")}

${bullets}

Which of these steps is your #1 priority right now? 👇

🌐 ${url}`;
    } else if (action === "expand") {
      area.value = `🚀 ${firstLine}

Here is the step-by-step breakdown you can apply today:

1️⃣ Audit the core bottleneck first instead of guessing
2️⃣ Focus on high-retention hooks and scannable takeaways
3️⃣ Repurpose every guide into multi-platform social assets

${raw}

Save this post for your next content sprint! 👇
🌐 ${url}`;
    }
    const counter = document.getElementById("social-char-counter");
    if (counter) {
      counter.textContent = `${area.value.length} characters · ${activeSocialPlatform} (Polished)`;
    }
    showToast("Polished social post draft!");
  }

  function renderAll(data) {
    currentPageData = data;
    const scores = computeScores(data);
    const kwAnalysis = analyzeKeywordsAndTopics(data);
    const audAnalysis = analyzeTargetAudience(data, kwAnalysis);
    currentPageData._kwAnalysis = kwAnalysis;
    currentPageData._audAnalysis = audAnalysis;

    // Top URL pill
    document.getElementById("active-url-display").textContent = data.url;

    // Sidebar badges
    const missingAltCount = data.images.filter((i) => !i.alt).length;
    const h1Count = data.headings.filter((h) => h.level === 1).length;
    const contentBadge = document.getElementById("badge-content");
    if (contentBadge) {
      contentBadge.textContent = String(data.headings.length);
      contentBadge.classList.toggle("badge-warn", h1Count !== 1);
    }

    const kwBadge = document.getElementById("badge-keywords");
    if (kwBadge) {
      kwBadge.textContent = String(kwAnalysis.keywords.length);
    }

    const idxBadge = document.getElementById("badge-indexability");
    const isNoindex = /noindex/i.test(data.robotsMeta);
    if (idxBadge) {
      idxBadge.textContent = isNoindex ? "NOINDEX" : "INDEX";
      idxBadge.classList.toggle("badge-warn", isNoindex);
    }

    document.getElementById("badge-schema").textContent = String(data.schemas.length);
    document.getElementById("badge-links").textContent = String(data.links.length);

    const imgBadge = document.getElementById("badge-images");
    if (imgBadge) {
      imgBadge.textContent = String(data.images.length);
      imgBadge.classList.toggle("badge-warn", missingAltCount > 0);
    }

    // TAB 1: Overview & Gauges
    setGauge("ring-eeat", "val-eeat", "label-eeat", scores.eeat);
    setGauge("ring-infogain", "val-infogain", "label-infogain", scores.infoGain);

    const tLen = data.title.length;
    document.getElementById("ov-title").textContent = data.title || "Missing <title>";
    const tBadge = document.getElementById("title-char-badge");
    tBadge.textContent = `${tLen} chars`;
    tBadge.className = `status-pill ${tLen >= 30 && tLen <= 62 ? "" : "warn"}`;
    document.getElementById("bar-title").style.width = `${Math.min(100, Math.round((tLen / 60) * 100))}%`;

    const dLen = data.description.length;
    document.getElementById("ov-desc").textContent =
      data.description || "Missing meta description";
    const dBadge = document.getElementById("desc-char-badge");
    dBadge.textContent = `${dLen} chars`;
    dBadge.className = `status-pill ${dLen >= 110 && dLen <= 165 ? "" : "warn"}`;
    document.getElementById("bar-desc").style.width = `${Math.min(100, Math.round((dLen / 160) * 100))}%`;

    const focusKwEl = document.getElementById("ov-focus-kw");
    if (focusKwEl) {
      focusKwEl.textContent = `"${kwAnalysis.primaryPhrase}" (${kwAnalysis.passedZonesCount}/5 on-page zones)`;
    }
    const focusIntentEl = document.getElementById("ov-focus-intent");
    if (focusIntentEl) {
      focusIntentEl.textContent = kwAnalysis.searchIntent.split(" ")[0];
    }

    const canEl = document.getElementById("ov-canonical");
    canEl.textContent = data.canonicalRendered || "Missing canonical tag";
    canEl.href = data.canonicalRendered || data.url;
    const canBadge = document.getElementById("canonical-badge");
    const isSelfCanonical =
      data.canonicalRendered &&
      data.canonicalRendered.replace(/\/$/, "") === data.url.split("?")[0].replace(/\/$/, "");
    canBadge.textContent = !data.canonicalRendered
      ? "Missing"
      : isSelfCanonical
        ? "Self-Canonical"
        : "Points Elsewhere";
    canBadge.className = `status-pill ${isSelfCanonical ? "" : "warn"}`;

    document.getElementById("ov-robots").textContent = data.robotsMeta;
    const rBadge = document.getElementById("robots-badge");
    rBadge.textContent = isNoindex ? "Noindex" : "Indexable";
    rBadge.className = `status-pill ${isNoindex ? "bad" : ""}`;

    // KPI strip
    document.getElementById("kpi-words").textContent = data.wordCount.toLocaleString();
    document.getElementById("kpi-h1").textContent = String(h1Count);
    document.getElementById("kpi-h2").textContent = String(
      data.headings.filter((h) => h.level === 2).length,
    );
    document.getElementById("kpi-h3").textContent = String(
      data.headings.filter((h) => h.level === 3).length,
    );
    document.getElementById("kpi-h4").textContent = String(
      data.headings.filter((h) => h.level >= 4).length,
    );
    document.getElementById("kpi-links").textContent = String(data.links.length);
    document.getElementById("kpi-images").textContent = String(data.images.length);

    // NEW TAB: KEYWORDS & SUB-TOPICS
    document.getElementById("kw-primary-phrase").textContent = kwAnalysis.primaryPhrase;
    document.getElementById("kw-search-intent").textContent = kwAnalysis.searchIntent;
    document.getElementById("kw-placement-score").textContent = `${kwAnalysis.passedZonesCount} / 5 Zones`;
    document.getElementById("kw-subtopics-count").textContent = `${kwAnalysis.subTopics.length} H2 Sections`;

    const placementBox = document.getElementById("kw-placement-pills");
    if (placementBox) {
      placementBox.innerHTML = kwAnalysis.placementChecks
        .map(
          (chk) =>
            `<span class="status-pill ${chk.passed ? "" : "warn"}">${chk.passed ? "✓" : "✗"} ${chk.label}</span>`,
        )
        .join("");
    }
    renderKeywordsTable();
    renderSubTopicsList();

    // NEW TAB: TARGET AUDIENCE & PERSONA
    document.getElementById("aud-persona").textContent = audAnalysis.persona;
    document.getElementById("aud-funnel-stage").textContent = audAnalysis.funnelStage;
    document.getElementById("aud-reading-level").textContent = audAnalysis.readingLevel;
    document.getElementById("aud-tone").textContent = audAnalysis.tone;
    document.getElementById("aud-summary-text").textContent = audAnalysis.summaryText;

    const sigBox = document.getElementById("aud-signals-list");
    if (sigBox) {
      sigBox.innerHTML = audAnalysis.signals
        .map((s) => `<span class="status-pill neutral">✓ ${s}</span>`)
        .join("");
    }
    const painBox = document.getElementById("aud-painpoints-list");
    if (painBox) {
      painBox.innerHTML = audAnalysis.painPoints
        .map((p) => `<div class="heading-node"><span class="h-tag h-level-2">Q</span><span>${p}</span></div>`)
        .join("");
    }
    const gapBox = document.getElementById("aud-gaps-list");
    if (gapBox) {
      gapBox.innerHTML = audAnalysis.gaps
        .map((g) => `<div class="heading-node"><span class="h-tag h-level-3">GAP</span><span>${g}</span></div>`)
        .join("");
    }

    // TAB: Content & Headings
    document.getElementById("cnt-published").textContent =
      data.publishedDate || "Not specified";
    document.getElementById("cnt-modified").textContent =
      data.modifiedDate || "Not specified";
    const estMinutes = Math.max(1, Math.ceil(data.wordCount / 220));
    document.getElementById("cnt-words").textContent =
      `${data.wordCount.toLocaleString()} words (~${estMinutes} min read)`;
    const snippetReadyCount = data.paragraphs.filter((p) => {
      const wc = p.split(/\s+/).length;
      return wc >= 40 && wc <= 60;
    }).length;
    document.getElementById("cnt-snippets").textContent =
      `${snippetReadyCount} optimal (40–60w)`;
    document.getElementById("heading-total-count").textContent = String(
      data.headings.length,
    );

    const treeEl = document.getElementById("headings-tree-list");
    treeEl.innerHTML = "";
    if (!data.headings.length) {
      treeEl.innerHTML = `<p class="text-muted">No H1–H6 headings found on this page.</p>`;
    } else {
      data.headings.forEach((h) => {
        const row = document.createElement("div");
        row.className = "heading-node";
        row.style.paddingLeft = `${Math.max(0, h.level - 1) * 14 + 6}px`;
        row.innerHTML = `<span class="h-tag h-level-${h.level}">H${h.level}</span><span>${h.text}</span>`;
        treeEl.appendChild(row);
      });
    }

    // TAB: Indexability
    document.getElementById("idx-can-rendered").textContent =
      data.canonicalRendered || "Missing";
    document.getElementById("idx-can-raw").textContent =
      data.canonicalRaw || data.canonicalRendered || "Missing";
    document.getElementById("idx-can-status").textContent =
      data.canonicalRendered === data.canonicalRaw
        ? "✓ Rendered DOM matches Raw HTML"
        : "⚠ Modified by client-side JavaScript";
    document.getElementById("idx-meta-robots").textContent = data.robotsMeta;
    document.getElementById("idx-googlebot").textContent = data.googlebotMeta;

    let origin = "https://doitwithai.tools";
    try {
      origin = new URL(data.url).origin;
    } catch {}
    const robUrl = `${origin}/robots.txt`;
    const siteUrl = `${origin}/sitemap.xml`;
    const llmsUrl = `${origin}/llms.txt`;
    const robEl = document.getElementById("idx-robots-url");
    robEl.textContent = robUrl;
    robEl.href = robUrl;
    const smEl = document.getElementById("idx-sitemap-url");
    smEl.textContent = siteUrl;
    smEl.href = siteUrl;
    const llmsEl = document.getElementById("idx-llms-url");
    llmsEl.textContent = llmsUrl;
    llmsEl.href = llmsUrl;

    const hreflangBox = document.getElementById("idx-hreflang-list");
    if (!data.hreflangs || !data.hreflangs.length) {
      hreflangBox.innerHTML = `<span class="text-muted">No hreflang annotations detected on this page.</span>`;
    } else {
      hreflangBox.innerHTML = data.hreflangs
        .map((h) => `<div><strong>${h.lang}:</strong> ${h.href}</div>`)
        .join("");
    }

    // TAB: Schema
    const schemaBox = document.getElementById("schema-cards-container");
    schemaBox.innerHTML = "";
    if (!data.schemas.length) {
      schemaBox.innerHTML = `<div class="info-card"><p class="text-muted">No JSON-LD structured data detected. Click "Open Schema Validator" above to generate Article or FAQPage schema.</p></div>`;
    } else {
      data.schemas.forEach((sc, idx) => {
        const details = document.createElement("details");
        details.className = "schema-card";
        if (idx === 0) details.open = true;
        details.innerHTML = `<summary><span>${sc.type} Schema Entity</span><span>▾</span></summary><pre>${JSON.stringify(
          sc.raw,
          null,
          2,
        )}</pre>`;
        schemaBox.appendChild(details);
      });
    }

    // TAB: Links & Vetting
    document.getElementById("lnk-vetting-score").textContent = `${scores.vetting} / 100`;
    document.getElementById("lnk-dofollow-count").textContent = String(
      data.links.filter((l) => l.rel === "dofollow").length,
    );
    document.getElementById("lnk-nofollow-count").textContent = String(
      data.links.filter((l) => l.rel !== "dofollow").length,
    );
    document.getElementById("lnk-generic-count").textContent = String(
      data.links.filter((l) => l.anchorType === "Generic").length,
    );
    renderLinksList();

    // TAB: Images & Bulk .ZIP Studio Link
    const bulkZipBtn = document.getElementById("btn-open-bulk-zip-studio");
    if (bulkZipBtn) {
      bulkZipBtn.href = `https://doitwithai.tools/tools/webpage-image-extractor?url=${encodeURIComponent(data.url || "")}`;
    }
    renderImagesList();

    // TAB: Convert Page, YouTube Detection & Audio Studio
        const isYtPage = /(?:youtube\.com\/(?:watch|shorts)|youtu\.be\/)/i.test(data.url || "");
    const ytNavBtn = document.getElementById("nav-item-youtube");
    if (ytNavBtn) {
      ytNavBtn.classList.toggle("hidden", !isYtPage);
    }
    if (isYtPage) {
      const encYtUrl = encodeURIComponent(data.url || "");
      const setHref = (id, path) => {
        const el = document.getElementById(id);
        if (el) el.href = `https://doitwithai.tools/tools/${path}?url=${encYtUrl}`;
      };
      setHref("btn-yt-open-web-studio", "youtube-transcript-generator");
      setHref("yt-quick-srt", "youtube-transcript-generator");
      setHref("yt-quick-blog", "video-transcript-to-blog");
      setHref("yt-quick-short", "short-form-video-script-generator");
      setHref("yt-quick-thumb", "social-media-video-thumbnail-grabber");

      currentYoutubePack = buildFallbackYoutubePack(data);
      renderYoutubeStudioContent();

      if (!hasAutoSwitchedYoutube) {
        hasAutoSwitchedYoutube = true;
        document.querySelectorAll("#main-nav .nav-item").forEach((b) => b.classList.remove("active"));
        document.querySelectorAll(".tab-pane").forEach((p) => p.classList.remove("active"));
        ytNavBtn?.classList.add("active");
        document.getElementById("tab-youtube")?.classList.add("active");
      }

      resolveTargetTab((tab) => {
        if (tab && tab.id && chrome.tabs && chrome.tabs.sendMessage) {
          chrome.tabs.sendMessage(tab.id, { type: "GET_YOUTUBE_VIDEO_PACK" }, (resp) => {
            if (!chrome.runtime.lastError && resp && resp.ok && resp.pack) {
              currentYoutubePack = resp.pack;
              renderYoutubeStudioContent();
            }
          });
        }
      });
    }

    const ytBanner = document.getElementById("youtube-detected-banner");
    if (ytBanner) {
      ytBanner.classList.toggle("hidden", !isYtPage);
      if (isYtPage) {
        const encYt = encodeURIComponent(data.url || "");
        document.getElementById("yt-banner-title").textContent = data.title || "YouTube Video";
        document.getElementById("yt-btn-transcript").href = `https://doitwithai.tools/tools/youtube-transcript-generator?url=${encYt}`;
        document.getElementById("yt-btn-thumbnails").href = `https://doitwithai.tools/tools/social-media-video-thumbnail-grabber?url=${encYt}`;
        document.getElementById("yt-btn-blog").href = `https://doitwithai.tools/tools/video-transcript-to-blog?url=${encYt}`;
      }
    }

    document.getElementById("conv-article-title").textContent =
      data.title || "Current Article";
    const audioMetaEl = document.getElementById("conv-audio-meta");
    if (audioMetaEl) {
      audioMetaEl.textContent = `${data.wordCount.toLocaleString()} words · ~${estMinutes} min audio`;
    }
    const mp3StudioLink = document.getElementById("btn-open-mp3-studio");
    if (mp3StudioLink) {
      mp3StudioLink.href = `https://doitwithai.tools/tools/article-to-mp3?url=${encodeURIComponent(data.url || "")}`;
    }
    renderStudioLinks(data.url);

    // TAB: Social Previews & 6-Platform Posts
    const liCommentBtn = document.getElementById("btn-open-li-comment-studio");
    if (liCommentBtn) {
      liCommentBtn.href = `https://doitwithai.tools/tools/linkedin-comment-generator?text=${encodeURIComponent((data.title + "\n\n" + (data.paragraphs[0] || data.description || "")).slice(0, 900))}`;
    }

    document.getElementById("og-domain").textContent = data.domain;
    document.getElementById("og-title").textContent = data.og.title || data.title;
    document.getElementById("og-desc").textContent =
      data.og.description || data.description;
    const ogImg = document.getElementById("og-img-preview");
    const ogFallback = document.getElementById("og-img-fallback");
    if (data.og.image) {
      ogImg.src = data.og.image;
      ogImg.classList.remove("hidden");
      ogFallback.classList.add("hidden");
    } else {
      ogImg.classList.add("hidden");
      ogFallback.classList.remove("hidden");
    }

    document.getElementById("tw-card-type").textContent =
      `${data.twitter.card} · ${data.domain}`;
    document.getElementById("tw-title").textContent =
      data.twitter.title || data.title;
    document.getElementById("tw-desc").textContent =
      data.twitter.description || data.description;
    const twImg = document.getElementById("tw-img-preview");
    const twFallback = document.getElementById("tw-img-fallback");
    if (data.twitter.image) {
      twImg.src = data.twitter.image;
      twImg.classList.remove("hidden");
      twFallback.classList.add("hidden");
    } else {
      twImg.classList.add("hidden");
      twFallback.classList.remove("hidden");
    }

    updateSocialPostTextarea();
  }

  function renderKeywordsTable() {
    if (!currentPageData || !currentPageData._kwAnalysis) return;
    const all = currentPageData._kwAnalysis.keywords;
    const filtered = all.filter((k) => {
      if (activeNgramFilter === "all") return true;
      return String(k.ngramSize) === activeNgramFilter;
    });

    const box = document.getElementById("keywords-table-container");
    if (!box) return;
    box.innerHTML = "";
    if (!filtered.length) {
      box.innerHTML = `<p class="text-muted">No keywords match this N-gram filter.</p>`;
      return;
    }

    filtered.slice(0, 15).forEach((item) => {
      const row = document.createElement("div");
      row.className = "item-row";
      const zoneBadges = item.zones.length
        ? item.zones.map((z) => `<span class="status-pill">${z}</span>`).join("")
        : `<span class="status-pill neutral">Body</span>`;
      row.innerHTML = `
        <div style="min-width:0;flex:1">
          <div class="item-title">${item.phrase}</div>
          <div class="text-muted">${item.count} occurrences · ${item.density}% density</div>
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;flex-shrink:0">
          ${zoneBadges}
        </div>
      `;
      box.appendChild(row);
    });
  }

  function renderSubTopicsList() {
    if (!currentPageData || !currentPageData._kwAnalysis) return;
    const subs = currentPageData._kwAnalysis.subTopics;
    const box = document.getElementById("kw-subtopics-list");
    if (!box) return;
    box.innerHTML = "";
    if (!subs.length) {
      box.innerHTML = `<p class="text-muted">Single-topic page (no H2 sub-sections detected).</p>`;
      return;
    }
    const encUrl = encodeURIComponent(currentPageData.url || "");
    subs.forEach((st) => {
      const row = document.createElement("div");
      row.className = "item-row";
      row.innerHTML = `
        <div style="min-width:0;flex:1">
          <div class="item-title">Topic ${st.index}: ${st.title}</div>
          <div class="text-muted">${st.summary.slice(0, 105)}...</div>
        </div>
        <div style="display:flex;gap:5px;flex-shrink:0">
          <a href="https://doitwithai.tools/tools/social-thread-generator?url=${encUrl}" target="_blank" rel="noopener noreferrer" class="btn-secondary btn-xs">
            Repurpose ↗
          </a>
        </div>
      `;
      box.appendChild(row);
    });
  }

  function renderLinksList() {
    if (!currentPageData) return;
    const q = (
      document.getElementById("link-search-input")?.value || ""
    ).toLowerCase();
    const list = currentPageData.links.filter((l) => {
      if (activeLinkFilter === "dofollow" && l.rel !== "dofollow") return false;
      if (activeLinkFilter === "nofollow" && l.rel === "dofollow") return false;
      if (activeLinkFilter === "external" && !l.isExternal) return false;
      if (activeLinkFilter === "internal" && l.isExternal) return false;
      if (
        q &&
        !l.anchor.toLowerCase().includes(q) &&
        !l.href.toLowerCase().includes(q)
      )
        return false;
      return true;
    });

    const box = document.getElementById("links-table-container");
    box.innerHTML = "";
    if (!list.length) {
      box.innerHTML = `<p class="text-muted">No links match the selected filter.</p>`;
      return;
    }
    list.slice(0, 120).forEach((l) => {
      const row = document.createElement("div");
      row.className = "item-row";
      const badgeClass = l.rel === "dofollow" ? "" : "warn";
      row.innerHTML = `
        <div style="min-width:0;flex:1">
          <div class="item-title">${l.anchor}</div>
          <a href="${l.href}" target="_blank" rel="noopener noreferrer" class="mono-link">${l.href}</a>
        </div>
        <div style="display:flex;gap:5px;flex-shrink:0">
          <span class="status-pill neutral">${l.anchorType}</span>
          <span class="status-pill ${badgeClass}">${l.rel.toUpperCase()}</span>
        </div>
      `;
      box.appendChild(row);
    });
  }

  function renderImagesList() {
    if (!currentPageData) return;
    const list = currentPageData.images.filter((img) => {
      if (activeImgFilter === "missing") return !img.alt;
      if (activeImgFilter === "valid") return !!img.alt;
      return true;
    });

    const box = document.getElementById("images-list-container");
    box.innerHTML = "";
    if (!list.length) {
      box.innerHTML = `<p class="text-muted">No images match the selected filter.</p>`;
      return;
    }
    list.forEach((img) => {
      const row = document.createElement("div");
      row.className = "item-row";
      row.innerHTML = `
        <img src="${img.src}" alt="" class="media-thumb" />
        <div style="min-width:0;flex:1">
          <div class="item-title">${
            img.alt
              ? img.alt
              : '<span class="status-pill bad">⚠ Missing Alt Text</span>'
          }</div>
          <a href="${img.src}" target="_blank" rel="noopener noreferrer" class="mono-link">${img.src}</a>
          <div class="text-muted" style="margin-top:2px">${img.width} × ${img.height}px</div>
        </div>
      `;
      box.appendChild(row);
    });
  }

  // Realistic Colorful Brand SVG Studio Cards for Pillar 2 (Convert Page & Cloud Studios)
  function renderStudioLinks(pageUrl) {
    const enc = encodeURIComponent(pageUrl || "");
    const studios = [
      {
        name: "AI Blog to Infographic",
        desc: "8 editable infographic templates, PNG/SVG/PDF & SEO embed",
        slug: "blog-to-infographic-generator",
        tone: "icon-rose",
        tag: "INFOGRAPHIC",
        svg: `<svg viewBox="0 0 32 32" width="24" height="24" fill="none"><rect x="4" y="3" width="24" height="26" rx="5" fill="#FF6B35"/><rect x="8" y="7" width="16" height="3.5" rx="1.5" fill="#FFFFFF"/><circle cx="10.5" cy="15" r="2.2" fill="#FFFFFF"/><rect x="14.5" y="13.5" width="9.5" height="3" rx="1.2" fill="#FFE4D6"/><circle cx="10.5" cy="21.5" r="2.2" fill="#FFFFFF"/><rect x="14.5" y="20" width="9.5" height="3" rx="1.2" fill="#FFE4D6"/></svg>`,
      },
      {
        name: "Data to Chart & KPI Card",
        desc: "Turn numbers into 1080p bar charts, donuts & KPI bento grids",
        slug: "data-to-chart-visual-card-maker",
        tone: "icon-blue",
        tag: "DATA CHART",
        svg: `<svg viewBox="0 0 32 32" width="24" height="24" fill="none"><rect x="3" y="4" width="26" height="24" rx="6" fill="#3452D1"/><rect x="8" y="16" width="3.5" height="8" rx="1.2" fill="#9AABFF"/><rect x="14.2" y="11" width="3.5" height="13" rx="1.2" fill="#FFFFFF"/><rect x="20.5" y="8" width="3.5" height="16" rx="1.2" fill="#10B981"/></svg>`,
      },
      {
        name: "2×2 Matrix, SWOT & Flywheel",
        desc: "6 consulting-grade mental model & strategy diagram templates",
        slug: "framework-matrix-diagram-builder",
        tone: "icon-indigo",
        tag: "2×2 MATRIX",
        svg: `<svg viewBox="0 0 32 32" width="24" height="24" fill="none"><rect x="3" y="3" width="26" height="26" rx="6" fill="#7C3AED"/><rect x="7" y="7" width="8" height="8" rx="2" fill="#FFFFFF"/><rect x="17" y="7" width="8" height="8" rx="2" fill="#DDD6FE"/><rect x="7" y="17" width="8" height="8" rx="2" fill="#DDD6FE"/><rect x="17" y="17" width="8" height="8" rx="2" fill="#10B981"/></svg>`,
      },
      {
        name: "Pinterest Tall Pin (1000×1500)",
        desc: "6 vertical 2:3 Pin templates + blog photo & Pinterest SEO",
        slug: "pinterest-pin-visual-generator",
        tone: "icon-rose",
        tag: "PINTEREST",
        svg: `<svg viewBox="0 0 32 32" width="24" height="24" fill="none"><circle cx="16" cy="16" r="13" fill="#E60023"/><path d="M16.2 8.5C11.9 8.5 9.5 11.5 9.5 14.8C9.5 16.5 10.4 18.1 11.9 18.7L12.7 17.2C12 16 11.7 15.2 11.7 14.3C11.7 12.1 13.4 10.3 16.1 10.3C18.5 10.3 20.1 11.8 20.1 14.1C20.1 16.9 18.8 19.1 17 19.1C16 19.1 15.2 18.3 15.5 17.2L16.2 14.2C16.4 13.4 15.9 12.6 15 12.6C14 12.6 13.2 13.6 13.2 15L12.1 22.3C12.9 24.2 13.6 22.9 13.9 21.8L14.5 19.5C15 20.3 16 20.9 17.2 20.9C20.6 20.9 22.9 17.8 22.9 14C22.9 10.6 20 8.5 16.2 8.5Z" fill="#FFFFFF"/></svg>`,
      },
      {
        name: "Quote & Testimonial Cards",
        desc: "Verified post screenshots, highlighter quotes & 5-star reviews",
        slug: "quote-stat-testimonial-card-studio",
        tone: "icon-amber",
        tag: "QUOTE CARD",
        svg: `<svg viewBox="0 0 32 32" width="24" height="24" fill="none"><rect x="3" y="4" width="26" height="24" rx="6" fill="#0F172A"/><path d="M10 15C10 12.2 11.8 10.4 14.5 10V12.2C13 12.5 12.4 13.4 12.4 14.6H14.5V19H10V15ZM17.5 15C17.5 12.2 19.3 10.4 22 10V12.2C20.5 12.5 19.9 13.4 19.9 14.6H22V19H17.5V15Z" fill="#FF6B35"/></svg>`,
      },
      {
        name: "YouTube Transcript & .SRT",
        desc: "Extract timestamps, chapters, summary & .SRT subtitles",
        slug: "youtube-transcript-generator",
        tone: "icon-rose",
        tag: "YOUTUBE",
        svg: `<svg viewBox="0 0 32 32" width="24" height="24" fill="none"><rect x="2" y="6" width="28" height="20" rx="6" fill="#FF0000"/><path d="M13 11.5L21 16L13 20.5V11.5Z" fill="#FFFFFF"/></svg>`,
      },
      {
        name: "Bulk Image .ZIP Downloader",
        desc: "Extract & bundle all page images into a 1-click .ZIP",
        slug: "webpage-image-extractor",
        tone: "icon-emerald",
        tag: "BULK .ZIP",
        svg: `<svg viewBox="0 0 32 32" width="24" height="24" fill="none"><rect x="3" y="5" width="26" height="22" rx="5" fill="#059669"/><circle cx="11" cy="12" r="2.5" fill="#A7F3D0"/><path d="M6 23L12.5 16.5L17 21L21 17L26 23H6Z" fill="#FFFFFF"/></svg>`,
      },
      {
        name: "LinkedIn Post & Visual Card",
        desc: "Unicode formatter, fold preview & 1080p visual card",
        slug: "linkedin-post-formatter",
        tone: "icon-blue",
        tag: "LINKEDIN",
        svg: `<svg viewBox="0 0 32 32" width="24" height="24" fill="none"><rect x="3" y="3" width="26" height="26" rx="6" fill="#0A66C2"/><circle cx="10.5" cy="10.5" r="2.1" fill="#FFFFFF"/><rect x="8.8" y="14" width="3.4" height="10" rx="1" fill="#FFFFFF"/><path d="M14.8 14H18V15.4C18.7 14.4 19.9 13.8 21.4 13.8C23.9 13.8 25.2 15.4 25.2 18.2V24H21.8V18.8C21.8 17.4 21.2 16.6 20 16.6C18.8 16.6 18.2 17.5 18.2 18.8V24H14.8V14Z" fill="#FFFFFF"/></svg>`,
      },
      {
        name: "Instagram Caption & Carousel",
        desc: "5-slide carousel copy, SEO alt text & 1080p cover",
        slug: "instagram-caption-generator",
        tone: "icon-rose",
        tag: "INSTAGRAM",
        svg: `<svg viewBox="0 0 32 32" width="24" height="24" fill="none"><rect x="3" y="3" width="26" height="26" rx="7" fill="#E1306C"/><rect x="7.5" y="7.5" width="17" height="17" rx="4.8" stroke="#FFFFFF" stroke-width="2.2"/><circle cx="16" cy="16" r="3.8" stroke="#FFFFFF" stroke-width="2.2"/><circle cx="21.3" cy="10.7" r="1.3" fill="#FFFFFF"/></svg>`,
      },
      {
        name: "Facebook Post & Visual Card",
        desc: "Zero-click posts, first-comment link & graphic card",
        slug: "facebook-post-generator",
        tone: "icon-blue",
        tag: "FACEBOOK",
        svg: `<svg viewBox="0 0 32 32" width="24" height="24" fill="none"><rect x="3" y="3" width="26" height="26" rx="13" fill="#1877F2"/><path d="M18.4 29V18.8H21.8L22.3 14.8H18.4V12.3C18.4 11.1 18.8 10.3 20.4 10.3H22.5V6.7C22.1 6.6 20.9 6.5 19.4 6.5C16.3 6.5 14.2 8.4 14.2 11.9V14.8H10.8V18.8H14.2V29H18.4Z" fill="#FFFFFF"/></svg>`,
      },
      {
        name: "TikTok Script & SEO Studio",
        desc: "3-second visual hooks, teleprompter beats & SEO tags",
        slug: "tiktok-script-caption-generator",
        tone: "icon-cyan",
        tag: "TIKTOK",
        svg: `<svg viewBox="0 0 32 32" width="24" height="24" fill="none"><rect x="3" y="3" width="26" height="26" rx="7" fill="#0F172A"/><path d="M19.5 8.5C20.2 10.5 21.7 11.8 23.8 12.1V15.1C22.2 15.1 20.8 14.6 19.6 13.7V19.6C19.6 22.7 17.1 25.1 14 25.1C10.9 25.1 8.5 22.7 8.5 19.6C8.5 16.5 10.9 14.1 14 14.1C14.4 14.1 14.8 14.1 15.1 14.2V17.4C14.8 17.3 14.4 17.2 14 17.2C12.7 17.2 11.6 18.3 11.6 19.6C11.6 20.9 12.7 22 14 22C15.3 22 16.5 20.9 16.5 19.6V8.5H19.5Z" fill="#25F4EE"/></svg>`,
      },
      {
        name: "4K Video Thumbnail Grabber",
        desc: "Download maxres 4K covers & storyboard frames (.ZIP)",
        slug: "social-media-video-thumbnail-grabber",
        tone: "icon-amber",
        tag: "4K COVERS",
        svg: `<svg viewBox="0 0 32 32" width="24" height="24" fill="none"><rect x="3" y="5" width="26" height="22" rx="5" fill="#D97706"/><polygon points="13,11 21,16 13,21" fill="#FFFFFF"/></svg>`,
      },
      {
        name: "HTML Cheatsheet Studio",
        desc: "1-page visual executive summary & printable cheatsheet",
        slug: "article-to-html-cheatsheet",
        tone: "icon-indigo",
        tag: "HTML",
        svg: `<svg viewBox="0 0 32 32" width="24" height="24" fill="none"><rect x="4" y="4" width="24" height="24" rx="5" fill="#4F46E5"/><rect x="8" y="8" width="16" height="4" rx="1.5" fill="#FFFFFF"/><rect x="8" y="14" width="7" height="10" rx="1.5" fill="#A5B4FC"/><rect x="17" y="14" width="7" height="10" rx="1.5" fill="#FFFFFF"/></svg>`,
      },
    ];
    const container = document.getElementById("conversion-studio-links");
    if (!container) return;
    container.innerHTML = studios
      .map(
        (s) => `
        <a href="https://doitwithai.tools/tools/${s.slug}?url=${enc}" target="_blank" rel="noopener noreferrer" class="action-tile">
          <span class="tile-icon ${s.tone}" aria-hidden="true">${s.svg}</span>
          <div class="tile-body">
            <div class="tile-title-row">
              <strong>${s.name} ↗</strong>
              <span class="format-tag tag-blue">${s.tag}</span>
            </div>
            <span>${s.desc}</span>
          </div>
        </a>
      `,
      )
      .join("");
  }

  function updateSocialPostTextarea() {
    if (!currentPageData) return;
    const text = generateSocialPost(
      currentPageData,
      activeSocialPlatform,
      activeSocialAngle,
    );
    const area = document.getElementById("social-post-output");
    if (area) area.value = text;
    const counter = document.getElementById("social-char-counter");
    if (counter) {
      counter.textContent = `${text.length} characters · ${activeSocialPlatform}`;
    }
  }

  function buildArticleMarkdown(data) {
    const lines = [
      "---",
      `title: "${(data.title || "").replace(/"/g, '\\"')}"`,
      `source: "${data.url}"`,
      `date: "${data.publishedDate || new Date().toISOString().slice(0, 10)}"`,
      `focus_keyword: "${data._kwAnalysis?.primaryPhrase || ""}"`,
      `target_audience: "${data._audAnalysis?.persona || ""}"`,
      "---",
      "",
      `# ${data.title}`,
      "",
    ];
    if (data.description) {
      lines.push(`> ${data.description}`, "");
    }
    data.headings.forEach((h, idx) => {
      if (h.level > 1) {
        lines.push(`${"#".repeat(h.level)} ${h.text}`, "");
      }
      if (data.paragraphs[idx]) {
        lines.push(data.paragraphs[idx], "");
      }
    });
    data.paragraphs.slice(data.headings.length).forEach((p) => {
      lines.push(p, "");
    });
    return lines.join("\n");
  }

  function triggerDownload(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function resolveTargetTab(callback) {
    const params = new URLSearchParams(window.location.search);
    const explicitTabId = Number(params.get("tabId") || 0);
    if (explicitTabId && chrome.tabs && chrome.tabs.get) {
      chrome.tabs.get(explicitTabId, (tab) => {
        if (!chrome.runtime.lastError && tab && /^https?:/i.test(tab.url || "")) {
          callback(tab);
          return;
        }
        queryNormalWindowTab(callback);
      });
      return;
    }
    queryNormalWindowTab(callback);
  }

  function queryNormalWindowTab(callback) {
    chrome.tabs.query({ active: true, windowType: "normal" }, (tabs) => {
      const valid = (tabs || []).find((t) => t.id && /^https?:/i.test(t.url || ""));
      if (valid) {
        callback(valid);
        return;
      }
      chrome.tabs.query({ active: true, currentWindow: true }, (curTabs) => {
        callback((curTabs && curTabs[0]) || null);
      });
    });
  }

  function scanActiveTab() {
    if (
      typeof chrome === "undefined" ||
      !chrome.tabs ||
      !chrome.scripting
    ) {
      renderAll(DEMO_PAGE_DATA);
      return;
    }

    resolveTargetTab((tab) => {
      if (!tab || !tab.id || !tab.url || !/^https?:/i.test(tab.url)) {
        renderAll(DEMO_PAGE_DATA);
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: extractPageDomSnapshot,
        },
        (results) => {
          if (
            chrome.runtime.lastError ||
            !results ||
            !results[0] ||
            !results[0].result
          ) {
            renderAll(DEMO_PAGE_DATA);
            return;
          }
          const snap = results[0].result;
          renderAll(snap);
        },
      );
    });
  }

  function togglePageOverlay(mode, enabled) {
    if (typeof chrome === "undefined" || !chrome.tabs || !chrome.scripting) {
      showToast("Live page overlay is active when running on a webpage tab.");
      return;
    }
    resolveTargetTab((tab) => {
      if (!tab || !tab.id || !/^https?:/i.test(tab.url || "")) return;
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [mode, enabled],
        func: (overlayMode, isOn) => {
          const styleId = `diwat-overlay-${overlayMode}`;
          const existing = document.getElementById(styleId);
          if (existing) existing.remove();
          if (!isOn) return;
          const style = document.createElement("style");
          style.id = styleId;
          if (overlayMode === "links") {
            style.textContent = `
              a[rel*="nofollow"] { outline: 2px dashed #f59e0b !important; background: rgba(245,158,11,0.12) !important; }
              a[href]:not([rel*="nofollow"]) { outline: 2px solid #10b981 !important; }
            `;
          } else if (overlayMode === "headings") {
            style.textContent = `
              h1, h2, h3, h4, h5, h6 { position: relative !important; outline: 1px dashed #3b63fb !important; }
              h1::before { content: "H1"; background:#3b63fb; color:#fff; font-size:10px; font-weight:800; padding:2px 5px; margin-right:6px; border-radius:4px; }
              h2::before { content: "H2"; background:#0ea5e9; color:#fff; font-size:10px; font-weight:800; padding:2px 5px; margin-right:6px; border-radius:4px; }
              h3::before { content: "H3"; background:#10b981; color:#fff; font-size:10px; font-weight:800; padding:2px 5px; margin-right:6px; border-radius:4px; }
            `;
          }
          document.head.appendChild(style);
        },
      });
    });
  }

  function triggerAutoFitSplitView() {
    if (typeof chrome !== "undefined" && chrome.windows && chrome.runtime) {
      resolveTargetTab((tab) => {
        const winId = (tab && tab.windowId) || undefined;
        const tabId = (tab && tab.id) || "";
        const sendSplit = (resolvedWinId) => {
          chrome.runtime.sendMessage(
            {
              type: "OPEN_SPLIT_VIEW",
              windowId: resolvedWinId,
              tabId,
              screenWidth: window.screen?.availWidth || 1440,
              screenHeight: window.screen?.availHeight || 900,
            },
            () => window.close(),
          );
        };
        if (winId) {
          sendSplit(winId);
        } else {
          chrome.windows.getCurrent((win) => sendSplit(win.id));
        }
      });
    } else {
      showToast("Split-screen auto-fit is available inside Google Chrome.");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const search = window.location.search;
    if (search.includes("mode=sidepanel")) {
      document.documentElement.setAttribute("data-view", "sidepanel");
    } else if (search.includes("mode=split")) {
      document.documentElement.setAttribute("data-view", "split");
    }

    // Sidebar tab navigation
    document.querySelectorAll("#main-nav .nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll("#main-nav .nav-item")
          .forEach((b) => b.classList.remove("active"));
        document
          .querySelectorAll(".tab-pane")
          .forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        const tabId = btn.getAttribute("data-tab");
        document.getElementById(`tab-${tabId}`)?.classList.add("active");
      });
    });

    // Theme toggle
    document.getElementById("btn-theme-toggle")?.addEventListener("click", () => {
      const html = document.documentElement;
      const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", next);
    });

    // SidePanel dock
    document.getElementById("btn-sidepanel")?.addEventListener("click", () => {
      if (typeof chrome !== "undefined" && chrome.windows && chrome.runtime) {
        chrome.windows.getCurrent((win) => {
          chrome.runtime.sendMessage(
            { type: "OPEN_SIDE_PANEL", windowId: win.id },
            () => window.close(),
          );
        });
      } else {
        showToast("Side Panel docking is ready inside Google Chrome.");
      }
    });

    // Auto-Fit Split View
    document
      .getElementById("btn-splitview")
      ?.addEventListener("click", triggerAutoFitSplitView);
    document
      .getElementById("btn-expand-split-inline")
      ?.addEventListener("click", triggerAutoFitSplitView);

    // Rescan & Export Report
    document.getElementById("btn-rescan")?.addEventListener("click", () => {
      scanActiveTab();
      showToast("Rescanned active tab DOM.");
    });

    document.getElementById("btn-export-report")?.addEventListener("click", () => {
      if (!currentPageData) return;
      const md = buildArticleMarkdown(currentPageData);
      triggerDownload(md, "seo-content-audit-report.md", "text/markdown;charset=utf-8");
      showToast("Downloaded full Markdown audit report.");
    });

    // Keyword N-Gram filter pills, Copy & CSV Export
    document.querySelectorAll("#kw-ngram-pills .filter-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll("#kw-ngram-pills .filter-pill")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeNgramFilter = btn.getAttribute("data-ngram") || "all";
        renderKeywordsTable();
      });
    });

    document.getElementById("btn-copy-keywords")?.addEventListener("click", async () => {
      if (!currentPageData?._kwAnalysis) return;
      const list = currentPageData._kwAnalysis.keywords
        .map((k) => `${k.phrase} (${k.count}x · ${k.density}%)`)
        .join("\n");
      await navigator.clipboard.writeText(list);
      showToast("Copied top focus keywords to clipboard!");
    });

    document.getElementById("btn-export-keywords")?.addEventListener("click", () => {
      if (!currentPageData?._kwAnalysis) return;
      const rows = [
        '"Keyword Phrase","N-Gram Words","Occurrences","Density %","Placement Zones"',
        ...currentPageData._kwAnalysis.keywords.map(
          (k) =>
            `"${k.phrase.replace(/"/g, '""')}","${k.ngramSize}","${k.count}","${k.density}%","${k.zones.join(" | ") || "Body"}"`,
        ),
      ].join("\r\n");
      triggerDownload(rows, "competitor-keywords-audit.csv", "text/csv;charset=utf-8");
      showToast("Exported competitor keywords (.CSV)!");
    });

    // Copy Headings & Build TOC
    document.getElementById("btn-copy-headings")?.addEventListener("click", async () => {
      if (!currentPageData) return;
      const text = currentPageData.headings
        .map((h) => `${"  ".repeat(Math.max(0, h.level - 1))}H${h.level}: ${h.text}`)
        .join("\n");
      await navigator.clipboard.writeText(text);
      showToast("Copied hierarchical H1–H6 outline to clipboard.");
    });

    document.getElementById("btn-build-toc")?.addEventListener("click", () => {
      if (!currentPageData) return;
      const box = document.getElementById("toc-generator-box");
      const out = document.getElementById("toc-html-output");
      out.textContent = buildTocHtml(currentPageData.headings);
      box.classList.toggle("hidden");
    });

    document.getElementById("btn-copy-toc-html")?.addEventListener("click", async () => {
      const code = document.getElementById("toc-html-output")?.textContent || "";
      await navigator.clipboard.writeText(code);
      showToast("Copied crawlable <nav> TOC HTML to clipboard.");
    });

    // Link filters & CSV export
    document.querySelectorAll("#link-filter-pills .filter-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll("#link-filter-pills .filter-pill")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeLinkFilter = btn.getAttribute("data-filter") || "all";
        renderLinksList();
      });
    });

    document
      .getElementById("link-search-input")
      ?.addEventListener("input", renderLinksList);

    document.getElementById("btn-export-links")?.addEventListener("click", () => {
      if (!currentPageData) return;
      const rows = [
        '"Anchor Text","Target URL","Rel","Scope","Anchor Type"',
        ...currentPageData.links.map(
          (l) =>
            `"${l.anchor.replace(/"/g, '""')}","${l.href}","${l.rel}","${
              l.isExternal ? "External" : "Internal"
            }","${l.anchorType}"`,
        ),
      ].join("\r\n");
      triggerDownload(rows, "page-links-audit.csv", "text/csv;charset=utf-8");
      showToast("Exported links audit CSV.");
    });

    // Image filters & CSV export
    document.querySelectorAll("#img-filter-pills .filter-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll("#img-filter-pills .filter-pill")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeImgFilter = btn.getAttribute("data-filter") || "all";
        renderImagesList();
      });
    });

    document.getElementById("btn-export-images")?.addEventListener("click", () => {
      if (!currentPageData) return;
      const rows = [
        '"Image URL","Alt Text","Width","Height","Status"',
        ...currentPageData.images.map(
          (i) =>
            `"${i.src}","${(i.alt || "").replace(/"/g, '""')}","${i.width}","${
              i.height
            }","${i.alt ? "OK" : "MISSING_ALT"}"`,
        ),
      ].join("\r\n");
      triggerDownload(rows, "page-images-alt-audit.csv", "text/csv;charset=utf-8");
      showToast("Exported images & alt text CSV.");
    });

    // Convert Page actions (Markdown, Word, TXT, PDF, TTS Audio)
    document.getElementById("btn-dl-markdown")?.addEventListener("click", () => {
      if (!currentPageData) return;
      triggerDownload(
        buildArticleMarkdown(currentPageData),
        "article-export.md",
        "text/markdown;charset=utf-8",
      );
      showToast("Downloaded clean Markdown (.md) file.");
    });

    document.getElementById("btn-dl-doc")?.addEventListener("click", () => {
      if (!currentPageData) return;
      const htmlDoc = `<!doctype html><html><head><meta charset="utf-8"><title>${currentPageData.title}</title></head><body style="font-family:Calibri,Arial,sans-serif;line-height:1.6"><h1>${currentPageData.title}</h1><p><strong>Source:</strong> <a href="${currentPageData.url}">${currentPageData.url}</a></p>${currentPageData.paragraphs.map((p) => `<p>${p}</p>`).join("")}</body></html>`;
      triggerDownload(
        htmlDoc,
        "article-reading-copy.doc",
        "application/msword;charset=utf-8",
      );
      showToast("Downloaded editable Word (.doc) document.");
    });

    document.getElementById("btn-dl-txt")?.addEventListener("click", () => {
      if (!currentPageData) return;
      const txt = `${currentPageData.title}\nSource: ${currentPageData.url}\n\n${currentPageData.paragraphs.join("\n\n")}`;
      triggerDownload(txt, "article-transcript.txt", "text/plain;charset=utf-8");
      showToast("Downloaded clean text (.txt) file.");
    });

    document.getElementById("btn-print-pdf")?.addEventListener("click", () => {
      if (!currentPageData) return;
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(
          `<!doctype html><html><head><title>${currentPageData.title}</title><style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;line-height:1.7;color:#111}h1{font-family:sans-serif}p{margin:14px 0}</style></head><body><h1>${currentPageData.title}</h1><p><small>Source: ${currentPageData.url}</small></p>${currentPageData.paragraphs.map((p) => `<p>${p}</p>`).join("")}<script>window.onload=()=>{window.print();}</script></body></html>`,
        );
        w.document.close();
      }
    });

    // Built-in TTS Read Aloud
    document.getElementById("btn-tts-play")?.addEventListener("click", () => {
      if (!currentPageData || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const text = `${currentPageData.title}. ${currentPageData.paragraphs.slice(0, 12).join(" ")}`;
      const utter = new SpeechSynthesisUtterance(text);
      const rate = parseFloat(document.getElementById("tts-rate")?.value || "1");
      utter.rate = Number.isFinite(rate) ? rate : 1;
      window.speechSynthesis.speak(utter);
      showToast("Reading article aloud…");
    });

    document.getElementById("btn-tts-stop")?.addEventListener("click", () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        showToast("Stopped audio playback.");
      }
    });

    // Social platform & angle switches
    document.querySelectorAll("#social-platform-pills .filter-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll("#social-platform-pills .filter-pill")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeSocialPlatform = btn.getAttribute("data-platform") || "LinkedIn";
        updateSocialPostTextarea();
      });
    });

    document.querySelectorAll("#social-angle-pills .filter-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll("#social-angle-pills .filter-pill")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeSocialAngle = Number(btn.getAttribute("data-angle") || "0");
        updateSocialPostTextarea();
      });
    });

    document.getElementById("btn-copy-social-post")?.addEventListener("click", async () => {
      const val = document.getElementById("social-post-output")?.value || "";
      await navigator.clipboard.writeText(val);
      showToast(`Copied ${activeSocialPlatform} post to clipboard!`);
    });

    document.getElementById("btn-share-social-direct")?.addEventListener("click", async () => {
      const val = document.getElementById("social-post-output")?.value || "";
      await navigator.clipboard.writeText(val);
      const enc = encodeURIComponent(val.slice(0, 1200));
      let shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${enc}`;
      if (activeSocialPlatform === "X") {
        shareUrl = `https://twitter.com/intent/tweet?text=${enc}`;
      } else if (activeSocialPlatform === "Facebook") {
        shareUrl = `https://www.facebook.com/sharer/sharer.php?quote=${enc}`;
      }
      window.open(shareUrl, "_blank", "noopener,noreferrer");
      showToast(`Copied ${activeSocialPlatform} text & opened composer!`);
    });

    // Live page overlay toggles
    document
      .getElementById("toggle-highlight-links")
      ?.addEventListener("change", (e) => {
        togglePageOverlay("links", e.target.checked);
      });

    document
      .getElementById("toggle-highlight-headings")
      ?.addEventListener("change", (e) => {
        togglePageOverlay("headings", e.target.checked);
      });

    
    // YouTube Studio Subtabs & Copy
    document.querySelectorAll("#yt-studio-subtabs .filter-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#yt-studio-subtabs .filter-pill").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeYtSubTab = btn.getAttribute("data-yt-sub") || "transcript";
        renderYoutubeStudioContent();
      });
    });

    document.getElementById("btn-yt-copy-current")?.addEventListener("click", async () => {
      const box = document.getElementById("yt-studio-content-box");
      const text = (box?.innerText || "").trim();
      if (!text) return;
      await navigator.clipboard.writeText(text);
      showToast(`Copied YouTube ${activeYtSubTab} to clipboard!`);
    });

    // Social AI Post Polisher buttons
    document.querySelectorAll("#social-polisher-pills .filter-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        const act = btn.getAttribute("data-polish-action") || "hook";
        polishSocialTextareaContent(act);
      });
    });

    // Initial scan
    scanActiveTab();
  });
})();
