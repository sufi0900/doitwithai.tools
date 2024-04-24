/* eslint-disable react/no-unescaped-entities */
"use client";

import React from "react";
import {
  Card,
  CardContent,

  Grid,

  CardMedia,
 
} from "@mui/material";
import { Schedule, LocalOffer, AccessTime } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
import EventNoteIcon from "@mui/icons-material/EventNote"; // Import MUI icon for date
import AccessTimeIcon from "@mui/icons-material/AccessTime";
const DigiResources = () => {
  // Define the static digiresources
  const digiresources = [
    {
      _id: "1",
      slug: { current: "blog-1" },
      mainImage:
        "https://t4.ftcdn.net/jpg/06/98/66/39/360_F_698663943_pL311JV0sQMXpoSE9WnRd4GiLrbWgQhE.jpg",
      title: "Web Dev Blog 1 Title",
      overview: "Web Dev Blog 1 Overview",
      author: { name: "Author 1", designation: "Web Developer" },
      publishDate: "2024-04-07",
    },
    {
      _id: "1",
      slug: { current: "blog-1" },
      mainImage:
        "https://t4.ftcdn.net/jpg/06/98/66/39/360_F_698663943_pL311JV0sQMXpoSE9WnRd4GiLrbWgQhE.jpg",
      title: "Web Dev Blog 1 Title",
      overview: "Web Dev Blog 1 Overview",
      author: { name: "Author 1", designation: "Web Developer" },
      publishDate: "2024-04-07",
    },
    {
      _id: "1",
      slug: { current: "blog-1" },
      mainImage:
        "https://t4.ftcdn.net/jpg/06/98/66/39/360_F_698663943_pL311JV0sQMXpoSE9WnRd4GiLrbWgQhE.jpg",
      title: "Web Dev Blog 1 Title",
      overview: "Web Dev Blog 1 Overview",
      author: { name: "Author 1", designation: "Web Developer" },
      publishDate: "2024-04-07",
    },
    {
      _id: "1",
      slug: { current: "blog-1" },
      mainImage:
        "https://t4.ftcdn.net/jpg/06/98/66/39/360_F_698663943_pL311JV0sQMXpoSE9WnRd4GiLrbWgQhE.jpg",
      title: "Web Dev Blog 1 Title",
      overview: "Web Dev Blog 1 Overview",
      author: { name: "Author 1", designation: "Web Developer" },
      publishDate: "2024-04-07",
    },
    {
      _id: "1",
      slug: { current: "blog-1" },
      mainImage:
        "https://t4.ftcdn.net/jpg/06/98/66/39/360_F_698663943_pL311JV0sQMXpoSE9WnRd4GiLrbWgQhE.jpg",
      title: "Web Dev Blog 1 Title",
      overview: "Web Dev Blog 1 Overview",
      author: { name: "Author 1", designation: "Web Developer" },
      publishDate: "2024-04-07",
    },

    // Add more web dev blogs here
  ];

  const trendingPost = {
    _id: "1",
    slug: { current: "trending-post" },
    mainImage:
      "https://images.unsplash.com/photo-1626968361222-291e74711449?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHNldHVwfGVufDB8fDB8fHww",
    title: "Trending Post Title",
    overview:
      "Trending Post Overview Trending Post OverviewTrendingTrending Post Overview Trending Post OverviewTrendingTrending Post Overview Trending Post OverviewTrendingTrending Post Overview Trending Post OverviewTrendingTrending Post Overview Trending Post OverviewTrending Trending Post Overview Trending Post OverviewTrending Post OverviewTrending Post OverviewTrending Post OverviewTrending Post Overview",
    author: { name: "Trending Post Author", designation: "Web Developer" },
    publishDate: "2024-04-07",
  };

  const MAX_TITLE_LENGTH = 20; // Maximum characters for title
  const MAX_OVERVIEW_LENGTH = 100; // Maximum characters for overview
  const truncateText = (text, maxLength) => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <section>
      <div className="container">
        <Breadcrumb
          pageName="Digital Toolbox"
          description="Simplify your life and boost your productivity with  easy-to-use  online tools."
          link="/digital-marketing" // Specify the link here
        />
        <Grid container spacing={2}>
          {/* Trending Post */}
          <Grid item xs={12} md={6}>
          <Card className="cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                <CardMedia
                  component="img"
                  src="https://storage-asset.msi.com/global/picture/news/2023/monitor/monitor-20230814-1.jpg"
                  alt={trendingPost.title}
                  sx={{ height: 310, objectFit: "cover" }}
                />
                <CardContent>
                <h1 className="mb-4 line-clamp-2 text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-3xl sm:leading-tight">
    {trendingPost.title}   {trendingPost.title}   {trendingPost.title}
  </h1>
  <p className="mb-4 line-clamp-4 text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg lg:text-base xl:text-lg">

    {trendingPost.overview}
  </p>
  <div className="mb-3 mt-3 flex items-center justify-start gap-2">
  <div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
    <EventNoteIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">06/12/2024</p>
  </div>
  <div className="flex items-center">
    <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Read Time: 5 min</p>
  </div>
</div>
  <Link
    href="" // Add the appropriate href
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
          {/* Smaller Blogs */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {digiresources.slice(0, 4).map((post) => (
                <Grid key={post._id} item xs={12}>
                    <CardContent
            key={post._id}
            sx={{
              // marginBottom: "5px",
              display: "flex",
             
              flexDirection: { xs: "column", lg: "row" }, // Column layout for xs and row for lg
              alignItems: "center",
              justifyContent: "space-between",
              height: { xs: "auto", lg: "151px" }, // Auto height for xs and fixed for lg
              borderRadius:"10px",
              paddingTop: "10px",
         
            }}
            className="transition duration-200 ease-in-out hover:scale-105 cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
   
            <Box sx={{ flex: 1, padding:"0px", margin:"0px" }} >
              <h5 className="mb-2 mr-2 mt-2 line-clamp-2 text-base font-medium text-start text-black dark:text-white sm:text-[16px] sm:leading-tight">
                {post.title}
                .  best way to boost your  boost your  boost your  boost your  boost your
              </h5>  
              <div className="mb-1 mt-1 flex items-center justify-start gap-2">
              {/* <p className="text-xs font-medium text-body-color">  06/12/2024</p> */}
<div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
<p className="text-xs font-medium text-body-color">  06/12/2024</p>
</div>
<div className="flex items-center">
<p className="text-xs font-medium text-body-color">  5 Min Read</p>

  {/* <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Read Time: 5 min</p> */}
</div>
</div>

<Link
                href={`/blog/${post.slug.current}`}
                className="mt-2  inline-flex items-center rounded-lg bg-blue-700 px-3 py-1 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
            </Box>
          
            <Box
                            className=" inset-0  object-cover transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5]"

              component="img"
              src="https://images.unsplash.com/photo-1539683255143-73a6b838b106?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fHRlY2h8ZW58MHx8MHx8fDA%3D"
              alt="Related News"
              sx={{
                width: { xs: "100%", lg: 150 },
                height: { xs: 200, lg: 140 },
                objectFit: "cover",
          
                marginTop:"10px",
                borderRadius:"10px"
              }}
            />
          </CardContent>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
        <div className="mt-6 flex justify-center md:justify-end">
          <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
            Read more
          </button>
        </div>
      </div>
    </section>
  );
};

export default DigiResources;
