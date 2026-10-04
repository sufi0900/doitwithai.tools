import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AllBlogsAggregated from "@/features/blogs/BlogIndexClient";
import StaticBlogsPageShell from "@/features/blogs/BlogIndexShell";
import { LEGACY_BLOG_CATEGORIES } from "@/features/blogs/categoryConfig";
import { client } from "@/sanity/lib/client";

export const revalidate = 3600;
export const dynamicParams = true;

const PAGE_SIZE = 24;
const baseUrl = "https://doitwithai.tools";

async function getCategory(slug) {
  const legacy = LEGACY_BLOG_CATEGORIES[slug];
  if (legacy) return { ...legacy, slug, source: "legacy" };

  return client.fetch(
    `*[_type == "blogCategory" && slug.current == $slug][0]{title, description, "slug": slug.current}`,
    { slug },
    { next: { revalidate: 3600, tags: ["blogCategory", `blogCategory:${slug}`] } },
  );
}

async function getCategoryPageData(category) {
  const isLegacy = category.source === "legacy";
  const filter = isLegacy
    ? `_type == $schemaType`
    : `_type == "blogPost" && $categorySlug in categories[]->slug.current`;
  const params = isLegacy
    ? { schemaType: category.key }
    : { categorySlug: category.slug };

  const postProjection = `{
    formattedDate,
    tags,
    readTime,
    _id,
    _type,
    title,
    slug,
    mainImage,
    overview,
    body,
    content,
    publishedAt
  }`;

  const [firstPageBlogs, totalCount, blogCategories] = await Promise.all([
    client.fetch(
      `*[${filter}] | order(publishedAt desc)[0...${PAGE_SIZE}]${postProjection}`,
      params,
      { next: { revalidate: 3600, tags: ["blogPost", `blogCategory:${category.slug}`] } },
    ),
    client.fetch(`count(*[${filter}])`, params, {
      next: { revalidate: 3600, tags: ["blogPost", `blogCategory:${category.slug}`] },
    }),
    client.fetch(
      `*[_type == "blogCategory"] | order(title asc){title, description, "slug": slug.current}`,
      {},
      { next: { revalidate: 3600, tags: ["blogCategory"] } },
    ),
  ]);

  return { firstPageBlogs, totalCount, blogCategories, timestamp: Date.now() };
}

export async function generateStaticParams() {
  const dynamicSlugs = await client.fetch(`*[_type == "blogCategory" && defined(slug.current)]{"slug": slug.current}`);
  return dynamicSlugs;
}

export async function generateMetadata({ params }) {
  const category = await getCategory(params.slug);
  if (!category) return { title: "Blog category not found" };

  const title = `${category.title} Articles | Do It With AI Tools`;
  const description = category.description || `Explore the latest ${category.title} articles, tutorials, and practical guides.`;
  const canonical = `${baseUrl}/blogs/category/${category.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website", siteName: "Do It With AI Tools" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

export default async function BlogCategoryPage({ params }) {
  // The original four sections already have established, indexable listing
  // routes. Keep those canonical URLs instead of creating duplicate pages.
  if (LEGACY_BLOG_CATEGORIES[params.slug]) redirect(`/${params.slug}`);

  const category = await getCategory(params.slug);
  if (!category) notFound();

  const initialServerData = await getCategoryPageData(category);
  const initialCategory = category.source === "legacy"
    ? category.key
    : `blogCategory:${category.slug}`;
  const canonical = `${baseUrl}/blogs/category/${category.slug}`;
  const description = category.description || `Browse all ${category.title} articles, tutorials, and practical guides.`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.title} Articles`,
    description,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: "Do It With AI Tools", url: baseUrl },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
        { "@type": "ListItem", position: 2, name: "Blogs", item: `${baseUrl}/blogs` },
        { "@type": "ListItem", position: 3, name: category.title, item: canonical },
      ],
    },
  };

  return <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
    />
    <StaticBlogsPageShell
      initialServerData={initialServerData}
      title={category.title}
      description={description}
      categoryCount={4 + initialServerData.blogCategories.length}
    >
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-gray-600 dark:text-gray-300">
        <Link href="/">Home</Link><span aria-hidden="true"> / </span>
        <Link href="/blogs">Blogs</Link><span aria-hidden="true"> / </span>
        <span aria-current="page">{category.title}</span>
      </nav>
      <AllBlogsAggregated
        initialServerData={initialServerData}
        blogCategories={initialServerData.blogCategories}
        initialCategory={initialCategory}
        showSearch={false}
      />
    </StaticBlogsPageShell>
  </>;
}
