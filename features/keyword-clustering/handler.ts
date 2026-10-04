import { NextResponse, type NextRequest } from "next/server";
import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIClient } from "@/lib/ai-tools/openai";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import {
  clusterInputSchema,
  clusterOutputSchema,
  validateClusterOutput,
  clusterPrompt,
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
    body = await readBoundedJson(request, 50_000);
  } catch (e) {
    return error(
      e instanceof BodyError ? e.message : "Cannot read the request.",
      e instanceof BodyError ? e.status : 400,
      "INVALID_BODY",
    );
  }
  const input = clusterInputSchema.safeParse(body);
  if (!input.success)
    return error(
      "Provide 2–80 unique keywords and review the optional fields.",
      422,
      "VALIDATION_ERROR",
    );
  const model = process.env.OPENAI_KEYWORD_CLUSTERING_MODEL;
  if (!process.env.OPENAI_API_KEY || !model)
    return error(
      "The generator has not been connected to its AI provider yet.",
      503,
      "AI_NOT_CONFIGURED",
    );
  let limit;
  try {
    limit = await checkAiToolRateLimit(request, "keyword-clustering");
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
    const prompt = clusterPrompt(input.data);
    const response = await getOpenAIClient().responses.parse(
      {
        model,
        max_output_tokens: 5000,
        store: false,
        input: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
        text: {
          format: zodTextFormat(clusterOutputSchema, "keyword_clusters"),
        },
      },
      // Leave time for validation and an error response before Vercel terminates the function.
      { timeout: 45_000, maxRetries: 0 },
    );
    const result = validateClusterOutput(
      response.output_parsed,
      input.data.keywords,
    );
    return NextResponse.json(
      { result, meta: { remaining: limit.remaining } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return error(
      "We could not generate valid options. Please try again later.",
      502,
      "GENERATION_FAILED",
    );
  }
}
