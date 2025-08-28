  // BlogLayout which is responsible for displaying the article content

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

  import CommentSection from './CommentSection'; // Adjust path as needed

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
  const useDeviceSize = () => {
    const [isLargeDevice, setIsLargeDevice] = useState(false);
    
    useEffect(() => {
      const checkDevice = () => {
        setIsLargeDevice(window.innerWidth >= 1024); // lg breakpoint
      };
      
      checkDevice();
      window.addEventListener('resize', checkDevice);
      return () => window.removeEventListener('resize', checkDevice);
    }, []);
    
    return isLargeDevice;
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
    // KEY CHANGES for BlogLayout.js - useState declarations
    const [showGlobalHeader, setShowGlobalHeader] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [loadStage, setLoadStage] = useState(1);
    const [contentReady, setContentReady] = useState(!!data); // Use !!data instead of !loading
    const isLargeDevice = useDeviceSize();

    // ADD this new state for preventing layout shift:
    const [layoutReady, setLayoutReady] = useState(false);

  // Add this hook at the top of your component, after imports


    // Memoize portable text components
    const portableTextComponents = useMemo(() => {
      const components = PortableTextComponents();
      components.types.button = components.button; // Ensure custom button type is registered
      return components;
    }, []);

    // KEY CHANGES for BlogLayout.js - main useEffect
    useEffect(() => {
      setMounted(true);
      setLayoutReady(true); // Mark layout as ready immediately
      
      // Mark content as ready if we have data
      if (data && !loading) {
        setContentReady(true);
      }

    // Keep your existing scroll handlers...
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 100;
      setShowGlobalHeader(currentScrollY <= scrollThreshold);
    };

    // Keep your existing beforeunload and load handlers...
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

    // OPTIMIZE loading timers - make them faster:
    const loadTimer1 = setTimeout(() => setLoadStage(2), 10);   // Reduced from 50ms
    const loadTimer2 = setTimeout(() => setLoadStage(3), 50);   // Reduced from 200ms  
    const loadTimer3 = setTimeout(() => setLoadStage(4), 100);  // Reduced from 500ms

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
      clearTimeout(loadTimer1);
      clearTimeout(loadTimer2);
      clearTimeout(loadTimer3);
    };
  }, [data, loading]); // Add 'data' to dependencies

  // Memoize breadcrumb data to prevent re-renders
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
  }, [data, schemaSlugMap]);

  // KEY CHANGES for BlogLayout.js - early return loading section
  if (!layoutReady || (!data && loading)) {
    return (
      <>
        {/* Static navbar to prevent layout shift */}
        <div className="sticky top-0 z-40 w-full bg-white dark:bg-gray-900 shadow-md">
          <div className="container">
            <nav className="flex items-center space-x-2 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 px-4 py-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 h-12">
              <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-4 w-24 rounded"></div>
              <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-4 w-32 rounded"></div>
            </nav>
          </div>
        </div>
        
        <section className="pb-[120px] pt-[18px]"> {/* Adjusted pt to match new header */}
          <div className="container">
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-lg text-gray-700 dark:text-gray-300">Loading article content...</p>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // If data is null/undefined after loading, it means no article found or a persistent error
  // This block remains to handle cases where data fails to load completely
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

  // Keep the rest of your existing code, but ADD this wrapper to prevent layout shift:
  return (
    <div className="min-h-screen"> {/* ADD this wrapper */}
      <ArticleHeader articleTitle={data?.title} isSticky={false} />
      <StickyArticleNavbar articleTitle={data?.title} />
      
      <section className={`overflow-hidden pb-[120px] transition-all duration-500 ease-out ${
        mounted && showGlobalHeader ? 'pt-[38px]' : 'pt-[10px]' // Keep original pt values for main content section
      }`}>
        <div className="container">
        {/* Sticky Navigation Bar - Critical for FCP */}
        
          <article id="main-content" className="lg:m-4 flex flex-wrap">
            {/* Main Article Content - Priority for FCP */}
            <BlogHeader data={data} imgdesc={imgdesc} />
            
            <div className=" mb-4 border-b-2 border-black border-opacity-10 pb-4 dark:border-white dark:border-opacity-10"></div>
            
            <div className="w-full lg:w-8/12">
              <div className="mb-10 mt-4 w-full overflow-hidden rounded article-content">
                {/* Author and Meta Info - Critical for FCP */}
          
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
                    
                    <div className="mb-4  mt-4 border-b-2  border-black border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
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
                  <SmartShimmer
  isLoading={loadStage < 4}
  fallback={<ComponentSkeleton height="600px" />}
  delay={200}
>
  <Suspense fallback={<ComponentSkeleton height="600px" />}>
    <CommentSection
      articleId={data?._id}
      articleSlug={data?.slug?.current}
      articleType={data?._type}
      articleTitle={data?.title}
    />
  </Suspense>
</SmartShimmer>
                </div>

            
              </div>
              
              <TagsAndShare tags={data.tags} />
            </div>

            {/* Blog Sidebar - Load after stage 2 */}
            {/* BlogSidebar - Only load for large devices */}
{isLargeDevice && (
  <SmartShimmer
    isLoading={loadStage < 2}
    fallback={
      <div className="w-full lg:w-4/12 lg:pl-8">
        <ComponentSkeleton height="600px" />
      </div>
    }
    delay={100}
  >
    <Suspense
      fallback={
        <div className="w-full lg:w-4/12 lg:pl-8">
          <ComponentSkeleton height="600px" />
        </div>
      }
    >
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
)}
          </article>

          {/* Related Posts Section - Load after stage 3 */}
          <SmartShimmer
            isLoading={loadStage < 3 || relatedPostsLoading} // Also consider if related posts themselves are loading
            fallback={<ComponentSkeleton height="500px" />}
            delay={150} // Consistent delay with Related Resources
          >
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
                      slidesToShow={3} 
                    />
                  </Suspense>
                </SmartShimmer>
            <Suspense fallback={<ComponentSkeleton height="500px" />}>
              <RelatedPostsSection
                relatedPosts={relatedPosts}
                loading={relatedPostsLoading}
                schemaSlugMap={schemaSlugMap}
                                articleSchemaType={data?._type} // Pass the schema type here

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
    </div> 
  );
};

export default BlogLayout;