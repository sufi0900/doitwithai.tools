export class PageImportError extends Error {
  constructor(
    public code:
      | "SOURCE_ACCESS_DENIED"
      | "SOURCE_RATE_LIMITED"
      | "SOURCE_HTTP_ERROR"
      | "SOURCE_CHALLENGE",
    message: string,
    public targetStatus?: number,
  ) {
    super(message);
    this.name = "PageImportError";
  }
}
export function sourceHttpError(status: number) {
  if (status === 401 || status === 403)
    return new PageImportError(
      "SOURCE_ACCESS_DENIED",
      `The source website refused this import (HTTP ${status}). Paste article text or copied HTML to continue. No content verdict was made.`,
      status,
    );
  if (status === 429)
    return new PageImportError(
      "SOURCE_RATE_LIMITED",
      "The source website limited this request (HTTP 429). Wait before retrying, or paste article text or copied HTML.",
      status,
    );
  return new PageImportError(
    "SOURCE_HTTP_ERROR",
    `The source website returned HTTP ${status}. Check the URL or paste article text or copied HTML.`,
    status,
  );
}
export function importFailure(error: unknown) {
  if (error instanceof PageImportError)
    return {
      message: error.message,
      code: error.code,
      targetStatus: error.targetStatus,
      alternative: "paste",
    };
  return {
    message:
      error instanceof Error &&
      /^(The |Enter |Only |Private |URLs )/.test(error.message)
        ? error.message
        : "The page could not be read in time. Paste article text or HTML to continue.",
    code: "IMPORT_UNAVAILABLE",
    alternative: "paste",
  };
}
