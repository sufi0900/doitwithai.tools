export type SiteAssistantRole = "user" | "assistant";

export type SiteAssistantMessage = {
  id: string;
  role: SiteAssistantRole;
  content: string;
  sources?: SiteAssistantSource[];
  createdAt: string;
};

export type SiteAssistantSource = {
  title: string;
  url: string;
  kind: string;
};

export type SiteAssistantRequest = {
  messages: Array<Pick<SiteAssistantMessage, "role" | "content">>;
  currentPage?: {
    title?: string;
    url?: string;
  };
  website?: string;
};

export type SiteAssistantResponse = {
  answer: string;
  sources: SiteAssistantSource[];
  requestId: string;
};

export type KnowledgeDocument = {
  title: string;
  url: string;
  kind: string;
  description: string;
  content: string;
  updatedAt?: string;
};
