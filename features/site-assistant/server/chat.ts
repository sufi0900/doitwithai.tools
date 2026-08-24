import { getOpenAIClient, getSiteAssistantModel } from "@/lib/ai-tools/openai";
import {
  buildCurrentPageContext,
  SITE_ASSISTANT_SYSTEM_PROMPT,
} from "../prompt";
import type {
  SiteAssistantRequest,
  SiteAssistantResponse,
  SiteAssistantSource,
} from "../types";
import { getSiteAssistantVectorStoreId } from "./vector-store";

type SearchResult = {
  file_id?: string;
  filename?: string;
  score?: number;
  text?: string;
  attributes?: Record<string, string | number | boolean> | null;
};

type OutputItem = {
  type: string;
  results?: SearchResult[] | null;
  content?: Array<{
    type: string;
    annotations?: Array<{ type: string; file_id?: string }>;
  }>;
};

function cleanAnswer(value: string) {
  return value
    .replace(/【[^】]*】/g, "")
    .replace(/〖[^〗]*〗/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function safeSourceUrl(value: unknown) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    if (
      url.hostname !== "doitwithai.tools" &&
      url.hostname !== "www.doitwithai.tools"
    ) {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
}

export function collectSiteAssistantSources(response: {
  output?: OutputItem[];
}) {
  const items = response.output || [];
  const citedIds = new Set<string>();
  const results: SearchResult[] = [];

  for (const item of items) {
    if (item.type === "file_search_call") {
      results.push(...(item.results || []));
    }
    if (item.type === "message") {
      for (const content of item.content || []) {
        for (const annotation of content.annotations || []) {
          if (annotation.type === "file_citation" && annotation.file_id) {
            citedIds.add(annotation.file_id);
          }
        }
      }
    }
  }

  const preferred = citedIds.size
    ? results.filter((result) => result.file_id && citedIds.has(result.file_id))
    : results.filter((result) => (result.score || 0) >= 0.15);
  const sources: SiteAssistantSource[] = [];

  for (const result of preferred) {
    const attributes = result.attributes || {};
    const textUrl = result.text?.match(/^URL:\s*(https?:\/\/\S+)/m)?.[1];
    const url = safeSourceUrl(attributes.url || textUrl);
    if (!url || sources.some((source) => source.url === url)) continue;
    sources.push({
      title:
        typeof attributes.title === "string"
          ? attributes.title
          : result.filename?.replace(/-[a-f0-9]{8}\.md$/, "") ||
            "Do It With AI Tools",
      url,
      kind: typeof attributes.kind === "string" ? attributes.kind : "site-page",
    });
    if (sources.length === 4) break;
  }
  return sources;
}

export async function answerSiteAssistant(
  input: SiteAssistantRequest,
  signal?: AbortSignal,
): Promise<SiteAssistantResponse> {
  const vectorStoreId = getSiteAssistantVectorStoreId();
  if (!vectorStoreId) {
    throw new Error("SITE_ASSISTANT_NOT_CONFIGURED");
  }

  const response = await getOpenAIClient().responses.create(
    {
      model: getSiteAssistantModel(),
      instructions:
        SITE_ASSISTANT_SYSTEM_PROMPT +
        buildCurrentPageContext(input.currentPage),
      input: input.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      tools: [
        {
          type: "file_search",
          vector_store_ids: [vectorStoreId],
          max_num_results: 6,
          ranking_options: {
            ranker: "auto",
            score_threshold: 0.15,
          },
        },
      ],
      tool_choice: "required",
      include: ["file_search_call.results"],
      reasoning: { effort: "low" },
      max_output_tokens: 700,
      truncation: "auto",
      store: false,
    },
    { signal },
  );

  const answer = cleanAnswer(response.output_text || "");
  if (!answer) throw new Error("SITE_ASSISTANT_EMPTY_RESPONSE");

  return {
    answer,
    sources: collectSiteAssistantSources(
      response as unknown as { output?: OutputItem[] },
    ),
    requestId: response.id,
  };
}
