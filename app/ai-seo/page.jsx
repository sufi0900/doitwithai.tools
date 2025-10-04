import React from 'react';
import Script from "next/script";


// Your existing BlogListingPageContent import
import BlogListingPageContent from "@/app/ai-tools/BlogListingPageContent";

// Your existing ReusableCachedSEOSubcategories import
import ReusableCachedSEOSubcategories from "@/app/ai-tools/ReusableCachedSEOSubcategories";

// NEW IMPORT for StaticPageShell
import StaticPageShell from "./StaticPageShell";

// ---NEW IMPORTS for UnifiedCaching---
import { PageCacheProvider } from "@/React_Query_Caching/CacheProvider";

// Import Sanity client and Redis helpers
import { client } from "@/sanity/lib/client";
import { redisHelpers } from '@/app/lib/redis';

// ---END NEW IMPORTS---

export const revalidate = false;
export const dynamic = "force-dynamic";
const SUBCATEGORIES_LIMIT = 2;
const BLOGS_PAGE_LIMIT = 5;

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

async function getData(schemaType, pageSlugPrefix) {
  const cacheKey = `blogList:${schemaType}:main`;
  const startTime = Date.now();
  try {
    const cachedData = await redisHelpers.get(cacheKey);
    if (cachedData) {
      console.log(`[RedisCacheHit] for ${cacheKey} in ${Date.now() - startTime}ms`);
      return { ...cachedData, __source: 'server-redis' };
    }
  } catch (redisError) {
    console.error(`Redis error for ${cacheKey}:`, redisError.message);
  }
  console.log(`[SanityFetch] for ${cacheKey} starting...`);

  const featuresQuery = `*[_type=="${schemaType}"&&displaySettings.isOwnPageFeature==true][0]`;
  const firstPageBlogsQuery = `*[_type=="${schemaType}"]|order(publishedAtdesc)[0...${BLOGS_PAGE_LIMIT + 1}]`;
  const totalCountBlogsQuery = `count(*[_type=="${schemaType}"])`;

  const firstPageSEOSubcategoriesQuery = `*[_type=="seoSubcategory"]|order(orderRank asc){_id,title,"slug":slug.current,description,"blogCount":count(*[_type=="${schemaType}"&&references(^._id)])}[0...${SUBCATEGORIES_LIMIT + 1}]`;
  const totalSEOSubcategoryCountQuery = `count(*[_type=="seoSubcategory"])`;

  try {
    const [featuredPost, firstPageBlogs, totalCountBlogs, firstPageSEOSubcategories, totalSEOSubcategoryCount] = await Promise.all([
      client.fetch(featuresQuery, {}, { next: { tags: [schemaType] } }),
      client.fetch(firstPageBlogsQuery, {}, { next: { tags: [schemaType] } }),
      client.fetch(totalCountBlogsQuery, {}, { next: { tags: [schemaType] } }),
      client.fetch(firstPageSEOSubcategoriesQuery, {}, { next: { tags: ['seoSubcategory'] } }),
      client.fetch(totalSEOSubcategoryCountQuery, {}, { next: { tags: ['seoSubcategory'] } })
    ]);

    const data = {
      featuredPost,
      firstPageBlogs,
      totalCountBlogs,
      firstPageSEOSubcategories,
      totalSEOSubcategoryCount,
      timestamp: Date.now()
    };
    console.log(`[SanityFetch] for ${cacheKey} completed in ${Date.now() - startTime}ms`);

    if (data.featuredPost || data.firstPageBlogs?.length > 0 || data.firstPageSEOSubcategories?.length > 0) {
      try {
        await redisHelpers.set(cacheKey, data, { ex: 3600 });
        console.log(`[RedisCacheSet] for ${cacheKey}`);
      } catch (redisSetError) {
        console.error(`Redis set error for ${cacheKey}:`, redisSetError.message);
      }
    }
    return { ...data, __source: 'server-network' };
  } catch (error) {
    console.error(`Server-side fetch for AI SEO page failed:`, error.message);
    return null;
  }
}

