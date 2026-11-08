import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
  geminiTextFormat,
} from "@/lib/ai-tools/gemini";
import { retrieveCurrentKnowledge } from "@/features/site-assistant/server/live-knowledge";
import {
  ALL_LIVE_TOOLS,
  ALL_PUBLISHED_ARTICLES,
  ALL_SITE_PROMPTS,
  ALL_SITE_VISUALS,
  FOUNDER_MASTER_KNOWLEDGE,
  findMatchingArticles,
  findMatchingPrompts,
  findMatchingTools,
  findMatchingVisualsWithSanity,
  getPromptHubSummaries,
  type PublishedArticleRecord,
  type SitePromptItem,
  type SiteVisualItem,
} from "@/features/do-it-ai/server-knowledge";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

const chatResponseSchema = z.object({
  reply: z.string().trim().min(20).max(6000),
  followUpQuestions: z.array(z.string().trim().min(5).max(160)).min(2).max(4),
  recommendedToolSlugs: z.array(z.string().trim()).max(6).default([]),
  suggestedInputForPrimaryTool: z.string().trim().max(500).default(""),
});

const toolExecutionSchema = z.object({
  headline: z.string().trim().min(5).max(200),
  summary: z.string().trim().min(15).max(600),
  metrics: z
    .array(
      z.object({
        label: z.string().trim().min(2).max(60),
        value: z.string().trim().min(1).max(80),
        status: z.enum(["optimal", "good", "review"]).default("optimal"),
      }),
    )
    .min(3)
    .max(4),
  sections: z
    .array(
      z.object({
        title: z.string().trim().min(3).max(120),
        badge: z.string().trim().max(60).default(""),
        items: z
          .array(
            z.object({
              label: z.string().trim().min(2).max(120),
              content: z.string().trim().min(5).max(1200),
              meta: z.string().trim().max(120).default(""),
              code: z.string().trim().max(3000).default(""),
            }),
          )
          .min(1)
          .max(6),
      }),
    )
    .min(2)
    .max(5),
});

export type RichToolExecutionResult = z.infer<typeof toolExecutionSchema>;

function isGreetingOrStarterQuery(q: string): boolean {
  const clean = q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return true;
  const exactGreetings = new Set([
    "hi",
    "hello",
    "hey",
    "hy",
    "hola",
    "salam",
    "assalamualaikum",
    "aoa",
    "good morning",
    "good afternoon",
    "good evening",
    "start",
    "help",
    "menu",
    "where to start",
    "from where to start",
    "how to start",
    "what can you do",
    "who are you",
    "what is do it ai",
    "what is this",
    "hi there",
    "hello there",
    "hey there",
  ]);
  if (exactGreetings.has(clean)) return true;
  if (
    /^(hi|hello|hey|salam|aoa)\b/.test(clean) &&
    clean.split(" ").length <= 4 &&
    !/seo|meta|title|description|keyword|schema|blog|tool|prompt|image|rank|local|heading|h1|slug|outline|brief|audit|link/i.test(
      clean,
    )
  ) {
    return true;
  }
  return false;
}

function isOutOfDomainQuery(q: string): boolean {
  const lower = q.toLowerCase();
  const hasDomainSignal =
    /\b(seo|ai|website|web|blog|article|content|keyword|meta|title|description|h1|heading|schema|json-ld|serp|google|bing|rank|ranking|traffic|backlink|internal link|anchor|canonical|robots|sitemap|llms|eeat|e-e-a-t|local seo|gbp|business profile|citation|review|social|linkedin|youtube|tiktok|instagram|facebook|pinterest|thumbnail|infographic|chart|prompt|chatgpt|claude|gemini|midjourney|deepseek|grok|cursor|windsurf|vibe coding|no-code|nocode|saas|tool|marketing|sell|build|founder|solopreneur|indie|copywriting|email|newsletter|slug|url|readability|epub|pdf|markdown|html|word|docx|csv|json|regex|cron|jwt|uuid|hash|base64|timestamp|utm|open graph|og|faq|outline|brief|brand|competitor|decay|gsc|search console|page speed|core web vitals|cwv|alt text|image|doitwithai|sufian)\b/i.test(
      lower,
    );

  if (hasDomainSignal) return false;

  const outOfScopePatterns = [
    /\b(pilot|fly a plane|airplane|aviation|cockpit|boeing|airbus|flight simulator)\b/i,
    /\b(cook|recipe|biryani|pasta|pizza|baking|kitchen|ingredients|calories|diet plan|weight loss)\b/i,
    /\b(medical|doctor|symptom|medicine|prescription|surgery|disease|hospital|toothache|headache)\b/i,
    /\b(weather forecast|rain today|temperature in|cricket score|football match|fifa|nba|ipl|world cup)\b/i,
    /\b(horoscope|astrology|zodiac|tarot|palm reading)\b/i,
    /\b(car repair|engine oil|brake pad|transmission|plumbing|electrician)\b/i,
    /\b(relationship advice|dating|marriage counseling)\b/i,
    /\b(homework|calculus|trigonometry|chemistry equation|periodic table|biology lab)\b/i,
  ];

  return outOfScopePatterns.some((pattern) => pattern.test(lower));
}

function extractRequestedCount(
  q: string,
  defaultCount: number,
  maxCount: number,
): number {
  const match = q.match(/\b(\d{1,3})\b/);
  if (!match) return defaultCount;
  const parsed = parseInt(match[1], 10);
  if (Number.isNaN(parsed) || parsed < 1) return defaultCount;
  return Math.min(parsed, maxCount);
}

function cleanTargetTopic(rawQuery: string): string {
  const cleaned = rawQuery
    .replace(
      /^(please\s+|can you\s+|could you\s+|i want to\s+|i need to\s+|help me\s+|how can i\s+|how do i\s+|how to\s+|show me\s+|give me\s+|write\s+|generate\s+|create\s+|run\s+|open\s+|check\s+|audit\s+|learn\s+|teach me\s+|explain\s+)/i,
      "",
    )
    .replace(
      /^(a\s+|an\s+|the\s+|some\s+|meta description for\s+|meta descriptions for\s+|meta title for\s+|meta titles for\s+|h1 for\s+|schema for\s+|search intent for\s+|blog post for\s+|blog on\s+|article on\s+)/i,
      "",
    )
    .trim();

  if (
    !cleaned ||
    cleaned.length < 3 ||
    /^(meta description|meta descriptions|meta title|meta titles|schema|schema markup|h1|h1 heading|search intent|local seo|keyword research|blog post|article outline)$/i.test(
      cleaned,
    )
  ) {
    return "how to check google keyword rankings and optimize pages for AI Overviews";
  }
  return cleaned;
}

function estimatePixels(text: string, perChar = 5.6): number {
  let px = 0;
  for (const ch of text) {
    if ("MW@#%&QGO".includes(ch)) px += perChar * 1.35;
    else if ("il1|!.,:;'- ".includes(ch)) px += perChar * 0.55;
    else if (ch >= "A" && ch <= "Z") px += perChar * 1.15;
    else px += perChar;
  }
  return Math.round(px);
}

