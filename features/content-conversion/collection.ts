export const conversionCollection = {
  slug: "content-conversion",
  name: "Content Conversion",
  topic: "conversion",
  accent: "#9A3412",
  darkAccent: "#FDBA74",
  rgb: "249,115,22",
};

/** Planned output formats. These are not live tool entries or navigable tool routes. */
export const conversionPlan = [
  {
    slug: "article-to-pdf",
    name: "Article to PDF",
    format: "PDF",
    purpose:
      "Create a clean reading copy with headings, links, and selected images.",
  },
  {
    slug: "article-to-word",
    name: "Article to Word",
    format: "DOCX",
    purpose: "Turn an article into an editable document for review and reuse.",
  },
  {
    slug: "blog-to-video-script",
    name: "Blog to video script",
    format: "SCRIPT",
    purpose:
      "Adapt an article into spoken narration with scene and visual suggestions.",
  },
  {
    slug: "article-read-aloud",
    name: "Article read aloud",
    format: "AUDIO",
    purpose: "Listen to article text with playback and reading controls.",
  },
  {
    slug: "blog-to-social-posts",
    name: "Blog to social posts",
    format: "POSTS",
    purpose: "Draft channel-specific posts using the article's actual points.",
  },
];
