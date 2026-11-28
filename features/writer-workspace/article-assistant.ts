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
  focusSectionId?: string;
  sources?: Array<{ title: string; url: string }>;
};

export type Passage = { from: number; to: number; text: string; revision: string };
export const articleDownloads = [
  { id: "pdf", label: "PDF" },
  { id: "docx", label: "Word (.docx)" },
  { id: "html", label: "HTML" },
  { id: "markdown", label: "Markdown (.md)" },
] as const;

const toolTopics: Record<AssistantCard, RegExp> = {
  meta: /\b(?:meta(?:data| tags?| title| description)?|serp|search preview|search appearance)\b/i,
  faqs: /\b(?:faqs?|frequently asked questions)\b/i,
  visuals: /\b(?:images?|visuals?|banners?|infographics?|alt text)\b/i,
  score: /\b(?:(?:content|article|seo) score|(?:my|the) score|score inspector)\b/i,
  readability: /\b(?:readability|reading (?:level|grade)|long sentences?|sentence length|hard to read|easier to read)\b/i,
  seo: /\b(?:seo (?:settings|panel|tools|checks|audit)|seo\s*(?:&|and)\s*links|internal (?:linking|links?)|keyword (?:usage|coverage|density|tracking|optimization)|tracked terms|link opportunities)\b/i,
  headings: /\b(?:headings?|outline)\b|\b(?:list|show)\s+(?:me\s+)?(?:the\s+|my\s+|all\s+)?(?:article\s+)?sections\b/i,
  downloads: /\b(?:download|exports?|exporting|pdf|docx|markdown)\b/i,
};

const opensTool = /\b(?:open|show|go to|take me to|jump to|navigate to|where (?:is|are|can i find))\b/i;
const targetsTool = /\b(?:review|check|audit|improve|fix|optimi[sz]e|edit|update|compare|how (?:many|long)|what(?:'s| is| are)|give me|recommend|suggest|add|rewrite)\b/i;
const drafting = /\b(?:draft|write|add|create|insert|suggest|propose)\b[^.!?]{0,100}\b(?:new\s+)?(?:section|paragraph)\b|\b(?:section|paragraph)\b[^.!?]{0,55}\bto add\b/i;
const navigating = /\b(?:jump to|go to|take me to|navigate to|locate|open)\b/i;

export function relevantAssistantActions(question: string, answer: AssistantReply) {
  const prompt = question.replace(/https?:\/\/[^\s<>"\]]+/gi, " ").replace(/```[\s\S]*?```/g, " ");
  const clauses = prompt.split(/[\n.!?;]+|\b(?:and also|also|then)\b/i).map((part) => part.trim()).filter(Boolean);
  const target = (clause: string, card: AssistantCard) => {
    if (!toolTopics[card].test(clause) || /\b(?:no|without|don.t (?:show|open))\s+(?:any\s+)?(?:cards?|tools?|panels?)\b/i.test(clause)) return false;
    if (drafting.test(clause) && !/\b(?:open|go to|take me to|show me)\b[^.!?]{0,50}\b(?:panel|tools?|inspector|organizer)\b/i.test(clause)) return false;
    if (opensTool.test(clause)) return true;
    if (card === "downloads") return /\b(?:download|export)\b/i.test(clause);
    return targetsTool.test(clause) || clause.split(/\s+/).length <= 3;
  };
  const cards: AssistantCard[] = [];
  for (const card of new Set(answer.cards)) {
    if (assistantCards.includes(card) && clauses.some((clause) => target(clause, card))) cards.push(card);
  }
  return {
    cards,
    headingId: clauses.some((clause) => navigating.test(clause) && /\b(?:sections?|headings?|outline)\b/i.test(clause) && !drafting.test(clause)) ? answer.headingId : undefined,
    visualId: clauses.some((clause) => navigating.test(clause) && toolTopics.visuals.test(clause)) ? answer.visualId : undefined,
  };
}

export type AssistantTurn = {
  id: string;
  question: string;
  passage?: Passage;
  answer?: AssistantReply;
  proposal?: SavedProposal;
  error?: string;
};

export type AssistantThread = { id: string; passage?: Passage; turns: AssistantTurn[]; savedAt?: number };

export function assistantContinuity(previous: AssistantTurn[]) {
  const completed = previous.filter((turn) => turn.answer);
  const recent = completed.at(-1);
  const activeProposal = completed.slice().reverse().find((item) => item.proposal?.status === "pending" || item.proposal?.status === "applied");
  const sectionTurn = completed.slice().reverse().find((turn) => turn.answer?.focusSectionId || turn.proposal?.sectionId);
  const sectionId = sectionTurn?.answer?.focusSectionId || sectionTurn?.proposal?.sectionId;
  const latestFocus = sectionId || activeProposal?.proposal?.sectionId || "";
  const original = activeProposal?.proposal;
  const proposal = original && (!sectionId || sectionId === original.sectionId || recent?.id === activeProposal?.id)
    ? { kind: original.kind, markdown: original.markdown.slice(0, 24000), sectionId: original.sectionId, status: original.status === "applied" ? "applied" : "pending" }
    : undefined;
  return {
    focus: { sectionId: latestFocus, proposal, request: activeProposal?.question.slice(0, 1500) || "" },
    history: completed.slice(-8).map((turn) => ({
      question: turn.question.slice(0, 3000),
      reply: turn.answer!.reply.slice(0, 4000),
    })),
  };
}

export function assistantLinkIntent(question: string, recentQuestion = "") {
  const internal = /\b(?:internal (?:link(?:ing|s)?|source)|link to (?:my|our|the same) (?:site|website|blog))\b/i.test(question);
  const authority = /\b(?:external (?:link(?:ing|s)?|sources?)|first[- ]party|authority (?:sites?|sources?|links?|websites?)|authoritative (?:links?|sources?|websites?)|official (?:links?|sources?|documentation|reference))\b/i.test(question);
  if (!internal && !authority && /\b(?:another|different|one more|same|that|it)\b/i.test(question) &&
      /\b(?:links?|sources?|citations?|find|add|insert|replace)\b/i.test(question)) {
    return recentQuestion ? assistantLinkIntent(recentQuestion) : { internal, authority };
  }
  return { internal, authority };
}