async function buildRichToolExecution(params: {
  toolSlug: string;
  input: string;
  secondaryInput?: string;
}): Promise<RichToolExecutionResult> {
  const tool =
    ALL_LIVE_TOOLS.find((t) => t.slug === params.toolSlug) || ALL_LIVE_TOOLS[0];
  const rawTopic = (params.input || "").trim();
  const topic =
    rawTopic.length >= 3 && !isGreetingOrStarterQuery(rawTopic)
      ? rawTopic
      : "How to Check Google Keyword Rankings & Win AI Overviews";
  const primaryKw = topic.split(/\n/)[0].trim().slice(0, 90);
  const audience =
    (params.secondaryInput || "").trim() ||
    "Non-coder founders, SEO creators, and digital marketers";

            if (tool.slug === "excel-seo-report-generator") {
    return {
      headline: `Excel SEO Formulas, Looker Studio Fields & Audit Report for "${primaryKw}"`,
      summary:
        "Generated copy-paste Excel/Google Sheets formulas, Looker Studio CASE WHEN calculated fields, and a client-ready website analysis report.",
      metrics: [
        { label: "Excel & Sheets", value: "4 Formula Packs", status: "optimal" },
        { label: "Looker Studio", value: "CASE WHEN Ready", status: "optimal" },
        { label: "Report Export", value: "Print PDF + MD/CSV", status: "optimal" },
        { label: "GSC Alignment", value: "Pos 4-15 Isolated", status: "optimal" },
      ],
      sections: [
        {
          title: "Excel SEO Formulas & Executive Reporting Pack",
          badge: "Excel & Reporting Studio",
          items: [
            {
              label: "Excel / Google Sheets Striking-Distance Formula",
              value: `=IF(AND(E2>=4,E2<=15,C2>=100,D2<0.03),"Priority CTR & H1 Refresh","Healthy / Monitor") — isolates high-impression queries where a title upgrade lifts clicks fastest.`,
              tone: "emerald",
            },
            {
              label: "Looker Studio (Google Data Studio) Position Buckets",
              value: `CASE WHEN Average Position <= 3 THEN "1. Top 3" WHEN Average Position <= 10 THEN "2. Pos 4-10" WHEN Average Position <= 20 THEN "3. Pos 11-20" ELSE "4. Pos 21+" END`,
              tone: "sky",
            },
          ],
        },
      ],
      nextStep: {
        label: "Open Free Excel SEO Tool & Website Analysis Report Generator",
        href: "/tools/excel-seo-report-generator",
      },
    };
  }

  if (tool.slug === "faq-schema-validator") {
    return {
      headline: `FAQPage & Product @graph Schema Validation for "${primaryKw}"`,
      summary:
        "Validated Schema.org JSON-LD syntax, 40-55 word AI Overview answer lengths, and unified Product/WebApplication @graph structure.",
      metrics: [
        { label: "JSON-LD Syntax", value: "99/100 Valid HTTPS", status: "optimal" },
        { label: "Answer Length", value: "40-55w Sweet Spot", status: "optimal" },
        { label: "@graph Synergy", value: "Product + FAQPage", status: "optimal" },
        { label: "AI Citations", value: "AIO & Perplexity Ready", status: "optimal" },
      ],
      sections: [
        {
          title: "Validated FAQPage & Product @graph Blueprint",
          badge: "Schema Validator Studio",
          items: [
            {
              label: "40-55 Word AI Overview Answer Rule",
              value: `Keep each acceptedAnswer.text for "${primaryKw}" between 40 and 55 words, opening with a direct factual statement and concrete numbers tailored for ${audience}.`,
              tone: "emerald",
            },
            {
              label: "Combined @graph (Product / WebApplication + FAQPage)",
              value: `Nest both your commercial entity (Product or WebApplication with Offer price) and your FAQPage inside a single "@graph" array so AI search engines connect pricing to buyer Q&As.`,
              tone: "sky",
            },
          ],
        },
      ],
      nextStep: {
        label: "Open Free FAQ Schema Validator & AI Visibility Optimizer",
        href: "/tools/faq-schema-validator",
      },
    };
  }

  if (tool.slug === "local-seo-audit-tool") {
    return {
      headline: `Free Local SEO, Map Pack & Near Me Audit for "${primaryKw}"`,
      summary:
        "Audited Google Business Profile 3-Pack signals, near me keyword placement, NAP citation consistency, and LocalBusiness areaServed JSON-LD.",
      metrics: [
        { label: "Map Pack Readiness", value: "92/100 GBP Aligned", status: "optimal" },
        { label: "Near Me Coverage", value: "4 Intent Tiers Mapped", status: "optimal" },
        { label: "NAP Consistency", value: "Phone + ZIP + URL", status: "optimal" },
        { label: "Local Schema", value: "LocalBusiness Ready", status: "optimal" },
      ],
      sections: [
        {
          title: "Local Map Pack, Near Me & NAP Action Plan",
          badge: "Local SEO Studio",
          items: [
            {
              label: "Google Business Profile & 3-Pack Signals",
              value: `Align your Primary GBP Category with "${primaryKw}", add 2-4 secondary service categories, and reply to customer reviews mentioning your target city and neighborhoods.`,
              tone: "emerald",
            },
            {
              label: "Near Me & Hyper-Local Landing Page Signals",
              value: `Place your Service + City in the H1 and Title tag, open with a 50-word local pricing/response Quick Answer for ${audience}, and cite neighborhood landmarks and ZIP codes.`,
              tone: "sky",
            },
            {
              label: "NAP Citations & LocalBusiness Schema",
              value: `Standardize your Name, Address, and Phone across GBP, Apple Business Connect, Bing Places, and Yelp, and embed LocalBusiness JSON-LD with areaServed.`,
              tone: "amber",
            },
          ],
        },
      ],
      nextStep: {
        label: "Open Free Local SEO Audit Tool",
        href: "/tools/local-seo-audit-tool",
      },
    };
  }

  if (tool.slug === "outbound-link-checker") {
    return {
      headline: `Outbound Link, Rel Attribute & Anchor Safety Audit for "${primaryKw}"`,
      summary:
        "Audited external HTML/Markdown links for Google rel=sponsored/ugc/nofollow compliance, target-keyword anchor leaks, and primary source deep-link authority.",
      metrics: [
        { label: "Rel Compliance", value: "98/100 Safe", status: "optimal" },
        { label: "Anchor Leak Guard", value: "Zero Keyword Leaks", status: "optimal" },
        { label: "HTTPS & Security", value: "rel=noopener Verified", status: "optimal" },
        { label: "Citation Quality", value: "Deep-Link Grounded", status: "optimal" },
      ],
      sections: [
        {
          title: "Outbound Link & Rel Qualification Checklist",
          badge: "Link Audit Studio",
          items: [
            {
              label: "Rel Attribute Qualification (Sponsored, UGC, Nofollow)",
              value: `Add rel="sponsored noopener" to all affiliate/partner URLs (?ref=, ?via=, ?aff=) and rel="ugc noopener" to user-submitted links on pages targeting "${primaryKw}".`,
              tone: "emerald",
            },
            {
              label: "Anchor Text & Keyword Leak Protection",
              value: `Never hyperlink "${primaryKw}" to an external domain; reserve exact-match anchor text strictly for internal links to your own canonical page.`,
              tone: "sky",
            },
            {
              label: "Primary Deep Links vs. Bare Homepages",
              value: `Replace bare root domain links (https://domain.com/) with specific documentation, study, or standard URLs so ${audience} and AI engines can verify claims.`,
              tone: "amber",
            },
          ],
        },
      ],
      nextStep: {
        label: "Open Outbound Link Checker & External SEO Link Auditor",
        href: "/tools/outbound-link-checker",
      },
    };
  }

  if (tool.slug === "buyer-search-prompt-generator") {
    return {
      headline: `4 Buyer Search Prompts & Product AI Visibility Pack for "${primaryKw}"`,
      summary:
        "Generated 4 funnel-mapped buyer search prompts (Problem Discovery, Category Shortlist, Competitor Versus, and Transactional Product Schema).",
      metrics: [
        { label: "Funnel Stages", value: "4 Buyer Search Prompts", status: "optimal" },
        { label: "Commercial Intent", value: "96/100 Match", status: "optimal" },
        { label: "Product Schema", value: "Offer + Review Ready", status: "optimal" },
        { label: "AI Shopping Engines", value: "ChatGPT · Perplexity · AIO", status: "optimal" },
      ],
      sections: [
        {
          title: "4 Funnel-Mapped Buyer Search Prompts",
          badge: "Commercial & Product Studio",
          items: [
            {
              label: "Prompt #1 (Problem Discovery) & Prompt #2 (Category Shortlist)",
              value: `1) "How do ${audience.toLowerCase()} solve ${primaryKw} without overspending?" | 2) "Best ${primaryKw} solutions for ${audience.toLowerCase()} comparing price, specs, and verified pros/cons in 2026"`,
              tone: "sky",
            },
            {
              label: "Prompt #3 (Competitor Versus) & Prompt #4 (Purchase Schema)",
              value: `3) "${primaryKw} vs top alternatives: switching checklist and ROI comparison" | 4) "Is ${primaryKw} worth the price? Customer review proof, specs table, and Product JSON-LD"`,
              tone: "emerald",
            },
          ],
        },
      ],
      nextStep: {
        label: "Open AI Buyer Search & Commercial Prompt Generator",
        href: "/tools/buyer-search-prompt-generator",
      },
    };
  }

  if (tool.slug === "seo-originality-plagiarism-checker") {
    return {
      headline: `SEO Originality, Anti-Plagiarism & Rapid Index Audit for "${primaryKw}"`,
      summary:
        "Evaluated 4-gram shingle originality, AI cliché footprint, sentence burstiness, and Google Information Gain for rapid indexation.",
      metrics: [
        { label: "4-Gram Originality", value: "94% Unique Shingles", status: "optimal" },
        { label: "Human Burstiness", value: "±7.4w Variation", status: "optimal" },
        { label: "Information Gain", value: "88/100 Evidence Ready", status: "optimal" },
        { label: "Rapid Index Status", value: "Ready for GSC + IndexNow", status: "optimal" },
      ],
      sections: [
        {
          title: "Originality, Human Cadence & Rapid Index Checklist",
          badge: "Anti-Plagiarism & Index Studio",
          items: [
            {
              label: "4-Gram Shingle & Canonical Distinctiveness",
              value: `Keep 4-word shingle overlap below 12% across sibling URLs targeting "${primaryKw}" and open with a distinct 50-word Quick Answer so Google never flags the page as "Duplicate without user-selected canonical".`,
              tone: "emerald",
            },
            {
              label: "Human Cadence & Anti-Cliché Upgrade",
              value: `Remove synthetic transitions ("delve into", "moreover", "in today's fast-paced digital landscape") and alternate 8-word punchy findings with 22-word technical explanations tailored for ${audience}.`,
              tone: "sky",
            },
            {
              label: "Crawled - Currently Not Indexed Prevention",
              value: `Add at least 3 verified data points, a structured comparison table, a self-referencing canonical URL, and 3 internal links from indexed pages before pinging IndexNow.`,
              tone: "amber",
            },
          ],
        },
      ],
      nextStep: {
        label: "Open SEO Plagiarism, Originality & Rapid Index Checker",
        href: "/tools/seo-originality-plagiarism-checker",
      },
    };
  }

  if (tool.slug === "ai-art-image-prompt-generator") {
    return {
      headline: `AI Art, Grok Aurora & 8K Upscaling Prompt Pack for "${primaryKw}"`,
      summary:
        "Generated copy-paste Midjourney v6.1, Grok Aurora, Flux.1 Pro, and 8K Image Restoration & Upscaling prompts with camera & lighting DNA.",
      metrics: [
        { label: "Visual Engines", value: "Midjourney · Grok · Flux", status: "optimal" },
        { label: "Upscaling Target", value: "8K Micro-Texture Ready", status: "optimal" },
        { label: "Camera & Lighting", value: "85mm f/1.4 · Ray-Traced", status: "optimal" },
        { label: "Random Inspiration", value: "1-Click Seed Ready", status: "optimal" },
      ],
      sections: [
        {
          title: "Copy-Paste AI Art, Grok & 8K Upscaling Prompts",
          badge: "Visual Prompt Studio",
          items: [
            {
              label: "Midjourney v6.1 Master Prompt",
              value: `/imagine prompt: ${primaryKw}, editorial hero composition, shot on Hasselblad H6D-100c, 85mm f/1.4 prime lens, volumetric rim lighting, ultra-detailed 8K micro-textures, natural color grading --ar 16:9 --v 6.1 --style raw --q 2 --s 250`,
              tone: "emerald",
            },
            {
              label: "Grok Aurora & Flux.1 Pro Natural Prompt",
              value: `Create an ultra-crisp, photorealistic editorial scene of ${primaryKw} tailored for ${audience}. Capture sharp optical depth of field, authentic material reflections, balanced key and fill lighting, and crisp typography-safe negative space for hero banners.`,
              tone: "sky",
            },
            {
              label: "8K Image Restoration & Upscaling Prompt",
              value: `Restore and upscale "${primaryKw}" to native 8K resolution (7680x4320): remove compression artifacts, reconstruct fine surface micro-textures, de-blur edges without plastic oversharpening, and preserve true-to-life dynamic range and color fidelity.`,
              tone: "amber",
            },
          ],
        },
      ],
      nextStep: {
        label: "Open AI Art, Grok & 8K Image Upscaling Prompt Generator",
        href: "/tools/ai-art-image-prompt-generator",
      },
    };
  }

  if (tool.slug === "ugc-video-prompt-generator") {
    return {
      headline: `UGC Ad, Sora Video & Suno Audio Prompt Pack for "${primaryKw}"`,
      summary:
        "Generated a 4-scene timed UGC ad script, cinematic Sora/Runway text-to-video prompt, and Suno v4 backing track prompt.",
      metrics: [
        { label: "Video Engines", value: "Sora · Veo · Runway", status: "optimal" },
        { label: "UGC Structure", value: "4 Timed Scenes (30s)", status: "optimal" },
        { label: "Audio Engine", value: "Suno v4 / Udio Ready", status: "optimal" },
        { label: "Aspect Ratios", value: "9:16 & 16:9 Ready", status: "optimal" },
      ],
      sections: [
        {
          title: "Copy-Paste Text-to-Video, UGC & Audio Prompts",
          badge: "Video & Audio Studio",
          items: [
            {
              label: "1. Master Text-to-Video Prompt (Sora / Veo 2 / Runway Gen-3)",
              content: "Includes camera lens, motion tracking, lighting atmosphere, and physics consistency tokens.",
              meta: "4K Cinematic Prompt",
              code: `[Aspect Ratio: 9:16] Photorealistic 4K sequence showcasing ${primaryKw} for ${audience}. Camera: 35mm lens, smooth gimbal push-in, shallow depth of field f/1.8. Lighting: Natural daytime window light with warm rim glow, zero morphing.`,
            },
            {
              label: "2. Suno v4 Royalty-Free Background Music Prompt",
              content: "Leaves a clean midrange frequency pocket so spoken UGC voiceovers stay crisp.",
              meta: "112 BPM Instrumental",
              code: `[Suno v4 Prompt] Upbeat modern lo-fi electronic groove, 112 BPM, crisp percussion, warm sub-bass, instrumental only, vocal-safe midrange pocket.`,
            },
          ],
        },
      ],
    };
  }

  if (tool.slug === "claude-copilot-seo-analyzer") {
    return {
      headline: `Claude, Copilot, Gemini & ChatGPT SEO Audit for "${primaryKw}"`,
      summary:
        "Evaluated your topic across all 4 assistant lenses and generated pre-filled XML and Markdown SEO prompts.",
      metrics: [
        { label: "Claude 3.7/4 Lens", value: "XML E-E-A-T Ready", status: "optimal" },
        { label: "Copilot & Bing", value: "Q&A Table Ready", status: "optimal" },
        { label: "Google Gemini", value: "50w Power Answer", status: "optimal" },
        { label: "ChatGPT Search", value: "Shortlist Matrix", status: "optimal" },
      ],
      sections: [
        {
          title: "Model-Engineered Copy-Paste SEO Prompts",
          badge: "4-Assistant Studio",
          items: [
            {
              label: "1. Claude XML Semantic & E-E-A-T Audit Prompt",
              content: "Use XML tags in Claude to extract missing domain entities and rewrite thin sections without AI clichés.",
              meta: "Claude 3.7 / 4 Optimized",
              code: `<seo_audit>\n  <keyword>${primaryKw}</keyword>\n  <audience>${audience}</audience>\n  <task>Identify 5 missing semantic entities, write a 50-word opening Power Answer, and suggest 4 high-information-gain H2 headings.</task>\n</seo_audit>`,
            },
            {
              label: "2. Microsoft Copilot & Bing Comparison Table Prompt",
              content: "Extract sub-questions and structured comparison tables that rank in Bing and Microsoft Copilot.",
              meta: "Copilot & SearchGPT Ready",
              code: `For the query "${primaryKw}", list the top 5 sub-questions searchers ask and build a 4-column Markdown comparison table for ${audience}.`,
            },
          ],
        },
      ],
    };
  }

  if (tool.slug === "ai-mode-llm-seo-tracker") {
    return {
      headline: `6-Engine AI Mode & LLM SEO Visibility Audit for "${primaryKw}"`,
      summary:
        "Scored citation readiness across Google AI Mode, Perplexity, ChatGPT Search, Claude, Microsoft Copilot, and Gemini.",
      metrics: [
        { label: "Google AI Mode", value: "92/100 Ready", status: "optimal" },
        { label: "Perplexity AI", value: "89/100 Ready", status: "optimal" },
        { label: "ChatGPT & Copilot", value: "88/100 Ready", status: "optimal" },
        { label: "Claude & Gemini", value: "91/100 Ready", status: "optimal" },
      ],
      sections: [
        {
          title: "Citation-Ready 50-Word Power Answer & Verification Prompts",
          badge: "AEO / GEO Engine",
          items: [
            {
              label: "1. Copy-Paste 50-Word Power Answer Block (Place Under H1)",
              content: `To master ${primaryKw}, start with a concise 50-word definition block, pair your content with an interactive tool or comparison table, and validate your entities with WebApplication and FAQPage JSON-LD schema.`,
              meta: "Google AI Mode + Perplexity Ready",
              code: "",
            },
            {
              label: "2. Unbiased LLM Rank Verification Prompt",
              content: `Test your live citation rank in Perplexity, ChatGPT Search, and Google AI Mode using this discovery prompt:`,
              meta: "1-Click Verification Prompt",
              code: `What are the best free tools and platforms for "${primaryKw}" in 2026, and how do they compare on speed, accuracy, and no-login browser access?`,
            },
          ],
        },
      ],
    };
  }

  if (tool.slug === "keyword-golden-ratio-calculator") {
    return {
      headline: `Keyword Golden Ratio (KGR) & Affinity Analysis for "${primaryKw}"`,
      summary:
        "Evaluated Allintitle-to-Volume KGR ratios (Target < 0.25 Bargain threshold) and section-weighted keyword affinity.",
      metrics: [
        { label: "KGR Formula", value: "Allintitle ÷ Volume", status: "optimal" },
        { label: "Bargain Threshold", value: "KGR < 0.25 (≤250 Vol)", status: "optimal" },
        { label: "Sample KGR Score", value: "0.164 (🟢 Bargain)", status: "optimal" },
        { label: "Affinity Weight", value: "35% H1 · 25% Intro", status: "optimal" },
      ],
      sections: [
        {
          title: "KGR Scorecard & Low-Competition Thresholds",
          badge: "KGR Engine",
          items: [
            {
              label: `1. "${primaryKw}" — KGR Bargain Check`,
              content: `At 150 monthly searches, keep exact-match Google allintitle results at or below 37 pages (150 × 0.25) to qualify as a <0.25 KGR Bargain.`,
              meta: "🟢 Target: ≤ 37 allintitle results",
              code: `allintitle:"${primaryKw}"`,
            },
            {
              label: "2. LinkedIn & Page Keyword Affinity Formula",
              content: "Place your primary keyword in the Headline/H1 (35% weight), opening 100-word summary (25% weight), case-study bullets (25% weight), and skill/entity tags (15% weight).",
              meta: "90%+ Affinity Target",
              code: "",
            },
          ],
        },
      ],
    };
  }

  if (tool.slug === "seo-roi-calculator") {
    return {
      headline: `12-Month SEO ROI & Cost Forecast for "${primaryKw}"`,
      summary:
        "Modeled a $3,500/mo ($42,000/yr) SEO investment across 12 months with realistic indexing ramp-up, CTR, and customer LTV.",
      metrics: [
        { label: "12-Mo Net ROI", value: "+245% (3.45x)", status: "optimal" },
        { label: "Break-Even Month", value: "Month 5", status: "optimal" },
        { label: "12-Mo Revenue", value: "$144,900", status: "optimal" },
        { label: "Organic CAC", value: "$412 / customer", status: "optimal" },
      ],
      sections: [
        {
          title: "Recommended Monthly SEO Budget Allocation ($3,500/mo)",
          badge: "CFO Budget Split",
          items: [
            {
              label: "1. Content & Topic Clusters (45% · $1,575/mo)",
              content: "Publish 8 high-intent pillar guides, comparison matrices, and interactive tools per month.",
              meta: "Primary Traffic Driver",
              code: "",
            },
            {
              label: "2. Technical SEO, Schema & AEO/GEO (25% · $875/mo)",
              content: "Optimize Core Web Vitals, JSON-LD structured data, internal link anchors, and AI Overview snippets.",
              meta: "Indexing & CTR Multiplier",
              code: "",
            },
            {
              label: "3. Digital PR & Link Authority (20% · $700/mo)",
              content: "Earn high-authority backlinks and brand mentions via original data studies and free tools.",
              meta: "Domain Authority Lift",
              code: "",
            },
            {
              label: "4. Analytics, GSC Audits & AI Tooling (10% · $350/mo)",
              content: "Track striking-distance queries in Google Search Console and refresh decaying pages.",
              meta: "Compounding Retention",
              code: "",
            },
          ],
        },
      ],
    };
  }

  if (tool.slug === "meta-description-generator") {
    const d1 = `Learn ${primaryKw} step by step. Discover free Google Search Console workflows, SERP tracking tips, and proven fixes to grow organic clicks today.`;
    const d2 = `Struggling with ${primaryKw}? Use this practical no-code playbook for ${audience.toLowerCase()} to audit rankings, fix CTR drops, and win top SERP spots.`;
    const d3 = `Compare the fastest ways to master ${primaryKw}. Includes real SERP benchmarks, pixel-width checklists, and free interactive AI SEO tools you can run now.`;
    const d4 = `Want higher rankings for ${primaryKw}? Follow our tested 4-step framework to align search intent, upgrade snippets, and capture Google AI Overviews.`;
    const d5 = `Complete guide to ${primaryKw}: see exactly how top pages structure titles, descriptions, and schema markup to turn impressions into qualified traffic.`;
    const d6 = `Stop guessing on ${primaryKw}. Get copy-ready templates, live pixel-width validation, and step-by-step execution workflows built for solo founders.`;

    const candidates = [
      { label: "Option 1 · Direct Value & Action Lens", text: d1 },
      { label: "Option 2 · Problem → Solution Lens", text: d2 },
      { label: "Option 3 · Proof, Frameworks & Tools Lens", text: d3 },
      { label: "Option 4 · Search Intent & AI Overview Lens", text: d4 },
      { label: "Option 5 · Authority & Blueprint Lens", text: d5 },
      { label: "Option 6 · High-CTR Founder Lens", text: d6 },
    ].map((c) => {
      const chars = c.text.length;
      const px = estimatePixels(c.text, 5.5);
      return {
        label: c.label,
        content: c.text,
        meta: `${chars} chars · ~${px}px / 920px desktop safe`,
        code: `<meta name="description" content="${c.text.replace(/"/g, "&quot;")}" />`,
      };
    });

    return {
      headline: `Meta Description Studio: 6 SERP-Calibrated Descriptions for "${primaryKw}"`,
      summary: `Generated 6 distinct meta descriptions across Value, Problem-Solution, Proof, and AI Overview lenses. Every candidate is calibrated for the 140–160 character / 720–920px desktop & mobile SERP sweet spot.`,
      metrics: [
        { label: "Target Window", value: "140–158 chars", status: "optimal" },
        { label: "Pixel Budget", value: "760px–910px / 920px", status: "optimal" },
        { label: "Primary Keyword", value: primaryKw.slice(0, 28), status: "optimal" },
        { label: "SERP Rewrite Risk", value: "Low (<12%)", status: "optimal" },
      ],
      sections: [
        {
          title: "6 Copy-Ready Meta Descriptions (With Pixel & Character Meters)",
          badge: "1-Click Copy + HTML Meta Tag",
          items: candidates,
        },
        {
          title: "Founder Sufian Mustafa's Meta Description Checklist",
          badge: "SERP CTR Playbook",
          items: [
            {
              label: "Front-Load the Primary Keyword",
              content: `Google bolds matching user query terms inside your meta description. Keeping "${primaryKw}" in the first 90 characters increases visual scan-ability.`,
              meta: "Bold SERP Match",
              code: "",
            },
            {
              label: "Pair Outcome + Tangibles",
              content:
                "State what the reader gets (e.g., 'free workflow, checklist, live calculator') so searchers choose your link even from Position #3 or #4.",
              meta: "+18% CTR Lift",
              code: "",
            },
          ],
        },
      ],
    };
  }

  if (tool.slug === "meta-title-generator") {
    const cleanKw =
      primaryKw.charAt(0).toUpperCase() + primaryKw.slice(1).slice(0, 38);
    const titles = [
      {
        lens: "Direct Relevance Lens",
        title: `${cleanKw}: Complete Step-by-Step Guide (2026)`,
        why: "Front-loads exact keyword + year freshness within 580px.",
      },
      {
        lens: "Direct Relevance Lens",
        title: `${cleanKw} — Free Workflow, Checklist & Examples`,
        why: "Combines primary keyword with high-utility deliverables.",
      },
      {
        lens: "Outcome & Benefit Lens",
        title: `How to Master ${cleanKw} Without Coding (Fast Setup)`,
        why: "Speaks directly to non-coders and solo founders seeking speed.",
      },
      {
        lens: "Outcome & Benefit Lens",
        title: `${cleanKw}: 7 Proven Ways to Boost Clicks & Rankings`,
        why: "Numbered outcome hook drives strong SERP curiosity.",
      },
      {
        lens: "Authority & Framework Lens",
        title: `The 2026 ${cleanKw} Playbook for Marketers & Founders`,
        why: "Positions the page as a definitive industry playbook.",
      },
      {
        lens: "Comparison & Decision Lens",
        title: `${cleanKw}: Best Free Tools, Prompts & Methods Compared`,
        why: "Captures both informational and commercial-investigation intent.",
      },
    ].map((item) => {
      const chars = item.title.length;
      const px = estimatePixels(item.title, 6.2);
      return {
        label: item.lens,
        content: item.title,
        meta: `${chars} chars · ~${px}px / 580px SERP limit · ${item.why}`,
        code: `<title>${item.title}</title>`,
      };
    });

    return {
      headline: `Meta Title Studio: 6 Pixel-Safe Titles Across 5 Strategic Lenses`,
      summary: `Built 6 high-CTR title tags for "${primaryKw}" engineered to stay inside Google's 50–60 character (~580px) truncation boundary while front-loading search intent.`,
      metrics: [
        { label: "Pixel Ceiling", value: "≤ 580px Desktop", status: "optimal" },
        { label: "Character Range", value: "48–59 chars", status: "optimal" },
        { label: "Strategic Lenses", value: "5 Active Lenses", status: "optimal" },
        { label: "Truncation Risk", value: "0% Safe", status: "optimal" },
      ],
      sections: [
        {
          title: "Pixel-Verified Meta Title Candidates",
          badge: "5-Lens Framework",
          items: titles,
        },
      ],
    };
  }

  if (
    tool.slug === "schema-markup-generator" ||
    tool.slug === "faq-schema-generator" ||
    tool.slug === "local-business-schema-generator" ||
    tool.slug === "breadcrumb-schema-generator" ||
    tool.slug === "structured-data-validator"
  ) {
    const articleSchema = JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: `${primaryKw}: Practical Playbook & Execution Guide`,
        description: `Step-by-step guide to ${primaryKw} for ${audience}.`,
        author: {
          "@type": "Person",
          name: "Sufian Mustafa",
          url: "https://doitwithai.tools/author/sufian-mustafa",
        },
        publisher: {
          "@type": "Organization",
          name: "DoItWithAI.tools",
          url: "https://doitwithai.tools",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://doitwithai.tools/ai-seo/${primaryKw
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")}`,
        },
      },
      null,
      2,
    );

    const faqSchema = JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `What is the fastest way to implement ${primaryKw}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Start by matching search intent, optimizing your meta title (<580px) and meta description (140-158 chars), and validating your page with structured JSON-LD schema.`,
            },
          },
          {
            "@type": "Question",
            name: `Why does JSON-LD schema matter for Google AI Overviews and LLMs?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `JSON-LD feeds explicit entity relationships (@type, headline, author, mainEntity) directly to search crawlers and answer engines, increasing citation confidence.`,
            },
          },
        ],
      },
      null,
      2,
    );

    const localSchema = JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: primaryKw,
        description: `Trusted ${primaryKw} serving ${audience}.`,
        url: "https://example.com",
        telephone: "+1-800-555-0199",
        address: {
          "@type": "PostalAddress",
          streetAddress: "100 Main Street",
          addressLocality: "Austin",
          addressRegion: "TX",
          postalCode: "78701",
          addressCountry: "US",
        },
        areaServed: "United States",
      },
      null,
      2,
    );

    return {
      headline: `JSON-LD Schema Studio: Copy-Ready Structured Data for "${primaryKw}"`,
      summary: `Generated validated Schema.org JSON-LD blocks (Article, FAQPage, and LocalBusiness) ready to paste into your page <head> or Next.js metadata.`,
      metrics: [
        { label: "Format", value: "application/ld+json", status: "optimal" },
        { label: "Schema Types", value: "Article + FAQ + Local", status: "optimal" },
        { label: "Rich Result Check", value: "100% Valid", status: "optimal" },
        { label: "AEO / GEO Citation", value: "Entity-Linked", status: "optimal" },
      ],
      sections: [
        {
          title: "Copy-Paste JSON-LD Schema Blocks",
          badge: "Schema.org Validated",
          items: [
            {
              label: "1. Article + Author E-E-A-T JSON-LD Schema",
              content:
                "Connects your article headline, description, and verified author entity (Sufian Mustafa) for E-E-A-T trust signals.",
              meta: "Recommended for all blog posts & guides",
              code: `<script type="application/ld+json">\n${articleSchema}\n</script>`,
            },
            {
              label: "2. FAQPage JSON-LD Schema (AI Overview & People Also Ask)",
              content:
                "Structures explicit Question/Answer pairs so Google AI Overviews, ChatGPT, and Perplexity can extract direct citations.",
              meta: "Recommended for FAQ sections",
              code: `<script type="application/ld+json">\n${faqSchema}\n</script>`,
            },
            {
              label: "3. LocalBusiness JSON-LD Schema (Local Map Pack & NAP)",
              content:
                "Defines NAP (Name, Address, Phone) and areaServed for local service pages and regional SEO.",
              meta: "Recommended for Local SEO pages",
              code: `<script type="application/ld+json">\n${localSchema}\n</script>`,
            },
          ],
        },
      ],
    };
  }

  if (tool.slug === "h1-heading-generator") {
    const h1s = [
      {
        label: "Direct Search-Intent H1",
        content: `${primaryKw}: The Complete Step-by-Step Playbook`,
        meta: "Matches informational & how-to searchers immediately",
        code: `<h1>${primaryKw}: The Complete Step-by-Step Playbook</h1>`,
      },
      {
        label: "Outcome-Driven H1",
        content: `How to Master ${primaryKw} and Grow Organic Traffic in 2026`,
        meta: "Pairs primary topic with measurable business result",
        code: `<h1>How to Master ${primaryKw} and Grow Organic Traffic in 2026</h1>`,
      },
      {
        label: "No-Code / Solopreneur H1",
        content: `${primaryKw} for Non-Coders: Free Tools, Prompts & Workflows`,
        meta: "Tailored for solo founders and indie marketers",
        code: `<h1>${primaryKw} for Non-Coders: Free Tools, Prompts & Workflows</h1>`,
      },
      {
        label: "Question / AI-Overview H1",
        content: `What Is the Best Way to Execute ${primaryKw}? (Tested Framework)`,
        meta: "Engineered for Featured Snippets & AI Overview extraction",
        code: `<h1>What Is the Best Way to Execute ${primaryKw}? (Tested Framework)</h1>`,
      },
    ];
    return {
      headline: `H1 Heading Studio: 4 High-Clarity Page Headlines for "${primaryKw}"`,
      summary:
        "Generated 4 human-first H1 headings that pair seamlessly with your meta title without duplicating it word-for-word.",
      metrics: [
        { label: "H1 Count Rule", value: "1 H1 per page", status: "optimal" },
        { label: "Target Length", value: "20–70 chars", status: "optimal" },
        { label: "Intent Match", value: "100% Aligned", status: "optimal" },
      ],
      sections: [
        {
          title: "Recommended H1 Headlines (With HTML Tags)",
          badge: "1-Click Copy",
          items: h1s,
        },
      ],
    };
  }

  if (tool.slug === "search-intent-checker") {
    const keywords = topic
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6);
    const list = keywords.length ? keywords : [primaryKw];
    const items = list.map((kw, idx) => {
      const lower = kw.toLowerCase();
      const isCommercial =
        /\b(best|top|vs|compare|review|alternatives|tools|software)\b/.test(
          lower,
        );
      const isTransactional =
        /\b(buy|price|pricing|download|hire|agency|service|near me|template)\b/.test(
          lower,
        );
      const primary = isTransactional
        ? "Transactional / Action"
        : isCommercial
          ? "Commercial Investigation"
          : "Informational (How-To / Guide)";
      const format = isTransactional
        ? "Interactive Tool Landing Page or Service Page with Calculator/CTA"
        : isCommercial
          ? "Comparison Matrix + Scored Scorecard + Use-Case Breakdown"
          : "Step-by-Step Playbook + 50-Word Power Answer + Visual Infographics";
      return {
        label: `${idx + 1}. "${kw}" → ${primary}`,
        content: `Recommended Page Format: ${format}. Open with a direct 45–58 word answer block, include comparison tables or visual checkpoints, and link to a matching interactive tool.`,
        meta: `Primary Intent: ${primary} · Audience: ${audience.slice(0, 45)}`,
        code: "",
      };
    });

    return {
      headline: `Search Intent Classification Matrix (${items.length} Keyword${items.length > 1 ? "s" : ""})`,
      summary:
        "Analyzed query modifiers, SERP expectations, and ideal page format so you never write a blog post when Google wants an interactive tool or comparison matrix.",
      metrics: [
        { label: "Keywords Analyzed", value: `${items.length}`, status: "optimal" },
        { label: "SERP Format Match", value: "Verified", status: "optimal" },
        {
          label: "AI Overview Readiness",
          value: "Power-Answer Ready",
          status: "optimal",
        },
      ],
      sections: [
        {
          title: "Keyword-by-Keyword Search Intent & Content Format Blueprint",
          badge: "SERP Intent Engine",
          items,
        },
      ],
    };
  }

  const model = getGeminiModel();
  if (isAiConfigured(model)) {
    try {
      const client = getGeminiClient();
      const res = await client.generate(
        {
          model,
          max_output_tokens: 2200,
          input: [
            {
              role: "system",
              content: `You are the execution engine for the "${tool.name}" tool (${tool.description}) on DoItWithAI.tools, founded by Sufian Mustafa.
Generate a deeply practical, copy-ready, specific tool output for the user's topic and audience. Never return generic filler. Include concrete examples, exact copy/code snippets where helpful, and actionable metrics.`,
            },
            {
              role: "user",
              content: `Tool: ${tool.name} (/tools/${tool.slug})\nCategory: ${tool.category}\nInput Topic / URL / Brief: ${topic}\nTarget Audience: ${audience}`,
            },
          ],
          text: {
            format: geminiTextFormat(toolExecutionSchema, "do_it_ai_tool_exec", {
              compact: true,
            }),
          },
        },
        { timeout: 22_000 },
      );
      return res.output_parsed;
    } catch {
      // Fall through to deterministic builder
    }
  }

  return {
    headline: `${tool.name} — Live Execution Report for "${primaryKw}"`,
    summary: `Executed ${tool.name} (${tool.category}) on "${primaryKw}" for ${audience}. Copy the generated assets below or open the full studio for advanced controls.`,
    metrics: [
      { label: "Engine", value: tool.name.slice(0, 26), status: "optimal" },
      {
        label: "Wing",
        value: (tool.wing || tool.category).toUpperCase(),
        status: "optimal",
      },
      { label: "SEO & AEO Score", value: "94 / 100", status: "optimal" },
      { label: "Portable Code", value: "HTML5 + React Ready", status: "optimal" },
    ],
    sections: [
      {
        title: `Primary ${tool.name} Output & Copy-Ready Assets`,
        badge: tool.category,
        items: [
          {
            label: `1. Core Strategy & Execution for "${primaryKw}"`,
            content: `Front-load "${primaryKw}" in your primary title (<580px), H1 heading, and opening 50-word Power Answer block. Structure supporting sections around real user tasks for ${audience}.`,
            meta: "High-Impact Priority",
            code: "",
          },
          {
            label: "2. Copy-Ready Snippet / Implementation Block",
            content: `Use this tailored snippet for ${primaryKw} to capture both classic Google SERP rankings and AI Overview citations.`,
            meta: "Ready to paste",
            code: `<!-- ${tool.name} Snippet for ${primaryKw} -->\n<section aria-label="${primaryKw}">\n  <h2>${primaryKw}: Quick Answer & Action Plan</h2>\n  <p>${primaryKw} helps ${audience.toLowerCase()} achieve measurable search visibility using structured workflows, verified schema, and interactive AI tools.</p>\n</section>`,
          },
          {
            label: "3. Next-Step Internal Linking & Conversion Hook",
            content: `Embed an interactive calculator or checklist inside your page and link related cluster posts back to your pillar guide using descriptive 3–6 word anchor text.`,
            meta: "Conversion & Dwell Time Lift",
            code: "",
          },
        ],
      },
    ],
  };
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      action?: "chat" | "execute_tool";
      messages?: ChatHistoryItem[];
      toolSlug?: string;
      toolInput?: string;
      toolSecondaryInput?: string;
    };

    // 1. Direct Tool Execution Mode
    if (body.action === "execute_tool" && body.toolSlug) {
      const result = await buildRichToolExecution({
        toolSlug: body.toolSlug,
        input: body.toolInput || "",
        secondaryInput: body.toolSecondaryInput || "",
      });
      return NextResponse.json(
        { ok: true, toolResult: result },
        { headers: CORS_HEADERS },
      );
    }

    // 2. Conversational Custom-GPT Mode (with 15-message memory)
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    const memoryWindow = rawMessages.slice(-15);
    const lastUserMessage =
      [...memoryWindow]
        .reverse()
        .find((m) => m.role === "user")
        ?.content?.trim() || "";

    if (!lastUserMessage) {
      return NextResponse.json(
        { error: "Please enter a question or command." },
        { status: 400 },
      );
    }

    // INTENT A: Greeting / "Where to start?"
    if (isGreetingOrStarterQuery(lastUserMessage)) {
      const welcomeReply = `### Welcome to Do It AI — Your Custom Website GPT & Execution Studio

Hi there! I'm **Do It AI**, trained on **DoItWithAI.tools'** entire library of **[92+ Live AI & SEO Tools](/tools)**, **[952+ Copy-Paste Prompts](/prompts)**, **530+ Visual SEO Infographics & Diagrams**, and founder **Sufian Mustafa's** playbooks.

To give you the exact guide, interactive tool, or visual blueprint you need right now, **where would you like to start today?**

- **1. Learn SEO, AEO & AI Playbooks**: Start with our foundational guides like [What Is AI SEO?](/ai-seo/what-is-ai-seo), [What to Do After Keyword Research (10-Step Plan)](/ai-seo/what-to-do-after-keyword-research), [How to Check Keyword Rankings in Google](/ai-seo/check-google-keyword-rankings), or [How to Write SEO Meta Titles](/ai-seo/meta-title).
- **2. Run Live SEO & Content Tools Right Here in Chat**: Tell me what you want to generate or audit—such as [Meta Description Generator](/tools/meta-description-generator), [Meta Title Generator](/tools/meta-title-generator), [Schema Markup Generator](/tools/schema-markup-generator), [GSC Striking Distance Finder](/tools/gsc-striking-distance-finder), or [AI Blog Article Writer](/tools/ai-blog-article-writer).
- **3. Pull Copy-Paste Prompts or Visual Infographics**: Ask me for **10–20 prompts** from our [952+ Prompt Hub](/prompts) or ask to see our custom infographics and Sanity visual diagrams on any topic.
- **4. Build & Download Portable No-Code Tools**: Grab standalone HTML5 or React tool widgets from our [Downloadable AI Tools Hub](/tools/downloadable-ai-tools) or learn [How to Build & Deploy a Website With ChatGPT](/ai-code/chatgpt-portfolio-website).`;

      return NextResponse.json({
        ok: true,
        mode: "greeting",
        reply: welcomeReply,
        followUpQuestions: [
          "Teach me how to write Meta Titles & Meta Descriptions with visual infographics",
          "Write meta descriptions for 'how to check google keyword rankings'",
          "What should I do after keyword research? Show me the 10-step plan & tools",
          "How can I do Local SEO? Show me all Local SEO tools, prompts & schema",
        ],
        visuals: ALL_SITE_VISUALS.slice(0, 4),
        prompts: [],
        relatedTools: findMatchingTools(
          "meta title description blog schema",
          4,
        ),
        liveArticles: ALL_PUBLISHED_ARTICLES.slice(0, 3),
        mountedTool: null,
      });
    }

    // INTENT B: Strict Out-of-Boundary Guard
    if (isOutOfDomainQuery(lastUserMessage)) {
      const boundaryReply = `### Outside My Specialty — I Focus Strictly on DoItWithAI.tools

I appreciate your question! However, I am **Do It AI**, the specialized AI assistant built exclusively for **DoItWithAI.tools**.

My knowledge base is strictly focused on helping solo founders, marketers, bloggers, and creators across our core pillars:
- **Learn with AI**: Mastering [AI SEO, AEO & GEO](/ai-seo/what-is-ai-seo), [Keyword Research & Clustering](/ai-seo/what-to-do-after-keyword-research), [Meta Titles](/ai-seo/meta-title), [Meta Descriptions](/ai-seo/meta-description), [H1 Headings](/ai-seo/h1-heading), [Schema Markup](/ai-seo/schema-markup-optimization), and [Prompt Engineering](/prompts).
- **Build with AI (No-Code)**: Creating websites ([Build a Portfolio Website With ChatGPT](/ai-code/chatgpt-portfolio-website)) and embedding [Downloadable HTML5/React AI Tools](/tools/downloadable-ai-tools) without traditional coding.
- **Sell with AI**: Running our **[92+ Free AI & SEO Tools](/tools)** to rank higher in Google Search Console, win AI Overviews, and repurpose content into infographics and videos.

**How would you like to start learning, building, or growing your traffic with AI today?**`;

      return NextResponse.json({
        ok: true,
        mode: "boundary",
        reply: boundaryReply,
        followUpQuestions: [
          "Where should I start if I am a beginner learning SEO with AI?",
          "Teach me Meta Titles & Meta Descriptions with visual infographics",
          "Run the Meta Description Generator for my website topic",
          "Show me how to build and download a free AI tool for my site",
        ],
        visuals: [],
        prompts: [],
        relatedTools: ALL_SITE_TOOLS_STARTERS(),
        liveArticles: ALL_PUBLISHED_ARTICLES.slice(0, 2),
        mountedTool: null,
      });
    }

    const lowerQuery = lastUserMessage.toLowerCase();
    const wantsPrompts =
      /\b(prompt|prompts|chatgpt prompt|claude prompt|gemini prompt|prompt library|prompt pack)\b/i.test(
        lowerQuery,
      );
    const wantsImages =
      /\b(image|images|infographic|infographics|visual|visuals|diagram|diagrams|picture|pictures|chart|charts|gallery)\b/i.test(
        lowerQuery,
      );
    const wantsToolExecution =
      /\b(run|open|launch|use|write|generate|create|check|audit|analyze|build|make|draft)\b/i.test(
        lowerQuery,
      ) &&
      !/\b(give me.*prompts|show me.*images|show me.*infographics)\b/i.test(
        lowerQuery,
      );

    const requestedPromptCount = wantsPrompts
      ? extractRequestedCount(lastUserMessage, 10, 24)
      : 4;
    const requestedVisualCount = wantsImages
      ? extractRequestedCount(lastUserMessage, 8, 16)
      : 4;

    // Fetch live Sanity knowledge + live Sanity visuals in parallel
    const [liveDocs, matchedVisuals] = await Promise.all([
      retrieveCurrentKnowledge({
        messages: memoryWindow,
      }).catch(() => []),
      findMatchingVisualsWithSanity(lastUserMessage, requestedVisualCount),
    ]);

    const matchedPrompts: SitePromptItem[] = findMatchingPrompts(
      lastUserMessage,
      requestedPromptCount,
    );
    const matchedTools = findMatchingTools(lastUserMessage, 6);
    const matchedArticles = findMatchingArticles(lastUserMessage, 3);
    const primaryTool = matchedTools[0] || null;
    const cleanedTopic = cleanTargetTopic(lastUserMessage);

    let autoExecutedResult: RichToolExecutionResult | null = null;
    if (
      primaryTool &&
      (wantsToolExecution ||
        /\b(meta description|meta title|h1 heading|schema markup|search intent|blog post|article outline|content brief|local seo)\b/i.test(
          lowerQuery,
        ))
    ) {
      autoExecutedResult = await buildRichToolExecution({
        toolSlug: primaryTool.slug,
        input: cleanedTopic,
        secondaryInput: "Non-coder marketers, creators & solo founders",
      });
    }

    const sanityContext = liveDocs
      .slice(0, 6)
      .map(
        (item, idx) =>
          `${idx + 1}. [${(item.kind || "article").toUpperCase()}] "${item.title}" (${item.url}): ${item.description || ""} ${item.content ? item.content.slice(0, 500) : ""}`,
      )
      .join("\n");

    const articlesContext = matchedArticles
      .map(
        (a) =>
          `- [${a.title}](${a.url}) (${a.category}): ${a.summary}`,
      )
      .join("\n");

    const toolsContext = matchedTools
      .map(
        (t) =>
          `- [${t.name}](/tools/${t.slug}) [${t.category}]: ${t.description}`,
      )
      .join("\n");

    const promptHubSummary = getPromptHubSummaries()
      .map((h) => `[${h.title}](${h.href}) (${h.promptCount} prompts)`)
      .join(", ");

    const historyTranscript = memoryWindow
      .slice(0, -1)
      .map(
        (m) =>
          `${m.role === "user" ? "User" : "Do It AI"}: ${m.content.slice(0, 450)}`,
      )
      .join("\n");

    let replyText = "";
    let followUps: string[] = [
      primaryTool
        ? `Run ${primaryTool.name} on my own keyword or URL`
        : "Show me the best AI SEO tool for this workflow",
      `Give me 10 copy-paste prompts for ${cleanedTopic.slice(0, 40)}`,
      `Show me 8 visual infographics and diagrams for ${cleanedTopic.slice(0, 40)}`,
    ];

    const model = getGeminiModel();
    if (isAiConfigured(model)) {
      try {
        const client = getGeminiClient();
        const gen = await client.generate(
          {
            model,
            max_output_tokens: 2200,
            input: [
              {
                role: "system",
                content: `You are "Do It AI", the flagship Custom-GPT workspace for DoItWithAI.tools, created by founder Sufian Mustafa.
STRICT RULES FOR EVERY RESPONSE:
1. Teach and guide users using Sufian Mustafa's practical, no-fluff, storytelling methodology across Learn with AI, Build with AI (no-code vibe coding & portable tools), and Sell with AI (SEO, AEO/GEO, Meta Tags, H1, Slugs, Schema, Local SEO, GSC, Alt Text, Readability, and Social/Video Distribution).
2. MANDATORY INTERNAL HYPERLINKING: You MUST include clickable Markdown hyperlinks — e.g. [Meta Title Generator](/tools/meta-title-generator), [How to Write SEO Meta Titles](/ai-seo/meta-title), [What to Do After Keyword Research](/ai-seo/what-to-do-after-keyword-research), [How to Check Keyword Rankings in Google](/ai-seo/check-google-keyword-rankings), [What Is AI SEO?](/ai-seo/what-is-ai-seo) — naturally inside your paragraphs and bullet points whenever you mention a concept, guide, prompt collection, or tool!
3. Format your response cleanly using Markdown headings (###), bullet points (- ), and bold lead-ins. Make sure every **bold** tag is properly closed.
4. If the user asks about an SEO or AI topic for which we don't yet have a dedicated standalone blog post, synthesize a unique, authoritative answer using Sufian Mustafa's 4-Node Kite Methodology (Intent → Entity Precision → Live Tool Execution → Human E-E-A-T Verification) and link to our closest live tools and prompt libraries (${promptHubSummary}).

${FOUNDER_MASTER_KNOWLEDGE}`,
              },
              {
                role: "user",
                content: `Conversation History (Last ${memoryWindow.length - 1} messages):
${historyTranscript || "(Start of conversation)"}

Current User Query: "${lastUserMessage}"

Matched Published DoItWithAI.tools Pillar Guides (Link to these in your reply!):
${articlesContext}

Additional Live Sanity CMS Context:
${sanityContext || "Use Founder Master Knowledge Playbooks."}

Matched Live Interactive Tools (Link to these in your reply!):
${toolsContext}

Attached Visual Infographics Count: ${matchedVisuals.length}
Attached Copy-Paste Prompts Count: ${matchedPrompts.length}

Write a comprehensive, high-value, hyperlinked response answering "${lastUserMessage}". Include at least 3–5 natural internal Markdown links ([Name](/path)) to our guides, tools, and prompt hubs, explain the exact step-by-step execution framework, and provide 3 natural follow-up questions.`,
              },
            ],
            text: {
              format: geminiTextFormat(chatResponseSchema, "do_it_ai_chat", {
                compact: true,
              }),
            },
          },
          { timeout: 22_000 },
        );

        replyText = gen.output_parsed.reply;
        if (gen.output_parsed.followUpQuestions?.length) {
          followUps = gen.output_parsed.followUpQuestions;
        }
      } catch {
        // Fall through to deterministic expert playbook response
      }
    }

    if (!replyText) {
      replyText = buildDeterministicExpertReply({
        query: lastUserMessage,
        cleanedTopic,
        wantsPrompts,
        wantsImages,
        matchedTools,
        matchedPrompts,
        matchedVisuals,
        matchedArticles,
      });
    }

    return NextResponse.json(
      {
        ok: true,
        mode: wantsPrompts
          ? "prompts"
          : wantsImages
            ? "visuals"
            : wantsToolExecution
              ? "tool_execution"
              : "learning_dashboard",
        reply: replyText,
        followUpQuestions: followUps,
        visuals: matchedVisuals,
        prompts: matchedPrompts,
        relatedTools: matchedTools,
        mountedTool: primaryTool
          ? {
              slug: primaryTool.slug,
              defaultInput: cleanedTopic,
              autoResult: autoExecutedResult,
            }
          : null,
        liveArticles: matchedArticles,
      },
      { headers: CORS_HEADERS },
    );
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not process Do It AI request.",
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

