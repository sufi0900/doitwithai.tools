export const assistantCards = ["meta", "faqs", "visuals", "score", "readability", "seo", "headings", "downloads"] as const;
export type AssistantCard = (typeof assistantCards)[number];

export type AssistantReply = {
  reply: string;
  cards: AssistantCard[];
  headingId?: string;
  visualId?: string;
  editInstruction?: string;
  sources?: Array<{ title: string; url: string }>;
};

export type Passage = { from: number; to: number; text: string; revision: string };
export const articleDownloads = [
  { id: "pdf", label: "PDF" },
  { id: "docx", label: "Word (.docx)" },
  { id: "html", label: "HTML" },
  { id: "markdown", label: "Markdown (.md)" },
] as const;
