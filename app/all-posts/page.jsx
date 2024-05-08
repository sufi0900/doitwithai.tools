
"use client"
import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image"; // Update path if needed
import SkelCard from "@/components/Blog/Skeleton/Card"
import CardComponent from "@/components/Card/Page"
  async function fetchAllBlogs(page = 1, limit = 5, categories = []) {
    const start = (page - 1) * limit;
    const query = `*[_type in $categories] | order(publishedAt desc) {formattedDate, tags, readTime , _id, _type, title, slug, mainImage, overview, body, publishedAt }[${start}...${start + limit}]`;
    const result = await client.fetch(query, { categories });
    return result;
  }
  
  export default  function Allposts() {
   

    
    const [currentPage, setCurrentPage] = useState(1);
  
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
 
  
    const schemaSlugMap = {
      makemoney: "make-money-with-ai",
      aitool: "ai-tools",
      news: "ai-trending-news",
      coding: "code-with-ai",
      freeairesources: "free-ai-resources",
      seo: "seo-with-ai",
    }


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

