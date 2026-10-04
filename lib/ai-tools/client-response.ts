export class ToolResponseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ToolResponseError";
  }
}
// Hosts and gateways can return HTML before a route's JSON error handler runs.
export async function readToolResponse<T = Record<string, any>>(
  response: Response,
): Promise<T> {
  const type = response.headers.get("content-type") || "";
  const text = await response.text();
  let payload: any;
  try {
    payload = JSON.parse(text);
  } catch {
    const message =
      response.status === 404
        ? "This tool endpoint is unavailable in this deployment. Refresh the page or contact the site owner."
        : response.status === 401 || response.status === 403
          ? "The deployment blocked this request. Check deployment access or contact the site owner."
          : response.status === 429
            ? "The server is limiting requests. Please wait before trying again."
            : response.status === 504
              ? "The server timed out. Your previous draft is preserved. Try a smaller request."
              : "The server returned an unexpected response. Your previous draft is preserved. Please try again later.";
    throw new ToolResponseError(
      `${message} (HTTP ${response.status})`,
      type.includes("text/html") || /^\s*<!doctype|^\s*<html/i.test(text)
        ? "HTML_RESPONSE"
        : "INVALID_RESPONSE",
      response.status,
    );
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload))
    throw new ToolResponseError(
      "The server returned invalid tool data. Please try again later.",
      "INVALID_RESPONSE",
      response.status,
    );
  if (!response.ok && payload.cloudflare_error === true)
    throw new ToolResponseError(
      `The gateway could not reach the tool server. Your previous draft is preserved. Wait a minute before trying again. (HTTP ${response.status})`,
      "UPSTREAM_UNAVAILABLE",
      response.status,
    );
  if (!response.ok)
    throw new ToolResponseError(
      typeof payload.error?.message === "string"
        ? payload.error.message
        : "The server could not complete this request. Please try again later.",
      typeof payload.error?.code === "string"
        ? payload.error.code
        : "REQUEST_FAILED",
      response.status,
    );
  if (!("result" in payload) && !("analysis" in payload))
    throw new ToolResponseError(
      "The server returned incomplete tool data. Please try again later.",
      "INVALID_RESPONSE",
      response.status,
    );
  return payload as T;
}
