// app/ai-tools/page.jsx
import React from 'react';
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";
import {redisHelpers} from '@/app/lib/redis';
import { client } from "@/sanity/lib/client";

import BlogListingPageContent from "@/app/ai-tools/AllBlogs"; // Import the new reusable component
import { PageCacheProvider } from '@/React_Query_Caching/CacheProvider';

// --- Next.js Server-Side Configuration ---
export const revalidate = 3600; // Revalidate every 1 hour

// --- REMOVED: getAiToolsListData function ---
// This data fetching function is now redundant as BlogListingPageContent and its children
// will handle their own data fetching via useSanityCache (which will be Redis-backed).

// --- SEO Metadata (Next.js App Router Standard) ---
// This metadata object is directly used by Next.js for head tags.
// It is NOT directly accessible as a variable within the component's scope.
export const metadata = {
  title: "Best AI Tools for Productivity - DoItWithAI.Tools",
  description: "Explore a comprehensive list of blogs on the Best AI Tools for Productivity (Freemium), providing detailed reviews of the top artificial intelligence solutions.",
  author: "Sufian Mustafa",
  openGraph: {
    title: "Best AI Tools for Productivity - DoItWithAI.Tools",
    description: "Explore a comprehensive list of blogs on the Best AI Tools for Productivity (Freemium), providing detailed reviews of the top artificial intelligence solutions.",
    url: "https://www.doitwithai.tools/ai-tools",
    type: "website", // Or "CollectionPage" if schema supports it directly
    images: [{
      url: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg',
      width: 1200,
      height: 630,
      alt: 'Best AI Tools for Productivity',
    }],
    siteName: "AiToolTrend",
    locale: 'en_US',
  },
  twitter: {
    card: "summary_large_image",
    domain: "doitwithai.tools",
    url: "https://www.doitwithai.tools/ai-tools",
    title: "Best AI Tools for Productivity - DoItWithAI.Tools",
    description: "Explore a comprehensive list of blogs on the Best AI Tools for Productivity (Freemium), providing detailed reviews of the top artificial intelligence solutions.",
    image: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg',
  },
  alternates: {
    canonical: "https://www.doitwithai.tools/ai-tools",
  },
};

// --- REMOVED: generateMetadata is now static as it no longer depends on fetched data ---
// export async function generateMetadata() { ... }
async function getData(schemaType, pageSlugPrefix) {
  const cacheKey = `blogList:${schemaType}:main`;
  const startTime = Date.now();
  
  try {
    const cachedData = await redisHelpers.get(cacheKey);
    if (cachedData) {
      console.log(`[Redis Cache Hit] for ${cacheKey} in ${Date.now() - startTime}ms`);
      return { ...cachedData, __source: 'server-redis' };
    }
  } catch (redisError) {
    console.error(`Redis error for ${cacheKey}:`, redisError.message);
  }

  console.log(`[Sanity Fetch] for ${cacheKey} starting...`);
  
  // Fetch initial data for the page
  const featuresQuery = `*[_type=="${schemaType}" && displaySettings.isOwnPageFeature==true][0]`;
  const firstPageBlogsQuery = `*[_type=="${schemaType}"] | order(publishedAt desc)[0...6]`; // 6 items (5 + 1 for hasMore check)
  const totalCountQuery = `count(*[_type=="${schemaType}"])`;
  
  try {
    const [featuredPost, firstPageBlogs, totalCount] = await Promise.all([
      client.fetch(featuresQuery, {}, { next: { tags: [schemaType] } }),
      client.fetch(firstPageBlogsQuery, {}, { next: { tags: [schemaType] } }),
      client.fetch(totalCountQuery, {}, { next: { tags: [schemaType] } })
    ]);
    
    const data = {
      featuredPost,
      firstPageBlogs,
      totalCount,
      timestamp: Date.now()
    };
    
    console.log(`[Sanity Fetch] for ${cacheKey} completed in ${Date.now() - startTime}ms`);
    
    try {
      await redisHelpers.set(cacheKey, data, { ex: 3600 });
      console.log(`[Redis Cache Set] for ${cacheKey}`);
    } catch (redisSetError) {
      console.error(`Redis set error for ${cacheKey}:`, redisSetError.message);
    }
    
    return { ...data, __source: 'server-network' };
  } catch (error) {
    console.error(`Server-side fetch for ${schemaType} failed:`, error.message);
    return null;
  }
}
export default async function Page() { // Changed back to a regular function as it no longer awaits data

  // Define schema-specific data for the AI Tools page
  const schemaType = "aitool"; // Sanity schema type
  const pageSlugPrefix = "ai-tools"; // URL prefix for this category
  const pageTitle = "AI Tools";
  const pageTitleHighlight = "AI Tools";
  const pageDescription = "Explore the newest and most effective AI tools to boost your productivity.";


  const serverData = await getData(schemaType, pageSlugPrefix);



  const breadcrumbProps = {
    pageName: "Best AI Tools",
    pageName2: "for Productivity",
    description: "Unlock the power of AI to enhance productivity and creativity like never before!! In this category, we review the best freemium AI tools designed to streamline tasks and boost SEO. Discover smart solutions that transform your workflow, whether you're a digital marketer, SEO professional, or curious beginner. Our insights help you work smarter, save time, and elevate your project with cutting-edge AI technology.",
    firstlinktext: "Home",
    firstlink: "/",
    link: "/ai-tools",
    linktext: "ai-tools",
  };

  // Schema Markup for AI Tools CollectionPage
  // --- FIX: Pass the module-level metadata object as an argument ---
  function schemaMarkup(pageMetadata, breadcrumbProps) {
    return {
      __html: `
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "${pageMetadata.title}",
          "description": "${pageMetadata.description}",
          "url": "${pageMetadata.openGraph.url}",
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
                "name": "${breadcrumbProps.pageName}",
                "item": "${breadcrumbProps.link}"
              }
            ]
          }
        }
      `
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
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta property="og:image:width" content={metadata.openGraph.images[0].width} />
        <meta property="og:image:height" content={metadata.openGraph.images[0].height} />
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
        id="BreadcrumbListSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaMarkup(metadata, breadcrumbProps)} // Pass metadata here
        key={`${pageSlugPrefix}-jsonld`}
      />
        <PageCacheProvider pageType={schemaType} pageId="main">

    <BlogListingPageContent
        schemaType={schemaType}
        pageSlugPrefix={pageSlugPrefix}
        pageTitle={pageTitle}
        pageTitleHighlight={pageTitleHighlight}
        pageDescription={pageDescription}
        breadcrumbProps={breadcrumbProps}
        serverData={serverData}  // Pass server data
      />
      </PageCacheProvider>
    </>
  );
}
