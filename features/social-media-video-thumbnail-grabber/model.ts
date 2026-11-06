export type VideoThumbnailAsset = ThumbnailVariant;

export interface ThumbnailVariant {
  id: string;
  label: string;
  resolution: string;
  aspectRatio: string;
  url: string;
  category: "High-Res Cover" | "Standard Cover" | "Storyboard Frame" | "Social OpenGraph";
  recommendedUse: string;
}

export interface VideoInspectResult {
  isYoutube: boolean;
  platformName: string;
  sourceUrl: string;
  videoId?: string;
  title: string;
  authorOrChannel: string;
  description: string;
  embedHtml?: string;
  thumbnails: ThumbnailVariant[];
  tagsOrKeywords: string[];
  seoChecklist: {
    label: string;
    passed: boolean;
    detail: string;
  }[];
}
