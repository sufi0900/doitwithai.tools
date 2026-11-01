export type QuoteVisualTemplateId =
  | "verified-post-screenshot"
  | "highlighter-quote"
  | "founder-memo-note"
  | "testimonial-5-star"
  | "myth-vs-reality"
  | "executive-pull-quote";

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
}

export interface QuoteStudioPack {
  cards: QuoteCardItem[];
  socialCaption: string;
}

export const DEFAULT_QUOTE_STUDIO_INPUT: QuoteStudioInput = {
  authorName: "Sufian Mustafa",
  authorHandleOrRole: "@doitwithai · Founder & SEO Strategist",
  brandDomain: "doitwithai.tools",
  sourceContent:
    "Most teams don't have a content creation problem—they have a content distribution bottleneck. One authoritative guide repurposed into 5 visual formats outperforms 10 unedited AI blog posts every single time.\n\nWhen you pair a bold opening hook with a 1080x1080 visual takeaway card, feed dwell time and bookmark saves jump by over 2.4x.\n\nStop publishing bare links in your main post body. Deliver the core insight natively in the feed and place your full guide link in the First Comment.",
  template: "verified-post-screenshot",
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
    "KEY INSIGHT #1",
    "CONTRARIAN TRUTH",
    "GROWTH PLAYBOOK",
    "PROVEN BENCHMARK",
    "FOUNDER NOTE",
  ];

  const cards: QuoteCardItem[] = selected.map((para, idx) => {
    const sentences = para.split(/(?<=[.!?])\s+/);
    const firstSentence = sentences[0] || para;
    const words = firstSentence.split(/\s+/);
    const highlightPhrase = words.slice(0, Math.min(7, words.length)).join(" ");
    const subContextOrReality =
      sentences.slice(1).join(" ").trim() ||
      "Apply this principle consistently to compound organic reach and trust.";

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
    socialCaption: `💡 ${cards.length} Visual Takeaways from our latest breakdown:\n\n${cards.map((c, i) => `${i + 1}. "${c.quoteText}"`).join("\n\n")}\n\nWhich of these resonates most with your workflow right now? 👇\n🌐 ${input.brandDomain || "doitwithai.tools"}`,
  };
}
