import { parse } from "tldts";

export function normalizeDomain(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.length > 2048)
    throw new Error("Enter one website domain, such as doitwithai.tools.");
  const text = value.trim();
  if (/\s/.test(text)) throw new Error("Enter one domain without spaces.");
  let url: URL;
  try {
    url = new URL(text.includes("://") ? text : `https://${text}`);
  } catch {
    throw new Error("Enter a valid domain or HTTP website URL.");
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.port
  )
    throw new Error(
      "Use a public website domain without credentials or a custom port.",
    );
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  const result = parse(host, { allowPrivateDomains: true });
  if (result.isIp || !result.domain || (!result.isIcann && !result.isPrivate))
    throw new Error(
      "Enter a public website domain, rather than an IP address or local hostname.",
    );
  return result.domain;
}

export type RatingResult = {
  domain: string;
  rating: number;
  checkedAt: string;
  version: "dr3";
};
