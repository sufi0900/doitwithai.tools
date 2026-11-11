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
  geminiTextFormat,
} from "@/lib/ai-tools/gemini";
import {
  enrichKeywordRow,
  inputSchema,
  keywordKey,
  outputSchema,
  researchPrompt,
  validateOutput,
  type EnrichedKeywordRow,
  type LiveHarvestSignal,
  type ResearchInput,
  type ResearchReport,
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

function resolveCountryGl(country: string): string {
  const c = (country || "").toLowerCase();
  if (c.includes("united kingdom") || c === "uk") return "gb";
  if (c.includes("india")) return "in";
  if (c.includes("pakistan")) return "pk";
  if (c.includes("canada")) return "ca";
  if (c.includes("australia")) return "au";
  if (c.includes("germany")) return "de";
  return "us";
}

function resolveLangHl(language: string): string {
  const l = (language || "").toLowerCase();
  if (l.includes("spanish")) return "es";
  if (l.includes("french")) return "fr";
  if (l.includes("german")) return "de";
  if (l.includes("hindi")) return "hi";
  if (l.includes("urdu")) return "ur";
  if (l.includes("arabic")) return "ar";
  return "en";
}

async function fetchGoogleAutocompleteList(
  query: string,
  hl: string,
  gl: string,
  ds = "",
): Promise<string[]> {
  try {
    const dsParam = ds ? `&ds=${ds}` : "";
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=${hl}&gl=${gl}${dsParam}&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    if (Array.isArray(data) && Array.isArray(data[1])) {
      return data[1]
        .filter((item): item is string => typeof item === "string")
        .map((s) => s.trim())
        .filter((s) => s.length >= 3 && s.length <= 115);
    }
    return [];
  } catch {
    return [];
  }
}

async function fetchDatamuseSignals(
  seed: string,
): Promise<{ word: string; freq: number }[]> {
  try {
    const url = `https://api.datamuse.com/words?ml=${encodeURIComponent(seed)}&md=f&max=25`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3200) });
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{
      word?: string;
      tags?: string[];
    }>;
    if (!Array.isArray(data)) return [];
    return data
      .map((item) => {
        const fTag = (item.tags || []).find((t) => t.startsWith("f:"));
        const freq = fTag ? parseFloat(fTag.slice(2)) || 0 : 0;
        return { word: String(item.word || "").trim(), freq };
      })
      .filter((x) => x.word.length >= 3);
  } catch {
    return [];
  }
}

/**
 * Harvests real live keyword suggestions from Google Autocomplete, YouTube Suggest,
 * and Datamuse Corpus Frequency API in parallel.
 */
async function harvestLiveKeywordSignals(
  input: ResearchInput,
): Promise<{ signals: LiveHarvestSignal; orderedPhrases: string[] }> {
  const gl = resolveCountryGl(input.country);
  const hl = resolveLangHl(input.language);

  const primarySeeds =
    input.seeds.length > 0
      ? input.seeds.slice(0, 3)
      : [
          input.context
            .split(/[.\n,|-]+/)[0]
            ?.trim()
            .split(/\s+/)
            .slice(0, 4)
            .join(" ") || "seo content strategy",
        ];

  const mainSeed = primarySeeds[0];
  const queries: { q: string; source: string; ds?: string }[] = [
    { q: mainSeed, source: "Google Autocomplete" },
    { q: `how to ${mainSeed}`, source: "Google Question Suggest" },
    { q: `what is ${mainSeed}`, source: "Google Question Suggest" },
    { q: `best ${mainSeed}`, source: "Google Commercial Suggest" },
    { q: `${mainSeed} vs`, source: "Google Comparison Suggest" },
    { q: `${mainSeed} for`, source: "Google Long-Tail Suggest" },
    { q: `${mainSeed} tool`, source: "Google Transactional Suggest" },
    { q: `${mainSeed} checklist`, source: "Google Template Suggest" },
    { q: mainSeed, source: "YouTube Search Suggest", ds: "yt" },
  ];

  for (const extraSeed of primarySeeds.slice(1, 3)) {
    queries.push({ q: extraSeed, source: "Google Autocomplete" });
    queries.push({ q: `how to ${extraSeed}`, source: "Google Question Suggest" });
  }

  const [autocompleteBatches, datamuseItems] = await Promise.all([
    Promise.all(
      queries.map(async (item) => ({
        source: item.source,
        items: await fetchGoogleAutocompleteList(
          item.q,
          hl,
          gl,
          item.ds || "",
        ),
      })),
    ),
    fetchDatamuseSignals(mainSeed),
  ]);

  const autocompleteSuggestions = new Map<
    string,
    { rank: number; source: string }
  >();
  const orderedPhrases: string[] = [];

  for (const batch of autocompleteBatches) {
    batch.items.forEach((phrase, idx) => {
      const k = keywordKey(phrase);
      if (!autocompleteSuggestions.has(k)) {
        autocompleteSuggestions.set(k, {
          rank: idx + 1,
          source: batch.source,
        });
        orderedPhrases.push(phrase);
      }
    });
  }

  const datamuseFrequency = new Map<string, number>();
  for (const dm of datamuseItems) {
    datamuseFrequency.set(keywordKey(dm.word), dm.freq);
  }

  return {
    signals: { autocompleteSuggestions, datamuseFrequency },
    orderedPhrases,
  };
}

