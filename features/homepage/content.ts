export const homepage = {
  brand: "Do It With AI Tools",
  title: "Put AI to Work on Your SEO and Content | Do It With AI Tools",
  description:
    "Plan and refine website content with AI tools, practical SEO guides, and free resources for marketers, SEO teams, and website owners.",
  headline: "Put AI to work on your SEO and content",
  heroDescription:
    "Plan and refine your website content with practical AI tools, clear guides, and free resources built for everyday marketing work.",
  closingDescription:
    "Start with a practical guide, choose a relevant tool, and review the results for your audience before putting them to use.",
  featuredToolSlugs: [
    "meta-title-generator",
    "meta-description-generator",
    "article-outline-generator",
    "readability-checker",
    "image-alt-text-generator",
    "schema-markup-generator",
  ],
  learningSlugs: [
    "chatgpt-keyword-research",
    "ai-readability-tools",
    "meta-title",
  ],
  cards: [
    {
      title: "Find the right tool for the task",
      body: "Compare title ideas, build article outlines, and refine your content with editable results you can review before publishing.",
      href: "/tools",
      action: "Explore tools",
    },
    {
      title: "Learn the reasoning behind the work",
      body: "Follow practical SEO and content guides with examples that help you make informed choices and apply AI with human judgment.",
      href: "/ai-seo",
      action: "Read SEO guides",
    },
    {
      title: "Start with a useful resource",
      body: "Find free prompts and learning resources, then adapt them to your audience, page purpose, and content task.",
      href: "/free-ai-resources",
      action: "Explore resources",
    },
  ],
};
export const workflows = [
  {
    title: "Plan your next article",
    description:
      "Explore topic ideas, group related keywords, and shape an outline around what your readers need.",
    primary: "article-outline-generator",
    supporting: ["topical-map-generator", "keyword-clustering-tool"],
    guideSlug: "chatgpt-keyword-research",
    color: "blue",
  },
  {
    title: "Prepare a page for publishing",
    description:
      "Compare titles and descriptions, choose a readable URL, and review structured data that matches your page.",
    primary: "meta-title-generator",
    supporting: ["meta-description-generator", "schema-markup-generator"],
    guideSlug: "meta-title",
    color: "purple",
  },
  {
    title: "Make content easier to understand",
    description:
      "Review readability and describe useful image details while keeping your meaning and context intact.",
    primary: "readability-checker",
    supporting: ["image-alt-text-generator", "h1-heading-generator"],
    guideSlug: "ai-readability-tools",
    color: "green",
  },
];
