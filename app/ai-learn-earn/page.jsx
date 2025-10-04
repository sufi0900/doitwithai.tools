// app/learn-earn/page.jsx
import React from 'react';
import Script from "next/script";
import { NextSeo } from "next-seo";
import Head from 'next/head';

// Import the new reusable component
import BlogListingPageContent from "@/app/ai-tools/BlogListingPageContent";

// --- NEW IMPORT for StaticPageShell ---
import StaticPageShell from "@/app/ai-seo/StaticPageShell"; // <--- ADD THIS IMPORT

// --- NEW IMPORTS ---
import { client } from "@/sanity/lib/client"; // Import Sanity client
import { redisHelpers } from '@/app/lib/redis'; // Import Redis helpers
// --- END NEW IMPORTS ---

// --- Next.js Server-Side Configuration ---
export const revalidate = 3600; // Revalidate every 1 hour

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
  title: "Learn & Earn With AI | doitwithai.tools",
  description: "Unlock the power of AI to learn in-demand skills and boost your income with AI tools and strategies that make artificial intelligence your growth partner.",
  author: "Sufian Mustafa",
  keywords: "AI learn and earn, make money with AI, AI skills, AI income streams, AI career, AI business, AI monetization",
  openGraph: {
    title: "Learn & Earn With AI | doitwithai.tools",
    url: `${getBaseUrl()}/ai-learn-earn`,
    type: "website",
    images: [{
      url: generateOGImageURL({
        title: 'Learn AI Skills & Boost Your Income — Turn Knowledge into Profit',
        category: 'Learn & Earn',
        ctaText: 'Get Started Today',
        features: 'Master New Skills,Boost Your Income,Future-Proof Your Career',
        bgColor: 'green'
      }),
      width: 1200,
      height: 630,
      alt: 'Learn and Earn with AI',
    }],
    siteName: "doitwithai.tools",
    locale: 'en_US',
  },
  twitter: {
    card: "summary_large_image",
    site: "@doitwithai",
    creator: "@doitwithai",
    domain: "doitwithai.tools",
    url: `${getBaseUrl()}/ai-learn-earn`,
    title: "Learn & Earn With AI | doitwithai.tools",
    image: generateOGImageURL({
      title: 'Learn AI Skills & Boost Your Income — Turn Knowledge into Profit',
      category: 'Learn & Earn',
      ctaText: 'Get Started Today',
      features: 'Master New Skills,Boost Your Income,Future-Proof Your Career',
      bgColor: 'green'
    }),
  },
  alternates: {
    canonical: `${getBaseUrl()}/ai-learn-earn`,
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

  // Define schema-specific data for the "Learn & Earn With AI" page
  const schemaType = "makemoney"; // Sanity schema type
  const pageSlugPrefix = "ai-learn-earn"; // URL prefix for this category
  const pageTitle = "Learn & Earn With AI";
  const pageTitleHighlight = "Learn & Earn With AI";
  const pageDescription = "Discover AI tools, guides, and strategies to grow your skills and income together.";
  const serverData = await getData(schemaType, pageSlugPrefix);
  const mockParams = {
    slug: `${schemaType}-listing`,
    pageType: 'listing'
  };

  const breadcrumbProps = {
    pageName: "Learn and Earn",
    pageName2: "With AI",
    description: "Tap into the endless possibilities of AI to earn money and learn valuable skills at the same time! In this category, we share actionable strategies for turning artificial intelligence into your earning partner. Learn how tools like ChatGPT can simplify tasks, enhance productivity, and open new revenue streams.",
    firstlinktext: "Home",
    firstlink: "/",
    link: "/ai-learn-earn", // Dynamic link using the defined prefix
    linktext: pageSlugPrefix, // Dynamic link text
  };

  // Schema Markup for "Learn and Earn With AI" CollectionPage
  function schemaMarkup(pageMetadata, breadcrumbProps) {
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
  "item": `${getBaseUrl()}/`,
               "id": `${getBaseUrl()}/` // Add the id property here

            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": breadcrumbProps.pageName,
               "item": `${getBaseUrl()}${breadcrumbProps.link}`,
               "id": `${getBaseUrl()}${breadcrumbProps.link}`
              
              }
          ]
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
          title: metadata.openGraph.title,
          description: metadata.openGraph.description,
          url: metadata.openGraph.url,
          type: "ItemList",
          images: metadata.openGraph.images,
          siteName: metadata.openGraph.siteName,
          locale: metadata.openGraph.locale,
        }}
        twitter={{
          card: metadata.twitter.card,
          site: metadata.twitter.site,
          handle: metadata.twitter.creator,
          title: metadata.twitter.title,
          description: metadata.twitter.description,
          image: metadata.twitter.image,
        }}
        additionalMetaTags={[
          { name: 'author', content: metadata.author },
          { name: 'keywords', content: metadata.keywords },
          { name: 'robots', content: 'index, follow' },
        ]}
      />
         </Head>
      <Script
        id="BreadcrumbListSchema"
        type="application/ld+json"
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
    </>
  );
}