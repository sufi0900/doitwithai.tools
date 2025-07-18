import React from 'react'
import HomePageCode from "./HomePageCode"
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";
export const revalidate = false;
export const dynamic = "force-dynamic";
import {redisHelpers} from '@/app/lib/redis';
import { client } from "@/sanity/lib/client";
import UnifiedCacheMonitor from '@/React_Query_Caching/UnifiedCacheMonitor';
import { PageCacheProvider } from '@/React_Query_Caching/CacheProvider';

export const metadata = {
  title: "Do it with AI tools – Double your SEO power & Explore AI Abilities",
  description:
    "Do it with AI tools provides cutting-edge AI insights that help you revolutionize and double your SEO results, and improve your overall AI skills & knowledge",
  author: "Sufian Mustafa",
  openGraph: {
    images: '',
  },
  images: [
    {
      url: '',
      width: 1200,
      height: 630,
    },
    {
      url: '',
      width: 800,
      height: 600,
    }
  ],
  keywords: "AI tools, artificial intelligence, AI coding, AI SEO, AI resources, AI monetization, free AI resources, next.js AI, AI productivity, AI for business"
};

const HOMEPAGE_FREE_RESOURCES_LIMIT = 3; // From the provided code for DynamicResourceCarousel


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
    // Continue to fetch from Sanity if Redis fails
  }

  console.log(`[Sanity Fetch] for ${cacheKey} starting...`);

  // Define all queries concurrently
  const queries = {
    // Trending
    trendBig: `*[_type in ["makemoney","freeairesources","news","coding","aitool","seo"]&&displaySettings.isHomePageTrendBig==true][0...1]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
    trendRelated: `*[_type in ["makemoney","freeairesources","news","coding","aitool","seo"]&&displaySettings.isHomePageTrendRelated==true][0...3]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,

    // Feature Post
    featureBig: `*[_type in ["makemoney","freeairesources","news","coding","aitool","seo"]&&displaySettings.isHomePageFeatureBig==true][0...1]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
    featureRelated: `*[_type in ["makemoney","freeairesources","news","coding","aitool","seo"]&&displaySettings.isHomePageFeatureRelated==true][0...3]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,

    // AI SEO
    seoTrendBig: `*[_type=="seo"&&displaySettings.isHomePageSeoTrendBig==true][0...1]{_id,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
    seoTrendRelated: `*[_type=="seo"&&displaySettings.isHomePageSeoRelated==true][0...3]{_id,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,

    // Mixed Categories Section
    aiToolsQuery: `*[_type=="aitool"&&displaySettings.isHomePageAIToolTrendRelated==true][0...2]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt}`,
    aiCodeQuery: `*[_type=="coding"&&displaySettings.isHomePageCoding==true][0...2]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt}`,
    aiEarnQuery: `*[_type=="makemoney"&&displaySettings.isHomePageAiEarnTrendBig==true][0...2]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt}`,

    // Recent Posts
    recentPosts: `*[_type in ["makemoney","aitool","coding","freeairesources","seo","news"]]|order(publishedAt desc)[0...5]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt}`,

    // Free AI Resources (FeaturedResourcesHorizontal component)
    freeResourcesFeatured: `*[_type=="freeResources"&&isHomePageFeature==true]|order(publishedAt desc)[0...${HOMEPAGE_FREE_RESOURCES_LIMIT}]{_id,title,slug,tags,mainImage,overview,resourceType,resourceFormat,resourceLink,resourceLinkType,content,publishedAt,"resourceFile":resourceFile.asset->,promptContent,previewSettings,_updatedAt}`,
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

    // --- IMPORTANT: Ensure all single-result queries are wrapped in arrays ---
    const trendBigData = fetchedTrendBig ? [fetchedTrendBig] : [];
    const trendRelatedData = fetchedTrendRelated || []; // This is already an array from Sanity

    const featureBigData = fetchedFeatureBig ? [fetchedFeatureBig] : [];
    const featureRelatedData = fetchedFeatureRelated || []; // This is already an array from Sanity
 
    const seoTrendBigData = fetchedSeoTrendBig ? [fetchedSeoTrendBig] : [];
    // seoTrendRelatedData will already be an array due to [0...3]
    const seoTrendRelatedData = fetchedSeoTrendRelated || [];
    
    const aiToolsData = fetchedAiTools || [];
    const aiCodeData = fetchedAiCode || [];
    const aiEarnData = fetchedAiEarn || [];

    const recentPostsData = fetchedRecentPosts || [];
    const freeResourcesFeaturedData = fetchedFreeResourcesFeatured || [];


    const data = {
      trending: { trendBigData, trendRelatedData },
      featurePost: { featureBigData, featureRelatedData }, // <-- Ensure featureBigData is an array here
      aiSeo: { seoTrendBigData, seoTrendRelatedData }, // Pass the consistently array-wrapped data
      mixedCategories: { aiToolsData, aiCodeData, aiEarnData },
      recentPosts: recentPostsData,
      freeResourcesFeatured: freeResourcesFeaturedData,
      timestamp: Date.now()
    };

    console.log(`[Sanity Fetch] for ${cacheKey} completed in ${Date.now() - startTime}ms`);

    // Only cache if we got some meaningful data
    if (Object.values(data).some(d => d !== null && (Array.isArray(d) ? d.length > 0 : true))) {
      try {
        await redisHelpers.set(cacheKey, data, { ex: 3600 }); // Cache for 1 hour
        console.log(`[Redis Cache Set] for ${cacheKey}`);
      } catch (redisSetError) {
        console.error(`Redis set error for ${cacheKey}:`, redisSetError.message);
      }
    }

    return { ...data, __source: 'server-network' };
  } catch (error) {
    console.error(`Server-side fetch for Homepage failed:`, error.message);
    return null; // Return null on error
  }
}