export const metadata = {
  title: "Master Modern SEO with AI Tools & Strategies | Do It With AI Tools",
  description: "Discover blogs packed with advanced AI insights and tools to scale your business, optimize content creation, and master modern SEO success across GEO and AEO.",
  author: "Sufian Mustafa",
  keywords: "modern SEO, AI SEO, GEO, AEO, content scaling, AI tools, digital marketing, keyword research, content optimization, link building, AI strategies",
  
  openGraph: {
    title: "Master Modern SEO with AI Tools & Strategies",
    url: `${getBaseUrl()}/ai-seo`,
    type: "website",
    images: [{
      url: generateOGImageURL({
        title: "Scale Your Business with Modern SEO and AI-Driven Strategies",
        ctaText: "Explore AI SEO",
        features: "Modern SEO,Content Scaling,GEO & AEO",
      }),
      width: 1200,
      height: 630,
      alt: "Master Modern SEO with AI Tools & Strategies | doitwithai.tools",
    }],
    siteName: "doitwithai.tools",
    locale: "en_US",
    description: "Discover advanced AI insights, proven strategies, and tools to master modern SEO, GEO, and AEO while scaling your content and business growth."
  },

  twitter: {
    card: "summary_large_image",
    site: "@doitwithai",
    creator: "@doitwithai",
    domain: "doitwithai.tools",
    url: `${getBaseUrl()}/ai-seo`,
    title: "Master Modern SEO with AI Tools & Strategies",
    image: generateOGImageURL({
      title: "Scale Your Business with Modern SEO and AI-Driven Strategies",
      ctaText: "Explore AI SEO",
      features: "Modern SEO,Content Scaling,GEO & AEO",
    }),
  },

  alternates: {
    canonical: `${getBaseUrl()}/ai-seo`,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};


export default async function Page() {
  const schemaType = "seo";
  const pageSlugPrefix = "ai-seo";

  // We still fetch serverData here as it's passed to BlogListingPageContent
  const serverData = await getData(schemaType, pageSlugPrefix);

  const pageTitle = "SEO Insights";
  const pageTitleHighlight = "SEO Insights";
  const pageDescription = "Stay ahead of the curve with our latest AI-powered SEO strategies and insights.";
  const mockParams = {
    slug: `${schemaType}-listing`,
    pageType: 'listing'
  };
  const breadcrumbProps = {
    pageName: "AI in SEO",
    pageName2: "& Modern Content Creation",
    description: "Explore our comprehensive articles featuring advanced AI insights and battle-tested AI tools to scale your entire content creation and search visibility process. Our articles cover modern SEO strategies, including GEO, AEO, and strategic human-AI workflows for massive growth.",
    firstlinktext: "Home",
    firstlink: "/",
    link: "/ai-seo",
    linktext: "seo-with-ai",
  };

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
   
    <Script
        id="BreadcrumbListSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaMarkup(metadata, breadcrumbProps)}
        key={`${pageSlugPrefix}-jsonld`}
      />

      {/* <UnifiedCacheMonitor serverData={serverData} params={mockParams} /> */}
      <PageCacheProvider pageType="listing" pageId={`${schemaType}-listing`}>
        <StaticPageShell breadcrumbProps={breadcrumbProps}>
          <BlogListingPageContent
            schemaType={schemaType}
            pageSlugPrefix={pageSlugPrefix}
            pageTitle={pageTitle}
            pageTitleHighlight={pageTitleHighlight}
            pageDescription={pageDescription}
            showSubcategoriesSection={true}
            subcategoriesSectionTitle="SubCategories"
            subcategoriesSectionDescription="of SEO"
            SubcategoriesComponent={ReusableCachedSEOSubcategories}
            subcategoriesLimit={SUBCATEGORIES_LIMIT}
            serverData={serverData} // Still pass serverData for dynamic content
          />
        </StaticPageShell>
      </PageCacheProvider>
    </>
  );
}