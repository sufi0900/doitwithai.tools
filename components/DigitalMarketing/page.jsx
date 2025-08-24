// components/DigitalMarketing/index.jsx
"use client";
import React, { useMemo, useState } from "react"; // Removed useEffect as it's not used directly here
import { urlForImage } from "@/sanity/lib/image";
import { Grid } from "@mui/material";
import HomeMediumCard from "@/components/Blog/HomeMediumCard";
import Breadcrumb from "../Common/Breadcrumb";
import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard";
import BigCard from "@/components/Blog/HomeBigCard";
// import Link from "next/link";
import { useUnifiedCache } from '@/React_Query_Caching/useUnifiedCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
// If you have cacheSystem for refreshGroup in AiSeo, include it
// import { cacheSystem } from '@/React_Query_Caching/cacheSystem';

const DigitalMarketing = ({ initialData = {} }) => {
  const queries = useMemo(() => ({
    seoTrendBig: `*[_type=="seo"&&displaySettings.isHomePageSeoTrendBig==true][0...1]{_id,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
    seoTrendRelated: `*[_type=="seo"&&displaySettings.isHomePageSeoTrendRelated==true][0...3]{_id,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
  }), []);

  const commonOptions = useMemo(() => ({

    enableOffline: true,
    group: 'homepage-seo',
    schemaType: "seo",
  }), []);

  const bigSEOOptions = useMemo(() => ({
    ...commonOptions,
    initialData: initialData.aiSeo?.seoTrendBigData, // Correct path: initialData.aiSeo
  }), [commonOptions, initialData.aiSeo?.seoTrendBigData]);

  const relatedSEOOptions = useMemo(() => ({
    ...commonOptions,
    initialData: initialData.aiSeo?.seoTrendRelatedData, // Correct path: initialData.aiSeo
  }), [commonOptions, initialData.aiSeo?.seoTrendRelatedData]);

  const { data: seoTrendBigData, isLoading: isBigLoading, error: bigError, isStale: isBigStale, refresh: refreshBigData } = useUnifiedCache(
    CACHE_KEYS.HOMEPAGE.SEO_TREND_BIG,
    queries.seoTrendBig,
    {},
    bigSEOOptions
  );

  const { data: seoTrendRelatedData, isLoading: isRelatedLoading, error: relatedError, isStale: isRelatedStale, refresh: refreshRelatedData } = useUnifiedCache(
    CACHE_KEYS.HOMEPAGE.SEO_TREND_RELATED,
    queries.seoTrendRelated,
    {},
    relatedSEOOptions
  );

  usePageCache(CACHE_KEYS.HOMEPAGE.SEO_TREND_BIG, refreshBigData, queries.seoTrendBig, 'SEOBig');
  usePageCache(CACHE_KEYS.HOMEPAGE.SEO_TREND_RELATED, refreshRelatedData, queries.seoTrendRelated, 'SEORelated');

  const isLoading = isBigLoading || isRelatedLoading;
  const hasError = bigError || relatedError;
  const isStale = isBigStale || isRelatedStale;

  // Memoize the combined refresh handler (if you implement a refreshGroup for SEO)
  // const handleRefresh = useCallback(async () => {
  //   try {
  //     if (typeof cacheSystem !== 'undefined' && cacheSystem.refreshGroup) {
  //       console.log("Manually refreshing homepage-seo group.");
  //       await cacheSystem.refreshGroup('homepage-seo');
  //     } else {
  //       console.warn("cacheSystem.refreshGroup is not available. Performing individual refreshes.");
  //       await refreshBigData(true);
  //       await refreshRelatedData(true);
  //     }
  //   } catch (error) {
  //     console.error('DigitalMarketing refresh failed:', error);
  //   }
  // }, [refreshBigData, refreshRelatedData]);

  // --- Crucial change here: Accessing the single post from seoTrendBigData ---
  const seoBigPost = seoTrendBigData && seoTrendBigData.length > 0 ? seoTrendBigData[0] : null;
  const seoRelatedPosts = seoTrendRelatedData || []; // This already correctly handles arrays

  return (
    <section className="py-4 lg:py-6">
      <div className="container px-4">
        <Breadcrumb
          pageName="Boost SEO"
          pageName2="with AI"
          description="Discover how AI is reshaping SEO. Our latest blogs break it down in simple, actionable ways—start exploring now!"
          firstlinktext="Home"
          firstlink="/"
          link="/ai-seo"
          linktext="SEO with AI"
        />
        
        {/* IMPROVED RESPONSIVE LAYOUT */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} alignItems="stretch">
          {/* Side cards - Stack on mobile, show on sides for desktop */}
          <Grid item xs={12} md={3} className="order-2 md:order-1">
            <div className="space-y-3 lg:space-y-4">
              {seoRelatedPosts.slice(0, 2).map((post) => (
                <div key={post._id}>
                  <HomeMediumCard
                    key={post._id}
                    title={post.title}
                    overview={post.overview}
                    mainImage={urlForImage(post.mainImage).url()}
                    slug={`/ai-seo/${post.slug.current}`}
                    publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                    ReadTime={post.readTime?.minutes}
                    tags={post.tags}
                  />
                </div>
              ))}
            </div>
          </Grid>

          {/* Main card - Show first on mobile */}
          <Grid item xs={12} md={6} className="order-1 md:order-2">
            {isLoading && !seoBigPost ? (
              <BigSkeleton />
            ) : seoBigPost ? (
              <BigCard
                key={seoBigPost._id}
                title={seoBigPost.title}
                overview={seoBigPost.overview}
                mainImage={urlForImage(seoBigPost.mainImage).url()}
                slug={`/ai-seo/${seoBigPost.slug.current}`}
                publishedAt={new Date(seoBigPost.publishedAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
                ReadTime={seoBigPost.readTime?.minutes}
                tags={seoBigPost.tags}
              />
            ) : null}
          </Grid>

          {/* Right side cards */}
          <Grid item xs={12} md={3} className="order-3">
            <div className="space-y-3 lg:space-y-4">
              {seoRelatedPosts.slice(2, 4).map((post) => (
                <div key={post._id}>
                  <HomeMediumCard
                    key={post._id}
                    title={post.title}
                    overview={post.overview}
                    mainImage={urlForImage(post.mainImage).url()}
                    slug={`/ai-seo/${post.slug.current}`}
                    publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                    ReadTime={post.readTime?.minutes}
                    tags={post.tags}
                  />
                </div>
              ))}
            </div>
          </Grid>
        </Grid>
      </div>
    </section>
  );
};

export default DigitalMarketing;