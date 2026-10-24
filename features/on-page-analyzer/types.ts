export type Section =
  | "overview"
  | "search"
  | "headings"
  | "content"
  | "links"
  | "media"
  | "technical"
  | "schema"
  | "ai-search";
export type Status = "critical" | "warning" | "passed" | "info" | "unchecked";
export type Block = {
  id: string;
  tag: string;
  text: string;
  listItem?: number;
};
export type PageLink = {
  href: string;
  text: string;
  rel: string;
  blockId?: string;
};
export type PageImage = {
  src: string;
  alt: string | null;
  width: string;
  height: string;
  loading: string;
};
export type PageSnapshot = {
  url: string;
  checkedAt: string;
  source: "url" | "paste";
  status: number | null;
  title: string;
  titleCount: number;
  description: string;
  descriptionCount: number;
  canonical: string;
  canonicalCount: number;
  robots: string[];
  language: string;
  viewport: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  siteName: string;
  favicon?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: string;
  blocks: Block[];
  links: PageLink[];
  images: PageImage[];
  schemas: {
    types: string[];
    valid: number;
    invalid: number;
    samples: string[];
    sampleFormats?: ("JSON-LD" | "Microdata" | "RDFa")[];
    markupWarnings?: string[];
    invalidSamples?: { raw: string; block: number }[];
  };
  author: string;
  modified: string;
  scope: string;
  partial: boolean;
  warnings: string[];
  bytesRead: number;
  redirects: number;
  resources: {
    robots: "found" | "missing" | "unknown";
    robotsText: string;
    robotsPartial?: boolean;
    llms: "found" | "missing" | "unknown";
  };
};
export type Finding = {
  id: string;
  section: Exclude<Section, "overview">;
  status: Status;
  title: string;
  evidence: string;
  advice: string;
  tool: string;
  weight: number;
  credit?: 0 | 0.5 | 1;
  field?: string;
};
export type Change = { field: string; before: string; after: string };
export const SECTIONS: { id: Section; label: string; short: string }[] = [
  { id: "overview", label: "Audit overview", short: "Overview" },
  { id: "search", label: "Search appearance", short: "Search" },
  { id: "headings", label: "Heading structure", short: "Headings" },
  { id: "content", label: "Content & readability", short: "Content" },
  { id: "links", label: "Links & anchors", short: "Links" },
  { id: "media", label: "Images & media", short: "Images" },
  { id: "technical", label: "Technical checks", short: "Technical" },
  { id: "schema", label: "Structured data", short: "Schema" },
  { id: "ai-search", label: "AI search review", short: "AI search" },
];
export const STATUS_LABEL: Record<Status, string> = {
  critical: "Critical",
  warning: "Review",
  passed: "Passed",
  info: "Opportunity",
  unchecked: "Not checked",
};
