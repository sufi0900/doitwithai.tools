import { SITE_ASSISTANT_BASE_URL } from "../config";
import { crawlKnowledgeUrl } from "./knowledge";
import {
  getSiteAssistantVectorStoreId,
  syncSingleKnowledgeDocument,
} from "./vector-store";

const TYPE_PREFIX: Record<string, string> = {
  seo: "ai-seo",
  aitool: "ai-tools",
  coding: "ai-code",
  makemoney: "ai-learn-earn",
  guide: "guides",
  blogPost: "blogs",
  news: "ai-news",
};

export function knowledgeUrlForSanityDocument(
  type: string,
  slug?: string,
  baseUrl = process.env.SITE_ASSISTANT_BASE_URL || SITE_ASSISTANT_BASE_URL,
) {
  if (type === "freeResources" || type === "freeairesources") {
    return new URL("/free-ai-resources", baseUrl).toString();
  }
  const prefix = TYPE_PREFIX[type];
  if (!prefix || !slug) return "";
  return new URL(`/${prefix}/${slug}`, baseUrl).toString();
}

export async function syncPublishedSanityDocument(input: {
  type: string;
  slug?: string;
}) {
  if (!process.env.OPENAI_API_KEY || !getSiteAssistantVectorStoreId()) {
    return { skipped: true as const, reason: "assistant-not-configured" };
  }
  const url = knowledgeUrlForSanityDocument(input.type, input.slug);
  if (!url) return { skipped: true as const, reason: "unsupported-document" };
  const document = await crawlKnowledgeUrl(url);
  return syncSingleKnowledgeDocument(document);
}
