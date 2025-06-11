/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import groq from "groq";
import SkelCard from "@/components/Blog/Skeleton/Card"
import FeatureSkeleton from "@/components/Blog/Skeleton/FeatureCard"
import { urlForImage } from "@/sanity/lib/image";
import CardComponent from "@/components/Card/Page"
import { client } from "@/sanity/lib/client";
import { Grid } from "@mui/material";
import FeaturePost from "@/components/Blog/featurePost"
import React, { useEffect, useState, useCallback } from "react"; // Import useCallback
import Breadcrumb from "@/components/Common/Breadcrumb";

// Import the new caching system components
import { PageRefreshProvider } from "@/components/Blog/PageScopedRefreshContext";
import { GlobalOfflineStatusProvider } from "@/components/Blog/GlobalOfflineStatusContext";
import PageRefreshButton from "@/components/Blog/PageSpecificRefreshButton";

// Import reusable components
import ReusableCachedFeaturePost from "@/app/ai-tools/CachedAIToolsFeaturePost";
import ReusableCachedAllBlogs from "@/app/ai-tools/CachedAIToolsAllBlogs";
import { CACHE_KEYS } from '@/components/Blog/cacheKeys';


export const revalidate = false;
export const dynamic = "force-dynamic";

export default function AllBlogs() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [hasMorePages, setHasMorePages] = useState(false); // New state for pagination

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleSearch = async () => {
    if (searchText.trim().length < 1) {
      console.log("Please enter at least 1 character for search.");
      return;
    }
    const query = `*[_type=="aitool" && (title match $searchText || overview match $searchText || body match $searchText)]`;
    const results = await client.fetch(query, {
      searchText: `*${searchText}*`,
    });
    setSearchResults(results);
  };

  const resetSearch = () => {
    setSearchText("");
    setSearchResults([]);
  };

  // Callback to receive hasMore status from ReusableCachedAllBlogs
  const handleAllBlogsDataLoad = useCallback((hasMore) => {
    setHasMorePages(hasMore);
  }, []);

  const renderSearchResults = () => {
    return searchResults.map((post) => (
      <CardComponent
        key={post._id}
        tags={post.tags}
        ReadTime={post.readTime?.minutes}
        overview={post.overview}
        title={post.title}
        mainImage={urlForImage(post.mainImage).url()}
        slug={`/ai-tools/${post.slug.current}`}
        publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })}
      />
    ));
  };

  return (
    <PageRefreshProvider pageType="ai-tools">
      <GlobalOfflineStatusProvider>
        <div className="container mt-10">
          <Breadcrumb
            pageName="Best AI Tools"
            pageName2="for Productivity"
            description="Unlock the power of AI to enhance productivity and creativity like never before!! In this category, we review the best freemium AI tools designed to streamline tasks and boost SEO. Discover smart solutions that transform your workflow, whether you're a digital marketer, SEO professional, or curious beginner. Our insights help you work smarter, save time, and elevate your projects with cutting-edge AI technology."
            firstlinktext="Home"
            firstlink="/"
            link="/ai-tools"
            linktext="ai-tools"
          />

          <div className="flex justify-end mb-4">
            <PageRefreshButton />
          </div>

          <ReusableCachedFeaturePost
            documentType="aitool"
            pageSlugPrefix="ai-tools"
            cacheKey={CACHE_KEYS.PAGE_FEATURE_POST('ai-tools')}
          />

          <div className="container mt-10 px-20 mx-auto">
            <div className="mb-8 text-center">
              <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
                <span className="text-transparent bg-clip-text bg-gradient-to-r to-blue-500 from-primary">
                  SubCategories
                </span>
                of SEO
              </h1>
            </div>
          </div>
          <br /><br />

          <div className="card mb-10 mt-12 rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark dark:shadow-none lg:mt-0">
            <div className="flex items-center justify-between">
              <input
                type="text"
                placeholder="Search here..."
                className="mr-4 w-full rounded-sm border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchText.trim() !== "") {
                    handleSearch();
                  }
                }}
              />
              <button
                aria-label="search button"
                className="flex h-[50px] w-full max-w-[70px] items-center justify-center rounded-sm bg-primary text-white"
                onClick={() => {
                  if (searchText.trim() !== "") {
                    handleSearch();
                  }
                }}
              >
                {""}
              </button>
              <button
                aria-label="reset button"
                className="ml-2 flex h-[50px] w-full max-w-[70px] items-center justify-center rounded-sm bg-gray-300 text-gray-700"
                onClick={resetSearch}
              >
                Reset
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="-mx-4 flex flex-wrap justify-center">
              {renderSearchResults()}
            </div>
          )}

          {/* Pass the callback to ReusableCachedAllBlogs */}
          <ReusableCachedAllBlogs
            currentPage={currentPage}
            limit={10}
            documentType="aitool"
            pageSlugPrefix="ai-tools"
            cacheKeyPrefix={CACHE_KEYS.PAGE_ALL_BLOGS('ai-tools')}
            onDataLoad={handleAllBlogsDataLoad} // Pass the callback
          />

          <div className="wow fadeInUp -mx-4 flex flex-wrap" data-wow-delay=".15s">
            <div className="w-full px-4 mb-4">
              <ul className="flex items-center justify-center pt-8">
                <div className="my-8">
                  <nav aria-label="Page navigation example">
                    <ul className="inline-flex -space-x-px text-sm">
                      <li>
                        <button
                          onClick={handlePrevious}
                          disabled={currentPage === 1}
                          className={`flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${
                            currentPage === 1 && 'cursor-not-allowed opacity-50'
                          }`}
                        >
                          <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
                          </svg>
                          Previous
                        </button>
                      </li>
                      <li>
                        <button className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white text-blue-600">
                          {currentPage}
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={handleNext}
                          disabled={!hasMorePages || searchResults.length > 0} // Use new hasMorePages state
                          className={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${
                            (!hasMorePages || searchResults.length > 0) ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                        >
                          Next
                          <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                          </svg>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </ul>
            </div>
          </div>
        </div>
      </GlobalOfflineStatusProvider>
    </PageRefreshProvider>
  );
};