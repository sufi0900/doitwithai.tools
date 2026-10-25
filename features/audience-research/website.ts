import type { PageSnapshot } from "@/features/on-page-analyzer/types";
import { readToolResponse } from "@/lib/ai-tools/client-response";

/** Read a few representative blocks across the page, rather than its opening alone. */
export function websiteContext(page: PageSnapshot, budget = 5500) {
  const seen = new Set<string>();
  const blocks = page.blocks.filter((b) => {
    const text = b.text.replace(/\s+/g, " ").trim();
    if (text.length < 12 || seen.has(text.toLowerCase())) return false;
    seen.add(text.toLowerCase());
    return true;
  });
  const metadata = [
    `Page: ${page.url}`,
    `Title: ${page.title.slice(0, 250)}`,
    `Description: ${page.description.slice(0, 500)}`,
    `Language: ${page.language}`,
  ].join("\n");
  const headings = blocks.filter((b) => /^h[1-6]$/.test(b.tag)).slice(0, 35);
  const body = blocks.filter((b) => !/^h[1-6]$/.test(b.tag));
  const sampled =
    body.length <= 20
      ? body
      : Array.from(
          { length: 20 },
          (_, i) => body[Math.round((i * (body.length - 1)) / 19)],
        );
  const headerText = headings
    .map((b) => b.text.slice(0, 120))
    .join(" | ")
    .slice(0, 1400);
  const remaining = Math.max(
    0,
    budget - metadata.length - headerText.length - 45,
  );
  const perBlock = Math.min(
    500,
    Math.floor(remaining / Math.max(1, sampled.length)),
  );
  return `${metadata}\nHeadings: ${headerText}\nSelected page passages:\n${sampled.map((b) => b.text.slice(0, perBlock)).join("\n")}`.slice(
    0,
    budget,
  );
}

/** Only two same-origin, public content links can supplement the submitted page. */
export function relatedWebsitePages(page: PageSnapshot) {
  const base = new URL(page.url);
  const candidates = new Map<string, number>();
  for (const link of page.links) {
    try {
      const url = new URL(link.href, base);
      if (
        url.origin !== base.origin ||
        url.username ||
        url.password ||
        url.search ||
        !["http:", "https:"].includes(url.protocol)
      )
        continue;
      url.hash = "";
      if (url.pathname.replace(/\/$/, "") === base.pathname.replace(/\/$/, ""))
        continue;
      if (/\.(pdf|zip|png|jpg|jpeg|webp|svg|mp4|xml|txt)$/i.test(url.pathname))
        continue;
      const path = url.pathname.toLowerCase();
      if (
        /\/(login|sign-in|register|checkout|cart|privacy|terms|contact)(\/|$)/.test(
          path,
        )
      )
        continue;
      let score = /^\/(about|about-us|company)\/?$/.test(path) ? 5 : 0;
      if (/^\/(services|products|solutions|tools|features)\/?$/.test(path))
        score = 4;
      if (/\/(services|products|solutions)\//.test(path))
        score = Math.max(score, 2);
      if (score)
        candidates.set(
          url.href,
          Math.max(score, candidates.get(url.href) || 0),
        );
    } catch {
      /* Malformed links never become requests. */
    }
  }
  return [...candidates]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([url]) => url);
}

export async function importAudienceWebsite(
  url: string,
  signal: AbortSignal,
  onStage: (message: string) => void,
  fetcher: typeof fetch = fetch,
) {
  const read = async (target: string) => {
    const response = await fetcher("/api/ai-tools/on-page/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: target }),
      signal,
    });
    return (await readToolResponse<{ result: PageSnapshot }>(response)).result;
  };
  onStage("Reading the submitted page and its audience clues.");
  const primary = await read(url);
  if (primary.blocks.reduce((n, b) => n + b.text.trim().length, 0) < 25)
    throw Error(
      "This page did not expose enough readable content. Try a public product page or paste a brief.",
    );
  const related = relatedWebsitePages(primary);
  if (related.length)
    onStage("Reading relevant business pages before building your plan.");
  const settled = await Promise.allSettled(related.map(read));
  if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
  const pages = [primary];
  for (const item of settled) {
    if (
      item.status === "fulfilled" &&
      item.value.blocks.some((b) => b.text.length >= 25) &&
      !pages.some((p) => p.url === item.value.url)
    )
      pages.push(item.value);
  }
  const text = pages
    .map((page, i) => websiteContext(page, i ? 3000 : 5500))
    .join("\n\n")
    .slice(0, 12000);
  const skipped = related.length - (pages.length - 1);
  return {
    text,
    note: `Read ${pages.length} public ${pages.length === 1 ? "page" : "pages"}: ${pages.map((p) => p.url).join(", ")}. ${skipped ? `${skipped} supporting ${skipped === 1 ? "page" : "pages"} could not be used. ` : ""}${pages.some((p) => p.partial) ? "Some page content was partial. " : ""}Selected text informs the plan. Visitor and sales data were not accessed.`,
  };
}
