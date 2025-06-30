// app/ai-tools/[slug]/page.jsx
import { client } from "@/sanity/lib/client";
import { PageCacheProvider } from '@/React_Query_Caching/CacheProvider';
import PageCacheStatusButton from "@/React_Query_Caching/PageCacheStatusButton";
import ArticleChildComp from "./code"; // Import the new reusable component
import { urlForImage } from "@/sanity/lib/image"; // Keep if used elsewhere

// Enable Incremental Static Regeneration (ISR)
export const revalidate = 3600; // Revalidate every 1 hour

async function getData(slug) {
  // The schema type is now 'coding' for this specific page
  const query = `*[_type=="coding"&&slug.current=="${slug}"][0]`;
  try {
    const data = await client.fetch(query, {}, {
      next: {
        tags: ['coding', slug] // Keep tags for on-demand revalidation
      }
    });
    return data;
  } catch (error) {
    console.error(`Server-side fetch for slug ${slug} failed:`, error.message);
    return null;
  }
}

export default async function ParentPage({ params }) {
  const serverData = await getData(params.slug);

  return (
    <PageCacheProvider pageType="ai-code-article" pageId={params.slug}>
      <PageCacheStatusButton />
      <section>
        {/* Pass the specific schemaType for this page */}
        <ArticleChildComp serverData={serverData} params={params} schemaType="coding" />
      </section>
    </PageCacheProvider>
  );
}
