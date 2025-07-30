"use client"
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import BlogHeader from './BlogHeader';
import TableOfContents from './TableOfContents';
import TagsAndShare from './TagsAndShare';
import ReadingProgressCircle from "@/app/ai-seo/[slug]/ReadingProgressCircle";
import { PortableText } from "@portabletext/react";
import PortableTextComponents from './createPortableTextComponents';
import ArticleHeader from './ArticleHeader';
import StickyArticleNavbar from './StickyArticleNavbar';
import Link from 'next/link';
import Image from 'next/image';
import { AccessTime, CalendarMonthOutlined } from '@mui/icons-material';

// Lazy load non-critical components
const FAQSection = lazy(() => import('./FAQSection'));
const RelatedPostsSection = lazy(() => import('./RelatedPostsSection'));
const RelatedResources = lazy(() => import("@/app/free-ai-resources/RelatedResources"));
const BlogSidebar = lazy(() => import("./BlogSidebar"));
const RecentPost = lazy(() => import("@/components/RecentPost/RecentHome"));

// Optimized component skeletons for lazy loaded components
const ComponentSkeleton = ({ height = "200px", className = "" }) => (
  <div className={`animate-pulse bg-gray-200/60 dark:bg-gray-700/60 rounded-lg ${className}`} style={{ height }}>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-300/80 dark:bg-gray-600/80 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300/80 dark:bg-gray-600/80 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300/80 dark:bg-gray-600/80 rounded w-2/3"></div>
    </div>
  </div>
);

// Smart shimmer effect for progressive loading
const SmartShimmer = ({ isLoading, children, fallback, delay = 0 }) => {
  const [showFallback, setShowFallback] = useState(isLoading);
  
  useEffect(() => {
    if (!isLoading) {
      // Add small delay to prevent flash
      const timer = setTimeout(() => setShowFallback(false), delay);
      return () => clearTimeout(timer);
    } else {
      setShowFallback(true);
    }
  }, [isLoading, delay]);
  
  if (showFallback) {
    return fallback;
  }
  
  return children;
};

