
import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image"; // Update path if needed
import Link from "next/link";
import SkelCard from "@/components/Blog/Skeleton/Card"

import Image from "next/image";
import { AccessTime, CalendarMonthOutlined } from "@mui/icons-material";
export default  function RecentPosts() {
  const [loading, setLoading] = useState(true);

  const [recentData, setRecentData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
      const query = `*[_type in ["makemoney", "aitool", "news", "coding", "freeairesources", "seo"]]|order(publishedAt desc)[0...5]`;

      const recentData = await client.fetch(query);
      setRecentData(recentData);
      setLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error("Failed to fetch data", error);
      setLoading(false); // Ensure loading is set to false in case of error too
    }
  };

  fetchData();
}, []); 

  const schemaSlugMap = {
    makemoney: "make-money-with-ai",
    aitool: "ai-tools",
    news: "ai-trending-news",
    coding: "code-with-ai",
    freeairesources : "free-ai-resources",
    seo: "seo-with-ai",
  };

  return (
    <section className="pb-[20px] pt-[20px]">
      <div className="container">
        <h1 className="mb-8  text-3xl font-bold tracking-wide text-black dark:text-white sm:text-4xl">
          <span className="relative mr-2 inline-block">
            Recent
            <span className="absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
          </span>
          <span className="text-blue-500">Post</span>
        </h1>
       

        <div className="flex  flex-wrap justify-start">
        {loading ? (
          // Display Skeleton components while loading
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="mx-2 mb-4  flex  flex-wrap justify-start">
              
              <SkelCard />
            </div>
          ))
        ) : (
          recentData.slice(0, 3).map((post) => 
            <div key={post._id} className="mt-4 mb-6 px-2 ">
        <div className="card transition duration-300 hover:scale-[1.05] max-w-sm transform cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white text-black shadow  hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
          {" "}
          <Link
          href={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
            className="relative block aspect-[37/22] w-full"
          >
             {post.tags && post.tags.length > 0 && (
          <Link href={post.tags[0].link} className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold capitalize text-white transition duration-300 hover:bg-stone-50 hover:text-primary">
            {post.tags[0].name} 
          </Link>
        )}

            {/* Image */}
            <div className="relative aspect-[30/22] overflow-hidden">
              <Image
                className="duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5] absolute inset-0 h-full w-full object-cover transition-transform "
                src={urlForImage(post.mainImage).url()}
                alt={post.title}
                fill
              />
            </div>
          </Link>
          {/* Content */}
          <div className="p-5">
            {/* Title */}
            <Link      href={`/${schemaSlugMap[post._type]}/${post.slug.current}`}>
              <h5 className="mb-2 line-clamp-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {post.title}
              </h5>
            </Link>
            {/* Overview */}
            <p className="mb-3 line-clamp-4 font-normal text-gray-700 dark:text-gray-400">
              {post.overview}
            </p>
            {/* Meta Data */}
            <div className="mb-3 mt-3 flex items-center justify-between">
              <div className="flex items-center">
                <AccessTime className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
                <p className="text-sm font-medium text-dark dark:text-white">
                Read Time: {post.readTime?.minutes} min
                </p>
              </div>
              <div className="flex items-center">
                <CalendarMonthOutlined className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
                <p className="text-sm font-medium text-dark dark:text-white">
                {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}

                </p>
              </div>
            </div>
            {/* Read more link */}
            <Link
               href={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
              className="inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Read more
              <svg
                className="ms-2 h-3.5 w-3.5 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </Link>
          </div>
        </div>
            </div>
          ))}
         
        </div>
        <div className="mt-6 flex justify-center md:justify-center">
          <Link href="/allposts">
            <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
             Explore All Blogs
            </button>
            </Link>
          </div>
      </div>
    </section>
  );
};


