/**
 * Testimonial / Quote Card Studio — data model
 *
 * RULE (site-wide, see docs/TOOL_OPTIMIZATION_RULES.md):
 * every portrait used in this tool must be a MALE person. Never add a female
 * portrait to MALE_PORTRAIT_PRESETS or to any hero / promo card for this tool.
 */

export type QuoteVisualTemplateId =
  | "arch-aura-split"
  | "obsidian-gold-rings"
  | "flagship-footer-split"
  | "editorial-dot-grid"
  | "wave-trust-pills"
  | "full-bleed-portrait"
  | "portrait-left-quote"
  | "kpi-stat-portrait"
  | "x-verified-post"
  | "founder-memo-portrait"
  | "before-after-proof"
  | "myth-vs-reality"
  | "podcast-clip-quote"
  | "checklist-takeaway-card"
  // Legacy aliases supported seamlessly:
  | "aragon-split-testimonial"
  | "verified-post-screenshot"
  | "highlighter-quote"
  | "founder-memo-note"
  | "testimonial-5-star"
  | "executive-pull-quote"
  | "oversized-kpi-stat"
  | "glassmorphic-saas-card"
  | "boardroom-white-frame";

export type MalePortraitPresetId =
  | "marcus-saas-vp"
  | "daniel-founder"
  | "tariq-growth-lead"
  | "sufian-founder"
  | "custom-upload"
  | "none";

export type CardAspectRatioId = "1:1" | "4:5" | "16:9";

export type PortraitFrameMode =
  | "auto"
  | "ring-circle"
  | "arch"
  | "rounded"
  | "cutout";

export type LogoBadgeStyle = "auto" | "pill" | "white" | "dark" | "plain";

export interface QuoteCardItem {
  id: string;
  badgeLabel: string;
  quoteText: string;
  highlightPhrase: string;
  subContextOrReality: string;
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
  /** Frame style override: auto matches template, or force ring-circle / arch / rounded / cutout */
  portraitFrame?: PortraitFrameMode;
  /** 0.70 – 1.45, zooms the person inside the frame/ring */
  portraitScale?: number;
  /** -0.25 – 0.25, nudges the person left/right inside the frame/ring */
  portraitOffsetX?: number;
  /** -0.25 – 0.25, nudges the person up/down inside the frame/ring */
  portraitOffsetY?: number;
  /** 0 – 50, controls corner radius % (50 = full circle) */
  portraitRadius?: number;
  /** 0.75 – 1.20, scales the overall ring / arch / frame container size */
  portraitRingScale?: number;
  /** 0.70 – 1.50, scales the uploaded brand logo or domain pill */
  logoScale?: number;
  /** Container style behind the uploaded brand logo */
  logoBgStyle?: LogoBadgeStyle;
}

export interface QuoteStudioPack {
  cards: QuoteCardItem[];
  socialCaption: string;
}

