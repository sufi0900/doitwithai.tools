export type Strategy = "mobile" | "desktop";
export type VitalRating = "good" | "needs-improvement" | "poor" | "unknown";

export type CategoryScore = {
  id: string;
  name: string;
  score: number | null; // 0–100
};

export type Metric = {
  id: string;
  label: string;
  displayValue: string;
  rating: VitalRating;
};

export type FieldData = {
  source: "page" | "origin" | null;
  overallRating: VitalRating | null;
  metrics: Metric[];
};

export type PageSpeedResult = {
  checkedAt?: string;
  requestedUrl: string;
  finalUrl: string;
  strategy: Strategy;
  categories: CategoryScore[];
  fieldData: FieldData;
  labMetrics: Metric[];
  findings?: AuditFinding[];
  reportWarnings?: string[];
  environment?: { formFactor: string; throttlingMethod: string };
};

export type AuditFinding = {
  id: string;
  title: string;
  description: string;
  category: string;
  score: number;
  displayValue: string;
  savingsMs: number | null;
  savingsBytes: number | null;
  resources: string[];
  nextStep: string;
};
