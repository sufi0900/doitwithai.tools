/** Frontend editorial registry. Only ready guides are exposed through details.ts. */
export const promptCategories = [
  { id: "all", name: "All workflows", description: "Explore published guides" },
  {
    id: "on-page",
    name: "On-page SEO",
    description: "Titles, headings, and page structure",
  },
  {
    id: "technical",
    name: "Technical SEO",
    description: "Crawling and technical review",
  },
  {
    id: "keywords",
    name: "Keyword research",
    description: "Intent and topic planning",
  },
  {
    id: "content",
    name: "Content writing",
    description: "Clearer drafts and useful answers",
  },
  {
    id: "off-page",
    name: "Off-page SEO",
    description: "Outreach and link opportunities",
  },
  {
    id: "ai-search",
    name: "AI search",
    description: "Answer clarity and source review",
  },
] as const;
export type CategoryId = (typeof promptCategories)[number]["id"];
export type PromptPreview = {
  id: string;
  category: Exclude<CategoryId, "all">;
  title: string;
  description: string;
  outcome: string;
  tags: string[];
  inputs: string[];
  template: string;
  checks: string[];
  tool: { name: string; href: string };
};
export const promptPreviews: PromptPreview[] = [
  {
    id: "topic-clustering-authority",
    category: "keywords",
    title: "94 topic clustering, pillar pages & topical authority prompts",
    description:
      "Nine workflows for 3-tier topical maps, SERP overlap clustering, Pillar Page blueprints, semantic entity gaps, Hub & Spoke internal link matrices, X vs. Y commercial spokes, and cannibalization audits.",
    outcome: "A complete Pillar-and-Spoke topical map & internal link matrix",
    tags: [
      "Topic clustering",
      "Topical authority",
      "Pillar pages",
      "Internal linking",
      "Cannibalization",
      "Entity SEO",
    ],
    inputs: ["Pillar", "Persona", "Inventory"],
    template:
      "Act as a Principal Topical Authority Architect. Map {{Pillar}} for {{Persona}} using {{Inventory}} into a cannibalization-free Pillar and Spoke cluster with bidirectional internal links.",
    checks: [
      "1 intent = 1 canonical URL.",
      "Set Pillar vs. Spoke scope.",
      "Link every spoke up to Hub.",
    ],
    tool: {
      name: "AI Topical Map Generator",
      href: "/tools/topical-map-generator",
    },
  },
  {
    id: "infographic-data-visualization",
    category: "content",
    title: "77 infographic, data visualization, chart & diagram prompts",
    description:
      "Eight visual workflows for 8-node blog infographics, Bar/Line/Donut chart cards, 2×2 strategy matrices, SWOT grids, circular flywheels, 1000×1500 Tall Pinterest Pins, and 1-page HTML cheat sheets.",
    outcome: "Structured 8-node infographics, chart cards & 2×2 diagrams",
    tags: [
      "Infographics",
      "Data visualization",
      "2x2 matrix",
      "Pinterest pins",
      "Charts",
      "HTML cheatsheets",
    ],
    inputs: ["Source", "Format", "Audience"],
    template:
      "Act as a Principal Information Designer. Convert {{Source}} into {{Format}} for {{Audience}} with 12-word visual nodes, insight-led chart titles, and WCAG AA contrast.",
    checks: [
      "Keep nodes under 15 words.",
      "Verify exact source numbers.",
      "Add descriptive alt text.",
    ],
    tool: {
      name: "AI Blog to Infographic Studio",
      href: "/tools/blog-to-infographic-generator",
    },
  },
  {
    id: "linkedin-personal-branding",
    category: "content",
    title: "83 LinkedIn personal branding, carousels & B2B growth prompts",
    description:
      "Eight B2B workflows for LinkedIn Headlines & Featured shelves, 140-character mobile fold hooks, founder teardowns, 7-slide PDF carousels, founder memo cards, strategic commenting, and warm DMs.",
    outcome: "Mobile-tested LinkedIn posts, PDF carousels & B2B pipeline hooks",
    tags: [
      "LinkedIn personal branding",
      "ChatGPT prompts for LinkedIn",
      "B2B thought leadership prompts",
      "LinkedIn carousel hooks",
      "Founder personal brand",
      "LinkedIn post generator prompts",
      "PDF carousels",
      "B2B social selling",
    ],
    inputs: ["Profile", "Audience", "Proof"],
    template:
      "Act as a senior B2B LinkedIn Strategist. Draft a high-signal post or carousel for {{Profile}} speaking to {{Audience}} backed by {{Proof}} with a 140-character mobile fold hook.",
    checks: [
      "Check 140c mobile fold.",
      "Strip 1-line broetry fluff.",
      "Pair with a visual or carousel.",
    ],
    tool: {
      name: "LinkedIn Fold Previewer & Formatter",
      href: "/tools/linkedin-post-formatter",
    },
  },
  {
    id: "link-building-digital-pr",
    category: "off-page",
    title: "88 link building, Digital PR & journalist outreach prompts",
    description:
      "Eight workflows for citable data studies, Digital PR hooks, 150-word HARO/journalist quotes, 95-word personalized cold outreach, competitor backlink gaps, unlinked mentions, and anchor safety.",
    outcome: "A Digital PR study plan, journalist quote & outreach sequence",
    tags: [
      "Link building",
      "Digital PR",
      "HARO pitches",
      "Cold outreach",
      "Backlink gap",
      "Unlinked mentions",
    ],
    inputs: ["Asset", "Prospect", "Proof"],
    template:
      "Act as a senior Digital PR Strategist. Pitch {{Asset}} to {{Prospect}} backed by {{Proof}} with a concise 150-word journalist quote or 95-word editorial outreach email.",
    checks: [
      "Verify every cited stat.",
      "Keep emails under 100 words.",
      "Check anchor text naturalness.",
    ],
    tool: {
      name: "Digital PR & Linkable Asset Planner",
      href: "/tools/digital-pr-linkable-asset-planner",
    },
  },
  {
    id: "technical-seo-audit-schema",
    category: "technical",
    title: "76 Technical SEO audit, JSON-LD schema & Core Web Vitals prompts",
    description:
      "Eight technical workflows for robots.txt & XML sitemaps, GSC 'Crawled - currently not indexed' triage, 1-hop redirect rules, @graph JSON-LD schema, Core Web Vitals (LCP/INP/CLS), and dev tickets.",
    outcome: "Verified robots.txt, 1-hop redirects, @graph schema & CWV fixes",
    tags: [
      "Technical SEO",
      "JSON-LD schema",
      "Core Web Vitals",
      "Robots.txt",
      "Redirects",
      "GSC indexing",
    ],
    inputs: ["Site", "Findings", "Goals"],
    template:
      "Act as a Principal Technical SEO Architect. Audit {{Site}} using {{Findings}} to achieve {{Goals}} across robots.txt, canonicals, 1-hop 301s, @graph JSON-LD, and Core Web Vitals.",
    checks: [
      "Confirm 200-OK canonicals.",
      "Validate @graph JSON-LD.",
      "Verify server HTML parity.",
    ],
    tool: {
      name: "Structured Data & Schema Validator",
      href: "/tools/structured-data-validator",
    },
  },
  {
    id: "ai-search-aeo-geo",
    category: "ai-search",
    title: "91 AI Search, AEO, GEO & LLM citation prompts",
    description:
      "Nine workflows for 50-word self-contained AI citation passages, Knowledge Graph entity triples, GEO benchmark stats, comparison matrices, /llms.txt indexes, and AI brand visibility audits.",
    outcome: "Extractable answer blocks, @graph schema & AI citation readiness",
    tags: [
      "AI search",
      "AEO",
      "GEO",
      "LLMs.txt",
      "AI Overviews",
      "Entity SEO",
    ],
    inputs: ["Entity", "Queries", "Sources"],
    template:
      "Act as a senior AI Search (AEO / GEO) Strategist. Optimize {{Entity}} for {{Queries}} using {{Sources}} with 50-word entity-explicit citation passages, comparison tables, and JSON-LD @graph.",
    checks: [
      "Remove pronoun ambiguity.",
      "Verify sample sizes & dates.",
      "Validate @graph JSON-LD.",
    ],
    tool: {
      name: "AI Citation & Snippet Optimizer",
      href: "/tools/ai-citation-readiness-checker",
    },
  },
  {
    id: "local-seo-gbp",
    category: "on-page",
    title: "79 Local SEO & Google Business Profile prompts",
    description:
      "Eight workflows for GBP categories & 750c descriptions, policy-safe GBP Update posts, anti-doorway city service pages, Google review replies, NAP citations, and LocalBusiness JSON-LD.",
    outcome: "A complete Google Business Profile, city page & review system",
    tags: [
      "Local SEO",
      "Google Business Profile",
      "Google reviews",
      "City pages",
      "LocalBusiness schema",
    ],
    inputs: ["Business", "Location", "Proof"],
    template:
      "Act as a senior Local SEO Strategist. Optimize {{Business}} serving {{Location}} with {{Proof}} across GBP categories, city service pages, review replies, and LocalBusiness schema.",
    checks: [
      "Follow GBP naming guidelines.",
      "Avoid doorway city cloning.",
      "Match NAP across all directories.",
    ],
    tool: {
      name: "GBP Completeness Auditor",
      href: "/tools/google-business-profile-auditor",
    },
  },
  {
    id: "on-page-seo-writing",
    category: "on-page",
    title: "84 on-page SEO, headings, E-E-A-T & readability prompts",
    description:
      "Eight editorial workflows for question-led H1–H3 outlines, 45-word Featured Snippets, E-E-A-T Information Gain, Grade 8 readability editing, internal links, and content refreshes.",
    outcome: "A structured, evidence-backed & readable SEO article",
    tags: [
      "On-page SEO",
      "Heading structure",
      "Featured snippets",
      "E-E-A-T",
      "Readability",
    ],
    inputs: ["Topic", "Reader", "Evidence"],
    template:
      "Act as a senior On-Page SEO Editor. Plan and edit {{Topic}} for {{Reader}} using {{Evidence}} with question-led H1–H3 headings, 45-word snippet answers, and active prose.",
    checks: [
      "Check H1–H3 order.",
      "Verify first-hand proof.",
      "Read aloud for flow.",
    ],
    tool: {
      name: "On-Page AI SEO Analyzer",
      href: "/tools/on-page-ai-seo-analyzer",
    },
  },
  {
    id: "youtube-video-scripts",
    category: "content",
    title: "93 YouTube, Shorts, Reels & TikTok script prompts",
    description:
      "Nine production workflows for Title + Thumbnail CTR packaging, 0–3s visual hooks, 150-WPM teleprompter scripts, TikTok Search SEO, B-roll shot lists, and Transcript-to-Blog repurposing.",
    outcome: "A high-retention video script, hook pack & packaging brief",
    tags: [
      "YouTube scripts",
      "YouTube Shorts",
      "TikTok hooks",
      "Instagram Reels",
      "Thumbnails",
    ],
    inputs: ["Topic", "Viewer", "Format"],
    template:
      "Act as a senior YouTube Retention Producer. Package and script {{Topic}} for {{Viewer}} in {{Format}} paced at 150 WPM with 0–3s visual hooks and zero fluff.",
    checks: [
      "Confirm click promise at 0:00.",
      "Read aloud at 150 WPM.",
      "Add B-roll cues every 7s.",
    ],
    tool: {
      name: "Short-Form Video Script Builder",
      href: "/tools/short-form-video-script-generator",
    },
  },
  {
    id: "content-repurposing",
    category: "content",
    title: "87 content repurposing & social media prompts",
    description:
      "Nine workflows to atomize any pillar blog post or video into LinkedIn posts, 5-slide carousels, visual infographics, X threads, Pinterest 2:3 pins, and newsletters.",
    outcome: "A multi-channel repurposed campaign & visual blueprint",
    tags: [
      "Content repurposing",
      "LinkedIn posts",
      "Carousels",
      "Infographics",
      "Pinterest pins",
    ],
    inputs: ["Source", "Audience", "Channels"],
    template:
      "Act as a senior B2B content repurposing strategist. Slice {{Source}} for {{Audience}} across {{Channels}} into standalone micro-assets without inventing metrics.",
    checks: [
      "Verify source statistics.",
      "Check mobile fold cutoffs.",
      "Pair posts with visual cards.",
    ],
    tool: {
      name: "Blog to Infographic Studio",
      href: "/tools/blog-to-infographic-generator",
    },
  },
  {
    id: "keyword-research",
    category: "keywords",
    title: "100 keyword research prompts",
    description:
      "Explore ten workflows for discovery, intent, competitors, clustering, FAQs, YouTube, local businesses, and agency delivery.",
    outcome: "A reviewed keyword research workflow",
    tags: [
      "Keyword research",
      "Long-tail keywords",
      "YouTube",
      "Clustering",
      "FAQs",
    ],
    inputs: ["Business", "Audience", "Market"],
    template:
      "Create a keyword research plan for {{Business}}, serving {{Audience}} in {{Market}}. Separate keyword ideas from observed data. Never invent search metrics.",
    checks: [
      "Use identified source data.",
      "Review page fit.",
      "Preserve uncertainty.",
    ],
    tool: {
      name: "Keyword Research Tool",
      href: "/tools/keyword-research-tool",
    },
  },
  {
    id: "search-intent",
    category: "keywords",
    title: "ChatGPT prompts for search intent",
    description:
      "Six prompts to interpret queries, review result notes, resolve mixed intent, and plan useful content.",
    outcome: "An evidence-aware content plan",
    tags: ["Search intent", "Keyword intent", "Content strategy"],
    inputs: ["Keywords", "Audience and market", "Observed results"],
    template:
      "Review {{Keywords}} for {{Audience and market}}. Use {{Observed results}} only as supplied evidence. Identify likely intent, reader task, exact cues, and uncertainty. Never invent browsing or keyword metrics.",
    checks: ["Verify cues.", "Inspect current results."],
    tool: {
      name: "Search Intent Checker",
      href: "/tools/search-intent-checker",
    },
  },

  {
    id: "meta-title",
    category: "on-page",
    title: "ChatGPT prompts for meta titles and descriptions",
    description:
      "Nine focused prompts to brief, draft, compare, and refine your title-description pair.",
    outcome: "A clear, supported title and description pair",
    tags: [
      "Meta titles",
      "Meta descriptions",
      "Search intent",
      "Page types",
      "Bulk editing",
    ],
    inputs: ["Page summary", "Primary keyword", "Target reader"],
    template:
      "Act as an SEO editor. Use the page summary below to write five distinct meta title options. Match the reader’s goal. Use the primary keyword naturally without repeating it. Keep claims supported by the summary. Vary the wording and explain each option briefly. Do not promise rankings.\n\nPage summary: {{Page summary}}\nPrimary keyword: {{Primary keyword}}\nTarget reader: {{Target reader}}\n\nReturn a table with title, character count, and rationale. Pixel width must be checked separately.",
    checks: [
      "Confirm each title matches the page.",
      "Check pixel width in a search preview.",
      "Remove unsupported promises.",
    ],
    tool: { name: "Meta Title Generator", href: "/tools/meta-title-generator" },
  },
  {
    id: "heading-plan",
    category: "on-page",
    title: "Give your headings a clear job",
    description:
      "Build an H1, H2, and H3 outline around real reader questions.",
    outcome: "A heading outline with section goals",
    tags: ["Headings", "Content structure"],
    inputs: ["Topic", "Primary keyword", "Target reader"],
    template:
      "Create a useful heading plan for {{Topic}}. The primary keyword is {{Primary keyword}}. Write for {{Target reader}}. Provide one descriptive H1, logical H2 sections, and H3 subtopics only where useful. Give each section a reader question and a short coverage note. Avoid repeating the keyword in every heading. Do not invent search volume or competitor findings.",
    checks: [
      "Check heading order.",
      "Remove overlapping sections.",
      "Ensure the H1 adds context to the keyword.",
    ],
    tool: {
      name: "Heading Structure Analyzer",
      href: "/tools/heading-structure-analyzer",
    },
  },
  {
    id: "technical-triage",
    category: "technical",
    title: "Turn crawl findings into next steps",
    description:
      "Organize supplied crawl findings by impact, evidence, and the next check.",
    outcome: "A prioritized technical review checklist",
    tags: ["Crawling", "Prioritization"],
    inputs: ["Crawl findings", "Site context"],
    template:
      "Review the supplied technical findings for {{Site context}}. Findings: {{Crawl findings}}. Separate confirmed issues from items needing investigation. Group them by indexability, redirects, canonicals, and internal navigation. For each, show the supplied evidence, likely impact, next verification step, and suggested fix. Do not claim to have crawled the site. Mark missing evidence as unknown.",
    checks: [
      "Verify status codes and directives.",
      "Check suggested fixes on a test page.",
      "Keep unknowns separate from confirmed errors.",
    ],
    tool: {
      name: "On-page AI SEO Analyzer",
      href: "/tools/on-page-ai-seo-analyzer",
    },
  },
  {
    id: "keyword-intent",
    category: "keywords",
    title: "Find the intent behind a keyword list",
    description:
      "Group your own keywords by likely intent without inventing metrics.",
    outcome: "Keyword groups and suggested page types",
    tags: ["Search intent", "Clustering"],
    inputs: ["Keyword list", "Site context"],
    template:
      "Group the supplied keywords for {{Site context}} by topic and likely search intent. Keywords: {{Keyword list}}. Suggest a useful page type for each group. Explain uncertain classifications. Use only supplied metrics. Do not invent volume, difficulty, or live search results. Flag groups that need a manual search results review before deciding whether to combine pages.",
    checks: [
      "Review current results manually.",
      "Check whether grouped terms need separate pages.",
      "Use a trusted source for volume and difficulty.",
    ],
    tool: { name: "Explore keyword tools", href: "/tools" },
  },
  {
    id: "readability",
    category: "content",
    title: "Make a dense paragraph easier to read",
    description:
      "Keep the meaning and useful detail while improving sentence flow.",
    outcome: "A revised passage and a change summary",
    tags: ["Readability", "Editing"],
    inputs: ["Original text", "Target reader"],
    template:
      "Edit this passage for {{Target reader}}: {{Original text}}. Preserve facts, qualifications, links, and the author’s meaning. Use familiar words and varied sentence lengths. Keep list items separate. Avoid adding claims or making every sentence equally short. Return the revised passage, then explain the three most useful changes. Flag unclear facts instead of guessing.",
    checks: [
      "Compare the original meaning.",
      "Keep necessary technical terms.",
      "Read the revision aloud.",
    ],
    tool: { name: "Readability Checker", href: "/tools/readability-checker" },
  },
  {
    id: "outreach",
    category: "off-page",
    title: "Plan outreach with a useful reason",
    description:
      "Develop a relevant outreach angle from information you already have.",
    outcome: "A short outreach draft and relevance checklist",
    tags: ["Outreach", "Digital PR"],
    inputs: ["Your resource", "Recipient context"],
    template:
      "Draft a concise outreach email using this resource: {{Your resource}}. Recipient context: {{Recipient context}}. Explain the specific value to their readers. Do not invent familiarity, traffic metrics, endorsements, or links. Avoid pressure and exaggerated praise. Include a subject line, short email, and a checklist of details to verify before sending. Do not send anything.",
    checks: [
      "Verify the recipient and relevance.",
      "Check every factual statement.",
      "Personalize before sending.",
    ],
    tool: { name: "Browse SEO tools", href: "/tools" },
  },
  {
    id: "answer-review",
    category: "ai-search",
    title: "Lead with an answer readers can use",
    description:
      "Review an opening paragraph for clarity, context, and a useful direct answer.",
    outcome: "An opening paragraph review and revision",
    tags: ["Answer clarity", "AI search"],
    inputs: ["Reader question", "Opening paragraph"],
    template:
      "Review this opening paragraph: {{Opening paragraph}}. The reader’s question is {{Reader question}}. Check whether the full paragraph answers the question, identifies the subject clearly, and includes useful context. Explain what is missing, then offer a revision using only supplied facts. Do not predict AI citations or guarantee visibility. Suggest evidence that needs checking separately.",
    checks: [
      "Confirm the answer matches the question.",
      "Keep necessary context and qualifications.",
      "Verify factual claims and sources.",
    ],
    tool: {
      name: "On-page AI SEO Analyzer",
      href: "/tools/on-page-ai-seo-analyzer",
    },
  },
];
export function filterPreviews(
  category: CategoryId,
  query: string,
  items: readonly PromptPreview[] = promptPreviews,
): PromptPreview[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      terms.every((term) =>
        [
          p.title,
          p.description,
          ...p.tags,
          promptCategories.find((c) => c.id === p.category)?.name,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term),
      ),
  );
}
export function fillPreview(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(
    /\{\{([^{}]+)\}\}/g,
    (placeholder, key) => values[key]?.trim() || placeholder,
  );
}
