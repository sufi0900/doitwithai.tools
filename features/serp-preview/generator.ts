import type {
  ArticlePreview,
  BreadcrumbPreview,
  EventPreview,
  FaqPreview,
  HowToPreview,
  ProductPreview,
  RatingPreview,
  RecipePreview,
  RichResultBlock,
  SnippetIssue,
  SnippetState,
} from "./types";

export const RECOMMENDED_TITLE_CHARS = 60;
export const RECOMMENDED_DESCRIPTION_CHARS = 155;

export function defaultSnippetState(): SnippetState {
  return { title: "", url: "", description: "" };
}

export function validateSnippet(state: SnippetState): SnippetIssue[] {
  const issues: SnippetIssue[] = [];
  if (!state.title.trim()) {
    issues.push({ level: "error", message: "Add a title." });
  } else if (state.title.trim().length > RECOMMENDED_TITLE_CHARS) {
    issues.push({
      level: "info",
      message: `Title is ${state.title.trim().length} characters. Google truncates by on-screen pixel width, not a fixed character count — around ${RECOMMENDED_TITLE_CHARS} characters is a safe rule of thumb, but check the exact pixel width with the Meta Title Generator.`,
    });
  }
  if (!state.description.trim()) {
    issues.push({ level: "warning", message: "Add a description, or Google may auto-generate one from the page instead." });
  } else if (state.description.trim().length > RECOMMENDED_DESCRIPTION_CHARS + 45) {
    issues.push({
      level: "info",
      message: `Description is ${state.description.trim().length} characters. Google usually shows up to roughly ${RECOMMENDED_DESCRIPTION_CHARS}–200 characters depending on the query and device, then truncates.`,
    });
  }
  if (state.url.trim() && !/^https?:\/\//i.test(state.url.trim())) {
    issues.push({ level: "error", message: "URL should be a full absolute URL starting with https://." });
  }
  return issues;
}

export function breadcrumbFromUrl(url: string): string[] {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    return [parsed.hostname, ...segments.map((segment) => decodeURIComponent(segment).replace(/[-_]+/g, " "))];
  } catch {
    return [];
  }
}

export function parseJsonLdInput(raw: string): unknown[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const parsed = JSON.parse(trimmed);
  if (Array.isArray(parsed)) return parsed;
  return [parsed];
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function flattenGraph(objects: unknown[]): Record<string, unknown>[] {
  const flat: Record<string, unknown>[] = [];
  const visit = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    const record = value as Record<string, unknown>;
    flat.push(record);
    if (Array.isArray(record["@graph"])) {
      (record["@graph"] as unknown[]).forEach(visit);
    }
  };
  objects.forEach(visit);
  return flat;
}

function typeMatches(record: Record<string, unknown>, type: string): boolean {
  const value = record["@type"];
  if (typeof value === "string") return value === type;
  if (Array.isArray(value)) return value.includes(type);
  return false;
}

function textOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "name" in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>).name || "");
  }
  return "";
}

export function extractRichResultBlocks(objects: unknown[]): RichResultBlock[] {
  const records = flattenGraph(objects);
  const blocks: RichResultBlock[] = [];

  for (const record of records) {
    if (typeMatches(record, "FAQPage")) {
      const data: FaqPreview = asArray(record.mainEntity as any)
        .map((question: any) => ({
          question: textOf(question?.name),
          answer: textOf(question?.acceptedAnswer?.text || question?.acceptedAnswer),
        }))
        .filter((item) => item.question);
      if (data.length) blocks.push({ type: "FAQPage", data });
    }

    if (typeMatches(record, "HowTo")) {
      const steps = asArray(record.step as any).map((step: any) => ({
        name: textOf(step?.name) || "Step",
        text: textOf(step?.text),
      }));
      blocks.push({ type: "HowTo", data: { name: textOf(record.name), steps } });
    }

    if (typeMatches(record, "BreadcrumbList")) {
      const items = asArray(record.itemListElement as any)
        .sort((a: any, b: any) => (a?.position || 0) - (b?.position || 0))
        .map((item: any) => textOf(item?.name || item?.item));
      const data: BreadcrumbPreview = items.filter(Boolean);
      if (data.length) blocks.push({ type: "BreadcrumbList", data });
    }

    if (typeMatches(record, "Article") || typeMatches(record, "BlogPosting") || typeMatches(record, "NewsArticle")) {
      const data: ArticlePreview = {
        headline: textOf(record.headline) || textOf(record.name),
        author: textOf(record.author),
        datePublished: textOf(record.datePublished),
      };
      if (data.headline) blocks.push({ type: "Article", data });
    }

    const rating = (record.aggregateRating as any) || (typeMatches(record, "AggregateRating") ? record : null);
    if (rating && (rating.ratingValue || rating.reviewCount)) {
      const data: RatingPreview = {
        ratingValue: rating.ratingValue ? Number(rating.ratingValue) : null,
        reviewCount: rating.reviewCount ? Number(rating.reviewCount) : rating.ratingCount ? Number(rating.ratingCount) : null,
        itemName: textOf(record.name) || textOf((record.itemReviewed as any)?.name),
      };
      blocks.push({ type: typeMatches(record, "AggregateRating") ? "AggregateRating" : "Review", data });
    }

    if (typeMatches(record, "Product")) {
      const offers = Array.isArray(record.offers) ? record.offers[0] : record.offers;
      const data: ProductPreview = {
        name: textOf(record.name),
        price: (offers as any)?.price ? String((offers as any).price) : null,
        currency: (offers as any)?.priceCurrency || null,
        availability: (offers as any)?.availability ? String((offers as any).availability).split("/").pop() || null : null,
        ratingValue: (record.aggregateRating as any)?.ratingValue ? Number((record.aggregateRating as any).ratingValue) : null,
        reviewCount: (record.aggregateRating as any)?.reviewCount ? Number((record.aggregateRating as any).reviewCount) : null,
      };
      if (data.name) blocks.push({ type: "Product", data });
    }

    if (typeMatches(record, "Recipe")) {
      const data: RecipePreview = {
        name: textOf(record.name),
        totalTime: record.totalTime ? String(record.totalTime) : null,
        ratingValue: (record.aggregateRating as any)?.ratingValue ? Number((record.aggregateRating as any).ratingValue) : null,
        reviewCount: (record.aggregateRating as any)?.reviewCount ? Number((record.aggregateRating as any).reviewCount) : null,
      };
      if (data.name) blocks.push({ type: "Recipe", data });
    }

    if (typeMatches(record, "Event")) {
      const location = record.location as any;
      const data: EventPreview = {
        name: textOf(record.name),
        startDate: record.startDate ? String(record.startDate) : null,
        location: textOf(location?.name) || (typeof location === "string" ? location : null),
      };
      if (data.name) blocks.push({ type: "Event", data });
    }
  }

  return blocks;
}
