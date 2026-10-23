export const articleSlug =
  "chatgpt-prompts-for-meta-title-and-meta-description";
export const contextFields = [
  "Page content",
  "Primary keyword",
  "Target reader",
  "Brand name",
  "Page type",
  "Current title",
  "Current description",
  "Related pages",
] as const;
export type ContextField = (typeof contextFields)[number];
export const exampleContext: Record<ContextField, string> = {
  "Page content":
    "A guide to writing image alt text. It explains when images need descriptions, with examples for product images and charts. It also covers decorative images.",
  "Primary keyword": "image alt text",
  "Target reader": "Bloggers and small business website owners",
  "Brand name": "Example Studio",
  "Page type": "Informational article",
  "Related pages":
    "Page ID: guide-alt-text\nSummary: A guide to writing alt text, with chart examples.\nCurrent title: Image SEO Guide\nCurrent description: Learn how to write descriptions for charts and product images.\n\nPage ID: alt-text-tool\nSummary: An interactive tool that drafts alt text from supplied image context.\nCurrent title: Image SEO Guide\nCurrent description: Create a draft image description from your own context.",
  "Current title": "The Ultimate Image SEO Guide",
  "Current description":
    "Learn the best secrets to rank every image first with amazing SEO strategies.",
};
const source = `# Page context\nPage content: {{Page content}}\nPrimary keyword: {{Primary keyword}}\nTarget reader: {{Target reader}}\nBrand name, if useful: {{Brand name}}\nPage type: {{Page type}}`;
const corePromptSeries = [
  {
    id: "page-brief",
    label: "Understand",
    title: "Extract the page brief before writing",
    intro:
      "Use this when the page is long or its main promise is unclear. Give ChatGPT the actual content or an accurate summary.",
    after:
      "Compare the extracted brief with the page. Correct invented details before moving to title generation.",
    template: `You are a careful SEO editor. Build a factual page brief from the supplied material.\n\n${source}\n\n# Task\nIdentify the page topic, reader question, useful examples, content type, and supported benefit. Separate supplied facts from reasonable interpretations. List missing details as questions. Do not add statistics, features, rankings, or results.\n\n# Output\nReturn a concise brief with those five fields, then a list of claims that would need evidence. Do not draft metadata yet.`,
  },
  {
    id: "title-options",
    label: "Draft titles",
    title: "Write five titles with distinct angles",
    intro:
      "Ask for different editorial choices, rather than five rearrangements of one keyword. Keep the page topic easy to recognize.",
    after:
      "Choose the angle that reflects the page. A specific, accurate title is more useful than a dramatic promise the content cannot deliver.",
    template: `Act as an SEO editor. Draft five distinct meta title options from the supplied context.\n\n${source}\n\n# Requirements\nUse the topic and primary keyword naturally. Consider a practical how-to angle, an examples angle, and a clear audience angle when the page supports them. Keep the subject recognizable without relying on a previous search result. Do not force the brand into every option. Avoid repeated keywords, invented numbers, unsupported superlatives, and claims about AI citations.\n\n# Output\nReturn a table with title, editorial angle, and why it matches the page. Treat any character count as approximate. Do not claim to measure pixels. Flag wording that needs factual verification.`,
  },
  {
    id: "description-options",
    label: "Draft descriptions",
    title: "Explain the page’s value in three descriptions",
    intro:
      "A description should tell readers what they will find. Supply the selected title if you want both elements to work together.",
    after:
      "Read the title and description together. Remove repeated phrases when the space could explain an example, limitation, or useful next step.",
    template: `Write three meta description options for this page.\n\n${source}\nSelected or current title: {{Current title}}\n\n# Requirements\nDescribe the actual content and the reader’s likely task. Use specific examples only when present in the source. Make each description understandable on its own. Use the topic naturally and avoid keyword lists. Complement the title instead of repeating it. Do not invent benefits or promise rankings, clicks, or AI citations.\n\n# Output\nFor each option, show the description, the supported detail it emphasizes, and any claim needing review. Keep wording concise without treating a fixed character count as a Google rule.`,
  },
  {
    id: "pair-review",
    label: "Connect",
    title: "Review the title and description as one pair",
    intro:
      "Use this after selecting a draft. It checks the promise across both fields, instead of judging two isolated pieces of text.",
    after:
      "If the pair promises a complete guide, check that the page delivers one. Narrow the wording when the content has a smaller scope.",
    template: `Review this metadata pair against the supplied page content.\n\n${source}\nTitle: {{Current title}}\nDescription: {{Current description}}\n\n# Review\nCheck topic consistency, reader intent, duplicated wording, clear subject names, and unsupported claims. Quote the phrase behind each concern. Explain whether the source supports it. Do not infer facts from the keyword alone.\n\n# Output\nReturn a table with observed wording, issue, supporting page evidence, and suggested correction. Mark unknown facts as needing review. Then provide two revised title-description pairs with different supported angles. Do not assign ranking or citation probabilities.`,
  },
  {
    id: "final-edit",
    label: "Refine",
    title: "Make the final edit without changing the facts",
    intro:
      "Use this to tighten an otherwise accurate pair. Keep the exact meaning and important qualifications while removing unnecessary words.",
    after:
      "Preview the final pair with your website’s title suffix. Check the actual rendered width, then publish through your website editor.",
    template: `Edit the following metadata pair conservatively.\n\n${source}\nTitle: {{Current title}}\nDescription: {{Current description}}\n\n# Editing rules\nPreserve factual scope and the main subject. Remove vague openings, repeated keywords, and unsupported promises. Keep language natural. Do not replace precise terms with misleading shorter ones. Explain every meaningful change. If a claim cannot be supported, flag it rather than inventing evidence.\n\n# Output\nReturn the edited title and description, a short change log, and a human review checklist. Include a reminder to check display width in a preview tool. Do not claim the wording guarantees Google rankings or AI citations.`,
  },
];

