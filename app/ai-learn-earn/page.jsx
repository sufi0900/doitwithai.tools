// app/learn-earn/page.jsx
import React from 'react';
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";

// Import the new reusable component
import BlogListingPageContent from "@/app/ai-tools/AllBlogs";

// --- NEW IMPORT for StaticPageShell ---
import StaticPageShell from "@/app/ai-seo/StaticPageShell"; // <--- ADD THIS IMPORT

// --- NEW IMPORTS ---
import { client } from "@/sanity/lib/client"; // Import Sanity client
import { redisHelpers } from '@/app/lib/redis'; // Import Redis helpers
// --- END NEW IMPORTS ---

// --- Next.js Server-Side Configuration ---
export const revalidate = 3600; // Revalidate every 1 hour

// --- SEO Metadata (Next.js App Router Standard) ---
export const metadata = {
  title: "Make Money With AI - DoItWithAI.Tools",
  description: "Discover in-depth guides to learn how to make money with AI! Explore the best AI tools and unlock new earning opportunities online.",
  author: "Sufian Mustafa",
  openGraph: {
    title: "Make Money With AI - DoItWithAI.Tools",
    description: "Discover in-depth guides to learn how to make money with AI! Explore the best AI tools and unlock new earning opportunities online.",
    url: "https://www.doitwithai.tools/ai-learn-earn", // Correct URL for this page
    type: "website",
    images: [{
      url: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg', // Use a relevant image for money making
      width: 1200,
      height: 630,
      alt: 'Make Money With AI',
    }],
    siteName: "AiToolTrend",
    locale: 'en_US',
  },
  twitter: {
    card: "summary_large_image",
    domain: "doitwithai.tools",
    url: "https://www.doitwithai.tools/ai-learn-earn", // Correct URL for this page
    title: "Make Money With AI - DoItWithAI.Tools",
    description: "Discover in-depth guides to learn how to make money with AI! Explore the best AI tools and unlock new earning opportunities online.",
    image: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg', // Use a relevant image for money making
  },
  alternates: {
    canonical: "https://www.doitwithai.tools/ai-learn-earn", // Correct canonical URL
  },
};

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

export default async function Page() { // Make this an async component to await data

  // Define schema-specific data for the "Make Money With AI" page
  const schemaType = "makemoney"; // Sanity schema type
  const pageSlugPrefix = "ai-learn-earn"; // URL prefix for this category
  const pageTitle = "Money Making Strategies";
  const pageTitleHighlight = "Money Making Strategies";
  const pageDescription = "Stay updated with the newest ways to earn and grow your income online.";
  const serverData = await getData(schemaType, pageSlugPrefix);

  const breadcrumbProps = {
    pageName: "Make Money",
    pageName2: "Online",
    description: "Discover effective strategies and legitimate opportunities to earn money online. Our guides cover everything from freelancing and e-commerce to passive income streams, helping you navigate the digital landscape to achieve financial independence.",
    firstlinktext: "Home",
    firstlink: "/",
    link: "/ai-learn-earn", // Dynamic link using the defined prefix
    linktext: pageSlugPrefix, // Dynamic link text
  };

  // Schema Markup for "Make Money With AI" CollectionPage
  // --- FIX: Pass metadata and breadcrumbProps as arguments ---
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
        // --- FIX: Pass metadata and breadcrumbProps ---
        dangerouslySetInnerHTML={schemaMarkup(metadata, breadcrumbProps)}
        key={`${pageSlugPrefix}-jsonld`}
      />

     
      <StaticPageShell breadcrumbProps={breadcrumbProps}>
        <BlogListingPageContent
          schemaType={schemaType}
          pageSlugPrefix={pageSlugPrefix}
          pageTitle={pageTitle}
          pageTitleHighlight={pageTitleHighlight}
          pageDescription={pageDescription}
          serverData={serverData} // Still pass server data to BlogListingPageContent
        />
      </StaticPageShell>
      {/* --- END REPLACEMENT --- */}
    </>
  );
}