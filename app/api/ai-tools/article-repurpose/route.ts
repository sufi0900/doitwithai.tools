import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import { ensureStructuredSocialText } from "@/features/article-conversion/formats";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const VideoBeatSchema = z.object({
  spokenSentence: z.string().min(5).max(500),
  visualType: z.enum([
    "SCREENSHOT",
    "INFOGRAPHIC",
    "SPLIT COMPARISON",
    "B-ROLL VIDEO",
    "UI WALKTHROUGH",
    "DATA CALLOUT",
    "TALKING HEAD",
  ]),
  visualDirection: z.string().min(5).max(400),
  onScreenText: z.string().min(2).max(90),
});

const VideoSceneSchema = z.object({
  title: z.string().min(3).max(120),
  beats: z.array(VideoBeatSchema).min(2).max(8),
});

const VideoScriptAiSchema = z.object({
  scenes: z.array(VideoSceneSchema).min(6).max(16),
});

const StructuredSocialIdeaSchema = z.object({
  label: z.string().min(3).max(90),
  hook: z.string().min(10).max(320),
  problemParagraph: z.string().min(20).max(600),
  bullets: z.array(z.string().min(8).max(240)).min(3).max(5),
  closingInsight: z.string().min(10).max(400),
  ctaLine: z.string().min(10).max(260),
  hashtags: z.array(z.string().min(2).max(40)).min(3).max(5),
});

const SocialPlatformSchema = z.object({
  platform: z.enum([
    "LinkedIn",
    "X / Twitter Thread",
    "Facebook",
    "Instagram",
    "Threads",
  ]),
  ideas: z.array(StructuredSocialIdeaSchema).min(3).max(3),
});

const SocialPostsAiSchema = z.object({
  posts: z.array(SocialPlatformSchema).min(5).max(5),
});

const NewsletterAiSchema = z.object({
  subjectOptions: z.array(z.string().min(5).max(140)).min(3).max(5),
  preheader: z.string().min(10).max(160),
  intro: z.string().min(20).max(900),
  whyItMatters: z.string().min(20).max(900),
  takeaways: z.array(z.string().min(10).max(300)).min(3).max(6),
  sections: z
    .array(
      z.object({
        heading: z.string().min(3).max(120),
        summary: z.string().min(20).max(800),
        actionItem: z.string().min(10).max(300),
      }),
    )
    .min(3)
    .max(8),
  checklist: z.array(z.string().min(10).max(260)).min(3).max(6),
});

const CarouselAiSchema = z.object({
  slides: z
    .array(
      z.object({
        kind: z.enum(["cover", "point", "comparison", "cta"]),
        kicker: z.string().min(2).max(50),
        headline: z.string().min(5).max(110),
        highlightPhrase: z.string().min(2).max(55),
        body: z.string().min(10).max(220),
        cardLeftTitle: z.string().min(2).max(40),
        cardLeftBody: z.string().min(5).max(130),
        cardRightTitle: z.string().min(2).max(40),
        cardRightBody: z.string().min(5).max(130),
        stepThirdTitle: z.string().min(2).max(40).optional(),
        stepThirdBody: z.string().min(5).max(130).optional(),
        bullets: z.array(z.string().min(5).max(110)).min(2).max(4).optional(),
        footer: z.string().min(5).max(90),
      }),
    )
    .min(6)
    .max(12),
});

