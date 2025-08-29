import React from 'react';
import Script from "next/script";
import { NextSeo } from "next-seo";
import Head from 'next/head';

// Import the new reusable component
import BlogListingPageContent from "@/app/ai-tools/BlogListingPageContent";

// --- NEW IMPORTS for StaticPageShell ---
import StaticPageShell from "@/app/ai-seo/StaticPageShell";
import { client } from "@/sanity/lib/client";
import { redisHelpers } from '@/app/lib/redis';
// --- END NEW IMPORTS ---

// --- Next.js Server-Side Configuration ---
export const revalidate = 3600;

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

// --- SEO Metadata (Next.js App Router Standard) ---
export const metadata = {
  title: "AI Code Blogs | Write, Debug & Optimize Faster - doitwithai.tools",
  description: "Learn how to code with AI by discovering the best AI tools and techniques to generate code, and solve complex coding problems faster than ever before.",
  author: "Sufian Mustafa",
  openGraph: {
    title: "",
    url: `${getBaseUrl()}/ai-code`,
    type: "website",
    images: [{
      url: generateOGImageURL({
        title: 'Supercharge Your Code with AI — Write, Optimize & Debug Faster Than Ever',
        category: 'AI Code',
        ctaText: 'Explore AI Coding Guides',
        features: 'Code Generation,Bug Fixing,Faster Development',
        bgColor: 'purple'
      }),
      width: 1200,
      height: 630,
      alt: 'Code With AI',
    }],
    siteName: "doitwithai.tools",
    locale: 'en_US',
  },
  twitter: {
    card: "summary_large_image",
    domain: "doitwithai.tools",
    url: `${getBaseUrl()}/ai-code`,
    title: "Code With AI - doitwithai.tools",
    image: generateOGImageURL({
      title: 'Supercharge Your Code with AI — Write, Optimize & Debug Faster Than Ever',
      category: 'AI Code',
      ctaText: 'Explore AI Coding Guides',
      features: 'Code Generation,Bug Fixing,Faster Development',
      bgColor: 'purple'
    }),
  },
  alternates: {
    canonical: `${getBaseUrl()}/ai-code`,
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

export default async function Page() {
  const schemaType = "coding";
  const pageSlugPrefix = "ai-code";
  const pageTitle = "AI Code Blogs";
  const pageTitleHighlight = "AI Code";
  const pageDescription = "Dive into the world of AI coding with our latest articles and tutorials.";
  const serverData = await getData(schemaType, pageSlugPrefix);

  const breadcrumbProps = {
    pageName: "AI Code Blogs",
    pageName2: "from doitwithai.tools",
    description: "Unlock the power of AI to revolutionize your web development workflow! Discover how to leverage tools like ChatGPT to generate website code (HTML, CSS, React, React MUI, TailwindCSS, Next.js) and create stunning website templates and UI components. Our blog features in-depth guides on using AI to improve existing code (MERN Stack, Next.js), solve coding problems, and optimize both frontend and backend code. Explore free website templates built with ChatGPT and learn how to code with AI by your side!",
    firstlinktext: "Home",
    firstlink: "/",
    link: `/${pageSlugPrefix}`,
    linktext: pageSlugPrefix,
  };

  // Schema Markup for "Code With AI" CollectionPage
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
          { name: 'keywords', content: "AI code, AI coding guides, AI web development, ChatGPT code, improve code with AI, website templates, UI components, Next.js, MERN stack, frontend, backend" },
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
          serverData={serverData}
        />
      </StaticPageShell>
    </>
  );
}