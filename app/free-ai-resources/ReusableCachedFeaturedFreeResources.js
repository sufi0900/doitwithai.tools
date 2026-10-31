// components/Resources/ReusableCachedFeaturedFreeResources.jsx
"use client";
import React, { useMemo, useCallback } from 'react';
// --- CHANGED: Import useUnifiedCache ---
import { useUnifiedCache } from '@/React_Query_Caching/useUnifiedCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
import FeatureSkeleton from "@/components/Blog/Skeleton/FeatureCard";
import HorizentalFeaturePost from "./FeatureResourcePost"; 

const ReusableCachedFeaturedFreeResources = ({ initialData = null }) => { // Accept initialData prop
  const memoizedQuery = useMemo(() => `*[_type=="freeResources"&&isOwnPageFeature==true]|order(publishedAt desc)[0]{
    _id,title,slug,tags,mainImage,overview,resourceType,resourceFormat,resourceLink,resourceLinkType,
    previewSettings,"resourceFile":resourceFile.asset->,content,publishedAt,promptContent,
    "relatedArticle":relatedArticle->{title,slug, _type},aiToolDetails,seoTitle,seoDescription,seoKeywords,altText,structuredData
  }`, []);

  const stableOptions = useMemo(() => ({
    componentName: 'FeaturedFreeResources',
    enableOffline: true,
    group: 'free-resources',
    // --- NEW: Pass initialData ---
    initialData: initialData,
    // --- NEW: Specify schemaType for useUnifiedCache ---
    schemaType: "freeResources",
   
  }), [initialData]); // Add initialData to dependency array

  const memoizedParams = useMemo(() => ({}), []); // Still memoize empty params

  const { data: featuredResource, isLoading, error, refresh, isStale } = useUnifiedCache( // --- CHANGED: useUnifiedCache ---
    CACHE_KEYS.PAGE.FREERESOURCES_FEATURED,
    memoizedQuery,
    memoizedParams,
    stableOptions
  );

  usePageCache(
    CACHE_KEYS.PAGE.FREERESOURCES_FEATURED,
    refresh,
    memoizedQuery,
    'FeaturedFreeResources'
  );

  const handleRefresh = useCallback(() => {
    refresh(true);
  }, [refresh]);

  if (isLoading) { // Show skeleton always when loading
    return <FeatureSkeleton />;
  }

  // Handle error and no data cases more explicitly
  if (error) { // Show error if there's an error and NO data
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load featured resources: {error.message || 'An unknown error occurred.'}</p>
        <button onClick={handleRefresh} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Retry</button>
      </div>
    );
  }

  // If no error, but also no data, return null to render nothing
  if (!featuredResource) {
    return null;
  }

  return (
    <div className="mb-12">
   <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">
            <span className="group inline-block cursor-pointer">
              <span className="relative text-blue-500">Feature
                <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
              </span>
              {" "}
              <span className="relative inline-block"> Resources
                <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </span>
          </h1>
        </div>      {isStale && ( // Check if featuredResource exists before showing stale warning
        <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-yellow-800 dark:text-yellow-200">
            <span>⚠️</span><span>Featured Resources content may be outdated.</span>
          </div>
        </div>
      )}
      {/* Since the query fetches a single item, render it directly */}
      <HorizentalFeaturePost key={featuredResource._id} resource={featuredResource} />
    </div>
  );
};

export default ReusableCachedFeaturedFreeResources;