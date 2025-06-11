/* eslint-disable react/jsx-key */
"use client";

import React from "react";
import { urlForImage } from "@/sanity/lib/image";
import { Grid,  } from "@mui/material";
import Link from "next/link";
import { TrendingUp, Code, DollarSign } from "lucide-react";
import {   Wrench } from "lucide-react";
import { useCachedSanityData } from '@/components/blog/useSanityCache'; // Already there
import { CACHE_KEYS } from '@/components/Blog/cacheKeys'; // <-- ADD this import

import HomeBigCard from "@/components/Blog/HomeBigCard";
import HomeSmallCard from "@/components/Blog/CategoryRightSideCards"; // This is your existing small card
import SingleBlog from "@/components/Blog/HomeSmallCard"; // Your new second small card for AI Tools

const MixedCategoriesSection = () => {
 
  const queries = {
    aiToolsQuery: `*[_type == "aitool" && displaySettings.isHomePageAIToolTrendRelated == true][0...2] {
      _id, _type, title, overview, mainImage, slug, publishedAt, readTime, tags, _updatedAt // <-- ADD _updatedAt
    }`,
    aiCodeQuery: `*[_type == "coding" && displaySettings.isHomePageCoding == true][0...2] {
      _id, _type, title, overview, mainImage, slug, publishedAt, readTime, tags, _updatedAt // <-- ADD _updatedAt
    }`,
    aiEarnQuery: `*[_type == "makemoney" && displaySettings.isHomePageAiEarnTrendBig == true][0...2] {
      _id, _type, title, overview, mainImage, slug, publishedAt, readTime, tags, _updatedAt // <-- ADD _updatedAt
    }`,
  };

  // Replace useEffect for data fetching with useCachedSanityData hooks
  // --- USE CACHED DATA HOOKS ---
  const {
    data: aiToolsData,
    isLoading: isAiToolsLoading
  } = useCachedSanityData(CACHE_KEYS.MIXED_CATEGORIES_AI_TOOLS, queries.aiToolsQuery);

  const {
    data: aiCodeData,
    isLoading: isAiCodeLoading
  } = useCachedSanityData(CACHE_KEYS.MIXED_CATEGORIES_AI_CODE, queries.aiCodeQuery);

  const {
    data: aiEarnData,
    isLoading: isAiEarnLoading
  } = useCachedSanityData(CACHE_KEYS.MIXED_CATEGORIES_AI_EARN, queries.aiEarnQuery);

  const isLoading = isAiToolsLoading || isAiCodeLoading || isAiEarnLoading; // Combined loading state

  const getCategoryProps = (type) => {
    switch (type) {
      case 'aitool':
        return { categoryColor: 'bg-blue-500', CategoryIcon: TrendingUp, categoryType: 'AI Tool' };
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

 const firstAiTool = aiToolsData && aiToolsData.length > 0 ? aiToolsData[0] : null; // UPDATED LINE
  const secondAiTool = aiToolsData && aiToolsData.length > 1 ? aiToolsData[1] : null; // UPDATED LINE


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

        {/*
          Removed lg:min-h-[652px] from here.
          The `h-full` on the Grid items and `flex-1` within will now dynamically
          adjust heights based on the content of the two columns.
        */}
        <Grid container spacing={4} alignItems="stretch">
          {/* Left Column: Big AI Tool Card + Second Small AI Tool Card */}
          <Grid item xs={12} lg={6}>
            {/* This div needs to be a flex container with column direction and gap */}
            <div className="h-full flex flex-col gap-4">
              {/* First AI Tool (Big Card) */}
              <div className="flex-grow"> {/* Use flex-grow for the big card to ensure it grows to take its space */}
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
              <div className="flex-grow"> {/* Use flex-grow here as well */}
                {isLoading || !secondAiTool ? (
                  <LoadingSkeleton type="small" />
                ) : (
                  <SingleBlog
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
                  aiCodeData.map((post) => {
                    const { categoryColor, CategoryIcon, categoryType } = getCategoryProps(post._type);
                    return (
                      <HomeSmallCard
                        key={post._id}
                        post={post}
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
                  aiEarnData.map((post) => {
                    const { categoryColor, CategoryIcon, categoryType } = getCategoryProps(post._type);
                    return (
                      <HomeSmallCard
                        key={post._id}
                        post={post}
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