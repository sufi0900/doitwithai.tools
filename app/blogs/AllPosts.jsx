/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client"
import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import SkelCard from "@/components/Blog/Skeleton/Card";
import CardComponent from "@/components/Card/Page";
import FilterIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

async function fetchAllBlogs(page = 1, limit = 12, categories = [], sortBy = 'publishedAt desc') {
  const start = (page - 1) * limit;
  const categoryFilter = categories.length > 0 ? `_type in $categories` : `_type in ["makemoney", "aitool", "coding", "seo"]`;
  const query = `*[${categoryFilter}] | order(${sortBy}) {formattedDate, tags, readTime, _id, _type, title, slug, mainImage, overview, body, publishedAt}[${start}...${start + limit}]`;
  const result = await client.fetch(query, { categories: categories.length > 0 ? categories : ["makemoney", "aitool", "coding", "seo"] });
  return result;
}

async function getTotalCount(categories = []) {
  const categoryFilter = categories.length > 0 ? `_type in $categories` : `_type in ["makemoney", "aitool", "coding", "seo"]`;
  const query = `count(*[${categoryFilter}])`;
  const result = await client.fetch(query, { categories: categories.length > 0 ? categories : ["makemoney", "aitool", "coding", "seo"] });
  return result;
}

export default function AllPosts() {
  const schemaSlugMap = {
    makemoney: "ai-learn-earn",
    aitool: "ai-tools",
    coding: "ai-code",
    seo: "ai-seo",
  };

  const categoryDisplayNames = {
    aitool: "AI Tools",
    seo: "AI SEO",
    coding: "AI Code", 
    makemoney: "AI Learn & Earn"
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('publishedAt desc');
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const categories = selectedCategory === 'all' ? [] : [selectedCategory];
      const [newData, count] = await Promise.all([
        fetchAllBlogs(currentPage, 12, categories, sortBy),
        getTotalCount(categories)
      ]);
      
      setAllData(newData);
      setTotalCount(count);
      setLoading(false);
    };
    fetchData();
  }, [currentPage, selectedCategory, sortBy]);

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (allData.length === 12) { // Only enable next if we have full page
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = async () => {
    if (searchText.trim().length < 3) {
      console.log("Please enter at least 3 characters for search.");
      return;
    }
    
    setLoading(true);
    const categories = selectedCategory === 'all' ? ["makemoney", "aitool", "coding", "seo"] : [selectedCategory];
    const query = `*[_type in $categories && (title match $searchText || overview match $searchText)] | order(${sortBy})`;
    
    const searchResults = await client.fetch(query, {
      searchText: `*${searchText}*`,
      categories
    });
    setSearchResults(searchResults);
    setLoading(false);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setSearchResults([]);
    setSearchText("");
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const resetSearch = () => {
    setSearchText("");
    setSearchResults([]);
  };

  const renderSearchResults = () => {
    return searchResults.map((post) => (
      <CardComponent
        key={post._id}
        ReadTime={post.readTime?.minutes}
        overview={post.overview}
        title={post.title}
        tags={post.tags}
        mainImage={urlForImage(post.mainImage).url()}
        slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
        publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        })}
      />
    ));
  };

  const currentData = searchResults.length > 0 ? searchResults : allData;
  const displayCount = searchResults.length > 0 ? searchResults.length : totalCount;

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pb-20 pt-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white">
            <span className="relative inline-block mr-3">
              AI-Powered
              <span className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></span>
            </span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Blog Hub
            </span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
Discover cutting-edge AI insights and articles across our AI-powered categories. Get the best AI tools, SEO strategies, coding techniques, and monetization opportunities. It's your complete resource for mastering AI in the digital world.

          </p>
          
          {/* Stats Bar */}
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{displayCount}+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Articles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">4</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">Weekly</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Updates</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles, topics, or keywords..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchText.trim() !== "") {
                      handleSearch();
                    }
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (searchText.trim() !== "") {
                      handleSearch();
                    }
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Search
                </button>
                {searchText && (
                  <button
                    onClick={resetSearch}
                    className="px-6 py-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-300"
                  >
                    <ClearIcon />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <div className="md:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-300"
              >
                <FilterIcon />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
              <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryFilter('all')}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    All Categories
                  </button>
                  {Object.entries(categoryDisplayNames).map(([key, name]) => (
                    <button
                      key={key}
                      onClick={() => handleCategoryFilter(key)}
                      className={`px-6 py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap ${
                        selectedCategory === key
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-3">
                  <SortIcon className="text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="publishedAt desc">Latest First</option>
                    <option value="publishedAt asc">Oldest First</option>
                    <option value="title asc">A-Z</option>
                    <option value="title desc">Z-A</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {searchResults.length > 0 ? (
                <>Showing <span className="font-semibold text-blue-600">{searchResults.length}</span> search results</>
              ) : (
                <>Showing <span className="font-semibold text-blue-600">{allData.length}</span> of <span className="font-semibold text-blue-600">{totalCount}</span> articles
                {selectedCategory !== 'all' && (
                  <span className="ml-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    {categoryDisplayNames[selectedCategory]}
                  </span>
                )}
                </>
              )}
            </p>
            <CalendarTodayIcon className="text-gray-400" />
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <SkelCard />
              </div>
            ))
          ) : currentData.length > 0 ? (
            currentData.map((post) => (
              <CardComponent
                key={post._id}
                ReadTime={post.readTime?.minutes}
                overview={post.overview}
                title={post.title}
                tags={post.tags}
                mainImage={urlForImage(post.mainImage).url()}
                slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
                publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No articles found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!searchResults.length && (
          <div className="flex justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  currentPage === 1
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-md hover:shadow-lg'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="flex items-center gap-2">
                <span className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg">
                  {currentPage}
                </span>
              </div>

              <button
                onClick={handleNext}
                disabled={allData.length < 12}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  allData.length < 12
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-md hover:shadow-lg'
                }`}
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>
    </section>
  );
}