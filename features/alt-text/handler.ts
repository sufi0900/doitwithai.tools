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
  altInputSchema,
  altOutputSchema,
  altPrompt,
  validateAltOutput,
} from "./schema";
import { validateImageData } from "./image.server";
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
    body = await readBoundedJson(request, 2_050_000);
  } catch (e) {
    return error(
      e instanceof BodyError && e.status === 413
        ? "The image request is too large. Use a smaller image."
        : "Send a valid JSON request.",
      e instanceof BodyError ? e.status : 400,
      "INVALID_BODY",
    );
  }
  const input = altInputSchema.safeParse(body);
  if (!input.success)
    return error(
      input.error.issues[0]?.message || "Review the image brief.",
      422,
      "VALIDATION_ERROR",
    );
  if (input.data.purpose === "decorative")
    return error(
      'Purely decorative images can use alt="". No AI request is needed.',
      422,
      "DECORATIVE_IMAGE",
    );
  try {
    validateImageData(input.data.image);
  } catch {
    return error(
      "Use a valid PNG, JPEG, or WebP image under 1.5 MB after preparation.",
      422,
      "INVALID_IMAGE",
    );
  }
  // Image requests may use a separately verified vision model. Text examples
  // retain their existing model; never discard an image to bypass a failure.
  const model = input.data.image
    ? process.env.GEMINI_ALT_TEXT_VISION_MODEL?.trim() ||
      getGeminiModel("ALT_TEXT")
    : getGeminiModel("ALT_TEXT");
  if (!isGeminiConfigured(model))
    return error(
      "The generator has not been connected to its AI provider yet.",
      503,
      "AI_NOT_CONFIGURED",
    );
  let limit;
  try {
    limit = await checkAiToolRateLimit(request, "alt-text");
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
    const prompt = altPrompt(input.data);
    const response = await getGeminiClient().generate(
      {
        model,
        max_output_tokens: 2400,
        store: false,
        input: [
          { role: "system", content: prompt.system },
          {
            role: "user",
            content: [
              { type: "input_text", text: prompt.user },
              ...(input.data.image
                ? [
                    {
                      type: "input_image" as const,
                      image_url: input.data.image,
                      detail: "auto" as const,
                    },
                  ]
                : []),
            ],
          },
        ],
        text: { format: geminiTextFormat(altOutputSchema, "image_alt_text") },
      },
      { timeout: 45_000, maxRetries: 0 },
    );
    const result = validateAltOutput(
      response.output_parsed,
      input.data.purpose,
    );
    return NextResponse.json(
      {
        result,
        meta: {
          remaining: limit.remaining,
          source: input.data.image ? "uploaded-image" : "written-description",
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (cause) {
    const failure = geminiFailure(cause);
    if (failure) return error(failure.message, failure.status, failure.code);
    return error(
      "We could not generate valid alternatives. Please try again later.",
      502,
      "GENERATION_FAILED",
    );
  }
}