// Distinct editing tasks extend the core sequence without repeating the same generation request.
const intentPrompt = {
  id: "reader-intent",
  label: "Match the task",
  title: "Choose an angle that matches the reader’s task",
  intro:
    "Use this when several title angles seem plausible. Work from the page itself before guessing what a searcher wants.",
  after:
    "Treat these as interpretations. Check actual search results separately when search intent is uncertain.",
  template: `Review the likely reader task for this page. Do not browse or claim to have inspected live search results.\n\n${source}\n\n# Task\nSummarize the question the page answers. Identify whether its supplied content mainly teaches, compares, offers a product, or explains a service. Point to the material supporting that interpretation. Separate the main task from secondary tasks.\n\n# Metadata direction\nSuggest three title-description angles. For each, show the reader task, the specific page evidence, a draft pair, and what the pair deliberately leaves out. Avoid invented prices, locations, results, and promises. Keep the subject clear to someone seeing the pair without surrounding context.\n\n# Review\nList any uncertainty that could change the recommended angle. Do not invent keyword volume, difficulty, ranking position, or AI citation likelihood.`,
};
const pageTypePrompt = {
  id: "page-type",
  label: "Adapt the format",
  title: "Adapt the pair for an article, product, or service page",
  intro:
    "The useful detail changes with the page type. A product page may need a model name, while a guide may need its practical examples.",
  after:
    "Check that the suggested details are actually present. Do not add shipping terms, local availability, or guarantees from memory.",
  template: `Adapt the metadata to the supplied page type.\n\n${source}\nCurrent title: {{Current title}}\nCurrent description: {{Current description}}\n\n# Requirements\nFor an article, emphasize the question answered and useful examples. For a product page, use only supplied product names, models, and distinguishing facts. For a service page, use only supplied services, audience details, and confirmed locations. If the page type is missing or unclear, ask one focused question.\n\nKeep the title and description specific to this page. Avoid stock phrases that could describe any website. Do not invent prices, ratings, stock status, credentials, delivery terms, or results.\n\n# Output\nReturn two different pairs, each followed by the facts used, the intended reader task, and details that need checking. Explain how the page type affected the wording.`,
};
const rewritePrompt = {
  id: "rewrite-review",
  label: "Investigate wording",
  title: "Review a title that differs from the search result",
  intro:
    "Use this when your saved title and the visible search title differ. This prompt reviews the wording without claiming to diagnose Google’s systems.",
  after:
    "A wording review cannot establish why Google changed a title. Compare the page, template, and observed search result before making changes.",
  template: `Review possible wording issues in this page title.\n\n${source}\nSaved title: {{Current title}}\nSaved description: {{Current description}}\nObserved search title, if available: [paste the exact observed title, query, device, and observation date]\n\n# Review only the supplied evidence\nCheck whether the saved title is vague, repeated boilerplate, incomplete, outdated, or inconsistent with the page’s main topic. Distinguish an observed mismatch from a confirmed problem. A query-specific display difference is not proof that the page is penalized.\n\n# Output\nReturn each observation, its evidence, what remains unknown, and a possible editorial improvement. Offer two accurate replacement pairs only if the supplied content supports them. List the site checks still needed, including the rendered title element and the main visible heading. Do not state a definite cause for a search engine rewrite.`,
};
const batchPrompt = {
  id: "unique-pages",
  label: "Check uniqueness",
  title: "Separate similar titles across a small page group",
  intro:
    "Use this for a supplied set of related pages. It distinguishes useful page differences without claiming to crawl the website.",
  after:
    "Keep one pair per distinct page purpose. If two pages serve the same task, review their content strategy before rewriting their metadata.",
  template: `Review only this supplied page group. Do not claim to crawl URLs or detect site-wide duplication.\n\nRelated pages: {{Related pages}}\n\n# Required source data\nEach row should include a stable page identifier, a content summary, current title, and current description. If a row is incomplete, list the missing fields and skip its rewrite.\n\n# Task\nFlag identical or highly repetitive wording. Identify the real distinction between each pair of pages from the summaries. Separate a metadata similarity from a possible overlap in page purpose. Do not call that overlap proven keyword cannibalization.\n\n# Output\nReturn a table with page identifier, observed overlap, supported unique detail, proposed title, proposed description, and a verification note. Preserve identifiers exactly. Do not add unsupported modifiers merely to make rows look different. Finish with the cases that need a human decision before publication.`,
};
export const metaPromptSeries = [
  corePromptSeries[0],
  intentPrompt,
  corePromptSeries[1],
  corePromptSeries[2],
  pageTypePrompt,
  corePromptSeries[3],
  rewritePrompt,
  batchPrompt,
  corePromptSeries[4],
];
export const promptCount = metaPromptSeries.length;

export function chatGPTLink(prompt: string): string | null {
  // Prefill follows OpenAI's published training-page link convention. Keep Copy available for session differences.
  const url = new URL("https://chatgpt.com/");
  url.searchParams.set("prompt", prompt);
  return url.href.length <= 7000 ? url.href : null;
}
