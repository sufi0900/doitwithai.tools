export type PlanTierId = "free" | "pro_creator" | "pro_plus";

export interface ConnectedStudioSite {
  id: string;
  name: string;
  url: string;
  niche: string;
  audience: string;
  primaryGoal: string;
  brandColorHex: string;
  sourceType: "external-url" | "website-builder";
  isolatedSubdomain?: string;
  customCname?: string | null;
  builderProjectId?: string;
  installedToolSlugs?: string[];
  coreOfferSummary?: string;
  businessModel?: string;
  detectedContentPillars?: string[];
  robotsTxtPreview?: string;
  hasLlmsTxt?: boolean;
  sitemapUrls: Array<{ url: string; title: string }>;
  auditSnapshot: SiteAuditSnapshot | null;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface SiteAuditCheckItem {
  id: string;
  category: "on-page" | "metadata" | "schema" | "technical" | "links";
  label: string;
  status: "pass" | "warn" | "fail";
  value: string;
  recommendation: string;
  fixToolHref: string;
  fixToolLabel: string;
}

export interface SiteAuditSnapshot {
  auditedUrl: string;
  auditedAtIso: string;
  overallScore: number;
  title: string;
  titleLength: number;
  titlePixelEstimate: number;
  metaDescription: string;
  metaDescriptionLength: number;
  h1Count: number;
  h1Text: string;
  h2Count: number;
  wordCount: number;
  internalLinkCount: number;
  externalLinkCount: number;
  imagesMissingAlt: number;
  totalImages: number;
  schemaTypes: string[];
  hasCanonical: boolean;
  canonicalUrl: string;
  hasRobotsTxt: boolean;
  hasLlmsTxt?: boolean;
  sitemapPageCount: number;
  brandColors: string[];
  checks: SiteAuditCheckItem[];
}

export interface SavedKeywordItem {
  id: string;
  siteId: string;
  keyword: string;
  clusterName: string;
  intent: "informational" | "commercial" | "transactional" | "comparison";
  kdEstimate: number;
  suggestedTitle: string;
  suggestedSlug: string;
  status: "backlog" | "planned" | "drafting" | "published";
  funnelStage?: "tofu" | "mofu" | "bofu";
  articleAngle?: string;
  internalLinkTargets?: Array<{ url: string; title: string }>;
  cannibalizationStatus?: "clear" | "overlap-review" | "optimize-existing";
  existingOverlapUrl?: string;
  createdAtIso: string;
}

export interface OnPageRubricCategoryScore {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  status: "strong" | "polish" | "fix";
  findings: string[];
}

export interface ExistingPageOptimizationPlan {
  id: string;
  siteId: string;
  pageUrl: string;
  pageType: "blog" | "landing" | "service" | "tool" | "homepage";
  overallScore: number;
  currentTitle: string;
  currentMetaDescription: string;
  currentH1: string;
  currentKeyword: string;
  wordCount: number;
  h2Headings: string[];
  internalLinksCount: number;
  externalLinksCount: number;
  imagesMissingAlt: number;
  totalImages: number;
  schemaTypes: string[];
  hasCanonical: boolean;
  canonicalUrl: string;
  coverageStatus:
    | "covered"
    | "under-optimized"
    | "missing"
    | "cannibalization-risk";
  recommendedTitle: string;
  recommendedMetaDescription: string;
  recommendedH1: string;
  quickAnswer50Words: string;
  missingSubtopics: string[];
  recommendedFaqs: Array<{ question: string; answer: string }>;
  rubricCategories: OnPageRubricCategoryScore[];
  auditedAtIso: string;
}

export interface StudioCopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAtIso: string;
  recommendedToolSlugs?: string[];
  recommendedPromptTitles?: string[];
  followUps?: string[];
}

export type EditorialTaskStatus =
  | "idea"
  | "outlined"
  | "drafting"
  | "review"
  | "published";

export interface EditorialPlannerItem {
  id: string;
  siteId: string;
  title: string;
  targetKeyword: string;
  dueDate: string; // YYYY-MM-DD
  status: EditorialTaskStatus;
  checklist: {
    keywordLocked: boolean;
    outlineReviewed: boolean;
    eeatAdded: boolean;
    infographicReady: boolean;
    internalLinksChecked: boolean;
    publishedManually: boolean;
  };
  notes: string;
  writerUrl?: string;
  updatedAtIso: string;
}

export interface StudioQuotaUsage {
  monthKey: string; // YYYY-MM
  articlesGenerated: number;
  auditsRun: number;
  keywordBatchesRun: number;
}

export interface StudioRuntimeStatus {
  unlimitedTesting: boolean;
  studioAiConfigured: boolean;
  providerLabel: string;
}

export interface StudioWorkspaceState {
  version: 1;
  guestPassActive: boolean;
  planTier: PlanTierId;
  billingCycle: "monthly" | "yearly";
  activeSiteId: string | null;
  sites: ConnectedStudioSite[];
  keywords: SavedKeywordItem[];
  plannerItems: EditorialPlannerItem[];
  savedPromptIds: string[];
  pageOptimizations: ExistingPageOptimizationPlan[];
  completedPlaybookSlugs: string[];
  copilotMessagesBySite: Record<string, StudioCopilotMessage[]>;
  usage: StudioQuotaUsage;
}
