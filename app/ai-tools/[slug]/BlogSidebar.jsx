"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { client } from "@/sanity/lib/client"; // Import Sanity client
import { urlForImage } from "@/sanity/lib/image"; // Import image URL helper
import SidebarRelatedResources from "@/app/free-ai-resources/SidebarRelatedResources"; // Re-import related resources component
import NewsLatterBox from "@/components/Contact/NewsLatterBox"; // Re-import newsletter box
import RelatedPost from "./RelatedPost"; // Assuming this path is correct for your RelatedPost component

// --- New SidebarLoader Component ---
const SidebarLoader = ({ count = 3 }) => {
  return (
    <ul className="p-6 space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="relative flex items-center space-x-3 animate-pulse overflow-hidden">
          {/* Image/Icon Placeholder */}
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
          {/* Text Content Placeholders */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
               style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite linear' }}></div>
        </li>
      ))}
    </ul>
  );
};
// --- End SidebarLoader Component ---

const BlogSidebar = ({
  relatedPosts,
  relatedPostsLoading,
  relatedResources,
  resourcesLoading,
  schemaSlugMap,
}) => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentData, setRecentData] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false); // Track if a search has been initiated

  // Internal loading states to ensure loaders show immediately
  const [internalRelatedPostsLoading, setInternalRelatedPostsLoading] = useState(true);
  const [internalResourcesLoading, setInternalResourcesLoading] = useState(true);

  // Handle internal loading states
  useEffect(() => {
    if (relatedPosts !== undefined || relatedPostsLoading === false) {
      setInternalRelatedPostsLoading(false);
    }
  }, [relatedPosts, relatedPostsLoading]);

  useEffect(() => {
    if (relatedResources !== undefined || resourcesLoading === false) {
      setInternalResourcesLoading(false);
    }
  }, [relatedResources, resourcesLoading]);

  // Fetch recent posts on component mount
  useEffect(() => {
    const fetchRecentPosts = async () => {
      setRecentLoading(true);
      try {
        const query = `*[_type in ["aitool", "makemoney", "coding", "seo", "freeairesources", "ainews"]] | order(publishedAt desc) [0...3]{
          _id,
          title,
          slug,
          mainImage{
            asset->{
              _id,
              url
            },
            alt
          },
          publishedAt,
          _type
        }`;
        const data = await client.fetch(query);
        setRecentData(data);
      } catch (error) {
        console.error("Failed to fetch recent posts:", error);
        setRecentData([]);
      } finally {
        setRecentLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

  // Handle search functionality - now only triggers on explicit action
  const handleSearch = useCallback(async () => {
    const trimmedSearchText = searchText.trim();

    // Set searchPerformed to true once the user explicitly triggers a search
    setSearchPerformed(true);

    // Condition to require at least 5 characters
    if (trimmedSearchText.length < 5) {
      setSearchResults([]); // Clear previous results
      setSearchLoading(false); // Ensure loader is off
      return; // Exit early if text is too short
    }

    setSearchLoading(true); // Start search loader
    try {
      const query = `*[_type in ["aitool", "makemoney", "coding", "seo", "freeairesources", "ainews"] && (title match "${trimmedSearchText}*" || description match "${trimmedSearchText}*")] {
        _id,
        title,
        slug,
        mainImage{
          asset->{
            _id,
            url
          },
          alt
        },
        publishedAt,
        _type
      }`;
      const results = await client.fetch(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Failed to fetch search results:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false); // End search loader
    }
  }, [searchText]);

  // Reset search
  const resetSearch = useCallback(() => {
    setSearchText("");
    setSearchResults([]);
    setSearchLoading(false); // Ensure loader is off on reset
    setSearchPerformed(false); // Reset search status completely
  }, []);

  // Render search results
  const renderSearchResults = () => {
    // If no search has been performed yet, return null
    if (!searchPerformed) {
      return null;
    }

    const trimmedSearchText = searchText.trim();

    if (searchLoading) {
      return (
        <div className="mb-10 rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark dark:shadow-none">
          <h3 className="border-b border-black border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
            Searching...
          </h3>
          <SidebarLoader count={2} /> {/* Show loader for search results */}
        </div>
      );
    }

    // Message for insufficient characters, only shown IF search was performed
    if (trimmedSearchText.length > 0 && trimmedSearchText.length < 5) {
      return (
        <div className="mb-10 rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark dark:shadow-none">
          <h3 className="border-b border-black border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
            Search
          </h3>
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">Please type at least 5 characters to search.</p>
        </div>
      );
    }

    // Show "No results found" if a search was performed with sufficient characters AND no results were found
    if (searchResults.length === 0 && trimmedSearchText.length >= 5) {
      return (
        <div className="mb-10 rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark dark:shadow-none">
          <h3 className="border-b border-black border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
            Search Results
          </h3>
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">No results found for "{searchText}".</p>
        </div>
      );
    }

    // Show results if available and search was performed with sufficient characters
    if (searchResults.length > 0 && trimmedSearchText.length >= 5) {
      return (
        <div className="mb-10 rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark dark:shadow-none">
          <h3 className="border-b border-black border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
            Search Results
          </h3>
          <ul className="p-8">
            {searchResults.map((blog) => (
              <li key={blog._id} className="mb-6 border-b border-black border-opacity-10 pb-6 dark:border-white dark:border-opacity-10 last:mb-0 last:pb-0 last:border-b-0">
                <RelatedPost
                  title={blog.title}
                  image={blog.mainImage ? urlForImage(blog.mainImage).url() : "/path-to-placeholder-image.jpg"}
                  slug={`/${schemaSlugMap[blog._type]}/${blog.slug?.current || ""}`}
                  date={blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : "Unknown Date"}
                />
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return null; // Fallback: don't render anything if conditions aren't met
  };

  return (
    <div className="w-full px-4 mt-4 lg:w-4/12">
      {/* Search Section */}
      <div className="mb-10 mt-12 rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark dark:shadow-none lg:mt-0">
        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder="Search here..."
            className="mr-4 w-full rounded-sm border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setSearchPerformed(false); // Reset searchPerformed when text changes
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <button
            aria-label="search button"
            className="flex h-[50px] w-full max-w-[50px] items-center justify-center rounded-sm bg-primary text-white"
            onClick={handleSearch} // Now handleSearch directly triggers the logic
          >
            <svg
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.4062 16.8125L13.9375 12.375C14.9375 11.0625 15.5 9.46875 15.5 7.78125C15.5 5.75 14.7188 3.875 13.2812 2.4375C10.3438 -0.5 5.5625 -0.5 2.59375 2.4375C1.1875 3.84375 0.40625 5.75 0.40625 7.75C0.40625 9.78125 1.1875 11.6562 2.625 13.0937C4.09375 14.5625 6.03125 15.3125 7.96875 15.3125C9.875 15.3125 11.75 14.5938 13.2188 13.1875L18.75 17.6562C18.8438 17.75 18.9688 17.7812 19.0938 17.7812C19.25 17.7812 19.4062 17.7188 19.5312 17.5938C19.6875 17.3438 19.6562 17 19.4062 16.8125ZM3.375 12.3438C2.15625 11.125 1.5 9.5 1.5 7.75C1.5 6 2.15625 4.40625 3.40625 3.1875C4.65625 1.9375 6.3125 1.3125 7.96875 1.3125C9.625 1.3125 11.2812 1.9375 12.5312 3.1875C13.75 4.40625 14.4375 6.03125 14.4375 7.75C14.4375 9.46875 13.7188 11.125 12.5 12.3438C10 14.8438 5.90625 14.8438 3.375 12.3438Z"
                fill="white"
              />
            </svg>
          </button>
          <button
            aria-label="reset button"
            className="ml-2 flex h-[50px] w-full max-w-[70px] items-center justify-center rounded-sm bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors"
            onClick={resetSearch}
          >
            Reset
          </button>
        </div>
      </div>
      {/* Render search results or loader */}
      {renderSearchResults()}

      <div className="space-y-8">
        {/* Related Posts Section */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg hover:shadow-xl dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 dark:shadow-gray-900/20 transition-all duration-500">
          {/* Decorative gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative">
            <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-5 bg-gradient-to-r from-blue-50/50 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m0 0l4-4a4 4 0 105.656-5.656l-4 4m-4 4l4-4m0 0l-1.102 1.102" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">
                Related Posts
              </h3>
            </div>

            {(relatedPostsLoading || internalRelatedPostsLoading) ? (
              <SidebarLoader />
            ) : relatedPosts && relatedPosts.length > 0 ? (
              <ul className="p-6 space-y-4">
                {relatedPosts.map((post, index) => (
                  <li key={post._id} className="group/item relative">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-600 scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300 origin-top rounded-full"></div>
                    <div className="pl-4 group-hover/item:pl-6 transition-all duration-300">
                      <RelatedPost
                        title={post.title}
                        image={urlForImage(post.mainImage).url()}
                        slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
                        date={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      />
                    </div>
                    {index < relatedPosts.length - 1 && (
                      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No related posts found.</p>
            )}
          </div>
        </div>

        {/* Related Resources Section - NEW */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg hover:shadow-xl dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 dark:shadow-gray-900/20 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-5 bg-gradient-to-r from-blue-50/50 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m0 0l4-4a4 4 0 105.656-5.656l-4 4m-4 4l4-4m0 0l-1.102 1.102" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">
                Related Resources
              </h3>
            </div>
            {(resourcesLoading || internalResourcesLoading) ? (
              <SidebarLoader />
            ) : (
              <SidebarRelatedResources
                resources={relatedResources}
                isLoading={resourcesLoading}
                maxItems={3}
              />
            )}
          </div>
        </div>

        {/* Recent Posts Section */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg hover:shadow-xl dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 dark:shadow-gray-900/20 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative">
            <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-5 bg-gradient-to-r from-green-50/50 to-emerald-50/30 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">
                Recent Posts
              </h3>
            </div>

            {recentLoading ? (
              <SidebarLoader />
            ) : recentData.length > 0 ? (
              <ul className="p-6 space-y-4">
                {recentData.slice(0, 3).map((post, index) => (
                  <li key={post._id} className="group/item relative">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-green-500 to-emerald-600 scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300 origin-top rounded-full"></div>
                    <div className="pl-4 group-hover/item:pl-6 transition-all duration-300">
                      <RelatedPost
                        title={post.title}
                        image={post.mainImage ? urlForImage(post.mainImage).url() : "/path-to-placeholder-image.jpg"}
                        slug={`/${schemaSlugMap[post._type]}/${post.slug?.current || ""}`}
                        date={post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : "Unknown Date"}
                      />
                    </div>
                    {index < 2 && (
                      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No recent posts found.</p>
            )}

            {/* Explore All Posts Link */}
            <Link href="/blogs" className="block mt-6">
              <div className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-center transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-2 text-lg font-semibold text-white">
                  <span className="text-xl">🚀</span>
                  Explore All Posts
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Popular Categories Section */}
        <div className="group mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg hover:shadow-xl dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 dark:shadow-gray-900/20 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative">
            <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-5 bg-gradient-to-r from-purple-50/50 to-pink-50/30 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">
                Popular Categories
              </h3>
            </div>

            <ul className="p-6 space-y-3">
              {[
                { href: "/ai-tools", icon: "⚙️", label: "AI Tools", gradient: "from-blue-500 to-cyan-500" },
                { href: "/ai-learn-earn", icon: "💰", label: "Learn & Earn With AI", gradient: "from-green-500 to-emerald-500" },
                { href: "/free-ai-resources", icon: "🎁", label: "Free AI Resources", gradient: "from-purple-500 to-violet-500" },
                { href: "/ai-seo", icon: "📈", label: "SEO With AI", gradient: "from-orange-500 to-red-500" },
                { href: "/ai-code", icon: "💻", label: "Code With AI", gradient: "from-indigo-500 to-purple-500" }
              ].map((category, index) => (
                <li key={category.href} className="group/cat">
                  <Link
                    href={category.href}
                    className="flex items-center gap-4 rounded-xl p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 dark:hover:from-gray-700/50 dark:hover:to-gray-600/30 transition-all duration-300 group-hover/cat:scale-[1.02] group-hover/cat:shadow-md"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r ${category.gradient} shadow-lg text-white text-lg group-hover/cat:scale-110 transition-transform duration-300`}>
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <span className="text-base font-semibold text-gray-700 dark:text-gray-300 group-hover/cat:text-primary transition-colors duration-300">
                        {category.label}
                      </span>
                    </div>
                    <svg className="h-5 w-5 text-gray-400 group-hover/cat:text-primary group-hover/cat:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <br/>
      <br/>
      <NewsLatterBox />


      {/* Tailwind CSS keyframes for shimmer effect */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default BlogSidebar;
