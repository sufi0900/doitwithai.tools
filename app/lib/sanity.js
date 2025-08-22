// ../app/lib/sanity - UPDATED VERSION
import { createClient } from "next-sanity";
import { groq } from 'next-sanity';

export const revalidate = false;
export const dynamic = "force-dynamic";

export const client = createClient({
  projectId: 'qyshio4a',
  dataset: 'production',
  useCdn: false,
});

// Updated function to include _updatedAt for better sitemap lastModified dates
export async function fetchURLs() {
  const query = `*[_type in ["makemoney", "aitool", "news", "coding", "freeairesources", "seo"]] {
    "slug": slug.current,
    "title": title, 
    _type,
    _updatedAt,
    publishedAt
  }`;
  
  try {
    const posts = await client.fetch(query);
    
    // Filter out posts without slugs to avoid broken URLs
    return posts.filter(post => post.slug && post.slug.trim() !== '');
  } catch (error) {
    console.error('Error fetching URLs from Sanity:', error);
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