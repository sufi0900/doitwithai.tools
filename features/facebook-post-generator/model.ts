export type FacebookPostFormat =
  | "story-engagement"
  | "value-listicle"
  | "community-debate"
  | "promo-first-comment";

export interface FacebookPostInput {
  topicOrContent: string;
  targetAudience: string;
  postFormat: FacebookPostFormat;
  destinationUrl?: string;
  brandTone: string;
}

export interface FacebookPostVariation {
  styleName: string;
  hookLine: string;
  fullPostText: string;
  firstCommentText: string;
  engagementQuestion: string;
  visualHeadline: string;
  visualSubtext: string;
  hashtags: string[];
}

export interface FacebookPostOutput {
  strategySummary: string;
  variations: FacebookPostVariation[];
  bestPostingTip: string;
}
