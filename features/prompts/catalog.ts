/** Editorial previews only. Replace this source with published Sanity documents later. */
export const promptCategories = [
  { id: "all", name: "All workflows", description: "Explore every preview" },
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
): PromptPreview[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return promptPreviews.filter(
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
