import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";

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
  beats: z.array(VideoBeatSchema).min(1).max(8),
});

const VideoScriptAiSchema = z.object({
  scenes: z.array(VideoSceneSchema).min(3).max(16),
});

const SocialIdeaSchema = z.object({
  label: z.string().min(3).max(90),
  content: z.string().min(20).max(2950),
});

const SocialPlatformSchema = z.object({
  platform: z.enum([
    "LinkedIn",
    "X / Twitter Thread",
    "Facebook",
    "Instagram",
    "Threads",
  ]),
  ideas: z.array(SocialIdeaSchema).min(3).max(3),
});

const SocialPostsAiSchema = z.object({
  posts: z.array(SocialPlatformSchema).min(4).max(5),
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
    .min(2)
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
        footer: z.string().min(5).max(90),
      }),
    )
    .min(5)
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
    .min(4)
    .max(20),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const format = typeof body?.format === "string" ? body.format : "";
    const title = typeof body?.title === "string" ? body.title.slice(0, 300) : "";
    const source = typeof body?.source === "string" ? body.source.slice(0, 500) : "";
    const articleText =
      typeof body?.articleText === "string" ? body.articleText.slice(0, 28000) : "";
    const options = body?.options || {};

    if (!title || !articleText) {
      return Response.json(
        { error: { message: "Supply article title and text." } },
        { status: 422 },
      );
    }

    const model = getGeminiModel("CONVERSION") || getGeminiModel() || "gemini-2.5-flash";
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
          max_output_tokens: 4000,
          input: [
            {
              role: "system",
              content:
                "You are an expert YouTube and short-form video producer. Read the entire supplied article, understand every core topic and argument it covers, and write a comprehensive, engaging, voice-friendly video script structured around Problem -> Solution -> Actionable Example. Do NOT copy-paste raw written article sentences; rewrite them into natural spoken English. Pair EVERY single spoken sentence with a specific background visual direction (what screenshot, UI comparison, flowchart infographic, data callout, or B-roll to show behind that exact sentence) and concise on-screen text.",
            },
            {
              role: "user",
              content: `Article Title: ${title}\nSource URL: ${source}\nVideo Mode: ${mode === "shorts" ? "60-90s Vertical Shorts/Reels (4-5 punchy scenes)" : "Comprehensive YouTube Deep-Dive (cover all major sections of the article thoroughly)"}\nClosing CTA: ${options.cta || "Read the full article at the link in the description."}\n\nArticle Content:\n${articleText}`,
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
          max_output_tokens: 4000,
          input: [
            {
              role: "system",
              content:
                "You are a senior B2B & technical content strategist. Read the full article and craft 3 distinct, high-converting post ideas for EACH platform (LinkedIn, X / Twitter Thread, Facebook, Instagram, Threads). Never start with generic lines like 'Key takeaways from...'. Instead: open with a sharp 1-sentence editorial hook stating the core problem or contrast, follow with a concrete real-world scenario, include a scannable '•' checklist of 4-5 actionable points synthesized from the article, explain the strategic nuance, and close with a natural call-to-action ('For a deeper dive, read our full article: ...') and 4 relevant hashtags.",
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
      return Response.json({ result: parsed.output_parsed }, { status: 200 });
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
          max_output_tokens: 3500,
          input: [
            {
              role: "system",
              content:
                "You design high-converting LinkedIn & Instagram educational carousels. Turn the supplied article into a cohesive slide deck (Slide 1: Cover with a bold hook and a 2-4 word highlightPhrase that appears inside the headline; Middle Slides: step-by-step insights covering all main topics of the article, each with two contrasting diagram box cards [cardLeftTitle/cardLeftBody vs cardRightTitle/cardRightBody] such as 'BEFORE / OLD WAY' vs 'AFTER / BETTER SYSTEM' or 'COMMON MISTAKE' vs 'THE FIX'; Final Slide: CTA slide).",
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
                "You are an award-winning podcast producer. Adapt the entire supplied article into a natural, engaging, conversational broadcast script covering all major points of the article. In Two-Host mode (Host A & Host B), have Host A ask curious, probing questions and frame the problem while Host B breaks down the insights, examples, and frameworks in natural spoken English, ending with a concrete listener action item and show-notes CTA.",
            },
            {
              role: "user",
              content: `Article Title: ${title}\nSource URL: ${source}\nFormat: ${mode === "cohost" ? "Two-Host Conversation (Host A & Host B)" : "Solo Host"}\n\nArticle Content:\n${articleText}`,
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

    return Response.json({ fallback: true }, { status: 200 });
  } catch {
    return Response.json({ fallback: true }, { status: 200 });
  }
}
