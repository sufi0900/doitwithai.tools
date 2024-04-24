"use client";

// app/pages/blog/page.jsx

import { useState, useEffect } from "react";
import SingleBlog from "@/components/Blog/SingleBlog";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { client } from "../../sanity/lib/client";
import { useRouter } from "next/navigation";
import groq from "groq";

export const revalidate = false;
export const dynamic = "force-dynamic";

const pageSize = 100;
const maxVisiblePages = 2;

let lastId = "";
let lastPublishedAt = "";

async function fetchNextPage() {
  if (lastId === null) {
    return [];
  }

  const result = await client.fetch(
    groq`*[_type == "blog" && (
      publishedAt > $lastPublishedAt
      || (publishedAt == $lastPublishedAt && _id > $lastId)
    )] | order(publishedAt) [0...${pageSize - 1}] {
      _id, title, slug, mainImage, overview, body, publishedAt
    }`,
    { lastPublishedAt, lastId },
  );

  if (result.length > 0) {
    lastPublishedAt = result[result.length - 1].publishedAt;
    lastId = result[result.length - 1]._id;
  } else {
    lastId = null; // Reached the end
  }
  return result;
}

export default function AllPosts() {
  const router = useRouter();
  const { query } = router;
  const initialPage = query && query.page ? parseInt(query.page) : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [data, setData] = useState([]);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  useEffect(() => {
    async function fetchData() {
      const newData = await fetchNextPage();
      setData(newData);
    }

    fetchData();

    async function fetchTotalBlogs() {
      const totalBlogsQuery = `count(*[_type == "blog"])`;
      const totalBlogsCount = await client.fetch(totalBlogsQuery);
      setTotalBlogs(Math.ceil(totalBlogsCount / pageSize));
    }

    fetchTotalBlogs();
  }, [currentPage]);
  // Function to handle search
  const handleSearch = async () => {
    if (searchText.trim().length < 4) {
      // Alert the user or handle the scenario as per your requirement
      console.log("Please enter at least 4 characters for search.");
      return; // Exit the function if searchText is too short
    }
    const query = `*[_type == "blog" && (title match $searchText || content match $searchText)]`;
    const searchResults = await client.fetch(query, {
      searchText: `*${searchText}*`,
    });
    setSearchResults(searchResults);
  };

  // Function to reset search
  const resetSearch = () => {
    setSearchText("");
    setSearchResults([]);
  };

  // Render search results
  const renderSearchResults = () => {
    return searchResults.map((blog) => <SingleBlog key={blog.id} {...blog} />);
  };
  const handlePagination = (page) => {
    // Set current page state
    setCurrentPage(page);
    // Update the current URL without refreshing the page
    router.replace(`/blog?page=${page}`, undefined, { scroll: false });
  };

  const renderPageButtons = () => {
    const totalPages = Math.ceil(totalBlogs / pageSize);
    const visiblePages = Math.min(totalPages, maxVisiblePages);
    const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const end = Math.min(start + maxVisiblePages - 1, totalPages);

    const buttons = [];

    // Add Prev button
    if (currentPage > 1) {
      buttons.push(
        <li key="prev" className="mx-1">
          <button
            className={`flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white`}
            onClick={() => handlePagination(currentPage - 1)}
          >
            Prev
          </button>
        </li>,
      );
    }

    // Add first page number
    buttons.push(
      <li key={1} className="mx-1">
        <button
          className={`flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white ${
            1 === currentPage ? "font-bold" : ""
          }`}
          onClick={() => handlePagination(1)}
        >
          1
        </button>
      </li>,
    );

    // Add ellipsis if needed
    if (start > 2) {
      buttons.push(
        <li key="ellipsis-start" className="mx-1">
          <span className="flex h-9 min-w-[36px] cursor-not-allowed items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color">
            ...
          </span>
        </li>,
      );
    }

    // Add middle page numbers
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        buttons.push(
          <li key={i} className="mx-1">
            <button
              className={`flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white ${
                i === currentPage ? "font-bold" : ""
              }`}
              onClick={() => handlePagination(i)}
            >
              {i}
            </button>
          </li>,
        );
      }
    }

    // Add ellipsis if needed
    if (end < totalPages - 1) {
      buttons.push(
        <li key="ellipsis-end" className="mx-1">
          <span className="flex h-9 min-w-[36px] cursor-not-allowed items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color">
            ...
          </span>
        </li>,
      );
    }

    // Add last page number
    if (totalPages > 1) {
      buttons.push(
        <li key={totalPages} className="mx-1">
          <button
            className={`flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white ${
              totalPages === currentPage ? "font-bold" : ""
            }`}
            onClick={() => handlePagination(totalPages)}
          >
            {totalPages}
          </button>
        </li>,
      );
    }

    // Add Next button
    if (currentPage < totalPages) {
      buttons.push(
        <li key="next" className="mx-1">
          <button
            className={`flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white`}
            onClick={() => handlePagination(currentPage + 1)}
          >
            Next
          </button>
        </li>,
      );
    }

    return buttons;
  };

  return (
    <>
      {/* <Breadcrumb
        pageName="Blog Grid"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. In varius eros eget sapien consectetur ultrices. Ut quis dapibus libero."
      /> */}

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          {/* Search Input */}
          <div className="card mb-10 mt-12 rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark dark:shadow-none lg:mt-0">
            <div className=" flex items-center justify-between">
              <input
                type="text"
                placeholder="Search here..."
                className="mr-4 w-full rounded-sm border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
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

          {/* Render search results if available */}
          {searchResults.length > 0 && (
            <div className="-mx-4 flex flex-wrap justify-center">
              {renderSearchResults()}
            </div>
          )}

          {/* Render blog posts */}
          <div className="-mx-4 flex flex-wrap justify-center">
            {/* Conditionally render search results within the loop */}
            {data.map((blog) => (
              <SingleBlog key={blog.id} {...blog} />
            ))}
          </div>

          <div
            className="wow fadeInUp -mx-4 flex flex-wrap"
            data-wow-delay=".15s"
          >
            <div className="w-full px-4">
              <ul className="flex items-center justify-center pt-8">
                {renderPageButtons()}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
