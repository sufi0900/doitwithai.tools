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
  researchPrompt,
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
      "Add 1–10 seeds or website context, plus a country and language. Keep each seed below 120 characters.",
      422,
      "VALIDATION_ERROR",
    );
  const model = getGeminiModel("KEYWORD_RESEARCH");
  if (!isAiConfigured(model))
    return error(
      "Keyword discovery is temporarily unavailable. Imported lists and the example remain available.",
      503,
      "AI_NOT_CONFIGURED",
    );
  let limit;
  try {
    limit = await checkAiToolRateLimit(request, "keyword-research", {
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
      "The discovery allowance is reached. Try later. Your existing keyword list remains available.",
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
    const prompt = researchPrompt(input.data);
    const response = await getGeminiClient().generate(
      {
        model,
        max_output_tokens: 6500,
        store: false,
        input: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
        text: {
          format: geminiTextFormat(outputSchema, "keyword_research", {
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
          event: "keyword_research_output_validation_failed",
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
        "The keyword suggestions were incomplete. Your inputs and earlier results are preserved. Try a more specific seed.",
      failure?.status || 502,
      failure?.code || "OUTPUT_VALIDATION_FAILED",
    );
  } finally {
    if (!completed && limit.release)
      try {
        await limit.release();
      } catch {
        process.stderr.write(
          JSON.stringify({ event: "keyword_research_research_refund_failed" }) +
            "\n",
        );
      }
  }
}