const BlogLayout = ({
  data,
  loading, // This should now rarely be true for the main article content itself
  relatedPosts,
  relatedPostsLoading,
  relatedResources,
  resourcesLoading,
  schemaSlugMap,
  imgdesc,
}) => {
  // --- ALL REACT HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP LEVEL ---
  const [showGlobalHeader, setShowGlobalHeader] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [loadStage, setLoadStage] = useState(1); // Progressive loading stages
  const [contentReady, setContentReady] = useState(!loading); // Renamed from initialLoad to contentReady for clarity

  // Memoize portable text components
  const portableTextComponents = useMemo(() => {
    const components = PortableTextComponents();
    components.types.button = components.button; // Ensure custom button type is registered
    return components;
  }, []);

  useEffect(() => {
    setMounted(true);
    
    // Mark content as ready immediately if not loading
    // This assumes `loading` refers to the main article data fetch
    if (!loading) {
      setContentReady(true);
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 100;
      setShowGlobalHeader(currentScrollY <= scrollThreshold);
    };

    const handleBeforeUnload = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    };

    const handleLoad = () => {
      const savedPosition = sessionStorage.getItem('scrollPosition');
      if (savedPosition) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedPosition));
          sessionStorage.removeItem('scrollPosition');
        }, 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);

    // Progressive loading stages - optimized timing
    // These timers control when the lazy-loaded sections start to appear (or fetch)
    const loadTimer1 = setTimeout(() => setLoadStage(2), 50);   // Load sidebar quickly
    const loadTimer2 = setTimeout(() => setLoadStage(3), 200);  // Load related content (posts and resources)
    const loadTimer3 = setTimeout(() => setLoadStage(4), 500);  // Load FAQ and Recent Posts

    handleScroll(); // Call once on mount to set initial header state

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
      clearTimeout(loadTimer1);
      clearTimeout(loadTimer2);
      clearTimeout(loadTimer3);
    };
  }, [loading]); // Include `loading` to re-evaluate `contentReady` if main article loading state changes

  // Update content ready state when loading changes
  useEffect(() => {
    if (!loading) {
      setContentReady(true);
    }
  }, [loading]);

  // Memoize breadcrumb data to prevent re-renders
  // This hook has been moved ABOVE the early returns.
  const breadcrumbData = useMemo(() => {
    // Provide default values for data properties if data is null/undefined during initial render
    const categoryType = data?._type || 'default'; // Use a default category type if data is null
    const title = data?.title || ''; // Use an empty string if title is null

    return {
      homeHref: "/",
      // Safely access schemaSlugMap and data._type with nullish coalescing or checks
      categoryHref: `/${(schemaSlugMap[categoryType] === 'ai-learn-earn' ? 'ai-learn-earn' : schemaSlugMap[categoryType]) || 'articles'}`, // Fallback for category href
      categoryName: categoryType === "aitool" ? "AI Tools" :
                    categoryType === "makemoney" ? "AI Learn & Earn" :
                    categoryType === "coding" ? "AI Code" :
                    categoryType === "seo" ? "AI SEO" :
                    categoryType === "freeairesources" ? "Free AI Resources" : "AI News",
      title: title.length > 50 ? `${title.substring(0, 50)}...` : title
    };
  }, [data, schemaSlugMap]); // Dependencies still include data and schemaSlugMap


  // --- EARLY RETURNS COME AFTER ALL HOOKS ---

  // Early return for initial loading state of the *main* article data.
  // This should only show if 'data' is truly absent AND 'loading' is true (i.e., initial fetch).
  // With useUnifiedCache, 'data' might persist even during 'loading' (for refresh).
  if (!data && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300">Loading article content...</p>
        </div>
      </div>
    );
  }

  // If data is null/undefined after loading, it means no article found or a persistent error
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-gray-700 dark:text-gray-300">Article not found or data is unavailable.</p>
          {/* You might want to add a "Go back" button or retry here */}
        </div>
      </div>
    );
  }

  // These can be safely defined here, as they are not hooks
  const currentPostId = data?._id;
  const currentPostType = data?._type;

  return (
    <>
      <ArticleHeader articleTitle={data?.title} isSticky={false} />
      <StickyArticleNavbar articleTitle={data?.title} />
      
      <section className={`overflow-hidden pb-[120px] transition-all duration-500 ease-out ${
        mounted && showGlobalHeader ? 'pt-[18px]' : 'pt-[10px]'
      }`}>
        <div className="container">
        {/* Sticky Navigation Bar - Critical for FCP */}
          <nav aria-label="Breadcrumb" className="mb-8 sticky top-0 z-40 w-full bg-white dark:bg-gray-900 shadow-md transition-all duration-300">
            <ol className="flex items-center space-x-2 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 px-4 py-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
              <li>
                <Link href={breadcrumbData.homeHref} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <Link href={breadcrumbData.categoryHref} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200">
                  {breadcrumbData.categoryName}
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="text-gray-900 dark:text-white font-medium bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-md text-xs" aria-current="page">
                  {breadcrumbData.title}
                </span>
              </li>
            </ol>
          </nav>
        
          <article id="main-content" className="lg:m-4 flex flex-wrap">
            {/* Main Article Content - Priority for FCP */}
            <BlogHeader data={data} imgdesc={imgdesc} />
            
            <div className="custom anchor mb-4 border-b-2 border-black border-opacity-10 pb-4 dark:border-white dark:border-opacity-10"></div>
            
            <div className="w-full lg:w-8/12">
              <div className="mb-10 mt-4 w-full overflow-hidden rounded article-content">
                {/* Author and Meta Info - Critical for FCP */}
                <div className="mb-10 flex flex-nowrap items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg shadow-sm overflow-x-auto space-x-6">
                  <div className="flex items-center shrink-0">
                    <div className="relative mr-4 h-12 w-12 overflow-hidden rounded-full ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 transition-all duration-300 group-hover:ring-4">
                      <Link href="/author/sufian-mustafa">
                        <Image
                          src="/sufi.png"
                          alt="Sufian Mustafa - AI Tools Expert"
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          priority // Critical for FCP
                        />
                      </Link>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        By <Link href="/author/sufian-mustafa" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Sufian Mustafa</Link>
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">AI Tools Expert & Founder</p>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-nowrap items-center gap-4 shrink-0">
                    <div className="flex items-center bg-white dark:bg-gray-700 px-3 py-2 rounded-lg shadow-sm whitespace-nowrap">
                      <span className="mr-2 text-blue-500">
                        <CalendarMonthOutlined className="w-4 h-4" />
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {new Date(data.publishedAt).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short', 
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center bg-white dark:bg-gray-700 px-3 py-2 rounded-lg shadow-sm whitespace-nowrap">
                      <span className="mr-2 text-green-500">
                        <AccessTime className="w-4 h-4" />
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {data.readTime?.minutes} min read
                      </span>
                    </div>
                  </div>
                </div>

                <ReadingProgressCircle />

                {/* Only show refresh loading indicator when actually refreshing */}
                {loading && contentReady && (
                  <div className="flex items-center justify-center py-4 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    <span className="text-sm text-blue-600 dark:text-blue-400">Refreshing article content...</span>
                  </div>
                )}

                {/* Main Content - Critical for FCP */}
                <div className="relative w-full">
                  <div className="opacity-100"> {/* Always show content if we have data */}
                    <TableOfContents tableOfContents={data.tableOfContents} />
                    
                    <div className="custom anchor mb-4 mt-4 border-b-2 border-black border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
                      <PortableText value={data.content} components={portableTextComponents} />
                    </div>

                    {/* FAQ Section - Load after stage 4 */}
                    <SmartShimmer
                      isLoading={loadStage < 4}
                      fallback={<ComponentSkeleton height="300px" />}
                      delay={100} // Small delay to avoid flash if already loaded
                    >
                      <Suspense fallback={<ComponentSkeleton height="300px" />}>
                        <FAQSection faqs={data.faqs} />
                      </Suspense>
                    </SmartShimmer>
                  </div>
                </div>

                {/* Related Resources - Load after stage 3 */}
                <SmartShimmer
                  isLoading={loadStage < 3 || resourcesLoading} // Also consider if resources themselves are loading
                  fallback={<ComponentSkeleton height="400px" />}
                  delay={150} // Slightly longer delay for this section
                >
                  <Suspense fallback={<ComponentSkeleton height="400px" />}>
                    <RelatedResources 
                      resources={relatedResources} 
                      isLoading={resourcesLoading} 
                      slidesToShow={2} 
                    />
                  </Suspense>
                </SmartShimmer>
              </div>
              
              <TagsAndShare tags={data.tags} />
            </div>

            {/* Blog Sidebar - Load after stage 2 */}
            <SmartShimmer
              isLoading={loadStage < 2} // Based on progressive loading stage
              fallback={<div className="w-full lg:w-4/12 lg:pl-8"><ComponentSkeleton height="600px" /></div>}
              delay={100} // Small delay to avoid flash
            >
              <Suspense fallback={<div className="w-full lg:w-4/12 lg:pl-8"><ComponentSkeleton height="600px" /></div>}>
                <BlogSidebar
                  relatedPosts={relatedPosts}
                  relatedPostsLoading={relatedPostsLoading}
                  relatedResources={relatedResources}
                  resourcesLoading={resourcesLoading}
                  schemaSlugMap={schemaSlugMap}
                  currentPostId={currentPostId}
                  currentPostType={currentPostType}
                />
              </Suspense>
            </SmartShimmer>
          </article>

          {/* Related Posts Section - Load after stage 3 */}
          <SmartShimmer
            isLoading={loadStage < 3 || relatedPostsLoading} // Also consider if related posts themselves are loading
            fallback={<ComponentSkeleton height="500px" />}
            delay={150} // Consistent delay with Related Resources
          >
            <Suspense fallback={<ComponentSkeleton height="500px" />}>
              <RelatedPostsSection
                relatedPosts={relatedPosts}
                loading={relatedPostsLoading}
                schemaSlugMap={schemaSlugMap}
              />
            </Suspense>
          </SmartShimmer>

          {/* Recent Posts - Load after stage 4 */}
          <div className="border-b-2 border-black border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
            <SmartShimmer
              isLoading={loadStage < 4} // Based on progressive loading stage
              fallback={<ComponentSkeleton height="400px" />}
              delay={200} // Slightly longer delay for the very last component
            >
              <Suspense fallback={<ComponentSkeleton height="400px" />}>
                <RecentPost />
              </Suspense>
            </SmartShimmer>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogLayout;