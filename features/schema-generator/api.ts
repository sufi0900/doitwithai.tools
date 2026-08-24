import type { SchemaAnalysisResponse } from "./types";
import type { SchemaAnalysisInput } from "./schema";

export class SchemaAnalysisError extends Error {
  code: string;

  constructor(message: string, code = "REQUEST_FAILED") {
    super(message);
    this.name = "SchemaAnalysisError";
    this.code = code;
  }
}

export async function analyzeSchemaPage(input: SchemaAnalysisInput) {
  const response = await fetch("/api/ai-tools/schema/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new SchemaAnalysisError(
      payload?.error?.message || "The page analysis could not be completed.",
      payload?.error?.code,
    );
  }
  return payload as SchemaAnalysisResponse;
}
