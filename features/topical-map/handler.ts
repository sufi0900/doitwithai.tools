import { NextResponse, type NextRequest } from "next/server";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import {
  getGeminiClient,
  getGeminiModel,
  isGeminiConfigured,
  geminiFailure,
  geminiTextFormat,
} from "@/lib/ai-tools/gemini";
import { inputSchema, outputSchema, prompt, validateOutput } from "./schema";
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
    body = await readBoundedJson(request, 20_000);
  } catch (e) {
    return error(
      e instanceof BodyError ? e.message : "Cannot read the brief.",
      e instanceof BodyError ? e.status : 400,
      "INVALID_BODY",
    );
  }
  const input = inputSchema.safeParse(body);
  if (!input.success)
    return error(
      "Provide a seed topic or a fuller project brief, and check the field limits.",
      422,
      "VALIDATION_ERROR",
    );
  const model = getGeminiModel("TOPICAL_MAP");
  if (!isGeminiConfigured(model))
    return error(
      "The map generator has not been connected to Gemini yet.",
      503,
      "AI_NOT_CONFIGURED",
    );
  let limit;
  try {
    limit = await checkAiToolRateLimit(request, "topical-map");
  } catch {
    return error(
      "The generator is temporarily unavailable.",
      503,
      "RATE_LIMIT_UNAVAILABLE",
    );
  }
  if (!limit.allowed)
    return error(
      "You have reached the current generation limit. Try again later.",
      429,
      "RATE_LIMITED",
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  try {
    const p = prompt(input.data);
    const response = await getGeminiClient().generate(
      {
        model,
        max_output_tokens: 7000,
        store: false,
        input: [
          { role: "system", content: p.system },
          { role: "user", content: p.user },
        ],
        text: {
          format: geminiTextFormat(outputSchema, "topical_map"),
        },
      },
      { timeout: 45_000, maxRetries: 0 },
    );
    const result = validateOutput(response.output_parsed, input.data);
    return NextResponse.json(
      {
        result,
        meta: {
          provider: "Gemini",
          metrics: "not-verified",
          remaining: limit.remaining,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (cause) {
    const failure = geminiFailure(cause);
    if (failure) return error(failure.message, failure.status, failure.code);
    return error(
      "We could not create a valid map. Try a more focused brief or try again later.",
      502,
      "GENERATION_FAILED",
    );
  }
}
