
import ChildComp from "./code";

import { client } from "@/sanity/lib/client";
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";
export const revalidate = false;
export const dynamic = "force-dynamic";
import { urlForImage } from "@/sanity/lib/image";
import { ArticleCacheProvider } from "@/app/ai-learn-earn/[slug]/ArticleCacheContext";
import { CacheStatusProvider } from "@/app/ai-learn-earn/[slug]/CacheStatusProvider";


async function getData(slug) {
  const query = `*[_type == "coding" && slug.current == "${slug}"][0]`;
  // Add cache-busting timestamp to ensure fresh data
 const data = await client.fetch(query, {}, { 
    cache: 'force-cache', // Changed from 'no-store' to enable caching
    next: { 
      tags: ['coding', slug],
      revalidate: 300 // Revalidate every 5 minutes
    } 
  });
  return data;
}

export async function generateMetadata({ params }) {
  const data = await getData(params.slug);
  return {
    title: `${data.metatitle}`,
    description: `${data.metadesc}`,
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
  
  function schemaBlogPostingMarkup() {
    return {
      __html: `
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "name": "${data.metatitle}",
        "headline": "${data.schematitle}",

        "description": "${data.schemadesc}",
        "url": "https://www.doitwithai.tools/ai-code/${params.slug}",

        "author": {
          "@type": "Person",
          "name": "Sufian Mustafa",
          "url": "https://www.doitwithai.tools/author/sufian-mustafa"

        },
        "image": {
          "@type": "ImageObject",
          "url": "${urlForImage(data.mainImage).url()}",
          "width": 800,
          "height": 600
        }
      }`
    };
  }
  function schemaBreadcrumbMarkup() {
    return {
      __html: `
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@id": "https://www.doitwithai.tools/",
              "name": "Home"
            }
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@id": "https://www.doitwithai.tools/ai-code",
              "name": "AI Tools"
            }
          },
          {
            "@type": "ListItem",
            "position": 3,
            "item": {
              "@id": "https://www.doitwithai.tools/ai-code/${params.slug}",
              "name": "${data.schematitle}"
            }
          }
        ]
      }`
    };
  }

  const metadata = await generateMetadata({ params });

  const slug = params.slug;
    const data = await getData(slug);

    if (!data) {
        return (
            <section className="min-h-screen flex items-center justify-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Article Not Found</h1>
            </section>
        );
    }

    // Determine the schemaType from the fetched data
    const currentPostType = data?._type || 'defaultSchemaType'; // Fallback to a default if _type is not available immediately
  const title = `${data.metatitle}`;
  const overview = `${data.metadesc}`;



  const image = `${data.image}`;
  const author = `${data.author}`;
  const canonicalUrl = `https://www.doitwithai.tools/ai-code/${params.slug}`;

  return (
    <>
      <Head>
      <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta property="og:site_name" content="AiToolTrend" />
        <meta property="og:locale" content="en_US" />
  <title>{title}</title>
  <meta name="description" content={overview}/>
  <meta name="author" content="sufian mustafa" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={overview} />
  <meta property="og:image" content={image} />
  <meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

  {/*  */}
  <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={overview} />
        <meta property="og:image" content={image}/>
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="https://www.doitwithai.tools" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={overview} />
        <meta name="twitter:image" content={image} />
        <link rel="canonical" href={canonicalUrl}/>
        <meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

        <NextSeo
         title={title}
         description={overview}
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
        dangerouslySetInnerHTML={schemaBreadcrumbMarkup()}
        key="BreadcrumbList-jsonld"
      />
       <Script
        id="BlogPostingSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaBlogPostingMarkup()}
        key="BlogPosting-jsonld"
      />
       <CacheStatusProvider>
                  <ArticleCacheProvider schemaType={currentPostType}>
                      <section>
                          <ChildComp data={data} params={params} />
                      </section>
                  </ArticleCacheProvider>
              </CacheStatusProvider>
    </>
  );
}