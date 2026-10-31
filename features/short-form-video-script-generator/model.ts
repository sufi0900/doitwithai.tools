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
  hookVariations: Array<{
    angle: "Contrarian Stop-Hook" | "Proof / Number Hook" | "Mistake Callout";
    spokenHook: string;
    onScreenHook: string;
  }>;
  segments: ScriptTimelineSegment[];
  totalSpokenWords: number;
  estimatedSecondsAt150Wpm: number;
  captionWithHashtags: string;
};

export const DEFAULT_SHORT_SCRIPT_INPUT: ShortFormScriptInput = {
  topic: "Why 90% of blog posts get zero clicks from AI Search & Featured Snippets",
  coreTakeawayOrProof:
    "Put a 48-word direct definition paragraph immediately below your H2 question heading before adding backstory.",
  platform: "YouTube Shorts",
  durationSeconds: 45,
  ctaGoal: "Comment 'SNIPPET' or grab the free checklist at the link in bio",
};

export function buildDeterministicShortScript(
  input: ShortFormScriptInput,
): ShortFormScriptPack {
  const topic = input.topic.trim() || "this SEO strategy";
  const proof =
    input.coreTakeawayOrProof.trim() ||
    "Audit your H2 answer passages and keep them between 40 and 58 words.";
  const cta =
    input.ctaGoal.trim() || "Follow for more practical SEO workflows";

  const hookVariations: ShortFormScriptPack["hookVariations"] = [
    {
      angle: "Contrarian Stop-Hook",
      spokenHook: `Stop writing 300-word introductions if you want to rank in ${topic.slice(0, 45)}.`,
      onScreenHook: "STOP WRITING LONG INTROS 🛑",
    },
    {
      angle: "Proof / Number Hook",
      spokenHook: `This 48-word formatting rule is the fastest way to fix: ${topic.slice(0, 50)}.`,
      onScreenHook: "THE 48-WORD SEO RULE ⚡",
    },
    {
      angle: "Mistake Callout",
      spokenHook: `You are losing free organic clicks every single day because of this 1 mistake.`,
      onScreenHook: "1 MISTAKE KILLING CLICKS 📉",
    },
  ];

  const segments: ScriptTimelineSegment[] = [
    {
      timeRange: "0:00 – 0:03",
      beatLabel: "1. Scroll-Stopper Hook (First 3 Seconds)",
      spokenLine: hookVariations[0].spokenHook,
      visualBRollCue:
        "Tight talking-head framing; lean toward camera and point to screen overlay on beat 1.",
      onScreenTextCaption: hookVariations[0].onScreenHook,
    },
    {
      timeRange: "0:03 – 0:11",
      beatLabel: "2. The Problem & Why Most Fail (Pattern Interrupt #1)",
      spokenLine: `When Google or AI Search scans your page for "${topic}", it skips right past fluffy introductions looking for a clean, extractable answer block.`,
      visualBRollCue:
        "Zoom cut (110%) + over-the-shoulder screen recording highlighting a bloated paragraph in red.",
      onScreenTextCaption: "AI SKIPS FLUFFY INTROS ❌",
    },
    {
      timeRange: "0:11 – 0:24",
      beatLabel: "3. The Core Fix / Golden Takeaway (Pattern Interrupt #2)",
      spokenLine: `Here is the exact fix: ${proof}`,
      visualBRollCue:
        "Switch to green split-screen showing the clean H2 question followed immediately by a 48-word bold-lead answer.",
      onScreenTextCaption: "H2 + 48-WORD ANSWER BLOCK ✅",
    },
    {
      timeRange: "0:24 – 0:37",
      beatLabel: "4. Real-World Proof & Example",
      spokenLine:
        "Start your first sentence with a direct '[Topic] is...' definition, bold the key metric, and add a 4-item bulleted list right underneath.",
      visualBRollCue:
        "Pop-up visual card showing the Featured Snippet & AI Overview citation preview.",
      onScreenTextCaption: "1. DEFINE  2. BOLD  3. LIST 📋",
    },
    {
      timeRange: `0:37 – 0:${input.durationSeconds}`,
      beatLabel: "5. Loopable CTA & Save Trigger",
      spokenLine: `Save this video before you publish your next post—and ${cta} because that is exactly why…`,
      visualBRollCue:
        "Subtle gesture toward the Save/Bookmark button; final word loops seamlessly back into 0:00.",
      onScreenTextCaption: `SAVE THIS + ${cta.slice(0, 28).toUpperCase()} 👇`,
    },
  ];

  const allSpoken = segments.map((s) => s.spokenLine).join(" ");
  const totalSpokenWords = allSpoken.trim().split(/\s+/).filter(Boolean).length;
  const estimatedSecondsAt150Wpm = Math.round((totalSpokenWords / 150) * 60);

  const captionWithHashtags = `${hookVariations[0].spokenHook}\n\nHere is the quick breakdown:\n✅ ${proof}\n✅ Keep H2 answer blocks between 40–58 words\n✅ Pair with a 4-item ordered list\n\n👉 ${cta}\n\n#SEO #ContentMarketing #DigitalMarketing #CreatorTips #Shorts`;

  return {
    hookVariations,
    segments,
    totalSpokenWords,
    estimatedSecondsAt150Wpm,
    captionWithHashtags,
  };
}
