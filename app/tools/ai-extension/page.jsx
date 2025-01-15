import React from 'react'
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";
import Code from "./Code"

export const metadata = {
  title: "Best AI Extension Tools",
  description:
    "Get the best AI extensions for your needs by reading our comprehensive blogs! Boost your productivity with strong AI technologies that are all Chrome extensions",
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
        "name": "Best AI Extension Tools",
        "description": "Use the power of artificial intelligence extensions to optimize your workflow! Explore a comprehensive collection of blog to uncover top tools and learn how AI can streamline your tasks across different platforms, especially with free and online Chrome extensions. Discover AI writers, chatbots, and other powerful extensions to enhance your writing, research, and overall browsing experience. Unleash the potential of AI and work smarter, not harder!",
        "url": "https://www.doitwithai.tools/tools/ai-image-generator",
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
              "item": "https://www.doitwithai.tools/tools"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "AI Extensions",
              "item": "https://www.doitwithai.tools/tools/ai-extension"
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
  <meta property="og:url" content="https://www.doitwithai.tools/tools/ai-image-generator" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="doitwithai.tools" />
        <meta property="twitter:url" content="https://www.doitwithai.tools/tools/ai-image-generator" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
  <link rel="canonical" href="https://www.doitwithai.tools/tools/ai-image-generator"/>

        <NextSeo
         title={metadata.title}
         description={metadata.description}
          author={metadata.author}
          type= "website"
          locale= 'en_IE'
          site_name= 'AiToolTrend'

          canonical="https://www.doitwithai.tools/tools/ai-image-generator"
          openGraph={{
            title: metadata.title,
            description: metadata.description,
            url: "https://www.doitwithai.tools/tools/ai-image-generator",
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

