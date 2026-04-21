import React from 'react';
import Script from "next/script";

import BlogListingPageContent from "@/app/ai-tools/BlogListingPageContent";
import ReusableCachedSEOSubcategories from "@/app/ai-tools/ReusableCachedSEOSubcategories";
import StaticPageShell from "./StaticPageShell";
import { PageCacheProvider } from "@/React_Query_Caching/CacheProvider";
import { client } from "@/sanity/lib/client";
import { redisHelpers } from '@/app/lib/redis';
import AISEOHeroSection from "@/app/ai-seo/AISEOHeroSection";
export const revalidate = false;
export const dynamic = "force-dynamic";
const SUBCATEGORIES_LIMIT = 2;
const BLOGS_PAGE_LIMIT = 12;

function getBaseUrl() {
  if (process.env.NODE_ENV === 'production') {
    return 'https://doitwithai.tools';
  }
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
  const firstPageBlogsQuery = `*[_type=="${schemaType}"]|order(publishedAt desc)[0...${BLOGS_PAGE_LIMIT + 1}]`;
  const totalCountBlogsQuery = `count(*[_type=="${schemaType}"])`;
  const firstPageSEOSubcategoriesQuery = `*[_type=="seoSubcategory"]|order(orderRank asc){
    _id,
    title,
    "slug":slug.current,
    description,
    "blogCount":count(*[_type=="${schemaType}"&&references(^._id)])
  }[0...${SUBCATEGORIES_LIMIT + 1}]`;
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

// ============================================
// OPTIMIZED METADATA
// ============================================
export const metadata = {
  // Updated meta title (no brand name, 60 chars)
  title: "AI SEO Hub: Free Tools, Guides, and Prompts to Win Search",
  
  // Updated meta description (160 chars)
  description: "Learn AI SEO, AEO, and GEO with free step-by-step guides, smart tools, and useful prompts designed to improve content quality and earn AI citations.",
  
  author: "Sufian Mustafa",
  
  // Comprehensive but not overdone keywords
  keywords: "AI SEO, search engine optimization, AI search optimization, GEO, AEO, content optimization, AI tools, SEO strategies, free SEO resources, AI content, search visibility, topical authority, semantic SEO",
  
  openGraph: {
    // Match meta title
    title: "Free AI SEO Hub for Modern Search and Content Optimization",
    url: `${getBaseUrl()}/ai-seo`,
    type: "website",
    images: [{
      url: generateOGImageURL({
        title: "AI SEO Hub: Free Guides, Tools & Strategies",
        ctaText: "Start Learning",
        features: "Expert Guides,Free Tools,AI Optimization",
      }),
      width: 1200,
      height: 630,
      alt: "AI SEO Hub - Free guides, tools and strategies for modern search optimization",
    }],
    siteName: "Do It With AI Tools",
    locale: "en_US",
    // Match meta description
    description: "Access our free AI SEO learning hub for expert guides, smart tools, and custom prompts to boost your content rankings and maximize AI citation."
  },

  twitter: {
    card: "summary_large_image",
    site: "@doitwithai",
    creator: "@doitwithai",
    domain: "doitwithai.tools",
    url: `${getBaseUrl()}/ai-seo`,
    // Shorter for Twitter
    title: "AI SEO Hub: Free Guides, Tools & Strategies",
    description: "Free AI SEO learning hub with expert guides, tools, and prompts for better search rankings and AI citations.",
    image: generateOGImageURL({
      title: "AI SEO Hub: Free Guides, Tools & Strategies",
      ctaText: "Start Learning",
      features: "Expert Guides,Free Tools,AI Optimization",
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

// ============================================
// ENHANCED SCHEMA MARKUP
// ============================================
function schemaMarkup(pageMetadata, breadcrumbProps, subcategories = []) {
  // Build subcategory list for ItemList schema
  const subcategoryList = subcategories.map((cat, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": cat.title,
    "url": `${getBaseUrl()}/ai-seo/categories/${cat.slug}`
  }));

  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        // 1. Main CollectionPage
        {
          "@type": "CollectionPage",
          "@id": `${getBaseUrl()}/ai-seo#webpage`,
          "url": `${getBaseUrl()}/ai-seo`,
          "name": pageMetadata.title,
          "description": pageMetadata.description,
          "isPartOf": {
            "@id": `${getBaseUrl()}#website`
          },
          "about": {
            "@type": "Thing",
            "name": "AI SEO",
            "alternateName": ["AI Search Optimization", "Search Engine Optimization with AI"],
            "description": "Optimizing content for modern search engines using artificial intelligence techniques and strategies"
          },
          "inLanguage": "en-US",
          "breadcrumb": {
            "@id": `${getBaseUrl()}/ai-seo#breadcrumb`
          }
        },

        // 2. Website Schema
        {
          "@type": "WebSite",
          "@id": `${getBaseUrl()}#website`,
          "url": getBaseUrl(),
          "name": "Do It With AI Tools",
          "description": "Free AI tools, guides, and resources for SEO, content creation, and productivity",
          "publisher": {
            "@id": `${getBaseUrl()}#organization`
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${getBaseUrl()}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        },

        // 3. Organization Schema
        {
          "@type": "Organization",
          "@id": `${getBaseUrl()}#organization`,
          "name": "Do It With AI Tools",
          "url": getBaseUrl(),
          "logo": {
            "@type": "ImageObject",
            "url": `${getBaseUrl()}/logo.png`
          }
        },

        // 4. Person Schema (Author)
        {
          "@type": "Person",
          "@id": `${getBaseUrl()}/about#person`,
          "name": "Sufian Mustafa",
          "url": `${getBaseUrl()}/author/sufian-mustafa`,
          "jobTitle": "Founder & AI SEO Specialist",
          "worksFor": {
            "@id": `${getBaseUrl()}#organization`
          },
          "knowsAbout": ["AI SEO", "Search Optimization", "Content Strategy", "AI Tools"]
        },

        // 5. BreadcrumbList
        {
          "@type": "BreadcrumbList",
          "@id": `${getBaseUrl()}/ai-seo#breadcrumb`,
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

        // 6. ItemList for Subcategories (if available)
        ...(subcategoryList.length > 0 ? [{
          "@type": "ItemList",
          "name": "AI SEO Topics",
          "description": "Comprehensive AI SEO categories and guides",
          "numberOfItems": subcategoryList.length,
          "itemListElement": subcategoryList
        }] : []),

        // 7. Enhanced FAQPage
        {
          "@type": "FAQPage",
          "@id": `${getBaseUrl()}/ai-seo#faq`,
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is AI SEO?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "AI SEO is optimizing content for AI-powered search engines and tools. It focuses on creating content that AI models can understand, cite, and reference when answering user queries."
              }
            },
            {
              "@type": "Question",
              "name": "Is this AI SEO resource hub free?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, all AI SEO guides, tools, prompts, and resources are completely free with no paywalls or subscriptions required."
              }
            },
            {
              "@type": "Question",
              "name": "Who should use this AI SEO hub?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "This hub is designed for content creators, marketers, SEO professionals, and anyone interested in learning modern search optimization techniques with AI."
              }
            }
          ]
        }
      ]
    })
  };
}

