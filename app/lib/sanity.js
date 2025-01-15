import { createClient } from "next-sanity";
export const revalidate = false;
import { groq } from 'next-sanity';

export const dynamic = "force-dynamic";
export const client = createClient({
  projectId: 'qyshio4a', // find this at manage.sanity.io or your sanity.json
  dataset: 'production', // or the name of your dataset
  useCdn: false, // `false` if you want to ensure fresh data
});

export async function fetchURLs() {
  const query = `*[_type in ["makemoney", "aitool", "news", "coding", "freeairesources", "seo"]] {
    "slug": slug.current,
    "title": title, 
    _type
  }`;
  const posts = await client.fetch(query);
  return posts;
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