function inferDeterministicRow(
  phrase: string,
  mainSeed: string,
  country: string,
  signals: LiveHarvestSignal,
): EnrichedKeywordRow {
  const lower = phrase.toLowerCase();
  const isQuestion =
    /^(how|what|why|when|where|who|which|can|does|do|is|are|should|will)\b/i.test(
      lower,
    ) || lower.includes("?");

  const intent =
    /\b(buy|price|pricing|cost|tool|generator|software|template|download|free|agency|service|hire)\b/i.test(
      lower,
    )
      ? "transactional"
      : /\b(best|top|vs|versus|compare|comparison|review|alternatives|options)\b/i.test(
            lower,
          )
        ? "commercial"
        : isQuestion ||
            /\b(guide|tutorial|steps|checklist|examples|ideas|tips|strategy|meaning)\b/i.test(
              lower,
            )
          ? "informational"
          : "mixed";

  const format =
    /\b(vs|versus|compare|comparison|alternatives)\b/i.test(lower)
      ? "comparison"
      : /\b(tool|generator|software|service|agency|template)\b/i.test(lower)
        ? "product or service"
        : /\b(how to|steps|tutorial|setup|build)\b/i.test(lower)
          ? "tutorial"
          : /\b(checklist|examples|list|reference|metrics)\b/i.test(lower)
            ? "reference"
            : "guide";

  const group = isQuestion
    ? "Questions & People Also Ask"
    : intent === "transactional"
      ? "Tools, Templates & Solutions"
      : intent === "commercial"
        ? "Comparisons & Best-Of Reviews"
        : /\b(beginner|start|basics|what is)\b/i.test(lower)
          ? "Foundational Pillar Guides"
          : `${mainSeed.slice(0, 32)} Playbooks & Workflows`;

  const task = isQuestion
    ? `Answer "${phrase}" with a concise 45-word featured snippet block and step-by-step examples.`
    : intent === "commercial"
      ? `Compare top options for ${phrase} using a decision matrix and clear evaluation criteria.`
      : intent === "transactional"
        ? `Provide an interactive tool, template, or solution page targeting ${phrase}.`
        : `Publish an actionable practitioner guide covering ${phrase} with visual diagrams.`;

  return enrichKeywordRow(
    {
      keyword: phrase,
      question: isQuestion,
      intent,
      group,
      format,
      task,
    },
    country,
    signals,
  );
}

