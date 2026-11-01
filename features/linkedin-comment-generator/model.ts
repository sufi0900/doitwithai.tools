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
