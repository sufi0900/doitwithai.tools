import { z } from "zod";

export const inputSchema = z.object({
  sourceUrl: z.string().url().max(2000),
  sourceText: z.string().max(40000).default(""),
  sitemapUrl: z.union([z.literal(""), z.string().url().max(2000)]).default(""),
  destinationUrls: z.array(z.string().url().max(2000)).max(100).default([]),
});
export type Page = {
  url: string;
  title: string;
  paragraphs: string[];
  links: { url: string; text: string }[];
};
export type Suggestion = {
  destinationUrl: string;
  destinationTitle: string;
  paragraphIndex: number;
  passage: string;
  anchor: string;
  reason: string;
  method: "AI reviewed" | "Text match";
};
export type Report = {
  sourceUrl: string;
  sourceTitle: string;
  suggestions: Suggestion[];
  discovered: number;
  analyzed: number;
  discovery: string;
  pages: { url: string; status: string; title?: string }[];
  notes: string[];
  sourceMode: string;
};
export function normalizeUrl(raw: string, base?: string) {
  const u = new URL(raw, base);
  if (!/^https?:$/.test(u.protocol) || u.username || u.password)
    throw new Error("Use public HTTP or HTTPS URLs without credentials.");
  u.hash = "";
  if (u.pathname !== "/") u.pathname = u.pathname.replace(/\/+$/, "");
  return u.toString();
}
export function sameSite(raw: string, source: string) {
  try {
    return (
      new URL(raw).hostname.toLowerCase() ===
      new URL(source).hostname.toLowerCase()
    );
  } catch {
    return false;
  }
}
const stop = new Set(
  "a an the and or to for of in on with by from is are be your our how what why when this that it as at do can will best guide tool tools free ai".split(
    " ",
  ),
);
export function words(text: string) {
  return [
    ...new Set(
      (text.toLowerCase().match(/[a-z0-9]+/g) || ([] as string[])).filter(
        (w) => w.length > 2 && !stop.has(w),
      ),
    ),
  ];
}
export function relevance(a: string, b: string) {
  const left = words(a),
    right = new Set(words(b));
  return left.reduce((score, word) => score + (right.has(word) ? 1 : 0), 0);
}
export const aiOutputSchema = z.object({
  suggestions: z
    .array(
      z.object({
        destinationUrl: z.string(),
        paragraphIndex: z.number().int(),
        anchor: z.string().min(3).max(120),
        reason: z.string().min(10).max(350),
      }),
    )
    .max(5),
});
export function validateSuggestions(
  raw: z.infer<typeof aiOutputSchema>,
  source: Page,
  destinations: Page[],
  method: Suggestion["method"],
): Suggestion[] {
  const existing = new Set(
    source.links.map((link) => {
      try {
        return normalizeUrl(link.url);
      } catch {
        return "";
      }
    }),
  );
  const used = new Set<string>();
  return raw.suggestions
    .flatMap((s) => {
      const destination = destinations.find((p) => p.url === s.destinationUrl);
      const passage = source.paragraphs[s.paragraphIndex];
      const anchor = s.anchor.trim();
      if (
        !destination ||
        !passage ||
        !anchor ||
        !passage.includes(anchor) ||
        used.has(destination.url) ||
        existing.has(destination.url) ||
        destination.url === source.url
      )
        return [];
      // Do not suggest wrapping existing linked words or nested anchors.
      if (source.links.some((link) => link.text && anchor.includes(link.text)))
        return [];
      if (
        relevance(
          passage,
          `${destination.title} ${destination.paragraphs.join(" ")}`,
        ) < 2
      )
        return [];
      used.add(destination.url);
      return [
        { ...s, anchor, destinationTitle: destination.title, passage, method },
      ];
    })
    .slice(0, 5);
}
export function textMatches(source: Page, destinations: Page[]): Suggestion[] {
  const candidates = destinations
    .flatMap((destination) => {
      const phrases = [
        destination.title.replace(/\s*[|:].*$/, "").trim(),
        ...destination.url
          .split("/")
          .pop()!
          .replace(/-/g, " ")
          .split(/\s+/)
          .reduce<string[]>((acc, _, i, parts) => {
            for (let length = 4; length >= 2; length--)
              if (i + length <= parts.length)
                acc.push(parts.slice(i, i + length).join(" "));
            return acc;
          }, []),
      ];
      return source.paragraphs.flatMap((passage, paragraphIndex) => {
        for (const phrase of phrases) {
          if (words(phrase).length < 2) continue;
          const index = passage.toLowerCase().indexOf(phrase.toLowerCase());
          if (
            index < 0 ||
            /[a-z0-9]/i.test(passage[index - 1] || " ") ||
            /[a-z0-9]/i.test(passage[index + phrase.length] || " ")
          )
            continue;
          return [
            {
              destinationUrl: destination.url,
              paragraphIndex,
              anchor: passage.slice(index, index + phrase.length),
              reason:
                "This passage shares a specific phrase with the destination topic. Review both pages before adding the link.",
              score: relevance(passage, destination.title),
            },
          ];
        }
        return [];
      });
    })
    .sort((a, b) => b.score - a.score);
  return validateSuggestions(
    { suggestions: candidates },
    source,
    destinations,
    "Text match",
  );
}
