// ReusableCachedFeaturePost.jsx
"use client";
import React, { useMemo, useCallback } from "react";
import FeaturePost from "@/components/Blog/featurePost";
import FeatureSkeleton from "@/components/Blog/Skeleton/FeatureCard";
import { urlForImage } from "@/sanity/lib/image";
import { useUnifiedCache } from '@/React_Query_Caching/useUnifiedCache'; // This is correct
import { usePageCache } from '@/React_Query_Caching/usePageCache'; // This is correct

const ReusableCachedFeaturePost = ({ documentType, pageSlugPrefix, cacheKey, initialData = null }) => {
  // Memoize the query string itself for stability
  const memoizedFeatureQuery = useMemo(() =>
    `*[_type=="${documentType}"&&displaySettings.isOwnPageFeature==true][0]`, // Query returns a single object
    [documentType]
  );
  const memoizedParams = useMemo(() => ({}), []);

  // Update the cache options
  const stableSanityCacheOptions = useMemo(() => ({
    componentName: `${documentType}FeaturePost`,
    enableOffline: true,
    initialData: initialData, // Use the initial data (which should be a single object or null)
    
  }), [documentType, initialData]);

  // Replace useSanityCache with useUnifiedCache
  const {
    data, // This `data` will be a single object (the featured post) or null
    isLoading,
    error,
    refresh,
    isStale,
    cacheSource,
    lastUpdated
  } = useUnifiedCache(
    cacheKey,
    memoizedFeatureQuery,
    memoizedParams,
    { ...stableSanityCacheOptions, schemaType: documentType }
  );

  // Register this query's key and refresh function with the PageCacheProvider
  usePageCache(
    cacheKey,
    refresh,
    memoizedFeatureQuery,
    `${documentType} Feature Post`
  );

  // Manual refresh handler for the component's retry button
  const handleRefresh = useCallback(() => {
    refresh(true); // Force refresh
  }, [refresh]);

  // Check if data is loading OR if there's no data AND it's still loading
  // (i.e., we don't have existing data to display)
  if (isLoading && !data) {
    return (
      <div style={{ position: 'relative' }}>
        <FeatureSkeleton />
      </div>
    );
  }

  // Show error message if there's an error AND no data to display
  if (error && !data) {
    return (
      <div className="text-center py-8" style={{ position: 'relative' }}>
        <p className="text-red-500 dark:text-red-400">Failed to load feature post: {error.message || 'An unknown error occurred.'}</p>
        <button
          onClick={handleRefresh}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // 'data' will be the single featured post object or null/undefined if not found
  const featurePost = data;

  return (
    <>
      <div style={{ position: 'relative' }}>
        {isStale && featurePost && ( // Only show stale warning if a post is being displayed
          <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-yellow-800 dark:text-yellow-200">
              <span>⚠️</span><span>Feature Post content may be outdated.</span>
            </div>
          </div>
        )}

        {featurePost ? ( // Render FeaturePost only if 'featurePost' object exists
          <div key={featurePost._id}>
            <FeaturePost
              title={featurePost.title}
              overview={featurePost.overview}
              mainImage={urlForImage(featurePost.mainImage).url()}
              slug={`/${pageSlugPrefix}/${featurePost.slug.current}`}
              date={new Date(featurePost.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              readTime={featurePost.readTime?.minutes}
              tags={featurePost.tags}
            />
          </div>
        ) : ( // Show "No feature posts found" message if 'featurePost' is null/undefined
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No feature post found.</p>
            {!isLoading && ( // Only show refresh button if not currently loading
              <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Refresh
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ReusableCachedFeaturePost;