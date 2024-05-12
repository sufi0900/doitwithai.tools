
"use client"
import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image"; // Update path if needed

import BlogCard from "./Card"
import SkelCard from "@/components/Blog/Skeleton/Card"
import CardComponent from "@/components/Card/Page"



  async function fetchAllBlogs(page = 1, limit = 5, categories = []) {
    const start = (page - 1) * limit;
    const query = `*[_type in $categories] | order(publishedAt desc) {formattedDate, tags, readTime , _id, _type, title, slug, mainImage, overview, body, publishedAt }[${start}...${start + limit}]`;
    const result = await client.fetch(query, { categories });
    return result;
  }
  
  export default  function Allposts() {
    const schemaSlugMap = {
        makemoney: "earning",
        aitool: "tools",
        news: "news",
        coding: "coding",
        freeairesources: "free-resources",
        seo: "seo",
      }

    
    const [currentPage, setCurrentPage] = useState(1);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allData, setAllData] = useState([]);
  
    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        const newData = await fetchAllBlogs(currentPage, 5, [
          "makemoney",
          "aitool",
          "news",
          "coding",
          "freeairesources",
          "seo",
        ]);
        
        setAllData(newData);
        setLoading(false);
      };
      fetchData();
      
    }, [currentPage]);
  
    const handlePrevious = () => {
      setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
    };
  
    const handleNext = () => {
      setCurrentPage((prev) => prev + 1);
    };
  
    const handleSearch = async () => {
        if (searchText.trim().length < 4) {
          console.log("Please enter at least 4 characters for search.");
          return;
        }
        const query = `*[_type in ["makemoney", "aitool", "news", "coding", "freeairesources", "seo"] && (title match $searchText || content match $searchText)] | order(publishedAt desc)`;

        const searchResults = await client.fetch(query, {
          searchText: `*${searchText}*`,
        });
        setSearchResults(searchResults);
      };
      
      const renderSearchResults = () => {
        return searchResults.map((post) =><CardComponent
        key={post._id}
        ReadTime={post.readTime?.minutes} 
        overview={post.overview}
        title={post.title}
        tags={post.tags} 
        mainImage={urlForImage(post.mainImage).url()}
        slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
        publishedAt= {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}         
       />);
      };
      
  
    const resetSearch = () => {
      setSearchText("");
      setSearchResults([]);
    };
  



  return (
    <section className="pb-[20px] pt-[20px]">
    <div className="container">
      <h1 className="mb-6 text-3xl font-bold tracking-wide text-black dark:text-white sm:text-4xl">
        <span className="relative mr-2 inline-block">
          All
          <span className="absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
        </span>
        <span className="text-blue-500">Post</span>
      </h1>
      <div className="card mb-10 mt-12 rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark dark:shadow-none lg:mt-0">
            <div className=" flex items-center justify-between">
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
                  // Check if searchText is not empty before executing search
                  if (searchText.trim() !== "") {
                    handleSearch();
                  }
                }}
              >
                {" "}
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
                className="ml-2 flex h-[50px] w-full max-w-[70px] items-center justify-center rounded-sm bg-gray-300   text-gray-700"
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
                    <div className="-mx-4 flex flex-wrap justify-center">

      {loading ? (
          // Display Skeleton components while loading
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="mx-2 mb-4  flex flex-wrap justify-center">
              <SkelCard />
            </div>
          ))
        ) : (
        allData.map((post) =>
          <CardComponent
          key={post._id}
          ReadTime={post.readTime?.minutes} 
          overview={post.overview}
          title={post.title}
          tags={post.tags} 
          mainImage={urlForImage(post.mainImage).url()}
          slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
          publishedAt= {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}         
         />
        )
      )}
  </div>

      
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
          <svg class="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
    </svg>
          Previous
          
        </button>
      </li>
      
        <li >
          <button
           
            className={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white  'text-blue-600 `}
          >
        {currentPage}
          </button>
        </li>
   
        <li>
  <button
    onClick={handleNext}
    disabled={allData.length === 0 || allData.length < 2}
    className={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${allData.length === 0 || allData.length < 2 ? 'cursor-not-allowed opacity-50' : ''}`}
  >
    Next
    <svg class="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
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
  </section>
  );
};

