export type Settings = {
  brand: string;
  target: string;
  aliases: string[];
  caseSensitive: boolean;
  includeSubdomains: boolean;
};
export type Mention = {
  text: string;
  before: string;
  after: string;
  kind: "plain" | "website-link" | "other-link" | "partial-link";
  href: string;
  destinations: string[];
  rel: string[];
  section: string;
};
export type Status =
  | "unlinked"
  | "linked"
  | "mixed"
  | "elsewhere"
  | "review"
  | "not-mentioned"
  | "unverified"
  | "own-site";
export type MentionReport = {
  sourceUrl: string;
  finalUrl: string;
  checkedAt: string;
  method: "live" | "pasted";
  httpStatus: number | null;
  title: string;
  status: Status;
  complete: boolean;
  mentions: Mention[];
  siteLinks: { href: string; rel: string[] }[];
  notes: string[];
  error: string;
};
export const labels: Record<Status, string> = {
  unlinked: "Mention without a website link",
  linked: "Brand mention linked",
  mixed: "Some mentions unlinked",
  elsewhere: "Website link elsewhere on page",
  review: "Review the linked destination",
  "not-mentioned": "No matching mention in HTML",
  unverified: "Unable to verify",
  "own-site": "Your own website · excluded",
};
export const defaultSettings: Settings = {
  brand: "",
  target: "",
  aliases: [],
  caseSensitive: false,
  includeSubdomains: true,
};
