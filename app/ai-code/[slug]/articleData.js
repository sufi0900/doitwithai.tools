// lib/articleData.js
import { client } from "@/sanity/lib/client";
import { redisHelpers } from '@/app/lib/redis'; // Adjust path as needed
import { urlForImage } from "@/sanity/lib/image";




export async function getAllArticleSlugs(schemaTypeName) {
  const query = `*[_type == "${schemaTypeName}"]{ "slug": slug.current }`;
  try {
    const slugs = await client.fetch(query);
    console.log(`[SanityFetch] Fetched ${slugs.length} slugs for type "${schemaTypeName}".`);
    return slugs;
  } catch (error) {
    console.error(`Failed to fetch slugs for schema type ${schemaTypeName}:`, error.message);
    return []; // Return an empty array on error to prevent build failure
  }
}

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
  tableOfContents[], 
  faqs[]{question,answer},
  articleType,
  displaySettings,
  tags[]->{name,slug},
}`;

  try {
    data = await client.fetch(query, {}, { next: { tags: [tagName, slug] } });
    console.log(`[SanityFetch] for ${cacheKey} completed in ${Date.now() - startTime}ms`);

    if (data) {
      try {
        await redisHelpers.set(cacheKey, data, { ex: 86400 });
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


export function generatePageMetadata(data, params, basePath, metadataCategory) {
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

