import { NextResponse, type NextRequest } from "next/server";
import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIClient, getSchemaAnalyzerModel } from "@/lib/ai-tools/openai";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { getSchemaDefinition } from "@/features/schema-generator/config";
import {
  buildSchemaAnalysisPrompt,
  SCHEMA_ANALYSIS_SYSTEM_PROMPT,
} from "@/features/schema-generator/prompt";
import {
  schemaAnalysisInputSchema,
  schemaAnalysisOutputSchema,
} from "@/features/schema-generator/schema";
import { fetchPageSignals } from "@/features/schema-generator/server/fetch-page";

export const runtime = "nodejs";
export const maxDuration = 45;
export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number, code: string) {
  return NextResponse.json({ error: { message, code } }, { status });
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 25_000) {
    return errorResponse(
      "The analysis brief is too large.",
      413,
      "PAYLOAD_TOO_LARGE",
    );
  }

  let limit;
  try {
    limit = await checkAiToolRateLimit(request, "schema-analysis");
  } catch (error) {
    console.error("Schema analyzer rate limiter failed", error);
    return errorResponse(
      "The analyzer is temporarily unavailable.",
      503,
      "RATE_LIMIT_UNAVAILABLE",
    );
  }
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: {
          message:
            "You have reached the current analysis limit. Please try again later.",
          code: "RATE_LIMITED",
        },
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return errorResponse(
      "Send a valid JSON request body.",
      400,
      "INVALID_JSON",
    );
  }
  const inputResult = schemaAnalysisInputSchema.safeParse(rawBody);
  if (!inputResult.success) {
    return NextResponse.json(
      {
        error: {
          message: "Review the page URL and context before analyzing.",
          code: "VALIDATION_ERROR",
          fields: inputResult.error.flatten().fieldErrors,
        },
      },
      { status: 422 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return errorResponse(
      "The optional AI analyzer has not been connected yet. You can still complete the form and generate JSON-LD locally.",
      503,
      "AI_NOT_CONFIGURED",
    );
  }

  let signals = null;
  if (inputResult.data.pageUrl) {
    try {
      signals = await fetchPageSignals(inputResult.data.pageUrl);
    } catch (error) {
      console.warn("Schema URL fetch rejected or failed", error);
      return errorResponse(
        error instanceof Error
          ? error.message
          : "The public page could not be fetched safely.",
        422,
        "URL_FETCH_FAILED",
      );
    }
  }

  const definition = getSchemaDefinition(inputResult.data.schemaType);
  const scalarFields = new Set([
    "pageUrl",
    ...definition.sections.flatMap((section) =>
      section.fields.map((field) => field.id),
    ),
  ]);
  const repeaterFields = new Map(
    (definition.repeaters || []).map((repeater) => [
      repeater.id,
      new Set(repeater.fields.map((field) => field.id)),
    ]),
  );
  const allowedFieldPatterns = [
    ...scalarFields,
    ...(definition.repeaters || []).flatMap((repeater) =>
      repeater.fields.map(
        (field) => `${repeater.id}.{zeroBasedIndex}.${field.id}`,
      ),
    ),
  ];

  function suggestionIsAllowed(fieldId: string) {
    if (scalarFields.has(fieldId)) return true;
    const match = fieldId.match(/^([a-zA-Z0-9]+)\.(\d+)\.([a-zA-Z0-9]+)$/);
    if (!match || Number(match[2]) > 24) return false;
    return repeaterFields.get(match[1])?.has(match[3]) || false;
  }
  const model = getSchemaAnalyzerModel();

  try {
    const response = await getOpenAIClient().responses.parse({
      model,
      reasoning: { effort: "low" },
      max_output_tokens: 4_000,
      input: [
        { role: "system", content: SCHEMA_ANALYSIS_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildSchemaAnalysisPrompt(
            inputResult.data,
            signals,
            allowedFieldPatterns,
          ),
        },
      ],
      text: {
        format: zodTextFormat(
          schemaAnalysisOutputSchema,
          "schema_page_analysis",
        ),
      },
    });
    if (!response.output_parsed) {
      throw new Error("No structured analysis was returned");
    }

    const parsed = schemaAnalysisOutputSchema.parse(response.output_parsed);
    const suggestions = parsed.suggestions
      .filter(
        (suggestion) =>
          suggestionIsAllowed(suggestion.fieldId) && suggestion.value.trim(),
      )
      .slice(0, 40);

    return NextResponse.json(
      {
        analysis: {
          ...parsed,
          suggestions,
          extracted: signals
            ? {
                title: signals.title || signals.h1,
                description: signals.description,
                canonicalUrl: signals.canonicalUrl,
                imageUrl: signals.imageUrl,
                existingSchemaTypes: signals.existingSchemaTypes,
              }
            : parsed.extracted,
        },
        meta: {
          analyzedAt: new Date().toISOString(),
          model,
          fetchedUrl: Boolean(signals),
          remaining: limit.remaining,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      },
    );
  } catch (error) {
    console.error("Schema page analysis failed", error);
    return errorResponse(
      "The optional analyzer could not map this page into safe field suggestions. You can still complete the form manually.",
      502,
      "ANALYSIS_FAILED",
    );
  }
}
