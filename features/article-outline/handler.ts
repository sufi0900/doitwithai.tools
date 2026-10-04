import { NextResponse, type NextRequest } from "next/server";
import {
  getGeminiClient,
  getGeminiModel,
  isGeminiConfigured,
  geminiTextFormat,
  geminiFailure,
} from "@/lib/ai-tools/gemini";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import {
  outlineInputSchema,
  outlineOutputSchema,
  validateOutline,
  outlinePrompt,
} from "./schema";
const error = (
  message: string,
  status: number,
  code: string,
  headers?: HeadersInit,
) =>
  NextResponse.json(
    { error: { message, code } },
    { status, headers: { "Cache-Control": "no-store", ...headers } },
  );
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await readBoundedJson(request);
  } catch (e) {
    return error(
      e instanceof BodyError ? e.message : "Cannot read the request.",
      e instanceof BodyError ? e.status : 400,
      "INVALID_BODY",
    );
  }
  const input = outlineInputSchema.safeParse(body);
  if (!input.success)
    return error(
      "Provide a title and a context brief of 40–6000 characters. Review the optional fields.",
      422,
      "VALIDATION_ERROR",
    );
  const model = getGeminiModel("ARTICLE_OUTLINE");
  if (!isGeminiConfigured(model))
    return error(
      "The generator has not been connected to its AI provider yet.",
      503,
      "AI_NOT_CONFIGURED",
    );
  let limit;
  try {
    limit = await checkAiToolRateLimit(request, "article-outline");
  } catch {
    return error(
      "The generator is temporarily unavailable.",
      503,
      "RATE_LIMIT_UNAVAILABLE",
    );
  }
  if (!limit.allowed)
    return error(
      "You have reached the current generation limit. Please try again later.",
      429,
      "RATE_LIMITED",
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  try {
    const prompt = outlinePrompt(input.data);
    const response = await getGeminiClient().generate(
      {
        model,
        max_output_tokens: 12000,
        store: false,
        input: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
        text: {
          format: geminiTextFormat(outlineOutputSchema, "article_outline"),
        },
      },
      // Leave time for validation and an error response before Vercel terminates the function.
      { timeout: 50_000, maxRetries: 0 },
    );
    const result = validateOutline(response.output_parsed, input.data.depth);
    return NextResponse.json(
      { result, meta: { remaining: limit.remaining } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (cause) {
    const failure = geminiFailure(cause);
    if (failure) return error(failure.message, failure.status, failure.code);
    return error(
      "We could not generate valid options. Please try again later.",
      502,
      "GENERATION_FAILED",
    );
  }
}
