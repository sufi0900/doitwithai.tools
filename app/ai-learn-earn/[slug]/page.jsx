// app/ai-learn-earn/[slug]/page.jsx

import { getAllArticleSlugs } from "@/app/ai-code/[slug]/articleData";

import { PageCacheProvider } from '@/React_Query_Caching/CacheProvider';
import ArticleChildComp from "@/app/ai-code/[slug]/ArticleChildComp";
import SeoAndSchemaWrapper from "@/app/ai-code/[slug]/SeoAndSchemaWrapper"; // NEW IMPORT


import ArticleMicrodata from "@/app/ai-code/[slug]/ArticleMicrodata"; // New microdata component
import { getArticleData, generatePageMetadata } from "@/app/ai-code/[slug]/articleData"; // New utility functions

// --- Revalidation ---
export const revalidate = 7200;


export async function generateStaticParams() {
  // Fetch all slugs for the "coding" schema type
  const slugs = await getAllArticleSlugs("makemoney");

  // Map the array of objects to the format Next.js expects: [{ slug: '...' }, { slug: '...' }]
  return slugs.map((item) => ({
    slug: item.slug,
  }));
}



// --- Data Fetching (using reusable utility) ---
async function getData(slug) {
  // Use the reusable getArticleData, specifying the 'makemoney' schema type
  return getArticleData(slug, "makemoney");
}

// --- Metadata Generation (using reusable utility) ---
export async function generateMetadata({ params }) {
  const data = await getData(params.slug);
  // Use the reusable generatePageMetadata, passing base path and category for this page
  return generatePageMetadata(data, params, "ai-learn-earn", "AI in Learn & Earn");
}

// --- Main Page Component ---
export default async function ParentPage({ params }) {
  const data = await getData(params.slug); // This might be null if server fetch fails

  return (
    <>
      {/* SEO and Schema Tags (reusable component) */}
      <SeoAndSchemaWrapper
        data={data}
        params={params}
        schemaType="makemoney" // Specify the schema type for this page
        basePath="ai-learn-earn" // Specify the base path for canonical URLs and breadcrumbs
        articleSection="AI in Learn & Earn" // Specific section text for schema/OG
        category="AI in Learn & Earn"       // Specific category text for meta tags
      />

      {/* Page Content Provider */}
      <PageCacheProvider pageType={data?._type || 'makemoney'} pageId={params.slug}>
        {/* Main Content Area */}
        <main role="main" itemScope itemType="https://schema.org/Article">
          {/* Microdata properties (reusable component) */}
          <ArticleMicrodata data={data} />

          {/* The actual client component that renders the article content */}
          <ArticleChildComp serverData={data} params={params} schemaType="makemoney" />
        </main>
      </PageCacheProvider>
    </>
  );
}