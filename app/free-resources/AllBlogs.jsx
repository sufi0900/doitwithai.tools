"use client";
import React, { useEffect, useState } from "react";
import groq from "groq";
import { client } from "@/sanity/lib/client";
import { Grid } from "@mui/material";
import Breadcrumb from "@/components/Common/Breadcrumb";
import SkelCard from "@/components/Blog/Skeleton/Card";
import FeatureSkeleton from "@/components/Blog/Skeleton/FeatureCard";
import VerticalFeaturePost from "./FeatureResourcePost";
import ResourceCard from "./ResourceCard"
import HeroSection from "./HeroSection";
import "animate.css";
export const revalidate = false;
export const dynamic = "force-dynamic";


async function fetchFreeResources(page = 1, limit = 6) {
  const start = (page - 1) * limit;
  const result = await client.fetch(
    groq`*[_type == "freeResources"] | order(publishedAt desc) {
      _id, title, slug, tags, mainImage, overview, resourceType, resourceFormat,
      resourceLink, resourceLinkType, previewSettings,
      "resourceFile": resourceFile.asset->,
      content, publishedAt, promptContent,
      "relatedArticle": relatedArticle->{title, slug}
    }[${start}...${start + limit}]`
  );
  return result;
}

// For fetchResourcesByType
async function fetchResourcesByFormat(format, page = 1, limit = 6) {
  const start = (page - 1) * limit;
  const result = await client.fetch(
    groq`*[_type == "freeResources" && resourceFormat == $format] | order(publishedAt desc) {
      _id, title, slug, tags, mainImage, overview, resourceType, resourceFormat,
      resourceLink, resourceLinkType, 
      "resourceFile": resourceFile.asset->,
      content, publishedAt, promptContent,
      "relatedArticle": relatedArticle->{title, slug},
      previewSettings
    }[${start}...${start + limit}]`,
    { format }
  );
  return result;
}
export default function FreeResourcesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredResources, setFeaturedResources] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState("all"); // Changed from selectedType
 

  // Resource types for filter
  const resourceFormats = [
    { label: "All Resources", value: "all" },
    { label: "Images", value: "image" },
    { label: "Videos", value: "video" },
    { label: "Text/Prompts", value: "text" },
    { label: "Documents", value: "document" }
  ];

  // Fetch featured resources on component mount
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const query = groq`*[_type == "freeResources" && isOwnPageFeature == true] | order(publishedAt desc) {
          _id, title, slug, tags, mainImage, overview, resourceType, resourceFormat,
          resourceLink, resourceLinkType, content, publishedAt,
          resourceFile, promptContent, previewSettings
        }`;
        const featuredData = await client.fetch(query);
        setFeaturedResources(featuredData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch featured resources", error);
        setIsLoading(false);
      }
    };
  
    fetchFeatured();
  }, []);
  // Fetch resources based on selected type and pagination
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let newData;
        if (selectedFormat === "all") {
          newData = await fetchFreeResources(currentPage, 6);
        } else {
          newData = await fetchResourcesByFormat(selectedFormat, currentPage, 6);
        }
        setData(newData);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentPage, selectedFormat]);
  // Pagination handlers
  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentPage((prev) => prev + 1);
  };


