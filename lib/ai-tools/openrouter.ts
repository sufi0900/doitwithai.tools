import type { GenerationParams } from "./gemini";
import { readBoundedJson, extractJsonText } from "./request-body";

export const OPENROUTER_FREE_MODELS = [
  "openrouter/free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen-2.5-72b-instruct:free",
] as const;

export function getOpenRouterModel() {
  return process.env.OPENROUTER_MODEL?.trim() || OPENROUTER_FREE_MODELS[0];
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
  const models = Array.from(
    new Set([getOpenRouterModel(), ...OPENROUTER_FREE_MODELS]),
  );
  const deadline = Date.now() + Math.max(1, timeout);
  let lastError: OpenRouterError | null = null;

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

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      throw lastError ?? new OpenRouterError(504, "PROVIDER_TIMEOUT");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), remaining);

    try {
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
            model,
            messages,
            response_format: { type: "json_object" },
            max_tokens: params.max_output_tokens,
            stream: false,
          }),
        },
      );

      if (!response.ok) {
        const err =
          response.status === 429
            ? new OpenRouterError(429, "PROVIDER_RATE_LIMITED")
            : response.status === 401 || response.status === 403
              ? new OpenRouterError(503, "PROVIDER_AUTH_FAILED")
              : new OpenRouterError(
                  response.status === 404 ? 503 : 502,
                  response.status === 404
                    ? "PROVIDER_MODEL_UNAVAILABLE"
                    : "PROVIDER_FAILED",
                );
        if (response.status === 401 || response.status === 403) {
          throw err;
        }
        lastError = err;
        continue;
      }

      const data = (await readBoundedJson(response, 500_000)) as {
        choices?: {
          finish_reason?: string;
          message?: { content?: string };
        }[];
      };

      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) {
        lastError = new OpenRouterError(502, "EMPTY_OUTPUT");
        continue;
      }

      const cleaned = extractJsonText(content);

      try {
        return {
          output_parsed: params.text.format.parse(JSON.parse(cleaned)),
          model,
        };
      } catch {
        lastError = new OpenRouterError(502, "MODEL_OUTPUT_INVALID");
        continue;
      }
    } catch (cause) {
      if (cause instanceof OpenRouterError) {
        if (cause.code === "PROVIDER_AUTH_FAILED") throw cause;
        lastError = cause;
        continue;
      }
      lastError = new OpenRouterError(
        controller.signal.aborted ? 504 : 502,
        controller.signal.aborted
          ? "PROVIDER_TIMEOUT"
          : "PROVIDER_CONNECTION_FAILED",
      );
      if (controller.signal.aborted) throw lastError;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new OpenRouterError(502, "PROVIDER_FAILED");
}
