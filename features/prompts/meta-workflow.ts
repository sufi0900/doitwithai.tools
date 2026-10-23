export const articleSlug =
  "chatgpt-prompts-for-meta-title-and-meta-description";
export const contextFields = [
  "Page content",
  "Primary keyword",
  "Target reader",
  "Brand name",
  "Current title",
  "Current description",
] as const;
export type ContextField = (typeof contextFields)[number];
export const exampleContext: Record<ContextField, string> = {
  "Page content":
    "A guide to writing image alt text. It explains when images need descriptions, with examples for product images and charts. It also covers decorative images.",
  "Primary keyword": "image alt text",
  "Target reader": "Bloggers and small business website owners",
  "Brand name": "Example Studio",
  "Current title": "The Ultimate Image SEO Guide",
  "Current description":
    "Learn the best secrets to rank every image first with amazing SEO strategies.",
};
const source = `# Page context\nPage content: {{Page content}}\nPrimary keyword: {{Primary keyword}}\nTarget reader: {{Target reader}}\nBrand name, if useful: {{Brand name}}`;
export const metaPromptSeries = [
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
export function chatGPTLink(prompt: string): string | null {
  // Prefill follows OpenAI's published training-page link convention. Keep Copy available for session differences.
  const url = new URL("https://chatgpt.com/");
  url.searchParams.set("prompt", prompt);
  return url.href.length <= 7000 ? url.href : null;
}
