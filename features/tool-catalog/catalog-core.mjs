/**
 * @param {Array<any>} items
 * @param {{query?: string, category?: string, selected?: string, sort?: string}} options
 */
export function findTools(items, { query = "", category, selected = "all", sort = "featured" } = {}) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const matches = items.filter((tool) => {
    const text = [tool.name, tool.description, ...tool.tags, ...tool.categories].join(" ").toLocaleLowerCase();
    return (!category || tool.categories.includes(category)) &&
      (selected === "all" || tool.categories.includes(selected)) &&
      words.every((word) => text.includes(word));
  });
  return matches.sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "recent") return b.addedAt.localeCompare(a.addedAt) || a.name.localeCompare(b.name);
    return (a.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (b.featuredOrder ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name);
  });
}

export function safeContentHref(value) {
  if (typeof value !== "string") return undefined;
  if (/[\\\u0000-\u0020]/.test(value)) return undefined;
  if (/^\/(?!\/)/.test(value) || /^#[a-z0-9_-]+$/i.test(value)) return value;
  try {
    const url = new URL(value);
    return ["https:", "http:", "mailto:", "tel:"].includes(url.protocol) ? value : undefined;
  } catch {
    return undefined;
  }
}
