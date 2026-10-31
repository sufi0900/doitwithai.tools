/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useUnifiedCache } from '@/React_Query_Caching/useUnifiedCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { urlForImage } from "@/sanity/lib/image";

const ArticleFilterWithAssets = ({ onClose }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showAssets, setShowAssets] = useState(false);

  // Schema slug mapping for URLs
  const schemaSlugMap = useMemo(() => ({
    makemoney: "ai-learn-earn",
    aitool: "ai-tools", 
    coding: "ai-code",
    seo: "ai-seo",
  }), []);

  // Query to fetch all articles from all schemas
  const allArticlesQuery = useMemo(() => `
    *[_type in ["makemoney", "aitool", "coding", "seo"]] | order(publishedAt desc) {
      _id,
      _type,
      title,
      slug,
      mainImage,
      publishedAt,
      tags
    }
  `, []);

  // Query to fetch assets linked to a specific article
  const getAssetsQuery = useCallback((articleId) => `
    *[_type == "freeResources" && relatedArticle._ref == "${articleId}"] {
      _id,
      title,
      slug,
      resourceType,
      resourceFormat,
      mainImage,
      overview,
      resourceFile,
      resourceLink,
      publishedAt,
      tags
    }
  `, []);

  const cacheGroup = useMemo(() => 'article-filter-assets', []);

  // Fetch all articles
  const {
    data: articlesData,
    isLoading: isArticlesLoading,
    error: articlesError,
    refresh: refreshArticles
  } = useUnifiedCache(
    CACHE_KEYS.PAGE.MIXED_BLOGS_PAGINATED(1, 'all', 'publishedAt desc'),
    allArticlesQuery,
    {},
    {
      componentName: 'ArticleFilterAllArticles',
      enableOffline: true,
      group: cacheGroup,
      schemaType: ["makemoney", "aitool", "coding", "seo"]
    }
  );

  // Fetch assets for selected article
  const assetsQuery = selectedArticle ? getAssetsQuery(selectedArticle._id) : null;
  const assetsCacheKey = selectedArticle ? 
    `assets-for-article-${selectedArticle._id}` : 
    null;

  const {
    data: assetsData,
    isLoading: isAssetsLoading,
    error: assetsError,
    refresh: refreshAssets
  } = useUnifiedCache(
    assetsCacheKey,
    assetsQuery,
    {},
    {
      componentName: `ArticleAssets_${selectedArticle?._id || 'none'}`,
      enableOffline: true,
      group: cacheGroup,
      schemaType: ["freeResources"],
      enabled: !!selectedArticle
    }
  );

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setShowAssets(true);
  };

  const handleBackToArticles = () => {
    setShowAssets(false);
    setSelectedArticle(null);
  };

  const getSchemaLabel = (schemaType) => {
    const labels = {
      'makemoney': 'Make Money',
      'aitool': 'AI Tools',
      'coding': 'AI Code', 
      'seo': 'AI SEO'
    };
    return labels[schemaType] || schemaType;
  };

  const getSchemaColor = (schemaType) => {
    const colors = {
      'makemoney': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'aitool': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'coding': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'seo': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    };
    return colors[schemaType] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const getResourceFormatIcon = (format) => {
    const icons = {
      'image': '🖼️',
      'video': '🎥', 
      'text': '📝',
      'document': '📄',
      'aitool': '🤖'
    };
    return icons[format] || '📎';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {showAssets ? `Assets for: ${selectedArticle?.title}` : 'Filter by Related Article'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!showAssets ? (
            // Articles List View
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Select an article to view all related free resources and assets
              </p>
              
              {isArticlesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
                  ))}
                </div>
              ) : articlesError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">Failed to load articles</p>
                  <button
                    onClick={refreshArticles}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articlesData?.map((article) => (
                    <div
                      key={article._id}
                      onClick={() => handleArticleClick(article)}
                      className="group cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                    >
                      {/* Article Image */}
                      <div className="relative overflow-hidden rounded-t-xl">
                        <img
                          src={article.mainImage ? urlForImage(article.mainImage).url() : "https://placehold.co/400x200/e5e7eb/6b7280?text=No+Image"}
                          alt={article.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Schema Type Badge */}
                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getSchemaColor(article._type)}`}>
                          {getSchemaLabel(article._type)}
                        </div>
                      </div>

                      {/* Article Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {article.overview}
                        </p>
                        
                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {article.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md"
                              >
                                {tag.name}
                              </span>
                            ))}
                            {article.tags.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{article.tags.length - 2} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Published Date */}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(article.publishedAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short', 
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Assets List View
            <div>
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={handleBackToArticles}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Articles
                </button>
                
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getSchemaColor(selectedArticle._type)}`}>
                  {getSchemaLabel(selectedArticle._type)}
                </div>
              </div>

              {isAssetsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
                  ))}
                </div>
              ) : assetsError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">Failed to load assets</p>
                  <button
                    onClick={refreshAssets}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              ) : !assetsData || assetsData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No Assets Found
                  </p>
                  <p className="text-gray-500 dark:text-gray-500">
                    This article doesn't have any linked free resources yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assetsData.map((asset) => (
                    <div
                      key={asset._id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                    >
                      {/* Asset Image */}
                      <div className="relative overflow-hidden rounded-t-xl">
                        <img
                          src={asset.mainImage ? urlForImage(asset.mainImage).url() : "https://placehold.co/400x200/e5e7eb/6b7280?text=No+Image"}
                          alt={asset.title}
                          className="w-full h-48 object-cover"
                        />
                        {/* Resource Format Badge */}
                        <div className="absolute top-3 left-3 px-3 py-1 bg-black/70 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                          <span>{getResourceFormatIcon(asset.resourceFormat)}</span>
                          {asset.resourceFormat}
                        </div>
                      </div>

                      {/* Asset Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {asset.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {asset.overview}
                        </p>
                        
                        {/* Resource Type */}
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">
                          {asset.resourceType}
                        </div>

                        {/* View Asset Button */}
                        <a
                          href={asset.slug ? `/free-ai-resources/${asset.slug.current}` : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          View Asset
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleFilterWithAssets;