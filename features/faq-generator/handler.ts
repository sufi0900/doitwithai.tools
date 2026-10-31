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
  prepareSource,
  validateOutput,
  faqPrompt,
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
    raw = await readBoundedJson(request, 260_000);
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
      "Provide a topic and 150–60,000 source characters. Choose 3, 5, or 8 FAQs and no more custom questions than that count.",
      422,
      "VALIDATION_ERROR",
    );
  const model = getGeminiModel("FAQ");
  if (!isAiConfigured(model))
    return error(
      "Neither Gemini nor Groq is configured. You can still review source coverage and edit an existing result.",
      503,
      "AI_NOT_CONFIGURED",
    );
  let limit;
  try {
    limit = await checkAiToolRateLimit(request, "faq-generator", {
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
      "The AI FAQ allowance is reached. Wait before generating again. Up to 15 FAQ generations are available per day.",
      429,
      "RATE_LIMITED",
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  let completed = false;
  try {
    if (request.signal.aborted)
      return error(
        "The request was cancelled before FAQ generation started.",
        499,
        "REQUEST_CANCELLED",
      );
    const context = prepareSource(input.data);
    const prompt = faqPrompt(input.data, context);
    const response = await getGeminiClient().generate(
      {
        model,
        max_output_tokens: input.data.count === 8 ? 5000 : 3500,
        store: false,
        input: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
        text: {
          format: geminiTextFormat(outputSchema, "faq_generator", {
            compact: true,
          }),
        },
      },
      { timeout: 45000, maxRetries: 0 },
    );
    const result = validateOutput(response.output_parsed, input.data, context);
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
        "The FAQ response could not be validated. Your source and previous result are preserved. Try fewer FAQs.",
      failure?.status || 502,
      failure?.code || "OUTPUT_VALIDATION_FAILED",
    );
  } finally {
    if (!completed && limit.release)
      try {
        await limit.release();
      } catch {
        process.stderr.write(
          JSON.stringify({ event: "faq_generator_refund_failed" }) + "\n",
        );
      }
  }
}