export default async function Page() {
  const schemaType = "seo";
  const pageSlugPrefix = "ai-seo";

  const serverData = await getData(schemaType, pageSlugPrefix);

  const pageTitle = "SEO Insights";
  const pageTitleHighlight = "AI SEO Insights";
  const pageDescription = "Stay ahead with our latest AI-powered SEO strategies and insights.";
  
  const breadcrumbProps = {
    pageName: "AI SEO",
    pageName2: "Resource Hub",
    // Match meta description
    description: "Access our free AI SEO learning hub for expert guides, smart tools, and custom prompts to boost your content rankings and maximize AI citation.",
    firstlinktext: "Home",
    firstlink: "/",
    link: "/ai-seo",
    linktext: "ai-seo",
  };

  // Extract subcategories for schema
  const subcategoriesForSchema = serverData?.firstPageSEOSubcategories?.slice(0, SUBCATEGORIES_LIMIT) || [];

  return (
    <>
      <Script
        id="EnhancedAISEOSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaMarkup(metadata, breadcrumbProps, subcategoriesForSchema)}
        key={`${pageSlugPrefix}-jsonld`}
        strategy="afterInteractive"
      />

      <PageCacheProvider pageType="listing" pageId={`${schemaType}-listing`}>
        <StaticPageShell showBreadcrumb={false}>
             <section >
        <AISEOHeroSection />
      </section>
          <BlogListingPageContent
            schemaType={schemaType}
            pageSlugPrefix={pageSlugPrefix}
            pageTitle={pageTitle}
            pageTitleHighlight={pageTitleHighlight}
            pageDescription={pageDescription}
            showSubcategoriesSection={true}
            subcategoriesSectionTitle="Browse by"
            subcategoriesSectionDescription="AI SEO Topic"
            SubcategoriesComponent={ReusableCachedSEOSubcategories}
            subcategoriesLimit={SUBCATEGORIES_LIMIT}
            serverData={serverData}
          />
        </StaticPageShell>
      </PageCacheProvider>
    </>
  );
}