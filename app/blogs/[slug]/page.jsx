import ArticleTools from "@/features/tool-catalog/ArticleTools";
import { notFound } from "next/navigation";
import { PageCacheProvider } from "@/React_Query_Caching/CacheProvider";
import ArticleChildComp from "@/features/articles/legacy/ArticleChildComp";
import ArticleMicrodata from "@/features/articles/legacy/ArticleMicrodata";
import SeoAndSchemaWrapper from "@/features/articles/legacy/SeoAndSchemaWrapper";
import {
  generatePageMetadata,
  getAllArticleSlugs,
  getArticleData,
} from "@/features/articles/legacy/articleData";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs("blogPost");
  return slugs.map(({ slug }) => ({ slug }));
}

const getData = (slug) => getArticleData(slug, "blogPost", "blogPost");

export async function generateMetadata({ params }) {
  const data = await getData(params.slug);
  return generatePageMetadata(data, params, "blogs", "AI, Technology & Productivity");
}

export default async function BlogPostPage({ params }) {
  const data = await getData(params.slug);
  if (!data) notFound();

  return <>
    <SeoAndSchemaWrapper
      data={data}
      params={params}
      schemaType="blogPost"
      basePath="blogs"
      articleSection="AI, Technology & Productivity"
      category="AI, Technology & Productivity"
    />
    <PageCacheProvider pageType="blogPost" pageId={params.slug}>
      <main role="main" itemScope itemType="https://schema.org/Article">
        <ArticleMicrodata data={data} />
        <ArticleChildComp serverData={data} params={params} schemaType="blogPost" />
        <ArticleTools slugs={data.relatedToolSlugs} />
      </main>
    </PageCacheProvider>
  </>;
}
