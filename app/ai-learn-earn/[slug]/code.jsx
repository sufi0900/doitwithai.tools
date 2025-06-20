/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useCallback  } from "react";
import BlogLayout from "@/app/ai-tools/[slug]/BlogLayout"
import { client } from "@/sanity/lib/client";
import "@/styles/customanchor.css";
import { usePageCache } from "@/app/ai-tools/[slug]/usePageCache";
import CacheStatusIndicator from "./CacheStatusIndicator";
import { ArticleCacheProvider } from "./ArticleCacheContext";
import { useAdvancedPageCache } from "./useAdvancedPageCache";
import { CacheStatusProvider } from "./CacheStatusProvider"; // NEW IMPORT

export const revalidate = false;
export const dynamic = "force-dynamic";

class CacheErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Cache-related error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">Content temporarily unavailable. Please refresh the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
async function fetchAllBlogs(page = 1, limit = 5, categories = []) {
    const start = (page - 1) * limit;
    const query = `*[_type in $categories]|order(publishedAt desc){formattedDate,readTime,_id,_type,title,slug,mainImage,overview,body,publishedAt}[${start}...${start + limit}]`;
    const result = await client.fetch(query, { categories });
    return result;
}
// ChildCompdata.js or where fetchFreeAiResourcesData is defined
// UPDATED fetchFreeAiResourcesData function
//UPDATEDfetchFreeAiResourcesDatafunction
async function fetchFreeAiResourcesData(articleId, _currentPostType, excludeId) {
    if (!articleId) {
        console.warn("Article ID is required to fetch related free AI resources.");
        return []; // Problematic for error handling
    }
    const query = `*[_type=="freeResources"&&_id!=$excludeId&&references($articleId)]{_id,title,tags,mainImage,overview,resourceType,resourceFormat,resourceLink,resourceLinkType,previewSettings,"resourceFile":resourceFile.asset->,content,publishedAt,promptContent,"relatedArticle":relatedArticle->{title,slug,_id,_type},seoTitle,seoDescription,seoKeywords,altText,structuredData}`;
    try {
        const result = await client.fetch(query, { articleId, excludeId });
        console.log(`Fetched ${Array.isArray(result) ? result.length : 0} related resources for article ${articleId}`);
        return Array.isArray(result) ? result : [];
    } catch (error) {
        console.error("Error fetching related free AI resources:", error);
        throw error; // <--- CRITICAL FIX: Re-throw the error!
    }
}
// MODIFIED: Add a parameter for the current post's ID to exclude it
async function fetchRelatedPostsData(currentPostId, currentPostType) { // Added currentPostType
    const excludeId = currentPostId ? currentPostId : '';
    // Fetch related posts from 'makemoney' schema type, excluding the current post
    const query = `*[_type=="makemoney" && _id!=$excludeId]|order(_createdAt desc)[0...3]`;
    return await client.fetch(query, { excludeId });
}

