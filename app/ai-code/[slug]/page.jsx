// app/ai-code/[slug]/page.jsx

import { getAllArticleSlugs } from "@/app/ai-code/[slug]/articleData";

import { PageCacheProvider } from '@/React_Query_Caching/CacheProvider';
import ArticleChildComp from "@/app/ai-code/[slug]/ArticleChildComp";
import SeoAndSchemaWrapper from "@/app/ai-code/[slug]/SeoAndSchemaWrapper"; // NEW IMPORT


import ArticleMicrodata from "@/app/ai-code/[slug]/ArticleMicrodata"; // New microdata component
import { getArticleData, generatePageMetadata } from "@/app/ai-code/[slug]/articleData"; // New utility functions

// --- Revalidation ---
export const revalidate = 3600;



export async function generateStaticParams() {
  // Fetch all slugs for the "coding" schema type
  const slugs = await getAllArticleSlugs("coding");

  // Map the array of objects to the format Next.js expects: [{ slug: '...' }, { slug: '...' }]
  return slugs.map((item) => ({
    slug: item.slug,
  }));
}

// --- Data Fetching (now using reusable utility) ---
async function getData(slug) {
  // Use the reusable function, specifying the schema type "coding" for this page
  return getArticleData(slug, "coding");
}

// --- Metadata Generation (now using reusable utility) ---
export async function generateMetadata({ params }) {
  const data = await getData(params.slug);
  // Use the reusable function, passing the base path and category specific to "AI in Coding & Development"
  return generatePageMetadata(data, params, "ai-code", "AI in Coding & Development");
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
        schemaType="coding" // Indicate the schema type for this page
        basePath="ai-code" // Pass the base path for canonical URLs
        articleSection="AI in Coding & Development" // Specific section for schema/OG
        category="AI in Coding & Development" // Specific category for meta tags
      />

      {/* Page Content Provider */}
      <PageCacheProvider pageType={data?._type || 'coding'} pageId={params.slug}>
        {/* Main Content Area */}
        <main role="main" itemScope itemType="https://schema.org/Article">
          {/* Microdata properties (reusable component) */}
          <ArticleMicrodata data={data} />

          {/* The actual client component that renders the article content */}
          <ArticleChildComp serverData={data} params={params} schemaType="coding" />
        </main>
      </PageCacheProvider>
    </>
  );
}