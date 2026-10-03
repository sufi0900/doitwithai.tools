import registry from "./registry.json";

export const categories = registry.categories;
export const tools = registry.tools.filter((tool) => tool.status === "live");
export type CatalogTool = (typeof tools)[number];
export const toolPath = (slug: string) => `/tools/${slug}`;
export const categoryPath = (slug: string) => `/tools/categories/${slug}`;
export const siteOrigin = "https://doitwithai.tools";

export function collectionSchema(name: string, path: string, items: CatalogTool[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: `${siteOrigin}${path}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.name,
        url: `${siteOrigin}${toolPath(tool.slug)}`,
      })),
    },
  };
}
