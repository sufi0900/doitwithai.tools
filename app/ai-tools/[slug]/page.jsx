/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import { PageCacheProvider } from "@/React_Query_Caching/CacheProvider";
import AiToolSlugPageCode from "./code";
import { client } from "@/sanity/lib/client";


export const revalidate = false;
export const dynamic = "force-dynamic";

async function getData(slug) {
   const query = `*[_type == "aitool" && slug.current == "${slug}"][0]`;
   console.log(`[Server] Attempting to fetch data for slug: ${slug}`); // ADD THIS
  const data = await client.fetch(query, {});
  console.log(`[Server] Data fetched for ${slug}: ${data ? 'SUCCESS' : 'NOT FOUND'}`); // ADD THIS
  if (data) {
      console.log(`[Server] Data title: ${data.title}`); 
  }
  return data;
}

export default async function ParentPage({ params }) {
  const data = await getData(params.slug);

  if (!data) {
    console.warn(`[Server] No data found for slug: ${params.slug}. Rendering 404.`); // ADD THIS
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-600">The AI tool you're looking for doesn't exist.</p>
      </div>
    );
  }

  // Removed: metadata generation here. If you need it, pass it to a client component
  // or define it in a separate layout file using Next.js 13+ metadata API.
  // Removed: imageUrl - can be handled by BlogLayout/CardComponent directly using data.mainImage

  return (
    <PageCacheProvider pageType={data._type} pageId={data.slug.current}>
        <AiToolSlugPageCode data={data} params={params} />
    </PageCacheProvider>
  );
}