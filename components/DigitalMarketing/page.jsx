"use client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image";
import { Grid } from "@mui/material";
import HomeMediumCard from "@/components/Blog/HomeMediumCard";
import Breadcrumb from "../Common/Breadcrumb";
import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard";
import BigCard from "@/components/Blog/HomeBigCard";
import { useCachedSanityData  } from '@/components/blog/useSanityCache';
import { CACHE_KEYS } from '@/components/Blog/cacheKeys';
import Link from "next/link";

const DigitalMarketing = () => {
  // Define queries
  const queries = {
    seoTrendBig: `*[_type == "seo" && displaySettings.isHomePageSeoTrendBig == true] {
      _id,
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
    seoTrendRelated: `*[_type == "seo" && displaySettings.isHomePageSeoTrendRelated == true] {
      _id,
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

  // Use cached data hooks
  const {
    data: seoTrendBigData,
    isLoading: isBigLoading,
    error: bigError,
    isOffline: isBigOffline,
    dataSource: bigDataSource,
    refresh: refreshBigData
  } = useCachedSanityData(CACHE_KEYS.SEO_TREND_BIG, queries.seoTrendBig); // <-- Use CACHE_KEYS

  const {
    data: seoTrendRelatedData,
    isLoading: isRelatedLoading,
    error: relatedError,
    isOffline: isRelatedOffline,
    dataSource: relatedDataSource,
    refresh: refreshRelatedData
  } = useCachedSanityData(CACHE_KEYS.SEO_TREND_RELATED, queries.seoTrendRelated); // <-- Use CACHE_KEYS

  // Combine loading states
  const isLoading = isBigLoading || isRelatedLoading;
  const isOffline = isBigOffline || isRelatedOffline;

  // Handle manual refresh with user feedback
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshBigData(), refreshRelatedData()]);
      setLastRefreshed(new Date());
      
      // Show success message
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.success('Content refreshed successfully!');
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
      
      // Show error message
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.error('Failed to refresh content. Please try again.');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh every 5 minutes when page is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !isOffline) {
        handleRefresh();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isOffline]);

  // Show data source indicator (for development/debugging)
  const showDataSourceInfo = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Data sources:', {
        big: bigDataSource,
        related: relatedDataSource,
        offline: isOffline
      });
    }
  };

  useEffect(() => {
    showDataSourceInfo();
  }, [bigDataSource, relatedDataSource, isOffline]);

  return (
    <section>
      <div className="container">
        {/* Add offline indicator */}
        {isOffline && (
          <div className="mb-4 rounded-lg bg-yellow-100 p-3 text-yellow-800">
            <span className="font-medium">Offline Mode:</span> Showing cached content
            <button
              onClick={handleRefresh}
              className="ml-2 text-blue-600 underline hover:text-blue-800"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Manual Refresh Button - Always visible for fresh content */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Data source indicator */}
            {(bigDataSource === 'localStorage' || relatedDataSource === 'localStorage') && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800">
                📱 Cached Content
              </span>
            )}
            {(bigDataSource === 'fresh' || relatedDataSource === 'fresh') && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">
                ✨ Fresh Content
              </span>
            )}
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isRefreshing
                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <svg
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Content'}</span>
          </button>
        </div>

        {/* Your existing Breadcrumb component as your existing code */}
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
              {isLoading ? (
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

