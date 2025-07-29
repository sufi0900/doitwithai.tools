// app/ai-seo/page.jsx
import React from 'react';
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";

// Your existing BlogListingPageContent import
import BlogListingPageContent from "@/app/ai-tools/AllBlogs";

// Your existing ReusableCachedSEOSubcategories import
import ReusableCachedSEOSubcategories from "@/app/ai-tools/ReusableCachedSEOSubcategories";

// NEW IMPORT for StaticPageShell
import StaticPageShell from "./StaticPageShell"; // <--- ADD THIS IMPORT

// ---NEW IMPORTS for UnifiedCaching---
import { PageCacheProvider } from "@/React_Query_Caching/CacheProvider";
import UnifiedCacheMonitor from "@/React_Query_Caching/UnifiedCacheMonitor";

// Import Sanity client and Redis helpers
import { client } from "@/sanity/lib/client";
import { redisHelpers } from '@/app/lib/redis';

// ---END NEW IMPORTS---

export const revalidate = 3600;

const SUBCATEGORIES_LIMIT = 2;
const BLOGS_PAGE_LIMIT = 5;

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
  title: "AI in SEO & Digital Marketing - DoItWithAI.Tools",
  description: "AI is revolutionizing how we approach SEO and digital marketing, making it smarter, faster, and more effective! In our blog, you'll find the knowledge and tools necessary to successfully integrate AI into your SEO and marketing strategies.",
  author: "Sufian Mustafa",
  openGraph: {
    title: "AI in SEO & Digital Marketing - DoItWithAI.Tools",
    description: "AI is revolutionizing how we approach SEO and digital marketing, making it smarter, faster, and more effective! In our blog, you'll find the knowledge and tools necessary to successfully integrate AI into your SEO and marketing strategies.",
    url: "https://www.doitwithai.tools/ai-seo",
    type: "website",
    images: [{ url: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg', width: 1200, height: 630, alt: 'AI in SEO & Digital Marketing', }],
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
      __html: `{"@context":"https://schema.org","@type":"CollectionPage","name":"${pageMetadata.title}","description":"${pageMetadata.description}","url":"${pageMetadata.openGraph.url}","breadcrumb":{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.doitwithai.tools/"},{"@type":"ListItem","position":2,"name":"${breadcrumbProps.pageName}","item":"${breadcrumbProps.link}"}]}}`
    };
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
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
      <UnifiedCacheMonitor serverData={serverData} params={mockParams} />

      {/* --- REPLACE THIS BLOCK --- */}
      {/* <BlogListingPageContent
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
        subcategoriesLimit={SUBCATEGORIES_LIMIT}
        serverData={serverData}
      /> */}
      {/* --- WITH THIS --- */}
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
      {/* --- END REPLACEMENT --- */}
    </>
  );
}