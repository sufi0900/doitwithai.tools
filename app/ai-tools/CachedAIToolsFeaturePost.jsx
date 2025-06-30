// ReusableCachedFeaturePost.jsx
"use client";
import React, { useMemo, useCallback } from "react"; // Added useMemo, useCallback
import FeaturePost from "@/components/Blog/featurePost";
import FeatureSkeleton from "@/components/Blog/Skeleton/FeatureCard"; // Corrected to FeatureCard if it's correct
import { urlForImage } from "@/sanity/lib/image";

import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { usePageCache } from '@/React_Query_Caching/usePageCache';

const ReusableCachedFeaturePost = ({ documentType, pageSlugPrefix, cacheKey }) => {
  // Memoize the query string itself for stability
  const memoizedFeatureQuery = useMemo(() => 
    `*[_type=="${documentType}"&&displaySettings.isOwnPageFeature==true]{_id,title,overview,mainImage,slug,publishedAt,readTime,tags,"displaySettings":displaySettings}`,
    [documentType] // Query changes only if documentType changes
  );

  // Memoize the options object for useSanityCache for stability
  const stableSanityCacheOptions = useMemo(() => ({
    componentName: `${documentType}FeaturePost`, // Use documentType for componentName
    enableOffline: true,
    // staleTime and maxAge will be pulled from getCacheConfig in useSanityCache
  }), [documentType]); // Options change only if documentType changes

  // Memoize an empty params object if your query doesn't use params
  const memoizedParams = useMemo(() => ({}), []);

  const { data, isLoading, error, refresh, isStale, cacheSource, lastUpdated } = useSanityCache(
    cacheKey,
    memoizedFeatureQuery, // Use the memoized query
    memoizedParams,       // Use the memoized params
    stableSanityCacheOptions // Use the stable options
  );

  // Register this query's key and refresh function with the PageCacheProvider
  usePageCache(
    cacheKey,
    refresh,
    memoizedFeatureQuery, // Use the memoized query string for tracking
    `${documentType} Feature Post` // Label for the cache status button
  );

  // Manual refresh handler for the component's retry button
  const handleRefresh = useCallback(() => {
    refresh(true); // Force refresh
  }, [refresh]);

  if (isLoading && !data) { // Show skeleton only if loading AND no data is present yet
    return (
      <div style={{ position: 'relative' }}>
        
        <FeatureSkeleton />
      </div>
    );
  }

  if (error && !data) { // Show error message if there's an error AND no data
    return (
      <div className="text-center py-8" style={{ position: 'relative' }}>
        
        <p className="text-red-500 dark:text-red-400">Failed to load feature posts: {error.message || 'An unknown error occurred.'}</p>
        <button
          onClick={handleRefresh}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const postsToDisplay = data || []; // Ensure data is an array for mapping

  return (
    <>
      <div style={{ position: 'relative' }}>
        {/* Cache Status Indicator for this component instance */}
      
        
        {isStale && postsToDisplay.length > 0 && (
          <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-yellow-800 dark:text-yellow-200">
              <span>⚠️</span><span>Feature Post content may be outdated.</span>
            </div>
          </div>
        )}
        
        {postsToDisplay.map((post) => (
          <div key={post._id}>
            <FeaturePost
              title={post.title}
              overview={post.overview}
              mainImage={urlForImage(post.mainImage).url()}
              slug={`/${pageSlugPrefix}/${post.slug.current}`}
              date={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              readTime={post.readTime?.minutes}
              tags={post.tags}
            />
          </div>
        ))}
      </div>

      {postsToDisplay.length === 0 && !isLoading && !error && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No feature posts found.</p>
          <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Refresh
          </button>
        </div>
      )}
    </>
  );
};

export default ReusableCachedFeaturePost;
