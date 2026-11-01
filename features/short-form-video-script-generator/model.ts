export type ShortVideoPlatform = "YouTube Shorts" | "Instagram Reels" | "TikTok";
export type ShortVideoDuration = 30 | 45 | 60;

export type ShortFormScriptInput = {
  topic: string;
  coreTakeawayOrProof: string;
  platform: ShortVideoPlatform;
  durationSeconds: ShortVideoDuration;
  ctaGoal: string;
};

export type ScriptTimelineSegment = {
  timeRange: string;
  beatLabel: string;
  spokenLine: string;
  visualBRollCue: string;
  onScreenTextCaption: string;
};

export type ShortFormScriptPack = {
  cleanTopicTitle: string;
  hookVariations: Array<{
    angle: "Contrarian Stop-Hook" | "Proof / Number Hook" | "Mistake Callout";
    spokenHook: string;
    onScreenHook: string;
  }>;
  segments: ScriptTimelineSegment[];
  connectedVoiceoverScript: string;
  totalSpokenWords: number;
  estimatedSecondsAt150Wpm: number;
  captionWithHashtags: string;
};

export const DEFAULT_SHORT_SCRIPT_INPUT: ShortFormScriptInput = {
  topic: "How to optimize URL slugs for SEO and safe URL migrations",
  coreTakeawayOrProof:
    "Keep URL slugs under 5 words using lowercase hyphens, remove stop words and dates, and always set a permanent 301 redirect before changing an indexed URL.",
  platform: "YouTube Shorts",
  durationSeconds: 45,
  ctaGoal: "Comment 'SLUG' or grab the free SEO checklist at the link in bio",
};

function sanitizePhrase(raw: string): string {
  return raw
    .replace(/\s*\|\s*.*$/g, "")
    .replace(/\btable of contents\.?\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateWords(str: string, maxChars: number): string {
  const cleaned = sanitizePhrase(str);
  if (cleaned.length <= maxChars) return cleaned;
  const sliced = cleaned.slice(0, maxChars);
  const lastSpace = sliced.lastIndexOf(" ");
  return (lastSpace > 15 ? sliced.slice(0, lastSpace) : sliced).replace(/[.,;:!?-]+$/, "");
}

export function buildDeterministicShortScript(
  input: ShortFormScriptInput,
): ShortFormScriptPack {
  const cleanTopic = truncateWords(input.topic || "this SEO strategy", 65);
  const cleanProof =
    sanitizePhrase(input.coreTakeawayOrProof) ||
    "Focus on search intent, keep your structure scannable, and verify technical signals before publishing.";
  const cleanCta =
    sanitizePhrase(input.ctaGoal) ||
    "Follow for more practical SEO workflows";

  const shortOverlayCta = truncateWords(cleanCta, 32).toUpperCase();

  const hookVariations: ShortFormScriptPack["hookVariations"] = [
    {
      angle: "Contrarian Stop-Hook",
      spokenHook: `Stop making this common mistake with "${cleanTopic}"—here is the 30-second fix that actually works.`,
      onScreenHook: `${truncateWords(cleanTopic, 26).toUpperCase()} FIX 🛑`,
    },
    {
      angle: "Proof / Number Hook",
      spokenHook: `Here is the 80/20 rule for "${cleanTopic}" so you don't have to read a 2,000-word guide.`,
      onScreenHook: "THE 80/20 CHEAT SHEET ⚡",
    },
    {
      angle: "Mistake Callout",
      spokenHook: `Most websites lose free organic traffic every week because they overlook one detail in "${cleanTopic}".`,
      onScreenHook: "1 MISTAKE KILLING TRAFFIC 📉",
    },
  ];

  const segments: ScriptTimelineSegment[] = [
    {
      timeRange: "0:00 – 0:03",
      beatLabel: "1. Scroll-Stopper Hook (First 3 Seconds)",
      spokenLine: hookVariations[0].spokenHook,
      visualBRollCue:
        "Tight talking-head framing; point to the headline graphic at the top of the screen on beat 1.",
      onScreenTextCaption: hookVariations[0].onScreenHook,
    },
    {
      timeRange: "0:03 – 0:12",
      beatLabel: "2. The Core Problem (Pattern Interrupt #1)",
      spokenLine: `When most people set up ${cleanTopic.toLowerCase()}, they overcomplicate the process instead of focusing on what search engines and users actually scan first.`,
      visualBRollCue:
        "Quick 1.15x zoom cut + highlight the common mistake on screen in red.",
      onScreenTextCaption: "WHY MOST SETUPS FAIL ❌",
    },
    {
      timeRange: "0:12 – 0:26",
      beatLabel: "3. The Exact Actionable Fix (Pattern Interrupt #2)",
      spokenLine: `Instead, do this right away: ${cleanProof}`,
      visualBRollCue:
        "Switch to green-screen or split-screen showing the clean before-and-after example.",
      onScreenTextCaption: "THE STEP-BY-STEP FIX ✅",
    },
    {
      timeRange: "0:26 – 0:37",
      beatLabel: "4. Quick Verification Checklist",
      spokenLine:
        "Test it on one high-priority page first, verify the result in Search Console, and then roll it out across the rest of your site.",
      visualBRollCue:
        "Show 3 crisp numbered checkmarks popping up on screen.",
      onScreenTextCaption: "1. TEST  2. VERIFY  3. SCALE 📋",
    },
    {
      timeRange: `0:37 – 0:${input.durationSeconds}`,
      beatLabel: "5. Loopable Call-To-Action",
      spokenLine: `Save this video so you have the checklist ready for your next post—and ${cleanCta}.`,
      visualBRollCue:
        "Point down toward the Save/Bookmark icon so viewers bookmark the video.",
      onScreenTextCaption: `SAVE THIS + ${shortOverlayCta} 👇`,
    },
  ];

  const connectedVoiceoverScript = segments
    .map((s) => s.spokenLine)
    .join("\n\n");

  const allSpoken = segments.map((s) => s.spokenLine).join(" ");
  const totalSpokenWords = allSpoken.trim().split(/\s+/).filter(Boolean).length;
  const estimatedSecondsAt150Wpm = Math.round((totalSpokenWords / 150) * 60);

  const captionWithHashtags = `${hookVariations[0].spokenHook}\n\nQuick summary:\n✅ ${cleanProof}\n✅ Test on 1 priority page first & verify in Search Console\n\n👉 ${cleanCta}\n\n#SEO #ContentStrategy #DigitalMarketing #CreatorTips #Shorts`;

  return {
    cleanTopicTitle: cleanTopic,
    hookVariations,
    segments,
    connectedVoiceoverScript,
    totalSpokenWords,
    estimatedSecondsAt150Wpm,
    captionWithHashtags,
  };
}
