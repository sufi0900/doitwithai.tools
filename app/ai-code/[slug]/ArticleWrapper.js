// app/ai-seo/[slug]/ArticleWrapper.jsx
"use client";

import React, { useEffect } from 'react';
import { ArticleRefreshProvider } from '@/app/article-cache/ArticleRefreshContext';
import { useGlobalArticleCache } from '@/contexts/GlobalArticleCacheContext';
import BlogSidebarPage from './BlogSidebarPage';

export default function ArticleWrapper({ initialData, articleType, articleSlug }) {
  const { registerArticle, updateArticleActivity } = useGlobalArticleCache();

  // Register this article with global cache system
  useEffect(() => {
    const unregister = registerArticle(articleType, articleSlug, 4); // 4 components: content, related posts, resources, comments
    
    // Update activity on component interactions
    const handleActivity = () => updateArticleActivity(articleType, articleSlug);
    
    // Track user interactions
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('click', handleActivity);
    
    return () => {
      unregister();
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [articleType, articleSlug, registerArticle, updateArticleActivity]);

  return (
    <ArticleRefreshProvider articleType={articleType} articleSlug={articleSlug}>
      <BlogSidebarPage 
        initialData={initialData}
        articleType={articleType}
        articleSlug={articleSlug}
      />
    </ArticleRefreshProvider>
  );
}
