// app/blogs/page.jsx
import React from 'react';
import StaticBlogsPageShell from './StaticBlogsPageShell';
import AllBlogsAggregated from './AllPosts';
import Script from "next/script";
import { client } from "@/sanity/lib/client";
import { redisHelpers } from '@/app/lib/redis';
import { NextSeo } from "next-seo";
import Head from 'next/head';

export const revalidate = 3600;
export const dynamic = "force-dynamic";

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

const INITIAL_BLOGS_LIMIT = 5;

// --- Server-side data fetching function ---
async function getAllBlogsInitialData() {
  const cacheKey = 'blogList:all-blogs:main';
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

  const firstPageBlogsQuery = `*[
    _type == "makemoney" ||
    _type == "aitool" ||
    _type == "coding" ||
    _type == "seo"
  ] | order(publishedAt desc)[0...${INITIAL_BLOGS_LIMIT + 1}]{
    formattedDate,
    tags,
    readTime,
    _id,
    _type,
    title,
    slug,
    mainImage,
    overview,
    body,
    publishedAt
  }`;

  const totalCountQuery = `count(*[
    _type == "makemoney" ||
    _type == "aitool" ||
    _type == "coding" ||
    _type == "seo"
  ])`;

  try {
    const [firstPageBlogs, totalCount] = await Promise.all([
      client.fetch(firstPageBlogsQuery, {}, { next: { tags: ["makemoney", "aitool", "coding", "seo"] } }),
      client.fetch(totalCountQuery, {}, { next: { tags: ["makemoney", "aitool", "coding", "seo"] } })
    ]);

    const data = {
      firstPageBlogs,
      totalCount,
      timestamp: Date.now()
    };

    console.log(`[Sanity Fetch] for ${cacheKey} completed in ${Date.now() - startTime}ms`);

    if (data.firstPageBlogs?.length > 0) {
      try {
        await redisHelpers.set(cacheKey, data, { ex: 3600 });
        console.log(`[Redis Cache Set] for ${cacheKey}`);
      } catch (redisSetError) {
        console.error(`Redis set error for ${cacheKey}:`, redisSetError.message);
      }
    }
    return { ...data, __source: 'server-network' };
  } catch (error) {
    console.error(`Server-side fetch for All Blogs page failed:`, error.message);
    return null;
  }
}

