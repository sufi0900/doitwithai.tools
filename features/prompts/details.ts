import { promptHero, intentPromptHero } from "./article-assets";
import { promptPreviews } from "./catalog";
export type PromptDetail = {
  slug: string;
  ready: boolean;
  title: string;
  description?: string;
  overview: string;
  cover?: { src: string; alt: string; width: number; height: number };
  promptCount?: number;
  example: Record<string, string>;
  output: string;
  exampleNote: string;
  steps: string[];
  mistakes: string[];
};
export const promptDetails: Record<string, PromptDetail> = {
  "search-intent": {
    cover: intentPromptHero,
    slug: "chatgpt-prompts-for-search-intent",
    ready: true,
    promptCount: 6,
    title: "ChatGPT prompts for search intent",
    description:
      "Use six customizable ChatGPT prompts to understand search intent. Review evidence, resolve mixed queries, and choose useful page formats.",
    overview:
      "Understand the reader task before deciding what to publish. Separate wording clues from observed search results and turn reviewed intent into a focused brief.",
    example: {
      Keywords: "how to write a meta title",
      "Audience and market": "New bloggers, English, United States",
      "Observed results": "Not collected. Use wording only.",
    },
    output:
      "Likely informational intent. A practical guide may fit. Confirm against current results before choosing the final format.",
    exampleNote: "Illustrative interpretation, not a live search measurement.",
    steps: [
      "Enter your query.",
      "Collect actual result notes.",
      "Review the evidence.",
      "Choose a focused page purpose.",
    ],
    mistakes: [
      "Inventing search results.",
      "Treating an intent label as a ranking guarantee.",
    ],
  },

  "meta-title": {
    slug: "chatgpt-prompts-for-meta-title-and-meta-description",
    ready: true,
    cover: promptHero,
    promptCount: 9,
    title: "ChatGPT prompts for meta titles and meta descriptions",
    description:
      "Use nine ChatGPT prompts for meta titles and meta descriptions. Customize the page brief, compare drafts, and review your metadata before publishing.",
    overview:
      "Use this workflow when your page has a clear topic but its title feels vague, repetitive, or disconnected from the reader’s goal. Start with an accurate summary, compare distinct angles, then preview your preferred title before publishing.",
    example: {
      "Page summary":
        "A practical guide explaining how to write image alt text, with examples for product images, charts, and decorative images.",
      "Primary keyword": "image alt text",
      "Target reader": "Bloggers and small business website owners",
    },
    output: "How to Write Image Alt Text, With Practical Examples",
    exampleNote:
      "This illustrative title names the task and matches the supplied guide. It does not add unsupported promises about rankings or accessibility compliance.",
    steps: [
      "Summarize the actual page. Include what readers will learn, the examples available, and any important limits.",
      "Choose the main query and reader. Treat the keyword as context, rather than a phrase to repeat in every title.",
      "Customize and copy the prompt. Ask your assistant for alternatives, then compare their meaning before comparing their length.",
      "Select the clearest accurate option. Preview its width, check how it reads with your brand name, and publish it through your website editor.",
    ],
    mistakes: [
      "Using the same title with tiny word changes across several pages.",
      "Adding “best,” a year, or a number that the content cannot support.",
      "Accepting an assistant’s character count without checking it.",
      "Cutting useful meaning just to hit an arbitrary character target.",
    ],
  },
  "heading-plan": {
    slug: "heading-structure-prompts",
    ready: false,
    title: "AI prompts for planning a clear heading structure",
    overview:
      "Plan sections around the questions your reader needs answered. This sample shows a heading workflow before the full guide is prepared.",
    example: {
      Topic: "Writing useful image alt text",
      "Primary keyword": "image alt text",
      "Target reader": "New bloggers",
    },
    output:
      "H1: Write Better Image Alt Text With Practical Examples\nH2: Decide whether the image needs alt text\nH2: Describe the information that matters\nH3: Example for a chart\nH3: Example for a product image",
    exampleNote:
      "Illustrative outline only. Check whether these sections match your actual article.",
    steps: [
      "Explain the topic and audience.",
      "Generate a heading plan.",
      "Remove duplicate or irrelevant sections.",
      "Check the final hierarchy against your draft.",
    ],
    mistakes: [
      "Using headings only to repeat a keyword.",
      "Adding H3s without a useful parent section.",
    ],
  },
  "technical-triage": {
    slug: "technical-seo-review-prompts",
    ready: false,
    title: "AI prompts for reviewing technical SEO findings",
    overview:
      "Use supplied crawl evidence to organize a technical review. This sample does not run a crawl or confirm a site’s configuration.",
    example: {
      "Crawl findings":
        "URL A returns 301 to URL B, which returns 200. URL C has a noindex directive.",
      "Site context": "A small editorial website",
    },
    output:
      "Finding: URL C contains noindex.\nStatus: Requires intent check.\nNext step: Confirm whether this page should appear in search before removing the directive.",
    exampleNote:
      "A directive can be intentional. This example separates an observation from a confirmed problem.",
    steps: [
      "Collect real crawl evidence.",
      "Include the purpose of affected pages.",
      "Ask for prioritization and missing checks.",
      "Verify each finding before changing the site.",
    ],
    mistakes: [
      "Treating every redirect as an error.",
      "Removing noindex without checking the page’s purpose.",
    ],
  },
  "keyword-intent": {
    slug: "keyword-intent-prompts",
    ready: false,
    title: "AI prompts for grouping keywords by search intent",
    overview:
      "Organize a supplied list into tentative topic groups. This sample helps plan your review and does not provide live search metrics.",
    example: {
      "Keyword list":
        "how to write alt text; alt text examples; alt text generator",
      "Site context": "An SEO education site with writing tools",
    },
    output:
      "Tentative group: How to write alt text + alt text examples.\nLikely page type: Practical guide.\nSeparate candidate: Alt text generator.\nLikely page type: Interactive tool.",
    exampleNote:
      "Check current search results before deciding whether the terms belong together.",
    steps: [
      "Supply your own keyword list.",
      "Explain the site and available content.",
      "Review proposed groups and uncertainty.",
      "Check live search results and metrics separately.",
    ],
    mistakes: [
      "Treating inferred intent as verified intent.",
      "Inventing volume or difficulty from wording alone.",
    ],
  },
  readability: {
    slug: "readability-editing-prompts",
    ready: false,
    title: "AI prompts for improving readability without losing meaning",
    overview:
      "Revise a passage while preserving facts, caveats, and the author’s voice. This sample focuses on editing choices rather than an arbitrary score.",
    example: {
      "Original text":
        "Implementation of the proposed changes may facilitate a reduction in the amount of time required to complete the task.",
      "Target reader": "Busy small business owners",
    },
    output: "These changes may help you finish the task faster.",
    exampleNote:
      "The revision keeps “may” because the original does not promise a guaranteed result.",
    steps: [
      "Paste the original passage.",
      "Describe the intended reader.",
      "Compare the revision with the original meaning.",
      "Restore any lost detail and review the flow.",
    ],
    mistakes: [
      "Removing qualifications to make sentences shorter.",
      "Turning every sentence into the same short pattern.",
    ],
  },
  outreach: {
    slug: "seo-outreach-prompts",
    ready: false,
    title: "AI prompts for relevant SEO outreach",
    overview:
      "Draft outreach around a useful resource and a clear audience fit. This sample requires real recipient context and does not send messages.",
    example: {
      "Your resource": "A free guide with original chart alt text examples.",
      "Recipient context":
        "An editor maintaining a public guide to accessible data visualization.",
    },
    output:
      "Subject: Chart alt text examples for your resource guide\n\nHello, your guide covers accessible data visualization. Our resource includes practical examples of chart alt text. If those examples would help your readers, I can share the link for your review.",
    exampleNote:
      "Illustrative draft only. Verify the recipient’s work and replace any inaccurate context before sending.",
    steps: [
      "Check the recipient’s relevant work.",
      "Explain the resource’s specific value.",
      "Draft a brief message.",
      "Verify and personalize it before sending.",
    ],
    mistakes: [
      "Inventing familiarity or endorsements.",
      "Contacting people without a relevant reason.",
    ],
  },
  "answer-review": {
    slug: "answer-first-content-prompts",
    ready: false,
    title: "AI prompts for writing clearer answer-first content",
    overview:
      "Review whether a full opening paragraph answers the reader’s question. This sample supports clarity and does not predict citations in AI answers.",
    example: {
      "Reader question": "What is image alt text?",
      "Opening paragraph":
        "Images play a big role on websites. Many website owners spend time choosing images. There are several things to consider.",
    },
    output:
      "Image alt text is a written description added to an image’s HTML. It helps convey the image’s information when someone uses a screen reader or the image cannot load.",
    exampleNote:
      "This illustrative revision answers the question directly. Relevant examples and qualifications should follow when the topic needs them.",
    steps: [
      "Identify the actual reader question.",
      "Supply the full opening paragraph.",
      "Review whether it gives a useful answer.",
      "Check the revision’s facts and necessary context.",
    ],
    mistakes: [
      "Optimizing only the first sentence.",
      "Claiming direct answers guarantee AI citations.",
    ],
  },
};
export const publishedPrompts = promptPreviews.filter(
  (prompt) => promptDetails[prompt.id]?.ready,
);
export function promptPath(id: string) {
  return `/prompts/${promptDetails[id].slug}`;
}
export function findPromptDetail(slug: string) {
  const prompt = publishedPrompts.find(
    (item) => promptDetails[item.id]?.slug === slug,
  );
  return prompt ? { prompt, detail: promptDetails[prompt.id] } : undefined;
}
