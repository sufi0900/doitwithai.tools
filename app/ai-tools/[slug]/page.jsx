// app/ai-tools/[slug]/page.jsx
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import { client } from "@/sanity/lib/client";
import { PageCacheProvider } from '@/React_Query_Caching/CacheProvider'; // Re-added!
import PageCacheStatusButton from "@/React_Query_Caching/PageCacheStatusButton"; // Re-added!
import ArticleChildComp from "@/app/ai-code/[slug]/code"; // Import the new reusable component
import { urlForImage } from "@/sanity/lib/image"; // For image URLs in metadata/schema
import Script from "next/script"; // For JSON-LD schema scripts
import Head from "next/head"; // For additional meta tags not covered by `metadata` export
import { NextSeo } from "next-seo"; // For NextSeo component (if still desired, though `metadata` is preferred in App Router)
import { redisHelpers } from '@/app/lib/redis'; // <--- UPDATED IMPORT: Use the helpers

// Enable Incremental Static Regeneration (ISR)
export const revalidate = 3600; // Revalidate every 1 hour

async function getData(slug) {
  const cacheKey = `article:aitool:${slug}`;
  
  try {
    // Use the helper function instead of manual JSON.parse
    const cachedData = await redisHelpers.get(cacheKey);
    if (cachedData) {
      return cachedData; // Already parsed by Upstash
    }
  } catch (redisError) {
    console.error(`Error accessing Redis for ${cacheKey}:`, redisError);
  }

  console.log(`[Sanity Fetch] for ${cacheKey}`);
  const query = `*[_type == "aitool" && slug.current == "${slug}"][0]{
    _id,
    title,
    slug,
    mainImage{
      asset->{
        _id,
        url
      },
      alt
    },
    publishedAt,
    _updatedAt,
    _createdAt,
    _type,
    metatitle,
    metadesc,
    schematitle,
    schemadesc,
    overview,
    content[]{
      ...,
      _type == "image" => {
        asset->{
          _id,
          url
        },
        alt,
        caption,
        imageDescription[]{
          ...
        }
      },
      _type == "gif" => {
        asset->{
          _id,
          url
        },
        alt,
        caption
      },
      _type == "video" => {
        asset->{
          _id,
          url
        },
        alt,
        caption
      },
    },
    "wordCount": length(pt::text(content)),
    "estimatedReadingTime": round(length(pt::text(content)) / 250),
    "headings": content[_type == "block" && style in ["h1", "h2", "h3", "h4", "h5", "h6"]]{
      "text": pt::text(@),
      "level": style,
      "anchor": lower(pt::text(@))
    },
    faqs[]{
      question,
      answer
    },
    articleType,
    displaySettings
  }`;

  try {
    const data = await client.fetch(query, {}, { next: { tags: ['aitool', slug] } });
    
    if (data) {
      try {
        // Use the helper function instead of manual JSON.stringify
        await redisHelpers.set(cacheKey, data, { ex: 3600 });
      } catch (redisSetError) {
        console.error(`Error setting Redis cache for ${cacheKey}:`, redisSetError);
      }
    }
    
    return data;
  } catch (error) {
    console.error(`Server-side fetch for slug ${slug} failed:`, error.message);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const data = await getData(params.slug);
  
  if (!data) {
    return {
      title: 'Page Not Found | DoItWithAI.tools',
      description: 'The requested AI tool page was not found.',
    };
  }
  
  const imageUrl = data.mainImage ? urlForImage(data.mainImage).url() : null;
  const canonicalUrl = `https://www.doitwithai.tools/ai-tools/${params.slug}`;
  
  return {
    title: `${data.metatitle}`,
    description: data.metadesc,
    keywords: data.tags?.map(tag => tag.name).join(',') || '',
    authors: [{ name: "Sufian Mustafa", url: "https://www.doitwithai.tools/author/sufian-mustafa" }],
    creator: "Sufian Mustafa",
    publisher: "DoItWithAI.tools",
    category: 'AI Tools',
    classification: 'Technology',
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      title: data.metatitle,
      description: data.metadesc,
      url: canonicalUrl,
      siteName: 'DoItWithAI.tools',
      locale: 'en_US',
      images: imageUrl ? [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: data.mainImage?.alt || data.metatitle,
        type: 'image/jpeg',
      }] : [],
      publishedTime: data.publishedAt,
      modifiedTime: data._updatedAt,
      section: 'AI Tools',
      tags: data.tags?.map(tag => tag.name) || [],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@doitwithai',
      creator: '@sufianmustafa',
      title: data.metatitle,
      description: data.metadesc,
      images: imageUrl ? [imageUrl] : [],
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
  };
}

export default async function ParentPage({ params }) {
  const data = await getData(params.slug);
  
  if (!data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-600">The AI tool you're looking for doesn't exist.</p>
      </div>
    );
  }
  
  const canonicalUrl = `https://www.doitwithai.tools/ai-tools/${params.slug}`;
  const imageUrl = data.mainImage ? urlForImage(data.mainImage).url() : null;
  const readingTime = Math.ceil((data.wordCount || 1000) / 250);
  
  return (
    <>
      <PageCacheProvider>
        <main>
          <ArticleChildComp serverData={data} params={params} schemaType="aitool" />
        </main>
      </PageCacheProvider>
    </>
  );
}