// Update your handleSearch function to include the new fields
const handleSearch = async () => {
  if (searchText.trim().length < 3) {
    console.log("Please enter at least 3 characters for search.");
    return;
  }

  try {
    const query = groq`*[_type == "freeResources" && (title match $searchText || overview match $searchText || content[].children[].text match $searchText)] {
      _id, title, slug, tags, mainImage, overview, resourceType, resourceFormat,
      resourceLink, resourceLinkType, 
      "resourceFile": resourceFile.asset->,
      publishedAt, promptContent,
      "relatedArticle": relatedArticle->{title, slug},
      previewSettings
    }`;
    
    const results = await client.fetch(query, {
      searchText: `*${searchText}*`,
    });
    
    setSearchResults(results);
  } catch (error) {
    console.error("Search error:", error);
  }
};
  const resetSearch = () => {
    setSearchText("");
    setSearchResults([]);
  };

  // Filter by type handler
  const handleFormatChange = (format) => {
    setSelectedFormat(format);
    setCurrentPage(1); // Reset to first page when changing filters
    setSearchResults([]); // Clear search results when changing filters
  };

  return (
    <div className="container mt-10">
    <HeroSection/>
    <Breadcrumb
        pageName="Free AI Resources"
        pageName2="Gallery"
        description="Browse our collection of free AI resources including images, videos, templates, and more to enhance your projects. These resources are organized by category and fully searchable."
        link="/free-resources"
        linktext="free-resources"
        firstlinktext="Home"
        firstlink="/"
      />
      {/* Featured Resources */}
      {isLoading ? (
        <Grid item xs={12}>
          <FeatureSkeleton />
        </Grid>
      ) : featuredResources.length > 0 ? (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Featured Resources</h2>
        
            {featuredResources.map((resource) => (
                   <VerticalFeaturePost key={resource._id} resource={resource} />

            ))}
        </div>
      ) : null}
      {/* Search Section */}
      <div className="card mb-10 rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark dark:shadow-none">
    {/* Search Bar */}
    <div className="flex items-center w-full">
        <input
            type="text"
            placeholder="Search resources..."
            className="w-full rounded-sm border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
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
            className="ml-2 flex h-[50px] w-full max-w-[70px] items-center justify-center rounded-sm bg-primary text-white"
            onClick={() => {
                if (searchText.trim() !== "") {
                    handleSearch();
                }
            }}
        >
            <svg
                width="20"
                height="18"
                viewBox="0 0 20 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M19.4062 16.8125L13.9375 12.375C14.9375 11.0625 15.5 9.46875 15.5 7.78125C15.5 6.125 15.0312 4.5625 14.1875 3.1875C13.3438 1.8125 12.25 0.75 10.9062 0.09375C9.5625 -0.03125 8.15625 0 6.9375 0.5C5.6875 1 4.625 1.75 3.75 2.8125C2.9375 3.875 2.375 5.09375 2.25 6.40625C2.125 7.71875 2.375 9.03125 3.0625 10.2188C3.75 11.4062 4.75 12.4062 5.96875 13.0938C7.1875 13.7812 8.5625 14.0938 9.96875 14.0938C11.5938 14.0938 13.1562 13.5 14.4375 12.5L19.9062 17C20.0312 17.0625 20.1562 17.0938 20.25 17.0938C20.375 17.0938 20.5 17.0625 20.5938 16.9688C20.8125 16.8125 20.8125 16.4688 20.5938 16.2812L19.4062 16.8125ZM3.5625 7.125C3.5625 6.03125 3.875 5 4.4375 4.125C5 3.25 5.78125 2.5625 6.75 2.1875C7.71875 1.8125 8.75 1.75 9.75 2C10.75 2.25 11.6562 2.78125 12.375 3.5C13.0938 4.21875 13.5938 5.125 13.8438 6.125C14.0938 7.125 14.0312 8.15625 13.6875 9.125C13.3438 10.0938 12.6562 10.9062 11.8125 11.4688C10.9375 12.0312 9.90625 12.3438 8.8125 12.3438C7.375 12.3438 6 11.7812 4.96875 10.75C3.9375 9.71875 3.5625 8.53125 3.5625 7.125Z"
                    fill="white"
                />
            </svg>
        </button>
        <button
            aria-label="reset button"
            className="ml-2 flex h-[50px] w-full max-w-[70px] items-center justify-center rounded-sm bg-gray-300 text-gray-700"
            onClick={resetSearch}
        >
            Reset
        </button>
    </div>

    {/* Category Buttons */}
  
</div>
<div className="mb-8 flex flex-wrap items-center justify-center space-x-2">
{resourceFormats.map((format) => (
          <button
            key={format.value}
            className={`mb-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              selectedFormat === format.value
                ? 'bg-primary text-white hover:bg-primary/80'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => handleFormatChange(format.value)}
          >
            {format.label}
            </button>
        ))}
      </div>
      {/* Resources Grid */}

{/* Resources Grid */}
{searchResults.length > 0 ? (
  <div className="mb-10">
    <h2 className="text-xl font-bold mb-4">
      Search Results for "{searchText}"
    </h2>
    <div className="flex flex-wrap -mx-3">
      {searchResults.map((resource) => (
        <ResourceCard key={resource._id} resource={resource} />
      ))}
    </div>
  </div>
) : (
  // Render the default grid if no search results
  <div className="mb-10">
    <h2 className="text-xl font-bold mb-4">
    {selectedFormat === "all" ? "All Resources" : `${resourceFormats.find(f => f.value === selectedFormat)?.label}`}
    </h2>
    {loading ? (
      <div className="flex flex-wrap -mx-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="w-full sm:w-1/2 lg:w-1/3 p-3">
            <SkelCard />
          </div>
        ))}
      </div>
    ) : data.length > 0 ? (
      <div className="flex flex-wrap -mx-3">
        {data.map((resource) => (
  <ResourceCard key={resource._id} resource={resource} />
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          No resources found for this category. Try another filter or check back later.
        </p>
      </div>
    )}
  </div>
)}

{/* Pagination */}
{!searchResults.length && data.length > 0 && (
  <div className="flex justify-center items-center space-x-4 mb-10">
    <button 
      onClick={handlePrevious}
      disabled={currentPage === 1}
      className={`px-4 py-2 rounded-md ${
        currentPage === 1 
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      Previous
    </button>
    <span className="text-gray-700 dark:text-gray-300">Page {currentPage}</span>
    <button 
      onClick={handleNext}
      disabled={data.length < 6} // Assuming 6 is your page limit
      className={`px-4 py-2 rounded-md ${
        data.length < 6
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      Next
    </button>
  </div>
)}
    </div>
  );
}