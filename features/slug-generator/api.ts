import type { SlugApiResponse, SlugInput } from "./schema";

export class SlugRequestError extends Error {
  code: string;

  constructor(message: string, code = "REQUEST_FAILED") {
    super(message);
    this.name = "SlugRequestError";
    this.code = code;
  }
}

export async function generateSlugs(input: SlugInput) {
  const response = await fetch("/api/ai-tools/slug", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new SlugRequestError(
      payload?.error?.message ||
        "The generator could not complete this request.",
      payload?.error?.code,
    );
  }

  return payload as SlugApiResponse;
}
