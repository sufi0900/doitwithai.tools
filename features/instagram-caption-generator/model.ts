export type InstagramPostFormat =
  | "carousel-educator"
  | "reel-hook-caption"
  | "storytelling-single"
  | "saveable-checklist";

export type CarouselSlideTemplateId =
  | "editorial-magazine"
  | "visual-roadmap-nodes"
  | "stat-gauge-spotlight"
  | "split-versus-contrast"
  | "photo-glass-overlay"
  | "founder-notebook-memo"
  | "bold-ribbon-banners"
  | "swiss-minimal-grid";

export interface InstagramCaptionInput {
  topicOrContent: string;
  niche: string;
  postFormat: InstagramPostFormat;
  callToAction: string;
}

export interface InstagramCarouselSlide {
  slideNumber: number;
  headline: string;
  supportingText: string;
  visualPrompt: string;
  metricBadge?: string;
  categoryTag?: string;
}

export interface InstagramCaptionVariation {
  styleLabel: string;
  aboveTheFoldHook: string;
  fullCaption: string;
  altTextSeo: string;
}

export interface InstagramCaptionOutput {
  captions: InstagramCaptionVariation[];
  carouselSlides: InstagramCarouselSlide[];
  hashtagTiers: {
    broadReach: string[];
    nicheSpecific: string[];
    communitySearch: string[];
  };
  audioAndReelTip: string;
}

export type CarouselThemeId =
  | "royal-indigo"
  | "navy-orange"
  | "dark-emerald"
  | "canva-light"
  | "cyber-violet"
  | "rose-obsidian"
  | "terracotta-cream"
  | "mckinsey-executive"
  | "sunset-gold"
  | "arctic-mint"
  | "forest-gold"
  | "custom-brand";

export interface CarouselThemePalette {
  id: CarouselThemeId;
  label: string;
  bgStart: string;
  bgEnd: string;
  cardSurface: string;
  cardBorder: string;
  accent: string;
  accentSecondary: string;
  textPrimary: string;
  textSecondary: string;
  badgeBg: string;
  badgeText: string;
}

export const CAROUSEL_SLIDE_TEMPLATES: {
  id: CarouselSlideTemplateId;
  label: string;
  desc: string;
  badge: string;
}[] = [
  {
    id: "editorial-magazine",
    label: "1. Editorial Magazine Deck",
    desc: "Oversized cover typography, 3D step badges & vector icons",
    badge: "POPULAR",
  },
  {
    id: "visual-roadmap-nodes",
    label: "2. Connected Roadmap Nodes",
    desc: "Timeline track across slides with glowing milestone orbs",
    badge: "ROADMAP",
  },
  {
    id: "stat-gauge-spotlight",
    label: "3. Radial KPI Ring & Stat Deck",
    desc: "Circular vector percentage gauges & benchmark callouts",
    badge: "DATA RING",
  },
  {
    id: "split-versus-contrast",
    label: "4. Old Way vs. New Way Split",
    desc: "High-contrast crimson mistake vs. emerald solution cards",
    badge: "VERSUS",
  },
  {
    id: "photo-glass-overlay",
    label: "5. Photo + Frosted Glass Deck",
    desc: "Top article photo or visual banner + bottom glass caption card",
    badge: "PHOTO",
  },
  {
    id: "founder-notebook-memo",
    label: "6. Founder Memo & Highlighter",
    desc: "Executive memo card with quote marks & verified checkmarks",
    badge: "MEMO",
  },
  {
    id: "bold-ribbon-banners",
    label: "7. 3D Folded Ribbon Slides",
    desc: "Viral Pinterest/IG style with 3D folded number ribbons",
    badge: "RIBBONS",
  },
  {
    id: "swiss-minimal-grid",
    label: "8. Swiss Architectural Grid",
    desc: "Clean geometric grid lines & high-contrast editorial cells",
    badge: "GRID",
  },
];

export const CAROUSEL_THEMES: Record<
  Exclude<CarouselThemeId, "custom-brand">,
  CarouselThemePalette
