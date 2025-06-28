/* eslint-disable react/jsx-key */
"use client";
import React from "react";
import { urlForImage } from "@/sanity/lib/image";
import { Grid,  } from "@mui/material";
import Link from "next/link";
import {  Code, DollarSign } from "lucide-react";
import {   Wrench } from "lucide-react";


import HomeBigCard from "@/components/Blog/HomeBigCard";
import HomeSmallCard from "@/components/Blog/CategoryRightSideCards"; // This is your existing small card
import SingleBlog from "@/components/Blog/HomeSmallCard"; // Your new second small card for AI Tools
import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
const MixedCategoriesSection = () => {
  const queries = {
    aiToolsQuery: `*[_type == "aitool" && displaySettings.isHomePageAIToolTrendRelated == true][0...2] {
      _id, _type, title, overview, mainImage, slug, publishedAt, readTime, tags, _updatedAt
    }`,
    aiCodeQuery: `*[_type == "coding" && displaySettings.isHomePageCoding == true][0...2] {
      _id, _type, title, overview, mainImage, slug, publishedAt, readTime, tags, _updatedAt
    }`,
    aiEarnQuery: `*[_type == "makemoney" && displaySettings.isHomePageAiEarnTrendBig == true][0...2] {
      _id, _type, title, overview, mainImage, slug, publishedAt, readTime, tags, _updatedAt
    }`,
  };

  // --- USE CACHED DATA HOOKS ---
  const {
    data: aiToolsData,
    isLoading: isAiToolsLoading,
    error: aiToolsError,
    isStale: isAiToolsStale,
    refresh: refreshAiTools,
  } = useSanityCache(
    CACHE_KEYS.HOMEPAGE.MIXED_AI_TOOLS, // Use new specific cache key
    queries.aiToolsQuery,
    { componentName: 'Mixed-AITools', staleTime: 3 * 60 * 1000, maxAge: 15 * 60 * 1000, enableOffline: true }
  );

  const {
    data: aiCodeData,
    isLoading: isAiCodeLoading,
    error: aiCodeError,
    isStale: isAiCodeStale,
    refresh: refreshAiCode,
  } = useSanityCache(
    CACHE_KEYS.HOMEPAGE.MIXED_AI_CODE, // Use new specific cache key
    queries.aiCodeQuery,
    { componentName: 'Mixed-AICode', staleTime: 3 * 60 * 1000, maxAge: 15 * 60 * 1000, enableOffline: true }
  );

  const {
    data: aiEarnData,
    isLoading: isAiEarnLoading,
    error: aiEarnError,
    isStale: isAiEarnStale,
    refresh: refreshAiEarn,
  } = useSanityCache(
    CACHE_KEYS.HOMEPAGE.MIXED_AI_EARN, // Use new specific cache key
    queries.aiEarnQuery,
    { componentName: 'Mixed-AIEarn', staleTime: 3 * 60 * 1000, maxAge: 15 * 60 * 1000, enableOffline: true }
  );

  // NEW: Register cache keys and their refresh functions with the PageCacheProvider
  usePageCache(CACHE_KEYS.HOMEPAGE.MIXED_AI_TOOLS, refreshAiTools, queries.aiToolsQuery, 'Mixed AI Tools');
  usePageCache(CACHE_KEYS.HOMEPAGE.MIXED_AI_CODE, refreshAiCode, queries.aiCodeQuery, 'Mixed AI Code');
  usePageCache(CACHE_KEYS.HOMEPAGE.MIXED_AI_EARN, refreshAiEarn, queries.aiEarnQuery, 'Mixed AI Earn');


  const isLoading = isAiToolsLoading || isAiCodeLoading || isAiEarnLoading; // Combined loading state
  const hasError = aiToolsError || aiCodeError || aiEarnError; // Combined error state
  const isStale = isAiToolsStale || isAiCodeStale || isAiEarnStale; // Combined stale state


  const getCategoryProps = (type) => {
    switch (type) {
      case 'aitool':
        return { categoryColor: 'bg-blue-500', CategoryIcon: Wrench, categoryType: 'AI Tool' }; // Changed to Wrench for consistency
      case 'coding':
        return { categoryColor: 'bg-green-500', CategoryIcon: Code, categoryType: 'Code' };
      case 'makemoney':
        return { categoryColor: 'bg-yellow-600', CategoryIcon: DollarSign, categoryType: 'Earn' };
      default:
        return { categoryColor: 'bg-gray-500', CategoryIcon: null, categoryType: 'Post' };
    }
  };

  const LoadingSkeleton = ({ type }) => (
    <div className="animate-pulse h-full">
      {type === 'big' ? (
        <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-full"></div>
      ) : (
        <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-full"></div>
      )}
    </div>
  );

  const firstAiTool = aiToolsData && aiToolsData.length > 0 ? aiToolsData[0] : null;
  const secondAiTool = aiToolsData && aiToolsData.length > 1 ? aiToolsData[1] : null;


  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Content
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover the latest in AI tools, coding tutorials, and money-making opportunities
          </p>
        </div>

        {/* NEW: Stale Data Warning */}
        {isStale && (<div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-yellow-800 dark:text-yellow-200">
            <span>⚠️</span><span>Mixed categories content may be outdated.</span>
          </div>
        </div>)}

        {/* NEW: Error Display */}
        {hasError && !isLoading && !(aiToolsData || aiCodeData || aiEarnData) && (<div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="text-red-800 dark:text-red-200">
            <h3 className="font-semibold mb-2">Failed to load mixed categories content</h3>
            <p className="text-sm mb-3">{aiToolsError?.message || aiCodeError?.message || aiEarnError?.message || 'Unable to fetch data'}</p>
          </div>
        </div>)}

        <Grid container spacing={4} alignItems="stretch">
          {/* Left Column: Big AI Tool Card + Second Small AI Tool Card */}
          <Grid item xs={12} lg={6}>
            <div className="h-full flex flex-col gap-4">
              {/* First AI Tool (Big Card) */}
              <div className="flex-grow">
                {isLoading || !firstAiTool ? (
                  <LoadingSkeleton type="big" />
                ) : (
                  <HomeBigCard
                    key={firstAiTool._id}
                    title={firstAiTool.title}
                    overview={firstAiTool.overview}
                    mainImage={urlForImage(firstAiTool.mainImage).url()}
                    slug={`/ai-tools/${firstAiTool.slug.current}`}
                    publishedAt={new Date(firstAiTool.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    ReadTime={firstAiTool.readTime?.minutes}
                    tags={firstAiTool.tags}
                  />
                )}
              </div>

              {/* Second AI Tool (Small Card - using SingleBlog) */}
              <div className="flex-grow">
                {isLoading || !secondAiTool ? (
                  <LoadingSkeleton type="small" />
                ) : (
                  <SingleBlog // Assuming SingleBlog is HomeSmallCard
                    key={secondAiTool._id}
                    title={secondAiTool.title}
                    overview={secondAiTool.overview}
                    mainImage={urlForImage(secondAiTool.mainImage).url()}
                    slug={`/ai-tools/${secondAiTool.slug.current}`}
                    publishedAt={new Date(secondAiTool.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    ReadTime={secondAiTool.readTime?.minutes}
                    tags={secondAiTool.tags}
                  />
                )}
              </div>
            </div>
          </Grid>

          {/* Right Column: AI Code & AI Earn (Small Cards - using HomeSmallCard) */}
          <Grid item xs={12} lg={6}>
            <div className="h-full flex flex-col gap-4">
              {/* AI Code Section */}
              <div className="flex-1 flex flex-col">
                {isLoading ? (
                  <LoadingSkeleton type="small" />
                ) : (
                  aiCodeData?.map((post) => { // Use optional chaining
                    const { categoryColor, CategoryIcon, categoryType } = getCategoryProps(post._type);
                    return (
                      <HomeSmallCard
                        key={post._id}
                        post={post} // Assuming HomeSmallCard takes a 'post' prop
                        categoryType={categoryType}
                        categoryColor={categoryColor}
                        CategoryIcon={CategoryIcon}
                      />
                    );
                  })
                )}
              </div>

              {/* AI Earn Section */}
              <div className="flex-1 flex flex-col">
                {isLoading ? (
                  <LoadingSkeleton type="small" />
                ) : (
                  aiEarnData?.map((post) => { // Use optional chaining
                    const { categoryColor, CategoryIcon, categoryType } = getCategoryProps(post._type);
                    return (
                      <HomeSmallCard
                        key={post._id}
                        post={post} // Assuming HomeSmallCard takes a 'post' prop
                        categoryType={categoryType}
                        categoryColor={categoryColor}
                        CategoryIcon={CategoryIcon}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </Grid>
        </Grid>

        {/* Bottom CTA Buttons */}
        <div className="text-center mt-12">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/ai-tools">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Explore AI Tools
              </button>
            </Link>
            <Link href="/ai-code">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2">
                <Code className="w-4 h-4" />
                View AI Code
              </button>
            </Link>
            <Link href="/ai-learn-earn">
              <button className="bg-yellow hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Start Earning
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MixedCategoriesSection;