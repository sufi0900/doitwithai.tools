// app/ai-seo/page.jsx
import React from 'react';
import Script from "next/script";
import Head from "next/head"; // Note: For App Router, `metadata` export is preferred.
import { NextSeo } from "next-seo"; // NextSeo is for Pages Router, ensure it's still needed/used with App Router.

// Ensure this path is correct for your BlogListingPageContent
import BlogListingPageContent from "@/app/ai-tools/AllBlogs"; // Keeping the path as provided by the user
import ReusableCachedSEOSubcategories from "@/app/ai-tools/ReusableCachedSEOSubcategories"; // Keep this specific import

// --- NEW IMPORTS for Unified Caching ---
import { PageCacheProvider } from "@/React_Query_Caching/CacheProvider";
import UnifiedCacheMonitor from "@/React_Query_Caching/UnifiedCacheMonitor";

// Import Sanity client and Redis helpers
import { client } from "@/sanity/lib/client";
import { redisHelpers } from '@/app/lib/redis';
// --- END NEW IMPORTS ---

// --- Next.js Server-Side Configuration ---
export const revalidate = 3600; // Revalidate every 1 hour

// Define the limit for subcategories here, consistent with BlogListingPageContent prop
const SUBCATEGORIES_LIMIT = 2;
const BLOGS_PAGE_LIMIT = 5; // Assuming your blog list limit is 5, so fetch 5 + 1 for hasMore

