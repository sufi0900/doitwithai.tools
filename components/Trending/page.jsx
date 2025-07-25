// components/Trending/page.jsx
"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Grid } from "@mui/material";
import { urlForImage } from "@/sanity/lib/image";
import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard";
import MedSkeleton from "@/components/Blog/Skeleton/HomeMedCard";
import MediumCard from "@/components/Blog/HomeMediumCard";
import BigCard from "@/components/Blog/HomeBigCard";
import { useUnifiedCache } from '@/React_Query_Caching/useUnifiedCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
import { cacheSystem } from '@/React_Query_Caching/cacheSystem';

const TrendingPage = ({ initialData = {} }) => {
  const queries = useMemo(() => ({
    trendBig: `*[_type in ["makemoney","freeairesources","news","coding","aitool","seo"]&&displaySettings.isHomePageTrendBig==true][0...1]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
    trendRelated: `*[_type in ["makemoney","freeairesources","news","coding","aitool","seo"]&&displaySettings.isHomePageTrendRelated==true][0...3]{_id,_type,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
  }), []);

  const commonSchemaTypes = useMemo(() => ["makemoney", "freeairesources", "news", "coding", "aitool", "seo"], []);

  const bigCardOptions = useMemo(() => ({
    componentName: 'TrendingBig',
 
    enableOffline: true,
    group: 'homepage-trending',
    initialData: initialData.trending?.trendBigData, // Access from initialData.trending
    schemaType: commonSchemaTypes,
  }), [initialData.trending?.trendBigData, commonSchemaTypes]);

  const relatedCardOptions = useMemo(() => ({
    componentName: 'TrendingRelated',

    enableOffline: true,
    group: 'homepage-trending',
    initialData: initialData.trending?.trendRelatedData, // Access from initialData.trending
    schemaType: commonSchemaTypes,
  }), [initialData.trending?.trendRelatedData, commonSchemaTypes]);

  const { data: trendBigData, isLoading: isBigLoading, error: bigError, isStale: isBigStale, refresh: refreshBig } = useUnifiedCache(
    CACHE_KEYS.HOMEPAGE.TRENDING_BIG,
    queries.trendBig,
    {},
    bigCardOptions
  );

  const { data: trendRelatedData, isLoading: isRelatedLoading, error: relatedError, isStale: isRelatedStale, refresh: refreshRelated } = useUnifiedCache(
    CACHE_KEYS.HOMEPAGE.TRENDING_RELATED,
    queries.trendRelated,
    {},
    relatedCardOptions
  );

  usePageCache(CACHE_KEYS.HOMEPAGE.TRENDING_BIG, refreshBig, queries.trendBig, 'TrendingBig');
  usePageCache(CACHE_KEYS.HOMEPAGE.TRENDING_RELATED, refreshRelated, queries.trendRelated, 'TrendingRelated');

  const schemaSlugMap = useMemo(() => ({
    makemoney: "ai-learn-earn",
    aitool: "ai-tools",
    coding: "ai-code",
    seo: "ai-seo",
    news: "ai-news",
    freeairesources: "free-ai-resources",
  }), []);

  const isLoading = isBigLoading || isRelatedLoading;
  const hasError = bigError || relatedError;
  const isStale = isBigStale || isRelatedStale;

  const handleRefresh = useCallback(async () => {
    try {
      if (typeof cacheSystem !== 'undefined' && cacheSystem.refreshGroup) {
        console.log("Manually refreshing homepage-trending group.");
        await cacheSystem.refreshGroup('homepage-trending');
      } else {
        console.warn("cacheSystem.refreshGroup is not available. Performing individual refreshes.");
        await refreshBig(true);
        await refreshRelated(true);
      }
    } catch (error) {
      console.error('TrendingPage refresh failed:', error);
    }
  }, [refreshBig, refreshRelated]);

  // Now trendBigData is always an array (or undefined before initial load from useUnifiedCache).
  // So you can directly access the first element or use slice.
  const bigPost = trendBigData && trendBigData.length > 0 ? trendBigData[0] : null;
  const relatedPosts = trendRelatedData || [];

  return (
    <section className="pb-[30px] ">
      <div className="container">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">
            <span className="group inline-block cursor-pointer">
              <span className="relative text-blue-500">Trending
                <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
              </span>
              {" "}
              <span className="relative inline-block">Posts
                <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </span>
          </h1>
        </div>

        {/* Stale Data Warning */}
        {isStale && (trendBigData?.length > 0 || trendRelatedData?.length > 0) && (
          <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-yellow-800 dark:text-yellow-200">
              <span>⚠️</span><span>Trending content may be outdated.</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {hasError && (!bigPost && relatedPosts.length === 0) && (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Failed to load trending posts.</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        )}

        <Grid container spacing={2}>
          {/* Main Trending Post (BigCard) */}
          <Grid item xs={12} lg={6}>
            {isLoading && !bigPost ? (
              <BigSkeleton />
            ) : bigPost ? (
              <BigCard
                key={bigPost._id}
                title={bigPost.title}
                overview={bigPost.overview}
                mainImage={urlForImage(bigPost.mainImage).url()}
                slug={`/${schemaSlugMap[bigPost._type]}/${bigPost.slug.current}`}
                publishedAt={new Date(bigPost.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                ReadTime={bigPost.readTime?.minutes}
                tags={bigPost.tags}
              />
            ) : null /* Or a "No big post found" message if desired */
            }
          </Grid>

          {/* Related Trending Posts - First two */}
          <Grid item xs={12} sm={12} lg={3} xl={3}>
            <Grid container spacing={2}>
              {isLoading && relatedPosts.length === 0 ? (
                <>
                  <Grid item xs={12}><MedSkeleton /></Grid>
                  <Grid item xs={12}><MedSkeleton /></Grid>
                </>
              ) : (
                relatedPosts.slice(0, 2).map((post) => (
                  <Grid key={post._id} item xs={12}>
                    <MediumCard
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
              )}
            </Grid>
          </Grid>

          {/* Related Trending Posts - Next two */}
          <Grid item xs={12} sm={12} lg={3} xl={3}>
            <Grid container spacing={2}>
              {isLoading && relatedPosts.length === 0 ? (
                <>
                  <Grid item xs={12}><MedSkeleton /></Grid>
                  <Grid item xs={12}><MedSkeleton /></Grid>
                </>
              ) : (
                relatedPosts.slice(2, 4).map((post) => (
                  <Grid key={post._id} item xs={12}>
                    <MediumCard
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
              )}
            </Grid>
          </Grid>
        </Grid>
        {/* No posts found message, only if not loading, no error, and no data at all */}
        {!isLoading && !hasError && !bigPost && relatedPosts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No trending posts found at this time.</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-4"
            >
              Refresh Trending Content
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingPage;