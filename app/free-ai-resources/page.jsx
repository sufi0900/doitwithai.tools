import React from 'react';
import Script from "next/script";
import { NextSeo } from "next-seo";
import { redisHelpers } from '@/app/lib/redis';
import { client } from "@/sanity/lib/client";
import StaticFreeResourcePageShell from "./StaticFreeResourcePageShell";
import AllBlogs from "./AllBlogs";
import Head from 'next/head';

export const revalidate = 3600; // Revalidate every 1 hour

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

export const metadata = {
  title: "Free AI Resources: Tools, Templates & Prompts | doitwithai.tools",
  description: "Access a massive collection of free AI tools, prompts, and templates. Supercharge your productivity and projects with our zero-cost, high-quality resources.",
  author: "Sufian Mustafa",
  keywords: "free AI resources, free AI images, AI prompts, AI solutions, free AI templates, AI for productivity, AI tools free",
  openGraph: {
    title: "Free AI Resources: Tools, Templates & Prompts | doitwithai.tools",
    description: "Your ultimate collection of high-quality AI tools, templates, prompts, and guides to kickstart your AI journey and solve real-world problems.",
    url: `${getBaseUrl()}/free-ai-resources`,
    type: "website",
    images: [{
      url: generateOGImageURL({
        title: 'Access our massive collection of free AI tools, prompts, and templates to supercharge your projects.',
        category: 'Free AI Resources',
        ctaText: 'Download Free Resources Now',
        features: 'Zero Cost, High Quality, Instant Access',
        bgColor: 'green'
      }),
      width: 1200,
      height: 630,
      alt: 'Free AI Resources',
    }],
    siteName: "doitwithai.tools",
    locale: 'en_US',
  },
  twitter: {
    card: "summary_large_image",
    domain: "doitwithai.tools",
    url: `${getBaseUrl()}/free-ai-resources`,
    title: "Free AI Resources: Tools, Templates & Prompts | doitwithai.tools",
    description: "Supercharge your projects with a massive collection of high-quality, zero-cost AI tools, prompts, and templates.",
    image: generateOGImageURL({
      title: 'Access our massive collection of free AI tools, prompts, and templates to supercharge your projects.',
      category: 'Free AI Resources',
      ctaText: 'Download Free Resources Now',
      features: 'Zero Cost, High Quality, Instant Access',
      bgColor: 'green'
    }),
    creator: "@doitwithai",
  },
  alternates: {
    canonical: `${getBaseUrl()}/free-ai-resources`,
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

const INITIAL_RESOURCE_LIST_LIMIT = 6;

async function getFreeResourcesInitialData() {
  const cacheKey = 'freeResources:initialPageData';
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

  // Enhanced query with all necessary fields for schema markup
const featuredResourceQuery = `*[_type=="freeResources" && isOwnPageFeature==true] | order(publishedAt desc)[0]{
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
  previewSettings,
  "resourceFile": resourceFile.asset->,
  content,
  publishedAt,
  promptContent,
  "relatedArticle": relatedArticle->{title, slug, _type, tags, excerpt},
  aiToolDetails,
  
  // Enhanced SEO fields
  seoKeywords,
  seoDescription,
  structuredData,
  
  // Image format specific fields
  imageMetadata{
    altText,
    caption,
    imageKeywords
  },
  
  // Video format specific fields
  videoMetadata{
    videoDescription,
    duration,
    transcript,
    videoKeywords
  },
  
  // Document format specific fields
  documentMetadata{
    documentSummary,
    documentType,
    pageCount,
    topicsCovered,
    documentKeywords,
    targetAudience
  },
  
  // Prompt/Text format specific fields
  promptMetadata{
    promptCategory,
    aiPlatforms,
    useCases,
    promptKeywords
  }
}`;

const listQuery = `*[_type=="freeResources"] | order(publishedAt desc)[0...${INITIAL_RESOURCE_LIST_LIMIT + 1}]{
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
  previewSettings,
  "resourceFile": resourceFile.asset->,
  content,
  publishedAt,
  promptContent,
  "relatedArticle": relatedArticle->{title, slug, _type, tags, excerpt},
  aiToolDetails,
  
  // Enhanced SEO fields
  seoKeywords,
  seoDescription,
  structuredData,
  
  // Format-specific metadata
  imageMetadata{
    altText,
    caption,
    imageKeywords
  },
  videoMetadata{
    videoDescription,
    duration,
    transcript,
    videoKeywords
  },
  documentMetadata{
    documentSummary,
    documentType,
    pageCount,
    topicsCovered,
    documentKeywords,
    targetAudience
  },
  promptMetadata{
    promptCategory,
    aiPlatforms,
    useCases,
    promptKeywords
  }
}`;
  const countsQuery = `{
    "all": count(*[_type == "freeResources"]),
    "image": count(*[_type == "freeResources" && resourceFormat == "image"]),
    "video": count(*[_type == "freeResources" && resourceFormat == "video"]),
    "text": count(*[_type == "freeResources" && resourceFormat == "text"]),
    "document": count(*[_type == "freeResources" && resourceFormat == "document"]),
    "aitool": count(*[_type == "freeResources" && resourceFormat == "aitool"])
  }`;



  try {
    const [featuredResource, resourceCounts, resourceList] = await Promise.all([
      client.fetch(featuredResourceQuery, {}, { next: { tags: ["freeResources"] } }),
      client.fetch(countsQuery, {}, { next: { tags: ["freeResources"] } }),
      client.fetch(listQuery, {}, { next: { tags: ["freeResources"] } })
    ]);

    const data = {
      featuredResource,
      resourceCounts,
      resourceList,
      timestamp: Date.now()
    };

    console.log(`[Sanity Fetch] for ${cacheKey} completed in ${Date.now() - startTime}ms`);

    if (data.resourceList?.length > 0 || data.featuredResource || Object.keys(data.resourceCounts).length > 0) {
      try {
        await redisHelpers.set(cacheKey, data, { ex: 3600 });
        console.log(`[Redis Cache Set] for ${cacheKey}`);
      } catch (redisSetError) {
        console.error(`Redis set error for ${cacheKey}:`, redisSetError.message);
      }
    }

    return { ...data, __source: 'server-network' };
  } catch (error) {
    console.error(`Server-side fetch for Free AI Resources page failed:`, error.message);
    return null;
  }
}

// Enhanced schema markup generation
// Enhanced schema markup generation function
function generateResourceSchemas(resources) {
  if (!resources || resources.length === 0) return [];
  
  return resources.map((resource, index) => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": getSchemaType(resource.resourceFormat),
      "name": resource.title,
      "description": resource.seoDescription || resource.overview,
      "datePublished": resource.publishedAt,
      "dateModified": resource.publishedAt,
      "author": {
        "@type": "Person",
        "name": "Sufian Mustafa",
        "url": `${getBaseUrl()}/author/sufian-mustafa`
      },
      "publisher": {
        "@type": "Organization",
        "name": "DoItWithAITools",
        "url": getBaseUrl()
      },
      "keywords": resource.seoKeywords || resource.tags,
      "inLanguage": "en-US",
      "isAccessibleForFree": true,
      "license": "https://creativecommons.org/licenses/by/4.0/"
    };

    // Add format-specific schema properties
    switch (resource.resourceFormat) {
      case 'image':
        return {
          ...baseSchema,
          "@type": "ImageObject",
          "contentUrl": resource.resourceFile?.url || resource.resourceLink,
          "thumbnailUrl": resource.previewSettings?.previewImage?.asset?.url,
          "caption": resource.imageMetadata?.caption,
          "text": resource.imageMetadata?.altText,
          "keywords": resource.imageMetadata?.imageKeywords || resource.seoKeywords,
          "representativeOfPage": resource.isOwnPageFeature || false,
          "acquireLicensePage": `${getBaseUrl()}/free-ai-resources`,
          "creditText": "DoItWithAITools",
          "creator": {
            "@type": "Person",
            "name": "Sufian Mustafa"
          }
        };

      case 'video':
        return {
          ...baseSchema,
          "@type": "VideoObject",
          "contentUrl": resource.resourceFile?.url || resource.resourceLink,
          "thumbnailUrl": resource.previewSettings?.previewImage?.asset?.url,
          "uploadDate": resource.publishedAt,
          "duration": resource.videoMetadata?.duration ? convertDurationToISO8601(resource.videoMetadata.duration) : undefined,
          "transcript": resource.videoMetadata?.transcript,
          "description": resource.videoMetadata?.videoDescription || resource.overview,
          "keywords": resource.videoMetadata?.videoKeywords || resource.seoKeywords,
          "embedUrl": resource.resourceLink,
          "interactionStatistic": {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/WatchAction",
            "userInteractionCount": 0
          }
        };

      case 'document':
        return {
          ...baseSchema,
          "@type": "DigitalDocument",
          "url": resource.resourceFile?.url || resource.resourceLink,
          "fileFormat": getFileFormat(resource.resourceFile?.originalFilename),
          "encodingFormat": getMimeType(resource.resourceFile?.originalFilename),
          "downloadUrl": resource.resourceFile?.url || resource.resourceLink,
          "abstract": resource.documentMetadata?.documentSummary,
          "numberOfPages": resource.documentMetadata?.pageCount,
          "audience": {
            "@type": "Audience",
            "audienceType": resource.documentMetadata?.targetAudience
          },
          "about": resource.documentMetadata?.topicsCovered,
          "keywords": resource.documentMetadata?.documentKeywords || resource.seoKeywords
        };

      case 'text':
        return {
          ...baseSchema,
          "@type": "HowTo",
          "totalTime": resource.structuredData?.estimatedTime,
          "supply": resource.promptContent?.map(prompt => ({
            "@type": "HowToSupply",
            "name": prompt.promptTitle
          })),
          "step": resource.promptContent?.map((prompt, stepIndex) => ({
            "@type": "HowToStep",
            "position": stepIndex + 1,
            "name": prompt.promptTitle,
            "text": prompt.promptText
          })),
          "about": resource.promptMetadata?.promptCategory,
          "keywords": resource.promptMetadata?.promptKeywords || resource.seoKeywords,
          "applicationCategory": resource.promptMetadata?.aiPlatforms,
          "usageInfo": resource.promptMetadata?.useCases
        };

      case 'aitool':
        return {
          ...baseSchema,
          "@type": "SoftwareApplication",
          "applicationCategory": "AITool",
          "operatingSystem": "Web Browser",
          "url": resource.aiToolDetails?.toolUrl,
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          "featureList": resource.aiToolDetails?.features,
          "description": resource.aiToolDetails?.toolDescription || resource.overview,
          "keywords": resource.seoKeywords || resource.tags
        };

      default:
        return baseSchema;
    }
  });
}
// Helper functions for schema generation
function getSchemaType(format) {
  const typeMap = {
    'image': 'ImageObject',
    'video': 'VideoObject',
    'document': 'DigitalDocument',
    'text': 'HowTo',
    'aitool': 'SoftwareApplication'
  };
  return typeMap[format] || 'CreativeWork';
}

