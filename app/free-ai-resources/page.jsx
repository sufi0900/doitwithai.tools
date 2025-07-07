//parent page.jsx for free-ai-resource page

import React from 'react'
import Allblogs from "./AllBlogs" //client page for free-ai-resource page
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";

import {redisHelpers} from '@/app/lib/redis';
import { client } from "@/sanity/lib/client";
export const metadata = { 
  title: "Free AI Resources & Solution",
  description:
    "Explore free AI resources to boost your creativity & productivity. Discover AI solutions for various problems. Download free AI images and find prompts",
  author: "Sufian Mustafa",
  openGraph: {
    images: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg',
  },
  images: [
    {
      url: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg',
      width: 800,
      height: 600,
    },
    
  ],
};


const INITIAL_RESOURCE_LIST_LIMIT = 6;

// --- Server-side data fetching function ---
async function getFreeResourcesInitialData() {
  const cacheKey = 'freeResources:initialPageData'; // Unique key for this page's combined data
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

  // 1. Query for the featured resource
  const featuredResourceQuery = `*[_type=="freeResources"&&isOwnPageFeature==true]|order(publishedAt desc)[0]{
    _id,title,slug,tags,mainImage,overview,resourceType,resourceFormat,resourceLink,resourceLinkType,
    previewSettings,"resourceFile":resourceFile.asset->,content,publishedAt,promptContent,
    "relatedArticle":relatedArticle->{title,slug},aiToolDetails,seoTitle,seoDescription,seoKeywords,altText,structuredData
  }`;

  // 2. Query for resource counts by format
  const countsQuery = `{
    "all":count(*[_type=="freeResources"]),
    "image":count(*[_type=="freeResources"&&resourceFormat=="image"]),
    "video":count(*[_type=="freeResources"&&resourceFormat=="video"]),
    "text":count(*[_type=="freeResources"&&resourceFormat=="text"]),
    "document":count(*[_type=="freeResources"&&resourceFormat=="document"]),
    "aitool":count(*[_type=="freeResources"&&resourceFormat=="aitool"])
  }`;

  // 3. Query for the first page of the resource list
  const listQuery = `*[_type=="freeResources"]|order(publishedAt desc)[0...${INITIAL_RESOURCE_LIST_LIMIT + 1}]{
    _id,title,slug,tags,mainImage,overview,resourceType,resourceFormat,resourceLink,resourceLinkType,
    previewSettings,"resourceFile":resourceFile.asset->,content,publishedAt,promptContent,
    "relatedArticle":relatedArticle->{title,slug},aiToolDetails,seoTitle,seoDescription,seoKeywords,altText,structuredData
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

    if (data.resourceList?.length > 0) { // Only cache if we actually got some data
      try {
        await redisHelpers.set(cacheKey, data, { ex: 3600 }); // Cache for 1 hour
        console.log(`[Redis Cache Set] for ${cacheKey}`);
      } catch (redisSetError) {
        console.error(`Redis set error for ${cacheKey}:`, redisSetError.message);
      }
    }

    return { ...data, __source: 'server-network' };
  } catch (error) {
    console.error(`Server-side fetch for Free AI Resources page failed:`, error.message);
    return null; // Return null on error
  }
}



export default async function Page() {
    const initialServerData = await getFreeResourcesInitialData();

// Update your grandparent page schema to include hasOfferCatalog

function schemaMarkup() {
  return {
    __html: `{
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Free AI Resources and Solution",
      "description": "Unlock the power of AI for free! Discover a treasure trove of valuable resources, including free non-copyrighted AI-generated HD images and creative writing prompts for various needs. Our blog offers practical solutions and guides on how AI can tackle challenges across different fields. Explore how AI can enhance your work, creativity, and problem-solving in any domain!",
      "url": "https://www.doitwithai.tools/ai-tools",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.doitwithai.tools/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Free AI Resources",
            "item": "https://www.doitwithai.tools/free-ai-resources"
          }
        ]
      },
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": 100,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@type": "CreativeWork",
              "name": "AI Resources Collection",
              "description": "Collection of free AI resources including images, videos, prompts and documents"
            }
          }
        ]
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "price": "0",
        "availability": "https://schema.org/InStock",
        "offerCount": 100
      }
    }`
  };
}

  return (
    <>
    <Head>
        <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta property="og:site_name" content="AiToolTrend" />
        <meta property="og:locale" content="en_US" />
  <title>{metadata.title}</title>

  <meta name="description" content={metadata.description}/>
  <meta name="author" content="sufian mustafa" />
  <meta property="og:title" content={metadata.title} />
  <meta property="og:description" content={metadata.description} />
  <meta property="og:image" content={metadata.images} />
  <meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

  {/*  */}
  <meta property="og:url" content="https://www.doitwithai.tools/ai-tools" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="doitwithai.tools" />
        <meta property="twitter:url" content="https://www.doitwithai.tools/ai-tools" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
  <link rel="canonical" href="https://www.doitwithai.tools/ai-tools"/>
        <NextSeo
         title={metadata.title}
         description={metadata.description}
          author={metadata.author}
          type= "website"
          locale= 'en_IE'
          site_name= 'AiToolTrend'

          canonical="https://www.doitwithai.tools/ai-tools"
          openGraph={{
            title: metadata.title,
            description: metadata.description,
            url: "https://www.doitwithai.tools/ai-tools",
            type: "ItemList",
            images: metadata.images
          }}
        />
      

    </Head>

    <Script
    id="BreadcrumbListSchema"
    type="application/ld+json"
     dangerouslySetInnerHTML={schemaMarkup()}
     key="AiTools-jsonld"
   />
   <Allblogs           initialServerData={initialServerData}
/> 
   </>
  )
}

{process.env.NODE_ENV === 'development' && (
  <button 
    onClick={() => console.log(validateSchema(resource))}
    style={{
      position: 'absolute',
      bottom: '5px',
      right: '5px',
      zIndex: 9999,
      fontSize: '10px',
      padding: '2px 5px',
      background: '#ff4444',
      color: 'white',
      borderRadius: '3px',
      opacity: 0.7
    }}
  >
    Test Schema
  </button>
)}