import { z } from "zod";
import { cvCandidateSchema, extractCvCandidates, type CvCandidate } from "@/features/website-builder/domain/cv-ingestion";

const aiFactSchema = z.object({
  kind: z.enum(["name", "role", "intro", "skill", "education", "experience"]),
  value: z.string().trim().min(1).max(1_200),
  sourceExcerpt: z.string().trim().min(1).max(1_200),
  confidence: z.enum(["high", "medium", "low"]),
});
const aiResultSchema = z.object({ facts: z.array(aiFactSchema).max(20), warnings: z.array(z.string().max(500)).max(4) });

export type CvAiFailureCode =
  | "not_configured"
  | "authentication"
  | "rate_limited"
  | "request_rejected"
  | "timeout"
  | "incomplete_response"
  | "invalid_response"
  | "ungrounded_response"
  | "provider_unavailable";

export class CvAiError extends Error {
  constructor(public readonly code: CvAiFailureCode, message: string, public readonly status?: number) {
    super(message);
    this.name = "CvAiError";
  }
}

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["facts", "warnings"],
  properties: {
    facts: {
      type: "array", maxItems: 20,
      items: {
        type: "object", additionalProperties: false,
        required: ["kind", "value", "sourceExcerpt", "confidence"],
        properties: {
          kind: { type: "string", enum: ["name", "role", "intro", "skill", "education", "experience"] },
          value: { type: "string", maxLength: 1200 }, sourceExcerpt: { type: "string", maxLength: 1200 },
          confidence: { type: "string", enum: ["high", "medium", "low"] },
        },
      },
    },
    warnings: { type: "array", maxItems: 4, items: { type: "string", maxLength: 500 } },
  },
};

function normalizedTokens(value: string) {
  return new Set(value.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter((token) => token.length > 1));
}

export function isGrounded(sourceExcerpt: string, sourceText: string) {
  const excerpt = normalizedTokens(sourceExcerpt);
  const source = normalizedTokens(sourceText);
  if (!excerpt.size) return false;
  let matches = 0;
  for (const token of excerpt) if (source.has(token)) matches += 1;
  return matches / excerpt.size >= 0.75;
}

function toCandidate(fact: z.infer<typeof aiFactSchema>): CvCandidate | null {
  const max = fact.kind === "skill" ? 32 : 220;
  const parsed = cvCandidateSchema.safeParse({ ...fact, id: crypto.randomUUID(), value: fact.value.slice(0, max), sourceExcerpt: fact.sourceExcerpt.slice(0, 320) });
  return parsed.success ? parsed.data : null;
}

export function readResponseText(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const direct = (payload as { output_text?: unknown }).output_text;
  if (typeof direct === "string") return direct;
  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) return null;
  for (const item of output) {
    if (!item || typeof item !== "object" || !Array.isArray((item as { content?: unknown }).content)) continue;
    for (const content of (item as { content: unknown[] }).content) {
      if (content && typeof content === "object" && typeof (content as { text?: unknown }).text === "string") return (content as { text: string }).text;
    }
  }
  return null;
}

export function responseIncompleteReason(payload: unknown) {
  if (!payload || typeof payload !== "object" || (payload as { status?: unknown }).status !== "incomplete") return null;
  const details = (payload as { incomplete_details?: unknown }).incomplete_details;
  if (!details || typeof details !== "object") return "unknown";
  const reason = (details as { reason?: unknown }).reason;
  return typeof reason === "string" ? reason : "unknown";
}

export function parseStructuredResponseText(outputText: string) {
  const trimmed = outputText.trim();
  const unfenced = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    : trimmed;
  return aiResultSchema.parse(JSON.parse(unfenced));
}

export function mergeCvCandidates(aiFacts: CvCandidate[], fallback: CvCandidate[]) {
  const singleton = new Set(["name", "role", "intro"]);
  const merged: CvCandidate[] = [];
  for (const fact of aiFacts) {
    if (singleton.has(fact.kind) && merged.some((item) => item.kind === fact.kind)) continue;
    if (!merged.some((item) => item.kind === fact.kind && item.value.toLowerCase() === fact.value.toLowerCase())) merged.push(fact);
  }
  for (const fact of fallback) {
    if (singleton.has(fact.kind) && merged.some((item) => item.kind === fact.kind)) continue;
    if (!merged.some((item) => item.kind === fact.kind && item.value.toLowerCase() === fact.value.toLowerCase())) merged.push(fact);
  }
  return merged.slice(0, 40);
}

