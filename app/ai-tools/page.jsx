import React from 'react';
import Script from "next/script";
import { NextSeo } from "next-seo";
import { redisHelpers } from '@/app/lib/redis';
import { client } from "@/sanity/lib/client";

import BlogListingPageContent from "@/app/ai-tools/BlogListingPageContent";
import { PageCacheProvider } from '@/React_Query_Caching/CacheProvider';

// NEW IMPORT for StaticPageShell
import StaticPageShell from "@/app/ai-seo/StaticPageShell";
import Head from 'next/head';

// --- Next.js Server-Side Configuration ---
export const revalidate = 3600; // Revalidate every 1 hour

// Enhanced utility functions
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
      console.log(`[Redis Cache Hit] for ${cacheKey} in ${Date.now() - startTime}ms`);
      return { ...cachedData, __source: 'server-redis' };
    }
  } catch (redisError) {
    console.error(`Redis error for ${cacheKey}:`, redisError.message);
  }

  console.log(`[Sanity Fetch] for ${cacheKey} starting...`);

  const featuresQuery = `*[_type=="${schemaType}" && displaySettings.isOwnPageFeature==true][0]`;
  const firstPageBlogsQuery = `*[_type=="${schemaType}"] | order(publishedAt desc)[0...6]`;
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

// --- SEO Metadata (Next.js App Router Standard) ---
export const metadata = {
  title: "Best AI Tools for SEO, Productivity & Scaling | Do It With AI Tools",
  description: "Explore curated blogs on the best AI tools, featuring reviews of freemium software to boost content creation, enhance SEO, and scale your business effectively.",
  author: "Sufian Mustafa",
  openGraph: {
    title: "Best AI Tools for SEO, Productivity & Scaling | Do It With AI Tools",
    description: "Explore curated list of blogs on the best AI tools, with detailed reviews of freemium AI software designed to boost your productivity & enhance your SEO.",
    url: `${getBaseUrl()}/ai-tools`,
    type: "website",
    images: [{
      url: generateOGImageURL({
      title: 'Find the best AI tools to supercharge your content creation, SEO, and business scale.',
        // description field is removed
        category: 'AI Tools',
        ctaText: 'Explore AI Tools',
        features: 'Automate Tasks,Enhance Creativity,Save Time and Effort',
      }),
      width: 1200,
      height: 630,
      alt: 'Best AI Tools for Productivity',
    }],
    siteName: "doitwithai.tools",
    locale: 'en_US',
  },
  twitter: {
    card: "summary_large_image",
    domain: "doitwithai.tools",
    url: `${getBaseUrl()}/ai-tools`,
    title: "Best AI Tools for SEO, Productivity & Scaling | Do It With AI Tools",
  description: "Explore curated blogs on the best AI tools, featuring reviews of freemium software to boost content creation, enhance SEO, and scale your business effectively.",
    image: generateOGImageURL({
      title: 'Find the best AI tools to supercharge your content creation, SEO, and business scale.',
      // description field is removed
      category: 'AI Tools',
      ctaText: 'Explore AI Tools',
      features: 'Automate Tasks,Enhance Creativity,Save Time and Effort',
    }),
  },
  alternates: {
    canonical: `${getBaseUrl()}/ai-tools`,
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
  const schemaType = "aitool";
  const pageSlugPrefix = "ai-tools";
  const pageTitle = "AI Tools";
  const pageTitleHighlight = "AI Tools";
  const pageDescription = "Explore the newest and most effective AI tools to boost your productivity.";

  const serverData = await getData(schemaType, pageSlugPrefix);

  const breadcrumbProps = {
    pageName: "Best AI Tools",
    pageName2: "for SEO & productivity",
    description: "Discover our reviews of the best freemium AI tools and strategic workflows designed to enhance productivity and creativity. Learn how to use these AI tools to master content creation, optimize your SEO, and effectively scale your projects and business.",
    firstlinktext: "Home",
    firstlink: "/",
    link: "/ai-tools",
    linktext: "ai-tools",
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
        <PageCacheProvider pageType={schemaType} pageId="main">
          <BlogListingPageContent
            schemaType={schemaType}
            pageSlugPrefix={pageSlugPrefix}
            pageTitle={pageTitle}
            pageTitleHighlight={pageTitleHighlight}
            pageDescription={pageDescription}
            serverData={serverData}
          />
        </PageCacheProvider>
      </StaticPageShell>
    </>
  );
}