import type { PageSnapshot } from "@/features/on-page-analyzer/types";
export type SchemaSource = { field: string; label: string; raw: string };
export type SchemaIssue = {
  severity: "error" | "warning" | "info";
  path: string;
  message: string;
};
export type SchemaItem = {
  key: string;
  source: SchemaSource;
  path: string;
  types: string[];
  name: string;
  id: string;
  nested: boolean;
  covered: boolean;
  issues: SchemaIssue[];
  properties: [string, unknown][];
};
export type SchemaInspection = {
  items: SchemaItem[];
  syntax: { source: SchemaSource; error: string }[];
  documents: SchemaSource[];
  errors: number;
  warnings: number;
  types: string[];
  limited: boolean;
};
export const RULES_DATE = "2026-10-22";
export const FIELD_PROFILES: Record<string, string[]> = {
  Article: ["headline", "author", "image", "datePublished", "dateModified"],
  NewsArticle: ["headline", "author", "image", "datePublished", "dateModified"],
  BlogPosting: ["headline", "author", "image", "datePublished", "dateModified"],
  TechArticle: ["headline", "author", "image", "datePublished", "dateModified"],
  WebPage: ["name", "url"],
  WebSite: ["name", "url"],
  Organization: ["name", "url"],
  Person: ["name"],
  BreadcrumbList: ["itemListElement"],
  ItemList: ["itemListElement"],
  ListItem: ["position"],
  FAQPage: ["mainEntity"],
  Question: ["name", "acceptedAnswer"],
  Answer: ["text"],
  ImageObject: ["contentUrl"],
  Product: ["name"],
  Offer: ["price", "priceCurrency"],
  AggregateRating: ["ratingValue"],
  Review: ["author", "reviewRating"],
  VideoObject: ["name", "thumbnailUrl", "uploadDate"],
  SoftwareApplication: ["name"],
};
const shortType = (s: string) => s.replace(/^https?:\/\/schema.org\//, "");
export function schemaSources(schema: PageSnapshot["schemas"]): SchemaSource[] {
  return [
    ...schema.samples.map((raw, i) => ({
      field: `schema:${i}`,
      label: `JSON-LD source ${i + 1}`,
      raw,
    })),
    ...(schema.invalidSamples || []).map((s, i) => ({
      field: `schema-invalid:${i}`,
      label: `Unparsed JSON-LD source ${s.block}`,
      raw: s.raw,
    })),
  ];
}
export function inspectSchemas(documents: SchemaSource[]): SchemaInspection {
  const items: SchemaItem[] = [],
    syntax: SchemaInspection["syntax"] = [],
    ids = new Map<string, Record<string, unknown>>();
  const parsed: { source: SchemaSource; value: unknown }[] = [];
  let visited = 0,
    limited = false;
  for (const source of documents.slice(0, 40)) {
    if (source.raw.length > 150000) {
      syntax.push({
        source,
        error: "This source exceeds the 150,000-character inspection limit.",
      });
      limited = true;
      continue;
    }
    try {
      const value = JSON.parse(source.raw);
      if (!value || typeof value !== "object")
        throw new Error(
          "JSON-LD must contain an object or an array of objects.",
        );
      parsed.push({ source, value });
    } catch (e) {
      syntax.push({
        source,
        error: e instanceof Error ? e.message.slice(0, 300) : "Invalid JSON.",
      });
    }
  }
  const index = (v: unknown, depth = 0) => {
    if (!v || typeof v !== "object" || depth > 20 || visited++ > 10000) {
      if (depth > 20 || visited > 10000) limited = true;
      return;
    }
    if (Array.isArray(v)) {
      v.slice(0, 300).forEach((x) => index(x, depth + 1));
      if (v.length > 300) limited = true;
      return;
    }
    const obj = v as Record<string, unknown>;
    if (
      typeof obj["@id"] === "string" &&
      Object.keys(obj).some((k) => k !== "@id")
    )
      ids.set(obj["@id"], { ...ids.get(obj["@id"]), ...obj });
    Object.values(obj)
      .slice(0, 150)
      .forEach((x) => index(x, depth + 1));
  };
  parsed.forEach((p) => index(p.value));
  const valuePresent = (v: unknown) =>
    v !== null &&
    v !== undefined &&
    v !== "" &&
    (!Array.isArray(v) || v.length > 0);
  const seenIds = new Set<string>();
  visited = 0;
  const visit = (
    value: unknown,
    source: SchemaSource,
    path: string,
    depth: number,
    parentTyped: boolean,
    hasContext: boolean,
  ) => {
    if (!value || typeof value !== "object") return;
    if (depth > 20 || visited++ > 10000 || items.length >= 300) {
      limited = true;
      return;
    }
    if (Array.isArray(value)) {
      value
        .slice(0, 300)
        .forEach((v, i) =>
          visit(v, source, `${path}[${i}]`, depth + 1, parentTyped, hasContext),
        );
      return;
    }
    const obj = value as Record<string, unknown>,
      rawTypes = Array.isArray(obj["@type"]) ? obj["@type"] : [obj["@type"]];
    const types = rawTypes
      .filter((t): t is string => typeof t === "string")
      .map(shortType);
    const context = obj["@context"] ?? (hasContext ? "inherited" : undefined),
      issues: SchemaIssue[] = [];
    const id = typeof obj["@id"] === "string" ? obj["@id"] : "";
    const resolved = id ? { ...ids.get(id), ...obj } : obj;
    const add = (
      severity: SchemaIssue["severity"],
      key: string,
      message: string,
    ) =>
      issues.push({
        severity,
        path: `${path}${key ? "." + key : ""}`,
        message,
      });
    if (types.length) {
      if (!context)
        add(
          "warning",
          "@context",
          "No inherited or local context found. Confirm how vocabulary terms are expanded.",
        );
      if (rawTypes.some((t) => typeof t !== "string"))
        add("error", "@type", "Every type must be a string.");
      const known = types.filter((t) => FIELD_PROFILES[t]);
      if (!known.length)
        add(
          "info",
          "@type",
          "Type detected. Type-specific field checks are not covered by this validator.",
        );
      const recommendations = new Set(known.flatMap((t) => FIELD_PROFILES[t]));
      for (const property of recommendations)
        if (!valuePresent(resolved[property]))
          add(
            "warning",
            property,
            `${property} was not found. Review whether it applies to this item; these are profile recommendations.`,
          );
      if (id && seenIds.has(id))
        add(
          "info",
          "@id",
          "This identifier is also defined elsewhere. Definitions can intentionally describe the same entity.",
        );
      if (id) seenIds.add(id);
      for (const property of [
        "name",
        "headline",
        "description",
        "text",
        "priceCurrency",
      ])
        if (
          valuePresent(resolved[property]) &&
          typeof resolved[property] !== "string" &&
          !Array.isArray(resolved[property]) &&
          typeof resolved[property] !== "object"
        )
          add(
            "warning",
            property,
            `${property} usually contains text. Review this value's type.`,
          );
      for (const property of ["datePublished", "dateModified", "uploadDate"]) {
        const date = resolved[property];
        if (!valuePresent(date)) continue;
        const valid =
          typeof date === "string" &&
          /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(date) &&
          !Number.isNaN(Date.parse(date)) &&
          new Date(date.slice(0, 10)).toISOString().slice(0, 10) ===
            date.slice(0, 10);
        if (!valid)
          add(
            "error",
            property,
            "Use a real ISO 8601 date or date-time, such as 2026-10-22 or 2026-10-22T09:00:00+05:00.",
          );
      }
      if (
        typeof resolved.datePublished === "string" &&
        typeof resolved.dateModified === "string" &&
        Date.parse(resolved.dateModified) < Date.parse(resolved.datePublished)
      )
        add(
          "warning",
          "dateModified",
          "The modification date is earlier than the publication date. Confirm the timeline.",
        );
      if (
        valuePresent(resolved.isAccessibleForFree) &&
        typeof resolved.isAccessibleForFree !== "boolean"
      )
        add(
          "warning",
          "isAccessibleForFree",
          "Use a JSON boolean, true or false, rather than a quoted label.",
        );
      for (const property of ["url", "sameAs", "contentUrl", "thumbnailUrl"]) {
        const v = resolved[property];
        if (!valuePresent(v)) continue;
        for (const item of Array.isArray(v) ? v : [v])
          if (typeof item === "string" && !/^https?:\/\/[^\s]+$/i.test(item))
            add(
              "warning",
              property,
              "Review this URL. Prefer an absolute public http or https URL for interoperable markup.",
            );
      }
      for (const property of ["author", "publisher"]) {
        const v = resolved[property];
        if (!v) continue;
        for (const entity of Array.isArray(v) ? v : [v]) {
          if (!entity || typeof entity !== "object") continue;
          const object = entity as Record<string, unknown>,
            reference =
              typeof object["@id"] === "string" ? ids.get(object["@id"]) : null;
          if (!valuePresent(object.name) && !valuePresent(reference?.name))
            add(
              "warning",
              property,
              "No name was found on this entity or its local reference. A definition may exist elsewhere.",
            );
        }
      }
      if (types.includes("BreadcrumbList")) {
        const entries = resolved.itemListElement;
        if (Array.isArray(entries))
          entries.forEach((entry, i) => {
            if (!entry || typeof entry !== "object") {
              add(
                "warning",
                `itemListElement[${i}]`,
                "Review this breadcrumb item structure.",
              );
              return;
            }
            const e = entry as Record<string, unknown>;
            if (!(
              typeof e.position === "number" &&
              Number.isInteger(e.position) &&
              e.position > 0
            ))
              add(
                "warning",
                `itemListElement[${i}].position`,
                "Use a positive integer position for this breadcrumb.",
              );
            if (!valuePresent(e.name))
              add(
                "warning",
                `itemListElement[${i}].name`,
                "Add a descriptive breadcrumb name.",
              );
            if (i < entries.length - 1 && !valuePresent(e.item))
              add(
                "warning",
                `itemListElement[${i}].item`,
                "Check the destination for this breadcrumb. The final breadcrumb can omit item.",
              );
          });
      }
      if (types.includes("AggregateRating")) {
        const n = Number(resolved.ratingValue),
          low =
            resolved.worstRating === undefined
              ? 1
              : Number(resolved.worstRating),
          high =
            resolved.bestRating === undefined ? 5 : Number(resolved.bestRating);
        if (
          valuePresent(resolved.ratingValue) &&
          (!Number.isFinite(n) || n < low || n > high)
        )
          add(
            "error",
            "ratingValue",
            "The rating value must fit the declared rating range.",
          );
      }
      const props = Object.entries(resolved)
        .filter(([k]) => k !== "@context")
        .slice(0, 60);
      items.push({
        key: `${source.field}:${path}`,
        source,
        path,
        types,
        id,
        name:
          typeof resolved.name === "string"
            ? resolved.name
            : typeof resolved.headline === "string"
              ? resolved.headline
              : "",
        nested: parentTyped,
        covered: known.length > 0,
        issues,
        properties: props,
      });
    } else if (Object.prototype.hasOwnProperty.call(obj, "@type")) {
      syntax.push({
        source,
        error: `${path}.@type must be a string or an array of strings.`,
      });
    }
    for (const [key, child] of Object.entries(obj).slice(0, 150))
      if (key !== "@context")
        visit(
          child,
          source,
          `${path}.${key}`,
          depth + 1,
          parentTyped || types.length > 0,
          Boolean(context),
        );
  };
  parsed.forEach(({ value, source }) =>
    visit(value, source, "$", 0, false, false),
  );
  return {
    items,
    syntax,
    documents,
    errors:
      syntax.length +
      items.reduce(
        (n, i) => n + i.issues.filter((x) => x.severity === "error").length,
        0,
      ),
    warnings: items.reduce(
      (n, i) => n + i.issues.filter((x) => x.severity === "warning").length,
      0,
    ),
    types: [...new Set(items.flatMap((i) => i.types))],
    limited,
  };
}
export function authorsFromSchemas(schema: PageSnapshot["schemas"]) {
  const report = inspectSchemas(schemaSources(schema));
  const authors: { name: string; id: string; url: unknown }[] = [];
  for (const item of report.items) {
    const author = item.properties.find(([key]) => key === "author")?.[1];
    if (!author) continue;
    for (const value of Array.isArray(author) ? author : [author]) {
      if (typeof value === "string") {
        authors.push({ name: value, id: "", url: undefined });
        continue;
      }
      if (!value || typeof value !== "object") continue;
      const obj = value as Record<string, unknown>,
        id = typeof obj["@id"] === "string" ? obj["@id"] : "",
        definition = report.items.find((i) => i.id === id);
      authors.push({
        name: typeof obj.name === "string" ? obj.name : definition?.name || "",
        id,
        url: obj.url || definition?.properties.find(([k]) => k === "url")?.[1],
      });
    }
  }
  return authors
    .filter(
      (a, i) =>
        (a.name || a.id) &&
        authors.findIndex((b) => b.name === a.name && b.id === a.id) === i,
    )
    .slice(0, 20);
}
