// app/ai-tools/[slug]/page.jsx

import { PageCacheProvider } from '@/React_Query_Caching/CacheProvider';
import ArticleChildComp from "@/app/ai-code/[slug]/ArticleChildComp";
import SeoAndSchemaWrapper from "@/app/ai-code/[slug]/SeoAndSchemaWrapper"; // NEW IMPORT
import { getAllArticleSlugs } from "@/app/ai-code/[slug]/articleData";


import ArticleMicrodata from "@/app/ai-code/[slug]/ArticleMicrodata"; // New microdata component
import { getArticleData, generatePageMetadata } from "@/app/ai-code/[slug]/articleData"; // New utility functions

// --- Revalidation ---
export const revalidate = 7200; // Revalidate every 1 hour

export async function generateStaticParams() {
  // Fetch all slugs for the "coding" schema type
  const slugs = await getAllArticleSlugs("aitool");

  // Map the array of objects to the format Next.js expects: [{ slug: '...' }, { slug: '...' }]
  return slugs.map((item) => ({
    slug: item.slug,
  }));
}



// --- Data Fetching (now using reusable utility) ---
async function getData(slug) {
  // Use the reusable function, specifying the schema type for this page
  // The 'aitool' schema type is crucial here for correct data fetching.
  return getArticleData(slug, "aitool");
}

// --- Metadata Generation (now using reusable utility) ---
export async function generateMetadata({ params }) {
  const data = await getData(params.slug);
  // Use the reusable function, passing the base path and category specific to AI Tools
  return generatePageMetadata(data, params, "ai-tools", "AI Tools & Resources");
}

// --- Main Page Component ---
export default async function ParentPage({ params }) {
  const data = await getData(params.slug); // This might be null if server fetch fails

  return (
    <>

      {/* SEO and Schema Tags (reusable component) */}
      {/* Pass the correct props specific to 'aitool' */}
      <SeoAndSchemaWrapper
        data={data}
        params={params}
        schemaType="aitool" // IMPORTANT: This tells the wrapper to generate AI Tool specific schema
        basePath="ai-tools" // IMPORTANT: This is for canonical URLs, breadcrumbs, etc.
        articleSection="AI Tools & Resources" // Specific section name for schema/OG
        category="AI Tools & Resources" // Specific category for meta tags
      />

      {/* Page Content Provider */}
      <PageCacheProvider pageType={data?._type || 'aitool'} pageId={params.slug}>
        {/* Main Content Area */}
        <main role="main" itemScope itemType="https://schema.org/Article">
          {/* Microdata properties (reusable component) */}
          <ArticleMicrodata data={data} />

          {/* The actual client component that renders the article content */}
          {/* Ensure this component can handle data specific to 'aitool' */}
          <ArticleChildComp serverData={data} params={params} schemaType="aitool" />
        </main>
      </PageCacheProvider>
    </>
  );
}