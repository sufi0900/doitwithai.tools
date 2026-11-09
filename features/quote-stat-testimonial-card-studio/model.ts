/**
 * Testimonial / Quote Card Studio — data model
 *
 * RULE (site-wide, see docs/TOOL_OPTIMIZATION_RULES.md):
 * every portrait used in this tool must be a MALE person. Never add a female
 * portrait to MALE_PORTRAIT_PRESETS or to any hero / promo card for this tool.
 */

export type QuoteVisualTemplateId =
  | "arch-aura-split"
  | "flagship-footer-split"
  | "obsidian-gold-rings"
  | "wave-trust-pills"
  | "editorial-dot-grid"
  | "portrait-left-quote"
  | "full-bleed-portrait"
  | "kpi-stat-portrait"
  | "x-verified-post"
  | "founder-memo-portrait";

export type MalePortraitPresetId =
  | "marcus-saas-vp"
  | "daniel-founder"
  | "tariq-growth-lead"
  | "sufian-founder"
  | "custom-upload"
  | "none";

export type CardAspectRatioId = "1:1" | "4:5" | "16:9";

export interface QuoteCardItem {
  id: string;
  quoteText: string;
  highlightPhrase: string;
  subContextOrReality: string;
  badgeLabel: string;
}

export interface QuoteStudioInput {
  authorName: string;
  authorHandleOrRole: string;
  brandDomain: string;
  sourceContent: string;
  template: QuoteVisualTemplateId;
  portraitPreset?: MalePortraitPresetId;
  aspectRatio?: CardAspectRatioId;
  trustBadge1?: string;
  trustBadge2?: string;
  trustBadge3?: string;
  starRatingLabel?: string;
  /** 0.8 – 1.25, scales the person cut-out inside the template */
  portraitScale?: number;
  /** -0.15 – 0.15, nudges the person left/right inside its zone */
  portraitOffsetX?: number;
}

export interface QuoteStudioPack {
  cards: QuoteCardItem[];
  socialCaption: string;
}

export const QUOTE_TEMPLATES: {
  id: QuoteVisualTemplateId;
  label: string;
  desc: string;
}[] = [
  {
    id: "arch-aura-split",
    label: "Arch Aura Portrait",
    desc: "Cream card, accent arch behind a large person cut-out, dark name bar with your logo",
  },
  {
    id: "flagship-footer-split",
    label: "Flagship Split Portrait",
    desc: "Highlighted quote left, person right, trust pills and brand footer",
  },
  {
    id: "wave-trust-pills",
    label: "Wave + 3 Trust Pills",
    desc: "White card, curved brand-color wave and three proof pills",
  },
  {
    id: "obsidian-gold-rings",
    label: "Obsidian Rings",
    desc: "Dark premium card with concentric rings behind the person",
  },
  {
    id: "editorial-dot-grid",
    label: "Editorial Dot Grid",
    desc: "Clean editorial layout with dot-grid accent and green-bar proof strip",
  },
  {
    id: "portrait-left-quote",
    label: "Portrait Left",
    desc: "Person on the left, quote and attribution on the right",
  },
  {
    id: "full-bleed-portrait",
    label: "Full-Bleed Portrait",
    desc: "Large person fading into a dark gradient, big white quote",
  },
  {
    id: "kpi-stat-portrait",
    label: "KPI Stat + Portrait",
    desc: "Oversized result number, supporting quote and customer portrait",
  },
  {
    id: "x-verified-post",
    label: "Verified Post Card",
    desc: "Social-post style card with round avatar and verified check",
  },
  {
    id: "founder-memo-portrait",
    label: "Founder Memo Note",
    desc: "Warm paper memo with serif quote and founder avatar",
  },
];

/**
 * To add another person: drop a transparent-background PNG of a MALE person
 * (head and shoulders / half body, ideally ≤ 1200px tall) into
 * /public/images/testimonials/ and add one entry here. Nothing else changes.
 */