function boundedTimeout(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(120_000, Math.max(15_000, parsed)) : fallback;
}

export async function extractCvWithOpenAI(input: { file: File; buffer: Buffer; extractedText: string }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new CvAiError("not_configured", "OPENAI_API_KEY is missing.");
  const localText = input.extractedText.trim();
  const useExtractedText = localText.length >= 400;
  const model = process.env.OPENAI_CV_MODEL || "gpt-5-mini";
  const configuredTimeout = boundedTimeout(process.env.OPENAI_CV_TIMEOUT_MS, 60_000);
  const timeoutMs = useExtractedText ? configuredTimeout : Math.max(90_000, configuredTimeout);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const documentContent = useExtractedText
      ? [{ type: "input_text", text: `CV TEXT (preserve its evidence exactly):\n${localText.slice(0, 24_000)}` }]
      : [{ type: "input_file", filename: input.file.name, file_data: `data:${input.file.type};base64,${input.buffer.toString("base64")}` }];
    const reasoning = /^(gpt-5|gpt-6|o\d)/i.test(model) ? { reasoning: { effort: "low" } } : {};
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST", signal: controller.signal,
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        store: false,
        ...reasoning,
        input: [{ role: "user", content: [
          ...documentContent,
          { type: "input_text", text: "Parse this resume into evidence-backed facts. Return at most: one full name, one target/headline role, one complete authored introduction/profile/summary, eight core skills, four education credentials, and four work-experience roles. Understand headings, multi-column reading order, and flattened designed layouts. Never use section headings, URLs, contacts, employers, institutions, dates, or locations as the name or target role. Do not invent or rewrite claims. Copy a short verbatim source excerpt for every fact. Omit absent fields and add a brief warning." },
        ] }],
        // This budget includes reasoning tokens and the visible JSON result.
        max_output_tokens: 5_000,
        text: { verbosity: "low", format: { type: "json_schema", name: "cv_fact_extraction", strict: true, schema: responseSchema } },
      }),
    });
    if (!response.ok) {
      const code: CvAiFailureCode = response.status === 401 || response.status === 403
        ? "authentication"
        : response.status === 429
          ? "rate_limited"
          : response.status === 400 || response.status === 404
            ? "request_rejected"
            : "provider_unavailable";
      throw new CvAiError(code, `OpenAI returned status ${response.status}.`, response.status);
    }
    const payload = await response.json();
    const incompleteReason = responseIncompleteReason(payload);
    if (incompleteReason) throw new CvAiError("incomplete_response", `OpenAI response was incomplete (${incompleteReason}).`);
    const outputText = readResponseText(payload);
    if (!outputText) throw new CvAiError("invalid_response", "OpenAI returned no structured output.");
    let parsed: z.infer<typeof aiResultSchema>;
    try {
      parsed = parseStructuredResponseText(outputText);
    } catch {
      throw new CvAiError("invalid_response", "OpenAI returned malformed structured output.");
    }
    const hasLocalText = input.extractedText.trim().length >= 20;
    const candidates = parsed.facts
      .filter((fact) => !hasLocalText || isGrounded(fact.sourceExcerpt, input.extractedText))
      .map((fact) => toCandidate(hasLocalText ? fact : { ...fact, confidence: "low" }))
      .filter((fact): fact is CvCandidate => Boolean(fact));
    if (!candidates.length) throw new CvAiError("ungrounded_response", "No AI facts passed source-grounding checks.");
    return { candidates: mergeCvCandidates(candidates, extractCvCandidates(input.extractedText)), warnings: parsed.warnings };
  } catch (error) {
    if (error instanceof CvAiError) throw error;
    if (error instanceof Error && error.name === "AbortError") throw new CvAiError("timeout", "OpenAI CV extraction timed out.");
    throw new CvAiError("provider_unavailable", "The OpenAI request failed before completion.");
  } finally {
    clearTimeout(timeout);
  }
}
