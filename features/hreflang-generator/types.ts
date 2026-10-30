export type HreflangEntry = {
  id: string;
  code: string;
  url: string;
};

export type HreflangState = {
  entries: HreflangEntry[];
};

export type HreflangIssue = {
  level: "error" | "warning" | "info";
  message: string;
};

export type OutputFormat = "html" | "header";
