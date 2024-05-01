/* eslint-disable react/no-unescaped-entities */
"use client";
import { client } from "@/sanity/lib/client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image"; // Update path if needed
import {
  Card,
  CardContent,

  Grid,
 
  CardMedia,
 
} from "@mui/material";
import {  CalendarMonthOutlined, LocalOffer,  } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
const News = () => {
  // Define the static web dev blogs


  const [newsTrendBigData, setNewsTrendBigData] = useState([]);
  const [newsTrendRelatedData, setNewsTrendRelatedData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
    
      const isHomePageNewsTrendBig = `*[_type == "news" && isHomePageNewsTrendBig == true]`;
      const isHomePageNewsTrendRelated = `*[_type == "news" && isHomePageNewsTrendRelated == true]`;

      const isHomePageNewsTrendBigData = await client.fetch(isHomePageNewsTrendBig);
      const isHomePageNewsTrendRelatedData = await client.fetch(isHomePageNewsTrendRelated);
 


      setNewsTrendBigData(isHomePageNewsTrendBigData);
      setNewsTrendRelatedData(isHomePageNewsTrendRelatedData);
     
     
    };

    fetchData();
  }, []);
  return (
    <section>
      <div className="container">
        <Breadcrumb
          pageName="AI News"
          pageName2="& Trends"
          description="Are you curious about the latest breakthroughs in artificial intelligence? Look no further! Our blog keeps you at the forefront of AI news and trends.  We deliver in-depth analysis of cutting-edge AI developments, from OpenAI's advancements to the impact of AI on various industries. Explore the exciting possibilities of AI and its potential to reshape our world!"
          firstlinktext="Home"
          firstlink="/"
          link="/ai-trending-news" 
          linktext="ai-trending-news"
        />
        <Grid container spacing={2}>
         
          <Grid item xs={12} md={3}>
            <Grid container spacing={2}>
              {newsTrendRelatedData.slice(2, 4).map((post) => (
                <Grid key={post._id} item xs={12}>
                  <Card
                  
                  className="  cursor-pointer     overflow-visible transition duration-200 ease-in-out hover:scale-105 card rounded-lg bg-white text-black shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">

                    <Box position="relative">
                    <div className="relative aspect-[37/22] overflow-visible">
          <img
            className="absolute rounded-lg inset-0 h-full w-full object-cover transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5]"
            src={urlForImage(post.mainImage).url()}

            alt={post.title}
          />
        </div>
                      <span
                        style={{
                          position: "absolute",
                          top: 16, // Distance from the top of the image
                          right: 16, // Distance from the right edge of the image
                          borderRadius: "9999px", // rounded-full
                          backgroundColor: " #2b6cb0", // bg-blue-100
                          padding: "0.25rem 0.75rem", // px-3 py-1
                          fontSize: "0.75rem", // text-xs
                          fontWeight: "600", // font-semibold
                          color: "#ebf8ff", // text-blue-800
                          transition: "all 300ms", // duration-300
                        }}
                        className="hover:bg-blue-200 hover:text-blue-900 dark:bg-blue-200 dark:text-blue-900 dark:hover:bg-blue-300 dark:hover:text-blue-800"
                      >
                        <LocalOffer fontSize="small" /> Tag
                      </span>
                    </Box>
                    <CardContent>
                      <h5 className="mb-2 line-clamp-2  text-base font-medium  leading-relaxed  tracking-wide text-black dark:text-white sm:text-lg sm:leading-tight">
                        {post.title} {post.title} {post.title} {post.title}{" "}
                        {post.title}
                      </h5  >
                      <div className="mb-3 mt-3 flex items-center justify-start gap-2">
<div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
<CalendarMonthOutlined className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
<p className="text-xs font-medium text-gray-600 dark:text-gray-400">06/12/2024</p>
</div>
<div className="flex items-center">
<AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
<p className="text-xs font-medium text-gray-600 dark:text-gray-400">Read Time: 5 min</p>
</div>
</div>

                      <Link
                         href={`/ai-trending-news/${post.slug.current}`}

                        className="mt-1 inline-flex items-center rounded-lg bg-blue-700 px-3 py-1 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      >
                        Read more
                        <svg
                          className="ms-2 h-3 w-3 rtl:rotate-180"
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

                    
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
     
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {newsTrendBigData.slice(0, 1).map((post) => (
                <Grid key={post._id} item xs={12}>
                 <Card className="cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                <CardMedia
                  component="img"
                  src={urlForImage(post.mainImage).url()}
                  alt={post.title}
                  sx={{ height: 350, objectFit: "cover" }}
                />
                <CardContent>
                <h1 className="mb-4 line-clamp-2 text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-3xl sm:leading-tight">
    {post.title}   {post.title}   {post.title}
  </h1>
  <p className="mb-4 line-clamp-4 text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg lg:text-base xl:text-lg">

    {post.overview}
  </p>
  <div className="mb-3 mt-3 flex items-center justify-start gap-2">
  <div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
    <CalendarMonthOutlined className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">06/12/2024</p>
  </div>
  <div className="flex items-center">
    <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Read Time: 5 min</p>
  </div>
</div>
  <Link
                         href={`/ai-trending-news/${post.slug.current}`}
                         className="mt-4 mb-1 inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
              
</CardContent>

              </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item xs={12} md={3}>
            <Grid container spacing={2}>
              {newsTrendRelatedData.slice(2, 4).map((post) => (
                <Grid key={post._id} item xs={12}>
  <Card
                  
                  className="  cursor-pointer     overflow-visible transition duration-200 ease-in-out hover:scale-105 card rounded-lg bg-white text-black shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">

                    <Box position="relative">
                    <div className="relative aspect-[37/22] overflow-visible">
          <img
            className="absolute rounded-lg inset-0 h-full w-full object-cover transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5]"
            src={urlForImage(post.mainImage).url()}
            alt={post.title}
          />
        </div>
                    
                      <span
                        style={{
                          position: "absolute",
                          top: 16, // Distance from the top of the image
                          right: 16, // Distance from the right edge of the image
                          borderRadius: "9999px", // rounded-full
                          backgroundColor: " #2b6cb0", // bg-blue-100
                          padding: "0.25rem 0.75rem", // px-3 py-1
                          fontSize: "0.75rem", // text-xs
                          fontWeight: "600", // font-semibold
                          color: "#ebf8ff", // text-blue-800
                          transition: "all 300ms", // duration-300
                        }}
                        className="hover:bg-blue-200 hover:text-blue-900 dark:bg-blue-200 dark:text-blue-900 dark:hover:bg-blue-300 dark:hover:text-blue-800"
                      >
                        <LocalOffer fontSize="small" /> Tag
                      </span>
                    </Box>
                    <CardContent>
                      <h5 className="mb-2 line-clamp-2  text-base font-medium  leading-relaxed  tracking-wide text-black dark:text-white sm:text-lg sm:leading-tight">
                        {post.title} {post.title} {post.title} {post.title}{" "}
                        {post.title}
                      </h5  >
                      <div className="mb-3 mt-3 flex items-center justify-start gap-2">
<div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
<CalendarMonthOutlined className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
<p className="text-xs font-medium text-gray-600 dark:text-gray-400">06/12/2024</p>
</div>
<div className="flex items-center">
<AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
<p className="text-xs font-medium text-gray-600 dark:text-gray-400">Read Time: 5 min</p>
</div>
</div>

                      <Link
                         href={`/ai-trending-news/${post.slug.current}`}
                         className="mt-1 inline-flex items-center rounded-lg bg-blue-700 px-3 py-1 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      >
                        Read more
                        <svg
                          className="ms-2 h-3 w-3 rtl:rotate-180"
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

                    
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
        <div className="mt-6 flex justify-center md:justify-end">
          <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
    Explore All Blogs          </button>
        </div>
      </div>
    </section>
  );
};

export default News;
