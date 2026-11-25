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
  createdAtIso: string;
}

export type EditorialTaskStatus = "idea" | "outlined" | "drafting" | "review" | "published";

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
  usage: StudioQuotaUsage;
}
