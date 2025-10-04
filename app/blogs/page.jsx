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
  title: "Modern AI Blog Hub for SEO & Business Scale | Do It With AI Tools",
  description: "Explore our expert blogs for advanced AI insights and practical AI tools to master content creation, enhance SEO, and strategically scale your business.",
  
  author: "Sufian Mustafa",
  
  // --- KEYWORDS ---
  keywords: "modern AI blog, AI strategies, AI tools for content, AI SEO, content creation workflows, scale business with AI, AI Learn & Earn, AI Code, prompt engineering insights", // <-- UPDATED KEYWORDS: Removed generic terms and focused on strategic action areas.
  
  // --- OPEN GRAPH (SOCIAL SHARING) ---
  openGraph: {
    title: "Modern AI Blog Hub for SEO & Business Scale | Do It With AI Tools", // <-- UPDATED OG TITLE: Focus on Strategy & Workflow
  description:"Explore our expert blogs for advanced AI insights and practical AI tools to master content creation, enhance SEO, and strategically scale your business.", 
     type: "website",
    url: `${getBaseUrl()}/blogs`,
    siteName: "doitwithai.tools",
    images: [{
      url: generateOGImageURL({
        title: 'Modern AI Blog Hub for Content Creation, SEO, and business  Scale', // <-- UPDATED IMAGE TITLE
        // description field is removed
        category: 'AI Strategy Hub', // <-- UPDATED CATEGORY
        ctaText: 'Explore Expert Articles', // <-- UPDATED CTA
        features: 'AI Workflows,SEO/Content,Scale Business', // <-- UPDATED FEATURES
        bgColor: 'teal',
      }),
      width: 1200,
      height: 630,
      alt: "Modern AI Blog Hub - Strategies for Content Creation and Business Scale" // <-- UPDATED ALT
    }],
  },
  
  // --- TWITTER CARD ---
 twitter: {
    card: "summary_large_image",
    site: "@doitwithai",
    creator: "@doitwithai",
    domain: "doitwithai.tools",
    url: `${getBaseUrl()}/blogs`,
    // Keep titles/descriptions identical to OpenGraph
    title: "AI Blog Hub for Content Creation, SEO & Business Scale",
    description:
      "Discover expert blog posts with advanced AI insights and practical tools to master content creation, improve SEO, and scale your projects and business with proven AI workflows.",
    image: generateOGImageURL({
      title: "AI Blog Hub for Content Creation, SEO & Business Scale",
      ctaText: "Explore Articles",
      features: "AI Content,SEO Strategies,Scale",
    }),
    creator: "@doitwithai",
  },

  alternates: {
    canonical: `${getBaseUrl()}/blogs`,
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

export default async function BlogsPage() {
  const initialServerData = await getAllBlogsInitialData();

function blogCollectionSchema() {
  const baseUrl = getBaseUrl();
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      // Name reflects the modern focus
      "name": "Modern AI Blog Hub by Do It With AI Tools", 
      "url": `${baseUrl}/blogs`,
      // Description is updated to include strategic keywords and mission
      "description": "The Modern AI Blog Hub delivering advanced insights and strategic human-AI workflows to master content creation, enhance SEO, and strategically scale your business.",
      "publisher": {
        "@type": "Organization",
        // Added @id for entity linking consistency
        "@id": `${baseUrl}/#organization`, 
        "name": "doitwithai.tools",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logoForHeader.png`,
          "width": 600,
          "height": 60
        },
        "url": `${baseUrl}`,
        "sameAs": [
          "https://x.com/doitwithaitools",
        "https://www.facebook.com/profile.php?id=61579751720695&mibextid=ZbWKwL",
        "https://www.linkedin.com/company/do-it-with-ai-tools",
        "https://www.pinterest.com/doitwithai/",
        "https://www.tiktok.com/@doitwithai.tools",
        "https://www.youtube.com/@doitwithaitools",
        "https://www.instagram.com/doitwithaitools",
        "https://linktr.ee/doitwithaitools?"
        ]
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": "AI Content Strategy & Workflow Categories", // <-- UPDATED NAME
        "description": "Explore strategic content categories covering AI tools, modern SEO, coding workflows, and income generation.", // <-- UPDATED DESC
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "AI Tools & Strategic Workflows", // <-- UPDATED NAME
            "url": `${baseUrl}/ai-tools`,
            "description": "Latest reviews, tutorials, and insights on cutting-edge AI tools and strategic workflows for content creation, SEO, and business scale." // <-- UPDATED DESC
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Modern AI SEO & Content Strategy", // <-- UPDATED NAME: Highlights the main niche
            "url": `${baseUrl}/ai-seo`,
            "description": "Expert strategies for leveraging generative AI to revolutionize your content creation and search performance, covering GEO, AEO, and modern SEO techniques." // <-- UPDATED DESC: Added GEO/AEO/Content
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Code with AI for Web Development", // <-- UPDATED NAME
            "url": `${baseUrl}/ai-code`,
            "description": "Programming tutorials and development insights using AI to accelerate full-stack coding, solve problems, and build scalable content-driven applications." // <-- UPDATED DESC: Added Content/Scalable focus
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": "AI Learn, Earn, and Business Scale", // <-- UPDATED NAME: Added "Business Scale"
            "url": `${baseUrl}/ai-learn-earn`,
            "description": "Practical guides for acquiring AI skills, unlocking income opportunities, and scaling your business and digital projects using artificial intelligence." // <-- UPDATED DESC: Added Business/Scale focus
          }
        ]
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${baseUrl}/blogs?search={search_term_string}`,
        "query-input": "required name=search_term_string"
      },
      // Updated the 'about' section for sharper keyword focus
      "about": [
        {
          "@type": "Thing",
          "name": "Generative AI Workflows", // <-- UPDATED NAME
          "description": "AI tools, strategic workflows, and content automation technologies" // <-- UPDATED DESC
        },
        {
          "@type": "Thing",
          "name": "Modern SEO Strategy", // <-- UPDATED NAME
          "description": "SEO strategies, GEO, AEO, and AI-powered content optimization methods" // <-- UPDATED DESC
        },
        {
          "@type": "Thing",
          "name": "AI-Assisted Web Development", // <-- UPDATED NAME
          "description": "Coding tutorials, programming best practices, and AI-assisted project building" // <-- UPDATED DESC
        },
        {
          "@type": "Thing",
          "name": "Business Scale & Digital Monetization", // <-- UPDATED NAME
          "description": "Digital income strategies, scaling projects, and AI-powered earning opportunities" // <-- UPDATED DESC
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
          "name": "What topics does the Do It With AI Tools blog cover?",
          "acceptedAnswer": {
            "@type": "Answer",
            // UPDATED: Focused on the core mission categories (Tools, Content/SEO, and broader strategy/scale)
            "text": "The Do It With AI Tools blog is the modern hub for advanced insights on generative AI. We primarily cover three main areas: AI tools and strategic workflows, modern AI SEO and content creation, and scaling your business and digital projects with AI. Our content is designed to provide actionable strategies, not just theory."
          }
        },
        {
          "@type": "Question",
          "name": "How often is new content published on the blog?",
          "acceptedAnswer": {
            "@type": "Answer",
            // ENHANCED: Added strategic keywords (workflows, scale)
            "text": "We publish new, high-value content regularly, ensuring you always have access to the latest strategic workflows, AI tools, and methods for content creation and business scale. We continuously update existing articles to reflect the rapidly evolving AI and SEO landscape."
          }
        },
        {
          "@type": "Question",
          "name": "Are the AI tools and strategies mentioned in the blog suitable for beginners?",
          "acceptedAnswer": {
            "@type": "Answer",
            // ENHANCED: Reinforced brand and mission
            "text": "Yes, our content is designed for all skill levels. We provide step-by-step tutorials for beginners looking to master content creation with AI, while also offering advanced strategies for experienced users aiming to optimize complex human-AI workflows and scale their SEO."
          }
        },
        {
          "@type": "Question",
          "name": "Can I filter blog posts by specific categories or topics?",
          "acceptedAnswer": {
            "@type": "Answer",
            // ENHANCED: Used new category names
            "text": "Absolutely! Our blog page features robust filtering options that allow you to sort by categories like AI Tools and Strategic Workflows, Modern AI SEO and Content Strategy, Code with AI for Web Development, and AI Learn, Earn, and Business Scale. You can also search for specific topics or keywords."
          }
        }
      ]
    })
  };
}

function websiteSchema() {
  const baseUrl = getBaseUrl();
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      // UPDATED NAME: Aligns with the Metadata title
      "name": "Modern AI Blog Hub | Do It With AI Tools",
      "url": `${baseUrl}/blogs`,
      // UPDATED DESCRIPTION: Focuses on advanced insights, strategy, and scale
      "description": "Explore the Modern AI Blog Hub for advanced insights and strategic workflows to master content creation, enhance SEO, and strategically scale your business.",
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Do It With AI Tools",
        "url": `${baseUrl}`
      },
      "author": {
        "@type": "Person",
        "name": "Sufian Mustafa",
        "url": `${baseUrl}/author/sufian-mustafa`
      },
      // IMPORTANT: Use Organization @id reference for cleaner entity linking
      "publisher": {
         "@id": `${baseUrl}/#organization` 
      },
      // Add potentialAction for sitelinks searchbox feature
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${baseUrl}/blogs?search={search_term_string}`,
        "query-input": "required name=search_term_string"
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