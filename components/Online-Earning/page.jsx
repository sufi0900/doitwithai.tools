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

import Box from "@mui/material/Box";
import Link from "next/link";

import Breadcrumb from "../Common/Breadcrumb";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { CalendarMonthOutlined } from "@mui/icons-material";
const OnlineEarningPage = () => {
  // Define the static SEO blogs
  const [aiEarnTrendBigData, setAiEarnTrendBigData] = useState([]);
  const [aiEarnTrendRelatedData, setAiEarnTrendRelatedData] = useState([]);
  

  useEffect(() => {
    const fetchData = async () => {
      const isHomePageAiEarnTrendBig = `*[_type == "makemoney" && isHomePageAiEarnTrendBig == true]`;
      const isHomePageAIEarnTrendRelated = `*[_type == "makemoney" && isHomePageAIEarnTrendRelated == true]`;
      
      const isHomePageAiEarnTrendBigData = await client.fetch(isHomePageAiEarnTrendBig);
      const isHomePageAIEarnTrendRelatedData = await client.fetch(isHomePageAIEarnTrendRelated);
   

      setAiEarnTrendBigData(isHomePageAiEarnTrendBigData);
      setAiEarnTrendRelatedData(isHomePageAIEarnTrendRelatedData);
     
     
    };

    fetchData();
  }, []);
  return (
    <section>
      <div className="container">
        <Breadcrumb
          pageName="Make Money"
          pageName2="With AI"
          description="Discover useful tips and tools to help you earn money online. From freelancing to affiliate marketing, explore valuable resources to start and grow your online income streams. Start making money online today!"
          firstlinktext="Home"
          firstlink="/"
          link="/make-money-with-ai" 
      
          linktext="make-money-with-ai"
         
  
        />
        <Grid container spacing={2}>
          {/* First Row: one Big Blogs */}
          {aiEarnTrendBigData.slice(0, 1).map((post) => (
            <Grid item key={post._id} xs={12} md={12}>
              <Card
   
                className="transition duration-200 ease-in-out hover:scale-[1.02] card cursor-pointer  items-center  rounded-lg border border-gray-200 bg-white text-black shadow hover:bg-gray-100  dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700
            " 
                sx={{
                  marginTop: "5px",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  width: "100%", // Ensure fixed width for all cards
                }}
              >
                <Grid container className="flex">
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    lg={4}
                    sx={{ alignItems: "stretch",  }}
                  >
                    <Card className="flex2  card cursor-pointer rounded-lg bg-white text-black shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                    <div className=" overflow-hidden">

                      <CardMedia
                        component="img"
                        src={urlForImage(post.mainImage).url()}
                        // src={urlForImage(firstPost.mainImage).url()}
                        alt="Blog thumbnail"
                        sx={{
                          width: "100%",
                       
                          height: { xs: "auto", lg:  "300px", }, // Auto height for small devices and fixed height for large devices

                          objectFit: "cover",
             
                          borderRadius:"10px"
                        }}
                        className="transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.3]"

                />
                </div>
                    </Card>
                  </Grid>

                  {/* Content Section */}
                  <Grid
                    item
                    sm={12}
                    xs={12}
                    lg={8}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "5px",
                    }}
                  >
                 
                    <CardContent sx={{ flexGrow: 1 }}>
                      <h1 className="mb-2 line-clamp-2 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight">
                        {post.title}  
                      </h1>
                      <p className="line-clamp-4 dark-bg-green-50 rounded-bl-xl rounded-br-xl  text-base text-gray-800 dark:text-gray-400">
                        {post.overview}
                      </p>
                      <div className="mb-3 mt-3 flex items-center justify-start gap-2">
  <div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
    <CalendarMonthOutlined className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400"
    >        {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
</p>
  </div>
  <div className="flex items-center">
    <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400"> Read Time: {post.readTime?.minutes} min</p>
  </div>
</div>
                      <Link
                         href={`/make-money-with-ai/${post.slug.current}`}
                         className="mt-4 inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
          {/* Second Row: Blogs Displaying Below Big Blogs */}
          {/* First Column */}
          {aiEarnTrendRelatedData.slice(0, 2).map((post) => (
            <Grid item key={post._id} xs={12} md={6}>
              {/* Adjusted margin and padding */}
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
              marginRight:"0px",
              paddingRight:"5px",
          
         
            }}
            className="transition duration-200 ease-in-out hover:scale-[1.03] cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
   
            <Box sx={{ flex: 1, padding:"0px", margin:"0px" }} >
              <h5 className="mb-2 lg:leading-6 mr-2 mt-2 line-clamp-2 text-base font-medium text-start text-black dark:text-white sm:text-[16px] sm:leading-tight">
                {post.title}
                .  best way to boost your  boost your  boost your  boost your  boost your
              </h5>  
              <div className="mb-1 mt-1 flex items-center justify-start gap-2">
              {/* <p className="text-xs font-medium text-body-color">          {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
</p> */}
<div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
<p className="text-xs font-medium text-body-color">          {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
</p>
</div>
<div className="flex items-center">
<p className="text-xs font-medium text-body-color">   Read Time: {post.readTime?.minutes} min</p>

  {/* <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
  <p className="text-xs font-medium text-gray-600 dark:text-gray-400"> Read Time: {post.readTime?.minutes} min</p> */}
</div>
</div>

<Link
                                    href={`/make-money-with-ai/${post.slug.current}`}

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
                            className=" inset-0  object-cover transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.3]"

              component="img"
              src={urlForImage(post.mainImage).url()}
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
          {/* Second Column */}
          {aiEarnTrendRelatedData.slice(2, 4).map((post) => (
            <Grid item key={post._id} xs={12} md={6}>
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
              marginRight:"0px",
              paddingRight:"5px",
            //  paddingTop: "10px",
            //  padding:"5px",
         
            }}
            className="transition duration-200 ease-in-out hover:scale-[1.03] cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
   
            <Box sx={{ flex: 1, padding:"0px", margin:"0px" }} >
              <h5 className="mb-2 mr-2 mt-2 line-clamp-2 text-base font-medium text-start text-black dark:text-white sm:text-[16px] sm:leading-tight">
                {post.title}
               
              </h5>  
              <div className="mb-1 mt-1 flex items-center justify-start gap-2">

<div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
<p className="text-xs font-medium text-body-color">          {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
</p>
</div>
<div className="flex items-center">
<p className="text-xs font-medium text-body-color">   Read Time: {post.readTime?.minutes} min</p>

  {/* <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
  <p className="text-xs font-medium text-gray-600 dark:text-gray-400"> Read Time: {post.readTime?.minutes} min</p> */}
</div>
</div>

<Link
                         href={`/make-money-with-ai/${post.slug.current}`}
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
                            className=" inset-0  object-cover transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.3]"

              component="img"
              src={urlForImage(post.mainImage).url()}
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
        <div className="mt-6 flex justify-center md:justify-end">
          <Link                          href="/make-money-with-ai"
>
          <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
          Explore All Blogs
          </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OnlineEarningPage;
