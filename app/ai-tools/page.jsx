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
  <meta property="og:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1694356123/Sufian-Mustafa-Web-Developer_en5jxl.png"/>
  <meta property="og:url" content="https://sufi-blog-website.vercel.app/ai-tools"/>
  <link rel="canonical" href="https://sufi-blog-website.vercel.app/ai-tools"/>
  {/*  */}
      
        <NextSeo
         title={metadata.title}
         description={metadata.description}
          author={metadata.author}
          canonical="https://sufi-blog-website.vercel.app/ai-tools"
          openGraph={{
            title: "",
            description:
              "",
            type: "",
            url: "",
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
        key=""
      />
      <Allblogs/>
    </div>
  )
}

