/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import SkelCard from "@/components/Blog/Skeleton/Card"
import { urlForImage } from "@/sanity/lib/image";
import { client } from "@/sanity/lib/client";
import CardComponent from "@/components/Card/Page"
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


export default function MakeMoneyPage() {
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
    const query = `*[_type == "makemoney" && (title match $searchText || overview match $searchText || body match $searchText)]`;
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
        slug={`/ai-learn-earn/${post.slug.current}`}
        publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })}
      />
    ));
  };

  return (
    <PageRefreshProvider pageType="makemoney">
      <GlobalOfflineStatusProvider>
        <div className="container mt-10">
          <Breadcrumb
            pageName="Make Money"
            pageName2="With AI"
            description="Tap into the endless possibilities of AI to generate income while mastering new skills! In this category, we share actionable strategies for turning artificial intelligence into your earning partner. Learn how tools like ChatGPT can simplify tasks, enhance productivity, and open new revenue streams. From freelancing to content creation, discover practical practical ways to transform your financial future while developing valuable AI expertise."
            link="/ai-learn-earn"
            linktext="make-money-with-ai"
            firstlinktext="Home"
            firstlink="/"
          />

          <div className="flex justify-end mb-4">
            <PageRefreshButton />
          </div>

          <ReusableCachedFeaturePost
            documentType="makemoney"
            pageSlugPrefix="ai-learn-earn"
            cacheKey={CACHE_KEYS.PAGE_FEATURE_POST('makemoney')}
          />

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
                {" "}
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
            documentType="makemoney"
            pageSlugPrefix="ai-learn-earn"
            cacheKeyPrefix={CACHE_KEYS.PAGE_ALL_BLOGS('makemoney')}
            onDataLoad={handleAllBlogsDataLoad} // Pass the callback
          />

          <div
            className="wow fadeInUp -mx-4 flex flex-wrap"
            data-wow-delay=".15s"
          >
            <div className="w-full px-4 mb-4">
              <ul className="flex items-center justify-center pt-8">
                <div className="my-8">
                  <nav aria-label="Page navigation example">
                    <ul className="inline-flex -space-x-px text-sm">
                      <li>
                        <button
                          onClick={handlePrevious}
                          disabled={currentPage === 1}
                          className={`flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${currentPage === 1 && 'cursor-not-allowed opacity-50'}`}
                        >
                          Previous
                        </button>
                      </li>

                      <li>
                        <button
                          className={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white 'text-blue-600 `}
                        >
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
}