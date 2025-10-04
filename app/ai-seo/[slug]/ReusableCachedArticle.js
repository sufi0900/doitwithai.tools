"use client";

import { useCachedSanityData } from '@/components/Blog/useSanityCache';
import { CACHE_KEYS } from '@/components/Blog/cacheKeys';
import BlogLayout from "@/app/ai-tools/[slug]/BlogLayout";
import SlugSkeleton from '@/components/Blog/Skeleton/SlugSkeleton';
import { usePageRefresh } from '@/components/Blog/PageScopedRefreshContext';
import { useEffect } from 'react';


const CachedArticleComponent = ({ slug, documentType = "seo", serverData = null }) => {
  // --- ALL REACT HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP LEVEL ---

  const { isRefreshing } = usePageRefresh();

  // Main article query
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
      componentName: `Article-${documentType}-${slug}`,
      usePageContext: true,
      enableOffline: true,
      forceRefresh: false,
      enableForceRefreshDetection: true,
      enableImmediateRefresh: true,
      enableCustomEventListening: true
    }
  );

  // Related resources data
  // Note: dependencies array for `useCachedSanityData` should be handled carefully
  // If `articleData?._id` is null initially, the query will run with `references("")` which is fine,
  // then re-run when articleData._id becomes available.
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

  // Re-organize useEffect to be at the top level
  useEffect(() => {
    // Import cacheService here if it's not globally available or passed as prop
    // For this example, let's assume it's imported or globally accessible.
    // If cacheService needs to be imported, ensure it's a client-side import.
    // import { cacheService } from '@/utils/cacheService'; // Example import path

    if (typeof window === 'undefined') {
      return; // Skip if not in browser environment
    }

    // Dynamic import for cacheService to ensure it's only loaded client-side
    let cacheService;
    import('@/components/Blog/useCache').then(module => {
      cacheService = module.cacheService;

      const handleArticleUpdate = (event) => {
        const { documentType: updateDocType, slug: updateSlug } = event.detail;
        if (updateDocType === documentType && updateSlug === slug) {
          console.log(`🔄 Article update detected for ${documentType}/${slug}`);
          if (cacheService) { // Ensure cacheService is loaded
             cacheService.clear(CACHE_KEYS.ARTICLE_SINGLE(documentType, slug));
          }
          refreshArticle(true, true); // Pass true for both refreshAllPages and forceIgnoreCache
        }
      };

      const handleForceRefresh = (event) => {
        const { componentName: updateComponentName } = event.detail;
        const expectedComponentName = `Article-${documentType}-${slug}`;
        if (updateComponentName === expectedComponentName) {
          console.log(`🚀 Force refresh event for ${expectedComponentName}`);
          if (cacheService) { // Ensure cacheService is loaded
             cacheService.clear(CACHE_KEYS.ARTICLE_SINGLE(documentType, slug));
          }
          refreshArticle(true, true);
        }
      };

      // NEW: Handle page-specific refresh button clicks
      const handlePageRefresh = () => {
        console.log(`🔄 Page refresh triggered for article ${documentType}/${slug}`);
        if (cacheService) { // Ensure cacheService is loaded
            cacheService.clear(CACHE_KEYS.ARTICLE_SINGLE(documentType, slug));
        }
        refreshArticle(true, true);
      };

      window.addEventListener('article-update', handleArticleUpdate);
      window.addEventListener('force-article-refresh', handleForceRefresh);
      window.addEventListener('page-refresh-triggered', handlePageRefresh); // NEW

      return () => {
        window.removeEventListener('article-update', handleArticleUpdate);
        window.removeEventListener('force-article-refresh', handleForceRefresh);
        window.removeEventListener('page-refresh-triggered', handlePageRefresh); // NEW
      };
    }).catch(err => {
      console.error("Failed to load cacheService:", err);
    });
  }, [refreshArticle, documentType, slug]); // Dependencies remain the same


  // --- CONDITIONAL RENDERING (return statements) GO AFTER ALL HOOKS ---

  const shouldShowFullPageSkeleton = articleLoading && !articleData;
  const shouldPassArticleLoading = articleLoading;

  // Handle initial loading state - show full skeleton when no data at all
  if (shouldShowFullPageSkeleton) {
    return (
      <>
        <SlugSkeleton />
      </>
    );
  }

  if (articleError && !articleData) {
    return (
      <div className="text-center py-8">
        <p>Failed to load article</p>
        <button
          onClick={() => refreshArticle(true, true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Don't show anything if no data and still loading
  if (!articleData && articleLoading) {
    return <SlugSkeleton />;
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