> = {
  "royal-indigo": {
    id: "royal-indigo",
    label: "Royal Cobalt & Sky",
    bgStart: "#090D16",
    bgEnd: "#1E3A8A",
    cardSurface: "#152347",
    cardBorder: "#38BDF8",
    accent: "#38BDF8",
    accentSecondary: "#818CF8",
    textPrimary: "#FFFFFF",
    textSecondary: "#DBEAFE",
    badgeBg: "rgba(56, 189, 248, 0.22)",
    badgeText: "#7DD3FC",
  },
  "navy-orange": {
    id: "navy-orange",
    label: "Midnight & Electric Orange",
    bgStart: "#0B1120",
    bgEnd: "#1E293B",
    cardSurface: "#1E293B",
    cardBorder: "#FF6B35",
    accent: "#FF6B35",
    accentSecondary: "#FBBF24",
    textPrimary: "#FFFFFF",
    textSecondary: "#E2E8F0",
    badgeBg: "rgba(255, 107, 53, 0.22)",
    badgeText: "#FF8C5A",
  },
  "dark-emerald": {
    id: "dark-emerald",
    label: "Emerald Authority & Mint",
    bgStart: "#042F2E",
    bgEnd: "#064E3B",
    cardSurface: "#0A3E31",
    cardBorder: "#34D399",
    accent: "#34D399",
    accentSecondary: "#FBBF24",
    textPrimary: "#ECFDF5",
    textSecondary: "#A7F3D0",
    badgeBg: "rgba(52, 211, 153, 0.24)",
    badgeText: "#6EE7B7",
  },
  "canva-light": {
    id: "canva-light",
    label: "Canva Daylight & Indigo",
    bgStart: "#F8FAFC",
    bgEnd: "#EEF2FF",
    cardSurface: "#FFFFFF",
    cardBorder: "#CBD5E1",
    accent: "#4F46E5",
    accentSecondary: "#EC4899",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    badgeBg: "#E0E7FF",
    badgeText: "#3730A3",
  },
  "cyber-violet": {
    id: "cyber-violet",
    label: "SaaS Violet & Neon Pink",
    bgStart: "#130924",
    bgEnd: "#3B0764",
    cardSurface: "#241042",
    cardBorder: "#A855F7",
    accent: "#E879F9",
    accentSecondary: "#38BDF8",
    textPrimary: "#FFFFFF",
    textSecondary: "#F3E8FF",
    badgeBg: "rgba(232, 121, 249, 0.24)",
    badgeText: "#F0ABFC",
  },
  "rose-obsidian": {
    id: "rose-obsidian",
    label: "Obsidian & Crimson Rose",
    bgStart: "#18181B",
    bgEnd: "#27272A",
    cardSurface: "#232329",
    cardBorder: "#F43F5E",
    accent: "#F43F5E",
    accentSecondary: "#FB923C",
    textPrimary: "#FAFAFA",
    textSecondary: "#D4D4D8",
    badgeBg: "rgba(244, 63, 94, 0.24)",
    badgeText: "#FDA4AF",
  },
  "terracotta-cream": {
    id: "terracotta-cream",
    label: "Warm Editorial Cream & Terracotta",
    bgStart: "#FFFBEB",
    bgEnd: "#FEF3C7",
    cardSurface: "#FFFFFF",
    cardBorder: "#F59E0B",
    accent: "#EA580C",
    accentSecondary: "#0D9488",
    textPrimary: "#1C1917",
    textSecondary: "#57534E",
    badgeBg: "#FFEDD5",
    badgeText: "#C2410C",
  },
  "mckinsey-executive": {
    id: "mckinsey-executive",
    label: "Boardroom White & Deep Navy",
    bgStart: "#FFFFFF",
    bgEnd: "#F1F5F9",
    cardSurface: "#F8FAFC",
    cardBorder: "#94A3B8",
    accent: "#0284C7",
    accentSecondary: "#0F172A",
    textPrimary: "#0F172A",
    textSecondary: "#334155",
    badgeBg: "#E0F2FE",
    badgeText: "#0369A1",
  },
  "sunset-gold": {
    id: "sunset-gold",
    label: "Sunset Coral & Luxury Gold",
    bgStart: "#1C1917",
    bgEnd: "#292524",
    cardSurface: "#292524",
    cardBorder: "#F59E0B",
    accent: "#F59E0B",
    accentSecondary: "#FB7185",
    textPrimary: "#FEFCE8",
    textSecondary: "#D6D3D1",
    badgeBg: "rgba(245, 158, 11, 0.22)",
    badgeText: "#FDE68A",
  },
  "arctic-mint": {
    id: "arctic-mint",
    label: "Arctic Sky & Fresh Mint",
    bgStart: "#F0FDF4",
    bgEnd: "#E0F2FE",
    cardSurface: "#FFFFFF",
    cardBorder: "#38BDF8",
    accent: "#0284C7",
    accentSecondary: "#059669",
    textPrimary: "#0F172A",
    textSecondary: "#334155",
    badgeBg: "#BAE6FD",
    badgeText: "#0369A1",
  },
  "forest-gold": {
    id: "forest-gold",
    label: "Deep Forest & Luxury Gold",
    bgStart: "#0C1F17",
    bgEnd: "#143326",
    cardSurface: "#193D2E",
    cardBorder: "#FBBF24",
    accent: "#FBBF24",
    accentSecondary: "#34D399",
    textPrimary: "#FEFCE8",
    textSecondary: "#D9F99D",
    badgeBg: "rgba(251, 191, 36, 0.22)",
    badgeText: "#FDE68A",
  },
};

