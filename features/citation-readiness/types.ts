export type DocSource = "url" | "text";

export type DocHeading = { level: number; text: string };

export type NormalizedDoc = {
  source: DocSource;
  title: string;
  h1Count: number;
  headings: DocHeading[];
  paragraphs: string[];
  listCount: number;
  tableCount: number;
  hasAuthor: boolean | null;
  hasPublishedDate: boolean | null;
  hasModifiedDate: boolean | null;
  outboundLinkDomains: string[] | null;
  schemaTypes: string[] | null;
  hasCanonical: boolean | null;
  wordCount: number;
};

export type CheckStatus = "pass" | "warn" | "fail" | "na";

export type CheckResult = {
  id: string;
  category: "answer" | "structure" | "evidence" | "technical";
  label: string;
  status: CheckStatus;
  detail: string;
};

export type CategoryScore = {
  id: "answer" | "structure" | "evidence" | "technical";
  name: string;
  earned: number;
  possible: number;
};

export type AnalysisResult = {
  score: number;
  checks: CheckResult[];
  categories: CategoryScore[];
};