export const QUOTE_TEMPLATES: {
  id: QuoteVisualTemplateId;
  label: string;
  badge: string;
  desc: string;
}[] = [
  {
    id: "arch-aura-split",
    label: "1. Arch Aura Split Portrait",
    badge: "Arch Frame",
    desc: "Cream card, customer portrait framed inside a warm accent arch, 5 stars & dark brand footer",
  },
  {
    id: "obsidian-gold-rings",
    label: "2. Concentric Ring Portrait",
    badge: "Circle in Ring",
    desc: "Dark luxury card with customer photo framed directly inside glowing concentric rings",
  },
  {
    id: "flagship-footer-split",
    label: "3. Flagship Studio Split",
    badge: "Studio Split",
    desc: "Highlighted quote on left, framed executive portrait on right, proof pills & brand footer bar",
  },
  {
    id: "editorial-dot-grid",
    label: "4. Editorial Dot-Grid Frame",
    badge: "Editorial Frame",
    desc: "Magazine layout with dot-grid accent, bordered portrait frame & dark proof footer",
  },
  {
    id: "wave-trust-pills",
    label: "5. Curved Wave + 3 Proof Pills",
    badge: "Wave Footer",
    desc: "Clean white card, curved brand-color wave footer, 3 verified pills & framed portrait",
  },
  {
    id: "full-bleed-portrait",
    label: "6. Full-Bleed Magazine Split",
    badge: "58/42 Full Bleed",
    desc: "Cinematic split where the portrait fills the right panel with a seamless gradient fade",
  },
  {
    id: "portrait-left-quote",
    label: "7. Left Portrait + Right Quote",
    badge: "Left Portrait",
    desc: "Framed customer portrait on the left column, 5 stars, highlighted quote & logo on the right",
  },
  {
    id: "kpi-stat-portrait",
    label: "8. Oversized KPI Stat + Ring",
    badge: "KPI + Ring",
    desc: "Giant ROI metric callout (2.8x / +184%), quote & customer portrait inside a radar ring",
  },
  {
    id: "x-verified-post",
    label: "9. Verified Social Post Card",
    badge: "Social Post",
    desc: "High-trust X / LinkedIn post card with circular ring avatar, verified check & 5 stars",
  },
  {
    id: "founder-memo-portrait",
    label: "10. Founder Memo Note",
    badge: "Exec Memo",
    desc: "Warm executive memo aesthetic with top brand bar, serif quote, circular avatar & logo",
  },
  {
    id: "before-after-proof",
    label: "11. Before vs. After Case Study",
    badge: "Before / After",
    desc: "Contrasts ❌ Before bottleneck vs ✅ After verified customer win with portrait & logo",
  },
  {
    id: "myth-vs-reality",
    label: "12. Contrarian Myth vs. Reality",
    badge: "Myth / Reality",
    desc: "Splits ❌ Common Industry Myth vs ✅ Proven Reality with executive portrait header",
  },
  {
    id: "podcast-clip-quote",
    label: "13. Podcast Waveform Quote",
    badge: "Audio + Ring",
    desc: "Speaker portrait inside a soundwave ring, brand-colored audio waveform bars & quote",
  },
  {
    id: "checklist-takeaway-card",
    label: "14. Quote + 3 Action Takeaways",
    badge: "3 Takeaways",
    desc: "Pairs the customer quote with 3 checkmarked action takeaways, portrait & brand footer",
  },
];

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
    label: "Daniel M. (Tech Founder)",
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
    "Our customer quotes used to sit buried in text walls. Turning them into branded portrait testimonial cards lifted our landing page demo signups by 2.8x in two weeks.\n\nWhen you pair a bold opening hook with a square visual takeaway card and brand-colored phrase highlights, feed dwell time and saves jump by over 2.4x.\n\nWe replaced several separate design tools in one afternoon: upload a portrait, adjust the ring frame and brand colors, and export client-ready social proof in seconds.",
  template: "arch-aura-split",
  portraitPreset: "marcus-saas-vp",
  aspectRatio: "1:1",
  trustBadge1: "Verified Customer",
  trustBadge2: "2.8x Conversion Lift",
  trustBadge3: "Highly Recommended",
  starRatingLabel: "5.0",
  portraitFrame: "auto",
  portraitScale: 1,
  portraitOffsetX: 0,
  portraitOffsetY: 0,
  portraitRadius: 24,
  portraitRingScale: 1,
  logoScale: 1,
  logoBgStyle: "auto",
};

export function buildDeterministicQuotePack(
  input: QuoteStudioInput,
): QuoteStudioPack {
  const rawParagraphs = (input.sourceContent || "")
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  const fallbackParagraphs = [
    "Our customer quotes used to sit buried in text walls. Turning them into branded portrait testimonial cards lifted our landing page demo signups by 2.8x in two weeks.",
    "When you pair a bold opening hook with a square visual takeaway card and brand-colored phrase highlights, feed dwell time and saves jump by over 2.4x.",
    "We replaced several separate design tools in one afternoon: upload a portrait, adjust the ring frame and brand colors, and export client-ready social proof in seconds.",
  ];

  const sourceList = (
    rawParagraphs.length >= 2 ? rawParagraphs : fallbackParagraphs
  ).slice(0, 5);

  const badges = [
    "VERIFIED CUSTOMER WIN",
    "CASE STUDY BENCHMARK",
    "FOUNDER TAKEAWAY",
    "ROI PROOF POINT",
    "GROWTH PLAYBOOK",
  ];

  const cards: QuoteCardItem[] = sourceList.map((para, idx) => {
    const sentences = para.split(/(?<=[.!?])\s+/);
    const firstSentence = sentences[0] || para;
    const words = firstSentence.split(/\s+/);
    const highlightPhrase = words
      .slice(Math.max(0, words.length - 6))
      .join(" ")
      .replace(/[.!?,;:]+$/, "");
    const subContextOrReality =
      sentences.slice(1).join(" ").trim() ||
      "Verified customer testimonial & social proof graphic.";

    return {
      id: `quote-card-${idx + 1}`,
      badgeLabel: badges[idx % badges.length],
      quoteText: para.slice(0, 220),
      highlightPhrase: highlightPhrase.slice(0, 64),
      subContextOrReality: subContextOrReality.slice(0, 130),
    };
  });

  return {
    cards,
    socialCaption: `💡 ${cards.length} Customer Proof & Visual Takeaways:\n\n${cards.map((c, i) => `${i + 1}. "${c.quoteText}"`).join("\n\n")}\n\nDesign your own free AI testimonial & quote cards at:\n🌐 https://${input.brandDomain || "doitwithai.tools"}/tools/quote-stat-testimonial-card-studio`,
  };
}
