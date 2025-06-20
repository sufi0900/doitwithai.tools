
import ChildComp from "./code";

import { client } from "@/sanity/lib/client";
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";
export const revalidate = false;
export const dynamic = "force-dynamic";
import { urlForImage } from "@/sanity/lib/image";
import ArticleRefreshButton from "./ArticleRefreshButton";
import { ArticleCacheProvider } from "./ArticleCacheContext";
import { CacheStatusProvider } from "./CacheStatusProvider";

async function getData(slug) {
  const query = `*[_type=="makemoney" && slug.current=="${slug}"][0]`;
  
  try {
    // First try with Next.js cache enabled for offline support
    const data = await client.fetch(query, {}, { 
      cache: 'force-cache', // Enable Next.js caching
      next: { 
        tags: ['makemoney', slug],
        revalidate: 300 // Revalidate every 5 minutes
      } 
    });
    return data;
  } catch (error) {
    console.error('Error fetching data in getData:', error);
    
    // Fallback: Try without cache options (in case of cache issues)
    try {
      const fallbackData = await client.fetch(query, {});
      return fallbackData;
    } catch (fallbackError) {
      console.error('Fallback fetch also failed:', fallbackError);
      return null;
    }
  }
}

export async function generateMetadata({ params }) {
    const slug = params.slug;
    const articleData = await getData(slug);
    if (!articleData) {
        return {
            title: "Article Not Found",
            description: "The requested article could not be found.",
        };
    }
    return {
        title: articleData.title,
        description: articleData.overview,
        // Add more SEO metadata as needed
    };
}

export default async function AitoolArticlePage({ params }) {
    const slug = params.slug;
    const data = await getData(slug);

    if (!data) {
        return (
            <section className="min-h-screen flex items-center justify-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Article Not Found</h1>
            </section>
        );
    }

    // Determine the schemaType from the fetched data
  const currentPostType = data?._type || 'makemoney'; // Provide fallback

    return (
        // Wrap with CacheStatusProvider for global network status
        <CacheStatusProvider>
            {/* Wrap ChildCompdata with ArticleCacheProvider */}
            <ArticleCacheProvider schemaType={currentPostType}>
                <section>
                    <ChildComp data={data} params={params} />
                </section>
            </ArticleCacheProvider>
        </CacheStatusProvider>
    );
}