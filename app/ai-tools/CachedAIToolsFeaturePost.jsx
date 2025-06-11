"use client";
import React from 'react';
import { Grid } from "@mui/material";
import FeaturePost from "@/components/Blog/featurePost";
import FeatureSkeleton from "@/components/Blog/Skeleton/FeatureCard";
import { urlForImage } from "@/sanity/lib/image";
import { useCachedSanityData } from '@/components/Blog/useSanityCache';

const ReusableCachedFeaturePost = ({ documentType, pageSlugPrefix, cacheKey }) => {
  const featureQuery = `*[_type=="${documentType}" && displaySettings.isOwnPageFeature==true]{
    _id,
    title,
    overview,
    mainImage,
    slug,
    publishedAt,
    readTime,
    tags,
    "displaySettings": displaySettings
  }`;

  const {
    data,
    isLoading,
    error,
  } = useCachedSanityData(
    cacheKey,
    featureQuery,
    {
      componentName: `${documentType}FeaturePost`,
      usePageContext: true
    }
  );

  if (isLoading) {
    return (
      <Grid item xs={12}>
        <FeatureSkeleton />
      </Grid>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load feature posts.</p>
      </div>
    );
  }

  return (
    <>
      {data?.map((post) => (
        <Grid key={post._id} item xs={12}>
          <FeaturePost
            title={post.title}
            overview={post.overview}
            mainImage={urlForImage(post.mainImage).url()}
            slug={`/${pageSlugPrefix}/${post.slug.current}`}
            date={new Date(post.publishedAt).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
            readTime={post.readTime?.minutes}
            tags={post.tags}
          />
        </Grid>
      ))}
    </>
  );
};

export default ReusableCachedFeaturePost;