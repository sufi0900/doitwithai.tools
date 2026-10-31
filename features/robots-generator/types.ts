export type RuleType = "allow" | "disallow" | "crawl-delay";

export type RobotsRule = {
  id: string;
  type: RuleType;
  path: string;
};

export type RobotsGroup = {
  id: string;
  userAgents: string[];
  rules: RobotsRule[];
};

export type RobotsState = {
  groups: RobotsGroup[];
  sitemapUrls: string[];
};

export type RobotsIssue = {
  level: "error" | "warning" | "info";
  message: string;
};

export type RootAccess = "open" | "restricted" | "blocked";
export type MatchedVia = "exact" | "wildcard" | "none";

export type CrawlerMatrixRow = {
  token: string;
  operator: string;
  purpose: "training" | "search" | "user-fetch";
  note?: string;
  matchedVia: MatchedVia;
  access: RootAccess;
};