export const MALE_PORTRAIT_PRESETS: Array<{
  id: MalePortraitPresetId;
  label: string;
  roleSample: string;
  authorSample: string;
  imageSrc: string;
}> = [
  {
    id: "marcus-saas-vp",
    label: "Marcus V. (SaaS VP)",
    authorSample: "Marcus Vance",
    roleSample: "VP of Growth · VeloCloud AI",
    imageSrc: "/images/testimonials/marcus-executive.png",
  },
  {
    id: "daniel-founder",
    label: "Daniel K. (Tech Founder)",
    authorSample: "Daniel Mercer",
    roleSample: "Founder · NorthStar Analytics",
    imageSrc: "/images/testimonials/daniel-executive.png",
  },
  {
    id: "tariq-growth-lead",
    label: "Tariq A. (Growth Director)",
    authorSample: "Tariq Al-Mansoor",
    roleSample: "Head of Acquisition · Apex B2B",
    imageSrc: "/images/testimonials/tariq-executive.png",
  },
  {
    id: "sufian-founder",
    label: "Sufian M. (SEO Architect)",
    authorSample: "Sufian Mustafa",
    roleSample: "Founder · DoItWithAI.tools",
    imageSrc: "/images/testimonials/sufian-executive.png",
  },
];

export const DEFAULT_QUOTE_STUDIO_INPUT: QuoteStudioInput = {
  authorName: "Marcus Vance",
  authorHandleOrRole: "VP of Growth · VeloCloud AI",
  brandDomain: "doitwithai.tools",
  sourceContent:
    "Our customer quotes used to sit buried in text walls. Turning them into branded portrait testimonial cards made our landing page proof far easier to scan.\n\nWhen you pair a bold opening hook with a square visual takeaway card and brand-colored phrase highlights, feed posts become easier to save and share.\n\nWe replaced several separate design tools in one afternoon: upload a portrait, add your brand colors, and export client-ready social proof in seconds.",
  template: "arch-aura-split",
  portraitPreset: "marcus-saas-vp",
  aspectRatio: "1:1",
  trustBadge1: "Verified Customer",
  trustBadge2: "Easy to Use",
  trustBadge3: "Highly Recommended",
  starRatingLabel: "5.0",
  portraitScale: 1,
  portraitOffsetX: 0,
};

export function buildDeterministicQuotePack(
  input: QuoteStudioInput,
): QuoteStudioPack {
  const paragraphs = String(input.sourceContent || "")
    .split(/\n{2,}|\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length >= 25);

  const selected = (
    paragraphs.length >= 2
      ? paragraphs
      : DEFAULT_QUOTE_STUDIO_INPUT.sourceContent.split("\n\n")
  ).slice(0, 5);

  const badges = [
    "CUSTOMER WIN",
    "CASE STUDY INSIGHT",
    "FOUNDER TAKEAWAY",
    "PROOF POINT",
    "GROWTH PLAYBOOK",
  ];

  const cards: QuoteCardItem[] = selected.map((para, idx) => {
    const sentences = para.split(/(?<=[.!?])\s+/);
    const firstSentence = sentences[0] || para;
    const words = firstSentence.split(/\s+/);
    const highlightPhrase = words
      .slice(Math.max(0, words.length - 6))
      .join(" ")
      .replace(/[.!?,;:]+$/, "");
    const subContextOrReality =
      sentences.slice(1).join(" ").trim() ||
      "Customer testimonial and social proof graphic.";

    return {
      id: `quote-card-${idx + 1}`,
      quoteText: para.slice(0, 240),
      highlightPhrase,
      subContextOrReality: subContextOrReality.slice(0, 140),
      badgeLabel: badges[idx] || `TAKEAWAY #${idx + 1}`,
    };
  });

  return {
    cards,
    socialCaption: `💡 ${cards.length} customer proof takeaways:\n\n${cards.map((c, i) => `${i + 1}. "${c.quoteText}"`).join("\n\n")}\n\nDesign your own branded testimonial & quote cards free at:\n🌐 https://${input.brandDomain || "doitwithai.tools"}/tools/quote-stat-testimonial-card-studio`,
  };
}
