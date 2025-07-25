// components/DigitalMarketing/index.jsx
"use client";
import React, { useMemo, useState } from "react"; // Removed useEffect as it's not used directly here
import { urlForImage } from "@/sanity/lib/image";
import { Grid } from "@mui/material";
import HomeMediumCard from "@/components/Blog/HomeMediumCard";
import Breadcrumb from "../Common/Breadcrumb";
import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard";
import BigCard from "@/components/Blog/HomeBigCard";
import Link from "next/link";
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
    <section>
      <div className="container">
        <Breadcrumb
          pageName="Boost SEO"
          pageName2="with AI"
          description="AI is revolutionizing how we approach SEO and digital marketing."
          firstlinktext="Home"
          firstlink="/"
          link="/ai-seo"
          linktext="SEO with AI"
        />

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Grid container spacing={2} paddingX={1}>
              {/* Conditional rendering for related posts (left side) */}
              {isLoading && seoRelatedPosts.length === 0 ? (
                // Show skeletons if loading and no data
                <>
               
                </>
              ) : (
                seoRelatedPosts.slice(0, 2).map((post) => (
                  <Grid key={post._id} item xs={12}>
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
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {/* Conditional rendering for big post (center) */}
              {isLoading && !seoBigPost ? (
                <Grid item xs={12}>
                  <BigSkeleton />
                </Grid>
              ) : seoBigPost ? (
                <Grid key={seoBigPost._id} item xs={12}>
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
                </Grid>
              ) : null} {/* Or a "No big post found" message */}
            </Grid>
          </Grid>

          <Grid item xs={12} md={3}>
            <Grid container spacing={2} paddingX={1}>
              {/* Conditional rendering for related posts (right side) */}
              {isLoading && seoRelatedPosts.length === 0 ? (
                // Show skeletons if loading and no data
                <>
                  {/* <Grid item xs={12}><MedSkeleton /></Grid>
                  <Grid item xs={12}><MedSkeleton /></Grid> */}
                </>
              ) : (
                seoRelatedPosts.slice(2, 4).map((post) => (
                  <Grid key={post._id} item xs={12}>
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
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>
        </Grid>

        {/* Error/No data messages for DigitalMarketing component */}
        {hasError && (!seoBigPost && seoRelatedPosts.length === 0) && (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Failed to load AI SEO posts.</p>
            {/* <button
              onClick={handleRefresh} // Uncomment if you add handleRefresh
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button> */}
          </div>
        )}

        {!isLoading && !hasError && !seoBigPost && seoRelatedPosts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No AI SEO posts found at this time.</p>
            {/* <button
              onClick={handleRefresh} // Uncomment if you add handleRefresh
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-4"
            >
              Refresh AI SEO Content
            </button> */}
          </div>
        )}

        {/* Your existing button as your existing code */}
        <div className="mt-6 flex justify-center md:justify-end">
          <Link href="/ai-seo">
            <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
              Explore More Blogs
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DigitalMarketing;