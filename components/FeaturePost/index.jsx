/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { urlForImage } from "@/sanity/lib/image"; // Update path if needed
import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard"
import MedSkeleton from "@/components/Blog/Skeleton/HomeMedCard"
import SmallCard from "@/components/Blog/HomeSmallCard"
import BigCard from "@/components/Blog/HomeBigCard"
import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';

const FeaturePost = () => {
  const queries = {
    featureBig: `*[_type in ["makemoney", "freeairesources", "news", "coding", "aitool", "seo"] && displaySettings.isHomePageFeatureBig == true] {
      _id,
      _type,
      title,
      overview,
      mainImage,
      slug,
      publishedAt,
      readTime,
      tags,
      _updatedAt,
      "displaySettings": displaySettings
    }`,
    featureRelated: `*[_type in ["makemoney", "freeairesources", "news", "coding", "aitool", "seo"] && displaySettings.isHomePageFeatureRelated == true] {
      _id,
      _type,
      title,
      overview,
      mainImage,
      slug,
      publishedAt,
      readTime,
      tags,
      _updatedAt,
      "displaySettings": displaySettings
    }`
  };

  // Use the new caching system for featureBig
  const {
    data: featurePostBigData,
    isLoading: isBigLoading,
    error: bigError,     // Destructure error
    isStale: isBigStale, // Destructure isStale
    refresh: refreshBig,
  } = useSanityCache(
    CACHE_KEYS.HOMEPAGE.FEATURE_BIG, // Use specific cache key
    queries.featureBig,
    {
      componentName: 'FeatureBig', // Descriptive name for debugging
      staleTime: 3 * 60 * 1000, // 3 minutes, consistent with HOMEPAGE config
      maxAge: 15 * 60 * 1000, // 15 minutes, consistent with HOMEPAGE config
      enableOffline: true,
    }
  );

  // Use the new caching system for featureRelated
  const {
    data: featureRelatedPostsData,
    isLoading: isRelatedLoading,
    error: relatedError,     // Destructure error
    isStale: isRelatedStale, // Destructure isStale
    refresh: refreshRelated,
  } = useSanityCache(
    CACHE_KEYS.HOMEPAGE.FEATURE_RELATED, // Use specific cache key
    queries.featureRelated,
    {
      componentName: 'FeatureRelated', // Descriptive name for debugging
      staleTime: 3 * 60 * 1000, // 3 minutes, consistent with HOMEPAGE config
      maxAge: 15 * 60 * 1000, // 15 minutes, consistent with HOMEPAGE config
      enableOffline: true,
    }
  );

  // NEW: Register cache keys and their refresh functions with the PageCacheProvider
  usePageCache(CACHE_KEYS.HOMEPAGE.FEATURE_BIG, refreshBig, queries.featureBig, 'Feature Big Post');
  usePageCache(CACHE_KEYS.HOMEPAGE.FEATURE_RELATED, refreshRelated, queries.featureRelated, 'Feature Related Posts');

  const isLoading = isBigLoading || isRelatedLoading;
  const hasError = bigError || relatedError; // Combine errors

  // Removed the old useEffect for window.globalRefreshFunctions

  const schemaSlugMap = {
    makemoney: "ai-learn-earn",
    aitool: "ai-tools",
    coding: "ai-code",
    seo: "ai-seo",
    news: "ai-news", // Added 'news' if it's a possible type
    freeairesources: "free-ai-resources", // Added 'freeairesources'
  };

  return (
    <section id="blog" className="bg-gray-light py-16 dark:bg-bg-color-dark md:py-4 lg:py-4">
      <div className="container">
        <h1 className="mb-8 text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">
          <span className="group inline-block cursor-pointer">
            <span className="relative text-blue-500">
              Feature
              <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
            </span>
            {" "}
            <span className="relative inline-block ">
              {" "}
              Posts
              <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </span>
          </span>
        </h1>

      
        <Grid container spacing={2} >
          <Grid item xs={12} lg={5} >
            {isLoading ? (
              <>
                <Grid container spacing={2} marginTop={"0px"} className="mb-2" sx={{ marginRight: { lg: "20px" }, display: 'inline-block', justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                  <Grid item xs={12} sx={{ display: 'inline-block', justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                    <MedSkeleton />
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'inline-block' }}>
                    <MedSkeleton />
                  </Grid>
                </Grid>
              </>
            ) : (
              featureRelatedPostsData?.slice(0, 4).map((post) => ( // Use optional chaining for data
                <Grid item key={post._id} xs={12} sm={12} md={12} marginBottom={2}>
                  <SmallCard
                    key={post._id} // Use _id for key
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
          <Grid item xs={12} lg={7}>
            {isLoading ? (
              <Grid item xs={12} >
                <BigSkeleton />
              </Grid>
            ) : (
              featurePostBigData?.slice(0, 1).map((post) => ( // Use optional chaining for data
                <BigCard
                  key={post._id} // Use _id for key
                  title={post.title}
                  overview={post.overview}
                  mainImage={urlForImage(post.mainImage).url()}
                  slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
                  publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  ReadTime={post.readTime?.minutes}
                  tags={post.tags}
                />
              )))}
          </Grid>
        </Grid>
      </div>
      <br />
      <br />
    </section>
  );
};

export default FeaturePost;

