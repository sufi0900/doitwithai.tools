export const assistantCards = ["meta", "faqs", "visuals", "score", "readability", "seo", "headings", "downloads"] as const;
export type AssistantCard = (typeof assistantCards)[number];

export type DraftChange = {
  kind: "passage" | "section" | "insert-section" | "article";
  markdown: string;
  sectionId?: string;
};

export type SavedProposal = DraftChange & {
  revision: string;
  passage?: Passage;
  status: "pending" | "applied" | "discarded";
};

export type ResearchMode = "auto" | "web" | "off";

export function requestsResearch(question: string) {
  if (/\b(?:do not|don't|without|no need to)\s+(?:use the web|research|search|browse)\b/i.test(question)) return false;
  return /https?:\/\/|\b(?:web research|web search|search (?:the web|online|for)|look up|browse|research (?:online|this|a|the|for)|competitor analysis|(?:find|add|include|verify).{0,55}(?:stats|statistics?|research|current data|sources|competitors)|latest|up-to-date)\b/i.test(question);
}

export type AssistantReply = {
  reply: string;
  cards: AssistantCard[];
  headingId?: string;
  visualId?: string;
  editInstruction?: string;
  change?: DraftChange;
  researchNote?: string;
  sources?: Array<{ title: string; url: string }>;
};

export type Passage = { from: number; to: number; text: string; revision: string };
export const articleDownloads = [
  { id: "pdf", label: "PDF" },
  { id: "docx", label: "Word (.docx)" },
  { id: "html", label: "HTML" },
  { id: "markdown", label: "Markdown (.md)" },
] as const;
