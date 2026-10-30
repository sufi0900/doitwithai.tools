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
  audiencePrompt,
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
    raw = await readBoundedJson(request, 64_000);
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
      "Import a public website or describe your idea in at least 25 characters. Keep customer notes below 4,000 characters.",
      422,
      "VALIDATION_ERROR",
    );
  const model = getGeminiModel("AUDIENCE_RESEARCH");
  if (!isAiConfigured(model))
    return error(
      "Audience planning is currently unavailable. You can still explore the example.",
      503,
      "AI_NOT_CONFIGURED",
    );
  let limit;
  try {
    limit = await checkAiToolRateLimit(request, "audience-research", {
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
      "The audience planning allowance is reached. Try later. Up to 15 plans are available per day.",
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
    const prompt = audiencePrompt(input.data);
    const response = await getGeminiClient().generate(
      {
        model,
        max_output_tokens: 8000,
        store: false,
        input: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
        text: {
          format: geminiTextFormat(outputSchema, "audience_research", {
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
    if (!failure)
      process.stderr.write(
        JSON.stringify({
          event: "audience_output_validation_failed",
          reason: cause instanceof Error ? cause.name : "Unknown",
          fields:
            typeof cause === "object" && cause && "issues" in cause
              ? (cause as { issues: { path: unknown[] }[] }).issues
                  .slice(0, 8)
                  .map((i) => i.path.join("."))
              : [],
        }) + "\n",
      );
    return error(
      failure?.message ||
        "The audience plan was incomplete. Your website context and previous results are preserved. Try again or use a more specific public page.",
      failure?.status || 502,
      failure?.code || "OUTPUT_VALIDATION_FAILED",
    );
  } finally {
    if (!completed && limit.release)
      try {
        await limit.release();
      } catch {
        process.stderr.write(
          JSON.stringify({ event: "audience_research_refund_failed" }) + "\n",
        );
      }
  }
}
