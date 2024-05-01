
import ChildComp from "./code";

import { client } from "@/sanity/lib/client";
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";
export const revalidate = false;
export const dynamic = "force-dynamic";
import { urlForImage } from "@/sanity/lib/image";



async function getData(slug) {
  const query = `*[_type == "aitool" && slug.current == "${slug}"][0]`;
  const data = await client.fetch(query);
  return data;
}
export async function generateMetadata({ params }) {
  const data = await getData(params.slug);
  return {
    title: `${data.title}`,
    description: `${data.overview}`,
    author: "Sufian Mustafa",
   

    image: {
      url: urlForImage(data.mainImage).url(),
      width: 800,
      height: 600,
    },
    openGraph: {
      images: [
        {
          url: urlForImage(data.mainImage).url(),
          width: 800,
          height: 600,
        }
      ]
    }
  
  };
  
}
export default async function ParentPage({ params }) {
  function schemaMarkup() {
 
    
    return {
      __html: `   {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "name": "${data.title}",
        "description": "${data.overview}",
        "url": "https://sufi-blog-website.vercel.app/ai-tools/${params.slug}",
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
              "name": "",
              "item": "https://sufi-blog-website.vercel.app/ai-tools/${params.slug}"
            }
          ]
        }
      
      }`
    };
  }
  const MAX_DESCRIPTION_LENGTH = 200; 


  const metadata = await generateMetadata({ params });

  const data = await getData(params.slug);
  const title = `${data.title}`;
  const overview = `${data.overview}`;

  const description = `${data.overview}`;
  const description2 = overview.length > MAX_DESCRIPTION_LENGTH ? overview.substring(0, MAX_DESCRIPTION_LENGTH) : overview; // Apply limit to description

  const image = `${data.image}`;
  const author = `${data.author}`;
  const canonicalUrl = `https://sufi-blog-website.vercel.app/ai-tools/${params.slug}`;

  return (
    <>
    <Head>
      <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta property="og:site_name" content="AiToolTrend" />
        <meta property="og:locale" content="en_US" />
  <title>{title}</title>
  <meta name="description" content={description2}/>
  <meta name="author" content="sufian mustafa" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description2} />
  <meta property="og:image" content={image} />
  <meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

  {/*  */}
  <meta property="og:url" content="https://sufi-blog-website.vercel.app/ai-tools/ai-image-generator" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description2} />
        <meta property="og:image" content={image}/>
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="sufi-blog-website.vercel.app" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description2} />
        <meta name="twitter:image" content={image} />
        <link rel="canonical" href={canonicalUrl}/>
        <meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

        <NextSeo
         title={title}
         description={description}
          author={author}
          type= "website"
          locale= 'en_IE'
          site_name= 'AiToolTrend'

          canonical={canonicalUrl}
          openGraph={{
            ...metadata.openGraph,
            images: metadata.image, // Pass single image object
          }}
        />
      

    </Head>
    <Script
    id="BreadcrumbListSchema"
    type="application/ld+json"
     dangerouslySetInnerHTML={schemaMarkup()}
     key="AiTools-jsonld"
   />
      <section>
        <ChildComp data={data} params={params} />
      </section>
    </>
  );
}
