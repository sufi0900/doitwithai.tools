// features/articles/legacy/articleData.js
import { client } from "@/sanity/lib/client";
import { redisHelpers } from "@/app/lib/redis";
import { urlForImage } from "@/sanity/lib/image";
import { articleMetrics } from "@/features/articles/legacy/content-metrics.mjs";
import { applySeoOverrides } from "@/features/articles/legacy/seoArticleOverrides";
import {
  getStaticArticle,
  getStaticArticleSlugs,
} from "@/features/articles/legacy/staticArticles";

export async function getAllArticleSlugs(schemaTypeName) {
  const staticSlugs = getStaticArticleSlugs(schemaTypeName);
  const query = `*[_type == $type && defined(slug.current)]{ "slug": slug.current }`;
  try {
    const sanitySlugs = await client.fetch(
      query,
      { type: schemaTypeName },
      { perspective: "published" }
    );
    const merged = [...staticSlugs, ...(Array.isArray(sanitySlugs) ? sanitySlugs : [])];
    const seen = new Set();
    return merged.filter((item) => {
      if (!item?.slug || seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    });
  } catch (error) {
    console.error(`Fallback to static slugs for ${schemaTypeName}:`, error.message);
    return staticSlugs;
  }
}

export async function getArticleData(slug, schemaTypeName, tagName = schemaTypeName) {
  // 1. Check code-managed static / snapshot articles first (0ms latency, 100% git-controlled)
  const staticDoc = getStaticArticle(slug, schemaTypeName);
  if (staticDoc) {
    const metrics = articleMetrics(staticDoc.content);
    const mergedStatic = {
      ...staticDoc,
      ...metrics,
      readTime: staticDoc.readTime?.minutes
        ? staticDoc.readTime
        : { isAutomatic: true, minutes: metrics.estimatedReadingTime },
      __source: "code-static",
    };
    return applySeoOverrides(mergedStatic, schemaTypeName);
  }

  const cacheKey = `article:${schemaTypeName}:${slug}`;
  const startTime = Date.now();

  try {
    const cachedData = await redisHelpers.get(cacheKey);
    if (cachedData) {
      const metrics = articleMetrics(cachedData.content);
      return applySeoOverrides(
        {
          ...cachedData,
          ...metrics,
          readTime: cachedData.readTime?.minutes
            ? cachedData.readTime
            : { isAutomatic: true, minutes: metrics.estimatedReadingTime },
          __source: "server-redis",
        },
        schemaTypeName
      );
    }
  } catch (redisError) {
    console.error(`Redis error for ${cacheKey}:`, redisError.message);
  }

  const query = `*[_type==$type && slug.current==$slug][0]{
    _id,
    title,
    slug,
    mainImage{asset->{_id,url},alt,caption,imageDescription[]{...}},
    publishedAt,
    _updatedAt,
    _createdAt,
    _type,
    metatitle,
    metadesc,
    schematitle,
    schemadesc,
    overview,
    readTime,
    relatedToolSlugs,
    content[]{
      ...,
      _type=="image"=>{asset->{_id,url},alt,caption,imageDescription[]{...}},
      _type=="gif"=>{asset->{_id,url},alt,caption},
      _type=="video"=>{asset->{_id,url},alt,caption},
    },
    "headings": content[_type=="block" && style in ["h1","h2","h3","h4","h5","h6"]]{"text":pt::text(@),"level":style,"anchor":lower(pt::text(@))},
    tableOfContents[],
    faqs[]{question,answer},
    articleType,
    displaySettings,
    tags[]->{name,slug},
  }`;

  try {
    const data = await client.fetch(
      query,
      { type: schemaTypeName, slug },
      { perspective: "published", next: { tags: [tagName, slug] } }
    );

    if (data) {
      const metrics = articleMetrics(data.content);
      Object.assign(data, metrics);
      if (!data.readTime?.minutes) {
        data.readTime = { isAutomatic: true, minutes: metrics.estimatedReadingTime };
      }
      try {
        await redisHelpers.set(cacheKey, data, { ex: 86400 });
      } catch (redisSetError) {
        console.error(`Redis set error for ${cacheKey}:`, redisSetError.message);
      }
      return applySeoOverrides({ ...data, __source: "server-network" }, schemaTypeName);
    }
    return null;
  } catch (error) {
    console.error(`Server-side fetch for slug ${slug} (${schemaTypeName}) failed:`, error.message);
    return null;
  }
}

export function resolveArticleImageUrl(mainImage) {
  if (!mainImage) return null;
  if (mainImage.localUrl) {
    return mainImage.localUrl.startsWith("http")
      ? mainImage.localUrl
      : `https://doitwithai.tools${mainImage.localUrl}`;
  }
  if (mainImage.asset) {
    try {
      return urlForImage(mainImage).url();
    } catch {
      return null;
    }
  }
  return null;
}

export function generatePageMetadata(rawData, params, basePath, metadataCategory) {
  const data = applySeoOverrides(rawData, rawData?._type);
  if (!data) {
    return {
      title: "Loading Content/Offline | DoItWithAI.tools",
      description:
        "The content for this page is currently loading or you are offline. Attempting to retrieve cached data.",
      robots: { index: false, follow: false },
    };
  }

  const imageUrl = resolveArticleImageUrl(data.mainImage);
  const canonicalUrl = `https://doitwithai.tools/${basePath}/${params.slug}`;
  const effectiveTitle = data.metatitle || data.title || "DoItWithAI.tools";
  const effectiveDesc = data.metadesc || data.overview || "AI tools and resources";

  return {
    title: effectiveTitle,
    description: effectiveDesc,
    keywords: data.tags?.map((tag) => tag?.name).filter(Boolean).join(",") || "",
    authors: [{ name: "Sufian Mustafa", url: "https://doitwithai.tools/author/sufian-mustafa" }],
    creator: "Sufian Mustafa",
    publisher: "DoItWithAI.tools",
    category: metadataCategory,
    classification: "Technology, Marketing, SEO",
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      title: effectiveTitle,
      description: effectiveDesc,
      url: canonicalUrl,
      siteName: "DoItWithAI.tools",
      locale: "en_US",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: data.mainImage?.alt || effectiveTitle,
              type: "image/jpeg",
            },
          ]
        : [],
      publishedTime: data.publishedAt,
      modifiedTime: data._updatedAt,
      section: metadataCategory,
      tags: data.tags?.map((tag) => tag?.name).filter(Boolean) || [],
    },
    twitter: {
      card: "summary_large_image",
      site: "@doitwithai",
      creator: "@sufianmustafa",
      title: effectiveTitle,
      description: effectiveDesc,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}
