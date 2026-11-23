export type PinterestVisualTemplateId =
  | "editorial-cover-pin"
  | "listicle-number-pin"
  | "step-mini-infographic"
  | "saveable-checklist-pin"
  | "split-photo-headline"
  | "comparison-pin"
  | "pyramid-hierarchy-pin"
  | "stat-donut-pin"
  | "ribbon-banner-pin"
  | "before-after-pin"
  | "bento-grid-pin"
  | "quote-tip-poster-pin";

export interface PinterestPinVariation {
  pinTitle: string;
  pinHeadlineOverlay: string;
  pinSubtextOverlay: string;
  pinBadge: string;
  seoDescription: string;
  altText: string;
  suggestedBoard: string;
}

export interface PinterestVisualInput {
  topicOrHeadline: string;
  sourceStepsOrNotes: string;
  targetKeyword: string;
  destinationDomain: string;
  template: PinterestVisualTemplateId;
}

export interface PinterestVisualPack {
  primaryKeyword: string;
  bulletSteps: string[];
  pinVariations: PinterestPinVariation[];
  hashtags: string[];
}

export const DEFAULT_PINTEREST_VISUAL_INPUT: PinterestVisualInput = {
  topicOrHeadline: "7 Proven SEO & Content Repurposing Workflows for 2026",
  sourceStepsOrNotes:
    "1. Start With One Deep-Dive Guide\n2. Slice H2 Headings Into Standalone Posts\n3. Design a 1000x1500 Tall Pinterest Infographic\n4. Export a 5-Slide Carousel Deck\n5. Add Keyword-Rich Alt Text & Pin Descriptions",
  targetKeyword: "Content Marketing & Blogging Tips",
  destinationDomain: "doitwithai.tools",
  template: "listicle-number-pin",
};

export function buildDeterministicPinterestVisualPack(
  input: PinterestVisualInput,
): PinterestVisualPack {
  const cleanTopic = (
    input.topicOrHeadline || "7 Actionable Content Strategy Tips"
  )
    .replace(/\s*\|\s*[^|]+$/g, "")
    .trim();
  const kw = (input.targetKeyword || "Content Strategy").trim();

  const steps = String(input.sourceStepsOrNotes || "")
    .split(/\n+/)
    .map((s) => s.replace(/^\d+[\).\s-]+|^[•✅📌-]\s*/, "").trim())
    .filter((s) => s.length >= 6)
    .slice(0, 5);

  const bulletSteps =
    steps.length >= 3
      ? steps
      : [
          "Start with one authoritative pillar article",
          "Slice H2 sub-topics into standalone visual assets",
          "Publish 2:3 vertical pins with bold overlay typography",
          "Include target search keywords in your Pin Title & Alt Text",
          "Link directly to your guide to compound evergreen traffic",
        ];

  const pinVariations: PinterestPinVariation[] = [
    {
      pinTitle: `${cleanTopic} (Step-by-Step Guide)`,
      pinHeadlineOverlay: cleanTopic.slice(0, 52),
      pinSubtextOverlay: `Save this ${bulletSteps.length}-step checklist for your next workflow`,
      pinBadge: `${bulletSteps.length} PROVEN STEPS`,
      seoDescription: `Learn ${cleanTopic.toLowerCase()} with this actionable ${kw} breakdown. Includes ${bulletSteps.slice(0, 3).join(", ")}. Save this pin for later and click through for the complete guide at ${input.destinationDomain}!`,
      altText: `Vertical Pinterest infographic titled ${cleanTopic} listing ${bulletSteps.length} actionable steps.`,
      suggestedBoard: `${kw} & Growth Playbooks`,
    },
    {
      pinTitle: `How to Master ${kw}: ${cleanTopic}`,
      pinHeadlineOverlay: `The Ultimate ${kw} Checklist`,
      pinSubtextOverlay:
        bulletSteps[0] || "Actionable framework you can use today",
      pinBadge: "FREE CHEAT SHEET",
      seoDescription: `Want faster results with ${kw}? Here is the exact step-by-step blueprint covering ${cleanTopic.toLowerCase()}. Bookmark this visual cheat sheet for your next sprint!`,
      altText: `Pinterest cheat sheet graphic for ${kw} showing step-by-step takeaways.`,
      suggestedBoard: `Blogging, SEO & Digital Marketing Tips`,
    },
    {
      pinTitle: `Stop Guessing: ${cleanTopic} Explained`,
      pinHeadlineOverlay: `Mistakes to Avoid in ${kw}`,
      pinSubtextOverlay: `Do these ${bulletSteps.length} high-leverage actions instead`,
      pinBadge: "MUST-SAVE GUIDE",
      seoDescription: `Avoid common bottlenecks in ${kw}. This visual guide breaks down ${cleanTopic.toLowerCase()} into simple, repeatable steps. Click to read the full tutorial on ${input.destinationDomain}.`,
      altText: `Comparison Pinterest Pin graphic explaining ${cleanTopic}.`,
      suggestedBoard: `${kw} Templates & Checklists`,
    },
  ];

  return {
    primaryKeyword: kw,
    bulletSteps,
    pinVariations,
    hashtags: [
      `#${kw.replace(/[^a-zA-Z0-9]/g, "")}`,
      "#ContentMarketing",
      "#SEOTips",
      "#BloggingStrategy",
      "#DigitalMarketing",
    ],
  };
}
