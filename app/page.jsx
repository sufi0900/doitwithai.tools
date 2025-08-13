import React from 'react'
import HomePageCode from "./HomePageCode"
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";
export const revalidate = false;
export const dynamic = "force-dynamic";
import { redisHelpers } from '@/app/lib/redis';
import { client } from "@/sanity/lib/client";
import { PageCacheProvider } from '@/React_Query_Caching/CacheProvider';

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

// Enhanced metadata with consistent branding
export const metadata = {
  title: "Boost Your SEO and Daily Productivity with AI | doitwithai.tools",
  description: "Do It With AI Tools offers advanced AI insights and proven strategies to master AI tools that boost SEO, grow your business, & improve overall productivity.",
  authors: [{ name: "Sufian Mustafa" }],
creator: "Sufian Mustafa",
  publisher: "doitwithai.tools",

  keywords: "AI tools, SEO optimization, productivity, artificial intelligence, AI SEO, automation, AI resources, digital marketing, AI productivity tools",
  openGraph: {
    images: [{
      url: generateOGImageURL({
        title: 'Boost Your SEO and Daily Productivity with Cutting-Edge AI Tools',
        // description: 'Your go-to resource hub for mastering AI tools that double your SEO power, grow your business, and improve your overall productivity.',
        category: 'AI Tools',
        ctaText: 'Start Your AI Journey Now',
        features: 'AI-Powered SEO,10x Productivity,50+ Free Resources',
      }),
      width: 1200,
      height: 630,
      alt: 'doitwithai.tools - Boost Your SEO and Daily Productivity with Cutting-Edge AI Tools',
    }],
    siteName: "doitwithai.tools",
    locale: 'en_US',
    url: getBaseUrl(),
    type: 'website',
    title: "Boost Your SEO and Daily Productivity with AI | doitwithai.tools",
    description: "doitwithai.tools offers advanced AI insights and proven strategies to master AI tools that boost SEO, grow your business, & improve overall productivity."
  },
  twitter: {
    card: "summary_large_image",
    site: "@doitwithai",
    creator: "@doitwithai", 
    domain: "doitwithai.tools",
    url: getBaseUrl(),
    title: "Best AI Tools for Productivity | doitwithai.tools",
    // description: "Explore comprehensive guides on the Best AI Tools for Productivity. Detailed reviews of top AI solutions to boost your SEO and daily productivity.",
    image: generateOGImageURL({
      title: 'Boost Your SEO and Daily Productivity with Cutting-Edge AI Tools',
      description: 'Your go-to resource hub for mastering AI tools that double your SEO power, grow your business, and improve your overall productivity.',
      category: 'AI Tools',
      ctaText: 'Start Your AI Journey Now',
      features: 'AI-Powered SEO,10x Productivity,50+ Free Resources',
    }),
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
    },
  },
};

