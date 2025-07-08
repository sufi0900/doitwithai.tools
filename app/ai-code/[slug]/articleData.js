// lib/articleData.js
import { client } from "@/sanity/lib/client";
import { redisHelpers } from '@/app/lib/redis'; // Adjust path as needed
import { urlForImage } from "@/sanity/lib/image"; // <--- Ensure this import is here

/**
 * Fetches article data from Sanity, with Redis caching.
 * @param {string} slug - The slug of the article.
 * @param {string} schemaTypeName - The Sanity schema type name (e.g., "seo", "coding", "aitool", "makemoney").
 * @param {string} tagName - The tag name for Sanity revalidation (usually same as schemaTypeName).
 * @returns {Promise<object|null>} The fetched data or null if an error occurs.
 */
export async function getArticleData(slug, schemaTypeName, tagName = schemaTypeName) {
  const cacheKey = `article:${schemaTypeName}:${slug}`;
  const startTime = Date.now();
  let data = null;

  try {
    const cachedData = await redisHelpers.get(cacheKey);
    if (cachedData) {
      console.log(`[RedisCacheHit] for ${cacheKey} in ${Date.now() - startTime}ms`);
      return { ...cachedData, __source: 'server-redis' };
    }
  } catch (redisError) {
    console.error(`Redis error for ${cacheKey}:`, redisError.message);
  }

  console.log(`[SanityFetch] for ${cacheKey} starting...`);

  const query = `*[_type=="${schemaTypeName}" && slug.current=="${slug}"][0]{
    _id,
    title,
    slug,
    mainImage{asset->{_id,url},alt},
    publishedAt,
    _updatedAt,
    _createdAt,
    _type,
    metatitle,
    metadesc,
    schematitle,
    schemadesc,
    overview,
    content[]{
      ...,
      _type=="image"=>{asset->{_id,url},alt,caption,imageDescription[]{...}},
      _type=="gif"=>{asset->{_id,url},alt,caption},
      _type=="video"=>{asset->{_id,url},alt,caption},
    },
    "wordCount": length(pt::text(content)),
    "estimatedReadingTime": round(length(pt::text(content))/250),
    "headings": content[_type=="block" && style in ["h1","h2","h3","h4","h5","h6"]]{"text":pt::text(@),"level":style,"anchor":lower(pt::text(@))},
    faqs[]{question,answer},
    articleType,
    displaySettings,
    tags[]->{name,slug}
  }`;

  try {
    data = await client.fetch(query, {}, { next: { tags: [tagName, slug] } });
    console.log(`[SanityFetch] for ${cacheKey} completed in ${Date.now() - startTime}ms`);

    if (data) {
      try {
        await redisHelpers.set(cacheKey, data, { ex: 3600 });
        console.log(`[RedisCacheSet] for ${cacheKey}`);
      } catch (redisSetError) {
        console.error(`Redis set error for ${cacheKey}:`, redisSetError.message);
      }
      return { ...data, __source: 'server-network' };
    }
    return null;
  } catch (error) {
    console.error(`Server-side fetch for slug ${slug} with schema type ${schemaTypeName} failed:`, error.message);
    return null;
  }
}

/**
 * Generates metadata object for Next.js pages.
 * @param {object} data - The article data.
 * @param {object} params - Next.js route parameters.
 * @param {string} basePath - The base URL path (e.g., 'ai-seo', 'ai-code').
 * @param {string} metadataCategory - The specific category string for metadata (e.g., 'AI in SEO & Digital Marketing').
 * @returns {object} The metadata object.
 */
export function generatePageMetadata(data, params, basePath, metadataCategory) { // <--- **Crucial: Exported here**
  if (!data) {
    return {
      title: 'Loading Content/Offline | DoItWithAI.tools',
      description: 'The content for this page is currently loading or you are offline. Attempting to retrieve cached data.',
      robots: { index: false, follow: false, },
    };
  }

  const imageUrl = data.mainImage ? urlForImage(data.mainImage).url() : null;
  const canonicalUrl = `https://www.doitwithai.tools/${basePath}/${params.slug}`;

  return {
    title: `${data.metatitle || data.title || 'DoItWithAI.tools'}`,
    description: data.metadesc || data.overview || 'AI tools and resources',
    keywords: data.tags?.map(tag => tag?.name).join(',') || '',
    authors: [{ name: "Sufian Mustafa", url: "https://www.doitwithai.tools/author/sufian-mustafa" }],
    creator: "Sufian Mustafa",
    publisher: "DoItWithAI.tools",
    category: metadataCategory,
    classification: 'Technology, Marketing, SEO',
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      title: data.metatitle,
      description: data.metadesc,
      url: canonicalUrl,
      siteName: 'DoItWithAI.tools',
      locale: 'en_US',
      images: imageUrl ? [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: data.mainImage?.alt || data.metatitle,
        type: 'image/jpeg',
      }] : [],
      publishedTime: data.publishedAt,
      modifiedTime: data._updatedAt,
      section: metadataCategory,
      tags: data.tags?.map(tag => tag?.name) || [],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@doitwithai',
      creator: '@sufianmustafa',
      title: data.metatitle,
      description: data.metadesc,
      images: imageUrl ? [imageUrl] : [],
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
  };
}