export type BlogWriterMode = "full-article" | "intro-hooks" | "section-expander";

export type BlogWriterInput = {
  mode: BlogWriterMode;
  topicOrTitle: string;
  primaryKeyword: string;
  secondaryKeywords: string;
  targetAudience: string;
  tone: "Practical & Authoritative" | "Conversational & Friendly" | "Analytical & Data-Driven" | "Beginner-Friendly Step-by-Step";
  firstHandExperienceNote: string;
  customOutlineOrDraft: string;
};

export type BlogSectionBlock = {
  id: string;
  heading: string;
  level: "H2" | "H3";
  summaryGoal: string;
  bodyMarkdown: string;
  eeatProofPrompt: string;
};

export type BlogWriterPack = {
  h1Title: string;
  metaTitle: string;
  metaDescription: string;
  featuredSnippetAnswer: string;
  introHooks: Array<{
    framework: string;
    hookText: string;
  }>;
  sections: BlogSectionBlock[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  conclusionMarkdown: string;
  fullMarkdown: string;
};

export const DEFAULT_BLOG_WRITER_INPUT: BlogWriterInput = {
  mode: "full-article",
  topicOrTitle: "How to Check Google Keyword Rankings Without Paid Tools",
  primaryKeyword: "check google keyword rankings",
  secondaryKeywords: "google search console average position, striking distance keywords, track keyword rankings free",
  targetAudience: "Non-coder digital marketers, bloggers, and solo founders",
  tone: "Practical & Authoritative",
  firstHandExperienceNote:
    "We audited 90+ tool and blog pages in Google Search Console and found that filtering positions 8–20 ('striking distance') produces the fastest click gains.",
  customOutlineOrDraft:
    "1. Why Manual Incognito Searches Mislead You\n2. How to Check Exact Keyword Positions in Google Search Console\n3. Finding Striking-Distance Keywords (Positions 8–20)\n4. How to Optimize Existing Pages to Jump into the Top 3",
};

export function buildDeterministicBlogPack(
  input: BlogWriterInput,
): BlogWriterPack {
  const topic = input.topicOrTitle.trim() || "Practical Guide";
  const kw = input.primaryKeyword.trim() || topic.toLowerCase();
  const secondaries = input.secondaryKeywords
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const sec1 = secondaries[0] || `${kw} workflow`;
  const sec2 = secondaries[1] || `${kw} best practices`;
  const audience = input.targetAudience.trim() || "practitioners and site owners";
  const proof =
    input.firstHandExperienceNote.trim() ||
    `When testing ${kw} across live pages, focusing on reader intent and verifiable examples consistently outperformed generic summaries.`;

  const outlineLines = input.customOutlineOrDraft
    .split(/\r?\n/)
    .map((l) => l.replace(/^\d+[\.\)]\s*/, "").trim())
    .filter(Boolean);

  const sectionTitles =
    outlineLines.length >= 3
      ? outlineLines.slice(0, 6)
      : [
          `What ${kw.charAt(0).toUpperCase() + kw.slice(1)} Actually Means for ${audience}`,
          `Step-by-Step Workflow: How to Execute ${topic}`,
          `Common Mistakes to Avoid (${sec1})`,
          `How to Verify Quality & Measure Results (${sec2})`,
        ];

  const featuredSnippetAnswer = `To **${kw}** effectively, start by defining the exact reader task, audit your baseline data using verified first-party sources, and structure your page around scannable H2 answer blocks. Rather than relying on guesswork, combine automated workflow checks with human editorial verification before publishing.`;

  const introHooks = [
    {
      framework: "Direct Answer + Practitioner Proof (Best for AI Overviews & SEO)",
      hookText: `${featuredSnippetAnswer}\n\nIn our own testing—${proof.charAt(0).toLowerCase() + proof.slice(1)} Below, you will find the exact step-by-step workflow built for ${audience}.`,
    },
    {
      framework: "Problem–Agitation–Solution (Best for Reader Retention)",
      hookText: `Most guides on **${kw}** repeat the same surface-level advice without showing you what actually happens in real-world execution. That leaves ${audience} wasting hours on trial and error.\n\nHere is a transparent, field-tested system for ${topic}—complete with repeatable steps, verification checks, and examples you can apply today.`,
    },
    {
      framework: "Contrarian Insight Hook (Best for Social & Newsletter Shares)",
      hookText: `You do not need expensive enterprise software or complex code to master **${kw}**. In fact, the highest-leverage improvements come from a focused 15-minute workflow that pairs structured AI assistance with human judgment.`,
    },
  ];

  const sections: BlogSectionBlock[] = sectionTitles.map((heading, idx) => {
    const relatedTerm = secondaries[idx % Math.max(1, secondaries.length)] || kw;
    return {
      id: `sec-${idx + 1}`,
      heading,
      level: "H2",
      summaryGoal: `Give ${audience} a concrete, verifiable explanation and action steps for "${heading}".`,
      bodyMarkdown: [
        `When working on **${heading.toLowerCase()}**, your primary objective is clarity and actionable execution. Instead of treating *${relatedTerm}* as an abstract checklist item, connect it directly to what your reader is trying to accomplish on the page.`,
        "",
        `### Key Execution Steps`,
        `- **Establish your baseline:** Inspect current performance signals and document your starting assumptions clearly.`,
        `- **Apply structured formatting:** Break dense paragraphs into scannable bullet points, comparison tables, or numbered steps so both human readers and AI answer engines can extract the takeaway.`,
        `- **Verify with human judgment:** ${ idx === 0 ? proof : `Cross-check every claim, metric, and recommendation against real user behavior before shipping.` }`,
      ].join("\n"),
      eeatProofPrompt: `E-E-A-T Tip for Section ${idx + 1}: Add 1 real screenshot, metric, or personal example showing how you applied "${heading}" in practice.`,
    };
  });

  const faqs = [
    {
      question: `What is the fastest way to get started with ${kw}?`,
      answer: `Start with a single high-priority page or query rather than auditing your entire site at once. Establish a clean baseline, apply the step-by-step workflow above, and review results after 14 to 28 days.`,
    },
    {
      question: `How does ${sec1} fit into this workflow?`,
      answer: `Evaluating ${sec1} alongside your primary topic ensures you capture supporting long-tail questions on the same canonical URL without creating duplicate pages.`,
    },
    {
      question: `Can beginners and non-coders follow this process?`,
      answer: `Yes. Every step in this guide is designed for ${audience} using no-code tools, clear prompts, and human editorial review.`,
    },
  ];

  const conclusionMarkdown = `## Final Checklist Before You Publish\n\nMastering **${kw}** comes down to consistent execution paired with human quality control. Review your opening 50-word answer block, confirm that every H2 section delivers on its promise for ${audience}, and use your own first-hand testing notes to stand out from generic AI drafts.`;

  const fullMarkdown = [
    `# ${topic}`,
    "",
    introHooks[0].hookText,
    "",
    ...sections.flatMap((s) => [
      `## ${s.heading}`,
      "",
      s.bodyMarkdown,
      "",
      `> 💡 **${s.eeatProofPrompt}**`,
      "",
    ]),
    "## Frequently Asked Questions",
    "",
    ...faqs.flatMap((f) => [`### ${f.question}`, "", f.answer, ""]),
    conclusionMarkdown,
  ].join("\n");

  return {
    h1Title: topic,
    metaTitle: `${topic} | Practical Guide`.slice(0, 60),
    metaDescription: `Learn ${kw} with our step-by-step workflow for ${audience}. Includes practical examples, ${sec1} tips, and verification checklists.`.slice(
      0,
      158,
    ),
    featuredSnippetAnswer,
    introHooks,
    sections,
    faqs,
    conclusionMarkdown,
    fullMarkdown,
  };
}
