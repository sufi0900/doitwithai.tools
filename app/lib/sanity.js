import { getAllStaticArticleSitemapEntries } from "@/features/articles/legacy/staticArticles";
// ../app/lib/sanity - UPDATED VERSION
import { createClient } from "next-sanity";
import { groq } from 'next-sanity';

export const revalidate = false;
export const dynamic = "force-dynamic";

export const client = createClient({
  projectId: 'qyshio4a',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-03-30',
  perspective: 'published',
});

// Updated function to include _updatedAt for better sitemap lastModified dates
export async function fetchURLs() {
  const query = `*[_type in ["makemoney", "aitool", "seo", "coding", "blogPost", "guide"] && defined(slug.current) && (_type != "guide" || (defined(publishedAt) && publishedAt <= now()))] {
    "slug": slug.current,
    "title": title, 
    _type,
    _updatedAt,
    publishedAt
  }`;
  
  const staticEntries = getAllStaticArticleSitemapEntries();
  try {
    const posts = await client.fetch(query);
    const combined = [...staticEntries, ...(Array.isArray(posts) ? posts : [])];
    const seen = new Set();
    return combined.filter((post) => {
      const slug = post?.slug?.trim?.();
      if (!slug) return false;
      const key = `${post._type}:${slug}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (error) {
    console.error("Error fetching URLs from Sanity, using static entries:", error);
    return staticEntries;
  }
}

export async function fetchBlogCategorySlugs() {
  const query = `*[_type == "blogCategory" && defined(slug.current)]{
    "slug": slug.current,
    _updatedAt
  }`;

  try {
    return await client.fetch(query);
  } catch (error) {
    console.error('Error fetching blog category URLs from Sanity:', error);
    return [];
  }
}

export const getSubcategoriesQuery = groq`
  *[_type == "seoSubcategory"] {
    title,
    "slug": slug.current,
    description
  }
`

export const getPostsBySubcategoryQuery = groq`
  *[_type == "seo" && references(*[_type == "seoSubcategory" && slug.current == $slug]._id)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    mainImage,
    overview,
    publishedAt,
    readTime,
    tags,
    subcategory->{
      title,
      "slug": slug.current
    }
  }
`