export default async function Page() {
    const initialServerData = await getHomePageInitialData();

  function schemaMarkup() {
    return {
      __html: `{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Do it with AI Tools",
        "url": "https://www.doitwithai.tools/",
        "description": "Do it with AI Tools is your central platform to master SEO using cutting-edge AI insights and discover how artificial intelligence can revolutionize your daily tasks. We empower businesses, creators, and marketers double SEO performance and boost overall productivity by strategically automating repetitive tasks using our free AI resources. Explore our in-depth strategies and tools, designed for anyone looking to unlock the full potential of AI in real-world workflows.",
        "publisher": {
          "@type": "Organization",
          "name": "Do it with AI Tools",
          "logo": {
            "@type": "ImageObject",
            "url": "",
            "width": 600,
            "height": 60
          }
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.doitwithai.tools/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        },
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "AI Tools",
              "url": "https://www.doitwithai.tools/ai-tools",
              "description": "Discover powerful AI tools to streamline SEO tasks, automate daily workflows, and boost overall productivity. Explore solutions tailored for marketers, creators, and AI enthusiasts looking to work smarter with cutting-edge automation and insight-driven platforms."
            },
             {
              "@type": "ListItem",
              "position": 2,
              "name": "AI SEO",
              "url": "https://www.doitwithai.tools/ai-seo",
              "description": "Master modern SEO using the power of AI. Explore expert strategies for keyword research, content creation, technical SEO, on-page and off-page optimization, and link building using AI-driven tools. This category helps you double your SEO performance with less effort and more impact."
            },
           
            {
              "@type": "ListItem",
              "position": 3,
              "name": "AI Learn & Earn",
              "url": "https://www.doitwithai.tools/ai-learn-earn",
              "description": "Use AI to learn in-demand skills, unlock new income opportunities, and transform your digital future. Whether you're a beginner or scaling up, discover simple, practical ways to earn online using AI-powered learning, freelancing, content creation, and automation strategies."
            },
             {
              "@type": "ListItem",
              "position": 4,
              "name": "AI Code",
              "url": "https://www.doitwithai.tools/ai-code",
              "description": "Learn how to accelerate development, solve coding problems, and build smarter applications using AI. From generating code snippets to deploying full-stack projects, this section helps developers and learners leverage ChatGPT and other AI tools to make programming easier and more efficient."
            },
           
            {
              "@type": "ListItem",
              "position": 5,
              "name": "Free AI Resources",
              "url": "https://www.doitwithai.tools/ai-free-resources",
              "description": "Access a growing library of free downloadable AI resources including templates, prompts, videos, documents, and guides. Ideal for content creators, marketers, and developers looking for high-quality tools to kickstart their AI journey without spending a dime."
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
      "name": "Do it with AI Tools", 
      "url": "https://www.doitwithai.tools",
      "logo": "https://www.doitwithai.tools/logoForHeader.png", 
      "description": "Do it with AI Tools is an AI-focused content hub empowering creators, developers, marketers, and entrepreneurs with accessible, actionable AI knowledge and resources to boost productivity and SEO.", 
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service", 
        "email": "sufianmustafa0900@gmail.com", 
        "url": "https://www.doitwithai.tools/contact", 
        "areaServed": "Worldwide", 
        "availableLanguage": ["en"] 
      },
      "sameAs": [
        "https://twitter.com/doitwithai",
        "https://www.facebook.com/doitwithai",
        "https://www.linkedin.com/company/doitwithai"
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
            "item": "https://www.doitwithai.tools/"
          }
        ]
      }`
    };
  }


  return (
    <>
      <Head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta property="og:site_name" content="Do It With AI" />
        <meta property="og:locale" content="en_US" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description}/>
        <meta name="author" content={metadata.author} />
        <meta name="keywords" content={metadata.keywords} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.doitwithai.tools/" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content="" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="doitwithai.tools" />
        <meta property="twitter:url" content="https://www.doitwithai.tools/" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://www.doitwithai.tools/"/>
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Additional Meta Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="revisit-after" content="7 days" />

        <NextSeo
          title={metadata.title}
          description={metadata.description}
          author={metadata.author}
          type="website"
          locale="en_US"
          site_name="Do It With AI Tools"
          canonical="https://www.doitwithai.tools/"
          openGraph={{
            title: metadata.title,
            description: metadata.description,
            url: "https://www.doitwithai.tools/",
            type: "website",
            images: metadata.images
          }}
          twitter={{
            handle: "@doitwithai",
            site: "@doitwithai",
            cardType: "summary_large_image",
          }}
          additionalMetaTags={[
            {
              name: "application-name",
              content: "Do It With AI"
            },
            {
              name: "msapplication-TileColor",
              content: "#ffffff"
            }
          ]}
        />
      </Head>

      {/* Schema.org JSON-LD structured data */}
      <Script
        id="WebsiteSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaMarkup()}
        key="website-jsonld"
      />
      
      
      <Script
        id="OrganizationSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={organizationSchema()}
        key="organization-jsonld"
      />
      
      <Script
        id="BreadcrumbSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={breadcrumbSchema()}
        key="breadcrumb-jsonld"
      />
           <PageCacheProvider pageType="homepage" pageId="main"> 
            {/* <UnifiedCacheMonitor /> */}

        <HomePageCode initialServerData={initialServerData} />
        </PageCacheProvider>
    </>
  )
}