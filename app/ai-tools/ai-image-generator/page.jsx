import React from 'react'
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";
import Code from "./Code"

export const metadata = {
  title: "Best AI Image Generator Tools",
  description:
    "Explore the world of AI image creation, where your imagination comes to life! This exciting technology combines art and artificial intelligence, allowing you to generate beautiful images from simple text descriptions. Our blog features in-depth reviews of the best AI image creators, including free and online options. Whether you're a seasoned artist or just starting, discover how AI can help you create stunning AI art, pictures, graphics, photos, drawings, and even headshots effortlessly. Unleash your creativity and explore the possibilities of text-to-image AI!.",
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
        "name": "Best AI Image Generator Tools",
        "description": "Step into the revolutionary world of AI Image Generation, where each creation is a masterpiece This emerging artistry blends traditional artistic techniques with cutting-edge artificial intelligence, turning simple text descriptions into visually captivating artworks. Our blogs delve deeply into the most advanced AI image creators, giving everyone from seasoned artists to casual creatives the power to stunning images effortlessly. Uncover the potential behind 'text-to-image' technology and transcend traditional visual boundaries with the magic of AI.",
        "url": "https://sufi-blog-website.vercel.app/ai-tools/ai-image-generator",
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
              "item": "https://sufi-blog-website.vercel.app/ai-tools"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "AI Image Generators",
              "item": "https://sufi-blog-website.vercel.app/ai-tools/ai-image-generator"
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
  <meta property="og:url" content="https://sufi-blog-website.vercel.app/ai-tools/ai-image-generator" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="sufi-blog-website.vercel.app" />
        <meta property="twitter:url" content="https://sufi-blog-website.vercel.app/ai-tools/ai-image-generator" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
        <link rel="canonical" href="https://sufi-blog-website.vercel.app/ai-tools/ai-image-generator"/>

        <NextSeo
         title={metadata.title}
         description={metadata.description}
          author={metadata.author}
          type= "website"
          locale= 'en_IE'
          site_name= 'AiToolTrend'

          canonical="https://sufi-blog-website.vercel.app/ai-tools/ai-image-generator"
          openGraph={{
            title: metadata.title,
            description: metadata.description,
            url: "https://sufi-blog-website.vercel.app/ai-tools/ai-image-generator",
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

