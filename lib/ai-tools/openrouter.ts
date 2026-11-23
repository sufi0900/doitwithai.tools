import type { GenerationParams } from "./gemini";
import { readBoundedJson } from "./request-body";

export function getOpenRouterModel() {
  return (
    process.env.OPENROUTER_MODEL?.trim() ||
    "meta-llama/llama-3.3-70b-instruct:free"
  );
}

export function isOpenRouterConfigured() {
  return Boolean(
    process.env.OPENROUTER_API_KEY?.trim() &&
      /^[a-zA-Z0-9][a-zA-Z0-9._/:-]{1,119}$/.test(getOpenRouterModel()),
  );
}

export class OpenRouterError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}

export async function generateOpenRouter<T>(
  params: GenerationParams<T>,
  timeout: number,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1, timeout));

  try {
    const messages = params.input.map((item) => ({
      role: item.role,
      content:
        typeof item.content === "string"
          ? item.content
          : item.content
              .filter((p) => p.type === "input_text")
              .map((p) => (p as { type: "input_text"; text: string }).text)
              .join("\n"),
    }));

    messages.unshift({
      role: "system",
      content: `Return only a complete JSON object matching this contract. Do not include markdown formatting or commentary. Contract: ${JSON.stringify(
        params.text.format.schema,
      )}`,
    });

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY!.trim()}`,
          "HTTP-Referer": "https://doitwithai.tools",
          "X-Title": "DoItWithAI Tools",
        },
        signal: controller.signal,
        cache: "no-store",
        body: JSON.stringify({
          model: getOpenRouterModel(),
          messages,
          response_format: { type: "json_object" },
          max_tokens: params.max_output_tokens,
          stream: false,
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new OpenRouterError(429, "PROVIDER_RATE_LIMITED");
      }
      if (response.status === 401 || response.status === 403) {
        throw new OpenRouterError(503, "PROVIDER_AUTH_FAILED");
      }
      throw new OpenRouterError(502, "PROVIDER_FAILED");
    }

    const data = (await readBoundedJson(response, 500_000)) as {
      choices?: {
        finish_reason?: string;
        message?: { content?: string };
      }[];
    };

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new OpenRouterError(502, "EMPTY_OUTPUT");

    // Strip markdown code fences if model returned ```json ... ```
    const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    try {
      return {
        output_parsed: params.text.format.parse(JSON.parse(cleaned)),
      };
    } catch {
      throw new OpenRouterError(502, "MODEL_OUTPUT_INVALID");
    }
  } catch (cause) {
    if (cause instanceof OpenRouterError) throw cause;
    throw new OpenRouterError(
      controller.signal.aborted ? 504 : 502,
      controller.signal.aborted
        ? "PROVIDER_TIMEOUT"
        : "PROVIDER_CONNECTION_FAILED",
    );
  } finally {
    clearTimeout(timer);
  }
}
