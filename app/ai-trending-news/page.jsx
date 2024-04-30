import React from 'react'
import Allblogs from "./AllBlogs"
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";


export const metadata = {
  title: "AI News and Trends",
  description:
    "Explore in-depth analysis of the newest AI advancements impacting various fields. Stay informed with daily updates on AI news & breakthroughs",
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

export default function Page() {
  
 function schemaMarkup() {
  return {
    __html: `{
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "AI News and Trends",
      "description": "Dive into the ever-evolving world of artificial intelligence with our comprehensive blog! Discover the latest news and emerging trends in AI, including groundbreaking new technologies from OpenAI and other leading players. Stay informed with in-depth analysis of AI updates across various industries. Explore the future of AI and its impact on our world.",
      "url": "https://sufi-blog-website.vercel.app/ai-tools",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://sufi-blog-website.vercel.app/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "AI News and Trends",
            "item": "https://sufi-blog-website.vercel.app/ai-trending-news"
          }
        ]
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
  <meta property="og:url" content="https://sufi-blog-website.vercel.app/ai-tools" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="sufi-blog-website.vercel.app" />
        <meta property="twitter:url" content="https://sufi-blog-website.vercel.app/ai-tools" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
  <link rel="canonical" href="https://sufi-blog-website.vercel.app/ai-tools"/>
        <NextSeo
         title={metadata.title}
         description={metadata.description}
          author={metadata.author}
          type= "website"
          locale= 'en_IE'
          site_name= 'AiToolTrend'

          canonical="https://sufi-blog-website.vercel.app/ai-tools"
          openGraph={{
            title: metadata.title,
            description: metadata.description,
            url: "https://sufi-blog-website.vercel.app/ai-tools",
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
   <Allblogs/> 
   </>
  )
}

