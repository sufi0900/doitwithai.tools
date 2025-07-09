// app/ai-code/[slug]/page.jsx

import { PageCacheProvider } from '@/React_Query_Caching/CacheProvider';
import ArticleChildComp from "@/app/ai-code/[slug]/code";
import SeoAndSchemaWrapper from "@/app/ai-code/[slug]/SeoAndSchemaWrapper";
import ArticleMicrodata from "@/app/ai-code/[slug]/ArticleMicrodata";
import { getArticleData, generatePageMetadata, getAllArticleSlugs } from "@/app/ai-code/[slug]/articleData"; // Import getAllArticleSlugs

// --- Revalidation ---
export const revalidate = 3600;

// --- Data Fetching (now using reusable utility) ---
async function getData(slug) {
  // Use the reusable function, specifying the schema type "coding" for this page
  return getArticleData(slug, "coding");
}

// --- generateStaticParams ---
// This function tells Next.js which [slug] paths to pre-render at build time.
export async function generateStaticParams() {
  // You need a way to get all possible slugs for your articles.
  // This likely involves fetching all article IDs/slugs from your data source (e.g., Sanity).
  // Assuming you have a utility function like 'getAllArticleSlugs' in your articleData.js
  const slugs = await getAllArticleSlugs("coding"); // You might need to pass the schema type or filter here

  return slugs.map((slug) => ({
    slug: slug,
  }));
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