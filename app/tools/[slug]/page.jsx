
import ChildComp from "./code";

import { client } from "@/sanity/lib/client";
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";


import { urlForImage } from "@/sanity/lib/image";
export const revalidate = false;
export const dynamic = "force-dynamic";

async function getData(slug) {
  const query = `*[_type == "aitool" && slug.current == "${slug}"][0]`;
  const data = await client.fetch(query);
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
export default async function ParentPage({  params }) {

  const data = await getData(params.slug);




  
  return (
    <>
  
      <section>
        <ChildComp data={data} params={params} />
      </section>
    </>
  );
}
