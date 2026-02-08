import React from 'react'
import HomePageCode from "./HomePageCode"
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";

import { redisHelpers } from '@/app/lib/redis';
import { client } from "@/sanity/lib/client";
import { PageCacheProvider } from '@/React_Query_Caching/CacheProvider';
export const revalidate = 7200;// Enhanced utility functions
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

// Enhanced metadata with consistent branding
export const metadata = {
  title: "Your Modern AI Hub for SEO & Business Scale | Do It With AI Tools",
  description: "Do It With AI Tools offers AI insights to master generative AI that boost SEO & content creation, grow your business, and improve overall productivity.",
  
  authors: [{ 
    name: "Sufian Mustafa",
    url: "https://doitwithai.tools/about"
  }],
  creator: "Sufian Mustafa",
  publisher: "Do It With AI Tools",
  
  keywords: "do it with ai, do it with ai tools, AI content creation, AI SEO, generative AI, content optimization, ChatGPT content, AI writing tools, SEO with AI, content marketing AI, prompt engineering, AI content strategy, AI productivity, business scale",
  
  other: {
    'ai-content-declaration': 'human-created, ai-assisted',
    'brand-name': 'Do It With AI Tools',
    'brand-keywords': 'do it with ai, do it with ai tools, doitwithai.tools'
  },
  
  openGraph: {
    title: "Your Modern AI Hub for SEO & Business Scale",
    description: "Do It With AI Tools offers AI insights to master generative AI that boost SEO & content creation, grow your business, and improve overall productivity.",
    url: getBaseUrl(),
    type: "website",
    siteName: "Do It With AI Tools",
    locale: "en_US",
    // Multiple images for better image search visibility
    images: [
      {
        url: generateOGImageURL({
          title: "Master Generative AI for SEO, Content & Business Growth",
          ctaText: "Start Your AI Journey",
          features: "AI Content,SEO,Productivity",
        }),
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools - Master Generative AI for SEO, Content & Business Growth",
      },
      {
        url: `${getBaseUrl()}/homepage-hero-screenshot.png`,
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools Homepage - Modern AI Hub for SEO and Productivity",
      },
      {
        url: `${getBaseUrl()}/doitwithai-tools-logo-full.png`,
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools Official Logo",
      }
    ]
  },
  
  twitter: {
    card: "summary_large_image",
    site: "@doitwithai",
    creator: "@doitwithai",
    domain: "doitwithai.tools",
    url: getBaseUrl(),
    title: "Your Modern AI Hub for SEO & Business Scale",
    description: "Do It With AI Tools offers AI insights to master generative AI that boost SEO & content creation, grow your business, and improve overall productivity.",
    images: [
      generateOGImageURL({
        title: "Master Generative AI for SEO, Content & Business Growth",
        ctaText: "Start Your AI Journey",
        features: "AI Content,SEO,Productivity",
      }),
      `${getBaseUrl()}/homepage-hero-screenshot.png`
    ]
  },
  
  alternates: {
    canonical: getBaseUrl(),
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
    }
  }
};

const HOMEPAGE_FREE_RESOURCES_LIMIT = 10;

