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
  briefPrompt,
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
    raw = await readBoundedJson(request, 32_000);
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
      "Provide a topic, audience, goal, intent, up to 6,000 note characters, and at most eight HTTP links.",
      422,
      "VALIDATION_ERROR",
    );
  const model = getGeminiModel("CONTENT_BRIEF");
  if (!isAiConfigured(model))
    return error(
      "Neither Gemini nor Groq is configured. The no-API template remains available.",
      503,
      "AI_NOT_CONFIGURED",
    );
  let limit;
  try {
    limit = await checkAiToolRateLimit(request, "content-brief", {
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
      "The AI brief allowance is reached. Use the template or try later. Up to 15 AI briefs are available per day.",
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
    const prompt = briefPrompt(input.data);
    const response = await getGeminiClient().generate(
      {
        model,
        max_output_tokens: 4200,
        store: false,
        input: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
        text: {
          format: geminiTextFormat(outputSchema, "content_brief", {
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
        "The AI brief failed structure or link checks. Your inputs are preserved. Try the no-API template.",
      failure?.status || 502,
      failure?.code || "OUTPUT_VALIDATION_FAILED",
    );
  } finally {
    if (!completed && limit.release)
      try {
        await limit.release();
      } catch {
        process.stderr.write(
          JSON.stringify({ event: "content_brief_refund_failed" }) + "\n",
        );
      }
  }
}
