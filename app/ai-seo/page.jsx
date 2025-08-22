import React from 'react';
import Script from "next/script";
import { NextSeo } from "next-seo";
import Head from 'next/head';

// Your existing BlogListingPageContent import
import BlogListingPageContent from "@/app/ai-tools/AllBlogs";

// Your existing ReusableCachedSEOSubcategories import
import ReusableCachedSEOSubcategories from "@/app/ai-tools/ReusableCachedSEOSubcategories";

// NEW IMPORT for StaticPageShell
import StaticPageShell from "./StaticPageShell";

// ---NEW IMPORTS for UnifiedCaching---
import { PageCacheProvider } from "@/React_Query_Caching/CacheProvider";
import UnifiedCacheMonitor from "@/React_Query_Caching/UnifiedCacheMonitor";

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
  title: "Double Your SEO Results via AI Tools & Strategies | doitwithai.tools",
  description: "Discover how AI tools are revolutionizing SEO, replacing outdated methods with smart strategies that boost your rankings & improve your online presence.",
  author: "Sufian Mustafa",
  keywords: "AI SEO, digital marketing, AI for content, keyword research, on-page SEO, off-page SEO, link building, AI strategies",
  openGraph: {
    title: "Double Your SEO Results via AI Tools & Strategies | doitwithai.tools",
    url: `${getBaseUrl()}/ai-seo`,
    type: "website",
    images: [{
      url: generateOGImageURL({
        title: 'Revolutionize your SEO with AI tools that boost rankings and automate content.',
        // description field is removed
        category: 'AI SEO',
        ctaText: 'Explore AI SEO Tools',
        features: 'AI-Powered SEO,Content Automation,Data-Driven Rankings'
      }),
      width: 1200,
      height: 630,
      alt: 'Double Your SEO Results via AI Tools & Strategies | doitwithai.tools',
    }],
    siteName: "doitwithai.tools",
    locale: 'en_US',
  },
  twitter: {
    card: "summary_large_image",
    site: "@doitwithai",
    creator: "@doitwithai",
    domain: "doitwithai.tools",
    url: `${getBaseUrl()}/ai-seo`,
    title: "Double Your SEO Results via AI Tools & Strategies | doitwithai.tools",
    image: generateOGImageURL({
      title: 'Revolutionize your SEO with AI tools that boost rankings and automate content.',
      // description field is removed
      category: 'AI SEO',
      ctaText: 'Explore AI SEO Tools',
      features: 'AI-Powered SEO,Content Automation,Data-Driven Rankings'
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
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
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
    pageName2: "& DigitalMarketing",
    description: "AI is revolutionizing how we approach SEO and digital marketing, making it smarter, faster, and more effective! In our blog, you'll find the knowledge and tools necessary to successfully integrate AI into your SEO and marketing strategies. Learn how ChatGPT and other AI tools can help generate quality content, conduct keyword research, and craft data-driven campaigns. Our practical guides help you improve rankings, target the right audience, and navigate the evolving digital landscape with confidence.",
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
            "item": `${getBaseUrl()}/`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": breadcrumbProps.pageName,
            "item": `${getBaseUrl()}${breadcrumbProps.link}`
          }
        ]
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": "AI SEO Articles",
        "description": "Collection of AI-powered SEO strategies and insights",
        "itemListElement": [
          // This should be populated with actual blog posts if available
        ]
      },
      "about": {
        "@type": "Thing",
        "name": "AI SEO",
        "description": "Artificial Intelligence tools and strategies for Search Engine Optimization"
      },
      "publisher": {
        "@type": "Organization",
        "name": "doitwithai.tools",
        "logo": {
          "@type": "ImageObject",
          "url": `${getBaseUrl()}/logoForHeader.png`
        }
      }
    })
  };
}

// Add WebSite schema for better recognition
function websiteSchema() {
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "doitwithai.tools - AI SEO",
      "url": `${getBaseUrl()}/ai-seo`,
      "description": "Discover how AI tools are revolutionizing SEO, replacing outdated methods with smart strategies that boost your rankings & improve your online presence.",
      "isPartOf": {
        "@type": "WebSite",
        "name": "doitwithai.tools",
        "url": `${getBaseUrl()}`
      },
      "publisher": {
        "@type": "Organization",
        "name": "doitwithai.tools"
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
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={websiteSchema()}
              key={`${pageSlugPrefix}-jsonld`}

      
    />
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={schemaMarkup(metadata, breadcrumbProps)}
              key={`${pageSlugPrefix}-jsonld`}

      
    />
      <UnifiedCacheMonitor serverData={serverData} params={mockParams} />
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