export default function ChildCompdata({ data }) {
  const [hasInitialData, setHasInitialData] = useState(!!data);
    const currentPostId = data?._id;
    const currentPostType = data?._type; // Get the schema type of the current article

    const imgdesc = {
        block: {
            normal: ({ children }) => (
                <p className="hover:text-gray-950 dark:hover:text-gray-50 mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-800 dark:text-gray-300 transition-all duration-300 ease-in-out">{children}</p>
            ),
            a: ({ children }) => (
                <a className="dark-bg-green-50 rounded-bl-xl rounded-br-xl text-center text-base text-blue-500 underline hover:text-blue-600 dark:text-gray-400 hover:underline">{children}</a>
            )
        },
    };

    const [loading, setLoading] = useState(!data);
    const [currentPage, setCurrentPage] = useState(1);
    const [allData, setAllData] = useState([]); // Initialize allData state

    const schemaSlugMap = {
        makemoney: "ai-learn-earn",
        aitool: "ai-tools",
        news: "news",
        coding: "ai-code",
        freeairesources: "free-ai-resources",
        seo: "ai-seo",
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!data) {
                setLoading(true);
            }
            try {
                const newData = await fetchAllBlogs(currentPage, 5, ["makemoney", "aitool", "news", "coding", "freeairesources", "seo"]);
                setAllData(newData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        if (currentPage > 1 || !data) {
            fetchData();
        }
    }, [currentPage, data]);

    // Use useAdvancedPageCache for the main article content
   const {
  data: articleData,
  loading: articleLoading,
  isFromCache: articleIsFromCache,
  refreshData: refreshArticleData,
  cacheStatus: articleCacheStatus,
  hasUpdatesAvailable: articleHasUpdatesAvailable,
  isRefreshing: articleIsRefreshing
} = useAdvancedPageCache(
  `article_content`,
  async () => {
    const query = `*[_type=="${currentPostType}" && slug.current=="${data?.slug.current}"][0]`;
    const freshArticle = await client.fetch(query, {}, { cache: 'no-store' });
    return freshArticle;
  },
  currentPostType,
  { 
    slug: data?.slug.current, 
    id: currentPostId, 
    componentId: 'main-content' 
  }
);

// For related posts
const {
  data: relatedPosts,
  loading: relatedPostsLoading,
  isFromCache: relatedPostsFromCache,
  refreshData: refreshRelatedPosts,
  cacheStatus: relatedPostsCacheStatus,
  hasUpdatesAvailable: relatedPostsHasUpdatesAvailable,
  isRefreshing: relatedPostsIsRefreshing
} = useAdvancedPageCache(
  `related_posts`,
  async () => {
    return await fetchRelatedPostsData(currentPostId, currentPostType);
  },
  'makemoney',
  { 
    id: currentPostId, 
    componentId: 'related-posts' 
  }
);

// For related resources  
const {
  data: relatedResources,
  loading: resourcesLoading,
  isFromCache: resourcesFromCache,
  refreshData: refreshResources,
  cacheStatus: relatedResourcesCacheStatus,
  hasUpdatesAvailable: relatedResourcesHasUpdatesAvailable,
  isRefreshing: relatedResourcesIsRefreshing
} = useAdvancedPageCache(
  `related_resources`,
  async () => {
    // Use the most reliable source for article ID
    const sourceData = articleData || data;
    const sourceId = sourceData?._id;
    const sourceType = sourceData?._type;
    
    if (!sourceId) {
      console.warn("No article ID available for fetching related resources");
      return [];
    }
    
    return await fetchFreeAiResourcesData(sourceId, sourceType, currentPostId);
  },
  'freeResources',
  {
    id: currentPostId,
    componentId: 'related-resources',
    // Make sure articleId is always available
    articleId: (articleData || data)?._id,
    // Add slug as backup identifier
    slug: (articleData || data)?.slug?.current
  }
);
  useEffect(() => {
    // If we don't have initial data but get article data from cache, update our state
    if (!hasInitialData && articleData) {
      setHasInitialData(true);
    }
    
    // Your existing synchronization logic...
    if (articleData && articleData._id !== currentPostId) {
      refreshRelatedPosts();
      refreshResources();
    }

    if (articleData && !relatedResources && !resourcesLoading) {
      refreshResources();
    }
  }, [articleData?._id, currentPostId, refreshRelatedPosts, refreshResources, relatedResources, resourcesLoading, hasInitialData]);

useEffect(() => {
  console.log('ChildCompdata - Data flow check:', {
    articleData: !!articleData,
    relatedPosts: relatedPosts?.length || 0,
    relatedResources: relatedResources?.length || 0,
    relatedPostsLoading,
    resourcesLoading
  });
}, [articleData, relatedPosts, relatedResources, relatedPostsLoading, resourcesLoading]);
// 3. Add this useEffect to handle data synchronization after the existing useEffect
// UPDATED: Enhanced data synchronization
useEffect(() => {
  // Ensure related data is refreshed when article data changes
  if (articleData && articleData._id !== currentPostId) {
    // Article has been refreshed, refresh related content
    refreshRelatedPosts();
    refreshResources();
  }
  
  // Also refresh related resources if article data becomes available for the first time
  if (articleData && !relatedResources && !resourcesLoading) {
    refreshResources();
  }
}, [articleData?._id, currentPostId, refreshRelatedPosts, refreshResources, relatedResources, resourcesLoading]);

  const effectiveData = articleData || data;
  const effectiveLoading = !hasInitialData && articleLoading;

  // Show loading state if we have no data and are still loading
  if (!effectiveData && effectiveLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-medium text-gray-800 dark:text-gray-200">
            Loading article...
          </h1>
        </div>
      </section>
    );
  }

  // Show error state only if we truly have no data and aren't loading
  if (!effectiveData && !effectiveLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Article Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Unable to load the article. Please check your connection and try again.
          </p>
          {/* You could add a retry button here */}
        </div>
      </section>
    );
  }

    return (
  <CacheErrorBoundary>
            <BlogLayout
                data={effectiveData} // Use articleData from cache or initial data prop
      loading={effectiveLoading} // Use effective loading state
                relatedPosts={relatedPosts || []}
                relatedPostsLoading={relatedPostsLoading}
                relatedResources={relatedResources || []}
                resourcesLoading={resourcesLoading}
                schemaSlugMap={schemaSlugMap}
                imgdesc={imgdesc}
                // Pass individual cache statuses and refresh functions for component tracking
                articleCacheStatus={articleCacheStatus}
                articleIsFromCache={articleIsFromCache}
                articleHasUpdatesAvailable={articleHasUpdatesAvailable}
                articleIsRefreshing={articleIsRefreshing}

                relatedPostsCacheStatus={relatedPostsCacheStatus}
                relatedPostsIsFromCache={relatedPostsFromCache}
                relatedPostsHasUpdatesAvailable={relatedPostsHasUpdatesAvailable}
                relatedPostsIsRefreshing={relatedPostsIsRefreshing}

                relatedResourcesCacheStatus={relatedResourcesCacheStatus}
                relatedResourcesIsFromCache={resourcesFromCache}
                relatedResourcesHasUpdatesAvailable={relatedResourcesHasUpdatesAvailable}
                relatedResourcesIsRefreshing={relatedResourcesIsRefreshing}
            />
            </CacheErrorBoundary>
    );
}