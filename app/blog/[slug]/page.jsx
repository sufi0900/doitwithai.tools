import RelatedPost from "@/components/Blog/RelatedPost";
import SharePost from "@/components/Blog/SharePost";
import TagButton from "@/components/Blog/TagButton";
import NewsLatterBox from "@/components/Contact/NewsLatterBox";
import Image from "next/image";
import { client } from "../../../sanity/lib/client";
import { PortableText } from "@portabletext/react";
import { urlForImage } from "@/sanity/lib/image";
import Code from "./code";
export const revalidate = false;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog Details Page | Free Next.js Template for Startup and SaaS",
  description: "This is Blog Details Page for Startup Nextjs Template",
};

async function getData(slug) {
  const query = `*[_type == "blog" && slug.current == "${slug}"][0]`;
  const data = await client.fetch(query);
  return data;
}

export default async function BlogSidebarPage({ params }) {
  const data = await getData(params.slug);

  return (
    <>
      <section>
        <Code data={data} params={params} />
      </section>
    </>
  );
}
