import type { CanonicalBlogProjectState } from "@/lib/blog-writer/canonical-state";
export type RichNode = {
  type: string;
  text?: string;
  attrs?: Record<string, any>;
  marks?: { type: string; attrs?: Record<string, any> }[];
  content?: RichNode[];
};
export type Reference = {
  id: string;
  url: string;
  title: string;
  text: string;
  importedAt?: string;
};
export type WriterRun = {
  status: "idle" | "planning" | "drafting" | "paused" | "failed" | "done";
  inputHash: string;
  completed: string[];
  current?: string;
  error?: string;
  provider?: string;
};
export type SocialOverride = {
  caption?: string;
  headline?: string;
  body?: string;
  variant?: string;
  theme?: string;
  sourceRevision?: string;
};
export interface WriterWorkspaceState {
  version: 1;
  document?: RichNode;
  references: Reference[];
  targetWords: number;
  language: string;
  metaDescriptions: string[];
  run: WriterRun;
  brand: { name: string; color: string; logo?: string };
  social: Record<string, SocialOverride>;
  visualRevisions?: Record<string, string>;
  email?: { subject: string; body: string; sourceRevision: string };
}
declare module "@/lib/blog-writer/canonical-state" {
  interface CanonicalBlogProjectState {
    writerWorkspace?: WriterWorkspaceState;
  }
}
export type Project = CanonicalBlogProjectState;
export type OutlineItem = {
  id?: string;
  heading: string;
  subheadings: string[];
  words?: number;
};
export type Plan = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  introduction: string;
  titles: string[];
  descriptions: string[];
  sections: OutlineItem[];
};
