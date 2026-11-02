export type AnchorCategory =
  | "exact-match"
  | "partial-match"
  | "brand-keyword"
  | "branded"
  | "naked-url"
  | "generic"
  | "topical-natural"
  | "image-empty";

export type PageBenchmarkProfile = "homepage" | "commercial" | "editorial";

export type PlacementZone =
  | "editorial-body"
  | "navigation"
  | "sidebar"
  | "footer"
  | "author-bio"
  | "imported-row";

export type FollowStatus = "dofollow" | "nofollow" | "sponsored" | "ugc";

export type AnchorRow = {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  normalizedAnchor: string;
  category: AnchorCategory;
  matchedKeyword?: string;
  followStatus: FollowStatus;
  relTokens: string[];
  zone: PlacementZone;
  isInternal: boolean;
  isImageLink: boolean;
  contextSnippet: string;
};

export type CategoryBreakdown = {
  category: AnchorCategory;
  label: string;
  description: string;
  count: number;
  percentage: number;
  dofollowCount: number;
  recommendedMin: number;
  recommendedMax: number;
  status: "within-target" | "above-target" | "below-target";
  sampleAnchors: string[];
};

export type RepeatedAnchorItem = {
  anchor: string;
  category: AnchorCategory;
  count: number;
  percentage: number;
  uniqueSources: number;
  dofollowCount: number;
  riskNote: string;
};

export type RiskFinding = {
  id: string;
  severity: "high" | "medium" | "good";
  title: string;
  detail: string;
  recommendation: string;
};

export type DiversificationSuggestion = {
  category: AnchorCategory;
  categoryLabel: string;
  recommendedNextCount: number;
  rationale: string;
  examples: string[];
};

export type AnchorAnalysisReport = {
  mode: "csv" | "live" | "html";
  profile: PageBenchmarkProfile;
  targetDomain: string;
  brandTerms: string[];
  targetKeywords: string[];
  totalLinks: number;
  dofollowLinks: number;
  nofollowLinks: number;
  sponsoredLinks: number;
  ugcLinks: number;
  uniqueAnchors: number;
  uniqueSources: number;
  diversityScore: number; // 0-100 deterministic Shannon-entropy + benchmark alignment index
  riskLevel: "low" | "moderate" | "high";
  categories: CategoryBreakdown[];
  repeatedAnchors: RepeatedAnchorItem[];
  findings: RiskFinding[];
  diversificationPlan: DiversificationSuggestion[];
  rows: AnchorRow[];
  notes: string[];
  analyzedAt: string;
};
