import { NextResponse, type NextRequest } from "next/server";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { inputSchema, providerSchema, prompt, validateOutput } from "./schema";
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
  const key = process.env.GEMINI_API_KEY,
    model = process.env.GEMINI_TOPICAL_MAP_MODEL;
  if (!key || !model || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{1,80}$/.test(model))
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
  const controller = new AbortController(),
    timer = setTimeout(() => controller.abort(), 45_000);
  try {
    const p = prompt(input.data);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        cache: "no-store",
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: p.system }] },
          contents: [{ role: "user", parts: [{ text: p.user }] }],
          store: false,
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: providerSchema,
            candidateCount: 1,
            maxOutputTokens: 7000,
          },
        }),
      },
    );
    if (!response.ok) throw Error("Provider failed");
    const payload = (await readBoundedJson(response, 180_000)) as {
      candidates?: Array<{
        finishReason?: string;
        content?: { parts?: Array<{ text?: string; thought?: boolean }> };
      }>;
    };
    const candidate = payload.candidates?.[0];
    if (candidate?.finishReason !== "STOP") throw Error("Incomplete output");
    const text = candidate.content?.parts
      ?.filter((p) => !p.thought)
      .map((p) => p.text || "")
      .join("");
    if (!text) throw Error("Missing output");
    const result = validateOutput(JSON.parse(text), input.data);
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
  } catch {
    return error(
      "We could not create a valid map. Try a more focused brief or try again later.",
      502,
      "GENERATION_FAILED",
    );
  } finally {
    clearTimeout(timer);
  }
}