export const DEFAULT_INSTAGRAM_CAROUSEL_OUTPUT: InstagramCaptionOutput = {
  captions: [
    {
      styleLabel: "Save-Worthy Micro-Blog Caption",
      aboveTheFoldHook:
        "How to turn 1 long-form blog post into a 5-slide visual carousel that earns 3.4x more bookmarks",
      fullCaption:
        "How to turn 1 long-form blog post into a 5-slide visual carousel that earns 3.4x more bookmarks 👇\n\nMost creators spend 90% of their time writing and only 10% packaging their insights for visual feeds.\n\nFlip that ratio with this 5-slide architecture:\n✅ Slide 01: Open with a high-contrast problem statement or benchmark.\n✅ Slide 02: Expose the hidden bottleneck slowing down traditional workflows.\n✅ Slide 03: Break down the 3-step repeatable system.\n✅ Slide 04: Back the framework with a verified KPI or before/after proof.\n✅ Slide 05: Close with a saveable implementation checklist.\n\n📌 Save this carousel for your next content sprint & share it with a teammate!",
      altTextSeo:
        "5-slide educational carousel showing how to repurpose a blog post into high-retention Instagram and LinkedIn slides.",
    },
    {
      styleLabel: "Punchy Reel & Carousel Hook Caption",
      aboveTheFoldHook:
        "Stop publishing wall-of-text posts that get skipped in the feed 👇",
      fullCaption:
        "Stop publishing wall-of-text posts that get skipped in the feed 👇\n\nSwipe through these 5 slides to see the exact visual packaging framework we use to turn articles into high-save carousels.\n\nWhich slide is your favorite? Drop a comment below! 💬",
      altTextSeo:
        "Visual content repurposing framework for Instagram and LinkedIn carousels.",
    },
    {
      styleLabel: "Founder Behind-the-Scenes Note",
      aboveTheFoldHook:
        "The simplest shift that doubled our organic save rate on Instagram and LinkedIn:",
      fullCaption:
        "The simplest shift that doubled our organic save rate on Instagram and LinkedIn:\n\nInstead of pasting a link and hoping people click, we started turning every H2 sub-topic into a 5-slide visual playbook.\n\nSave this deck as your template for your next post!",
      altTextSeo: "Founder playbook on building educational carousel slides.",
    },
  ],
  carouselSlides: [
    {
      slideNumber: 1,
      headline: "How to Turn 1 Blog Post Into a High-Save 5-Slide Carousel",
      supportingText:
        "The repeatable visual packaging system that earns 3.4x more bookmarks and profile visits.",
      visualPrompt: "Magazine cover slide",
      metricBadge: "3.4x Saves",
      categoryTag: "CAROUSEL PLAYBOOK",
    },
    {
      slideNumber: 2,
      headline: "1. Slice One Focused H2 Sub-Topic",
      supportingText:
        "Never cram a 2,000-word article into one post. Extract a single high-signal H2 section so your carousel solves one specific problem.",
      visualPrompt: "Step 1 breakdown",
      metricBadge: "88% Clarity",
      categoryTag: "STEP 01 · FOCUS",
    },
    {
      slideNumber: 3,
      headline: "2. Keep Slide Copy Under 25 Words",
      supportingText:
        "Pair a 5-to-7 word bold headline with a 15-to-20 word explanation and a visual metric badge so mobile readers scan in 3 seconds.",
      visualPrompt: "Step 2 breakdown",
      metricBadge: "+64% Hold Rate",
      categoryTag: "STEP 02 · DENSITY",
    },
    {
      slideNumber: 4,
      headline: "3. Contrast Old Way vs. New System",
      supportingText:
        "Show the exact mistake people make alongside the structured fix. Visual contrast drives comments and DM shares.",
      visualPrompt: "Step 3 comparison",
      metricBadge: "2.8x Shares",
      categoryTag: "STEP 03 · CONTRAST",
    },
    {
      slideNumber: 5,
      headline: "Save This 5-Step Checklist for Your Next Post",
      supportingText:
        "1. Pick 1 H2 Angle  •  2. Hook in 8 Words  •  3. One Idea Per Slide  •  4. Add Proof Metric  •  5. Export PDF & PNGs.",
      visualPrompt: "Closing checklist CTA",
      metricBadge: "100% Ready",
      categoryTag: "SAVE & SHARE ★",
    },
  ],
  hashtagTiers: {
    broadReach: [
      "#ContentStrategy",
      "#DigitalMarketing",
      "#SocialMediaGrowth",
      "#ContentCreator",
    ],
    nicheSpecific: [
      "#CarouselDesign",
      "#ContentRepurposing",
      "#LinkedInCarousels",
      "#InstagramSEO",
    ],
    communitySearch: [
      "#MarketingPlaybook",
      "#B2BContent",
      "#CreatorWorkflow",
    ],
  },
  audioAndReelTip:
    "Keep your first caption line under 125 characters so the curiosity gap appears right before '...more', and upload the multi-page PDF directly to LinkedIn or the 5 PNGs to Instagram.",
};
