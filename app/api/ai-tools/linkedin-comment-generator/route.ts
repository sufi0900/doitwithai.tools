import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import type {
  IncomingCommentItem,
  IncomingCommentReplyPack,
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
    }),
  ),
  engagementTips: z.array(z.string()),
});

const aiReplyPacksSchema = z.object({
  postCoreThesis: z.string(),
  replyPacks: z.array(
    z.object({
      commenterName: z.string(),
      originalComment: z.string(),
      replies: z.array(
        z.object({
          angleLabel: z.string(),
          badge: z.string(),
          replyText: z.string(),
          charCount: z.number(),
        }),
      ),
    }),
  ),
  engagementTips: z.array(z.string()),
});

function buildFallbackComments(
  input: LinkedinCommentInput,
): LinkedinCommentOutput {
  const firstLine =
    input.postContent
      .split(/\n|\./)
      .map((s) => s.trim())
      .find((s) => s.length > 15)
      ?.slice(0, 110) ||
    "executing consistently on fundamentals over short-term hacks";
  const authorRef = input.authorName?.trim()
    ? `${input.authorName.trim()}, `
    : "";
  const roleContext = input.yourRole?.trim() || "growth & digital strategy";

  return {
    mode: "comment-on-others-post",
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

function buildFallbackReplyPacks(
  input: LinkedinCommentInput,
  incoming: IncomingCommentItem[],
): LinkedinCommentOutput {
  const firstLine =
    input.postContent
      .split(/\n|\./)
      .map((s) => s.trim())
      .find((s) => s.length > 15)
      ?.slice(0, 110) || "repurposing high-leverage content workflows";
  const roleContext = input.yourRole?.trim() || "content & growth strategy";

  const replyPacks: IncomingCommentReplyPack[] = incoming.map((item, idx) => {
    const name = item.commenterName?.trim() || `Commenter #${idx + 1}`;
    const firstName = name.split(/\s+/)[0];
    const snippet = item.commentText.trim().slice(0, 85);

    const replies = [
      {
        angleLabel: "Value-Add & Deeper Insight",
        badge: "Boosts Post Dwell Time",
        replyText: `Appreciate you weighing in, ${firstName}! You nailed a key part of "${snippet}". In ${roleContext}, we've found that pairing that exact insight with a weekly 15-minute review makes the results compound twice as fast.`,
      },
      {
        angleLabel: "Engaging Follow-Up Question",
        badge: "Doubles Comment Count",
        replyText: `Spot on, ${firstName}—thanks for adding that perspective! Out of curiosity, how are you currently handling this in your own workflow right now? Always love learning how other practitioners approach it.`,
      },
      {
        angleLabel: "Warm Peer Appreciation",
        badge: "Relationship Builder",
        replyText: `Thank you, ${firstName}! Glad this breakdown resonated with what you're seeing on the ground. Let's definitely stay connected—always great exchanging notes with fellow operators.`,
      },
      {
        angleLabel: "Subtle Resource / DM Bridge",
        badge: "Lead Generation",
        replyText: `Great point, ${firstName}! That specific step around "${firstLine.slice(0, 55)}" is where most teams see the biggest lift. Happy to send over the exact checklist we use if you ever want to compare notes!`,
      },
    ].map((r) => ({ ...r, charCount: r.replyText.length }));

    return {
      commenterName: name,
      originalComment: item.commentText.trim(),
      replies,
    };
  });

  return {
    mode: "reply-to-comments-on-my-post",
    postCoreThesis: `Replying as the author of: "${firstLine}"`,
    comments: [],
    replyPacks,
    engagementTips: [
      "Replying to every comment on your post with a 2-sentence answer + follow-up question doubles total comment count and triggers a second wave of LinkedIn feed distribution.",
      "Stagger your author replies over the first 2–4 hours to keep your post active in commenters' notifications.",
      "Use commenters' first names naturally to build genuine B2B relationships.",
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<LinkedinCommentInput>;
    const mode = body.mode || "comment-on-others-post";
    const postContent = (body.postContent || "").trim();
    if (!postContent) {
      return NextResponse.json(
        {
          error:
            "Please paste the LinkedIn post content or extract from a URL first.",
        },
        { status: 400 },
      );
    }

    const incomingComments = (body.incomingComments || []).filter(
      (c) => c && c.commentText && c.commentText.trim().length > 0,
    );

    const input: LinkedinCommentInput = {
      mode,
      postContent,
      authorName: (body.authorName || "").trim(),
      yourRole: (body.yourRole || "SEO & Content Strategist").trim(),
      commentGoal: body.commentGoal || "authority-insight",
      incomingComments,
    };

    const model = getGeminiModel("LINKEDIN_COMMENT") || getGeminiModel();

    if (mode === "reply-to-comments-on-my-post") {
      const normalizedIncoming =
        incomingComments.length > 0
          ? incomingComments
          : [
              {
                id: "1",
                commenterName: "Alex Rivera",
                commentText:
                  "This breakdown is super practical. How long does it usually take your team to set up this workflow from scratch?",
              },
            ];

      if (isAiConfigured(model)) {
        try {
          const client = getGeminiClient();
          const res = await client.generate(
            {
              model,
              max_output_tokens: 2200,
              store: false,
              input: [
                {
                  role: "system",
                  content:
                    "You are an elite LinkedIn creator and B2B community strategist. The user is the AUTHOR of a LinkedIn post and wants tailored replies to 1 or more comments they received on their post. Using the full context of the user's original post and each commenter's message, generate 4 distinct reply options for EVERY incoming comment: (1) Value-Add & Deeper Insight, (2) Engaging Follow-Up Question, (3) Warm Peer Appreciation, and (4) Subtle Resource / DM Bridge.",
                },
                {
                  role: "user",
                  content: JSON.stringify({
                    authorRole: input.yourRole,
                    myOriginalPost: input.postContent.slice(0, 3500),
                    commentsToReplyTo: normalizedIncoming.slice(0, 8),
                  }),
                },
              ],
              text: {
                format: geminiTextFormat(
                  aiReplyPacksSchema,
                  "linkedin_author_reply_packs",
                  { compact: true },
                ),
              },
            },
            { timeout: 26000 },
          );
          if (res.output_parsed?.replyPacks?.length) {
            return NextResponse.json({
              mode: "reply-to-comments-on-my-post",
              postCoreThesis: res.output_parsed.postCoreThesis,
              comments: [],
              replyPacks: res.output_parsed.replyPacks.map((pack) => ({
                ...pack,
                replies: pack.replies.map((r) => ({
                  ...r,
                  charCount: r.replyText?.length || r.charCount || 160,
                })),
              })),
              engagementTips: res.output_parsed.engagementTips,
            });
          }
        } catch {
          // Fallback below
        }
      }

      return NextResponse.json(
        buildFallbackReplyPacks(input, normalizedIncoming),
      );
    }

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
              format: geminiTextFormat(
                aiOutputSchema,
                "linkedin_comments_pack",
                {
                  compact: true,
                },
              ),
            },
          },
          { timeout: 24000 },
        );
        if (res.output_parsed?.comments?.length) {
          return NextResponse.json({
            mode: "comment-on-others-post",
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
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate LinkedIn comments.",
      },
      { status: 500 },
    );
  }
}
