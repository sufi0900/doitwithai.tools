export type SocialVisualChannel =
  | "Facebook"
  | "Instagram"
  | "LinkedIn"
  | "X"
  | "Pinterest"
  | "Threads"
  | "Reddit"
  | "Quora"
  | "YouTube";

export type SocialVisualVariantId =
  | "portrait-4-5"
  | "square-1-1"
  | "pin-2-3"
  | "landscape-16-9"
  | "wide-1200-630"
  | "thumbnail-16-9"
  | "carousel";

export type SocialChannelAdapterSpec = {
  id: SocialVisualChannel;
  label: string;
  aspectLabel: string;
  defaultVariant: SocialVisualVariantId;
  width: number;
  height: number;
  supportsCarousel: boolean;
  isVideoChannel?: boolean;
  layoutStyle: "story-card" | "carousel-deck" | "editorial-wide" | "tall-pin" | "thread-card" | "thumbnail-bold";
  ctaLabel: string;
  safeCharLimit: number;
};

export const SOCIAL_VISUAL_REGISTRY: Record<
  SocialVisualChannel,
  SocialChannelAdapterSpec
> = {
  Facebook: {
    id: "Facebook",
    label: "Facebook",
    aspectLabel: "1200 × 630 Link & Community Card",
    defaultVariant: "wide-1200-630",
    width: 1200,
    height: 630,
    supportsCarousel: false,
    layoutStyle: "editorial-wide",
    ctaLabel: "Share discussion post + 1200×630 graphic",
    safeCharLimit: 500,
  },
  Instagram: {
    id: "Instagram",
    label: "Instagram",
    aspectLabel: "1080 × 1350 (4:5 Carousel + Single)",
    defaultVariant: "carousel",
    width: 1080,
    height: 1350,
    supportsCarousel: true,
    layoutStyle: "carousel-deck",
    ctaLabel: "Export 4:5 multi-slide PNG deck",
    safeCharLimit: 2200,
  },
  LinkedIn: {
    id: "LinkedIn",
    label: "LinkedIn",
    aspectLabel: "1080 × 1350 PDF Carousel / 1200 × 627",
    defaultVariant: "carousel",
    width: 1080,
    height: 1350,
    supportsCarousel: true,
    layoutStyle: "carousel-deck",
    ctaLabel: "Export executive carousel slides",
    safeCharLimit: 1300,
  },
  X: {
    id: "X",
    label: "X",
    aspectLabel: "1600 × 900 (16:9 Thesis Card + Thread)",
    defaultVariant: "landscape-16-9",
    width: 1600,
    height: 900,
    supportsCarousel: true,
    layoutStyle: "thread-card",
    ctaLabel: "Thread + 16:9 visual card",
    safeCharLimit: 280,
  },
  Pinterest: {
    id: "Pinterest",
    label: "Pinterest",
    aspectLabel: "1000 × 1500 (2:3 Vertical Tall Pin)",
    defaultVariant: "pin-2-3",
    width: 1000,
    height: 1500,
    supportsCarousel: false,
    layoutStyle: "tall-pin",
    ctaLabel: "Save 2:3 vertical Pin PNG",
    safeCharLimit: 500,
  },
  Threads: {
    id: "Threads",
    label: "Threads",
    aspectLabel: "1080 × 1350 Conversation Starter",
    defaultVariant: "portrait-4-5",
    width: 1080,
    height: 1350,
    supportsCarousel: false,
    layoutStyle: "story-card",
    ctaLabel: "Conversational takeaway + 4:5 card",
    safeCharLimit: 500,
  },
  Reddit: {
    id: "Reddit",
    label: "Reddit",
    aspectLabel: "1200 × 630 TL;DR Breakdown Card",
    defaultVariant: "wide-1200-630",
    width: 1200,
    height: 630,
    supportsCarousel: false,
    layoutStyle: "editorial-wide",
    ctaLabel: "Value-first summary (no promotional fluff)",
    safeCharLimit: 1800,
  },
  Quora: {
    id: "Quora",
    label: "Quora",
    aspectLabel: "1200 × 630 Structured Q&A Card",
    defaultVariant: "wide-1200-630",
    width: 1200,
    height: 630,
    supportsCarousel: false,
    layoutStyle: "editorial-wide",
    ctaLabel: "Direct expert explanation",
    safeCharLimit: 1800,
  },
  YouTube: {
    id: "YouTube",
    label: "YouTube",
    aspectLabel: "1280 × 720 Thumbnail + Video Scripts",
    defaultVariant: "thumbnail-16-9",
    width: 1280,
    height: 720,
    supportsCarousel: false,
    isVideoChannel: true,
    layoutStyle: "thumbnail-bold",
    ctaLabel: "1280×720 Thumbnail + Short/Long Scripts",
    safeCharLimit: 1200,
  },
};

export function getSocialChannelSpec(
  channel: string,
): SocialChannelAdapterSpec {
  return (
    SOCIAL_VISUAL_REGISTRY[channel as SocialVisualChannel] ||
    SOCIAL_VISUAL_REGISTRY.LinkedIn
  );
}

export function buildChannelCarouselSlides(
  headline: string,
  excerpts: string[],
  maxSlides = 5,
): Array<{ index: number; headline: string; body: string; badge: string }> {
  const cleanTitle = (headline || "Key Takeaways").trim();
  const points = excerpts.filter((e) => e.trim().length >= 12).slice(0, maxSlides - 1);
  if (!points.length) {
    return [
      {
        index: 1,
        headline: cleanTitle,
        body: "Draft sections in the editor above to populate slide takeaways automatically.",
        badge: "COVER",
      },
    ];
  }
  return [
    {
      index: 1,
      headline: cleanTitle,
      body: points[0].slice(0, 140),
      badge: `1 / ${points.length + 1}`,
    },
    ...points.map((pt, idx) => ({
      index: idx + 2,
      headline: `Takeaway ${idx + 1}`,
      body: pt.slice(0, 190),
      badge: `${idx + 2} / ${points.length + 1}`,
    })),
  ];
}