export const metadata = {
  title: "AI Blog Library: Insights on AI Tools, SEO & More | doitwithai.tools",
  description: "Explore our comprehensive AI blog collection featuring cutting-edge insights on AI tools, SEO strategies, coding techniques, & monetization opportunities",
  author: "Sufian Mustafa",
  keywords: "AI blog, AI tools, AI SEO, AI coding, AI monetization, artificial intelligence articles, AI tutorials, AI strategies, AI resources, machine learning blog, AI insights, AI productivity, AI for business, AI automation, AI learning",
  openGraph: {
    title: "AI Blog Library: Insights on AI Tools, SEO & More | doitwithai.tools",
    description: "Discover cutting-edge AI content covering tools, SEO, coding, and monetization. Your complete resource for mastering artificial intelligence in business and daily life.",
    type: "website",
    url: `${getBaseUrl()}/blogs`,
    siteName: "doitwithai.tools",
    images: [{
      url: generateOGImageURL({
        title: 'Your Ultimate AI Blog Hub for cutting-edge insights on AI tools, SEO, coding, and more.',
        // description field is removed
        category: 'All Blogs',
        ctaText: 'Explore All Articles',
        features: 'AI Tools,AI SEO,AI Coding,Monetization',
        bgColor: 'teal',
      }),
      width: 1200,
      height: 630,
      alt: "AI Blog Hub - Latest Insights and Strategies"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Blog Hub - Latest AI Insights & Expert Strategies",
    description: "Discover cutting-edge AI content covering tools, SEO, coding, and monetization strategies.",
    image: generateOGImageURL({
      title: 'Your Ultimate AI Blog Hub for cutting-edge insights on AI tools, SEO, coding, and more.',
      // description field is removed
      category: 'All Blogs',
      ctaText: 'Explore All Articles',
      features: 'AI Tools,AI SEO,AI Coding,Monetization',
      bgColor: 'teal',
    }),
    creator: "@doitwithai"
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
  alternates: {
    canonical: `${getBaseUrl()}/blogs`
  },
};

export default async function BlogsPage() {
  const initialServerData = await getAllBlogsInitialData();

  function blogCollectionSchema() {
    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "doitwithai.tools Blog",
        "url": `${getBaseUrl()}/blogs`,
        "description": "Comprehensive AI blog featuring expert insights on AI tools, SEO strategies, coding techniques, and monetization opportunities. Your go-to resource for mastering artificial intelligence in business and daily workflows.",
        "publisher": {
          "@type": "Organization",
          "name": "doitwithai.tools",
          "logo": {
            "@type": "ImageObject",
            "url": `${getBaseUrl()}/logoForHeader.png`,
            "width": 600,
            "height": 60
          },
          "url": `${getBaseUrl()}`,
         "sameAs": [
        "https://x.com/doitwithaitools",
        "https://www.facebook.com/profile.php?id=61579751720695&mibextid=ZbWKwL",
        "https://www.linkedin.com/company/do-it-with-ai-tools",
        "https://www.pinterest.com/doitwithai/",
        "https://www.tiktok.com/@doitwithai.tools",
        "https://www.youtube.com/@doitwithaitools"
      ]
        },
        "mainEntity": {
          "@type": "ItemList",
          "name": "AI Blog Categories",
          "description": "Explore our comprehensive AI blog categories",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "AI Tools Blog",
              "url": `${getBaseUrl()}/ai-tools`,
              "description": "Latest reviews, tutorials, and insights on cutting-edge AI tools for productivity, SEO, and business automation."
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "AI SEO Blog",
              "url": `${getBaseUrl()}/ai-seo`,
              "description": "Expert strategies for leveraging artificial intelligence to revolutionize your SEO performance and search rankings."
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "AI Code Blog",
              "url": `${getBaseUrl()}/ai-code`,
              "description": "Programming tutorials and development insights using AI to accelerate coding, solve problems, and build better applications."
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": "AI Learn & Earn Blog",
              "url": `${getBaseUrl()}/ai-learn-earn`,
              "description": "Practical guides for acquiring AI skills and unlocking income opportunities through artificial intelligence."
            }
          ]
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${getBaseUrl()}/blogs?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        },
        "about": [
          {
            "@type": "Thing",
            "name": "Artificial Intelligence",
            "description": "Machine learning, AI tools, and automation technologies"
          },
          {
            "@type": "Thing",
            "name": "Search Engine Optimization",
            "description": "SEO strategies, techniques, and AI-powered optimization methods"
          },
          {
            "@type": "Thing",
            "name": "Programming",
            "description": "Coding tutorials, development practices, and AI-assisted programming"
          },
          {
            "@type": "Thing",
            "name": "Online Monetization",
            "description": "Digital income strategies and AI-powered earning opportunities"
          }
        ]
      })
    };
  }

  function breadcrumbSchema() {
    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
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
            "name": "Blogs",
            "item": `${getBaseUrl()}/blogs`
          }
        ]
      })
    };
  }

  function faqSchema() {
    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What topics does the doitwithai.tools blog cover?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our blog covers four main categories: AI Tools (reviews and tutorials), AI SEO (search optimization strategies), AI Code (programming with AI assistance), and AI Learn & Earn (skill development and monetization opportunities)."
            }
          },
          {
            "@type": "Question",
            "name": "How often is new content published?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We publish new AI-focused content regularly, with multiple articles per week covering the latest trends, tools, and strategies in artificial intelligence, SEO, and digital marketing."
            }
          },
          {
            "@type": "Question",
            "name": "Are the AI tools and strategies mentioned in the blog suitable for beginners?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, our content is designed for all skill levels. We provide step-by-step tutorials for beginners while also offering advanced strategies for experienced users looking to leverage AI more effectively."
            }
          },
          {
            "@type": "Question",
            "name": "Can I filter blog posts by specific categories or topics?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Absolutely! Our blog page features advanced filtering options that allow you to sort by categories (AI Tools, AI SEO, AI Code, AI Learn & Earn), publication date, and search for specific topics or keywords."
            }
          }
        ]
      })
    };
  }

  function websiteSchema() {
    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "doitwithai.tools - Blog Section",
        "url": `${getBaseUrl()}/blogs`,
        "description": "Explore a full collection of AI-focused blog articles including SEO strategies, skill development, and income generation guides.",
        "inLanguage": "en-US",
        "isPartOf": {
          "@type": "WebSite",
          "name": "doitwithai.tools",
          "url": `${getBaseUrl()}`
        },
        "author": {
          "@type": "Person",
          "name": "Sufian Mustafa",
          "url": `${getBaseUrl()}/about`
        },
        "publisher": {
          "@type": "Organization",
          "name": "doitwithai.tools",
          "logo": `${getBaseUrl()}/logoForHeader.png`
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
          type: "website",
          images: metadata.openGraph.images,
          siteName: metadata.openGraph.siteName,
          locale: metadata.openGraph.locale,
        }}
        twitter={{
          card: metadata.twitter.card,
          site: metadata.twitter.creator,
          handle: metadata.twitter.creator,
          title: metadata.twitter.title,
          description: metadata.twitter.description,
          image: metadata.twitter.image,
        }}
        additionalMetaTags={[
          { name: 'author', content: metadata.author },
          { name: 'keywords', content: metadata.keywords },
          { name: 'robots', content: metadata.robots.index && metadata.robots.follow ? 'index, follow' : 'noindex, nofollow' },
        ]}
      />
      </Head>
      {/* Structured Data Scripts */}
      <Script
        id="blog-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={blogCollectionSchema()}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={breadcrumbSchema()}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={faqSchema()}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={websiteSchema()}
      />
      
      {/* Main Content delivered via the StaticBlogsPageShell */}
      <StaticBlogsPageShell initialServerData={initialServerData}>
        <AllBlogsAggregated
          initialServerData={initialServerData}
        />
      </StaticBlogsPageShell>
    </>
  );
}