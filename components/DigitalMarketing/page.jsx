"use client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image";
import { Grid } from "@mui/material";
import HomeMediumCard from "@/components/Blog/HomeMediumCard";
import Breadcrumb from "../Common/Breadcrumb";
import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard";
import BigCard from "@/components/Blog/HomeBigCard";
import Link from "next/link";
import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';

const DigitalMarketing = () => {
  // Define queries
  const queries = {
    seoTrendBig: `*[_type=="seo"&&displaySettings.isHomePageSeoTrendBig==true]{_id,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`,
    seoTrendRelated: `*[_type=="seo"&&displaySettings.isHomePageSeoTrendRelated==true]{_id,title,overview,mainImage,slug,publishedAt,readTime,tags,_updatedAt,"displaySettings":displaySettings}`
  };

  // Use cached data hooks
  const {
    data: seoTrendBigData,
    isLoading: isBigLoading,
    error: bigError,
    // isOffline: isBigOffline, // These aren't used, can remove for cleaner code
    // dataSource: bigDataSource, // These aren't used, can remove for cleaner code
    refresh: refreshBigData
  } = useSanityCache(CACHE_KEYS.HOMEPAGE.SEO_TREND_BIG, queries.seoTrendBig);

  const {
    data: seoTrendRelatedData,
    isLoading: isRelatedLoading,
    error: relatedError,
    // isOffline: isRelatedOffline, // These aren't used, can remove for cleaner code
    // dataSource: relatedDataSource, // These aren't used, can remove for cleaner code
    refresh: refreshRelatedData
  } = useSanityCache(CACHE_KEYS.HOMEPAGE.SEO_TREND_RELATED, queries.seoTrendRelated);

  // NEW: Register cache keys and their refresh functions with the PageCacheProvider
  usePageCache(CACHE_KEYS.HOMEPAGE.SEO_TREND_BIG, refreshBigData, queries.seoTrendBig, 'SEOBig');
  usePageCache(CACHE_KEYS.HOMEPAGE.SEO_TREND_RELATED, refreshRelatedData, queries.seoTrendRelated, 'SEORelated');

  // Combine loading states
  const isLoading = isBigLoading || isRelatedLoading; // Correct
  const hasError = bigError || relatedError; // Correct

  return (
    <section>
      <div className="container">
    
        <Breadcrumb
          pageName="Boost SEO"
          pageName2="with AI"
          description="AI is revolutionizing how we approach SEO and digital marketing..."
          firstlinktext="Home"
          firstlink="/"
          link="/ai-seo" 
          linktext="SEO with AI"
        />

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Grid container spacing={2} paddingX={1}>
              {(seoTrendRelatedData || []).slice(0, 2).map((post) => (
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
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {isBigLoading ? (
                <Grid item xs={12}>
                  <BigSkeleton/>
                </Grid>
              ) : (
                (seoTrendBigData || []).slice(0, 1).map((post) => (
                  <Grid key={post._id} item xs={12}>
                    <BigCard        
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

          <Grid item xs={12} md={3}>
            <Grid container spacing={2} paddingX={1}>
              {(seoTrendRelatedData || []).slice(2, 4).map((post) => (
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
              ))}
            </Grid>
          </Grid>
        </Grid>

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