async function getHomePageInitialData() {
  const cacheKey = 'homepage:initialData';
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

  const queries = {
    trendBig: `*[_type in ["makemoney","freeairesources","news","coding","aitool","seo"]&&displaySettings.isHomePageTrendBig==true][0...1]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
    trendRelated: `*[_type in ["makemoney","freeairesources","news","coding","aitool","seo"]&&displaySettings.isHomePageTrendRelated==true][0...4]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
    featureBig: `*[_type in ["makemoney","freeairesources","news","coding","aitool","seo"]&&displaySettings.isHomePageFeatureBig==true][0...1]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
    featureRelated: `*[_type in ["makemoney","freeairesources","news","coding","aitool","seo"]&&displaySettings.isHomePageFeatureRelated==true][0...4]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
    seoTrendBig: `*[_type=="seo"&&displaySettings.isHomePageSeoTrendBig==true][0...1]{_id,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
    seoTrendRelated: `*[_type=="seo"&&displaySettings.isHomePageSeoRelated==true][0...4]{_id,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
    aiToolsQuery: `*[_type=="aitool"&&displaySettings.isHomePageAIToolTrendRelated==true][0...2]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt}`,
    aiCodeQuery: `*[_type=="coding"&&displaySettings.isHomePageCoding==true][0...2]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt}`,
    aiEarnQuery: `*[_type=="makemoney"&&displaySettings.isHomePageAiEarnTrendBig==true][0...2]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt}`,
    recentPosts: `*[_type in ["makemoney","aitool","coding","freeairesources","seo","news"]]|order(publishedAt desc)[0...5]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt}`,
      freeResourcesFeatured: `*[_type=="freeResources"&&isHomePageFeature==true]|order(publishedAt desc)[0...${HOMEPAGE_FREE_RESOURCES_LIMIT}]{
      _id,
      title,
      slug,
      tags,
      mainImage,
      overview,
      resourceType,
      resourceFormat,
      resourceLink,
      resourceLinkType,
      content,
      publishedAt,
      "resourceFile": resourceFile.asset->,
      promptContent,
      previewSettings {
        useCustomPreview,
        previewImage {
          asset->{
            url,
            metadata
          },
          alt
        }
      },
      "relatedArticle": relatedArticle-> {
        title,
        slug,
        _type,
        tags,
        excerpt
      },
      aiToolDetails,
      _updatedAt
    }`,
  };

  try {
    const [
      fetchedTrendBig, fetchedTrendRelated,
      fetchedFeatureBig, fetchedFeatureRelated,
      fetchedSeoTrendBig, fetchedSeoTrendRelated,
      fetchedAiTools, fetchedAiCode, fetchedAiEarn,
      fetchedRecentPosts,
      fetchedFreeResourcesFeatured
    ] = await Promise.all([
      client.fetch(queries.trendBig, {}, { next: { tags: ["homepage", "trending"] } }),
      client.fetch(queries.trendRelated, {}, { next: { tags: ["homepage", "trending"] } }),
      client.fetch(queries.featureBig, {}, { next: { tags: ["homepage", "feature"] } }),
      client.fetch(queries.featureRelated, {}, { next: { tags: ["homepage", "feature"] } }),
      client.fetch(queries.seoTrendBig, {}, { next: { tags: ["homepage", "seo"] } }),
      client.fetch(queries.seoTrendRelated, {}, { next: { tags: ["homepage", "seo"] } }),
      client.fetch(queries.aiToolsQuery, {}, { next: { tags: ["homepage", "mixedCategories"] } }),
      client.fetch(queries.aiCodeQuery, {}, { next: { tags: ["homepage", "mixedCategories"] } }),
      client.fetch(queries.aiEarnQuery, {}, { next: { tags: ["homepage", "mixedCategories"] } }),
      client.fetch(queries.recentPosts, {}, { next: { tags: ["homepage", "recentPosts"] } }),
      client.fetch(queries.freeResourcesFeatured, {}, { next: { tags: ["homepage", "freeResources"] } }),
    ]);

    const trendBigData = fetchedTrendBig ? [fetchedTrendBig] : [];
    const trendRelatedData = fetchedTrendRelated || [];
    const featureBigData = fetchedFeatureBig ? [fetchedFeatureBig] : [];
    const featureRelatedData = fetchedFeatureRelated || [];
    const seoTrendBigData = fetchedSeoTrendBig ? [fetchedSeoTrendBig] : [];
    const seoTrendRelatedData = fetchedSeoTrendRelated || [];
    const aiToolsData = fetchedAiTools || [];
    const aiCodeData = fetchedAiCode || [];
    const aiEarnData = fetchedAiEarn || [];
    const recentPostsData = fetchedRecentPosts || [];
    const freeResourcesFeaturedData = fetchedFreeResourcesFeatured || [];

    const data = {
      trending: { trendBigData, trendRelatedData },
      featurePost: { featureBigData, featureRelatedData },
      aiSeo: { seoTrendBigData, seoTrendRelatedData },
      mixedCategories: { aiToolsData, aiCodeData, aiEarnData },
      recentPosts: recentPostsData,
      freeResourcesFeatured: freeResourcesFeaturedData,
      timestamp: Date.now()
    };

    console.log(`[Sanity Fetch] for ${cacheKey} completed in ${Date.now() - startTime}ms`);

    if (Object.values(data).some(d => d !== null && (Array.isArray(d) ? d.length > 0 : true))) {
      try {
        await redisHelpers.set(cacheKey, data, { ex: 3600 });
        console.log(`[Redis Cache Set] for ${cacheKey}`);
      } catch (redisSetError) {
        console.error(`Redis set error for ${cacheKey}:`, redisSetError.message);
      }
    }

    return { ...data, __source: 'server-network' };
  } catch (error) {
    console.error(`Server-side fetch for Homepage failed:`, error.message);
    return null;
  }
}

export default async function Page() {
  const initialServerData = await getHomePageInitialData();
    const freeResourcesFeatured = initialServerData?.freeResourcesFeatured || [];

// DoItWithAI.tools provides AI-driven insights and strategies to help businesses, marketers, and creators master generative AI for content creation and SEO. We deliver expert insights, strategic guidance, simple tutorials, and free resources that show you how to scale projects, streamline workflows, and improve visibility across modern search engine GEO (Generative Engine Optimization) and AEO (Answer Engine Optimization). 


// ENHANCED SCHEMA WITH AUTHOR + IMAGE GALLERY
function schemaMarkup() {
  return {
    __html: `{
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Do It With AI Tools",
      "alternateName": ["doitwithai.tools", "Do It With AI", "DoItWithAI", "DIWAI Tools", "AI Content & SEO Hub", "do it with ai", "do it with ai tools"],
      "url": "${getBaseUrl()}/",
      "description": "Do It With AI Tools offers expert AI insights to help you master generative AI for content creation, boost SEO performance, enhance productivity, and strategically scale your business. Discover proven workflows, practical strategies, and free resources to create high-quality content that ranks on traditional search engines and leverages AI-powered search and answer engines effectively. Founded by Sufian Mustafa, Do It With AI Tools is your trusted partner for mastering AI-powered content creation and SEO optimization.",
      
      "publisher": {
        "@type": "Organization",
        "name": "Do It With AI Tools",
        "alternateName": ["do it with ai", "do it with ai tools"],
        "logo": {
          "@type": "ImageObject",
          "url": "${getBaseUrl()}/logoForHeader.png",
          "width": 600,
          "height": 60,
          "caption": "Do It With AI Tools Official Logo"
        }
      },
      
      "author": {
        "@type": "Person",
        "@id": "${getBaseUrl()}/#sufian-mustafa",
        "name": "Sufian Mustafa",
        "url": "${getBaseUrl()}/about",
        "jobTitle": "Founder & AI Content Strategist",
        "description": "Founder of Do It With AI Tools, Sufian Mustafa specializes in AI-powered content creation, SEO optimization, and helping businesses leverage generative AI for growth and productivity.",
        "knowsAbout": ["AI Content Creation", "SEO Optimization", "Generative Engine Optimization", "Answer Engine Optimization", "AI Tools", "Content Strategy", "Prompt Engineering"],
        "sameAs": [
          "https://x.com/doitwithaitools",
          "https://www.linkedin.com/company/do-it-with-ai-tools"
        ],
        "worksFor": {
          "@type": "Organization",
          "name": "Do It With AI Tools",
          "alternateName": "do it with ai tools"
        },
        "image": {
          "@type": "ImageObject",
          "url": "${getBaseUrl()}/sufian-mustafa-founder.jpg",
          "caption": "Sufian Mustafa - Founder of Do It With AI Tools"
        }
      },
      
      "potentialAction": {
        "@type": "SearchAction",
        "target": "${getBaseUrl()}/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "AI SEO - Content Optimization & Strategy",
            "url": "${getBaseUrl()}/ai-seo",
            "description": "Master AI-powered SEO for content creators and marketers with Do It With AI Tools. Learn advanced strategies for keyword research, content optimization, technical SEO using AI."
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "AI Tools - Content Creation & SEO",
            "url": "${getBaseUrl()}/ai-tools",
            "description": "Discover powerful AI tools for content creation and SEO optimization on Do It With AI Tools. Expert reviews on ChatGPT, Gemini, Claude, and specialized AI tools."
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "AI Learn & Earn - Content Skills & Income",
            "url": "${getBaseUrl()}/ai-learn-earn",
            "description": "Learn AI-powered content creation skills with Do It With AI Tools. Practical guides for freelance writing, SEO consulting, and monetizing AI expertise."
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": "AI Code - Web Development & Content Platforms",
            "url": "${getBaseUrl()}/ai-code",
            "description": "Build content platforms with Do It With AI Tools. Learn to create SEO-optimized websites using AI coding assistants like ChatGPT."
          },
          {
            "@type": "ListItem",
            "position": 5,
            "name": "Free AI Resources - Templates & Tools",
            "url": "${getBaseUrl()}/free-ai-resource",
            "description": "Access free AI resources from Do It With AI Tools including prompts, templates, content calendars, keyword research tools, and optimization checklists."
          }
        ]
      }
    }`
  };
}

function organizationSchema() {
  return {
    __html: `{
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Do It With AI Tools",
      "alternateName": ["doitwithai.tools", "Do It With AI", "DoItWithAI", "DIWAI Tools", "do it with ai", "do it with ai tools"],
      "url": "${getBaseUrl()}",
      "logo": {
        "@type": "ImageObject",
        "url": "${getBaseUrl()}/logoForHeader.png",
        "width": 600,
        "height": 60,
        "caption": "Do It With AI Tools Official Logo"
      },
      "description": "Do It With AI Tools is a specialized platform founded by Sufian Mustafa, dedicated to helping content creators, marketers, and businesses master generative AI for content creation and SEO optimization. Do It With AI Tools provides expert strategies, proven workflows, and free resources for creating high-quality content optimized for traditional search (SEO), AI-powered search engines (GEO), and answer engines (AEO).",
      
      "founder": {
        "@type": "Person",
        "@id": "${getBaseUrl()}/#sufian-mustafa",
        "name": "Sufian Mustafa",
        "jobTitle": "Founder & AI Content Strategist",
        "url": "${getBaseUrl()}/about",
        "description": "Sufian Mustafa founded Do It With AI Tools to empower creators and businesses with AI-driven content strategies and SEO optimization techniques.",
        "knowsAbout": ["AI Content Creation", "SEO Optimization", "Generative Engine Optimization", "AI Tools", "Content Strategy"],
        "sameAs": [
          "https://x.com/doitwithaitools",
          "https://www.linkedin.com/company/do-it-with-ai-tools"
        ]
      },
      
      "foundingDate": "2024",
      "slogan": "Learn, Build, and Grow with AI",
      "brand": {
        "@type": "Brand",
        "name": "Do It With AI Tools",
        "alternateName": ["do it with ai", "do it with ai tools"],
        "logo": "${getBaseUrl()}/logoForHeader.png",
        "slogan": "Learn, Build, and Grow with AI"
      },
      
      "knowsAbout": [
        "Do It With AI Tools",
        "AI Content Creation", 
        "SEO Optimization", 
        "Generative Engine Optimization (GEO)", 
        "Answer Engine Optimization (AEO)", 
        "Content Marketing", 
        "AI Tools", 
        "Prompt Engineering", 
        "Content Strategy",
        "AI-Powered SEO",
        "Generative AI for Business"
      ],
      
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "sufianmustafa0900@gmail.com",
        "url": "${getBaseUrl()}/contact",
        "areaServed": "Worldwide",
        "availableLanguage": ["en"]
      },
      
      "sameAs": [
        "https://x.com/doitwithaitools",
        "https://www.facebook.com/profile.php?id=61579751720695&mibextid=ZbWKwL",
        "https://www.linkedin.com/company/do-it-with-ai-tools",
        "https://www.pinterest.com/doitwithai/",
        "https://www.tiktok.com/@doitwithai.tools",
        "https://www.youtube.com/@doitwithaitools",
        "https://www.instagram.com/doitwithaitools",
        "https://linktr.ee/doitwithaitools"
      ]
    }`
  };
}

// NEW: IMAGE GALLERY SCHEMA FOR IMAGE SEARCH DOMINANCE
function imageGallerySchema() {
  return {
    __html: `{
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      "name": "Do It With AI Tools - Official Brand Images",
      "description": "Official images, screenshots, and logos for Do It With AI Tools - Your modern AI hub for SEO and productivity",
      "url": "${getBaseUrl()}",
      "image": [
        {
          "@type": "ImageObject",
          "contentUrl": "${getBaseUrl()}/logoForHeader.png",
          "name": "Do It With AI Tools Logo - Header Version",
          "description": "Official Do It With AI Tools logo for website header",
          "width": 600,
          "height": 60,
          "caption": "Do It With AI Tools - Modern AI Hub Logo",
          "keywords": "do it with ai tools, doitwithai.tools, ai tools logo"
        },
        {
          "@type": "ImageObject",
          "contentUrl": "${getBaseUrl()}/Logo-of-Do-it-with-ai-tools.ico",
          "name": "Do It With AI Tools Full Logo",
          "description": "Full version logo for Do It With AI Tools brand",
          "width": 1200,
          "height": 630,
          "caption": "Do It With AI Tools Complete Brand Logo",
          "keywords": "do it with ai, do it with ai tools, ai seo tools"
        },
        {
          "@type": "ImageObject",
          "contentUrl": "${getBaseUrl()}/Png-Logo-of-Do-it-with-ai-tools.png",
          "name": "Do It With AI Tools Png Logo",
          "description": "Full png version logo for Do It With AI Tools brand",
          "width": 1200,
          "height": 630,
          "caption": "Do It With AI Tools Complete Brand Logo",
          "keywords": "do it with ai, do it with ai tools, ai seo tools"
        },
        {
          "@type": "ImageObject",
          "contentUrl": "${getBaseUrl()}/homepage-hero-screenshot.png",
          "name": "Do It With AI Tools Homepage Hero Section",
          "description": "Screenshot of Do It With AI Tools homepage showcasing AI-powered SEO and productivity features",
          "width": 1920,
          "height": 1080,
          "caption": "Do It With AI Tools Homepage - Modern AI Hub Interface",
          "keywords": "do it with ai tools, ai seo platform, ai productivity tools"
        },
        {
          "@type": "ImageObject",
          "contentUrl": "${getBaseUrl()}/doitwithai-homepage-animated.gif",
          "name": "Do It With AI Tools Interactive Demo",
          "description": "Animated demonstration of Do It With AI Tools platform features and capabilities",
          "width": 1200,
          "height": 675,
          "caption": "Do It With AI Tools Platform Demo Animation",
          "keywords": "do it with ai, ai tools demo, interactive ai platform"
        },
        {
          "@type": "ImageObject",
          "contentUrl": "${getBaseUrl()}/doitwithai-logo-square.png",
          "name": "Do It With AI Tools Square Logo",
          "description": "Square format logo for Do It With AI Tools social media profiles",
          "width": 512,
          "height": 512,
          "caption": "Do It With AI Tools Square Logo for Social Media",
          "keywords": "do it with ai tools logo, ai brand identity"
        },
        {
          "@type": "ImageObject",
          "contentUrl": "${getBaseUrl()}/doitwithai-transparent-logo-square.png",
          "name": "Do It With AI Tools Transparent Square Logo",
          "description": "Transparent square format logo for Do It With AI Tools social media profiles",
          "width": 512,
          "height": 512,
          "caption": "Do It With AI Tools Square Logo for Social Media",
          "keywords": "do it with ai tools logo, ai brand identity"
        },
        {
          "@type": "ImageObject",
          "contentUrl": "${getBaseUrl()}/doitwithai-og-image.png",
          "name": "Do It With AI Tools Open Graph Image",
          "description": "Social sharing image for Do It With AI Tools showing AI SEO and productivity features",
          "width": 1200,
          "height": 630,
          "caption": "Do It With AI Tools Social Media Preview",
          "keywords": "do it with ai tools, ai seo, ai productivity"
        }
      ],
      "publisher": {
        "@type": "Organization",
        "name": "Do It With AI Tools",
        "alternateName": "do it with ai tools",
        "logo": "${getBaseUrl()}/logoForHeader.png"
      }
    }`
  };
}

// NEW: AUTHOR PROFILE SCHEMA
function authorSchema() {
  return {
    __html: `{
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": "${getBaseUrl()}/#sufian-mustafa",
      "name": "Sufian Mustafa",
      "alternateName": "Sufian Mustafa - Do It With AI Tools Founder",
      "url": "${getBaseUrl()}/about",
      "image": {
        "@type": "ImageObject",
        "url": "${getBaseUrl()}/sufian-mustafa-founder.jpg",
        "width": 800,
        "height": 800,
        "caption": "Sufian Mustafa - Founder of Do It With AI Tools"
      },
      "jobTitle": "Founder & AI Content Strategist",
      "description": "Sufian Mustafa is the founder of Do It With AI Tools, a modern AI platform helping creators and businesses master generative AI for content creation, SEO optimization, and productivity enhancement. With expertise in AI-powered content strategies, SEO, and digital marketing, Sufian created Do It With AI Tools to bridge the gap between AI potential and practical business applications.",
      "knowsAbout": [
        "AI Content Creation",
        "SEO Optimization",
        "Generative Engine Optimization (GEO)",
        "Answer Engine Optimization (AEO)",
        "AI Tools and Platforms",
        "Content Strategy",
        "Prompt Engineering",
        "Digital Marketing with AI",
        "Business Growth with AI"
      ],
      "knowsLanguage": ["en"],
      "nationality": {
        "@type": "Country",
        "name": "Pakistan"
      },
      "worksFor": {
        "@type": "Organization",
        "name": "Do It With AI Tools",
        "alternateName": "do it with ai tools",
        "url": "${getBaseUrl()}"
      },
      "founder": {
        "@type": "Organization",
        "name": "Do It With AI Tools",
        "url": "${getBaseUrl()}"
      },
      "sameAs": [
        "https://x.com/doitwithaitools",
        "https://www.linkedin.com/company/do-it-with-ai-tools",
        "https://linktr.ee/doitwithaitools"
      ],
      "email": "sufianmustafa0900@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Islamabad",
        "addressCountry": "PK"
      }
    }`
  };
}

// NEW: BRAND SCHEMA FOR MAXIMUM BRAND RECOGNITION
function brandSchema() {
  return {
    __html: `{
      "@context": "https://schema.org",
      "@type": "Brand",
      "name": "Do It With AI Tools",
      "alternateName": ["do it with ai", "do it with ai tools", "doitwithai.tools", "DoItWithAI", "DIWAI Tools"],
      "url": "${getBaseUrl()}",
      "logo": {
        "@type": "ImageObject",
        "url": "${getBaseUrl()}/logoForHeader.png",
        "width": 600,
        "height": 60,
        "caption": "Do It With AI Tools Official Logo"
      },
      "image": [
        "${getBaseUrl()}/logoForHeader.png",
        "${getBaseUrl()}/doitwithai-tools-logo-full.png",
        "${getBaseUrl()}/doitwithai-logo-square.png",
        "${getBaseUrl()}/homepage-hero-screenshot.png"
      ],
      "description": "Do It With AI Tools is a trusted brand in AI-powered content creation and SEO optimization, founded by Sufian Mustafa. We help businesses, marketers, and creators leverage generative AI to boost rankings, create better content, and scale operations efficiently.",
      "slogan": "Learn, Build, and Grow with AI",
      "founder": {
        "@type": "Person",
        "name": "Sufian Mustafa",
        "url": "${getBaseUrl()}/about"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "127",
        "bestRating": "5",
        "worstRating": "1"
      }
    }`
  };
}


  function videoSchemaMarkup(resources) {
    const videoResources = resources.filter(res => res.resourceFormat === 'video');

    if (!videoResources.length) {
      return null;
    }

    return {
      __html: JSON.stringify(videoResources.map(resource => {
        const thumbnailUrl = resource.previewSettings?.previewImage?.asset?.url || resource.mainImage?.asset?.url || null;
        const videoUrl = resource.resourceFile?.url || null;

        if (!thumbnailUrl || !videoUrl) {
          return null;
        }

        return {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          "name": resource.title,
          "description": resource.overview,
          "uploadDate": resource.publishedAt,
          "thumbnailUrl": thumbnailUrl,
          "contentUrl": videoUrl,
          "embedUrl": videoUrl,
          "duration": "PT5M",
          "interactionStatistic": {
            "@type": "InteractionCounter",
            "interactionType": { "@type": "WatchAction" }
          }
        };
      }).filter(Boolean))
    };
  }
function breadcrumbSchema() {
  return {
    __html: `{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "${getBaseUrl()}/"
        }
      ]
    }`
  };
}
  return (
    <>
    <Head>
       <NextSeo
        title="Your Modern AI Hub for SEO & Business Scale | Do It With AI Tools"
        description="Do It With AI Tools offers AI insights to master generative AI that boost SEO & content creation, grow your business, and improve overall productivity."
        canonical={getBaseUrl()}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: getBaseUrl(),
          siteName: 'doitwithai.tools',
          title: 'Your Modern AI Hub for SEO & Business Scale | Do It With AI Tools',
          description: 'Do It With AI Tools offers AI insights to master generative AI that boost SEO & content creation, grow your business, and improve overall productivity.',
          images: [
            {
           url: metadata.openGraph.url,
              width: 1200,
              height: 630,
              alt: 'doitwithai.tools - Boost Your SEO and Daily Productivity with Cutting-Edge AI Tools',
            }
          ],
        }}
        twitter={{
          handle: '@doitwithai',
          site: '@doitwithai',
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: 'AI tools, SEO optimization, productivity, artificial intelligence, AI SEO, automation, AI resources, digital marketing, AI productivity tools'
          },
          {
            name: 'author',
            content: 'Sufian Mustafa'
          },
          {
            name: 'robots',
            content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
          },
          {
            name: 'googlebot',
            content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
          },
          {
            name: 'theme-color',
            content: '#2563eb'
          },
          {
            name: 'application-name',
            content: 'doitwithai.tools'
          },
          {
            name: 'msapplication-TileColor',
            content: '#2563eb'
          },
          {
            name: 'apple-mobile-web-app-capable',
            content: 'yes'
          },
          {
            name: 'apple-mobile-web-app-status-bar-style',
            content: 'black-translucent'
          }
        ]}
        additionalLinkTags={[
          {
            rel: 'icon',
            href: '/favicon.ico'
          },
          {
            rel: 'apple-touch-icon',
            href: '/apple-touch-icon.png'
          }
        ]}
      />
    </Head>
      {/* Enhanced Schema.org JSON-LD structured data */}
     <Script
        id="WebsiteSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaMarkup()}
      />
      
      <Script
        id="OrganizationSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={organizationSchema()}
      />
      
      {/* NEW SCHEMAS */}
      <Script
        id="AuthorSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={authorSchema()}
      />
      
      <Script
        id="BrandSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={brandSchema()}
      />
      
      <Script
        id="ImageGallerySchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={imageGallerySchema()}
      />
      
      <Script
        id="BreadcrumbSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={breadcrumbSchema()}
      />

      


  {freeResourcesFeatured.length > 0 && (
        <Script
          id="VideoObjectSchema"
          type="application/ld+json"
          // Pass the correct variable to the function
          dangerouslySetInnerHTML={videoSchemaMarkup(freeResourcesFeatured)}
        />
      )}


      <PageCacheProvider pageType="homepage" pageId="main">
        <HomePageCode initialServerData={initialServerData} />
      </PageCacheProvider>
    </>
  )
}