"use client";

import { useCachedSanityData } from '@/components/Blog/useSanityCache';
import { CACHE_KEYS } from '@/components/Blog/cacheKeys';
import BlogLayout from "@/app/ai-tools/[slug]/BlogLayout";
import SlugSkeleton from '@/components/Blog/Skeleton/SlugSkeleton';
// components/Blog/CachedArticleComponent.jsx

const CachedArticleComponent = ({ slug, documentType = "seo", serverData = null }) => {
  // Main article query
    const articleQuery = `*[_type=="${documentType}" && slug.current=="${slug}"][0]{
    _id,_type,title,slug,mainImage,overview,content,body,publishedAt,readTime,tags,tableOfContents,faqs,metatitle,metadesc,author,
    "categories": _type
  }`;
  

  // Related posts query
 const relatedPostsQuery = `*[_type in ["aitool", "makemoney", "news", "coding", "seo"] && slug.current != "${slug}"] | order(_createdAt desc) [0...3] {_id, _type, title, slug, mainImage, overview, publishedAt, readTime, tags}`;

  // Main article data with server data as fallback
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
      usePageContext: true, // Use page-scoped context for article
      enableOffline: true,
      
      forceRefresh: false,
      fallbackData: serverData // Use server data as fallback
    }
  );
// Replace the commented out related resources section with this:
const { data: relatedResources, isLoading: relatedResourcesLoading, refresh: refreshRelatedResources } = useCachedSanityData(
  CACHE_KEYS.ARTICLE_RELATED_RESOURCES(documentType, slug),
  `*[_type == "freeResources" && references("${articleData?._id || serverData?._id}")]{
    _id, title, slug, tags, mainImage, overview, resourceType, resourceFormat,
    resourceLink, resourceLinkType, previewSettings,
    "resourceFile": resourceFile.asset->,
    content, publishedAt, promptContent,
    "relatedArticle": relatedArticle->{title, slug},
    aiToolDetails,
    seoTitle, seoDescription, seoKeywords, altText, structuredData
  }`,
  {
    componentName: `RelatedResources-${documentType}-${slug}`,
    usePageContext: true,
    enableOffline: true,
    forceRefresh: false,
    dependencies: [articleData?._id || serverData?._id] // Add dependency on article ID
  }
);


  // Related posts data
  const {
    data: relatedPosts,
    isLoading: relatedPostsLoading,
    refresh: refreshRelatedPosts
  } = useCachedSanityData(
    CACHE_KEYS.ARTICLE_RELATED_POSTS(documentType, slug), // Use article-specific related posts key
    relatedPostsQuery,
    {
      componentName: `RelatedPosts-${documentType}-${slug}`,
      usePageContext: true, // Keep related posts scoped to article page refresh
      enableOffline: true,
      forceRefresh: false
    }
  );

  // Handle loading state - useserverdata if available
  if (articleLoading && !articleData && !serverData) {
    return <SlugSkeleton />;
  }

  // Handle error state - useserverdata as fallback
  if (articleError && !articleData && !serverData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Failed to load article</p>
        <button onClick={() => refreshArticle(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Retry</button>
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
      data={articleData || serverData}
    loading={articleLoading && !serverData}
    relatedPosts={relatedPosts || []}
    relatedPostsLoading={relatedPostsLoading}
    relatedResources={relatedResources || []} // Add this line
    resourcesLoading={relatedResourcesLoading} // Add this line
    documentType={documentType}
    slug={slug}
    schemaSlugMap={schemaSlugMap}
    />
  );
};

export default CachedArticleComponent;