// components/TrendingPage.jsx (or whatever your TrendingPage component file is named)

"use client";
import React, { useEffect } from "react";
import { Grid } from "@mui/material";
import { urlForImage } from "@/sanity/lib/image";
import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard";
import MedSkeleton from "@/components/Blog/Skeleton/HomeMedCard";
import MediumCard from "@/components/Blog/HomeMediumCard";
import BigCard from "@/components/Blog/HomeBigCard";
import { useCachedSanityData } from "@/components/Blog/useSanityCache";
import { CACHE_KEYS } from '@/components/Blog/cacheKeys'; // <-- IMPORT CACHE_KEYS

const TrendingPage = () => {
  const queries = {
    trendBig: `*[_type in ["makemoney", "freeairesources", "news", "coding", "aitool", "seo"] && displaySettings.isHomePageTrendBig == true] {
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
    trendRelated: `*[_type in ["makemoney", "freeairesources", "news", "coding", "aitool", "seo"] && displaySettings.isHomePageTrendRelated == true] {
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

  const {
    data: trendBigData,
    isLoading: isBigLoading,
    refresh: refreshBig
  } = useCachedSanityData(CACHE_KEYS.TRENDING_BIG, queries.trendBig); // <-- Use CACHE_KEYS

  const {
    data: trendRelatedData,
    isLoading: isRelatedLoading,
    refresh: refreshRelated
  } = useCachedSanityData(CACHE_KEYS.TRENDING_RELATED, queries.trendRelated); // <-- Use CACHE_KEYS

  const isLoading = isBigLoading || isRelatedLoading;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.globalRefreshFunctions = window.globalRefreshFunctions || [];
      const existingEntry = window.globalRefreshFunctions.find(item => item.name === 'trending');
      if (!existingEntry) { // Prevent duplicate registrations on re-renders
        window.globalRefreshFunctions.push({
          name: 'trending',
          refresh: () => Promise.all([refreshBig(), refreshRelated()])
        });
      }
    }
    return () => { // Cleanup on component unmount
      if (typeof window !== 'undefined' && window.globalRefreshFunctions) {
        window.globalRefreshFunctions = window.globalRefreshFunctions.filter(
          item => item.name !== 'trending'
        );
      }
    };
  }, [refreshBig, refreshRelated]);

  const schemaSlugMap = {
    makemoney: "ai-learn-earn",
    aitool: "ai-tools",
    coding: "ai-code",
    seo: "ai-seo",
    news: "ai-news", // Added 'news' if it's a possible type
    freeairesources: "free-ai-resources", // Added 'freeairesources'
  };

  return (
    <section className="pb-[20px] pt-[20px]">
      <div className="container ">
        <h1 className="mb-8 text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">
          <span className="group inline-block cursor-pointer">
            <span className="relative text-blue-500">
              Trending
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
        <Grid container spacing={2}>
          {/* Main Trending Post (Big Card) */}
          <Grid item xs={12} lg={6}>
            {isLoading ? (
              <BigSkeleton />
            ) : (
              trendBigData?.slice(0, 1).map((post) => (
                <BigCard
                  key={post._id} // Use post._id for key
                  title={post.title}
                  overview={post.overview}
                  mainImage={urlForImage(post.mainImage).url()}
                  slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
                  publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  ReadTime={post.readTime?.minutes}
                  tags={post.tags}
                />
              ))
            )}
          </Grid>

          {/* Related Trending Posts (Two Medium Cards - Left Side) */}
          <Grid item xs={12} sm={12} lg={3} xl={3}>
            <Grid container spacing={2}> {/* This inner Grid is for the two medium cards */}
              {isLoading ? (
                <>
                 
                </>
              ) : (
                trendRelatedData?.slice(0, 2).map((post) => (
                  <Grid key={post._id} item xs={12}> {/* Use post._id for key */}
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

          {/* Related Trending Posts (Two Medium Cards - Right Side) */}
          <Grid item xs={12} sm={12} lg={3} xl={3}>
            <Grid container spacing={2}> {/* This inner Grid is for the two medium cards */}
              {isLoading ? (
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
                  <Grid key={post._id} item xs={12}> {/* Use post._id for key */}
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
      </div>
    </section>
  );
};

export default TrendingPage;