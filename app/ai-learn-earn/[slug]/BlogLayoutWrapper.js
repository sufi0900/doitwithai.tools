// app/ai-tools/[slug]/BlogLayoutWrapper.jsx

"use client";

import React, { useContext } from 'react';
import { ArticleCacheContext } from './context/ArticleCacheContext';
import BlogLayout from './BlogLayout'; // Your existing BlogLayout
import ArticleRefreshButton from './components/ArticleRefreshButton';
import ComponentTracker from './components/ComponentTracker';
import SlugSkeleton from '@/components/Blog/Skeleton/SlugSkeleton';

const BlogLayoutWrapper = ({ imgdesc, schemaSlugMap }) => {
    const context = useContext(ArticleCacheContext);

    if (!context) {
        // This can happen briefly while context is initializing
        return <SlugSkeleton />;
    }

    const {
        articleData,
        relatedPosts,
        relatedResources,
        articleLoading,
        relatedPostsLoading,
        resourcesLoading,
        articleFromCache,
        relatedPostsFromCache,
        resourcesFromCache,
    } = context;

    // Show a skeleton if the main article is loading for the first time
    if (articleLoading && !articleData) {
        return <SlugSkeleton />;
    }

    return (
        <>
            {/* The refresh button can be placed here, so it has access to the context */}
            <ArticleRefreshButton />

            {/* These trackers are invisible but report status to the context */}
            <ComponentTracker 
                componentId="main-article" 
                isLoading={articleLoading} 
                isFromCache={articleFromCache} 
            />
            <ComponentTracker 
                componentId="related-posts" 
                isLoading={relatedPostsLoading} 
                isFromCache={relatedPostsFromCache} 
            />
            <ComponentTracker 
                componentId="related-resources" 
                isLoading={resourcesLoading} 
                isFromCache={resourcesFromCache} 
            />

            <BlogLayout
                data={articleData}
                loading={articleLoading}
                relatedPosts={relatedPosts || []}
                relatedPostsLoading={relatedPostsLoading}
                relatedResources={relatedResources || []}
                resourcesLoading={resourcesLoading}
                schemaSlugMap={schemaSlugMap}
                imgdesc={imgdesc}
            />
        </>
    );
};

export default BlogLayoutWrapper;