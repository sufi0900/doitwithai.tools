import { NextResponse, type NextRequest } from "next/server";
import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIClient } from "@/lib/ai-tools/openai";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import {
  writingInputSchema,
  writingOutputSchema,
  validateWritingOutput,
  writingPrompt,
  type WritingKind,
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
export function writingHandler(kind: WritingKind) {
  return async function POST(request: NextRequest) {
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
    const input = writingInputSchema.safeParse(body);
    if (!input.success)
      return error(
        "Provide a page brief of 40–5000 characters and review the optional fields.",
        422,
        "VALIDATION_ERROR",
      );
    const model =
      kind === "meta-description"
        ? process.env.OPENAI_META_DESCRIPTION_MODEL
        : process.env.OPENAI_H1_HEADING_MODEL;
    if (!process.env.OPENAI_API_KEY || !model)
      return error(
        "The generator has not been connected to its AI provider yet.",
        503,
        "AI_NOT_CONFIGURED",
      );
    let limit;
    try {
      limit = await checkAiToolRateLimit(request, kind);
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
      const prompt = writingPrompt(kind, input.data);
      const response = await getOpenAIClient().responses.parse(
        {
          model,
          max_output_tokens: 2500,
          store: false,
          input: [
            { role: "system", content: prompt.system },
            { role: "user", content: prompt.user },
          ],
          text: { format: zodTextFormat(writingOutputSchema, "website_copy") },
        },
        { timeout: 30_000, maxRetries: 0 },
      );
      const result = validateWritingOutput(response.output_parsed, kind);
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
  };
}