const HOMEPAGE_FREE_RESOURCES_LIMIT = 3;

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
    trendRelated: `*[_type in ["makemoney","freeairesources","news","coding","aitool","seo"]&&displaySettings.isHomePageTrendRelated==true][0...3]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
    featureBig: `*[_type in ["makemoney","freeairesources","news","coding","aitool","seo"]&&displaySettings.isHomePageFeatureBig==true][0...1]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
    featureRelated: `*[_type in ["makemoney","freeairesources","news","coding","aitool","seo"]&&displaySettings.isHomePageFeatureRelated==true][0...3]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
    seoTrendBig: `*[_type=="seo"&&displaySettings.isHomePageSeoTrendBig==true][0...1]{_id,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
    seoTrendRelated: `*[_type=="seo"&&displaySettings.isHomePageSeoRelated==true][0...3]{_id,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
    aiToolsQuery: `*[_type=="aitool"&&displaySettings.isHomePageAIToolTrendRelated==true][0...2]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt}`,
    aiCodeQuery: `*[_type=="coding"&&displaySettings.isHomePageCoding==true][0...2]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt}`,
    aiEarnQuery: `*[_type=="makemoney"&&displaySettings.isHomePageAiEarnTrendBig==true][0...2]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt}`,
    recentPosts: `*[_type in ["makemoney","aitool","coding","freeairesources","seo","news"]]|order(publishedAt desc)[0...5]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt}`,
    freeResourcesFeatured: `*[_type=="freeResources"&&isHomePageFeature==true]|order(publishedAt desc)[0...${HOMEPAGE_FREE_RESOURCES_LIMIT}]{_id,title,slug,tags,mainImage,overview,resourceType,resourceFormat,resourceLink,resourceLinkType,content,publishedAt,"resourceFile":resourceFile.asset->,promptContent,previewSettings,   "relatedArticle": relatedArticle-> {
    title,
    slug,
    _type,
    tags,
    excerpt
  },
  aiToolDetails,
   _updatedAt  }`,
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

  function schemaMarkup() {
    return {
      __html: `{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "doitwithai.tools",
        "alternateName": "Do It With AI Tools",
        "url": "${getBaseUrl()}/",
        "description": "doitwithai.tools is your central platform to master SEO using cutting-edge AI insights and discover how artificial intelligence can revolutionize your daily tasks. We empower businesses, creators, and marketers to double SEO performance and boost overall productivity by strategically automating repetitive tasks using our free AI resources.",
        "publisher": {
          "@type": "Organization",
          "name": "doitwithai.tools",
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
              "name": "AI Tools",
              "url": "${getBaseUrl()}/ai-tools",
              "description": "Discover powerful AI tools to streamline SEO tasks, automate daily workflows, and boost overall productivity. Explore solutions tailored for marketers, creators, and AI enthusiasts looking to work smarter with cutting-edge automation and insight-driven platforms."
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "AI SEO",
              "url": "${getBaseUrl()}/ai-seo",
              "description": "Master modern SEO using the power of AI. Explore expert strategies for keyword research, content creation, technical SEO, on-page and off-page optimization, and link building using AI-driven tools. This category helps you double your SEO performance with less effort and more impact."
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "AI Learn & Earn",
              "url": "${getBaseUrl()}/ai-learn-earn",
              "description": "Use AI to learn in-demand skills, unlock new income opportunities, and transform your digital future. Whether you're a beginner or scaling up, discover simple, practical ways to earn online using AI-powered learning, freelancing, content creation, and automation strategies."
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": "AI Code",
              "url": "${getBaseUrl()}/ai-code",
              "description": "Learn how to accelerate development, solve coding problems, and build smarter applications using AI. From generating code snippets to deploying full-stack projects, this section helps developers and learners leverage ChatGPT and other AI tools to make programming easier and more efficient."
            },
            {
              "@type": "ListItem",
              "position": 5,
              "name": "Free AI Resources",
              "url": "${getBaseUrl()}/free-ai-resource",
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
        "name": "doitwithai.tools",
        "alternateName": "Do It With AI Tools",
        "url": "${getBaseUrl()}",
        "logo": "${getBaseUrl()}/logoForHeader.png",
        "description": "doitwithai.tools is an AI-focused content hub empowering creators, developers, marketers, and entrepreneurs with accessible, actionable AI knowledge and resources to boost productivity and SEO.",
        "foundingDate": "2024",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "sufianmustafa0900@gmail.com",
          "url": "${getBaseUrl()}/contact",
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
            "item": "${getBaseUrl()}/"
          }
        ]
      }`
    };
  }

  function faqSchema() {
    return {
      __html: `{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is doitwithai.tools?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "doitwithai.tools is your go-to resource hub for mastering AI tools that boost SEO performance, enhance productivity, and provide free AI resources for creators, marketers, and developers."
            }
          },
          {
            "@type": "Question",
            "name": "Are the AI resources really free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! We offer 50+ completely free AI resources including templates, prompts, guides, and tools to help you get started with AI without any cost."
            }
          },
          {
            "@type": "Question",
            "name": "How can AI improve my SEO?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "AI can revolutionize your SEO through automated keyword research, content optimization, technical SEO analysis, and data-driven insights that help you achieve better rankings with less manual effort."
            }
          }
        ]
      }`
    };
  }

  return (
    <>
    <Head>
       <NextSeo
        title="Boost Your SEO and Daily Productivity with AI | doitwithai.tools"
        description="doitwithai.tools offers advanced AI insights and proven strategies to master AI tools that boost SEO, grow your business, & improve overall productivity."
        canonical={getBaseUrl()}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: getBaseUrl(),
          siteName: 'doitwithai.tools',
          title: 'Boost Your SEO and Daily Productivity with AI | doitwithai.tools',
          description: 'doitwithai.tools offers advanced AI insights and proven strategies to master AI tools that boost SEO, grow your business, & improve overall productivity.',
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
        key="website-jsonld"
        strategy="beforeInteractive"
      />
      
      <Script
        id="OrganizationSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={organizationSchema()}
        key="organization-jsonld"
        strategy="beforeInteractive"
      />
      
      <Script
        id="BreadcrumbSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={breadcrumbSchema()}
        key="breadcrumb-jsonld"
        strategy="beforeInteractive"
      />

      <Script
        id="FAQSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={faqSchema()}
        key="faq-jsonld"
        strategy="beforeInteractive"
      />

      <PageCacheProvider pageType="homepage" pageId="main">
        <HomePageCode initialServerData={initialServerData} />
      </PageCacheProvider>
    </>
  )
}