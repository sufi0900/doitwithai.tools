"use client";
import { useCachedSanityData } from '@/components/Blog/useSanityCache';
import { CACHE_KEYS } from '@/components/Blog/cacheKeys';
import { client } from "@/sanity/lib/client";

const ReusableCachedRelatedPosts = ({ 
  currentPostId, 
  documentType, 
  limit = 3,
  children // Render prop for related posts
}) => {
  const relatedPostsQuery = `*[_type == "${documentType}" && _id != $excludeId] | order(_createdAt desc)[0...${limit}]`;
  
  const {
    data: relatedPosts,
    isLoading,
    error,
    isOffline,
    dataSource,
    refresh
  } = useCachedSanityData(
    CACHE_KEYS.ARTICLE_RELATED_POSTS(documentType, currentPostId),
    relatedPostsQuery,
    {
      componentName: `${documentType}-RelatedPosts-${currentPostId}`,
      usePageContext: true,
      enableOffline: true,
      forceRefresh: false,
      // Pass the excludeId parameter to the query
      queryParams: { excludeId: currentPostId }
    }
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: limit }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error && !relatedPosts) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 mb-2 text-sm">Failed to load related posts</p>
        <button
          onClick={() => refresh()}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return children({ 
    data: relatedPosts || [], 
    isOffline, 
    dataSource, 
    refresh,
    isLoading
  });
};

export default ReusableCachedRelatedPosts;