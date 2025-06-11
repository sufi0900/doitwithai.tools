"use client";
import { useCachedSanityData } from '@/components/Blog/useSanityCache';
import React, { useEffect } from 'react';
import CardComponent from "@/components/Card/Page";
import SkelCard from "@/components/Blog/Skeleton/Card";
import { urlForImage } from "@/sanity/lib/image";
// Add this import at the top
import { CACHE_KEYS } from '@/components/Blog/cacheKeys';
const ReusableCachedAllBlogs = ({
  currentPage = 1,
  limit = 10,
  documentType,
  pageSlugPrefix,
  cacheKeyPrefix,
  onDataLoad,
  customQuery
}) => {
  const start = (currentPage - 1) * limit;

  // Determine the query to use: customQuery if provided, otherwise build from documentType
  const queryToUse = customQuery 
    ? `${customQuery.slice(0, customQuery.lastIndexOf('}'))}[${start}...${start + limit + 1}]`
    : `*[_type == "${documentType}"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        mainImage,
        readTime,
        tags,
        overview,
        body,
        publishedAt,
        _type
      }[${start}...${start + limit + 1}]`;

// In ReusableCachedAllBlogs.jsx, update the useCachedSanityData call options:
const {data, isLoading, error} = useCachedSanityData(
  `${cacheKeyPrefix}-page-${currentPage}`,
  queryToUse,
  {
    componentName: `${documentType || 'Custom'}-AllBlogs-Page${currentPage}`,
    usePageContext: true,
    // Add this to ensure proper refresh handling for SEO pages
    enableOffline: true,
    forceRefresh: false
  }
);
  useEffect(() => {
    if (data && onDataLoad) {
      const hasMore = data.length > limit;
      onDataLoad(hasMore);
    }
  }, [data, limit, onDataLoad]);

  if (isLoading) {
    return (
      <div className="-mx-4 flex flex-wrap justify-center">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="mx-2 mb-4 flex flex-wrap justify-center">
            <SkelCard />
          </div>
        ))}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load blog posts</p>
      </div>
    );
  }

  const postsToDisplay = data ? data.slice(0, limit) : [];

  return (
    <div className="-mx-4 flex flex-wrap justify-center">
      {postsToDisplay.map((post) => (
        <CardComponent
          key={post._id}
          ReadTime={post.readTime?.minutes}
          overview={post.overview}
          title={post.title}
          tags={post.tags}
          mainImage={urlForImage(post.mainImage).url()}
          // Dynamically determine slug based on _type for SEO pages
          slug={`/${post._type === "seo" ? "ai-seo" : pageSlugPrefix}/${post.slug.current}`}
          publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        />
      ))}
    </div>
  );
};

export default ReusableCachedAllBlogs;