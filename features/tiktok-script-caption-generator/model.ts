export type TiktokVideoStyle =
  | "greenscreen-breakdown"
  | "fast-listicle"
  | "storytime-mythbust"
  | "screen-tutorial";

export interface TiktokScriptInput {
  topicOrContent: string;
  niche: string;
  videoStyle: TiktokVideoStyle;
  durationSeconds: "15" | "30" | "60";
}

export interface TiktokScriptBeat {
  timeRange: string;
  beatLabel: string;
  visualDirection: string;
  onScreenText: string;
  spokenAudio: string;
}

export interface TiktokScriptOutput {
  scrollStoppingHooks: {
    style: string;
    verbalHook: string;
    visualAction: string;
  }[];
  scriptBeats: TiktokScriptBeat[];
  tiktokSeoCaption: string;
  searchKeywords: string[];
  hashtags: string[];
  thumbnailCoverText: string;
}

export const DEFAULT_TIKTOK_SCRIPT_OUTPUT: TiktokScriptOutput = {
  scrollStoppingHooks: [
    {
      style: "Contrarian Search Hook",
      verbalHook:
        "Stop treating TikTok like a dance app—in 2026, it's the fastest-growing visual search engine.",
      visualAction:
        "Point to floating TikTok search bar overlay at top of green-screen frame.",
    },
    {
      style: "Proof & Data Hook",
      verbalHook:
        "Over 40% of users now search TikTok before Google—and this 3-second tweak gets your videos indexed.",
      visualAction:
        "Zoom in from medium shot while holding up 3 fingers with bold yellow caption.",
    },
    {
      style: "Mistake Callout Hook",
      verbalHook:
        "If your TikTok views die after 24 hours, you're missing these 3 TikTok SEO signals.",
      visualAction:
        "Show analytics graph spike on green-screen backdrop behind shoulder.",
    },
  ],
  scriptBeats: [
    {
      timeRange: "0:00 – 0:04",
      beatLabel: "Scroll-Stopping SEO Hook",
      visualDirection:
        "Green-screen backdrop showing article headline; step into frame with energetic hand gesture.",
      onScreenText: "TIKTOK IS A SEARCH ENGINE IN 2026 🔍",
      spokenAudio:
        "Stop treating TikTok like a dance app—in 2026, over 40% of people use TikTok as a visual search engine to find tutorials and tools.",
    },
    {
      timeRange: "0:04 – 0:12",
      beatLabel: "Signal #1: Spoken Keyword in First 3 Seconds",
      visualDirection:
        "Highlight the target keyword pill on screen; cut to close-up angle.",
      onScreenText: "1. SAY KEYWORD OUT LOUD (0-3s)",
      spokenAudio:
        "First, say your exact target search phrase out loud within the first three seconds so TikTok's automatic speech recognition indexes your audio immediately.",
    },
    {
      timeRange: "0:12 – 0:22",
      beatLabel: "Signal #2: Native On-Screen Text Overlay",
      visualDirection:
        "Tap the native text overlay box at the top center of the vertical frame.",
      onScreenText: "2. NATIVE TEXT OVERLAY AT TOP",
      spokenAudio:
        "Second, place that exact same keyword in a native on-screen text box during your opening hook so the visual OCR scanner locks onto your topic.",
    },
    {
      timeRange: "0:22 – 0:30",
      beatLabel: "Signal #3: Search-Indexed Caption & CTA",
      visualDirection:
        "Point down toward the caption area and smile; hold final frame for 1 second.",
      onScreenText: "3. FIRST-LINE KEYWORD CAPTION ✅",
      spokenAudio:
        "And third, put a natural keyword sentence in the very first line of your caption instead of just hashtags. Save this checklist for your next post!",
    },
  ],
  tiktokSeoCaption:
    "How to rank on TikTok Search in 2026: Combine spoken keyword audio in your first 3 seconds, native on-screen text overlays, and a keyword-rich opening caption line to compound evergreen views for months.",
  searchKeywords: [
    "tiktok seo strategy 2026",
    "how to rank on tiktok search",
    "content repurposing workflow",
    "short form video hooks",
  ],
  hashtags: [
    "#TikTokSEO",
    "#ContentCreatorTips",
    "#SocialMediaGrowth",
    "#VideoMarketing",
    "#CreatorEconomy",
  ],
  thumbnailCoverText: "3 TIKTOK SEO SIGNALS (2026 GUIDE)",
};
