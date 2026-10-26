export type Options = {
  target: string;
  mode: "domain" | "page";
  includeSubdomains: boolean;
  expectedAnchor: string;
  expectedRel: "any" | "unqualified" | "nofollow" | "sponsored" | "ugc";
};
export type Hop = { url: string; status: number; location: string };
export type Destination = {
  url: string;
  finalUrl: string;
  status: number | null;
  redirects: Hop[];
  error: string;
};
export type Match = {
  href: string;
  anchor: string;
  anchorSource: string;
  rel: string[];
  context: string;
  placement: string;
  external: boolean;
  issues: string[];
  destination?: Destination;
};
export type Report = {
  sourceUrl: string;
  finalUrl: string;
  status: "found" | "not-found" | "different-page" | "unverified";
  checkedAt: string;
  httpStatus: number | null;
  redirects: Hop[];
  title: string;
  canonical: string;
  robots: string[];
  pageNofollow: boolean;
  noindex: boolean;
  crawlAccess: "allowed" | "blocked" | "unknown";
  crawlNote: string;
  complete: boolean;
  links: Match[];
  otherTargets: string[];
  notes: string[];
  error: string;
  method: "live" | "pasted";
};
export type SavedRun = {
  version: 1;
  options: Options;
  reports: Report[];
  savedAt: string;
};
export const labels: Record<Report["status"], string> = {
  found: "Link found",
  "not-found": "Not found in HTML",
  "different-page": "Different target page",
  unverified: "Unable to verify",
};
export const defaultOptions: Options = {
  target: "",
  mode: "domain",
  includeSubdomains: false,
  expectedAnchor: "",
  expectedRel: "any",
};
