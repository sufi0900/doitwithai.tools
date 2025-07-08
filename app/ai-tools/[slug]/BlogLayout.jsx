"use client"
import React, { useState, useEffect } from 'react';
import BlogHeader from './BlogHeader';
import TableOfContents from './TableOfContents';
import FAQSection from './FAQSection';
import TagsAndShare from './TagsAndShare';
import RelatedPostsSection from './RelatedPostsSection';
import ReadingProgressCircle from "@/app/ai-seo/[slug]/ReadingProgressCircle";
import RelatedResources from "@/app/free-ai-resources/RelatedResources";
import { PortableText } from "@portabletext/react";
import PortableTextComponents from './createPortableTextComponents';
import RecentPost from "@/components/RecentPost/RecentHome";
import BlogSidebar from "./BlogSidebar"
import CongratsPopup from "./CongratsPopup"
import ArticleHeader from './ArticleHeader';
import StickyArticleNavbar from './StickyArticleNavbar';
import Link from 'next/link';
import Image from 'next/image';

import { AccessTime, CalendarMonthOutlined } from '@mui/icons-material';
import SlugSkeleton from '@/components/Blog/Skeleton/SlugSkeleton';


const BlogLayout = ({
    data,
    loading,
    relatedPosts,
    relatedPostsLoading,
    relatedResources,
    resourcesLoading,
    schemaSlugMap,
    imgdesc,

}) => {
    const [showGlobalHeader, setShowGlobalHeader] = useState(true);
    const [mounted, setMounted] = useState(false);

    const portableTextComponents = PortableTextComponents();
    portableTextComponents.types.button = portableTextComponents.button;


    
    useEffect(() => {
        setMounted(true);

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollThreshold = 100; // Same threshold as ConditionalGlobalHeader

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

        // Initial check
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('load', handleLoad);
        };
    }, []);

    if (loading && !data) {
        return <SlugSkeleton />; // Assuming SlugSkeleton is defined elsewhere
    }

    // Derive currentPostId and currentPostType here to ensure consistent cache keys
    // This assumes `data` prop is always available when this component renders beyond the initial loading state.
    const currentPostId = data?._id;
    const currentPostType = data?._type;

    return (
        <>
            <ArticleHeader articleTitle={data?.title} isSticky={false} />

            {/* Sticky Article Navbar */}
            <StickyArticleNavbar articleTitle={data?.title} />

            <section
                className={`overflow-hidden pb-[120px] transition-all duration-500 ease-out ${
                    mounted && showGlobalHeader ? 'pt-[104px]' : 'pt-[40px]'
                }`}
            >
                <div className="container">
                    {/* Sticky Navigation Bar */}
                    <nav
                        aria-label="Breadcrumb"
                        className="mb-8 sticky top-0 z-40 w-full bg-white dark:bg-gray-900 shadow-md transition-all duration-300"
                    >
                        <ol className="flex items-center space-x-2 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 px-4 py-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                            <li>
                                <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 flex items-center">
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
                                <Link
                                    href={`/${schemaSlugMap[data?._type] === 'ai-learn-earn' ? 'ai-learn-earn' : schemaSlugMap[data._type]}`}
                                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                                >
                                    {data._type === "aitool" ? "AI Tools" :
                                        data._type === "makemoney" ? "AI Learn & Earn" :
                                            data._type === "coding" ? "AI Code" :
                                                data._type === "seo" ? "AI SEO" :
                                                    data._type === "freeairesources" ? "Free AI Resources" : "AI News"}
                                </Link>
                            </li>
                            <li className="flex items-center">
                                <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                </svg>
                                <span className="text-gray-900 dark:text-white font-medium bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-md text-xs" aria-current="page">
                                    {data.title.length > 50 ? `${data.title.substring(0, 50)}...` : data.title}
                                </span>
                            </li>
                        </ol>
                    </nav>

                    <article id="main-content" className="lg:m-4 flex flex-wrap">
                        {/* Main Article Content - Wrapped with ComponentTracker */}
                        {/* <ComponentTracker
                            componentId="main-content"
                            schemaType={currentPostType} // Pass the actual schema type of the article
                            status={articleCacheStatus}
                            isFromCache={articleIsFromCache}
                            source={articleIsFromCache ? 'cache' : 'api'} // Deduce source
                            hasUpdatesAvailable={articleHasUpdatesAvailable}
                            // FIXED: Ensure cacheKey matches what useAdvancedPageCache generates
                            cacheKey={`article_content_${currentPostType}_${currentPostId}_${data?.slug.current}`}
                            itemCount={data ? 1 : 0}
                        > */}
                            <BlogHeader data={data} imgdesc={imgdesc} />

                            <div className="customanchor mb-4 mt-4 border-b-2 border-black border-opacity-10 pb-4 dark:border-white dark:border-opacity-10"></div>

                            <div className="w-full lg:w-8/12">
                                <div className="mb-10 mt-4 w-full overflow-hidden rounded article-content">
                                    <div className="mb-10 flex flex-nowrap items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg shadow-sm overflow-x-auto space-x-6">
                                        <div className="flex items-center shrink-0">
                                            <div className="relative mr-4 h-12 w-12 overflow-hidden rounded-full ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 transition-all duration-300 group-hover:ring-4">
                                                <Link href="/author/sufian-mustafa">
                                                    <Image
                                                        src="/sufi.png"
                                                        alt="Sufian Mustafa - AI Tools Expert"
                                                        fill
                                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
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

                                        {/* Meta Info: Date, Time, Tag */}
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

                                            <div>
                                                <p className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white whitespace-nowrap">
                                                    {data.tags &&
                                                        data.tags.slice(0, 1).map((tag) => (
                                                            <Link key={tag.name} href={tag.link} className="tag">
                                                                {tag.name}
                                                            </Link>
                                                        ))}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <ReadingProgressCircle />

                                    {loading  && (
                                        <div className="flex items-center justify-center py-4 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                                            <span className="text-sm text-blue-600 dark:text-blue-400">Refreshing article content...</span>
                                        </div>
                                    )}
                                    <div className="relative w-full">
                                        {/* Show skeleton overlay when article is loading during refresh */}
                                        {loading  && (
                                            <div className="absolute inset-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                                                <SlugSkeleton />
                                            </div>
                                        )}
                                        <div className={loading ? 'opacity-20' : 'opacity-100'}>

                                            <TableOfContents tableOfContents={data.tableOfContents} />

                                            <div className="customanchor mb-4 mt-4 border-b-2 border-black border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
                                                <PortableText
                                                    value={data.content}
                                                    components={portableTextComponents}
                                                />
                                            </div>

                                            <FAQSection faqs={data.faqs} />
                                        </div>
                                    </div>
                          
  <RelatedResources
    resources={relatedResources}
    isLoading={resourcesLoading}
    slidesToShow={2}
  />
                                </div>

                                <TagsAndShare tags={data.tags} />
                            </div>
                      <BlogSidebar
  relatedPosts={relatedPosts}
  relatedPostsLoading={relatedPostsLoading}
  relatedResources={relatedResources}
  resourcesLoading={resourcesLoading}
  schemaSlugMap={schemaSlugMap}
  // ADD THESE CRITICAL PROPS:
  currentPostId={currentPostId}
  currentPostType={currentPostType}
  
/>
                    </article>


  <RelatedPostsSection
    relatedPosts={relatedPosts}
    loading={relatedPostsLoading}
    schemaSlugMap={schemaSlugMap}
  />

                    <div className="border-b-2 border-black border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
                        <RecentPost />
                    </div>
                </div>

            </section>
        </>
    );
};

export default BlogLayout;