const PodcastAiSchema = z.object({
  showNotes: z.array(z.string().min(5).max(240)).min(3).max(8),
  segments: z
    .array(
      z.object({
        speaker: z.string().min(2).max(30),
        topic: z.string().min(3).max(120),
        dialogue: z.string().min(15).max(900),
        cue: z.string().min(2).max(80),
      }),
    )
    .min(6)
    .max(20),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const format = typeof body?.format === "string" ? body.format : "";
    const title =
      typeof body?.title === "string" ? body.title.slice(0, 300) : "";
    const source =
      typeof body?.source === "string" ? body.source.slice(0, 500) : "";
    const articleText =
      typeof body?.articleText === "string"
        ? body.articleText.slice(0, 28000)
        : "";
    const options = body?.options || {};

    if (!title || !articleText) {
      return Response.json(
        { error: { message: "Supply article title and text." } },
        { status: 422 },
      );
    }

    const model =
      getGeminiModel("CONVERSION") || getGeminiModel() || "gemini-2.5-flash";
    if (!isAiConfigured(model, false)) {
      return Response.json(
        { fallback: true },
        { status: 200, headers: { "Cache-Control": "no-store" } },
      );
    }

    const client = getGeminiClient();

    if (format === "video-script") {
      const mode = options.mode === "shorts" ? "shorts" : "youtube";
      const parsed = await client.generate(
        {
          model,
          max_output_tokens: 4500,
          input: [
            {
              role: "system",
              content:
                "You are an expert YouTube and short-form video producer. Read the entire supplied article, understand every core topic and argument it covers, and write a comprehensive, engaging, voice-friendly video script structured around Problem -> Solution -> Actionable Example. Cover ALL sections of the article thoroughly (at least 8-12 scenes for YouTube mode, with 3-5 spoken sentences per scene). Do NOT copy-paste raw written article sentences; rewrite them into natural spoken English. Pair EVERY single spoken sentence with a specific background visual direction (what screenshot, UI comparison, flowchart infographic, data callout, or B-roll to show behind that exact sentence) and concise on-screen text.",
            },
            {
              role: "user",
              content: `Article Title: ${title}\nSource URL: ${source}\nVideo Mode: ${mode === "shorts" ? "60-90s Vertical Shorts/Reels (6 punchy scenes)" : "Comprehensive YouTube Deep-Dive (8 to 14 scenes covering every major section of the article thoroughly)"}\nClosing CTA: ${options.cta || "Read the full article at the link in the description."}\n\nArticle Content:\n${articleText}`,
            },
          ],
          text: {
            format: geminiTextFormat(VideoScriptAiSchema, "video_script", {
              compact: true,
            }),
          },
        },
        { timeout: 35000 },
      );
      return Response.json({ result: parsed.output_parsed }, { status: 200 });
    }

    if (format === "social-posts") {
      const parsed = await client.generate(
        {
          model,
          max_output_tokens: 4500,
          input: [
            {
              role: "system",
              content:
                "You are a senior B2B & technical content strategist. Read the full article and craft 3 distinct, high-converting post ideas for EACH of the 5 platforms (LinkedIn, X / Twitter Thread, Facebook, Instagram, Threads). Never start with generic lines like 'Key takeaways from...'. Return structured fields for each idea: 'hook' (1 sharp opening sentence with a relevant emoji like 🎯, 💡, or ⚡), 'problemParagraph' (2-3 sentences of context), 'bullets' (3-5 actionable points without leading bullet symbols), 'closingInsight' (1-2 sentences of strategic nuance), 'ctaLine' (natural call-to-action with 🌐 emoji and URL), and 'hashtags' (4 hashtags starting with #).",
            },
            {
              role: "user",
              content: `Article Title: ${title}\nSource URL: ${source || "https://doitwithai.tools"}\nPreferred Angle: ${options.angle || "takeaways"}\n\nArticle Content:\n${articleText}`,
            },
          ],
          text: {
            format: geminiTextFormat(SocialPostsAiSchema, "social_posts", {
              compact: true,
            }),
          },
        },
        { timeout: 35000 },
      );

      // Assemble structured fields into guaranteed multi-line formatted posts!
      const formattedPosts = parsed.output_parsed.posts.map((p) => ({
        platform: p.platform,
        ideas: p.ideas.map((idea) => {
          const isThread = p.platform === "X / Twitter Thread";
          const rawUrl = source || "https://doitwithai.tools";
          let assembled = "";
          if (isThread) {
            const tweets = [
              `🧵 1/${idea.bullets.length + 2} ${idea.hook}\n\n${idea.problemParagraph}`,
              ...idea.bullets.map(
                (b, idx) =>
                  `${idx + 2}/${idea.bullets.length + 2} 📌 ${b.replace(/^\s*(?:[•▪✅✔▸-]|\d+\.)\s*/, "")}`,
              ),
              `${idea.bullets.length + 2}/${idea.bullets.length + 2} 💡 ${idea.closingInsight}\n\n🌐 ${idea.ctaLine.replace(/^🌐\s*/, "")}\n${idea.ctaLine.includes("http") ? "" : rawUrl}`.trim(),
            ];
            assembled = tweets.join("\n\n---\n\n");
          } else {
            const bulletLines = idea.bullets.map(
              (b) => `• ${b.replace(/^\s*(?:[•▪✅✔▸-]|\d+\.)\s*/, "")}`,
            );
            const tags = idea.hashtags
              .map((t) => (t.startsWith("#") ? t : `#${t}`))
              .join(" ");
            const ctaWithUrl = idea.ctaLine.includes("http")
              ? `🌐 ${idea.ctaLine.replace(/^🌐\s*/, "")}`
              : `🌐 ${idea.ctaLine.replace(/^🌐\s*/, "")}\n${rawUrl}`;
            assembled = [
              idea.hook.match(/^[🎯💡⚡🚀📌🔍🛑✨]/)
                ? idea.hook
                : `🎯 ${idea.hook}`,
              "",
              idea.problemParagraph,
              "",
              ...bulletLines,
              "",
              `💡 ${idea.closingInsight.replace(/^💡\s*/, "")}`,
              "",
              ctaWithUrl,
              "",
              tags,
            ].join("\n");
          }
          return {
            label: idea.label,
            content: ensureStructuredSocialText(assembled, p.platform),
          };
        }),
      }));

      return Response.json(
        { result: { posts: formattedPosts } },
        { status: 200 },
      );
    }

    if (format === "newsletter") {
      const parsed = await client.generate(
        {
          model,
          max_output_tokens: 3500,
          input: [
            {
              role: "system",
              content:
                "You are the editor of a high-converting executive & founder newsletter. Synthesize the entire supplied article into a compelling newsletter edition with 5 distinct subject line options, a sharp preheader, an engaging opening hook, a 'Why This Matters' callout, 4-5 key takeaways, a section-by-section breakdown (each with a concrete action item), and a practical implementation checklist.",
            },
            {
              role: "user",
              content: `Article Title: ${title}\nSource URL: ${source || "https://doitwithai.tools"}\nStyle: ${options.style || "executive"}\n\nArticle Content:\n${articleText}`,
            },
          ],
          text: {
            format: geminiTextFormat(NewsletterAiSchema, "newsletter_edition", {
              compact: true,
            }),
          },
        },
        { timeout: 35000 },
      );
      return Response.json({ result: parsed.output_parsed }, { status: 200 });
    }

    if (format === "linkedin-carousel") {
      const slideCount = Number(options.slideCount) || 8;
      const parsed = await client.generate(
        {
          model,
          max_output_tokens: 4000,
          input: [
            {
              role: "system",
              content:
                "You design high-converting LinkedIn & Instagram educational carousels. Turn the supplied article into a cohesive slide deck: Slide 1 MUST have kind='cover' (bold introduction hook, a 2-4 word highlightPhrase that appears inside the headline, and 3 'bullets' previewing what the reader will learn); Middle Slides MUST have kind='point' or 'comparison' covering all main topics of the article (with cardLeftTitle/cardLeftBody, cardRightTitle/cardRightBody, stepThirdTitle/stepThirdBody, and 3 bullets); Final Slide MUST have kind='cta' (closing headline, 3 recap 'bullets', and a strong call-to-action in cardRightBody).",
            },
            {
              role: "user",
              content: `Article Title: ${title}\nSource URL: ${source || "doitwithai.tools"}\nTarget Slides: ${slideCount}\n\nArticle Content:\n${articleText}`,
            },
          ],
          text: {
            format: geminiTextFormat(CarouselAiSchema, "linkedin_carousel", {
              compact: true,
            }),
          },
        },
        { timeout: 35000 },
      );
      return Response.json({ result: parsed.output_parsed }, { status: 200 });
    }

    if (format === "podcast-script") {
      const mode = options.format === "solo" ? "solo" : "cohost";
      const parsed = await client.generate(
        {
          model,
          max_output_tokens: 4000,
          input: [
            {
              role: "system",
              content:
                mode === "cohost"
                  ? "You are a podcast showrunner writing a natural, engaging two-host conversation (Host A: Alex, Host B: Maya) that unpacks the entire supplied article section by section with curiosity, real examples, and practical takeaways."
                  : "You are a solo podcast host delivering a clear, engaging deep-dive episode covering every major section of the supplied article.",
            },
            {
              role: "user",
              content: `Article Title: ${title}\nSource URL: ${source}\nFormat: ${mode}\n\nArticle Content:\n${articleText}`,
            },
          ],
          text: {
            format: geminiTextFormat(PodcastAiSchema, "podcast_script", {
              compact: true,
            }),
          },
        },
        { timeout: 35000 },
      );
      return Response.json({ result: parsed.output_parsed }, { status: 200 });
    }

    return Response.json(
      { error: { message: "Unsupported conversion format." } },
      { status: 400 },
    );
  } catch {
    return Response.json(
      { fallback: true },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}
