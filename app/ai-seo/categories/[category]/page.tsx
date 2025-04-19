// SubCategoryPage.tsx
import SubCategoryContent from "./code";
import groq from "groq";
import { client } from "@/sanity/lib/client";

// SubCategoryPage.tsx
// [category]/page.tsx (Parent Component - Server Side)
import { urlForImage } from "@/sanity/lib/image";


export const revalidate = false;
export const dynamic = "force-dynamic";

async function generateStaticParams() {
  const query = `*[_type == "seoSubcategory"] {
    slug {
      current
    }
  }`;
  const slugs = await client.fetch(query);
  return slugs.map((slug) => ({
    category: slug.slug.current,
  }));
}

async function fetchSubcategoryPosts(slug: string) {
  const query = `*[_type == "seo" && references(*[_type == "seoSubcategory" && slug.current == $slug]._id)] {
    _id,
    title,
    slug,
    mainImage,
    overview,
    publishedAt,
    readTime,
    tags
  }`;
  return await client.fetch(query, { slug });
}

async function fetchSubcategoryInfo(slug: string) {
  const query = `*[_type == "seoSubcategory" && slug.current == $slug][0]`;
  return await client.fetch(query, { slug });
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const posts = await fetchSubcategoryPosts(params.category);
  const subcategoryInfo = await fetchSubcategoryInfo(params.category);

  if (!subcategoryInfo) {
    return <div>Category not found</div>;
  }

  // Transform the data for the client component
  const transformedPosts = posts.map(post => ({
    ...post,
    mainImage: urlForImage(post.mainImage).url(),
    publishedAt: new Date(post.publishedAt).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }));

  return (
    <SubCategoryContent 
      posts={transformedPosts}
      subcategoryInfo={subcategoryInfo}
    />
  );
}
