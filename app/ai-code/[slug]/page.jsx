// app/ai-tools/[slug]/page.jsx
import { client } from "@/sanity/lib/client";
import { PageCacheProvider } from '@/React_Query_Caching/CacheProvider';
import PageCacheStatusButton from "@/React_Query_Caching/PageCacheStatusButton";
import CodingChildComp from "./code";
import { urlForImage } from "@/sanity/lib/image";

export const revalidate = false;
export const dynamic = "force-dynamic";

async function getData(slug) {
  const query = `*[_type == "coding" && slug.current == "${slug}"][0]`;
  try {
    const data = await client.fetch(query, {}, {
      cache: 'no-store',
      next: { tags: ['coding', slug] }
    });
    return data;
  } catch (error) {
    console.error(`Server-side fetch for slug ${slug} failed:`, error.message);
    // Return null instead of throwing - let client-side cache handle it
    return null;
  }
}

export default async function ParentPage({ params }) {
  // This might be null if server-side fetch failed (offline scenario)
  const serverData = await getData(params.slug);
  
  return (
    <PageCacheProvider pageType="ai-code-article" pageId={params.slug}>
      <PageCacheStatusButton />
      <section>
        <CodingChildComp 
          serverData={serverData} 
          params={params}
          // Remove this line - we'll handle it better in the child component
          // serverFetchFailed={serverData === null}
        />
      </section>
    </PageCacheProvider>
  );
}