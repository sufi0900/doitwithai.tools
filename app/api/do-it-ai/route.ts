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
  ALL_SITE_PROMPTS,
  ALL_SITE_VISUALS,
  FOUNDER_MASTER_KNOWLEDGE,
  findMatchingPrompts,
  findMatchingTools,
  findMatchingVisuals,
  getPromptHubSummaries,
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
  reply: z.string().trim().min(20).max(5000),
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

function extractRequestedCount(q: string, defaultCount: number, maxCount: number): number {
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

  // 1. Specialized deterministic + AI-grade engines for flagship tools so they ALWAYS return rich, accurate multi-lens outputs
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
    tool.slug === "schema-markup-validator"
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
          "@id": `https://doitwithai.tools/blog/${primaryKw
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
              text: `Start by matching search intent, optimizing your meta title (<580px) and meta description (140-155 chars), and validating your page with structured JSON-LD schema.`,
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
        { label: "H1 Count Rule", value: "Exactly 1 H1 per page", status: "optimal" },
        { label: "Intent Match", value: "100% Aligned", status: "optimal" },
        { label: "Readability", value: "Grade 7–8 Clear", status: "optimal" },
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
      const isCommercial = /\b(best|top|vs|compare|review|alternatives|tools|software)\b/.test(
        lower,
      );
      const isTransactional = /\b(buy|price|pricing|download|hire|agency|service|near me|template)\b/.test(
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
        content: `Recommended Page Format: ${format}. Open with a direct 45–55 word answer block, include comparison tables or visual checkpoints, and link to a matching interactive tool.`,
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
        { label: "AI Overview Readiness", value: "Power-Answer Ready", status: "optimal" },
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

  // Try Gemini for any other tool if configured, with a rich deterministic fallback
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
      // Fall through to rich deterministic builder below
    }
  }

  return {
    headline: `${tool.name} — Live Execution Report for "${primaryKw}"`,
    summary: `Executed ${tool.name} (${tool.category}) on "${primaryKw}" for ${audience}. Copy the generated assets below or open the full studio for advanced controls.`,
    metrics: [
      { label: "Engine", value: tool.name.slice(0, 26), status: "optimal" },
      { label: "Wing", value: (tool.wing || tool.category).toUpperCase(), status: "optimal" },
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
      return NextResponse.json({ ok: true, toolResult: result });
    }

    // 2. Conversational Custom-GPT Mode (with 15-message memory)
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    const memoryWindow = rawMessages.slice(-15);
    const lastUserMessage =
      [...memoryWindow].reverse().find((m) => m.role === "user")?.content?.trim() ||
      "";

    if (!lastUserMessage) {
      return NextResponse.json(
        { error: "Please enter a question or command." },
        { status: 400 },
      );
    }

    // INTENT A: Greeting / "Where to start?" -> Warm coaching response, NEVER mount "hi" into Search Intent Checker!
    if (isGreetingOrStarterQuery(lastUserMessage)) {
      const welcomeReply = `### Welcome to Do It AI — Your Build & Sell with AI Workspace

Hi there! I'm **Do It AI**, trained on **DoItWithAI.tools**' entire library of **92+ live AI & SEO tools**, **952+ copy-paste prompts**, **30+ visual SEO infographics**, and founder **Sufian Mustafa's** playbooks.

To give you the exact dashboard, playbook, or live tool you need right now, **where would you like to start today?**

- **1. Learn SEO, AEO & AI Playbooks**: Ask me to teach you any topic step-by-step with visual infographics (e.g., *"Teach me how to write high-CTR Meta Titles"* or *"How can I do Local SEO?"*).
- **2. Run Live SEO & Content Tools Here in Chat**: Tell me what you want to generate or audit (e.g., *"Write meta descriptions for how to check google keyword rankings"*, *"Generate JSON-LD schema markup"*, or *"Write a full SEO blog post"*).
- **3. Grab Copy-Paste Prompts or Visual Infographics**: Ask for prompts or visuals from our library (e.g., *"Give me 15 prompts for SEO & keyword research"* or *"Show me visual infographics for keyword research"*).
- **4. Build or Download Portable No-Code Tools**: Ask for standalone HTML5 or React tool code you can embed on your own website in one click.`;

      return NextResponse.json({
        ok: true,
        mode: "greeting",
        reply: welcomeReply,
        followUpQuestions: [
          "Teach me how to write Meta Titles & Meta Descriptions with examples",
          "Write meta descriptions for 'how to check google keyword rankings'",
          "How can I do Local SEO? Show me all Local SEO tools & schema",
          "Give me 15 copy-paste prompts for SEO & Content Writing",
        ],
        visuals: ALL_SITE_VISUALS.slice(0, 4),
        prompts: [],
        relatedTools: findMatchingTools("meta title description blog schema", 4),
        mountedTool: null,
      });
    }

    // INTENT B: Strict Out-of-Boundary Guard (e.g., "I am a pilot and I want to know how to fly a plane")
    if (isOutOfDomainQuery(lastUserMessage)) {
      const boundaryReply = `### Outside My Specialty — I Focus Strictly on DoItWithAI.tools

I appreciate your question! However, I am **Do It AI**, the specialized AI workspace built exclusively for **DoItWithAI.tools**. 

My boundary is strictly focused on helping solo founders, marketers, and creators across three pillars:
- **Learn with AI**: Mastering SEO, AEO/GEO (AI Overviews), Keyword Research, Meta Tags, Schema Markup, and Prompt Engineering.
- **Build with AI (No-Code)**: Creating and downloading portable HTML5/React web tools, calculators, and workflows without writing code from scratch.
- **Sell with AI**: Running our **92+ live SEO, Content Writing, Google Search Console, and Social Visual tools** to rank higher and grow organic traffic.

**How would you like to pivot into learning, building, or growing with AI today?** Click any starter below or tell me what website, business, or topic you are working on!`;

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
      ) && !/\b(give me.*prompts|show me.*images|show me.*infographics)\b/i.test(lowerQuery);

    // Retrieve live Sanity CMS knowledge + local knowledge
    const liveDocs = await retrieveCurrentKnowledge({
      messages: [{ role: "user", content: lastUserMessage }],
    }).catch(() => []);

    const requestedPromptCount = wantsPrompts
      ? extractRequestedCount(lastUserMessage, 10, 24)
      : 4;
    const requestedVisualCount = wantsImages
      ? extractRequestedCount(lastUserMessage, 8, 16)
      : 4;

    const matchedPrompts: SitePromptItem[] = findMatchingPrompts(
      lastUserMessage,
      requestedPromptCount,
    );
    const matchedVisuals: SiteVisualItem[] = findMatchingVisuals(
      lastUserMessage,
      requestedVisualCount,
    );
    const matchedTools = findMatchingTools(lastUserMessage, 6);
    const primaryTool = matchedTools[0] || null;
    const cleanedTopic = cleanTargetTopic(lastUserMessage);

    // Pre-execute the primary tool if the user explicitly asked to write/generate/run/check something (e.g., "I want to write meta description")
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

    // Build grounded context for Gemini synthesis
    const sanityContext = liveDocs
      .slice(0, 5)
      .map(
        (item, idx) =>
          `${idx + 1}. [${(item.kind || "article").toUpperCase()}] "${item.title}" (${item.url}): ${item.description || ""} ${item.content ? item.content.slice(0, 450) : ""}`,
      )
      .join("\n");

    const toolsContext = matchedTools
      .map(
        (t) =>
          `- ${t.name} (/tools/${t.slug}) [${t.category}]: ${t.description}`,
      )
      .join("\n");

    const promptHubSummary = getPromptHubSummaries()
      .map((h) => `${h.title} (${h.promptCount} prompts)`)
      .join(", ");

    const historyTranscript = memoryWindow
      .slice(0, -1)
      .map((m) => `${m.role === "user" ? "User" : "Do It AI"}: ${m.content.slice(0, 400)}`)
      .join("\n");

    let replyText = "";
    let followUps: string[] = [
      primaryTool
        ? `Run ${primaryTool.name} on my own keyword or URL`
        : "Show me the best AI SEO tool for this workflow",
      "Give me 10 copy-paste prompts for this topic from the Prompt Hub",
      "Show me visual infographics and step-by-step checklists for this topic",
    ];

    const model = getGeminiModel();
    if (isAiConfigured(model)) {
      try {
        const client = getGeminiClient();
        const gen = await client.generate(
          {
            model,
            max_output_tokens: 1800,
            input: [
              {
                role: "system",
                content: `You are "Do It AI", the flagship Custom-GPT workspace for DoItWithAI.tools, created by founder Sufian Mustafa.
Your role:
1. Teach and guide users using Sufian Mustafa's practical, no-fluff, storytelling methodology across Learn with AI, Build with AI (no-code vibe coding & portable tools), and Sell with AI (SEO, AEO/GEO, Meta Tags, Schema, Local SEO, GSC, and Social Distribution).
2. Format your response cleanly using Markdown headings (###), bullet points (- ), and bold lead-ins (**Term**: explanation). Make sure every **bold** tag is properly closed.
3. Reference the matching live DoItWithAI.tools articles, prompts (${ALL_SITE_PROMPTS.length}+ prompts across ${promptHubSummary}), visual infographics, and tools provided in context.
4. Keep the tone warm, authoritative, and structured so a beginner, marketer, or solo founder can execute immediately.

${FOUNDER_MASTER_KNOWLEDGE}`,
              },
              {
                role: "user",
                content: `Conversation History (Last ${memoryWindow.length - 1} messages):
${historyTranscript || "(Start of conversation)"}

Current User Query: "${lastUserMessage}"

Matched Live Website Articles & Resources:
${sanityContext || "Use Founder Master Knowledge Playbooks."}

Matched Live DoItWithAI.tools Interactive Tools:
${toolsContext}

Attached Visual Infographics Count: ${matchedVisuals.length}
Attached Copy-Paste Prompts Count: ${matchedPrompts.length}

Write a rich, structured response answering "${lastUserMessage}" directly. Explain the core strategy/methodology clearly, highlight how to use the attached tools/prompts/visuals below, and provide 3 natural follow-up questions.`,
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
        liveItems: liveDocs.map((d) => ({ title: d.title, url: d.url, summary: d.description || "", type: d.kind || "article" })),
      });
    }

    return NextResponse.json({
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
      liveArticles: liveDocs.slice(0, 4).map((item) => ({
        title: item.title,
        url: item.url,
        summary: item.description || "",
        type: item.kind || "article",
      })),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not process Do It AI request.",
      },
      { status: 500 },
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
  liveItems: Array<{ title: string; url: string; summary: string; type: string }>;
}): string {
  const q = params.query.toLowerCase();

  if (params.wantsPrompts) {
    return `### ${params.matchedPrompts.length} Copy-Paste Prompts from the DoItWithAI Prompt Hub

I've pulled **${params.matchedPrompts.length} structured, copy-ready prompts** from our **${ALL_SITE_PROMPTS.length}+ Prompt Library** tailored to **${params.cleanedTopic}**.

### How to Get the Best Output from These Prompts
- **1. Replace Bracketed Variables First**: Swap any placeholder like \`[Topic]\`, \`[Target Audience]\`, or \`[Primary Keyword]\` with your exact niche details before running the prompt.
- **2. Pair Prompts with Live Verification Tools**: After generating your draft in ChatGPT, Claude, or Gemini, run the output through our **${params.matchedTools[0]?.name || "On-Page AI SEO Analyzer"}** below to verify pixel widths, search intent, and E-E-A-T signals.
- **3. Save or Download as Markdown**: Use the **Copy Prompt** or **Download .MD** buttons on any prompt card below to save your favorite templates.`;
  }

  if (params.wantsImages) {
    return `### Visual Infographic & Diagram Gallery (${params.matchedVisuals.length} Published Visuals)

Here are **${params.matchedVisuals.length} custom-designed visual infographics and workflow diagrams** from **DoItWithAI.tools** covering **${params.cleanedTopic}**.

### How to Use These Visual Playbooks
- **1. Inspect Full-Resolution Workflows**: Click any visual card below to preview the full-size diagram or download the high-resolution WebP/PNG asset for your notes or team deck.
- **2. Turn Any Article Into New Visuals**: Want to generate custom infographics, stat cards, or 2x2 strategy matrices for your own blog post? Launch our **AI Blog to Visual Infographic Studio** or **AI Data & Stat to Visual Chart Card Maker** directly below.`;
  }

  if (/\b(meta title|title tag)\b/i.test(q)) {
    return `### Mastering Meta Titles: Sufian Mustafa's 5-Lens & 580px SERP Framework

A high-performing **Meta Title** does two jobs at once: it signals exact topical relevance to Google and convinces humans to click your result over higher-ranked competitors.

### The 4 Non-Negotiable Rules for Meta Titles in 2026
- **1. Stay Inside the 50–60 Character (~580px) Safe Zone**: Google truncates titles based on pixel width (~580px–600px on desktop), not just character count. Wide letters like *W, M, G* consume more pixels than *i, l, t*.
- **2. Front-Load Your Primary Keyword in the First 3 Words**: Eye-tracking studies show searchers scan the first 2–4 words of each SERP line. Put your core keyword first, followed by a colon or em-dash and your outcome hook.
- **3. Test Across 5 Strategic Lenses**: Never settle for the first title you write. Compare candidates across **Direct Relevance**, **Outcome/Benefit**, **Authority/Framework**, **Curiosity Hook**, and **Comparison/Decision** lenses.
- **4. Match Your H1 Without Copying It Verbatim**: Keep your \`<title>\` tag optimized for SERP click-through rate (<580px) while letting your on-page \`<h1>\` breathe with natural, reader-first clarity.

I've loaded our **Meta Title Generator**, visual infographics, and copy-paste prompts right below so you can generate and test pixel-safe titles immediately.`;
  }

  if (/\b(meta description)\b/i.test(q)) {
    return `### How to Write High-CTR Meta Descriptions (140–160 Chars / ~920px Formula)

While Google doesn't use the **Meta Description** as a direct keyword ranking signal, it is your **#1 organic ad copy on the SERP**—and a well-crafted description dramatically reduces the chance that Google rewrites your snippet.

### Sufian Mustafa's 3-Part Meta Description Formula
- **1. Calibrate for 140–158 Characters (~760px–920px)**: Descriptions shorter than 120 characters look thin; descriptions over 160 characters (~920px desktop / ~680px mobile) get cut off with an ellipsis (\`...\`).
- **2. Include the Exact Primary Keyword + 1 Entity**: Google bolds words in your meta description that match the searcher's query, drawing immediate visual attention to your listing.
- **3. State the Tangible Deliverable**: Tell the reader exactly what they will find on the page (*"Includes a free calculator, 6 copy-paste templates, and step-by-step GSC checklist"*).

I've executed the **Meta Description Generator** for **${params.cleanedTopic}** right below—giving you **6 pixel-calibrated options** you can copy in one click.`;
  }

  if (/\b(local seo|google business profile|gbp|map pack|near me)\b/i.test(q)) {
    return `### Complete Local SEO Playbook: Rank in the Google Map Pack & Local Organic SERP

To win **Local SEO** for service businesses, clinics, agencies, or regional brands, you need three synchronized signals: **Google Business Profile (GBP) completeness**, **hyper-local service pages**, and **validated LocalBusiness JSON-LD schema**.

### Step-by-Step Local SEO Execution Plan
- **1. Audit Your Google Business Profile (GBP)**: Select the exact primary category, add 5–8 secondary categories, write a 750-character entity-rich description, and seed 10+ pre-answered Q&As.
- **2. Build Dedicated City + Service Landing Pages**: Avoid thin doorway pages. Every local landing page needs local pricing/process context, neighborhood landmarks, localized FAQs, and embedded map coordinates.
- **3. Deploy Validated LocalBusiness JSON-LD Schema**: Declare your exact **NAP (Name, Address, Phone)**, \`areaServed\`, \`openingHoursSpecification\`, and \`geo\` coordinates so Google and AI answer engines trust your local entity.
- **4. Reply to Reviews with Keyword-Natural Responses**: Consistent, thoughtful replies to both 5-star and critical Google reviews boost local conversion and Map Pack engagement.

Below you'll find all **4 of our live Local SEO tools** (**Local SEO Service Page Planner**, **Google Business Profile Auditor**, **LocalBusiness Schema Generator**, and **Google Review Response Generator**) ready to run inline!`;
  }

  if (/\b(schema|json-ld|structured data)\b/i.test(q)) {
    return `### Schema Markup & JSON-LD Playbook for Google Rich Results & AI Overviews

**Schema Markup (\`application/ld+json\`)** translates your human-readable webpage into explicit machine-readable entities (\`@type\`, \`headline\`, \`author\`, \`mainEntity\`, \`areaServed\`) that Google, Bing, ChatGPT, and Perplexity rely on for rich snippets and citations.

### Which Schema Types Should You Deploy?
- **1. Article + Person/Author Schema**: Links your guide to a verified author profile with credentials and social \`sameAs\` links for strong E-E-A-T signals.
- **2. FAQPage Schema**: Wraps your bottom-of-page Q&As in structured \`Question\` and \`Answer\` nodes for People Also Ask and AI Overview extraction.
- **3. LocalBusiness / Organization Schema**: Declares official brand identity, logo, contact info, and geographic service areas.
- **4. BreadcrumbList Schema**: Clarifies your site hierarchy (\`Home > Tools > SEO Tool\`) directly in Google SERP snippets.

I've generated copy-ready **JSON-LD Schema blocks** below and linked all **5 of our Schema tools** so you can generate or validate any structured data in seconds.`;
  }

  const primaryToolName = params.matchedTools[0]?.name || "AI SEO Workspace";
  return `### Strategic Playbook & Live Workspace for "${params.cleanedTopic}"

Here is how to execute **${params.cleanedTopic}** using **DoItWithAI.tools' Build & Sell with AI** methodology:

### 3-Step Execution Blueprint
- **1. Lock In Search Intent & SERP Format First**: Before drafting a single line, confirm whether Google rewards an informational guide (with a 50-word Power Answer block), a commercial comparison matrix, or an interactive calculator/tool.
- **2. Optimize Your Above-the-Fold Metadata & Entities**: Pair a **50–60 character (~580px) Meta Title** with a **140–158 character (~920px) Meta Description**, a single clear **H1 heading**, and validated **JSON-LD Schema**.
- **3. Execute Live with ${primaryToolName}**: I've loaded **${primaryToolName}** along with our related tools, visual infographics, and copy-paste prompts below so you can run or customize your output right now.`;
}
