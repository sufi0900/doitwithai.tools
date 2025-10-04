'use client';
import React, { useState, useEffect } from 'react';
import { Skeleton } from "@mui/material";
import CardComponent from "@/components/Card/Page";
import Breadcrumb from "@/components/Common/Breadcrumb";
import SkelCard from "@/components/Blog/Skeleton/Card";

const SubcategoryContent = ({ posts, subcategoryInfo, totalPosts }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const dynamicLink = `/ai-seo/categories/${subcategoryInfo.slug.current}`;

  return (
    <div className="container mt-10">
      <Breadcrumb
        pageName={subcategoryInfo.title}
        pageName2="SEO Category"
        description={`${subcategoryInfo.description} (${totalPosts} articles)`}
        linktext={subcategoryInfo.title}
        firstlinktext="SEO with AI"
        firstlink="/ai-seo"
        link={dynamicLink}
      />

      {/* Category Stats */}
      <div className="mb-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {posts.length} articles in {subcategoryInfo.title}
        </p>
      </div>

      {/* Blog Posts Grid */}

<div className="flex flex-wrap -mx-3">
  {isLoading ? (
    Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="w-full sm:w-1/2 lg:w-1/3 px-3 mb-6">
        <SkelCard />
      </div>
    ))
  ) : (
    posts.map((post) => (
      <div key={post._id} className="w-full sm:w-1/2 lg:w-1/3 px-3 mb-6">
        <CardComponent
          readTime={post.readTime?.minutes}
          overview={post.overview}
          title={post.title}
          tags={post.tags}
          mainImage={post.mainImage}
          slug={`/ai-seo/${post.slug.current}`}
          publishedAt={post.publishedAt}
        />
      </div>
    ))
  )}
</div>

    </div>
  );
};

export default SubcategoryContent;
