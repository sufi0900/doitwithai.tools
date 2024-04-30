import SharePost from "@/components/Blog/SharePost";
import TagButton from "@/components/Blog/TagButton";
import NewsLatterBox from "@/components/Contact/NewsLatterBox";
import Image from "next/image";

import { PortableText } from "@portabletext/react";
import { urlForImage } from "@/sanity/lib/image";
import ChildComp from "./code";

import { client } from "@/sanity/lib/client";

export const revalidate = false;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog Details Page | Free Next.js Template for Startup and SaaS",
  description: "This is Blog Details Page for Startup Nextjs Template",
};

async function getData(slug) {
  const query = `*[_type == "coding" && slug.current == "${slug}"][0]`;
  const data = await client.fetch(query);
  return data;
}

export default async function ParentPage({ params }) {
  const data = await getData(params.slug);

  return (
    <>
      <section>
        <ChildComp data={data} params={params} />
      </section>
    </>
  );
}