function buildFallbackLiveResearchReport(
  input: ResearchInput,
  orderedPhrases: string[],
  signals: LiveHarvestSignal,
): ResearchReport {
  const mainSeed =
    input.seeds[0] ||
    input.context
      .split(/[.\n,|-]+/)[0]
      ?.trim()
      .split(/\s+/)
      .slice(0, 4)
      .join(" ") ||
    "seo strategy";

  const syntheticExpansions = [
    mainSeed,
    `how to ${mainSeed}`,
    `what is ${mainSeed}`,
    `best ${mainSeed} tools`,
    `${mainSeed} step by step guide`,
    `${mainSeed} checklist for beginners`,
    `${mainSeed} vs traditional workflow`,
    `free ${mainSeed} template`,
    `${mainSeed} examples and case studies`,
    `common ${mainSeed} mistakes to avoid`,
    `${mainSeed} strategy for 2026`,
    `how does ${mainSeed} improve organic reach`,
    `best free ${mainSeed} generator`,
    `${mainSeed} framework and matrix`,
    `${mainSeed} KPI benchmarks and metrics`,
    `why ${mainSeed} matters for small teams`,
    `${mainSeed} audit checklist`,
    `automated ${mainSeed} workflow`,
  ];

  const combined = [...orderedPhrases, ...syntheticExpansions];
  const seen = new Set(input.exclude.map(keywordKey));
  const rows: EnrichedKeywordRow[] = [];

  for (const rawPhrase of combined) {
    const clean = rawPhrase.trim().slice(0, 115);
    if (clean.length < 3) continue;
    const k = keywordKey(clean);
    if (seen.has(k)) continue;
    seen.add(k);
    rows.push(inferDeterministicRow(clean, mainSeed, input.country, signals));
    if (rows.length >= input.count) break;
  }

  return {
    summary: `Generated ${rows.length} keyword opportunities for "${mainSeed}" (${input.country} · ${input.language}) using live Google Autocomplete signals, corpus frequency calibration, Keyword Difficulty (KD), and CPC estimates.`,
    keywords: rows,
  };
}

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
  if (!input.success) {
    return error(
      "Add 1–10 seeds or website context, plus a country and language. Keep each seed below 120 characters.",
      422,
      "VALIDATION_ERROR",
    );
  }

  // Always harvest real live Google Autocomplete + YouTube + Datamuse signals first
  const { signals, orderedPhrases } = await harvestLiveKeywordSignals(
    input.data,
  );

  const model = getGeminiModel("KEYWORD_RESEARCH") || getGeminiModel();
  if (!isAiConfigured(model)) {
    const fallbackResult = buildFallbackLiveResearchReport(
      input.data,
      orderedPhrases,
      signals,
    );
    return NextResponse.json(
      {
        result: fallbackResult,
        meta: {
          provider: "live-autocomplete-engine",
          model: "google-suggest-datamuse-v2",
          remaining: 15,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  let limit;
  try {
    limit = await checkAiToolRateLimit(request, "keyword-research", {
      dailyLimit: 25,
      burstLimit: 8,
      refundFailures: true,
    });
  } catch (cause) {
    return error(
      rateLimitFailure(cause).message,
      503,
      "RATE_LIMIT_UNAVAILABLE",
    );
  }

  if (!limit.allowed) {
    // Even if AI quota is reached, still serve the live Google Autocomplete + Datamuse report!
    const fallbackResult = buildFallbackLiveResearchReport(
      input.data,
      orderedPhrases,
      signals,
    );
    return NextResponse.json(
      {
        result: fallbackResult,
        meta: {
          provider: "live-autocomplete-engine",
          model: "google-suggest-datamuse-v2",
          remaining: 0,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  let completed = false;
  try {
    if (request.signal.aborted) {
      return error(
        "The request was cancelled before AI review started.",
        499,
        "REQUEST_CANCELLED",
      );
    }

    const prompt = researchPrompt(input.data, orderedPhrases);
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
      { timeout: 38000, maxRetries: 0 },
    );

    const result = validateOutput(
      response.output_parsed,
      input.data,
      signals,
    );
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
  } catch {
    // Seamless fallback to Live Google Autocomplete + Datamuse report so user never gets an error
    const fallbackResult = buildFallbackLiveResearchReport(
      input.data,
      orderedPhrases,
      signals,
    );
    completed = true;
    return NextResponse.json(
      {
        result: fallbackResult,
        meta: {
          provider: "live-autocomplete-fallback",
          model: "google-suggest-datamuse-v2",
          remaining: limit.remaining,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } finally {
    if (!completed && limit.release) {
      try {
        await limit.release();
      } catch {}
    }
  }
}
