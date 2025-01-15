'use client';
import React, { useState } from 'react';
import { Skeleton } from "@mui/material";
import CardComponent from "@/components/Card/Page";
import Breadcrumb from "@/components/Common/Breadcrumb";
import SkelCard from "@/components/Blog/Skeleton/Card";

interface SubcategoryContentProps {
  posts: any[];
  subcategoryInfo: {
    title: string;
    description: string;
  };
}

const SubcategoryContent: React.FC<SubcategoryContentProps> = ({ posts, subcategoryInfo }) => {
  const [isLoading] = useState(false);
  const dynamicLink = `/category/${subcategoryInfo.title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="container mt-10">
      <Breadcrumb
        pageName={subcategoryInfo.title}
        pageName2="Category"
        description={subcategoryInfo.description}
        linktext={subcategoryInfo.title}
        firstlinktext="seo-with-ai"
        firstlink="/seo"
        link={dynamicLink} // Set dynamically generated second link
      />

     

      {/* Blog Posts Grid */}
      <div className="-mx-4 flex flex-wrap justify-center">
        {isLoading ? (
          // Display Skeleton components while loading
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="mx-2 mb-4 flex flex-wrap justify-center">
              <SkelCard />
            </div>
          ))
        ) : (
          // Render BlogCard components when data is available
          posts.map((post) => (
            <CardComponent
              key={post._id}
              readTime={post.readTime?.minutes}
              overview={post.overview}
              title={post.title}
              tags={post.tags}
              mainImage={post.mainImage}
              slug={`/seo/${post.slug.current}`}
              publishedAt={post.publishedAt}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SubcategoryContent;