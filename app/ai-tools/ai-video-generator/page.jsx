import React from 'react'
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";
import Code from "./Code"

export const metadata = {
  title: "Best AI Video Generator Tools",
  description:
    "Explore a comprehensive list of blogs on the top AI tools for generating and Editing videos. Our detailed reviews help you find the perfect text-to-video creator for your projects.",
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
        "name": "Best AI Video Generator Tools",
        "description": "Unleash the power of artificial intelligence for video creation! This exciting tool transforms simple text scripts into stunning visuals with ease. Our blog dives deep into the best AI video generators, including free and online options. Discover how AI can help you create engaging animation videos, explainer videos, YouTube content, video ads, and more, regardless of your editing experience. Unleash the power of text-to-video AI and bring your stories to life with captivating visuals!",
        "url": "https://www.doitwithai.tools/ai-tools/ai-image-generator",
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
              "name": "AI Tools",
              "item": "https://www.doitwithai.tools/ai-tools"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "AI Video Generators",
              "item": "https://www.doitwithai.tools/ai-tools/ai-video-generator"
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
  <meta property="og:url" content="https://www.doitwithai.tools/ai-tools/ai-image-generator" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="doitwithai.tools" />
        <meta property="twitter:url" content="https://www.doitwithai.tools/ai-tools/ai-image-generator" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
  <link rel="canonical" href="https://www.doitwithai.tools/ai-tools/ai-image-generator"/>

        <NextSeo
         title={metadata.title}
         description={metadata.description}
          author={metadata.author}
          type= "website"
          locale= 'en_IE'
          site_name= 'AiToolTrend'

          canonical="https://www.doitwithai.tools/ai-tools/ai-image-generator"
          openGraph={{
            title: metadata.title,
            description: metadata.description,
            url: "https://www.doitwithai.tools/ai-tools/ai-image-generator",
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
      <Code/>
    </>
  )
}

