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

  authors: [{ name: "Sufian Mustafa" }],
  creator: "Sufian Mustafa",
  publisher: "Do It With AI Tools",

  keywords: "AI content creation, AI SEO, generative AI, content optimization, ChatGPT content, AI writing tools, SEO with AI, content marketing AI, prompt engineering, AI content strategy, AI productivity, business scale",
 other: {
    'ai-content-declaration': 'human-created, ai-assisted',
  },
  openGraph: {
    title: "Your Modern AI Hub for SEO & Business Scale",
    description: "Do It With AI Tools offers AI insights to master generative AI that boost SEO & content creation, grow your business, and improve overall productivity.",
    url: getBaseUrl(),
    type: "website",
    siteName: "Do It With AI Tools",
    locale: "en_US",
    images: [{
      url: generateOGImageURL({
        title: "Master Generative AI for SEO, Content & Business Growth",
        ctaText: "Start Your AI Journey",
        features: "AI Content,SEO,Productivity",
      }),
      width: 1200,
      height: 630,
      alt: "Master Generative AI for SEO, Content & Business Growth - Do It With AI Tools",
    }]
  },

  twitter: {
    card: "summary_large_image",
    site: "@doitwithai",
    creator: "@doitwithai",
    domain: "doitwithai.tools",
    url: getBaseUrl(),
    title: "Your Modern AI Hub for SEO & Business Scale",
    description: "Do It With AI Tools offers AI insights to master generative AI that boost SEO & content creation, grow your business, and improve overall productivity.",
    image: generateOGImageURL({
      title: "Master Generative AI for SEO, Content & Business Growth",
      ctaText: "Start Your AI Journey",
      features: "AI Content,SEO,Productivity",
    })
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
function schemaMarkup() {
  return {
    __html: `{
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Do It With AI Tools",
      "alternateName": ["doitwithai.tools", "Do It With AI", "DoItWithAI", "DIWAI Tools", "AI Content & SEO Hub"],
      "url": "${getBaseUrl()}/",
      "description": "Do It With AI Tools offers expert AI insights to help you master generative AI for content creation, boost SEO performance, enhance productivity, and strategically scale your business. Discover proven workflows, practical strategies, and free resources to create high-quality content that ranks on traditional search engines and leverages AI-powered search and answer engines effectively. Ideal for marketers, content creators, and businesses aiming to grow with AI.",
      "publisher": {
        "@type": "Organization",
        "name": "Do It With AI Tools",
        "logo": {
          "@type": "ImageObject",
          "url": "${getBaseUrl()}/logoForHeader.png",
          "width": 600,
          "height": 60
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
            "description": "Master AI-powered SEO for content creators and marketers. Learn advanced strategies for keyword research, content optimization, technical SEO, on-page and off-page tactics using AI tools. Create content optimized for traditional search engines (SEO), AI search (GEO), and answer engines (AEO) that ranks higher and converts better."
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "AI Tools - Content Creation & SEO",
            "url": "${getBaseUrl()}/ai-tools",
            "description": "Discover powerful AI tools for content creation, SEO optimization, and workflow automation. Expert reviews and strategic guides on ChatGPT, Gemini, Claude, and specialized tools that help content creators and marketers produce better content faster while maintaining quality and search visibility."
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "AI Learn & Earn - Content Skills & Income",
            "url": "${getBaseUrl()}/ai-learn-earn",
            "description": "Learn AI-powered content creation and SEO skills that generate income. Practical guides for freelance content writing, SEO consulting, and monetizing AI expertise. Transform your content and SEO knowledge into profitable opportunities through proven strategies and actionable tutorials."
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": "AI Code - Web Development & Content Platforms",
            "url": "${getBaseUrl()}/ai-code",
            "description": "Build content platforms and SEO-optimized websites using AI coding assistants. Learn how to create blogs, landing pages, and content management systems with ChatGPT and AI development tools. Perfect for content creators wanting technical skills to build their own platforms."
          },
          {
            "@type": "ListItem",
            "position": 5,
            "name": "Free AI Resources - Templates & Tools",
            "url": "${getBaseUrl()}/free-ai-resource",
            "description": "Access free AI resources for content creation and SEO including prompts, templates, content calendars, keyword research tools, and optimization checklists. High-quality downloadable assets that help content creators and marketers implement AI strategies without cost."
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
      "alternateName": ["doitwithai.tools", "Do It With AI", "DoItWithAI", "DIWAI Tools"],
      "url": "${getBaseUrl()}",
      "logo": "${getBaseUrl()}/logoForHeader.png",
      "description": "Do It With AI Tools is a specialized platform founded by Sufian Mustafa, dedicated to helping content creators, marketers, and businesses master generative AI for content creation and SEO optimization. We provide expert strategies, proven workflows, and free resources for creating high-quality content optimized for traditional search (SEO), AI-powered search engines (GEO - Generative Engine Optimization), and answer engines (AEO - Answer Engine Optimization).",
      "founder": {
        "@type": "Person",
        "name": "Sufian Mustafa",
        "jobTitle": "Founder & AI Content Strategist",
      "description": "Do It With AI Tools is a modern AI platform founded by Sufian Mustafa, dedicated to helping content creators, marketers, developers, and businesses leverage generative AI to create high-quality content, optimize SEO, boost productivity, and scale projects and businesses. We provide expert strategies, proven human-AI workflows, and free AI resources to optimize content for traditional search (SEO), AI-powered search engines (GEO - Generative Engine Optimization), and answer engines (AEO - Answer Engine Optimization)."       
        },
      "foundingDate": "2024",
      "slogan": "Learn, Build, and Grow with AI",
      "knowsAbout": ["AI Content Creation", "SEO Optimization", "Generative Engine Optimization (GEO)", "Answer Engine Optimization (AEO)", "Content Marketing", "AI Tools", "Prompt Engineering", "Content Strategy"],
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
        "https://linktr.ee/doitwithaitools?"
      ]
    }`
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