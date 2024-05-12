import React from 'react'
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";
import Code from "./Code"

export const metadata = {
  title: "Best AI Logo Generator ",
  description:
    "Discover powerful AI tools to design your brand's logo! Find the perfect logo maker with in-depth reviews on our blog and get started for free.",
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
        "name": "Best AI Logo Generator",
        "description": "Craft a professional and memorable logo for your brand in minutes! Explore our blog to discover the best and online AI logo generators, including free options.  No design experience needed! Let artificial intelligence be your creative partner and generate stunning logo concepts based on your ideas.  Discover the power of AI logo designers, creators, and makers and elevate your brand identity effortlessly",
        "url": "https://sufi-blog-website.vercel.app/tools/ai-image-generator",
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
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "AI Logo Generators",
              "item": "https://sufi-blog-website.vercel.app/tools/ai-logo-generator"
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
  <meta property="og:url" content="https://sufi-blog-website.vercel.app/tools/ai-image-generator" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="sufi-blog-website.vercel.app" />
        <meta property="twitter:url" content="https://sufi-blog-website.vercel.app/tools/ai-image-generator" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
  <link rel="canonical" href="https://sufi-blog-website.vercel.app/tools/ai-image-generator"/>

        <NextSeo
         title={metadata.title}
         description={metadata.description}
          author={metadata.author}
          type= "website"
          locale= 'en_IE'
          site_name= 'AiToolTrend'

          canonical="https://sufi-blog-website.vercel.app/tools/ai-image-generator"
          openGraph={{
            title: metadata.title,
            description: metadata.description,
            url: "https://sufi-blog-website.vercel.app/tools/ai-image-generator",
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

