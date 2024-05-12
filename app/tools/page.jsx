import React from 'react'
import Allblogs from "./AllBlogs"
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";

export const revalidate = false;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Best AI Tools",
  description:
    "Explore a comprehensive list of blogs on the Best AI Tools for Productivity (Freemium), providing detailed reviews of the top artificial intelligence solutions",
    
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
      __html: `   {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Best AI Tools",
        "description": "Explore an extensive collection of artificial intelligence tools and resources, all designed for boosting your productivity and creativity. Everybody, from students to business owners and researchers in different fields of study, will find something to interest them on our site, whether it's image creation, video editing, AI extensions, or any other aspect of AI technology. Explore all of the blogs from different AI domains or dive into specific subcategories to find articles that are relevant to your interests. Take use of the greatest artificial intelligence solutions to increase your output and creativity!",
        "url": "https://sufi-blog-website.vercel.app/tools",
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
              "name": "AI Tools",
              "item": "https://sufi-blog-website.vercel.app/tools"
            }
          ]
        },
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "Thing",
                "name": "AI Image Generator",
                "url": "https://sufi-blog-website.vercel.app/tools/ai-image-generator"
              }
            },
            
            {
              "@type": "ListItem",
              "position": 2,
              "item": {
                "@type": "Thing",
                "name": "AI Video Generator",
                "url": "https://sufi-blog-website.vercel.app/tools/ai-video-generator"
              }
            },
            {
              "@type": "ListItem",
              "position": 3,
              "item": {
                "@type": "Thing",
                "name": "AI Extension",
                "url": "https://sufi-blog-website.vercel.app/tools/ai-extension"
              }
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
  <meta property="og:image" content={metadata.image} />
  <meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

  {/*  */}
  <meta property="og:url" content="https://sufi-blog-website.vercel.app/tools" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="sufi-blog-website.vercel.app" />
        <meta property="twitter:url" content="https://sufi-blog-website.vercel.app/tools" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
  <link rel="canonical" href="https://sufi-blog-website.vercel.app/tools"/>
        <NextSeo
         title={metadata.title}
         description={metadata.description}
          author={metadata.author}
          type= "website"
          locale= 'en_IE'
          site_name= 'AiToolTrend'

          canonical="https://sufi-blog-website.vercel.app/tools"
          openGraph={{
            title: metadata.title,
            description: metadata.description,
            url: "https://sufi-blog-website.vercel.app/tools",
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

