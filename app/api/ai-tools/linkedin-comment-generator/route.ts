import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import type {
  LinkedinCommentInput,
  LinkedinCommentOutput,
} from "@/features/linkedin-comment-generator/model";

const aiOutputSchema = z.object({
  postCoreThesis: z.string(),
  comments: z.array(
    z.object({
      styleLabel: z.string(),
      badge: z.string(),
      commentText: z.string(),
      charCount: z.number(),
      whyItWorks: z.string(),
      predictedAuthorReply: z.string(),
    })
  ),
  engagementTips: z.array(z.string()),
});

function buildFallbackComments(input: LinkedinCommentInput): LinkedinCommentOutput {
  const firstLine =
    input.postContent
      .split(/\n|\./)
      .map((s) => s.trim())
      .find((s) => s.length > 15)
      ?.slice(0, 110) || "executing consistently on fundamentals over short-term hacks";
  const authorRef = input.authorName?.trim() ? `${input.authorName.trim()}, ` : "";
  const roleContext = input.yourRole?.trim() || "growth & digital strategy";

  return {
    postCoreThesis: `Core argument focuses on ${firstLine}.`,
    comments: [
      {
        styleLabel: "Authority & Framework Add-On",
        badge: "Highest Profile Views",
        commentText: `${authorRef}spot-on breakdown. One layer we've seen compound this in ${roleContext} is pairing execution with a tight feedback loop every 14 days.\n\nMost teams get the initial setup right, but the real leverage comes from auditing what actually drove retention versus vanity volume.\n\nCurious—when you roll this out, which metric do you watch first in week one?`,
        charCount: 368,
        whyItWorks:
          "Validates the author's point, adds a concrete operational lens from your role, and ends with a low-friction expert question.",
        predictedAuthorReply:
          "Likely replies sharing their primary week-one KPI, opening a multi-reply thread at the top of their comment section.",
      },
      {
        styleLabel: "Nuanced Contrarian Perspective",
        badge: "Thread Starter",
        commentText: `I agree with 90% of this—especially around "${firstLine.slice(0, 75)}".\n\nWhere I've seen this backfire slightly is when smaller teams try to automate step one before doing 10 manual reps first. Doing it manually exposes the edge cases no template catches.\n\nOnce those reps are done, this framework scales effortlessly.`,
        charCount: 332,
        whyItWorks:
          "Polite '90% agreement + 10% nuance' stands out immediately in a sea of generic 'Great post!' replies without sounding combative.",
        predictedAuthorReply:
          "Typically prompts the author to agree that manual reps are a prerequisite before scaling.",
      },
      {
        styleLabel: "Smart Follow-Up Question",
        badge: "Fast Author Reply",
        commentText: `${authorRef}the distinction you made here is super clear. How are you seeing this shift over the next 6–12 months for teams working in ${roleContext}?\n\nAre you doubling down on depth per channel or expanding surface area?`,
        charCount: 238,
        whyItWorks:
          "Gives the original poster an easy A-or-B prompt to showcase more of their expertise, which creators love answering.",
        predictedAuthorReply:
          "Direct answer choosing between depth vs. surface area with an extra tip.",
      },
      {
        styleLabel: "Real-World Experience / Mini Story",
        badge: "High Trust",
        commentText: `Bookmarking this. We tested a very similar approach last quarter in ${roleContext} after hitting a plateau.\n\nThe biggest surprise wasn't just the time saved—it was how much clearer the handoff became across the rest of the workflow. Appreciate you sharing the exact playbook here.`,
        charCount: 284,
        whyItWorks:
          "Social proof from a peer practitioner reinforces the author's credibility while positioning you as an active operator.",
        predictedAuthorReply:
          "Warm acknowledgment and often a profile visit or connection request.",
      },
      {
        styleLabel: "Punchy 2-Line Value Hook",
        badge: "Quick Mobile Read",
        commentText: `"${firstLine.slice(0, 80)}" — that line alone should be pinned.\n\nClarity beats complexity every single time in ${roleContext}.`,
        charCount: 142,
        whyItWorks:
          "Quotes the author's exact hook back to them (boosting dwell time) and delivers a crisp takeaway for mobile scrollers.",
        predictedAuthorReply:
          "Quick like + short appreciative reply from the author.",
      },
    ],
    engagementTips: [
      "Comment within the first 45 minutes of the post going live to stay anchored in the top 3 visible comments.",
      "Always use 1–2 line breaks so your comment is effortless to scan on mobile feeds.",
      "Avoid dropping external links directly in someone else's comment section; let your headline and insight drive profile clicks.",
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<LinkedinCommentInput>;
    const postContent = (body.postContent || "").trim();
    if (!postContent) {
      return NextResponse.json(
        { error: "Please paste a LinkedIn post or extract content from a URL first." },
        { status: 400 }
      );
    }

    const input: LinkedinCommentInput = {
      postContent,
      authorName: (body.authorName || "").trim(),
      yourRole: (body.yourRole || "SEO & Content Strategist").trim(),
      commentGoal: body.commentGoal || "authority-insight",
    };

    const model = getGeminiModel("LINKEDIN_COMMENT") || getGeminiModel();
    if (isAiConfigured(model)) {
      try {
        const client = getGeminiClient();
        const res = await client.generate(
          {
            model,
            max_output_tokens: 1800,
            store: false,
            input: [
              {
                role: "system",
                content:
                  "You are an elite LinkedIn ghostwriter and B2B networking strategist. Generate 5 high-impact, human-sounding LinkedIn comments tailored to the user's goal and role.",
              },
              {
                role: "user",
                content: JSON.stringify({
                  goal: input.commentGoal,
                  role: input.yourRole,
                  authorName: input.authorName,
                  postContent: input.postContent.slice(0, 4000),
                }),
              },
            ],
            text: {
              format: geminiTextFormat(aiOutputSchema, "linkedin_comments_pack", {
                compact: true,
              }),
            },
          },
          { timeout: 24000 }
        );
        if (res.output_parsed?.comments?.length) {
          return NextResponse.json({
            ...res.output_parsed,
            comments: res.output_parsed.comments.map((c) => ({
              ...c,
              charCount: c.commentText?.length || c.charCount || 200,
            })),
          });
        }
      } catch {
        // Fallback below
      }
    }

    return NextResponse.json(buildFallbackComments(input));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate LinkedIn comments." },
      { status: 500 }
    );
  }
}
