// app/free-ai-resources/page.jsx

import React from 'react';
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";

import { redisHelpers } from '@/app/lib/redis';
import { client } from "@/sanity/lib/client";

// NEW IMPORT for the wrapper component
import StaticFreeResourcePageShell from "./StaticFreeResourcePageShell"; // <--- ADD THIS IMPORT
import Allblogs from "./AllBlogs"; // The client component that needs initial data

export const revalidate = 3600; // Revalidate every 1 hour

export const metadata = {
  title: "Free AI Resources & Solution - DoItWithAI.Tools", // Updated title for consistency
  description: "Explore free AI resources to boost your creativity & productivity. Discover AI solutions for various problems. Download free AI images and find prompts.",
  author: "Sufian Mustafa",
  openGraph: {
    title: "Free AI Resources & Solution - DoItWithAI.Tools", // Updated title for consistency
    description: "Explore free AI resources to boost your creativity & productivity. Discover AI solutions for various problems. Download free AI images and find prompts.",
    url: "https://www.doitwithai.tools/free-ai-resources", // Corrected URL
    type: "website",
    images: [{
      url: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg',
      width: 1200, // Standard size for OpenGraph
      height: 630, // Standard size for OpenGraph
      alt: 'Free AI Resources',
    }],
    siteName: "AiToolTrend",
    locale: 'en_US',
  },
  twitter: {
    card: "summary_large_image",
    domain: "doitwithai.tools",
    url: "https://www.doitwithai.tools/free-ai-resources", // Corrected URL
    title: "Free AI Resources & Solution - DoItWithAI.Tools", // Updated title for consistency
    description: "Explore free AI resources to boost your creativity & productivity. Discover AI solutions for various problems. Download free AI images and find prompts.",
    image: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg',
  },
  alternates: {
    canonical: "https://www.doitwithai.tools/free-ai-resources", // Corrected URL
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
  const featuredResourceQuery = `*[_type=="freeResources"&&isOwnPageFeature==true]|order(publishedAt desc)[0]{
    _id,title,slug,tags,mainImage,overview,resourceType,resourceFormat,resourceLink,resourceLinkType,
    previewSettings,"resourceFile":resourceFile.asset->,content,publishedAt,promptContent,
    "relatedArticle":relatedArticle->{title,slug},aiToolDetails,seoTitle,seoDescription,seoKeywords,altText,structuredData
  }`;

  // 2. Query for resource counts by format
  const countsQuery = `{
    "all":count(*[_type=="freeResources"]),
    "image":count(*[_type=="freeResources"&&resourceFormat=="image"]),
    "video":count(*[_type=="freeResources"&&resourceFormat=="video"]),
    "text":count(*[_type=="freeResources"&&resourceFormat=="text"]),
    "document":count(*[_type=="freeResources"&&resourceFormat=="document"]),
    "aitool":count(*[_type=="freeResources"&&resourceFormat=="aitool"])
  }`;

  // 3. Query for the first page of the resource list
  const listQuery = `*[_type=="freeResources"]|order(publishedAt desc)[0...${INITIAL_RESOURCE_LIST_LIMIT + 1}]{
    _id,title,slug,tags,mainImage,overview,resourceType,resourceFormat,resourceLink,resourceLinkType,
    previewSettings,"resourceFile":resourceFile.asset->,content,publishedAt,promptContent,
    "relatedArticle":relatedArticle->{title,slug},aiToolDetails,seoTitle,seoDescription,seoKeywords,altText,structuredData
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

  // Update your grandparent page schema to include hasOfferCatalog
  function schemaMarkup(pageMetadata) { // Accept pageMetadata
    return {
      __html: `{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "${pageMetadata.title}", // Use dynamic title
        "description": "${pageMetadata.description}", // Use dynamic description
        "url": "${pageMetadata.openGraph.url}", // Use dynamic URL
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://www.doitwithai.tools/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Free AI Resources",
              "item": "https://www.doitwithai.tools/free-ai-resources"
            }
          ]
        },
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": ${initialServerData?.resourceCounts?.all || 0}, // Use actual total count
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
          "offerCount": ${initialServerData?.resourceCounts?.all || 0} // Use actual total count
        }
      }`
    };
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:site_name" content={metadata.openGraph.siteName} />
        <meta property="og:locale" content={metadata.openGraph.locale} />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="author" content={metadata.author} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} /> {/* Corrected to array access */}
        <meta property="og:image:width" content={metadata.openGraph.images[0].width} /> {/* Corrected */}
        <meta property="og:image:height" content={metadata.openGraph.images[0].height} /> {/* Corrected */}
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:type" content={metadata.openGraph.type} />
        <meta name="twitter:card" content={metadata.twitter.card} />
        <meta property="twitter:domain" content={metadata.twitter.domain} />
        <meta property="twitter:url" content={metadata.twitter.url} />
        <meta name="twitter:title" content={metadata.twitter.title} />
        <meta name="twitter:description" content={metadata.twitter.description} />
        <meta name="twitter:image" content={metadata.twitter.image} />
        <link rel="canonical" href={metadata.alternates.canonical} />
        <NextSeo
          title={metadata.title}
          description={metadata.description}
          author={metadata.author}
          type="website"
          locale='en_IE'
          site_name={metadata.openGraph.siteName}
          canonical={metadata.alternates.canonical}
          openGraph={{
            title: metadata.openGraph.title,
            description: metadata.openGraph.description,
            url: metadata.openGraph.url,
            type: "ItemList",
            images: metadata.openGraph.images
          }}
        />
      </Head>

      <Script
        id="FreeResourcesSchema" // Changed ID to be more specific
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaMarkup(metadata)} // Pass metadata here
        key="FreeResources-jsonld" // Changed key
      />

      {/* Wrap Allblogs with the new StaticFreeResourcePageShell */}
      <StaticFreeResourcePageShell>
        <Allblogs initialServerData={initialServerData} />
      </StaticFreeResourcePageShell>
    </>
  );
}