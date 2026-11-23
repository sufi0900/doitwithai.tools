import type { KeywordGuide } from "./KeywordGuideCard";

export const videoScriptPromoGuides: Record<string, KeywordGuide> = {
  shortsAndTeleprompter: {
    href: "/tools/short-form-video-script-generator",
    image: "/prompts/youtube-shorts-video-script-prompts-hero-v2.webp",
    alt: "Short-Form Video Hook and Connected Teleprompter Script Studio.",
    label: "150-WPM TELEPROMPTER & HOOK STUDIO",
    title: "Generate continuous 30s–60s voiceover scripts and 3 opening hooks",
    description:
      "Paste any blog URL, YouTube video link, or topic into our Short-Form Video Script Builder to get a continuous teleprompter voiceover script, 3 interchangeable 0–3s hooks, and B-roll cues.",
    action: "Open Short-Form Video Script Studio",
  },
  titleAndThumbnail: {
    href: "/tools/youtube-title-thumbnail-optimizer",
    image: "/prompts/content-repurposing-prompts-hero-v2.webp",
    alt: "YouTube Title, Thumbnail CTR, and 4K Storyboard Studio.",
    label: "DESIGN THE CLICK BEFORE YOU RECORD",
    title: "Test mobile-safe <55c YouTube titles and 3-word thumbnail hooks",
    description:
      "Score your YouTube title and thumbnail text for curiosity gap, pixel truncation, and browse feed stopping power before you hit record.",
    action: "Open YouTube Title & Thumbnail Studio",
  },
  transcriptAndBlog: {
    href: "/tools/youtube-transcript-generator",
    image: "/prompts/keyword-research-prompts-hero-v2.webp",
    alt: "YouTube Auto-Caption Transcript Extractor and Video-to-Blog Studio.",
    label: "EXTRACT TRANSCRIPTS, CHAPTERS & .SRT",
    title: "Pull YouTube transcripts (including EN-auto) and convert to SEO blogs",
    description:
      "Extract timestamped transcripts, Key Moments chapters, and .SRT subtitles from any YouTube or Shorts URL—or turn your video directly into a structured blog post and infographic.",
    action: "Open YouTube Transcript & Chapters Studio",
  },
};
