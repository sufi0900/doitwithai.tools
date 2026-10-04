import { z } from "zod";
import { readBoundedJson } from "./request-body";

export function getGeminiModel(tool?: string) {
  const override = tool ? process.env[`GEMINI_${tool}_MODEL`]?.trim() : "";
  return override || process.env.GEMINI_MODEL?.trim() || "";
}
export function isGeminiConfigured(model: string) {
  return Boolean(
    typeof model === "string" &&
    process.env.GEMINI_API_KEY?.trim() &&
    /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,80}$/.test(model),
  );
}
export function geminiTextFormat<T extends z.ZodType>(schema: T, name: string) {
  const json = z.toJSONSchema(schema, { target: "draft-07" });
  delete json.$schema;
  return {
    name,
    schema: json,
    parse: (value: unknown): z.infer<T> => schema.parse(value),
  };
}
type Format<T> = {
  schema: Record<string, unknown>;
  parse: (value: unknown) => T;
};
type Part =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string; detail?: string };
type Params<T> = {
  model: string;
  max_output_tokens: number;
  store?: false;
  input: Array<{ role: "system" | "user"; content: string | Part[] }>;
  text: { format: Format<T> };
};
export class GeminiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(code);
  }
}
function parts(content: string | Part[]) {
  if (typeof content === "string") return [{ text: content }];
  return content.map((part) => {
    if (part.type === "input_text") return { text: part.text };
    const match =
      /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+=*)$/.exec(
        part.image_url,
      );
    if (!match) throw new GeminiError(422, "INVALID_IMAGE");
    return { inlineData: { mimeType: match[1], data: match[2] } };
  });
}
async function generate<T>(
  params: Params<T>,
  options: { timeout?: number; maxRetries?: 0 } = {},
) {
  if (!isGeminiConfigured(params.model))
    throw new GeminiError(503, "AI_NOT_CONFIGURED");
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    Math.min(options.timeout ?? 45_000, 50_000),
  );
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY!.trim(),
        },
        cache: "no-store",
        signal: controller.signal,
        body: JSON.stringify({
          store: false,
          systemInstruction: {
            parts: params.input
              .filter((item) => item.role === "system")
              .flatMap((item) => parts(item.content)),
          },
          contents: params.input
            .filter((item) => item.role === "user")
            .map((item) => ({ role: "user", parts: parts(item.content) })),
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: params.text.format.schema,
            candidateCount: 1,
            maxOutputTokens: params.max_output_tokens,
          },
        }),
      },
    );
    if (!response.ok) {
      if (response.status === 400)
        throw new GeminiError(502, "PROVIDER_BAD_REQUEST");
      if (response.status === 429)
        throw new GeminiError(429, "PROVIDER_RATE_LIMITED");
      if (response.status === 401 || response.status === 403)
        throw new GeminiError(503, "PROVIDER_AUTH_FAILED");
      if (response.status === 404)
        throw new GeminiError(503, "PROVIDER_MODEL_UNAVAILABLE");
      throw new GeminiError(502, "PROVIDER_FAILED");
    }
    const payload = (await readBoundedJson(response, 500_000)) as {
      candidates?: Array<{
        finishReason?: string;
        content?: { parts?: Array<{ text?: string; thought?: boolean }> };
      }>;
    };
    const candidate = payload.candidates?.[0];
    if (candidate?.finishReason !== "STOP")
      throw new GeminiError(502, "INCOMPLETE_OUTPUT");
    const text = candidate.content?.parts
      ?.filter((part) => !part.thought)
      .map((part) => part.text || "")
      .join("");
    if (!text) throw new GeminiError(502, "EMPTY_OUTPUT");
    try {
      return { output_parsed: params.text.format.parse(JSON.parse(text)) };
    } catch {
      throw new GeminiError(502, "MODEL_OUTPUT_INVALID");
    }
  } catch (cause) {
    const failure =
      cause instanceof GeminiError
        ? cause
        : new GeminiError(
            controller.signal.aborted ? 504 : 502,
            controller.signal.aborted
              ? "PROVIDER_TIMEOUT"
              : "PROVIDER_CONNECTION_FAILED",
          );
    // Record only safe failure categories, never keys, prompts, or generated content.
    process.stderr.write(
      JSON.stringify({
        event: "ai_provider_failure",
        code: failure.code,
        status: failure.status,
        model: params.model,
      }) + "\n",
    );
    throw failure;
  } finally {
    clearTimeout(timer);
  }
}
// One stateless client allows handler tests to replace generation without exposing credentials.
const client = { generate };
export function getGeminiClient() {
  return client;
}
export function geminiFailure(error: unknown) {
  if (!(error instanceof GeminiError)) return null;
  const messages: Record<string, string> = {
    PROVIDER_BAD_REQUEST:
      "Gemini rejected this tool's generation settings. The site owner needs to review the model and output schema.",
    MODEL_OUTPUT_INVALID:
      "The AI returned a draft that failed this tool's checks. Try a smaller or more focused request.",
    PROVIDER_TIMEOUT:
      "The AI request timed out. Your previous draft is preserved. Try a smaller request.",
    PROVIDER_CONNECTION_FAILED:
      "The AI provider could not be reached. Your previous draft is preserved. Please try again later.",
    INCOMPLETE_OUTPUT:
      "The AI response was incomplete or blocked. Try a smaller request or review the supplied material.",
    EMPTY_OUTPUT:
      "The AI returned no draft. Please try a more focused request.",
    PROVIDER_FAILED:
      "The AI provider could not complete the request. Please try again later.",
    PROVIDER_RATE_LIMITED:
      "Gemini's current quota is exhausted. Try again later or review your Google AI Studio limits.",
    PROVIDER_AUTH_FAILED:
      "Gemini rejected the API credentials. The site owner needs to check the key and project access.",
    PROVIDER_MODEL_UNAVAILABLE:
      "The selected Gemini model is unavailable. The site owner needs to check GEMINI_MODEL.",
    AI_NOT_CONFIGURED: "The generator has not been connected to Gemini yet.",
  };
  return messages[error.code]
    ? { message: messages[error.code], status: error.status, code: error.code }
    : null;
}
