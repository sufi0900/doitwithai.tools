/*eslint-disable react/no-unescaped-entities*/
"use client";

import React, { useMemo, useCallback } from "react"; // Added useMemo, useCallback
import Grid from "@mui/material/Grid";
import { urlForImage } from "@/sanity/lib/image";
import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard"
import MedSkeleton from "@/components/Blog/Skeleton/HomeMedCard"
import SmallCard from "@/components/Blog/HomeSmallCard"
import BigCard from "@/components/Blog/HomeBigCard"
import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
import { cacheSystem } from '@/React_Query_Caching/cacheSystem'; // Needed for refreshGroup

const FeaturePost = () => {
  // Memoize queries for stability
  const queries = useMemo(() => ({
    featureBig: `*[_type in ["makemoney","freeairesources","news","coding","aitool","seo"]&&displaySettings.isHomePageFeatureBig==true]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
    featureRelated: `*[_type in ["makemoney","freeairesources","news","coding","aitool","seo"]&&displaySettings.isHomePageFeatureRelated==true]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
  }), []); // Empty dependency array as these queries are static

  // Memoize options for useSanityCache calls
  const bigFeatureOptions = useMemo(() => ({
    componentName: 'FeatureBig',
    staleTime: 3 * 60 * 1000, // 3 minutes, consistent with HOMEPAGE config
    maxAge: 15 * 60 * 1000,   // 15 minutes, consistent with HOMEPAGE config
    enableOffline: true,
    group: 'homepage-feature', // Assign to a group for homepage feature content
  }), []);

  const relatedFeatureOptions = useMemo(() => ({
    componentName: 'FeatureRelated',
    staleTime: 3 * 60 * 1000, // 3 minutes, consistent with HOMEPAGE config
    maxAge: 15 * 60 * 1000,   // 15 minutes, consistent with HOMEPAGE config
    enableOffline: true,
    group: 'homepage-feature', // Same group
  }), []);

  // Use the new caching system for featureBig
  const {
    data: featurePostBigData,
    isLoading: isBigLoading,
    error: bigError,
    isStale: isBigStale,
    refresh: refreshBig,
  } = useSanityCache(
    CACHE_KEYS.HOMEPAGE.FEATURE_BIG, // Use specific cache key
    queries.featureBig,
    {}, // No params
    bigFeatureOptions
  );

  // Use the new caching system for featureRelated
  const {
    data: featureRelatedPostsData,
    isLoading: isRelatedLoading,
    error: relatedError,
    isStale: isRelatedStale,
    refresh: refreshRelated,
  } = useSanityCache(
    CACHE_KEYS.HOMEPAGE.FEATURE_RELATED, // Use specific cache key
    queries.featureRelated,
    {}, // No params
    relatedFeatureOptions
  );

  // NEW: Register cache keys and their refresh functions with the PageCacheProvider
  usePageCache(CACHE_KEYS.HOMEPAGE.FEATURE_BIG, refreshBig, queries.featureBig, 'FeatureBigPost');
  usePageCache(CACHE_KEYS.HOMEPAGE.FEATURE_RELATED, refreshRelated, queries.featureRelated, 'FeatureRelatedPosts');

  const isLoading = isBigLoading || isRelatedLoading;
  const hasError = bigError || relatedError; // Combine errors
  const isStale = isBigStale || isRelatedStale; // Combined stale state

  // Memoize the combined refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      if (typeof cacheSystem !== 'undefined' && cacheSystem.refreshGroup) {
        console.log("Manually refreshing homepage-feature group.");
        await cacheSystem.refreshGroup('homepage-feature');
      } else {
        console.warn("cacheSystem.refreshGroup is not available. Performing individual refreshes.");
        await refreshBig(true);
        await refreshRelated(true);
      }
    } catch (error) {
      console.error('FeaturePost refresh failed:', error);
    }
  }, [refreshBig, refreshRelated]);

  const schemaSlugMap = useMemo(() => ({
    makemoney: "ai-learn-earn",
    aitool: "ai-tools",
    coding: "ai-code",
    seo: "ai-seo",
    news: "ai-news", // Added 'news' if it's a possible type
    freeairesources: "free-ai-resources", // Added 'freeairesources'
  }), []); // Stable map

  const featureBigPost = featurePostBigData?.slice(0, 1)[0];
  const featureRelatedPosts = featureRelatedPostsData || [];

  return (
    <section id="blog" className="bg-gray-light py-16 dark:bg-bg-color-dark md:py-4 lg:py-4">
      <div className="container">
        <h1 className="mb-8 text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">
          <span className="group inline-block cursor-pointer">
            <span className="relative text-blue-500">Feature
              <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
            </span>
            {" "}
            <span className="relative inline-block">Posts
              <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </span>
          </span>
        </h1>

        {/* Stale Data Warning */}
        {isStale && (featureBigPost || featureRelatedPosts.length > 0) && (
          <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-yellow-800 dark:text-yellow-200">
              <span>⚠️</span><span>Featured content may be outdated.</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {hasError && (!featureBigPost && featureRelatedPosts.length === 0) && (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Failed to load feature posts.</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} lg={5}>
            {isLoading && featureRelatedPosts.length === 0 ? ( // Show skeletons if loading AND no data
              <>
                <Grid container spacing={2} marginTop={"0px"} className="mb-2" sx={{ marginRight: { lg: "20px" }, display: 'inline-block', justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                  <Grid item xs={12} sx={{ display: 'inline-block', justifyContent: "center", alignItems: "center", textAlign: "center" }}><MedSkeleton /></Grid>
                  <Grid item xs={12} sx={{ display: 'inline-block' }}><MedSkeleton /></Grid>
                </Grid>
              </>
            ) : featureRelatedPosts.length > 0 ? ( // Show content if data exists
              featureRelatedPosts.slice(0, 4).map((post) => (
                <Grid key={post._id} item xs={12} sm={12} md={12} marginBottom={2}>
                  <SmallCard
                    key={post._id}
                    title={post.title}
                    overview={post.overview}
                    mainImage={urlForImage(post.mainImage).url()}
                    slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
                    publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    ReadTime={post.readTime?.minutes}
                    tags={post.tags}
                  />
                </Grid>
              ))
            ) : null /* Or "No related feature posts" message */
            }
          </Grid>
          <Grid item xs={12} lg={7}>
            {isLoading && !featureBigPost ? ( // Show skeleton if loading AND no data
              <Grid item xs={12}><BigSkeleton /></Grid>
            ) : featureBigPost ? ( // Show content if data exists
              <BigCard
                key={featureBigPost._id}
                title={featureBigPost.title}
                overview={featureBigPost.overview}
                mainImage={urlForImage(featureBigPost.mainImage).url()}
                slug={`/${schemaSlugMap[featureBigPost._type]}/${featureBigPost.slug.current}`}
                publishedAt={new Date(featureBigPost.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                ReadTime={featureBigPost.readTime?.minutes}
                tags={featureBigPost.tags}
              />
            ) : null /* Or "No big feature post" message */
            }
          </Grid>
        </Grid>
        {/* No posts found message, only if not loading, no error, and no data at all */}
        {!isLoading && !hasError && !featureBigPost && featureRelatedPosts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No feature posts found at this time.</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-4"
            >
              Refresh Featured Content
            </button>
          </div>
        )}
      </div>
      <br /><br />
    </section>
  );
};

export default FeaturePost;
