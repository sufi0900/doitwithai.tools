/* eslint-disable react/no-unescaped-entities */
"use client";

import { client } from "@/sanity/lib/client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image"; 
import {
  Card,
  CardContent,

  Grid,

  CardMedia,

} from "@mui/material";
import Box from "@mui/material/Box";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { CalendarMonthOutlined } from "@mui/icons-material";
const FreeAIResources = () => {
  // Define the static web dev blogs
  const [digitalTrendBigData, setDigitalTrendBigData] = useState([]);
  const [digitalTrendRelatedData, setDigitalTrendRelatedData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
    
      const isHomePageDigitalTrendBig = `*[_type == "freeairesources" && isHomePageDigitalTrendBig == true]`;
      const isHomePageDigitalTrendRelated = `*[_type == "freeairesources" && isHomePageDigitalTrendRelated == true]`;

      const isHomePageDigitalTrendBigData = await client.fetch(isHomePageDigitalTrendBig);
      const isHomePageDigitalTrendRelatedData = await client.fetch(isHomePageDigitalTrendRelated);
  


      setDigitalTrendBigData(isHomePageDigitalTrendBigData);
      setDigitalTrendRelatedData(isHomePageDigitalTrendRelatedData);
     
    };

    fetchData();
  }, []);
  return (
    <section className="">
      <div className="container">
      <Breadcrumb
          pageName="Free AI Resources"
          pageName2=" & Solution"
          description="Supercharge your creativity and problem-solving skills with free AI resources! Our blog provides an extensive collection of useful resources, including stunning, free, non-copyrighted AI-generated images and creative writing prompts for various tasks. Discover how AI can be applied to different fields to solve problems and enhance your work. Explore the potential of AI and see how it can empower you in any domain!"
          firstlinktext="Home"
          firstlink="/"
          link="/free-ai-resources" 
          linktext="free-ai-resources"     />
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
          {digitalTrendBigData.slice(0, 1).map((post) => (
            <Card
            key={post._id}
            className="transition  duration-200 ease-in-out hover:scale-[1.03] cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                <CardMedia
                  component="img"
                  src={urlForImage(post.mainImage).url()}
                  alt={post.title}
                  sx={{
                    width: "100%",
                    height: "355px", // Adjust height as needed
                    objectFit: "cover",
                  }}
                />
                <CardContent>
                <h1 className="mb-4 line-clamp-2  font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-xl sm:leading-normal">
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
        href={`/free-ai-resources/${post.slug.current}`}

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
               ))}
          </Grid>

          <Grid item xs={12} md={4}>
          {digitalTrendBigData.slice(1, 2).map((post) => (
            <Card 
            key={post._id}
            className="transition  duration-200 ease-in-out hover:scale-[1.03] cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
            <CardMedia
                  component="img"
                  src={urlForImage(post.mainImage).url()}
                  alt={post.title}
                  sx={{
                    width: "100%",
                    height: "355px", // Adjust height as needed
                    objectFit: "cover",
                  }}
                />
                <CardContent>
                <h1 className="mb-4 line-clamp-2  font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-xl sm:leading-normal">
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
        href={`/free-ai-resources/${post.slug.current}`}

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
                   ))}
          </Grid>

          <Grid item xs={12} md={4}>
          {digitalTrendBigData.slice(2, 3).map((post) => (
            <Card
            key={post._id}
            className="transition  duration-200 ease-in-out hover:scale-[1.03] cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
            <CardMedia
                  component="img"
                  src={urlForImage(post.mainImage).url()}
                  alt={post.title}
                  sx={{
                    width: "100%",
                    height: "355px", // Adjust height as needed
                    objectFit: "cover",
                  }}
                />
                <CardContent>
                <h1 className="mb-4 line-clamp-2  font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-xl sm:leading-normal">
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
        href={`/free-ai-resources/${post.slug.current}`}

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
                  ))}
          </Grid>

          {/* Small Blogs */}
          {digitalTrendRelatedData.slice(0, 3).map((post) => (
            <Grid key={post._id} item xs={12} md={4}>
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
                   href={`/free-ai-resources/${post.slug.current}`}

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
              src={urlForImage(post.mainImage).url()}
              alt="Related News"
              sx={{
                width: { xs: "100%", lg: 130 },
                height: { xs: 200, lg: 120 },
                objectFit: "cover",
          
                marginTop:"10px",
                borderRadius:"10px"
              }}
            />
          </CardContent>
            </Grid>
          ))}
        </Grid>
        <div className="mt-6 flex justify-center md:justify-end">
          <Link href="/free-ai-resources">
          <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
          Explore All Blogs
          </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FreeAIResources;
