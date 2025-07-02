// app/ai-seo/page.jsx
import React from 'react';
import Script from "next/script";
import Head from "next/head"; // Note: For App Router, `metadata` export is preferred.
import { NextSeo } from "next-seo"; // NextSeo is for Pages Router, ensure it's still needed/used with App Router.

import BlogListingPageContent from "@/app/ai-tools/AllBlogs"; // Import the new reusable component
import ReusableCachedSEOSubcategories from "@/app/ai-tools/ReusableCachedSEOSubcategories"; // Keep this specific import

// --- NEW IMPORTS ---
import { client } from "@/sanity/lib/client"; // Import Sanity client
import { redisHelpers } from '@/app/lib/redis'; // Import Redis helpers
// --- END NEW IMPORTS ---

// --- Next.js Server-Side Configuration ---
export const revalidate = 3600; // Revalidate every 1 hour

async function getSeoListData() {
  const cacheKey = 'list:seo'; // A unique key for this specific list

  try {
    const cachedData = await redisHelpers.get(cacheKey);
    if (cachedData) {
      console.log(`[Redis Cache Hit] for listing page: ${cacheKey}`);
      return cachedData; // Data is already parsed by Upstash SDK
    }
  } catch (redisError) {
    console.error(`Error accessing Redis for listing page ${cacheKey}:`, redisError);
    // Continue to fetch from Sanity if Redis fails
  }

  console.log(`[Sanity Fetch] for listing page: ${cacheKey}`);
  // Sanity query to fetch all necessary data for the SEO listing cards
  // --- CORRECTED SANITY QUERY _TYPE ---
  const query = `*[_type == "seo"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    mainImage{asset->{_id,url},alt},
    publishedAt,
    overview,
    _updatedAt,
    _createdAt,
    _type,
    metatitle,
    metadesc,
    schematitle,
    schemadesc,
    // Add any other fields needed for your listing cards
  }`;

  try {
    const data = await client.fetch(query, {}, {
      // Use the 'seo' tag so that when individual 'seo' documents are updated,
      // this list cache can also be revalidated by the webhook.
      // --- CORRECTED NEXT.JS CACHE TAG ---
      next: { tags: ['seo'] }
    });

    if (data) {
      try {
        await redisHelpers.set(cacheKey, data, { ex: 3600 }); // Cache for 1 hour
        console.log(`[Redis Cache Set] for listing page: ${cacheKey}`);
      } catch (redisSetError) {
        console.error(`Error setting Redis cache for listing page ${cacheKey}:`, redisSetError);
      }
    }
    return data;
  } catch (error) {
    console.error(`Server-side fetch for AI SEO listing failed:`, error.message); // Adjusted log message
    return []; // Return empty array on error to prevent page crash
  }
}


// --- SEO Metadata (Next.js App Router Standard) ---
export const metadata = {
  title: "AI in SEO & Digital Marketing - DoItWithAI.Tools",
  description: "AI is revolutionizing how we approach SEO and digital marketing, making it smarter, faster, and more effective! In our blog, you'll find the knowledge and tools necessary to successfully integrate AI into your SEO and marketing strategies.",
  author: "Sufian Mustafa",
  openGraph: {
    title: "AI in SEO & Digital Marketing - DoItWithAI.Tools",
    description: "AI is revolutionizing how we approach SEO and digital marketing, making it smarter, faster, and more effective! In our blog, you'll find the knowledge and tools necessary to successfully integrate AI into your SEO and marketing strategies.",
    url: "https://www.doitwithai.tools/ai-seo", // Correct URL for this page
    type: "website",
    images: [{
      url: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg', // Use a relevant image for SEO
      width: 1200,
      height: 630,
      alt: 'AI in SEO & Digital Marketing',
    }],
    siteName: "AiToolTrend",
    locale: 'en_US',
  },
  twitter: {
    card: "summary_large_image",
    domain: "doitwithai.tools",
    url: "https://www.doitwithai.tools/ai-seo", // Correct URL for this page
    title: "AI in SEO & Digital Marketing - DoItWithAI.Tools",
    description: "AI is revolutionizing how we approach SEO and digital marketing, making it smarter, faster, and more effective! In our blog, you'll find the knowledge and tools necessary to successfully integrate AI into your SEO and marketing strategies.",
    image: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg', // Use a relevant image for SEO
  },
  alternates: {
    canonical: "https://www.doitwithai.tools/ai-seo",
  },
};

export default async function Page() { // Make this an async component to await data
  const seoListData = await getSeoListData(); // Fetch data here

  // Define schema-specific data for the AI SEO page
  const schemaType = "seo"; // Sanity schema type
  const pageSlugPrefix = "ai-seo"; // URL prefix for this category
  const pageTitle = "SEO Insights";
  const pageTitleHighlight = "SEO Insights";
  const pageDescription = "Stay ahead of the curve with our latest AI-powered SEO strategies and insights.";

  const breadcrumbProps = {
    pageName: "AI in SEO",
    pageName2: "& Digital Marketing",
    description: "AI is revolutionizing how we approach SEO and digital marketing, making it smarter, faster, and more effective! In our blog, you'll find the knowledge and tools necessary to successfully integrate AI into your SEO and marketing strategies. Learn how ChatGPT and other AI tools can help generate quality content, conduct keyword research, and craft data-driven campaigns. Our practical guides help you improve rankings, target the right audience, and navigate the evolving digital landscape with confidence.",
    firstlinktext: "Home",
    firstlink: "/",
    link: "/ai-seo",
    linktext: "seo-with-ai",
  };

  // Schema Markup for AI SEO CollectionPage
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
      <BlogListingPageContent
        schemaType={schemaType}
        pageSlugPrefix={pageSlugPrefix}
        pageTitle={pageTitle}
        pageTitleHighlight={pageTitleHighlight}
        pageDescription={pageDescription}
        breadcrumbProps={breadcrumbProps}
        // Props for the unique subcategories section
        showSubcategoriesSection={true} // Enable the section
        subcategoriesSectionTitle="SubCategories"
        subcategoriesSectionDescription="of SEO"
        SubcategoriesComponent={ReusableCachedSEOSubcategories} // Pass the specific component
        subcategoriesLimit={2} // Pass the limit as a prop
        serverData={seoListData} 
      />
    </>
  );
}
