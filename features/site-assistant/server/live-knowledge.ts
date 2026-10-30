import registry from "../../tool-catalog/registry.json";
import { SITE_ASSISTANT_BASE_URL, siteProfileAsMarkdown } from "../config";
import type { KnowledgeDocument, SiteAssistantRequest } from "../types";
import { readBoundedJson } from "../../../lib/ai-tools/request-body";

const paths: Record<string, string> = {
  seo: "ai-seo",
  aitool: "ai-tools",
  coding: "ai-code",
  makemoney: "ai-learn-earn",
  guide: "guides",
  blogPost: "blogs",
};
const types = [...Object.keys(paths), "freeResources", "freeairesources"];
const published = `!(_id in path("drafts.**")) && _type in ${JSON.stringify(types)} && (_type != "guide" || (defined(publishedAt) && publishedAt <= now()))`;
type RecordData = {
  _id: string;
  _type: string;
  title: string;
  slug?: string;
  overview?: unknown;
  text?: string;
  prompt?: string;
  _updatedAt?: string;
  publishedAt?: string;
};
function plain(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(plain).join(" ");
  if (value && typeof value === "object") {
    const v = value as Record<string, unknown>;
    return plain(v.text ?? v.children ?? "");
  }
  return "";
}
export function publicDocument(record: RecordData): KnowledgeDocument | null {
  if (record._id.startsWith("drafts.") || !types.includes(record._type))
    return null;
  if (typeof record.title !== "string" || !record.title.trim()) return null;
  if (
    record._type === "guide" &&
    (!record.publishedAt ||
      !Number.isFinite(Date.parse(record.publishedAt)) ||
      Date.parse(record.publishedAt) > Date.now())
  )
    return null;
  const resources = ["freeResources", "freeairesources"].includes(record._type);
  if (!resources && !/^[a-z0-9][a-z0-9-]*$/i.test(record.slug || ""))
    return null;
  const path = resources
    ? "/free-ai-resources"
    : `/${paths[record._type]}/${record.slug}`;
  return {
    title: record.title,
    url: SITE_ASSISTANT_BASE_URL + path,
    kind: resources ? "free-resource" : "published-article",
    description: plain(record.overview),
    content: record.text || record.prompt || plain(record.overview),
    updatedAt: record._updatedAt,
  };
}
export function currentSiteDocuments(): KnowledgeDocument[] {
  const tools = registry.tools.filter((t) => t.status === "live");
  return [
    {
      title: "Do It With AI Tools",
      url: SITE_ASSISTANT_BASE_URL,
      kind: "site-profile",
      description: "Website, founder and contact information",
      content: siteProfileAsMarkdown(),
    },
    {
      title: "AI tools directory",
      url: SITE_ASSISTANT_BASE_URL + "/tools",
      kind: "tools-directory",
      description: "Current executable tools",
      content: `${tools.length} live tools:\n${tools.map((t) => `${t.name}: ${t.description} URL: ${SITE_ASSISTANT_BASE_URL}/tools/${t.slug}`).join("\n")}`,
    },
    ...tools.map((t) => ({
      title: t.name,
      url: `${SITE_ASSISTANT_BASE_URL}/tools/${t.slug}`,
      kind: "interactive-tool",
      description: t.description,
      content: `${t.description}\nCategories: ${t.categories.join(", ")}\nTags: ${t.tags.join(", ")}`,
    })),
  ];
}
const stop = new Set(
  "the a an is are was were to for of in on and or with my your you i me can how what which it this that do does please tell help have use using want website site ai tools tool".split(
    " ",
  ),
);
export function terms(text: string) {
  const expanded = text
    .toLowerCase()
    .replace(/readable|readability/g, "readability readable")
    .replace(/outline|outlining/g, "outline")
    .replace(/heading|headline/g, "heading h1")
    .replace(/clustering|cluster/g, "cluster topical keyword");
  const tokens: string[] = expanded.match(/[a-z0-9]+/g) ?? [];
  return [...new Set(tokens.filter((t) => t.length > 1 && !stop.has(t)))];
}
export function relevance(document: KnowledgeDocument, query: string) {
  return terms(query).reduce(
    (sum, term) =>
      sum +
      (document.title.toLowerCase().includes(term) ? 6 : 0) +
      (document.description.toLowerCase().includes(term) ? 2 : 0) +
      (document.content.toLowerCase().includes(term) ? 1 : 0),
    0,
  );
}
export function relevantExcerpt(content: string, query: string, size = 5000) {
  if (content.length <= size) return content;
  const words = terms(query);
  const parts = content.match(/[\s\S]{1,1800}/g) || [];
  return parts
    .map((text, index) => ({
      text,
      index,
      score: words.reduce(
        (n, word) => n + (text.toLowerCase().includes(word) ? 1 : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, Math.max(1, Math.floor(size / 1806)))
    .sort((a, b) => a.index - b.index)
    .map((p) => p.text)
    .join("\n[…]\n")
    .slice(0, size);
}
async function querySanity(
  query: string,
  signal?: AbortSignal,
  ids?: string[],
) {
  const project = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  if (
    !project ||
    !/^[a-z0-9]+$/.test(project) ||
    !/^[a-z0-9_-]+$/i.test(dataset)
  )
    throw new Error("KNOWLEDGE_NOT_CONFIGURED");
  const url = new URL(
    `https://${project}.api.sanity.io/v2025-02-19/data/query/${dataset}`,
  );
  url.searchParams.set("query", query);
  url.searchParams.set("perspective", "published");
  if (ids) url.searchParams.set("$ids", JSON.stringify(ids));
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.any([
      AbortSignal.timeout(6000),
      ...(signal ? [signal] : []),
    ]),
  });
  if (!response.ok) throw new Error("KNOWLEDGE_UNAVAILABLE");
  const data = (await readBoundedJson(response, 4_000_000)) as {
    result?: RecordData[];
  };
  if (!Array.isArray(data.result)) throw new Error("KNOWLEDGE_UNAVAILABLE");
  return data.result;
}
export async function retrieveCurrentKnowledge(
  input: SiteAssistantRequest,
  signal?: AbortSignal,
) {
  // No persistent index or CDN cache: published edits and removals are read per request.
  const records = await querySanity(
    `*[${published}] | order(_updatedAt desc){_id,_type,title,"slug":slug.current,overview,_updatedAt,publishedAt}`,
    signal,
  );
  const latest = input.messages.at(-1)!.content;
  const question =
    latest +
    " " +
    input.messages
      .filter((m) => m.role === "user")
      .slice(-3, -1)
      .map((m) => m.content)
      .join(" ");
  const ranked = records
    .map((record) => ({ record, doc: publicDocument(record) }))
    .filter(
      (item): item is { record: RecordData; doc: KnowledgeDocument } =>
        !!item.doc,
    )
    .map((item) => ({
      ...item,
      score:
        relevance(item.doc, question) +
        (/\b(latest|recent|new|updated)\b/i.test(latest) ? 1 : 0) +
        (input.currentPage?.url === item.doc.url ? 5 : 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  const detailed = ranked.length
    ? await querySanity(
        `*[${published} && _id in $ids]{_id,_type,title,"slug":slug.current,overview,_updatedAt,publishedAt,"text":pt::text(coalesce(content,body,[])),"prompt":pt::text(promptContent)}`,
        signal,
        ranked.map((item) => item.record._id),
      )
    : [];
  const articles = detailed
    .map(publicDocument)
    .filter((doc): doc is KnowledgeDocument => !!doc)
    .map((doc) => ({
      ...doc,
      content: relevantExcerpt(doc.content, question),
    }));
  const local = currentSiteDocuments();
  const matchingTools = local
    .slice(2)
    .map((doc) => ({ doc, score: relevance(doc, question) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.doc);
  return [local[0], local[1], ...matchingTools, ...articles];
}
