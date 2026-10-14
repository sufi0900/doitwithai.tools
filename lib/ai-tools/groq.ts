import type { GenerationParams } from "./gemini";
import { readBoundedJson } from "./request-body";

export function getGroqModel(image = false) {
  return image
    ? process.env.GROQ_VISION_MODEL?.trim() || "qwen/qwen3.8-27b"
    : process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b";
}
export function isGroqConfigured(image = false) {
  return Boolean(
    process.env.GROQ_API_KEY?.trim() &&
    /^[a-zA-Z0-9][a-zA-Z0-9._/-]{1,119}$/.test(getGroqModel(image)),
  );
}
export class GroqError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}
export async function generateGroq<T>(
  params: GenerationParams<T>,
  timeout: number,
  image: boolean,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1, timeout));
  try {
    const messages = params.input.map((item) => ({
      role: item.role,
      content:
        typeof item.content === "string"
          ? item.content
          : item.content.map((part) =>
              part.type === "input_text"
                ? { type: "text", text: part.text }
                : { type: "image_url", image_url: { url: part.image_url } },
            ),
    }));
    messages.unshift({
      role: "system",
      content: `Return only a complete JSON object matching this contract. Do not include markdown or reasoning. ${JSON.stringify(params.text.format.schema)}`,
    });
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY!.trim()}`,
        },
        signal: controller.signal,
        cache: "no-store",
        body: JSON.stringify({
          model: getGroqModel(image),
          ...(getGroqModel(image).startsWith("openai/gpt-oss-")
            ? { reasoning_effort: "low" }
            : getGroqModel(image) === "qwen/qwen3.8-27b"
              ? { reasoning_effort: "none" }
              : {}),
          messages,
          response_format: { type: "json_object" },
          max_completion_tokens: params.max_output_tokens,
          stream: false,
        }),
      },
    );
    if (!response.ok) {
      await response.body?.cancel();
      if (response.status === 429)
        throw new GroqError(429, "PROVIDER_RATE_LIMITED");
      if (response.status === 401 || response.status === 403)
        throw new GroqError(503, "PROVIDER_AUTH_FAILED");
      if (response.status === 404)
        throw new GroqError(503, "PROVIDER_MODEL_UNAVAILABLE");
      throw new GroqError(502, "PROVIDER_FAILED");
    }
    const data = (await readBoundedJson(response, 500_000)) as {
      choices?: {
        finish_reason?: string;
        message?: { content?: string; refusal?: unknown };
      }[];
    };
    const choice = data.choices?.[0];
    if (choice?.message?.refusal || choice?.finish_reason === "content_filter")
      throw new GroqError(422, "OUTPUT_BLOCKED");
    if (choice?.finish_reason === "length")
      throw new GroqError(502, "OUTPUT_LIMIT_REACHED");
    if (choice?.finish_reason !== "stop")
      throw new GroqError(502, "INCOMPLETE_OUTPUT");
    try {
      return {
        output_parsed: params.text.format.parse(
          JSON.parse(choice.message?.content || ""),
        ),
      };
    } catch {
      throw new GroqError(502, "MODEL_OUTPUT_INVALID");
    }
  } catch (cause) {
    if (cause instanceof GroqError) throw cause;
    throw new GroqError(
      controller.signal.aborted ? 504 : 502,
      controller.signal.aborted
        ? "PROVIDER_TIMEOUT"
        : "PROVIDER_CONNECTION_FAILED",
    );
  } finally {
    clearTimeout(timer);
  }
}
