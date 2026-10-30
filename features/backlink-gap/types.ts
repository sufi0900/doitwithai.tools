export type Field =
  | "source"
  | "target"
  | "anchor"
  | "title"
  | "rel"
  | "nofollow"
  | "sponsored"
  | "ugc"
  | "status"
  | "lost"
  | "metric";
export type Mapping = Record<Field, number>;
export type Table = {
  headers: string[];
  rows: string[][];
  delimiter: string;
  hasHeader: boolean;
  mapping: Mapping;
};
export type DatasetInput = {
  id: string;
  site: string;
  provider: string;
  date: string;
  name: string;
  text: string;
  table: Table | null;
  emptyConfirmed: boolean;
};
export type Evidence = {
  datasetId: string;
  record: number;
  sourceValue: string;
  sourceUrl: string;
  host: string;
  domain: string;
  target: string;
  anchor: string;
  title: string;
  rel: string[];
  relationship: "qualified" | "no-nofollow-recorded" | "unknown";
  state: "inactive" | "not-marked-inactive" | "unknown";
  rawState: string;
  metric: string;
  metricName: string;
};
export type Dataset = {
  id: string;
  site: string;
  provider: string;
  date: string;
  name: string;
  rows: Evidence[];
  imported: number;
  invalid: number;
  duplicates: number;
  internal: number;
  foreign: number;
  issues: { record: number; reason: string; value: string }[];
  emptyConfirmed: boolean;
};
export type Review = { status: "review" | "shortlist" | "skip"; note: string };
export type GapGroup = {
  key: string;
  own: Evidence[];
  competitors: Record<string, Evidence[]>;
  matches: number;
  records: number;
};
export type GapReport = {
  datasets: Dataset[];
  groups: GapGroup[];
  grouping: "domain" | "host";
  includeInactive: boolean;
  excludedInactive: number;
  excludedSites: number;
  createdAt: string;
};
export const fieldNames: Record<Field, string> = {
  source: "Referring page or domain",
  target: "Target page",
  anchor: "Anchor text",
  title: "Source page title",
  rel: "Link rel / type",
  nofollow: "Nofollow flag",
  sponsored: "Sponsored flag",
  ugc: "UGC flag",
  status: "Link status",
  lost: "Lost flag / date",
  metric: "Optional source metric",
};
export const emptyMapping: Mapping = {
  source: -1,
  target: -1,
  anchor: -1,
  title: -1,
  rel: -1,
  nofollow: -1,
  sponsored: -1,
  ugc: -1,
  status: -1,
  lost: -1,
  metric: -1,
};
export function newDataset(id: string): DatasetInput {
  return {
    id,
    site: "",
    provider: "Unspecified",
    date: "",
    name: "",
    text: "",
    table: null,
    emptyConfirmed: false,
  };
}
