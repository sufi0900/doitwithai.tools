export type CommentGoal =
  | "authority-insight"
  | "spark-discussion"
  | "contrarian-nuance"
  | "warm-networking"
  | "subtle-expertise";

export type LinkedinCommentMode =
  | "comment-on-others-post"
  | "reply-to-comments-on-my-post";

export interface IncomingCommentItem {
  id: string;
  commenterName: string;
  commentText: string;
}

export interface LinkedinCommentInput {
  mode?: LinkedinCommentMode;
  postContent: string;
  authorName?: string;
  yourRole?: string;
  commentGoal: CommentGoal;
  incomingComments?: IncomingCommentItem[];
}

export interface GeneratedLinkedinComment {
  styleLabel: string;
  badge: string;
  commentText: string;
  charCount: number;
  whyItWorks: string;
  predictedAuthorReply: string;
}

export interface CommentReplyOption {
  angleLabel: string;
  badge: string;
  replyText: string;
  charCount: number;
}

export interface IncomingCommentReplyPack {
  commenterName: string;
  originalComment: string;
  replies: CommentReplyOption[];
}

export interface LinkedinCommentOutput {
  mode?: LinkedinCommentMode;
  postCoreThesis: string;
  comments: GeneratedLinkedinComment[];
  replyPacks?: IncomingCommentReplyPack[];
  engagementTips: string[];
}

export const DEFAULT_LINKEDIN_COMMENT_OUTPUT: LinkedinCommentOutput = {
  mode: "comment-on-others-post",
  postCoreThesis:
    "Content distribution and multi-format repurposing—not raw writing volume—is the primary growth lever for B2B authority.",
  comments: [
    {
      styleLabel: "1. Practitioner Framework Add-On",
      badge: "Authority Builder",
      commentText:
        "Spot on about the distribution bottleneck. We started applying a '1-to-5 Slice Rule' to every pillar guide—turning each H2 heading into a standalone post + a 1080×1080 visual framework card—and it tripled our organic reach without adding a single extra hour of writing.",
      charCount: 266,
      whyItWorks:
        "Validates the author's thesis while introducing a named, memorable practitioner habit ('1-to-5 Slice Rule') that positions your profile as an operator.",
      predictedAuthorReply:
        "Love the '1-to-5 Slice Rule' framing—slicing by H2 is so much cleaner than summarizing the whole article at once.",
    },
    {
      styleLabel: "2. High-Signal Follow-Up Question",
      badge: "Thread Starter",
      commentText:
        "Completely agree that sharing a single bare link is where most B2B teams stall out. When you slice a guide into 5 sub-topic posts, how do you sequence them across the week so your audience doesn't feel repetition?",
      charCount: 221,
      whyItWorks:
        "Asks a specific operational question that invites the post author to share their tactical cadence, pinning your comment near the top of the thread.",
      predictedAuthorReply:
        "Great question! We usually alternate formats—text + chart card on Tuesday, carousel on Thursday, and founder note on Friday.",
    },
    {
      styleLabel: "3. 90% Agree + 10% Nuanced Edge",
      badge: "Thought Leadership",
      commentText:
        "100% with you on repurposing. One nuance we noticed: repurposing only compounds if the underlying pillar article has original data or a visual mental model. Repurposing generic fluff into 10 formats just distributes noise faster.",
      charCount: 235,
      whyItWorks:
        "Adds sharp editorial discernment that earns likes from senior operators reading the comment section.",
      predictedAuthorReply:
        "Couldn't agree more—repurposing is an amplifier, so the core asset has to carry real signal first.",
    },
    {
      styleLabel: "4. Quantified Case Study Proof",
      badge: "Social Proof",
      commentText:
        "This mirrors what we saw last quarter: cutting our raw blog volume in half and spending that time building native carousels + visual takeaway cards lifted feed dwell time and profile clicks by 2.4x.",
      charCount: 204,
      whyItWorks:
        "Backs up the author's point with concrete benchmark metrics that make readers curious about your work.",
      predictedAuthorReply:
        "2.4x lift from cutting volume in half is the ultimate proof point for distribution over creation!",
    },
    {
      styleLabel: "5. Warm Peer Amplification",
      badge: "Relationship Builder",
      commentText:
        "Bookmarking this for our content team's Monday sprint. The shift from 'publish once and move on' to 'slice every H2 into native visual assets' is the highest-ROI habit in B2B marketing right now.",
      charCount: 202,
      whyItWorks:
        "High-warmth validation that signals team leadership and encourages immediate author reciprocity.",
      predictedAuthorReply:
        "Appreciate that! Hope it sparks some great ideas in Monday's sprint.",
    },
  ],
  engagementTips: [
    "Leave your comment within the first 45 minutes of the post going live to ride the initial impressions wave.",
    "Keep comments between 35 and 65 words—long enough to trigger 'see more' dwell time without feeling like an essay.",
    "Tag the author by first name only when asking a direct follow-up question.",
  ],
};
