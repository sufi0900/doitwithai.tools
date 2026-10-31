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

// OPTIMIZED METADATA for "free AI SEO resources"
export const metadata = {
  // PRIMARY KEYWORD: "free AI SEO resources"
  title: "Free AI SEO Resource Hub: Tools, Prompts, Templates & More",
  description: "Access free AI SEO resources, including prompts, templates, tools, infographics, and videos designed to improve content quality and visibility in AI search.",
  
  authors: [{ 
    name: "Sufian Mustafa",
    url: `${getBaseUrl()}/about`
  }],
  creator: "Sufian Mustafa",
  publisher: "Do It With AI Tools",
  
  // KEYWORD-RICH: Focus on "free AI SEO resources" variations
  keywords: "free AI SEO resources, free AI SEO tools, AI SEO prompts, ChatGPT SEO prompts, free SEO templates, AI keyword research, free AI content optimization, SEO automation tools free, AI SEO checklist, free GEO resources, free AEO resources",
  
  openGraph: {
    title: "Free AI SEO Resources: Prompts, Templates & Tools for Rankings",
    description: "Access our growing library of 100% free AI SEO resources. ChatGPT prompts for SEO, keyword research templates, content optimization tools, and ranking strategies.",
    url: `${getBaseUrl()}/free-ai-resources`,
    type: "website",
    siteName: "Do It With AI Tools",
    locale: "en_US",
    images: [{
      url: generateOGImageURL({
        title: 'Free AI SEO Resources: Prompts, Templates & Tools',
        category: 'Free AI SEO Resources',
        ctaText: 'Download Free SEO Resources',
        features: 'ChatGPT Prompts, SEO Templates, Ranking Tools',
        bgColor: 'green'
      }),
      width: 1200,
      height: 630,
      alt: 'Free AI SEO Resources for Content Creators and Marketers - Do It With AI Tools',
    }],
  },
  
  twitter: {
    card: "summary_large_image",
    site: "@doitwithai",
    creator: "@doitwithai",
    domain: "doitwithai.tools",
    url: `${getBaseUrl()}/free-ai-resources`,
    title: "Free AI SEO Resources: Prompts, Templates & Ranking Tools",
    description: "Download 100% free AI SEO resources including ChatGPT prompts, templates, and tools to boost your search rankings with AI-powered optimization.",
    images: [generateOGImageURL({
      title: 'Free AI SEO Resources: Prompts, Templates & Tools',
      category: 'Free AI SEO Resources',
      ctaText: 'Download Free SEO Resources',
      features: 'ChatGPT Prompts, SEO Templates, Ranking Tools',
      bgColor: 'green'
    })],
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
  
  // ADDITIONAL SEO
  other: {
    'ai-content-declaration': 'human-created, ai-assisted',
    'resource-type': 'free AI SEO resources',
    'primary-keyword': 'free AI SEO resources'
  }
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
function generateResourceSchemas(resources) {
  if (!resources || resources.length === 0) return [];

  return resources.map((resource, index) => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": getSchemaType(resource.resourceFormat),
      "name": resource.title,
      "description": resource.overview || resource.seoDescription,
      "datePublished": resource.publishedAt,
      "dateModified": resource.publishedAt,
      "author": {
        "@type": "Person",
        "name": "Sufian Mustafa",
        "url": `${getBaseUrl()}/author/sufian-mustafa`
      },
      "publisher": {
        "@type": "Organization",
        "name": "Do It With AI Tools",
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
          "keywords": resource.imageMetadata?.imageKeywords,
          "representativeOfPage": resource.isOwnPageFeature || false,
          "acquireLicensePage": `${getBaseUrl()}/free-ai-resources`,
          "creditText": "Do It With AI Tools",
          "creator": {
            "@type": "Person",
            "name": "Sufian Mustafa"
          }
        };

     case 'video':
  return {
    ...baseSchema,
    "@type": "VideoObject",
    "name": resource.title,
    "description": resource.overview || resource.videoMetadata?.videoDescription, // Use video-specific description
    "uploadDate": resource.publishedAt,
    "contentUrl": resource.resourceFile?.url || resource.resourceLink,
    "embedUrl": resource.resourceLink,
    "thumbnailUrl": resource.previewSettings?.previewImage?.asset?.url || resource.mainImage?.asset?.url,
    "duration": resource.videoMetadata?.duration ? convertDurationToISO8601(resource.videoMetadata.duration) : undefined,
    "transcript": resource.videoMetadata?.transcript,
    "keywords": resource.videoMetadata?.videoKeywords,
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
          "downloadUrl": resource.resourceFile?.url || resource.resourceLink
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
          }))
        };

      case 'aitool':
        return {
          ...baseSchema,
          "@type": "SoftwareApplication",
          "applicationCategory": "AI Tool",
          "operatingSystem": "Web Browser",
          "url": resource.aiToolDetails?.toolUrl,
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          "featureList": resource.aiToolDetails?.features,
          "description": resource.aiToolDetails?.toolDescription
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


// ENHANCED SCHEMA for "free AI SEO resources"
function generateFreeAISEOResourcesSchema() {
  const baseUrl = getBaseUrl();
  
  return {
    __html: `{
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Free AI SEO Resources - Do It With AI Tools",
      "description": "Comprehensive collection of free AI SEO resources including ChatGPT prompts for SEO, keyword research templates, content optimization tools, and ranking strategies. All resources are 100% free and designed to help you leverage AI for better search engine optimization.",
      "url": "${baseUrl}/free-ai-resources",
      "inLanguage": "en-US",
      
      "mainEntity": {
        "@type": "ItemList",
        "name": "Free AI SEO Resources Collection",
        "description": "Curated collection of free AI-powered SEO resources",
        "numberOfItems": "50+",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "ChatGPT SEO Prompts",
            "description": "Free AI prompts for SEO keyword research, content optimization, and meta tag generation"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "AI SEO Templates",
            "description": "Free downloadable templates for SEO audits, content calendars, and keyword tracking"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Free SEO Tools",
            "description": "AI-powered free tools for SEO analysis, content optimization, and ranking strategies"
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": "SEO Checklists & Guides",
            "description": "Comprehensive free guides for AI-powered SEO, GEO, and AEO optimization"
          }
        ]
      },
      
      "about": {
        "@type": "Thing",
        "name": "AI SEO Resources",
        "description": "Free resources for leveraging artificial intelligence in search engine optimization"
      },
      
      "keywords": "free AI SEO resources, ChatGPT SEO prompts, AI SEO tools free, SEO templates, keyword research AI, content optimization resources",
      
      "isPartOf": {
        "@type": "WebSite",
        "name": "Do It With AI Tools",
        "url": "${baseUrl}",
        "description": "Modern AI hub for SEO and productivity"
      },
      
      "author": {
        "@type": "Person",
        "name": "Sufian Mustafa",
        "jobTitle": "Founder & AI SEO Strategist",
        "url": "${baseUrl}/about",
        "worksFor": {
          "@type": "Organization",
          "name": "Do It With AI Tools"
        }
      },
      
      "publisher": {
        "@type": "Organization",
        "name": "Do It With AI Tools",
        "url": "${baseUrl}",
        "logo": {
          "@type": "ImageObject",
          "url": "${baseUrl}/logoForHeader.png"
        }
      },
      
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "description": "All AI SEO resources are completely free to download and use"
      }
    }`
  };
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

function getFileFormat(filename) {
  if (!filename) return undefined;
  const ext = filename.split('.').pop()?.toLowerCase();
  const formatMap = {
    'pdf': 'PDF',
    'doc': 'Microsoft Word',
    'docx': 'Microsoft Word',
    'xls': 'Microsoft Excel',
    'xlsx': 'Microsoft Excel',
    'ppt': 'Microsoft PowerPoint',
    'pptx': 'Microsoft PowerPoint',
    'txt': 'Plain Text'
  };
  return formatMap[ext] || ext?.toUpperCase();
}

function getMimeType(filename) {
  if (!filename) return undefined;
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeMap = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain'
  };
  return mimeMap[ext];
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
       
        "mainEntity": {
          "@type": "ItemList",
         "name": "Free AI SEO Resource Hub with Tools, Prompts, Guides, Infographics, and Videos - Do It With AI Tools",
      "description": "Access a free library of AI SEO resources designed to support content creation and modern AI search visibility. This page includes expert prompts, powerful AI tools, templates, and infographics alongside video guides. All resources are free and built to help creators, marketers, and teams understand and apply AI SEO strategies.",
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
        "description": "Your comprehensive platform for AI SEO tools, resources, and practical strategies",
        "foundingDate": "2024",
        "founder": {
          "@type": "Person",
          "name": "Sufian Mustafa"
        },
       
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
        "description": "Comprehensive AI SEO tools, resources, and strategies for everyone",
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

// BREADCRUMB SCHEMA
function generateBreadcrumbSchema() {
  const baseUrl = getBaseUrl();
  
  return {
    __html: `{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "${baseUrl}/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Free AI SEO Resources",
          "item": "${baseUrl}/free-ai-resources"
        }
      ]
    }`
  };
}


export default async function Page() {
  const initialServerData = await getFreeResourcesInitialData();

  return (
    <>
      <Head>
        <NextSeo
          title={metadata.title}
          description={metadata.description}
          canonical={metadata.alternates.canonical}
          openGraph={{
            type: 'website',
            locale: 'en_US',
            url: metadata.openGraph.url,
            siteName: metadata.openGraph.siteName,
            title: metadata.openGraph.title,
            description: metadata.openGraph.description,
            images: metadata.openGraph.images,
          }}
          twitter={{
            card: metadata.twitter.card,
            site: metadata.twitter.creator,
            creator: metadata.twitter.creator,
            title: metadata.twitter.title,
            description: metadata.twitter.description,
            image: metadata.twitter.image,
          }}
          additionalMetaTags={[
            { name: 'keywords', content: metadata.keywords },
            { name: 'author', content: metadata.author },
            { name: 'robots', content: 'index,follow' },
            { name: 'googlebot', content: 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1' },
            { name: 'theme-color', content: '#2563eb' },
            { name: 'application-name', content: 'doitwithai.tools' },
            { name: 'msapplication-TileColor', content: '#2563eb' },
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
          ]}
        />
      </Head>

      {/* Enhanced Schema Markup with individual resource schemas */}
      <Script
        id="FreeResourcesSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={generateMainPageSchema(metadata, initialServerData)}
  
      />
 {/* Breadcrumb Schema */}
      <Script
        id="BreadcrumbSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={generateBreadcrumbSchema()}
        strategy="beforeInteractive"
      />
      <StaticFreeResourcePageShell>
        <AllBlogs initialServerData={initialServerData} />
      </StaticFreeResourcePageShell>
    </>
  );
}