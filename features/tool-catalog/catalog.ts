import registry from "./registry.json";

export const categories = registry.categories;
export const tools = registry.tools.filter((tool) => tool.status === "live");
export type CatalogTool = (typeof tools)[number];
export const toolPath = (slug: string) => `/tools/${slug}`;
export const categoryPath = (slug: string) => `/tools/categories/${slug}`;
export const siteOrigin = "https://doitwithai.tools";
export const featuredTools = tools.filter((tool) => tool.featuredOrder != null);

export function collectionSchema(name: string, path: string, items: CatalogTool[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: `${siteOrigin}${path}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: "Home", path: "" },
        { name: "Tools", path: "/tools" },
        ...(path.startsWith("/tools/categories") ? [{ name: "Categories", path: "/tools/categories" }] : []),
        ...(path.startsWith("/tools/categories/") ? [{ name, path }] : []),
      ].map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: `${siteOrigin}${item.path}` })),
    },
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
