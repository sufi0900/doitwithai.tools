import React from 'react'
import Allblogs from "./AllBlogs"
import Script from "next/script";


export const metadata = {
  title: "Best AI Tools",
  description:
    "Explore a comprehensive list of blogs on the Best AI Tools for Productivity (Freemium), providing detailed reviews of the top artificial intelligence solutions",
  author: "Sufian Mustafa",
  image: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg',

};

export default  function Page() {
  
  function schemaMarkup() {
 
    
    return {
      __html: `   {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Best AI Tools",
        "description": "Explore an extensive collection of artificial intelligence tools and resources, all designed for boosting your productivity and creativity. Everybody, from students to business owners and researchers in different fields of study, will find something to interest them on our site, whether it's image creation, video editing, AI extensions, or any other aspect of AI technology. Explore all of the blogs from different AI domains or dive into specific subcategories to find articles that are relevant to your interests. Take use of the greatest artificial intelligence solutions to increase your output and creativity!",
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
                "url": "https://sufi-blog-website.vercel.app/ai-tools/ai-image-generator"
              }
            },
            
            {
              "@type": "ListItem",
              "position": 2,
              "item": {
                "@type": "Thing",
                "name": "AI Video Generator",
                "url": "https://sufi-blog-website.vercel.app/ai-tools/ai-video-generator"
              }
            },
            {
              "@type": "ListItem",
              "position": 3,
              "item": {
                "@type": "Thing",
                "name": "AI Extension",
                "url": "https://sufi-blog-website.vercel.app/ai-tools/ai-extension"
              }
            }
         
          ]
        }
      }`
    };
  }
  return (
    <div>
      <Script
       id="BreadcrumbListSchema"
       type="application/ld+json"
        dangerouslySetInnerHTML={schemaMarkup()}
        key="AiTools-jsonld"
      />
      <Allblogs/> 

    </div>
  )
}

