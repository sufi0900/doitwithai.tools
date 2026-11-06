// ../app/lib/sanity - UPDATED VERSION
import { createClient } from "next-sanity";
import { groq } from 'next-sanity';
import { getAllStaticArticleSitemapEntries } from "@/features/articles/legacy/staticArticles";

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
  const staticEntries = getAllStaticArticleSitemapEntries();
  const query = `*[_type in ["makemoney", "aitool", "seo", "coding", "blogPost", "guide"] && defined(slug.current) && (_type != "guide" || (defined(publishedAt) && publishedAt <= now()))] {
    "slug": slug.current,
    "title": title, 
    _type,
    _updatedAt,
    publishedAt
  }`;
  
  try {
    const posts = await client.fetch(query);
    
    // Filter out posts without slugs to avoid broken URLs and merge code-published articles
    const validSanityPosts = (Array.isArray(posts) ? posts : []).filter(post => post.slug && post.slug.trim() !== '');
    const seen = new Set();
    return [...staticEntries, ...validSanityPosts].filter((post) => {
      const key = `${post._type}:${post.slug}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (error) {
    console.error('Error fetching URLs from Sanity:', error);
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