function convertDurationToISO8601(duration) {
  // Convert MM:SS or HH:MM:SS to ISO 8601 duration (PT#M#S or PT#H#M#S)
  const parts = duration.split(':');
  if (parts.length === 2) {
    return `PT${parts[0]}M${parts[1]}S`;
  } else if (parts.length === 3) {
    return `PT${parts[0]}H${parts[1]}M${parts[2]}S`;
  }
  return undefined;
}



// Main page schema markup
function generateMainPageSchema(pageMetadata, initialServerData) {
  const resourceSchemas = generateResourceSchemas(initialServerData?.resourceList || []);
  
  return {
    __html: JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": pageMetadata.title,
        "description": pageMetadata.description,
        "url": pageMetadata.openGraph.url,
        "inLanguage": "en-US",
        "isPartOf": {
          "@type": "WebSite",
          "name": "Do It With AI Tools",
          "url": getBaseUrl(),
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${getBaseUrl()}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        },
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
              "name": "Free AI Resources",
              "item": `${getBaseUrl()}/free-ai-resources`
            }
          ]
        },
        "mainEntity": {
          "@type": "ItemList",
          "name": "Free AI Resources Collection",
          "description": "Comprehensive collection of free AI tools, images, videos, prompts, and documents",
          "numberOfItems": initialServerData?.resourceCounts?.all || 0,
          "itemListElement": resourceSchemas.map((schema, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": schema
          }))
        },
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "USD",
          "price": "0",
          "availability": "https://schema.org/InStock",
          "offerCount": initialServerData?.resourceCounts?.all || 0
        },
        "author": {
          "@type": "Person",
          "name": "Sufian Mustafa",
          "url": `${getBaseUrl()}/author/sufian-mustafa`,
          "sameAs": [
            "https://twitter.com/doitwithai",
            "https://linkedin.com/in/sufian-mustafa"
          ]
        },
        "publisher": {
          "@type": "Organization",
          "name": "Do It With AI Tools",
          "url": getBaseUrl(),
          "logo": {
            "@type": "ImageObject",
            "url": `${getBaseUrl()}/logo.png`,
            "width": 60,
            "height": 60
          }
        },
        "dateModified": new Date().toISOString(),
        "datePublished": "2024-01-01T00:00:00Z"
      },
      // Organization Schema
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Do It With AI Tools",
        "url": getBaseUrl(),
        "logo": `${getBaseUrl()}/logo.png`,
        "description": "Your comprehensive platform for AI tools, resources, and practical strategies",
        "foundingDate": "2024",
        "founder": {
          "@type": "Person",
          "name": "Sufian Mustafa"
        },
        "sameAs": [
          "https://twitter.com/doitwithai"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "url": `${getBaseUrl()}/contact`
        }
      },
      // Website Schema
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Do It With AI Tools",
        "url": getBaseUrl(),
        "description": "Comprehensive AI tools, resources, and strategies for everyone",
        "inLanguage": "en-US",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${getBaseUrl()}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        },
        "author": {
          "@type": "Person",
          "name": "Sufian Mustafa"
        }
      }
    ])
  };
}

export default async function Page() {
  const initialServerData = await getFreeResourcesInitialData();

  return (
    <>
     

      {/* Enhanced Schema Markup with individual resource schemas */}
      <Script
        id="FreeResourcesSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={generateMainPageSchema(metadata, initialServerData)}
        key="FreeResources-jsonld"
        strategy="beforeInteractive"
      />

      {/* <StaticFreeResourcePageShell> */}
        <AllBlogs initialServerData={initialServerData} />
      {/* </StaticFreeResourcePageShell> */}
    </>
  );
}