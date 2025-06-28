// components/TrendingPage.jsx
"use client";
import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import { urlForImage } from "@/sanity/lib/image";
import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard";
import MedSkeleton from "@/components/Blog/Skeleton/HomeMedCard";
import MediumCard from "@/components/Blog/HomeMediumCard";
import BigCard from "@/components/Blog/HomeBigCard";
import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';

const TrendingPage = () => {
const queries = {
    trendBig: `*[_type in ["makemoney", "freeairesources", "news", "coding", "aitool", "seo"] && displaySettings.isHomePageTrendBig == true]{
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
    trendRelated: `*[_type in ["makemoney", "freeairesources", "news", "coding", "aitool", "seo"] && displaySettings.isHomePageTrendRelated == true]{
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

  // Use the new caching system
  const {
    data: trendBigData,
    isLoading: isBigLoading,
    error: bigError,
    isStale: isBigStale,
    refresh: refreshBig,
    cacheSource: bigCacheSource,
    lastUpdated: bigLastUpdated
  } = useSanityCache(
    CACHE_KEYS.HOMEPAGE.TRENDING_BIG,
    queries.trendBig,
    {
      componentName: 'TrendingBig',
      staleTime: 3 * 60 * 1000, // 3 minutes
      maxAge: 15 * 60 * 1000,   // 15 minutes
      enableOffline: true
    }
  );

  const {
    data: trendRelatedData,
    isLoading: isRelatedLoading,
    error: relatedError,
    isStale: isRelatedStale,
    refresh: refreshRelated,
    cacheSource: relatedCacheSource,
    lastUpdated: relatedLastUpdated
  } = useSanityCache(
    CACHE_KEYS.HOMEPAGE.TRENDING_RELATED,
    queries.trendRelated,
    {
      componentName: 'TrendingRelated',
      staleTime: 3 * 60 * 1000, // 3 minutes
      maxAge: 15 * 60 * 1000,   // 15 minutes
      enableOffline: true
    }
  );
  
 usePageCache(
    CACHE_KEYS.HOMEPAGE.TRENDING_BIG, 
    refreshBig, 
    queries.trendBig, 
    'Trending Big'
  );
  
  usePageCache(
    CACHE_KEYS.HOMEPAGE.TRENDING_RELATED, 
    refreshRelated, 
    queries.trendRelated, 
    'Trending Related'
  );

  const schemaSlugMap = {
    makemoney: "ai-learn-earn",
    aitool: "ai-tools",
    coding: "ai-code",
    seo: "ai-seo",
  };

 

  return (
    <section className="pb-[20px] pt-[20px]">
      <div className="container">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">
            <span className="group inline-block cursor-pointer">
              <span className="relative text-blue-500">
                Trending
                <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
              </span>
              {" "}
              <span className="relative inline-block">
                Posts
                <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </span>
          </h1>
          
        
   
</div>
        <Grid container spacing={2}>
          {/* Main Trending Post (Big Card) */}
          <Grid item xs={12} lg={6}>
            {isBigLoading ? (
              <BigSkeleton />
            ) : (
              trendBigData?.slice(0, 1).map((post) => (
                <BigCard
                  key={post._id}
                  title={post.title}
                  overview={post.overview}
                  mainImage={urlForImage(post.mainImage).url()}
                  slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
                  publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                  ReadTime={post.readTime?.minutes}
                  tags={post.tags}
                />
              ))
            )}
          </Grid>

          {/* Related Trending Posts */}
          <Grid item xs={12} sm={12} lg={3} xl={3}>
            <Grid container spacing={2}>
              {isRelatedLoading ? (
                <>
                  <Grid item xs={12}>
                    <MedSkeleton />
                  </Grid>
                  <Grid item xs={12}>
                    <MedSkeleton />
                  </Grid>
                </>
              ) : (
                trendRelatedData?.slice(0, 2).map((post) => (
                  <Grid key={post._id} item xs={12}>
                    <MediumCard
                      title={post.title}
                      overview={post.overview}
                      mainImage={urlForImage(post.mainImage).url()}
                      slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
                      publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                      ReadTime={post.readTime?.minutes}
                      tags={post.tags}
                    />
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>

          <Grid item xs={12} sm={12} lg={3} xl={3}>
            <Grid container spacing={2}>
              {isRelatedLoading ? (
                <>
                  <Grid item xs={12}>
                    <MedSkeleton />
                  </Grid>
                  <Grid item xs={12}>
                    <MedSkeleton />
                  </Grid>
                </>
              ) : (
                trendRelatedData?.slice(2, 4).map((post) => (
                  <Grid key={post._id} item xs={12}>
                    <MediumCard
                      title={post.title}
                      overview={post.overview}
                      mainImage={urlForImage(post.mainImage).url()}
                      slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
                      publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                      ReadTime={post.readTime?.minutes}
                      tags={post.tags}
                    />
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>
        </Grid>
      </div>
    </section>
  );
};

export default TrendingPage;