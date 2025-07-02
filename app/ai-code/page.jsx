// app/coding/page.jsx
import React from 'react';
import Script from "next/script";
import Head from "next/head"; // Note: For App Router, `metadata` export is preferred.
import { NextSeo } from "next-seo"; // NextSeo is for Pages Router, ensure it's still needed/used with App Router.

// Import the new reusable component
import BlogListingPageContent from "@/app/ai-tools/AllBlogs"; // Import the new reusable component

// --- NEW IMPORTS ---
import { client } from "@/sanity/lib/client"; // Import Sanity client
import { redisHelpers } from '@/app/lib/redis'; // Import Redis helpers
// --- END NEW IMPORTS ---

// --- Next.js Server-Side Configuration ---
export const revalidate = 3600; // Revalidate every 1 hour

async function getCodingListData() {
  // --- CORRECTED CACHE KEY ---
  const cacheKey = 'list:coding'; // A unique key for this specific list

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
  // Sanity query to fetch all necessary data for the "Coding" listing cards
  // --- CORRECTED SANITY QUERY _TYPE ---
  const query = `*[_type == "coding"] | order(publishedAt desc) {
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
      // Use the 'coding' tag so that when individual 'coding' documents are updated,
      // this list cache can also be revalidated by the webhook.
      // --- CORRECTED NEXT.JS CACHE TAG ---
      next: { tags: ['coding'] }
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
    console.error(`Server-side fetch for AI Coding listing failed:`, error.message); // Adjusted log message
    return []; // Return empty array on error to prevent page crash
  }
}


// --- SEO Metadata (Next.js App Router Standard) ---
export const metadata = {
  title: "Code With AI - DoItWithAI.Tools",
  description: "Build websites faster and smarter! Discover how AI tools can supercharge your coding with free templates and guides to improve & optimize code.",
  author: "Sufian Mustafa",
  openGraph: {
    title: "Code With AI - DoItWithAI.Tools",
    description: "Build websites faster and smarter! Discover how AI tools can supercharge your coding with free templates and guides to improve & optimize code.",
    url: "https://www.doitwithai.tools/ai-code", // Correct URL for this page
    type: "website",
    images: [{
      url: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg', // Use a relevant image for coding
      width: 1200,
      height: 630,
      alt: 'Code With AI',
    }],
    siteName: "AiToolTrend",
    locale: 'en_US',
  },
  twitter: {
    card: "summary_large_image",
    domain: "doitwithai.tools",
    url: "https://www.doitwithai.tools/ai-code", // Correct URL for this page
    title: "Code With AI - DoItWithAI.Tools",
    description: "Build websites faster and smarter! Discover how AI tools can supercharge your coding with free templates and guides to improve & optimize code.",
    image: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg', // Use a relevant image for coding
  },
  alternates: {
    canonical: "https://www.doitwithai.tools/ai-code", // Correct canonical URL
  },
};

export default async function Page() { // Make this an async component to await data
  const codingListData = await getCodingListData(); // Fetch data here

  // Define schema-specific data for the "Code With AI" page
  const schemaType = "coding"; // Sanity schema type
  const pageSlugPrefix = "ai-code"; // URL prefix for this category
  const pageTitle = "AI Code Blogs";
  const pageTitleHighlight = "AI Code";
  const pageDescription = "Dive into the world of AI coding with our latest articles and tutorials.";

  const breadcrumbProps = {
    pageName: "AI Code Blogs",
    pageName2: "from DoItWithAI.Tools",
    description: "Unlock the power of AI to revolutionize your web development workflow! Discover how to leverage tools like ChatGPT to generate website code (HTML, CSS, React, React MUI, TailwindCSS, Next.js) and create stunning website templates and UI components. Our blog features in-depth guides on using AI to improve existing code (MERN Stack, Next.js), solve coding problems, and optimize both frontend and backend code. Explore free website templates built with ChatGPT and learn how to code with AI by your side!",
    firstlinktext: "Home",
    firstlink: "/",
    link: `/${pageSlugPrefix}`, // Dynamic link using the defined prefix
    linktext: pageSlugPrefix, // Dynamic link text
  };

  // Schema Markup for "Code With AI" CollectionPage
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
        // No subcategories props passed here, so the section won't render
        serverData={codingListData} 
      />
    </>
  );
}
