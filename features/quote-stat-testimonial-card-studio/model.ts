export type QuoteVisualTemplateId =
  | "aragon-split-testimonial"
  | "verified-post-screenshot"
  | "highlighter-quote"
  | "founder-memo-note"
  | "testimonial-5-star"
  | "myth-vs-reality"
  | "executive-pull-quote"
  | "oversized-kpi-stat"
  | "before-after-proof"
  | "podcast-clip-quote"
  | "glassmorphic-saas-card"
  | "boardroom-white-frame"
  | "checklist-takeaway-card";

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
  starRatingLabel?: string;
}

export interface QuoteStudioPack {
  cards: QuoteCardItem[];
  socialCaption: string;
}

export const MALE_PORTRAIT_PRESETS: Array<{
  id: MalePortraitPresetId;
  label: string;
  roleSample: string;
  authorSample: string;
  imageSrc: string;
  suitColor: string;
  tieColor: string;
  skinTone: string;
  hairColor: string;
  hasBeard: boolean;
  hasGlasses: boolean;
}> = [
  {
    id: "marcus-saas-vp",
    label: "Marcus V. (SaaS VP)",
    authorSample: "Marcus Vance",
    roleSample: "VP of Growth · VeloCloud AI",
    imageSrc: "/images/testimonials/marcus-executive.png",
    suitColor: "#1E293B",
    tieColor: "#EA580C",
    skinTone: "#E8B89A",
    hairColor: "#27272A",
    hasBeard: true,
    hasGlasses: false,
  },
  {
    id: "daniel-founder",
    label: "Daniel K. (Tech Founder)",
    authorSample: "Daniel Mercer",
    roleSample: "Founder · NorthStar Analytics",
    imageSrc: "/images/testimonials/daniel-executive.png",
    suitColor: "#0F172A",
    tieColor: "#2563EB",
    skinTone: "#F1C6A7",
    hairColor: "#3F2E21",
    hasBeard: false,
    hasGlasses: true,
  },
  {
    id: "tariq-growth-lead",
    label: "Tariq A. (Growth Director)",
    authorSample: "Tariq Al-Mansoor",
    roleSample: "Head of Acquisition · Apex B2B",
    imageSrc: "/images/testimonials/tariq-executive.png",
    suitColor: "#1F2937",
    tieColor: "#10B981",
    skinTone: "#D9A17C",
    hairColor: "#18181B",
    hasBeard: true,
    hasGlasses: false,
  },
  {
    id: "sufian-founder",
    label: "Sufian M. (SEO Architect)",
    authorSample: "Sufian Mustafa",
    roleSample: "Founder · DoItWithAI.tools",
    imageSrc: "/images/testimonials/sufian-executive.png",
    suitColor: "#1E1B4B",
    tieColor: "#6366F1",
    skinTone: "#DFAC88",
    hairColor: "#18181B",
    hasBeard: true,
    hasGlasses: false,
  },
];

export const DEFAULT_QUOTE_STUDIO_INPUT: QuoteStudioInput = {
  authorName: "Marcus Vance",
  authorHandleOrRole: "VP of Growth · VeloCloud AI",
  brandDomain: "doitwithai.tools",
  sourceContent:
    "Our customer quotes used to sit buried in text walls. Turning them into branded portrait testimonial cards lifted our landing page demo signups by 2.8x in two weeks.\n\nWhen you pair a bold opening hook with a 1080x1080 visual takeaway card and brand-colored phrase highlights, feed dwell time and saves jump by over 2.4x.\n\nWe replaced four separate design subscriptions in one afternoon—upload a portrait, add your brand hex colors, and export client-ready social proof in seconds.",
  template: "aragon-split-testimonial",
  portraitPreset: "marcus-saas-vp",
  aspectRatio: "1:1",
  trustBadge1: "Verified Customer",
  trustBadge2: "2.8x Conversion Lift",
  starRatingLabel: "★★★★★ 5.0 Verified Review",
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
    "VERIFIED CUSTOMER WIN",
    "CASE STUDY BENCHMARK",
    "FOUNDER TAKEAWAY",
    "ROI PROOF POINT",
    "GROWTH PLAYBOOK",
  ];

  const cards: QuoteCardItem[] = selected.map((para, idx) => {
    const sentences = para.split(/(?<=[.!?])\s+/);
    const firstSentence = sentences[0] || para;
    const words = firstSentence.split(/\s+/);
    const highlightPhrase = words
      .slice(Math.max(0, words.length - 7))
      .join(" ");
    const subContextOrReality =
      sentences.slice(1).join(" ").trim() ||
      "Verified customer testimonial & social proof graphic.";

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
    socialCaption: `💡 ${cards.length} Customer Proof & Visual Takeaways:\n\n${cards.map((c, i) => `${i + 1}. "${c.quoteText}"`).join("\n\n")}\n\nDesign your own branded testimonial & quote cards free at:\n🌐 https://${input.brandDomain || "doitwithai.tools"}/tools/quote-stat-testimonial-card-studio`,
  };
}
