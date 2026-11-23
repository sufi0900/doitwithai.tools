export type TwitterCardType = "summary" | "summary_large_image";

export type OgState = {
  pageUrl: string;
  siteName: string;
  title: string;
  description: string;
  imageUrl: string;
  twitterHandle: string;
  twitterCardType: TwitterCardType;
};

export type OgIssue = {
  level: "error" | "warning" | "info";
  message: string;
};

export type ImageProbeResult = {
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number | null;
};