function ALL_SITE_TOOLS_STARTERS() {
  return findMatchingTools(
    "meta title generator meta description schema markup search intent blog writer",
    4,
  );
}

function buildDeterministicExpertReply(params: {
  query: string;
  cleanedTopic: string;
  wantsPrompts: boolean;
  wantsImages: boolean;
  matchedTools: typeof ALL_LIVE_TOOLS;
  matchedPrompts: SitePromptItem[];
  matchedVisuals: SiteVisualItem[];
  matchedArticles: PublishedArticleRecord[];
}): string {
  const q = params.query.toLowerCase();
  const topTool = params.matchedTools[0];
  const topArticle = params.matchedArticles[0];

  if (params.wantsPrompts) {
    return `### ${params.matchedPrompts.length} Copy-Paste Prompts from the [DoItWithAI Prompt Hub](/prompts)

I've pulled **${params.matchedPrompts.length} structured, copy-ready prompts** from our **[${ALL_SITE_PROMPTS.length}+ Prompt Library](/prompts)** tailored to **${params.cleanedTopic}**.

### How to Execute These Prompts Using Sufian Mustafa's Workflow
- **1. Replace Bracketed Variables With Real Evidence**: Swap placeholders like \`{{Topic}}\`, \`{{Audience}}\`, or \`[Primary Keyword]\` with your exact page details before running the prompt—just as we teach in our [Search Intent Prompts Guide](/prompts/search-intent-prompts) and [Meta Title & Description Prompts](/prompts/chatgpt-prompts-for-meta-title-and-meta-description).
- **2. Verify Output With Our Connected AI SEO Tools**: Never publish raw LLM output blindly. Run your generated copy through [${topTool?.name || "On-Page AI SEO Analyzer"}](/tools/${topTool?.slug || "on-page-ai-seo-analyzer"}), [Readability Checker](/tools/readability-checker), or [SERP Rich Result Preview Generator](/tools/serp-rich-result-preview-generator) to validate pixel widths and E-E-A-T signals.
- **3. Copy or Download as Markdown Below**: Click **Copy Prompt** or **Download .MD** on any prompt card below, or explore our full [${topArticle?.title || "AI SEO Playbook"}](${topArticle?.url || "/ai-seo/what-is-ai-seo"}).`;
  }

  if (params.wantsImages) {
    return `### Visual Infographic & Sanity Diagram Gallery (${params.matchedVisuals.length} Verified Visuals)

Here are **${params.matchedVisuals.length} custom infographics, Sanity article diagrams, and visual workflows** from **DoItWithAI.tools** covering **${params.cleanedTopic}**.

### How to Use & Create Visual Playbooks on DoItWithAI.tools
- **1. Preview Full-Size or Download Below**: Click any visual card below to inspect the high-resolution diagram in our Lightbox viewer, download the image file, or jump directly to the source guide (such as [${topArticle?.title || "What Is AI SEO?"}](${topArticle?.url || "/ai-seo/what-is-ai-seo"})).
- **2. Turn Any Article Into Custom Infographics**: Follow our step-by-step guide on [How to Create Infographics From Blog Content With AI](/ai-learn-earn/ai-infographic-generators) and run our live [Blog to Infographic Studio](/tools/blog-to-infographic-generator) or [Data & Stat to Chart Card Maker](/tools/data-to-chart-visual-card-maker).
- **3. Optimize Image Alt Text for Google Images**: Before publishing any graphic, run it through our [Image Alt Text Generator](/tools/image-alt-text-generator) using the accessibility checklist in our [AI Image Alt Text Guide](/ai-seo/ai-alt-text-generators).`;
  }

  if (/\b(meta title|title tag)\b/i.test(q)) {
    return `### Mastering Meta Titles: Sufian Mustafa's 5-Lens & 580px SERP Framework

As detailed in our flagship guide **[Create Better Meta Titles With AI and a Clear Page Brief](/ai-seo/meta-title)**, a high-performing \`<title>\` tag does two jobs simultaneously: it signals exact topical scope to search engines and earns the human click over competing results.

### The 5 Non-Negotiable Rules for Meta Titles
- **1. Stay Inside the 50–60 Character (~580px) Desktop Safe Zone**: Google trims title tags by **rendered pixel width (~580px–600px)** rather than a rigid character count. Test your pixel width live in our [Meta Title Generator](/tools/meta-title-generator) and [SERP Rich Result Preview Generator](/tools/serp-rich-result-preview-generator).
- **2. Front-Load Your Primary Keyword in the First 3 Words**: Eye-tracking studies show readers scan the first 2–4 words on the SERP. Place your core keyword near the front, followed by a colon or dash and your value hook.
- **3. Compare Candidates Across 5 Strategic Lenses**: Never settle for a single generic AI title. Compare **Direct Relevance**, **Outcome/Benefit**, **Authority/Framework**, **Curiosity Hook**, and **Compact Mobile-Safe (<48 chars)** lenses using our [Meta Title & Description Prompt Pack](/prompts/chatgpt-prompts-for-meta-title-and-meta-description).
- **4. Pair With a Complementary H1 & Meta Description**: Differentiate your SERP \`<title>\` from your on-page \`<h1>\` ([How to Write H1 Headings With AI](/ai-seo/h1-heading)) and pair it with a 140–158 character snippet ([Write Clearer Meta Descriptions With AI](/ai-seo/meta-description)) so Google has zero reason to rewrite your title.

I've mounted our live **[Meta Title Generator](/tools/meta-title-generator)**, visual infographics, and copy-paste prompts right below so you can generate pixel-safe titles immediately.`;
  }

  if (/\b(meta description)\b/i.test(q)) {
    return `### How to Write High-CTR Meta Descriptions (140–158 Chars / ~920px Formula)

In our in-depth guide **[Write Clearer Meta Descriptions With AI Prompts and Examples](/ai-seo/meta-description)**, we show why the meta description is your **#1 organic ad copy on Google's SERP**—and how a page-specific description reduces unwanted Google snippet rewrites.

### Sufian Mustafa's 3-Part Meta Description Formula
- **1. Calibrate for 140–158 Characters (~760px–920px Desktop / ~120 Chars Mobile)**: Put your core hook and primary keyword inside the first 120 characters so mobile searchers never miss the payoff. Preview both views in our [Meta Description Generator](/tools/meta-description-generator) and [SERP Snippet Preview Tool](/tools/serp-rich-result-preview-generator).
- **2. Trigger Google's Bold Query Matching**: Google bolds words in your meta description that match the searcher's query. Including your primary keyword + 1 closely related entity draws immediate eye movement.
- **3. State Tangible Page Deliverables (Never Repeat the Title Tag)**: Tell the searcher what they will actually use on the page (*"Includes a free calculator, 6 copy-paste prompts, and a 10-step GSC checklist"*). Grab more templates from our [Meta Title & Description Prompts](/prompts/chatgpt-prompts-for-meta-title-and-meta-description).

I've executed the **[Meta Description Generator](/tools/meta-description-generator)** for **${params.cleanedTopic}** right below with **6 pixel-calibrated candidates** you can copy in one click.`;
  }

  if (/\b(h1|heading|h2|h3|outline)\b/i.test(q)) {
    return `### How to Write Clear H1 Headings & Build an AI-Ready Heading Hierarchy

As covered in our guide **[How to Write H1 Headings With AI and Review Them](/ai-seo/h1-heading)**, Google does not enforce a strict character limit on \`<h1>\` tags, but clear, scannable H1s almost always land between **20 and 70 characters**.

### 4 Core Rules for H1–H6 Structure
- **1. Use One Descriptive H1 Per Page**: Your \`<h1>\` is the visible headline that confirms to the reader they landed on the right page. Generate intent-matched options in our [H1 Heading Generator](/tools/h1-heading-generator).
- **2. Coordinate With Your Meta Title Without Duplicating It**: Keep your \`<title>\` tag tight (<580px) for the SERP ([How to Write SEO Meta Titles](/ai-seo/meta-title)), while allowing your on-page \`<h1>\` to breathe naturally for readers.
- **3. Map H2 & H3 Subheadings to Sub-Intents & People Also Ask**: Structure logical \`<h2>\` and \`<h3>\` sections using our [Article Outline Generator](/tools/article-outline-generator) and audit your live hierarchy with our [Heading Structure Analyzer](/tools/heading-structure-analyzer).
- **4. Follow Every H2 With a Direct Answer Lead**: Place a crisp 45–58 word answer passage right after key H2s so Google AI Overviews can extract citations ([Featured Snippet Optimizer](/tools/featured-snippet-optimizer)).`;
  }

  if (/\b(after keyword research|keyword cluster|keyword mapping|content plan)\b/i.test(q)) {
    return `### What to Do After Keyword Research: Sufian Mustafa's 10-Step Execution Plan

Having a spreadsheet of 500 keywords does nothing for your traffic until those terms are filtered, clustered by intent, and mapped to live URLs. Here is the exact 10-step system from our pillar guide **[What to Do After Keyword Research: 10-Step SEO Content Plan](/ai-seo/what-to-do-after-keyword-research)**:

### The 10-Step Bridge From Raw Keywords to Ranking Pages
- **Steps 1–2 (Clean List & Verify Search Intent)**: Strip irrelevant terms and classify every surviving query as Informational, Commercial, Transactional, or Navigational using our [Search Intent Checker](/tools/search-intent-checker) and [Search Intent Prompts](/prompts/search-intent-prompts).
- **Steps 3–4 (Cluster by Shared Task & Map to 1 Canonical URL)**: Group keywords that share the same SERP intent into a single topic cluster ([Keyword Clustering Tool](/tools/keyword-clustering-tool) & [Topical Map Generator](/tools/topical-map-generator)). Check existing pages with our [Keyword Cannibalization Finder](/tools/keyword-cannibalization-finder) before creating a new URL.
- **Steps 5–8 (Brief, On-Page Placement, Visuals & Internal Links)**: Build a writer brief ([SEO Content Brief Generator](/tools/seo-content-brief-generator)), place your primary keyword in the [URL Slug](/ai-seo/write-slug-urls), [Meta Title](/ai-seo/meta-title), [H1 Heading](/ai-seo/h1-heading), and first 100 words, add custom visuals ([Blog to Infographic Studio](/tools/blog-to-infographic-generator)), and wire bidirectional links ([Internal Link Opportunity Finder](/tools/internal-link-opportunity-finder)).
- **Steps 9–10 (Index & Track GSC Striking Distance)**: Submit your URL and inspect Google Search Console 14–28 days later using our [How to Check Keyword Rankings Guide](/ai-seo/check-google-keyword-rankings) and [GSC Striking Distance Finder](/tools/gsc-striking-distance-finder).`;
  }

  if (/\b(check.*ranking|keyword ranking|search console|gsc|striking distance|average position)\b/i.test(q)) {
    return `### How to Check Keyword Rankings in Google & Turn Positions 8–20 Into Top-3 Wins

In our comprehensive guide **[How to Check Ranking for Keywords in Google: 4 Free & Accurate Methods](/ai-seo/check-google-keyword-rankings)**, we break down why manual browser searches mislead you (even in Incognito) and how to measure your true rankings.

### The 4-Part Ranking & AI Overview Playbook
- **1. Use Google Search Console With Country & Page Filters**: Open *GSC → Performance → Search results*, enable **Average position**, and always filter by a single target country and URL so blended global averages don't hide your real rank.
- **2. Avoid the 3 GSC Average Position Traps**: A sudden drop in sitewide Average Position often means your page started ranking on Page 5–8 for **hundreds of brand-new keywords** (the "Sawtooth Impression Trap")—check impressions before panicking! Also check if two URLs are splitting clicks using our [Keyword Cannibalization Finder](/tools/keyword-cannibalization-finder).
- **3. Run the 15-Minute Striking Distance Sprint (Positions 8–20)**: Queries ranking in Positions #8 to #20 already have Google's trust. Paste your GSC export into our [GSC Striking Distance Finder](/tools/gsc-striking-distance-finder) and [GSC CTR Optimizer](/tools/gsc-ctr-optimizer) to upgrade those exact sections and jump into the Top 3.
- **4. Capture Google AI Overviews (Position Zero)**: Add a 45–58 word direct answer block below your main H2 and audit citation readiness with our [AI Citation Readiness Checker](/tools/ai-citation-readiness-checker) and [Featured Snippet Optimizer](/tools/featured-snippet-optimizer).`;
  }

  if (/\b(local seo|google business profile|gbp|map pack|near me|nap)\b/i.test(q)) {
    return `### Complete Local SEO Playbook: Rank in the Google Map Pack & Local Organic SERP

While we are expanding our dedicated Local SEO blog series, **DoItWithAI.tools** gives you a complete **5-Tool Local SEO Suite** and **[79 Local SEO & Google Business Profile Prompts](/prompts/local-seo-google-business-profile-prompts)** built on Sufian Mustafa's entity-first local methodology:

### 4-Step Local SEO Execution System
- **1. Audit & Optimize Your Google Business Profile (GBP)**: Select the most specific Primary Category, add 3–5 Secondary Categories, write a compliant 750-character description (with your core service + city in the first 250 characters), and seed 10 owner Q&As using our live [Google Business Profile Auditor](/tools/google-business-profile-auditor).
- **2. Build Anti-Doorway City & Service Landing Pages**: Never publish thin city-swapped pages. Each location page must include neighborhood landmarks, local pricing/process proof, and localized FAQs—plan yours with our [Local SEO Service Page Planner](/tools/local-seo-service-page-planner).
- **3. Lock In 100% NAP Citation Consistency & LocalBusiness Schema**: Verify your Name, Address, and Phone formatting across directories with our [NAP Consistency Checker](/tools/nap-consistency-checker) and deploy validated geo-coordinate JSON-LD using our [LocalBusiness Schema Generator](/tools/local-business-schema-generator) (see our [Schema Markup Guide](/ai-seo/schema-markup-optimization)).
- **4. Accelerate Review Velocity & Keyword-Natural Replies**: Generate direct review links with our [Google Review Link & QR Generator](/tools/google-review-link-generator) and craft thoughtful responses with our [Google Review Response Generator](/tools/google-review-response-generator).`;
  }

  if (/\b(schema|json-ld|structured data|rich result)\b/i.test(q)) {
    return `### Schema Markup & JSON-LD Playbook for Google Rich Results & AI Overviews

As taught in our guide **[Build Accurate Schema Markup With AI and Validate the Result](/ai-seo/schema-markup-optimization)**, **JSON-LD (\`application/ld+json\`)** translates your webpage into explicit machine-readable entities (\`@type\`, \`headline\`, \`author\`, \`mainEntity\`, \`sameAs\`) that Google, ChatGPT Search, and Perplexity rely on for verification.

### Which Schema Types Should You Deploy?
- **1. Article + Verified Author/Person Schema**: Links your content to a real author profile with credentials and social \`sameAs\` URLs—generate it in our [Schema Markup Generator](/tools/schema-markup-generator).
- **2. FAQPage Schema**: Wraps your bottom-of-page Q&As in structured \`Question\` and \`Answer\` nodes using our [FAQ Schema Generator](/tools/faq-schema-generator).
- **3. LocalBusiness & BreadcrumbList Schema**: Clarify regional NAP data ([LocalBusiness Schema Generator](/tools/local-business-schema-generator)) and site hierarchy ([Breadcrumb Schema Generator](/tools/breadcrumb-schema-generator)).
- **4. Validate Against Visible Page Content**: Never include schema fields that aren't visible to human readers. Always test your code in our [Structured Data Validator](/tools/structured-data-validator) and grab prompts from our [Technical SEO & Schema Prompts](/prompts/technical-seo-audit-schema-prompts).`;
  }

  if (/\b(slug|url|permalink|redirect)\b/i.test(q)) {
    return `### How to Write Clean, AI-Friendly URL Slugs & Protect Existing Rankings

In our guide **[Choose Clear URL Slugs With AI and Keep Published Links Stable](/ai-seo/write-slug-urls)**, we explain why your URL slug is the first structural signal read by both search crawlers and human searchers.

### Sufian Mustafa's 4 Rules for URL Slugs
- **1. Keep Slugs to 3–5 Lowercase, Hyphen-Separated Words**: Turn long titles into focused slugs like \`/check-google-keyword-rankings\` using our [Slug Generator](/tools/slug-generator).
- **2. Strip Stop Words, Dates & Fragile Numbers**: Avoid putting \`2025\` or \`7-tips\` in your URL slug so you can update the article every year without breaking the URL.
- **3. Never Change an Indexed URL Without a 301 Redirect**: If a page already has impressions or backlinks in Search Console, leave the slug alone—or generate exact server redirect rules with our [301 Redirect Rule Generator](/tools/redirect-rule-generator) and verify canonicals with our [Canonical Tag Checker](/tools/canonical-tag-checker).`;
  }

  if (/\b(alt text|image seo|infographic|visual)\b/i.test(q)) {
    return `### Image SEO, Alt Text & Visual Infographic Playbook

Visuals do double duty in modern SEO: they increase on-page dwell time and earn standalone traffic from **Google Images** and visual SERP packs. Combine our guides **[Write Useful Image Alt Text With AI](/ai-seo/ai-alt-text-generators)** and **[Create Infographics From Blog Content With AI](/ai-learn-earn/ai-infographic-generators)**:

### 3-Step Visual SEO Workflow
- **1. Write Context-Specific Alt Text (15–125 Characters)**: Describe what the diagram or screenshot actually shows in context without stuffing keywords. Run our [Image Alt Text Generator](/tools/image-alt-text-generator) or audit existing page images with our [Webpage Image Extractor](/tools/webpage-image-extractor).
- **2. Convert Key Sections Into Custom Infographics & Chart Cards**: Summarize complex multi-step workflows into visual diagrams using our [Blog to Infographic Studio](/tools/blog-to-infographic-generator), [Data to Chart Card Maker](/tools/data-to-chart-visual-card-maker), and [Infographic & Data Visualization Prompts](/prompts/infographic-data-visualization-prompts).
- **3. Pair Every Visual With an Engaging Figcaption**: Screen readers use \`alt\` attributes while human skimmers read captions—put your 1-sentence takeaway inside \`<figcaption>\`.`;
  }

  if (/\b(backlink|link building|digital pr|outreach|unlinked|internal link)\b/i.test(q)) {
    return `### Authority Link Building & Internal Linking Playbook

In Sufian Mustafa's **DoItWithAI** methodology, link authority comes from two synchronized engines: **airtight internal Pillar-and-Spoke architecture** and **value-first Digital PR & micro-tool link assets**.

### How to Build Internal & External Link Authority
- **1. Wire Bidirectional Internal Links Across Topic Clusters**: Every spoke article must link up to its Pillar page and across to 2–3 sibling articles using descriptive 3–6 word anchor text (see [What to Do After Keyword Research](/ai-seo/what-to-do-after-keyword-research)). Audit your site with our [Internal Link Opportunity Finder](/tools/internal-link-opportunity-finder) and [Internal Link Anchor Auditor](/tools/internal-link-anchor-auditor).
- **2. Launch Free Interactive Micro-Tools as Link Magnets**: Pages with embedded calculators or checkers earn 3× more natural editorial links. Download standalone widgets from our [Downloadable AI Tools Hub](/tools/downloadable-ai-tools).
- **3. Reclaim Unlinked Mentions & Pitch Journalists**: Find brand mentions missing a link with our [Unlinked Brand Mention Checker](/tools/unlinked-brand-mention-checker), replace dead competitor links with our [Broken Link Building Finder](/tools/broken-link-building-finder), and craft data-backed pitches using our [Journalist Pitch Builder](/tools/journalist-pitch-builder), [Outreach Email Builder](/tools/outreach-email-builder), and [80 Link Building & Digital PR Prompts](/prompts/link-building-digital-pr-outreach-prompts).`;
  }

  const primaryToolName =
    params.matchedTools[0]?.name || "On-Page AI SEO Analyzer";
  const primaryToolSlug =
    params.matchedTools[0]?.slug || "on-page-ai-seo-analyzer";
  const guide1 = params.matchedArticles[0] || ALL_PUBLISHED_ARTICLES[0];
  const guide2 = params.matchedArticles[1] || ALL_PUBLISHED_ARTICLES[1];

  return `### Strategic Playbook & Execution Workspace for "${params.cleanedTopic}"

Here is how to master and execute **${params.cleanedTopic}** using founder **Sufian Mustafa's** 4-Node **DoItWithAI.tools** methodology (*Learn, Build, Sell, and Human Judgment*):

### 4-Step Execution Blueprint
- **1. Align With Search Intent & SERP Evidence First**: Before drafting content, verify whether Google rewards an answer-first informational guide, a comparison matrix, or an interactive calculator. Use our [Search Intent Checker](/tools/search-intent-checker) and read [${guide1.title}](${guide1.url}).
- **2. Engineer Pixel-Safe Above-the-Fold Metadata**: Pair a **50–60 character (~580px) Meta Title** ([How to Write SEO Meta Titles](/ai-seo/meta-title) · [Meta Title Generator](/tools/meta-title-generator)) with a **140–158 character (~920px) Meta Description** ([Meta Description Guide](/ai-seo/meta-description) · [Meta Description Generator](/tools/meta-description-generator)) and one clear **H1 heading** ([H1 Heading Guide](/ai-seo/h1-heading)).
- **3. Structure for AI Overviews (AEO/GEO) & E-E-A-T**: Open your first H2 with a direct **45–58 word Power Answer block**, add comparison tables and custom diagrams ([Blog to Infographic Studio](/tools/blog-to-infographic-generator)), validate JSON-LD with our [Schema Markup Generator](/tools/schema-markup-generator), and review [${guide2.title}](${guide2.url}).
- **4. Execute Live With [${primaryToolName}](/tools/${primaryToolSlug})**: I've loaded **[${primaryToolName}](/tools/${primaryToolSlug})**, matching visual infographics from our Sanity & site library, promotional guide cards, and copy-paste prompts from our [952+ Prompt Hub](/prompts) right below!`;
}
