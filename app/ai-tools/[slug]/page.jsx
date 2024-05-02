
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

  const MAX_DESCRIPTION_LENGTH = 50; 


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
 
      <section>
        <ChildComp data={data} params={params} currentCategory={data.category || ''}  />
      </section>
    </>
  );
}
