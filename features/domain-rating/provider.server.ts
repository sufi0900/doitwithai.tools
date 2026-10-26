import type { RatingResult } from "./domain";

export class RatingError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export async function lookupRating(
  domain: string,
  key: string,
  signal: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<RatingResult> {
  const url = new URL("https://api.ahrefs.com/v3/public/domain-rating-free");
  url.search = new URLSearchParams({
    target: domain,
    output: "json",
    version: "dr3",
  }).toString();
  let response: Response;
  try {
    response = await fetcher(url, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      signal,
      cache: "no-store",
      redirect: "error",
    });
  } catch {
    throw new RatingError(
      503,
      "PROVIDER_UNAVAILABLE",
      "The rating service could not respond. Please try again shortly.",
    );
  }
  if (!response.ok) {
    if (response.status === 401 || response.status === 403)
      throw new RatingError(
        503,
        "PROVIDER_ACCESS",
        "The rating service connection needs attention. Please return later.",
      );
    if (response.status === 429)
      throw new RatingError(
        429,
        "PROVIDER_LIMIT",
        "The rating provider is busy or its allowance was reached. Please retry later.",
      );
    throw new RatingError(
      503,
      "PROVIDER_UNAVAILABLE",
      "The rating service is temporarily unavailable. Please retry later.",
    );
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new RatingError(
      502,
      "INVALID_RESPONSE",
      "The provider returned an unreadable result. Please try again later.",
    );
  }
  const rating = (
    data as { domain_rating?: { domain_rating?: unknown } } | null
  )?.domain_rating?.domain_rating;
  if (rating === null)
    throw new RatingError(
      404,
      "NO_DATA",
      "The provider returned no rating for this domain. No data does not mean a score of zero.",
    );
  if (
    typeof rating !== "number" ||
    !Number.isFinite(rating) ||
    rating < 0 ||
    rating > 100
  )
    throw new RatingError(
      502,
      "INVALID_RESPONSE",
      "The provider did not return a valid Domain Rating. Please try again later.",
    );
  return {
    domain,
    rating,
    checkedAt: new Date().toISOString(),
    version: "dr3",
  };
}
