export type InstagramPostFormat =
  | "carousel-educator"
  | "reel-hook-caption"
  | "storytelling-single"
  | "saveable-checklist";

export interface InstagramCaptionInput {
  topicOrContent: string;
  niche: string;
  postFormat: InstagramPostFormat;
  callToAction: string;
}

export interface InstagramCarouselSlide {
  slideNumber: number;
  headline: string;
  supportingText: string;
  visualPrompt: string;
}

export interface InstagramCaptionVariation {
  styleLabel: string;
  aboveTheFoldHook: string;
  fullCaption: string;
  altTextSeo: string;
}

export interface InstagramCaptionOutput {
  captions: InstagramCaptionVariation[];
  carouselSlides: InstagramCarouselSlide[];
  hashtagTiers: {
    broadReach: string[];
    nicheSpecific: string[];
    communitySearch: string[];
  };
  audioAndReelTip: string;
}
