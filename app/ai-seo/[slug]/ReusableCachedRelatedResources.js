"use client";
import { useCachedSanityData } from '@/components/Blog/useSanityCache';
import { CACHE_KEYS } from '@/components/Blog/cacheKeys';
import { fetchRelatedResources } from "@/app/free-ai-resources/resourceHelpers";

const ReusableCachedRelatedResources = ({ 
  currentPostId, 
  documentType, 
  limit = 3,
  children 
}) => {
  const {
    data: relatedResources,
    isLoading,
    error,
    isOffline,
    dataSource,
    refresh
  } = useCachedSanityData(
    CACHE_KEYS.ARTICLE_RELATED_RESOURCES(documentType, currentPostId),
    null, // No direct query - using custom fetch function
    {
      componentName: `${documentType}-RelatedResources-${currentPostId}`,
      usePageContext: true,
      enableOffline: true,
      forceRefresh: false,
      customFetch: async () => {
        if (currentPostId) {
          return await fetchRelatedResources(currentPostId, documentType, currentPostId);
        }
        return [];
      }
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

  if (error && !relatedResources) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 mb-2 text-sm">Failed to load related resources</p>
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
    data: relatedResources || [], 
    isOffline, 
    dataSource, 
    refresh,
    isLoading
  });
};

export default ReusableCachedRelatedResources;