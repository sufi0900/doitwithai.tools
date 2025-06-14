"use client";

import { useCachedSanityData } from '@/components/Blog/useSanityCache';
import { CACHE_KEYS } from '@/components/Blog/cacheKeys';
import BlogLayout from "@/app/ai-tools/[slug]/BlogLayout";
import SlugSkeleton from '@/components/Blog/Skeleton/SlugSkeleton';

const CachedArticleComponent = ({ slug, documentType = "seo" }) => {
  // Main article query
  const articleQuery = `*[_type=="${documentType}" && slug.current=="${slug}"][0]{
    _id,
    _type,
    title,
    slug,
    mainImage,
    overview,
    content,
    body,
    publishedAt,
    readTime,
    tags,
    tableOfContents,
    faqs,
    metatitle,
    metadesc,
    author
  }`;

  // Related posts query
  const relatedPostsQuery = `*[_type in ["aitool", "makemoney", "news", "coding", "freeairesources", "seo"] && slug.current != "${slug}"] | order(_createdAt desc)[0...3]{
    _id,
    _type,
    title,
    slug,
    mainImage,
    overview,
    publishedAt,
    readTime,
    tags
  }`;

  // Related resources query
  const relatedResourcesQuery = `*[_type == "freeairesources"] | order(_createdAt desc)[0...4]{
    _id,
    _type,
    title,
    slug,
    mainImage,
    overview,
    publishedAt
  }`;

  // Main article data
  const {
    data: articleData,
    isLoading: articleLoading,
    error: articleError,
    refresh: refreshArticle
  } = useCachedSanityData(
    CACHE_KEYS.ARTICLE_SINGLE(documentType, slug),
    articleQuery,
    {
      componentName: `Article-${documentType}-${slug}`,
      usePageContext: true,
      enableOffline: true,
      forceRefresh: false
    }
  );

  // Related posts data
  const {
    data: relatedPosts,
    isLoading: relatedPostsLoading,
    refresh: refreshRelatedPosts
  } = useCachedSanityData(
    CACHE_KEYS.ARTICLE_RELATED_POSTS(documentType, slug),
    relatedPostsQuery,
    {
      componentName: `RelatedPosts-${documentType}-${slug}`,
      usePageContext: true,
      enableOffline: true,
      forceRefresh: false
    }
  );

  // Related resources data
  const {
    data: relatedResources,
    isLoading: relatedResourcesLoading,
    refresh: refreshRelatedResources
  } = useCachedSanityData(
    CACHE_KEYS.ARTICLE_RELATED_RESOURCES(documentType, slug),
    relatedResourcesQuery,
    {
      componentName: `RelatedResources-${documentType}-${slug}`,
      usePageContext: true,
      enableOffline: true,
      forceRefresh: false
    }
  );

  // Handle loading state
  if (articleLoading && !articleData) {
    return <SlugSkeleton />;
  }

  // Handle error state
  if (articleError && !articleData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Failed to load article</p>
        <button
          onClick={() => refreshArticle(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const schemaSlugMap = {
    makemoney: "ai-learn-earn",
    aitool: "ai-tools",
    news: "news",
    coding: "ai-code",
    freeairesources: "free-ai-resources",
    seo: "ai-seo",
  };

  return (
    <BlogLayout
      data={articleData}
      loading={articleLoading}
      relatedPosts={relatedPosts || []}
      relatedPostsLoading={relatedPostsLoading}
      relatedResources={relatedResources || []}
      resourcesLoading={relatedResourcesLoading}
      schemaSlugMap={schemaSlugMap}
    />
  );
};

export default CachedArticleComponent;