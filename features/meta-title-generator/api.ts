import { readToolResponse } from "@/lib/ai-tools/client-response";
import type { MetaTitleApiResponse, MetaTitleInput } from "./schema";

export class GeneratorRequestError extends Error {
  code: string;

  constructor(message: string, code = "REQUEST_FAILED") {
    super(message);
    this.name = "GeneratorRequestError";
    this.code = code;
  }
}

export async function generateMetaTitles(input: MetaTitleInput) {
  const response = await fetch("/api/ai-tools/meta-title", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });

  const payload = await readToolResponse(response);

  if (!response.ok) {
    throw new GeneratorRequestError(
      payload?.error?.message ||
        "The generator could not complete this request.",
      payload?.error?.code,
    );
  }

  return payload as MetaTitleApiResponse;
}
