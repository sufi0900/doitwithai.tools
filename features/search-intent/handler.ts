import { NextResponse, type NextRequest } from "next/server";
import { readBoundedJson, BodyError } from "@/lib/ai-tools/request-body";
import {
  checkAiToolRateLimit,
  rateLimitFailure,
} from "@/lib/ai-tools/rate-limit";
import {
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
  geminiFailure,
  geminiTextFormat,
} from "@/lib/ai-tools/gemini";
import {
  inputSchema,
  outputSchema,
  validateOutput,
  intentPrompt,
} from "./schema";
const error = (
  message: string,
  status: number,
  code: string,
  headers: HeadersInit = {},
) =>
  NextResponse.json(
    { error: { message, code } },
    { status, headers: { "Cache-Control": "no-store", ...headers } },
  );
export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await readBoundedJson(request, 24_000);
  } catch (cause) {
    return error(
      cause instanceof BodyError ? cause.message : "Cannot read the request.",
      cause instanceof BodyError ? cause.status : 400,
      "INVALID_BODY",
    );
  }
  const input = inputSchema.safeParse(raw);
  if (!input.success)
    return error(
      "Use 1–10 distinct keywords, up to 120 characters each. Search-result notes require one keyword and at most 4,000 characters.",
      422,
      "VALIDATION_ERROR",
    );
  const model = getGeminiModel("SEARCH_INTENT");
  if (!isAiConfigured(model))
    return error(
      "Neither Gemini nor Groq is configured. The no-API quick check remains available.",
      503,
      "AI_NOT_CONFIGURED",
    );
  let limit;
  try {
    limit = await checkAiToolRateLimit(request, "search-intent", {
      dailyLimit: 15,
      burstLimit: 5,
      refundFailures: true,
    });
  } catch (cause) {
    return error(
      rateLimitFailure(cause).message,
      503,
      "RATE_LIMIT_UNAVAILABLE",
    );
  }
  if (!limit.allowed)
    return error(
      "The AI review allowance is reached. Use the quick check or try later. Up to 15 AI reviews are available per day.",
      429,
      "RATE_LIMITED",
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  let completed = false;
  try {
    if (request.signal.aborted)
      return error(
        "The request was cancelled before AI review started.",
        499,
        "REQUEST_CANCELLED",
      );
    const prompt = intentPrompt(input.data);
    const response = await getGeminiClient().generate(
      {
        model,
        max_output_tokens: Math.min(
          6000,
          1300 + input.data.keywords.length * 500,
        ),
        store: false,
        input: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
        text: {
          format: geminiTextFormat(outputSchema, "search_intent", {
            compact: true,
          }),
        },
      },
      { timeout: 45000, maxRetries: 0 },
    );
    const result = validateOutput(response.output_parsed, input.data);
    completed = true;
    return NextResponse.json(
      {
        result,
        meta: {
          provider: response.provider,
          model: response.model || model,
          remaining: limit.remaining,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (cause) {
    const failure = geminiFailure(cause);
    return error(
      failure?.message ||
        "The AI interpretation failed coverage or evidence checks. Your inputs are preserved. Try the no-API quick check.",
      failure?.status || 502,
      failure?.code || "OUTPUT_VALIDATION_FAILED",
    );
  } finally {
    if (!completed && limit.release)
      try {
        await limit.release();
      } catch {
        process.stderr.write(
          JSON.stringify({ event: "search_intent_refund_failed" }) + "\n",
        );
      }
  }
}