// --- UPDATED getData function to fetch ALL required initial data ---
async function getData(schemaType, pageSlugPrefix) {
  const cacheKey = `blogList:${schemaType}:main`; // Consistent cache key for the main page data
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

  // --- Sanity Queries for Blog Data (schemaType: "seo") ---
  const featuresQuery = `*[_type=="${schemaType}" && displaySettings.isOwnPageFeature==true][0]`;
  const firstPageBlogsQuery = `*[_type=="${schemaType}"] | order(publishedAt desc)[0...${BLOGS_PAGE_LIMIT + 1}]`; // +1 for hasMore check
  const totalCountBlogsQuery = `count(*[_type=="${schemaType}"])`;

  // --- Sanity Queries for SEO Subcategory Data (schemaType: "seoSubcategory") ---
  const firstPageSEOSubcategoriesQuery = `*[_type=="seoSubcategory"]|order(orderRank asc){
    _id,
    title,
    "slug": slug.current,
    description,
    "blogCount": count(*[_type == "${schemaType}" && references(^._id)]) // Count related 'seo' blogs
  }[0...${SUBCATEGORIES_LIMIT + 1}]`; // Fetch limit + 1 for hasMore check

  const totalSEOSubcategoryCountQuery = `count(*[_type=="seoSubcategory"])`;

  try {
    const [
      featuredPost,
      firstPageBlogs,
      totalCountBlogs,
      firstPageSEOSubcategories,
      totalSEOSubcategoryCount
    ] = await Promise.all([
      client.fetch(featuresQuery, {}, { next: { tags: [schemaType] } }), // Tag main schema type
      client.fetch(firstPageBlogsQuery, {}, { next: { tags: [schemaType] } }), // Tag main schema type
      client.fetch(totalCountBlogsQuery, {}, { next: { tags: [schemaType] } }), // Tag main schema type
      client.fetch(firstPageSEOSubcategoriesQuery, {}, { next: { tags: ['seoSubcategory'] } }), // Tag subcategory schema type
      client.fetch(totalSEOSubcategoryCountQuery, {}, { next: { tags: ['seoSubcategory'] } }) // Tag subcategory schema type
    ]);

    const data = {
      featuredPost,
      firstPageBlogs,
      totalCountBlogs, // Renamed from totalCount for clarity
      firstPageSEOSubcategories,
      totalSEOSubcategoryCount,
      timestamp: Date.now()
    };

    console.log(`[Sanity Fetch] for ${cacheKey} completed in ${Date.now() - startTime}ms`);

    // Only cache if some data is found (either main blogs or subcategories)
    if (data.featuredPost || data.firstPageBlogs?.length > 0 || data.firstPageSEOSubcategories?.length > 0) {
      try {
        await redisHelpers.set(cacheKey, data, { ex: 3600 }); // Cache for 1 hour
        console.log(`[Redis Cache Set] for ${cacheKey}`);
      } catch (redisSetError) {
        console.error(`Redis set error for ${cacheKey}:`, redisSetError.message);
      }
    }

    return { ...data, __source: 'server-network' };
  } catch (error) {
    console.error(`Server-side fetch for AI SEO page failed:`, error.message);
    return null; // Return null on error
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
    url: "https://www.doitwithai.tools/ai-seo",
    type: "website",
    images: [{
      url: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg',
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
    url: "https://www.doitwithai.tools/ai-seo",
    title: "AI in SEO & Digital Marketing - DoItWithAI.Tools",
    description: "AI is revolutionizing how we approach SEO and digital marketing, making it smarter, faster, and more effective! In our blog, you'll find the knowledge and tools necessary to successfully integrate AI into your SEO and marketing strategies.",
    image: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg',
  },
  alternates: {
    canonical: "https://www.doitwithai.tools/ai-seo",
  },
};

export default async function Page() {
  const schemaType = "seo";
  const pageSlugPrefix = "ai-seo";

  // Fetch all initial data needed for the page
  const serverData = await getData(schemaType, pageSlugPrefix);

  const pageTitle = "SEO Insights";
  const pageTitleHighlight = "SEO Insights";
  const pageDescription = "Stay ahead of the curve with our latest AI-powered SEO strategies and insights.";


const mockParams = {
    slug: `${schemaType}-listing`, // Create a unique identifier for this listing page
    pageType: 'listing'           // Optional: indicate this is a listing page
  };


  const breadcrumbProps = {
    pageName: "AI in SEO",
    pageName2: "& Digital Marketing",
    description: "AI is revolutionizing how we approach SEO and digital marketing, making it smarter, faster, and more effective! In our blog, you'll find the knowledge and tools necessary to successfully integrate AI into your SEO and marketing strategies. Learn how ChatGPT and other AI tools can help generate quality content, conduct keyword research, and craft data-driven campaigns. Our practical guides help you improve rankings, target the right audience, and navigate the evolving digital landscape with confidence.",
    firstlinktext: "Home",
    firstlink: "/",
    link: "/ai-seo",
    linktext: "seo-with-ai",
  };

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
    <PageCacheProvider pageType={schemaType} pageId="main">
      <UnifiedCacheMonitor />
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
          dangerouslySetInnerHTML={schemaMarkup(metadata, breadcrumbProps)}
          key={`${pageSlugPrefix}-jsonld`}
        />

<UnifiedCacheMonitor 
        serverData={serverData}
        params={mockParams}
      />

        <BlogListingPageContent
          schemaType={schemaType}
          pageSlugPrefix={pageSlugPrefix}
          pageTitle={pageTitle}
          pageTitleHighlight={pageTitleHighlight}
          pageDescription={pageDescription}
          breadcrumbProps={breadcrumbProps}
          showSubcategoriesSection={true}
          subcategoriesSectionTitle="SubCategories"
          subcategoriesSectionDescription="of SEO"
          SubcategoriesComponent={ReusableCachedSEOSubcategories}
          subcategoriesLimit={SUBCATEGORIES_LIMIT} // Pass the limit for consistency
          serverData={serverData} // Pass the full serverData object
          // NOTE: BlogListingPageContent must be updated internally to extract
          // serverData.firstPageSEOSubcategories and serverData.totalSEOSubcategoryCount
          // and pass them as initialPageData and initialTotalCount to ReusableCachedSEOSubcategories.
          // This is critical for the client-side component to use the server-fetched data.
        />
      </>
    </PageCacheProvider>
  );
}