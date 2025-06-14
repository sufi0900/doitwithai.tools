"use client";

import { useCachedSanityData } from '@/components/Blog/useSanityCache';
import { CACHE_KEYS } from '@/components/Blog/cacheKeys';
import BlogLayout from "@/app/ai-tools/[slug]/BlogLayout";
import SlugSkeleton from '@/components/Blog/Skeleton/SlugSkeleton';
import { usePageRefresh } from '@/components/Blog/PageScopedRefreshContext';
// components/Blog/CachedArticleComponent.jsx

const CachedArticleComponent = ({ slug, documentType = "seo", serverData = null }) => {
  // Main article query

  const { isRefreshing } = usePageRefresh();

  const articleQuery = `*[_type == "${documentType}" && slug.current == "${slug}"][0]{
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
        author,
        "categories": _type
    }`;


  // Related posts query
 const relatedPostsQuery = `*[_type in ["aitool", "makemoney", "news", "coding", "seo"] && slug.current != "${slug}"] | order(_createdAt desc) [0...3] {_id, _type, title, slug, mainImage, overview, publishedAt, readTime, tags}`;

  // Main article data with server data as fallback
// Main article data with server data as fallback
  const {
    data: articleData,
    isLoading: articleLoading,
    error: articleError,
    refresh: refreshArticle,
    dataSource: articleDataSource,
    isOffline: articleIsOffline
  } = useCachedSanityData(
    CACHE_KEYS.ARTICLE_SINGLE(documentType, slug),
    articleQuery,
    {
      componentName: `Article-${documentType}-${slug}`, // This is the key fix
      usePageContext: true,
      enableOffline: true,
      forceRefresh: false,
      fallbackData: serverData
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
// Only show full page skeleton on initial load when no data is available
const shouldShowFullPageSkeleton = articleLoading && (!articleData && !serverData);
const shouldPassArticleLoading = articleLoading; // Pass loading state even with fallback data

// Handle initial loading state - show full skeleton only when no data at all
if (shouldShowFullPageSkeleton) {
    return (
        <>
            <SlugSkeleton/>
        </>
    );
}

 if (articleError && !articleData && !serverData) {
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
      data={articleData || serverData}
      loading={shouldPassArticleLoading} // Pass the actual loading state
      articleLoading={shouldPassArticleLoading} // Keep this for granular control
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