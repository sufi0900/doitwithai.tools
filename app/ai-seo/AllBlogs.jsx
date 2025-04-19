/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import SkelCard from "@/components/Blog/Skeleton/Card"
import FeatureSkeleton from "@/components/Blog/Skeleton/FeatureCard"
import groq from "groq";

import { urlForImage } from "@/sanity/lib/image";

import { client } from "@/sanity/lib/client";
import {Grid} from "@mui/material";
import CardComponent from "@/components/Card/Page"

import FeaturePost from "@/components/Blog/featurePost"
import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
export const revalidate = false;
export const dynamic = "force-dynamic";


async function fetchAllBlogs(page = 1, limit = 10) {
  const start = (page - 1) * limit;
  const result = await client.fetch(
    groq`*[
      _type == "seo" || 
      (_type == "aitool" && displaySettings.isSeoPageFeature == true)
    ] | order(publishedAt desc) {
      _id, 
      title, 
      slug, 
      tags, 
      mainImage, 
      overview, 
      body, 
      publishedAt,
      _type,
      readTime,
      "displaySettings": displaySettings,
      subcategory->{
        title,
        slug
      }
    }[${start}...${start + limit}]`
  );
  console.log("Fetched blogs:", result); // Debug log
  return result;
}

// Separate function to fetch subcategories
async function getSubcategories() {
  const query = groq`*[_type == "seoSubcategory"] {
    title,
    slug,
    description
  }`;
  return client.fetch(query);
}

export default function AllBlogs() {
  const [isLoading, setIsLoading] = useState(true);
  const [subcategories, setSubcategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiToolTrendBigData, setAiToolTrendBigData] = useState([]);

  // Fetch subcategories and feature posts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch subcategories
        const subcategoriesData = await getSubcategories();
        setSubcategories(subcategoriesData);

        // Fetch featured posts
        const featuredQuery = groq`*[_type == "seo" && displaySettings.isOwnPageFeature == true] {
          _id,
          title,
          overview,
          mainImage,
          slug,
          publishedAt,
          readTime,
          tags,
          "displaySettings": displaySettings
        }`;
        const featuredPosts = await client.fetch(featuredQuery);
        setAiToolTrendBigData(featuredPosts);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);
  // Fetch blogs
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const newData = await fetchAllBlogs(currentPage, 10);
        console.log('Fetched Data:', newData); // Debug log
        setData(newData);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
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
    setLoading(true);
    try {
      const searchQuery = groq`*[
        (_type == "seo" || (_type == "aitool" && displaySettings.isSeoPageFeature == true)) &&
        (title match $searchText || overview match $searchText)
      ] | order(publishedAt desc) {
        _id,
        title,
        slug,
        tags,
        mainImage,
        overview,
        publishedAt,
        _type,
        readTime,
        "displaySettings": displaySettings
      }`;
      
      const results = await client.fetch(searchQuery, { searchText: `*${searchText}*` });
      setSearchResults(results);
      setData(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
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
      slug={`/seo/${post.slug.current}`}
      publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })}
    />
    ));
  };

 
  return (
    <div className="container mt-10 ">
        <Breadcrumb
          pageName="AI in SEO"
          pageName2="& Digital Marketing"
          description="AI is revolutionizing how we approach SEO and digital marketing, making it smarter, faster, and more effective! In our blog, you'll find the knowledge and tools necessary to successfully integrate AI into your SEO and marketing strategies. Learn how ChatGPT and other AI tools can help generate quality content, conduct keyword research, and craft data-driven campaigns. Our practical guides help you improve rankings, target the right audience, and navigate the evolving digital landscape with confidence."
          link="/seo" 
          linktext="seo-with-ai"
          firstlinktext="Home"
          firstlink="/"

        />


{isLoading ? (
                      <Grid item xs={12}  >
<FeatureSkeleton/>
</Grid>
 ) : (
  
        aiToolTrendBigData.map((post) => (
          <Grid        key={post} item xs={12}  >
        <FeaturePost
         key={post}
         title={post.title}
         overview={post.overview}
         mainImage={urlForImage(post.mainImage).url()}
         slug={`/seo/${post.slug.current}`}
         date={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
         readTime={post.readTime?.minutes}
         tags={post.tags}
         />
       
      
            </Grid>
          )) )}  

<div className="container mt-10 px-20 mx-auto">
  {/* Title */}
  <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-blue-500 from-primary">Sub Categories</span> of SEO</h1>
        </div>

  {/* Grid of cards */}
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {subcategories.map((subcategory) => (
      <Link
        href={`/seo/categories/${subcategory.slug.current}`}
        key={subcategory.slug.current}
        className="card hover:shadow-lg mt-4 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:scale-[1.03] max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow"
      >
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          {subcategory.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-3">{subcategory.description}</p>
        <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          Read more
          <svg
            className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </button>
      </Link>
    ))}
  </div>
</div>
        <br/>
        <br/>
   
   {/* category code start */}
      <div className="card mb-10 mt-12 rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark dark:shadow-none lg:mt-0">
            <div className="  flex items-center justify-between">
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
   {/* category code end/}

          {/* Render search results if available */}
          {searchResults.length > 0 && (
            <div className="-mx-4 flex flex-wrap justify-center">
              {renderSearchResults()}
            </div>
          )}

          {/* Render blog posts */}
          <div className="-mx-4 flex flex-wrap justify-center">
            {/* Conditionally render search results within the loop */}
            
 {loading ? (
  Array.from({ length: 6 }).map((_, index) => (
    <div key={index} className="mx-2 mb-4 flex flex-wrap justify-center">
      <SkelCard />
    </div>
  ))
) : (
  data.map((post) => {
    console.log("Rendering post:", post); // Debug log
    return (
      <CardComponent
        key={post._id}
        ReadTime={post.readTime?.minutes} 
        overview={post.overview}
        title={post.title}
        tags={post.tags} 
        mainImage={post.mainImage ? urlForImage(post.mainImage).url() : '/default-image.jpg'}
        slug={`/${post._type === "seo" ? "ai-seo" : "ai-tools"}/${post.slug.current}`}
        publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        })}         
      />
    );
  })
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
    disabled={data.length === 0 || data.length < 2}
    className={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${data.length === 0 || data.length < 2 ? 'cursor-not-allowed opacity-50' : ''}`}
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
  );
};


