// app/free-ai-resources/page.jsx

import React from 'react';
import Script from "next/script";
import { NextSeo } from "next-seo";

import { redisHelpers } from '@/app/lib/redis';
import { client } from "@/sanity/lib/client";

// NEW IMPORT for the wrapper component
import StaticFreeResourcePageShell from "./StaticFreeResourcePageShell";
import Allblogs from "./AllBlogs"; // The client component that needs initial data
import Head from 'next/head';

export const revalidate = 3600; // Revalidate every 1 hour

// Enhanced utility functions
function getBaseUrl() {
  // For production, always use your custom domain
  if (process.env.NODE_ENV === 'production') {
    return 'https://doitwithai.tools';  // Remove trailing slash
  }
  
  // For development
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return 'http://localhost:3000';
}

function generateOGImageURL(params) {
  const baseURL = `${getBaseUrl()}/api/og`;
  const searchParams = new URLSearchParams(params);
  return `${baseURL}?${searchParams.toString()}`;
}

export const metadata = {
  title: "Free AI Resources: Tools, Templates & Prompts | doitwithai.tools",
  description: "Access a massive collection of free AI tools, prompts, and templates. Supercharge your productivity and projects with our zero-cost, high-quality resources.",
  author: "Sufian Mustafa",
  keywords: "free AI resources, free AI images, AI prompts, AI solutions, free AI templates, AI for productivity, AI tools free",
  openGraph: {
    title: "Free AI Resources: Tools, Templates & Prompts | doitwithai.tools",
    description: "Your ultimate collection of high-quality AI tools, templates, prompts, and guides to kickstart your AI journey and solve real-world problems.",
    url: `${getBaseUrl()}/free-ai-resources`,
    type: "website",
    images: [{
      url: generateOGImageURL({
        title: 'Access our massive collection of free AI tools, prompts, and templates to supercharge your projects.',
        // description field is removed
        category: 'Free AI Resources',
        ctaText: 'Download Free Resources Now',
        features: 'Zero Cost,High Quality,Instant Access',
        bgColor: 'green'
      }),
      width: 1200,
      height: 630,
      alt: 'Free AI Resources',
    }],
    siteName: "doitwithai.tools",
    locale: 'en_US',
  },
  twitter: {
    card: "summary_large_image",
    domain: "doitwithai.tools",
    url: `${getBaseUrl()}/free-ai-resources`,
    title: "Free AI Resources: Tools, Templates & Prompts | doitwithai.tools",
    description: "Supercharge your projects with a massive collection of high-quality, zero-cost AI tools, prompts, and templates.",
    image: generateOGImageURL({
      title: 'Access our massive collection of free AI tools, prompts, and templates to supercharge your projects.',
      // description field is removed
      category: 'Free AI Resources',
      ctaText: 'Download Free Resources Now',
      features: 'Zero Cost,High Quality,Instant Access',
      bgColor: 'green'
    }),
    creator: "@doitwithai",
  },
  alternates: {
    canonical: `${getBaseUrl()}/free-ai-resources`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const INITIAL_RESOURCE_LIST_LIMIT = 6;

// --- Server-side data fetching function ---
async function getFreeResourcesInitialData() {
  const cacheKey = 'freeResources:initialPageData'; // Unique key for this page's combined data
  const startTime = Date.now();

  try {
    const cachedData = await redisHelpers.get(cacheKey);
    if (cachedData) {
      console.log(`[Redis Cache Hit] for ${cacheKey} in ${Date.now() - startTime}ms`);
      return { ...cachedData, __source: 'server-redis' };
    }
  } catch (redisError) {
    console.error(`Redis error for ${cacheKey}:`, redisError.message);
    // Continue to fetch from Sanity if Redis fails
  }

  console.log(`[Sanity Fetch] for ${cacheKey} starting...`);

  // 1. Query for the featured resource
  const featuredResourceQuery = `*[_type == "freeResources" && isOwnPageFeature == true] | order(publishedAt desc)[0] {
  _id,
  title,
  slug,
  tags,
  mainImage,
  overview,
  resourceType,
  resourceFormat,
  resourceLink,
  resourceLinkType,
  previewSettings,
  "resourceFile": resourceFile.asset->,
  content,
  publishedAt,
  promptContent,
  "relatedArticle": relatedArticle-> {
    title,
    slug,
    _type,
    tags,
    excerpt
  },
  aiToolDetails,
  seoTitle,
  seoDescription,
  seoKeywords,
  altText,
  structuredData
}`;

  // 2. Query for resource counts by format
  const countsQuery = `{
    "all": count(*[_type == "freeResources"]),
    "image": count(*[_type == "freeResources" && resourceFormat == "image"]),
    "video": count(*[_type == "freeResources" && resourceFormat == "video"]),
    "text": count(*[_type == "freeResources" && resourceFormat == "text"]),
    "document": count(*[_type == "freeResources" && resourceFormat == "document"]),
    "aitool": count(*[_type == "freeResources" && resourceFormat == "aitool"])
  }`;

  // 3. Query for the first page of the resource list
 const listQuery = `*[_type == "freeResources"] | order(publishedAt desc)[0...${INITIAL_RESOURCE_LIST_LIMIT + 1}] {
  _id,
  title,
  slug,
  tags,
  mainImage,
  overview,
  resourceType,
  resourceFormat,
  resourceLink,
  resourceLinkType,
  previewSettings,
  "resourceFile": resourceFile.asset->,
  content,
  publishedAt,
  promptContent,
  "relatedArticle": relatedArticle-> {
    title,
    slug,
    _type,
    tags,
    excerpt
  },
  aiToolDetails,
  seoTitle,
  seoDescription,
  seoKeywords,
  altText,
  structuredData
}`;
  try {
    const [featuredResource, resourceCounts, resourceList] = await Promise.all([
      client.fetch(featuredResourceQuery, {}, { next: { tags: ["freeResources"] } }),
      client.fetch(countsQuery, {}, { next: { tags: ["freeResources"] } }),
      client.fetch(listQuery, {}, { next: { tags: ["freeResources"] } })
    ]);

    const data = {
      featuredResource,
      resourceCounts,
      resourceList,
      timestamp: Date.now()
    };

    console.log(`[Sanity Fetch] for ${cacheKey} completed in ${Date.now() - startTime}ms`);

    if (data.resourceList?.length > 0 || data.featuredResource || Object.keys(data.resourceCounts).length > 0) { // Only cache if we actually got some data
      try {
        await redisHelpers.set(cacheKey, data, { ex: 3600 }); // Cache for 1 hour
        console.log(`[Redis Cache Set] for ${cacheKey}`);
      } catch (redisSetError) {
        console.error(`Redis set error for ${cacheKey}:`, redisSetError.message);
      }
    }

    return { ...data, __source: 'server-network' };
  } catch (error) {
    console.error(`Server-side fetch for Free AI Resources page failed:`, error.message);
    return null; // Return null on error
  }
}

export default async function Page() {
  const initialServerData = await getFreeResourcesInitialData();

  function schemaMarkup(pageMetadata) {
    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": pageMetadata.title,
        "description": pageMetadata.description,
        "url": pageMetadata.openGraph.url,
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": `${getBaseUrl()}/`
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Free AI Resources",
              "item": `${getBaseUrl()}/free-ai-resources`
            }
          ]
        },
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": initialServerData?.resourceCounts?.all || 0,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "CreativeWork",
                "name": "AI Resources Collection",
                "description": "Collection of free AI resources including images, videos, prompts and documents"
              }
            }
          ]
        },
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "USD",
          "price": "0",
          "availability": "https://schema.org/InStock",
          "offerCount": initialServerData?.resourceCounts?.all || 0
        }
      })
    };
  }

  return (
    <>
    <Head>
      <NextSeo
        title={metadata.title}
        description={metadata.description}
        canonical={metadata.alternates.canonical}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: metadata.openGraph.url,
          siteName: metadata.openGraph.siteName,
          title: metadata.openGraph.title,
          description: metadata.openGraph.description,
          images: metadata.openGraph.images,
        }}
        twitter={{
          card: metadata.twitter.card,
          site: metadata.twitter.creator,
          creator: metadata.twitter.creator,
          title: metadata.twitter.title,
          description: metadata.twitter.description,
          image: metadata.twitter.image,
        }}
        additionalMetaTags={[
          { name: 'keywords', content: metadata.keywords },
          { name: 'author', content: metadata.author },
          { name: 'robots', content: 'index, follow' },
          {
            name: 'googlebot',
            content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
          },
          {
            name: 'theme-color',
            content: '#2563eb'
          },
          {
            name: 'application-name',
            content: 'doitwithai.tools'
          },
          {
            name: 'msapplication-TileColor',
            content: '#2563eb'
          },
          {
            name: 'apple-mobile-web-app-capable',
            content: 'yes'
          },
          {
            name: 'apple-mobile-web-app-status-bar-style',
            content: 'black-translucent'
          }
        ]}
      />
         </Head>

      <Script
        id="FreeResourcesSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaMarkup(metadata)}
        key="FreeResources-jsonld"
        strategy="beforeInteractive"
      />

      {/* Wrap Allblogs with the new StaticFreeResourcePageShell */}
      <StaticFreeResourcePageShell>
        <Allblogs initialServerData={initialServerData} />
      </StaticFreeResourcePageShell>
    </>
  );
}