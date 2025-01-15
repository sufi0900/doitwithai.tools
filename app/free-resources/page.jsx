import React from 'react'
import Allblogs from "./AllBlogs"
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";


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

export default function Page() {
  
 function schemaMarkup() {
  return {
    __html: `{
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Free AI Resources and Solution",
      "description": "Unlock the power of AI for free! Discover a treasure trove of valuable resources, including free non-copyrighted AI-generated HD images and creative writing prompts for various needs.  Our blog offers practical solutions and guides on how AI can tackle challenges across different fields.  Explore how AI can enhance your work, creativity, and problem-solving in any domain! ",
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
            "item": "https://www.doitwithai.tools/free-resources"
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
   <Allblogs/> 
   </>
  )
}

