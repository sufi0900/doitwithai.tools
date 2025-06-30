// components/Resources/ReusableCachedFeaturedFreeResources.jsx
"use client";

import React, { useMemo, useCallback } from 'react'; // Import useMemo and useCallback
import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';

import FeatureSkeleton from "@/components/Blog/Skeleton/FeatureCard";
import VerticalFeaturePost from "./FeatureResourcePost"; // Assuming this path for rendering


const ReusableCachedFeaturedFreeResources = () => {
  // Memoize the query string itself for stability
  const memoizedQuery = useMemo(() => `*[_type == "freeResources" && isOwnPageFeature == true] | order(publishedAt desc) {
    _id, title, slug, tags, mainImage, overview, resourceType, resourceFormat,
    resourceLink, resourceLinkType, previewSettings,
    "resourceFile": resourceFile.asset->,
    content, publishedAt, promptContent,
    "relatedArticle": relatedArticle->{title, slug},
    aiToolDetails,
    seoTitle, seoDescription, seoKeywords, altText, structuredData
  }`, []); // Empty dependency array means query is stable and won't re-create

  // Memoize the options object for useSanityCache for stability
  const stableOptions = useMemo(() => ({
    componentName: 'FeaturedFreeResources',
    enableOffline: true,
    group: 'free-resources', // Assign to a group for easy invalidation
  }), []); // Empty dependency array means options are stable and won't re-create

  // Memoize an empty params object if your query doesn't use params
  const memoizedParams = useMemo(() => ({}), []);

  const { data: featuredResources, isLoading, error, refresh, isStale } = useSanityCache(
    CACHE_KEYS.PAGE.FREERESOURCES_FEATURED, // Use the new specific cache key
    memoizedQuery, // Use the memoized query
    memoizedParams, // Use the memoized params
    stableOptions // Use the stable options
  );

  // Register this component's cache key with usePageCache
  usePageCache(
    CACHE_KEYS.PAGE.FREERESOURCES_FEATURED, // The cache key for this data
    refresh,                               // The refresh function provided by useSanityCache
    memoizedQuery,                         // The memoized query string associated
    'Featured Free Resources'              // A descriptive label for debugging/status button
  );

  // Memoize the refresh handler for the Retry button
  const handleRefresh = useCallback(() => {
    refresh(true); // Force refresh
  }, [refresh]);

  if (isLoading) {
    return <FeatureSkeleton />;
  }

  if (error && !featuredResources) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load featured resources.</p>
        <button
          onClick={handleRefresh} // Use the memoized handleRefresh
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!featuredResources || featuredResources.length === 0) {
    return null; // Don't render anything if no featured resources
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Featured Resources</h2>
      {isStale && featuredResources.length > 0 && (
          <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-yellow-800 dark:text-yellow-200">
              <span>⚠️</span><span>Featured Resources content may be outdated.</span>
            </div>
          </div>
      )}
      {featuredResources.map((resource) => (
        <VerticalFeaturePost key={resource._id} resource={resource} />
      ))}
    </div>
  );
};

export default ReusableCachedFeaturedFreeResources;
