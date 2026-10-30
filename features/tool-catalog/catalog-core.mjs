/**
 * @param {Array<any>} items
 * @param {{query?: string, category?: string, selected?: string, sort?: string}} options
 */
export function findTools(
  items,
  { query = "", category, selected = "all", sort = "featured" } = {},
) {
  const normalize = (value) =>
    value
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const synonyms = {
    faq: "faq",
    pagespeed: "core web vitals",
    crux: "core web vitals",
    readability: "readability",
    gsc: "gsc",
    headings: "heading",
    sitemap: "sitemap",
    schema: "schema",
    opengraph: "og",
    twitter: "twitter",
  };
  const words = normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((word) => (synonyms[word] || word).split(" "));
  const matches = items.filter((tool) => {
    const text = normalize(
      [tool.name, tool.description, ...tool.tags, ...tool.categories].join(" "),
    );
    return (
      (!category || tool.categories.includes(category)) &&
      (selected === "all" || tool.categories.includes(selected)) &&
      words.every((word) => text.includes(word))
    );
  });
  return matches.sort((a, b) => {
    if (words.length) {
      const score = (tool) =>
        words.reduce(
          (total, word) =>
            total +
            (normalize(tool.name).includes(word)
              ? 5
              : normalize(tool.tags.join(" ")).includes(word)
                ? 2
                : 1),
          0,
        );
      const difference = score(b) - score(a);
      if (difference) return difference;
    }
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "recent")
      return b.addedAt.localeCompare(a.addedAt) || a.name.localeCompare(b.name);
    return (
      (a.featuredOrder ?? Number.MAX_SAFE_INTEGER) -
        (b.featuredOrder ?? Number.MAX_SAFE_INTEGER) ||
      a.name.localeCompare(b.name)
    );
  });
}

export function safeContentHref(value) {
  if (typeof value !== "string") return undefined;
  if (/[\\\u0000-\u0020]/.test(value)) return undefined;
  if (/^\/(?!\/)/.test(value) || /^#[a-z0-9_-]+$/i.test(value)) return value;
  try {
    const url = new URL(value);
    return ["https:", "http:", "mailto:", "tel:"].includes(url.protocol)
      ? value
      : undefined;
  } catch {
    return undefined;
  }
}
