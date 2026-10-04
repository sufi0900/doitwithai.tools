import { z } from "zod";
import { randomUUID } from "node:crypto";
import { compactOutputSchema } from "./compact-schema";
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
export function geminiTextFormat<T extends z.ZodType>(
  schema: T,
  name: string,
  options: { compact?: boolean } = {},
) {
  const json = z.toJSONSchema(schema, { target: "draft-07" });
  delete json.$schema;
  return {
    name,
    schema: options.compact ? compactOutputSchema(json) : json,
    parse: (value: unknown): z.infer<T> => schema.parse(value),
  };
}
type Format<T> = {
  name?: string;
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
  readonly requestId = randomUUID();
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly upstreamStatus?: number,
    public readonly providerStatus?: string,
    public readonly finishReason?: string,
  ) {
    super(code);
  }
}
// Never expose arbitrary provider messages, which can contain submitted material.
async function providerStatus(response: Response) {
  const allowed = new Set([
    "INVALID_ARGUMENT",
    "FAILED_PRECONDITION",
    "PERMISSION_DENIED",
    "UNAUTHENTICATED",
    "NOT_FOUND",
    "RESOURCE_EXHAUSTED",
    "INTERNAL",
    "UNAVAILABLE",
    "DEADLINE_EXCEEDED",
    "CANCELLED",
    "UNKNOWN",
  ]);
  try {
    const body = (await readBoundedJson(response, 16_000)) as {
      error?: { status?: unknown; message?: unknown };
    };
    const status = body?.error?.status;
    const message = body?.error?.message;
    return {
      status:
        typeof status === "string" && allowed.has(status) ? status : undefined,
      // Classify locally; never retain, return or log the provider message.
      schemaRejected:
        typeof message === "string" &&
        /response_?json_?schema|response_?schema|too many states|schema.{0,100}(?:complex|unsupported|invalid)|(?:complex|unsupported|invalid).{0,100}schema/i.test(
          message,
        ),
    };
  } catch {
    return { status: undefined, schemaRejected: false };
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
    const send = (jsonMode: boolean) =>
      fetch(
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
                .flatMap((item) => parts(item.content))
                .concat(
                  jsonMode
                    ? [
                        {
                          text: `Return only valid JSON matching this output contract. All values must pass these checks: ${JSON.stringify(params.text.format.schema)}`,
                        },
                      ]
                    : [],
                ),
            },
            contents: params.input
              .filter((item) => item.role === "user")
              .map((item) => ({ role: "user", parts: parts(item.content) })),
            generationConfig: {
              responseMimeType: "application/json",
              ...(!jsonMode
                ? { responseJsonSchema: params.text.format.schema }
                : {}),
              candidateCount: 1,
              maxOutputTokens: params.max_output_tokens,
            },
          }),
        },
      );
    let response = await send(false);
    let rejection: Awaited<ReturnType<typeof providerStatus>> | undefined;
    if (response.status === 400) {
      rejection = await providerStatus(response);
      // Only these compact tool formats opt into one schema-specific retry.
      // Both calls share the original abort deadline and all local validators.
      if (
        rejection.schemaRejected &&
        params.text.format.name &&
        ["article_outline", "keyword_clusters", "topical_map"].includes(
          params.text.format.name,
        ) &&
        !controller.signal.aborted
      ) {
        process.stderr.write(
          JSON.stringify({
            event: "ai_schema_json_mode_retry",
            model: params.model,
            format: params.text.format.name,
          }) + "\n",
        );
        response = await send(true);
        rejection = undefined;
      }
    }
    if (!response.ok) {
      const upstream = response.status;
      const provider = rejection || (await providerStatus(response));
      const failure = (status: number, code: string) =>
        new GeminiError(status, code, upstream, provider.status);
      if (upstream === 400) throw failure(502, "PROVIDER_BAD_REQUEST");
      if (upstream === 429) throw failure(429, "PROVIDER_RATE_LIMITED");
      if (upstream === 401 || upstream === 403)
        throw failure(503, "PROVIDER_AUTH_FAILED");
      if (upstream === 404) throw failure(503, "PROVIDER_MODEL_UNAVAILABLE");
      if (upstream === 500) throw failure(502, "PROVIDER_INTERNAL_ERROR");
      if (upstream === 503) throw failure(503, "PROVIDER_UNAVAILABLE");
      throw failure(502, "PROVIDER_FAILED");
    }
    const payload = (await readBoundedJson(response, 500_000)) as {
      promptFeedback?: { blockReason?: string };
      candidates?: Array<{
        finishReason?: string;
        content?: { parts?: Array<{ text?: string; thought?: boolean }> };
      }>;
    };
    const candidate = payload.candidates?.[0];
    const blockedReasons = new Set([
      "SAFETY",
      "RECITATION",
      "BLOCKLIST",
      "PROHIBITED_CONTENT",
      "SPII",
      "IMAGE_SAFETY",
      "IMAGE_PROHIBITED_CONTENT",
    ]);
    if (candidate?.finishReason === "MAX_TOKENS")
      throw new GeminiError(
        502,
        "OUTPUT_LIMIT_REACHED",
        response.status,
        undefined,
        "MAX_TOKENS",
      );
    const blockReason =
      candidate?.finishReason || payload.promptFeedback?.blockReason;
    if (blockReason && blockedReasons.has(blockReason))
      throw new GeminiError(
        422,
        "OUTPUT_BLOCKED",
        response.status,
        undefined,
        blockReason,
      );
    if (candidate?.finishReason !== "STOP")
      throw new GeminiError(
        502,
        "INCOMPLETE_OUTPUT",
        response.status,
        undefined,
        "OTHER_OR_MISSING",
      );
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
        upstreamStatus: failure.upstreamStatus,
        providerStatus: failure.providerStatus,
        finishReason: failure.finishReason,
        requestId: failure.requestId,
        inputMode: params.input.some(
          (item) =>
            Array.isArray(item.content) &&
            item.content.some((part) => part.type === "input_image"),
        )
          ? "image"
          : "text",
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
      "Gemini rejected the request. The site owner needs to check the model, input format, and output schema.",
    PROVIDER_INTERNAL_ERROR:
      "Gemini returned an internal processing error. Your input is preserved. Try again later.",
    PROVIDER_UNAVAILABLE:
      "Gemini is temporarily unavailable. Your input is preserved. Please try again later.",
    MODEL_OUTPUT_INVALID:
      "The AI returned a draft that failed this tool's checks. Try a smaller or more focused request.",
    PROVIDER_TIMEOUT:
      "The AI request timed out. Your previous draft is preserved. Try a smaller request.",
    PROVIDER_CONNECTION_FAILED:
      "The AI provider could not be reached. Your previous draft is preserved. Please try again later.",
    INCOMPLETE_OUTPUT:
      "Gemini stopped before returning a complete draft. Your input is preserved. Please try again later.",
    OUTPUT_LIMIT_REACHED:
      "Gemini reached this request's output limit before finishing. Your input is preserved. Try a smaller request.",
    OUTPUT_BLOCKED:
      "Gemini blocked this request or response. Review the supplied material. Your input is preserved.",
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
    ? {
        message: `${messages[error.code]} Reference: ${error.requestId}`,
        status: error.status,
        code: error.code,
      }
    : null;
}
