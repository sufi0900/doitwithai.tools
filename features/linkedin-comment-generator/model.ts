export type CommentGoal =
  | "authority-insight"
  | "spark-discussion"
  | "contrarian-nuance"
  | "warm-networking"
  | "subtle-expertise";

export interface LinkedinCommentInput {
  postContent: string;
  authorName?: string;
  yourRole?: string;
  commentGoal: CommentGoal;
}

export interface GeneratedLinkedinComment {
  styleLabel: string;
  badge: string;
  commentText: string;
  charCount: number;
  whyItWorks: string;
  predictedAuthorReply: string;
}

export interface LinkedinCommentOutput {
  postCoreThesis: string;
  comments: GeneratedLinkedinComment[];
  engagementTips: string[];
}
