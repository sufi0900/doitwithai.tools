import React, { useMemo, useCallback } from 'react'; // Added useMemo, useCallback
import dynamic from 'next/dynamic';
// import UnifiedResourceCard from '@/app/free-ai-resources/UnifiedResourceCard';
import ResourceCard from '@/app/free-ai-resources/UnifiedResourceCard';
// import Link from 'next/link';
import ResourceSkeleton from '@/app/free-ai-resources/ResourceSkeleton';
import ResourceModalsProvider from '@/app/free-ai-resources/ResourceModalsProvider';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
import { cacheSystem } from '@/React_Query_Caching/cacheSystem'; // Needed for refreshGroup
import { useUnifiedCache } from '@/React_Query_Caching/useUnifiedCache';
import Breadcrumb from '../Common/Breadcrumb';

const DynamicResourceCarousel = dynamic(() => import('@/app/free-ai-resources/ResourceCarousel'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-wrap -mx-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="w-full sm:w-1/2 lg:w-1/3 px-3 mb-6"><ResourceSkeleton /></div>
      ))}
    </div>
  ),
});

const HomeFeaturedResourceComponent  = ({ initialData = {} }) => { // Accept initialData prop

const query = useMemo(() => `*[_type=="freeResources"&&isHomePageFeature==true]|order(publishedAt desc)[0...30]{
    _id,
    title,
    slug,
    tags,
    mainImage,
    overview,
    resourceType,
    resourceFormat,
    resourceLink,
    "relatedArticle": relatedArticle-> {
      title,
      slug,
      _type,
      tags,
      aiToolDetails,
      excerpt
    },
    resourceLinkType,
    content,
    publishedAt,
    "resourceFile":resourceFile.asset->,
    promptContent,
    previewSettings {
      useCustomPreview,
      previewImage {
        asset->{
          url,
          metadata
        },
        alt
      }
    },
    aiToolDetails, 
    _updatedAt
  }`, []);

  const memoizedParams = useMemo(() => ({}), []);

  const stableOptions = useMemo(() => ({
    componentName: 'FeaturedResourcesHorizontal',

    enableOffline: true,
    group: 'homepage-featured-resources',
    // --- NEW: Pass initialData ---
    initialData: initialData,
    // --- NEW: Specify schemaType ---
    schemaType: "freeResources",
  }), [initialData]); // Add initialData to dependency array

  const { data: featuredResources, isLoading, error, isStale, refresh } = useUnifiedCache( // --- CHANGED: useUnifiedCache ---
    CACHE_KEYS.HOMEPAGE.FEATURED_RESOURCES_HORIZONTAL,
    query,
    memoizedParams,
    stableOptions
  );

  // NEW: Register this query's key and refresh function with the PageCacheProvider
  usePageCache(
    CACHE_KEYS.HOMEPAGE.FEATURED_RESOURCES_HORIZONTAL,
    refresh, // Pass the refresh function from useSanityCache
    query,   // Pass the original query string
    'FeaturedResourcesHorizontal' // Label for the cache status button
  );

  const hasError = !!error; // Convert error object to boolean

  // Memoize the refresh handler for the Retry button
  const handleRefresh = useCallback(async () => {
    try {
      if (typeof cacheSystem !== 'undefined' && cacheSystem.refreshGroup) {
        console.log("Manually refreshing homepage-featured-resources group.");
        await cacheSystem.refreshGroup('homepage-featured-resources');
      } else {
        console.warn("cacheSystem.refreshGroup is not available. Performing individual refresh.");
        await refresh(true); // Force refresh
      }
    } catch (error) {
      console.error('FeaturedResourcesHorizontal refresh failed:', error);
    }
  }, [refresh]);


  if (isLoading && !featuredResources) { // Show skeleton if loading AND no data
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Featured Resources</h2>
          <div className="w-16 h-1 bg-primary rounded mb-4"></div>
        </div>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Handle case where no resources are returned but no loading/error
  if (!featuredResources || featuredResources.length === 0) {
    if (!isLoading && !hasError) { // Only show "no resources" if not loading and no error
      return (
        <section className="py-16 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 text-center">
            <div className="flex flex-col items-center mb-10 text-center">
              <h2 className="text-3xl font-bold mb-2">Featured Resources</h2>
              <div className="w-20 h-1 bg-primary rounded mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                Discover our curated collection of premium AI resources, templates, and tools
              </p>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">No featured resources available at this time.</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-4"
            >
              Refresh Content
            </button>
          </div>
        </section>
      );
    }
    return null; // Don't render anything else if no data and either loading or error
  }

  return (
    <section className="py-2">
      <div className="container mx-auto px-4">
         <Breadcrumb
          pageName="Free AI Resources"
          pageName2="for You"
          description="Discover free downloadable resources—ChatGPT prompts, AI templates, tools, and visuals—designed to boost your SEO and everyday productivity."
          firstlinktext="Home"
          firstlink="/"
          link="/free-ai-resources"
          linktext="Free Resources"
        />
        {/* NEW: Stale Data Warning */}
        {isStale && featuredResources.length > 0 && (
          <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-yellow-800 dark:text-yellow-200">
              <span>⚠️</span><span>Featured Resources content may be outdated.</span>
            </div>
          </div>
        )}
        {/* NEW: Error Display (only if no data but there was an error) */}
        {hasError && !featuredResources.length && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-red-800 dark:text-red-200">
              <h3 className="font-semibold mb-2">Failed to load featured resources</h3>
              <p className="text-sm mb-3">{error?.message || 'Unable to fetch data'}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
            >
              Retry
            </button>
          </div>
        )}
      <DynamicResourceCarousel maxDots={5}>
  {featuredResources.map((resource) => (
    <ResourceCard
      key={resource._id}
      resource={resource}
      variant="carousel"
      wrapperClassName="h-[120px] mb-4"
    />
  ))}
</DynamicResourceCarousel>
      </div>
      <ResourceModalsProvider resources={featuredResources} />
    </section>
  );
};

export default HomeFeaturedResourceComponent;
