import "server-only";
import { client } from "@/sanity/lib/client";
import { homepage } from "./content";

export type HomeArticle = {
  _id: string;
  title: string;
  slug: string;
  overview?: string;
  image?: string;
  imageAlt?: string;
};
export type HomeResource = {
  _id: string;
  title: string;
  overview?: string;
  format?: string;
  image?: string;
  imageAlt?: string;
  prompt?: string;
  href?: string;
  action: string;
};

const publicClient = client.withConfig({
  useCdn: false,
  perspective: "published",
  timeout: 10000,
});
const imageProjection = `"image":mainImage.asset->url,"imageAlt":mainImage.alt`;
const articlesQuery = `*[_type=="seo" && !(_id in path("drafts.**")) && defined(slug.current)]|order(publishedAt desc)[0...30]{_id,title,"slug":slug.current,overview,${imageProjection}}`;
const resourcesQuery = `*[_type=="freeResources" && !(_id in path("drafts.**"))]|order(isHomePageFeature desc,publishedAt desc)[0...18]{_id,title,overview,"format":resourceFormat,${imageProjection},"file":resourceFile.asset->url,resourceLink,promptContent}`;

function safeUrl(value: unknown) {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
function plainText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value))
    return value
      .map((block) =>
        block?.promptText
          ? `${block.promptTitle || "Prompt"}\n${block.promptText}`
          : block?.children?.map((child) => child.text || "").join("") || "",
      )
      .join("\n\n");
  return "";
}
export async function getHomepageData() {
  const results = await Promise.allSettled([
    publicClient.fetch<HomeArticle[]>(
      articlesQuery,
      {},
      { next: { revalidate: 600, tags: ["homepage", "seo"] } },
    ),
    publicClient.fetch(
      resourcesQuery,
      {},
      { next: { revalidate: 600, tags: ["homepage", "freeResource"] } },
    ),
  ]);
  const articles: HomeArticle[] =
    results[0].status === "fulfilled" ? results[0].value : [];
  const unique = Array.from(
    new Map(
      articles.filter((a) => a.title && a.slug).map((a) => [a.slug, a]),
    ).values(),
  );
  const selectedArticles = [...unique]
    .sort((a, b) => {
      const rank = (slug: string) => {
        const i = homepage.learningSlugs.indexOf(slug);
        return i === -1 ? 99 : i;
      };
      return rank(a.slug) - rank(b.slug);
    })
    .slice(0, 3);
  const candidates = results[1].status === "fulfilled" ? results[1].value : [];
  const resources: HomeResource[] = candidates
    .map((r) => {
      const prompt = plainText(r.promptContent).trim();
      const file = safeUrl(r.file),
        link = safeUrl(r.resourceLink),
        image =
          safeUrl(r.image) ||
          (r.format === "image" ? safeUrl(r.file) : undefined);
      const href = file || link || image;
      if (!prompt && !href) return null;
      return {
        _id: r._id,
        title: r.title,
        overview: prompt
          ? "Explore this prompt pack and adapt the instructions to your task. Review the output for accuracy and meaning."
          : "Explore this learning resource, review its ideas, and use it alongside the related guides.",
        format: r.format,
        image,
        imageAlt: r.imageAlt,
        prompt: prompt || undefined,
        href,
        action: prompt
          ? "View prompt"
          : file
            ? "Download file"
            : link
              ? "Visit resource"
              : "View resource",
      };
    })
    .filter(Boolean);
  // Prefer a mix of usable formats instead of repeating the same visual resource.
  const selected: HomeResource[] = [];
  for (const r of resources)
    if (!selected.some((item) => item.format === r.format)) selected.push(r);
  for (const r of resources)
    if (!selected.some((item) => item._id === r._id)) selected.push(r);
  return {
    articles: selectedArticles,
    workflowArticles: unique.map(({ title, slug }) => ({ title, slug })),
    resources: selected.slice(0, 3),
  };
}
