import React from 'react'
import Allblogs from "./AllBlogs"
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";


export const metadata = {
  title: "Make Money With AI",
  description:
    "Discover in-depth guides to learn how to make money with AI! Explore the best AI tools and unlock new earning opportunities online",
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
      "name": "Make Money With AI",
      "description": "Discover innovative ways to generate income using the power of artificial intelligence. Our blog explores the best ways to make money online with AI, including tools like ChatGPT, Midjourney, and OpenAI. Learn how to leverage AI for tasks like content creation, design, and marketing to create passive income.  Explore our in-depth guides and discover the power of AI money makers to turn your skills into a profitable side hustle.",
      "url": "https://www.doitwithai.tools/earning",
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
            "name": "Make Money With AI",
            "item": "https://www.doitwithai.tools/earning"
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
  <meta property="og:url" content="https://www.doitwithai.tools/tools" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="https://www.doitwithai.tools" />
        <meta property="twitter:url" content="https://www.doitwithai.tools/tools" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
  <link rel="canonical" href="https://www.doitwithai.tools/tools"/>
        <NextSeo
         title={metadata.title}
         description={metadata.description}
          author={metadata.author}
          type= "website"
          locale= 'en_IE'
          site_name= 'AiToolTrend'

          canonical="https://www.doitwithai.tools/tools"
          openGraph={{
            title: metadata.title,
            description: metadata.description,
            url: "https://www.doitwithai.tools/tools",
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

