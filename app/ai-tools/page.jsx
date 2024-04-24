import React from 'react'
import Allblogs from "./AllBlogs"
import Head from "next/head";
import Script from "next/script";
import { NextSeo } from "next-seo";


export const metadata = {
  title: "Best AI Tools",
  description:
    "Explore a comprehensive blog list of the best AI tools for productivity (Free & Paid), providing detailed reviews of the top artificial intelligence solutions",
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
    {
      url: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg',
      width: 1800,
      height: 1600,
      alt: 'My custom alt',
    },
  ],
};

export default  function Page() {
  

  function metatagsdesc() {
    const categoriesData = [
      {
        name: "AI Image Generator",
        description: "Description of AI Image Generator.",
        link: "ai-tools/ai-image-generator",
      },
   
      {
        name: "AI Video Generator",
        description: "Description of AI Video Generator.",
        link: "ai-tools/ai-video-generator",
      },
   
      {
        name: "AI  Extension Generator",
        description: "Description of AI Extension .",
        link: "ai-tools/ai-extension",
      },
   
     
   
    ];
  
    const itemList = categoriesData.map((category) => ({
      "@type": "ListItem",
      "name": category.name,
      "description": category.description,
      "url": `https://sufi-blog-website.vercel.app/ai-tools/${category.link}`,
    }));
    
    return {
      __html: `  {
        "@context": "http://schema.org",
        "@type": "ItemList",
        "name": "Best AI Tools",

        "description": "A comprehensive list of the best AI tools for productivity and creativity, carefully curated to enhance your digital workflows.",
        "url": "https://sufi-blog-website.vercel.app/ai-tools",
        "author": {
          "@type": "Organization",
          "name": "Sufian Mustafa"
        },
        "datePublished": "2024-04-24",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "https://sufi-blog-website.vercel.app/ai-tools",
          "mainEntity": {
            "@type": "ItemList",
            "name": "Best AI Tools",
            "description": "A comprehensive list of the best AI tools for productivity and creativity, carefully curated to enhance your digital workflows.",
            "itemListElement": ${JSON.stringify(itemList)}
          }
        }
      }`
    };
  }
 
  return (
    <div>
  <Head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>{metadata.title}</title>
  <meta name="description" content={metadata.description}/>
  <meta name="author" content="sufian mustafa" />
  <meta property="og:title" content={metadata.title} />
  <meta property="og:description" content={metadata.description} />
  <meta property="og:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />




  <meta property="og:url" content="https://sufi-blog-website.vercel.app/ai-tools" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Best AI Tools" />
        <meta property="og:description" content="Explore a comprehensive blog list of the best AI tools for productivity (Free & Paid), providing detailed reviews of the top artificial intelligence solutions" />
        <meta property="og:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="sufi-blog-website.vercel.app" />
        <meta property="twitter:url" content="https://sufi-blog-website.vercel.app/ai-tools" />
        <meta name="twitter:title" content="Best AI Tools" />
        <meta name="twitter:description" content="Explore a comprehensive blog list of the best AI tools for productivity (Free & Paid), providing detailed reviews of the top artificial intelligence solutions" />
        <meta name="twitter:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />



  <link rel="canonical" href="https://sufi-blog-website.vercel.app/ai-tools"/>
  {/*  */}
      
        <NextSeo
         title={metadata.title}
         description={metadata.description}
          author={metadata.author}
          canonical="https://sufi-blog-website.vercel.app/ai-tools"
          openGraph={{
            title: metadata.title,
            description: metadata.description,
            url: "https://sufi-blog-website.vercel.app/ai-tools",
            type: "ItemList",
            images: [
              {
                url: "https://res.cloudinary.com/dtvtphhsc/image/upload/v1697725757/Screenshot_249_edsr2z.png",
                width: 800,
                height: 800,
                alt: "",
              },
            ],
          }}
        />
      </Head>
      
      <Script
       id="schemaMarkup"
       type="application/ld+json"
        dangerouslySetInnerHTML={metatagsdesc()}
        key="AiTools-jsonld"
      />
      <Allblogs/>
    </div>
  )
}

