
"use client";
import React, { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardMedia,
  Grid,
} from "@mui/material";
import Box from "@mui/material/Box";
import Link from "next/link";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import Image from "next/image";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { CalendarMonth } from "@mui/icons-material";
import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image"; // Update path if needed

const TrendingPage = () => {
  
  const [trendBigData, setTrendBigData] = useState([]);
  const [trendRelatedData, setTrendRelatedData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
    
      const isHomePageTrendBig = `*[_type in [ "makemoney", "freeairesources", "news", "coding", "aitool", "seo",] && isHomePageTrendBig == true]`;
      const isHomePageTrendRelated =`*[_type in [ "makemoney", "freeairesources",  "news", "coding", "aitool", "seo", ] && isHomePageTrendRelated == true]`;

      const isHomePageTrendBigData = await client.fetch(isHomePageTrendBig);
      const isHomePageTrendRelatedData = await client.fetch(isHomePageTrendRelated);
     
  


      setTrendBigData(isHomePageTrendBigData);

      setTrendRelatedData(isHomePageTrendRelatedData);
     
     
    };

    fetchData();
  }, []);

  const schemaSlugMap = {
    makemoney: "make-money-with-ai",
    aitool: "aitools",
    news: "ai-trending-news",
    coding: "code-with-ai",
    digital: "free-ai-resources",
    seo: "seo-with-ai",
  };

  return (
    <section className="pb-[20px] pt-[20px]">
      <div className="container ">
      <h1 className="mb-8 text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">
                  <span className="group inline-block cursor-pointer">
                    <span className="relative text-blue-500">
                   Whats
                      <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
                    </span>
                    {/* Add space between the texts */}{" "}
                    {/* Add space between the texts */}
                    <span className="relative  inline-block ">
                      {" "}
                      {/* Apply smaller font size */}
                   Trending
                      <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </span>
                </h1>
        <Grid container spacing={2}>
          {/* Trending Post */}

          {trendBigData.slice(0, 1).map((post) => (
            <Grid item xs={12} md={6}  key={post._id}>
  <Card

  sx={{
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": {
      transform: "scale(1.03)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    },
    width: "100%", // Ensures the Card width is responsive
    height: "auto", // Adjust based on content but maintains image height
  }}
  className="cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
>

  <Box position="relative">
  
  <CardMedia
  component="img"
  src={urlForImage(post.mainImage).url()}
  alt={post.title}
  sx={{
    width: "100%",
    height: 415, // Using a numeric value ensures consistency
    maxHeight: "100%", // Optional depending on use-case
    objectFit: "cover", // Ensures image covers the space appropriately
  }}
/>

  
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
      <LocalOfferIcon fontSize="small" /> Tag
    </span>
  </Box>

  <CardContent sx={{ flexGrow: 1 }}>
  <h1 className="mb-4 line-clamp-2 text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-3xl sm:leading-tight">

      {post.title} 
    </h1>

    <p className="mb-4 line-clamp-4 text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg lg:text-base xl:text-lg">
    {post.overview} 
    </p>

    <div className="mb-3 mt-3 flex items-center justify-start gap-2">
      <div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
        <CalendarMonth className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">06/12/2024</p>
      </div>
      <div className="flex items-center">
        <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Read Time: 5 min</p>
      </div>
    </div>

    <Link
                    href={`/${schemaSlugMap[post._type]}/${post.slug.current}`} // Construct link dynamically based on the post's schema
                    className="mt-4 mb-2 inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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

          {/* Smaller Blogs */}
       
       
              <Grid item xs={12} sm={12} md={3} lg={3} xl={3  }>
                <Grid container flex spacing={2} className="mb-2 flex ">
                  {trendRelatedData.slice(0, 2).map((post) => (
                    <Grid key={post._id} item xs={12} >
                      <Card
                  
                      className="  cursor-pointer     overflow-visible transition duration-200 ease-in-out hover:scale-105 card rounded-lg bg-white text-black shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">

                        <Box position="relative">
                        <div className="relative aspect-[37/22] overflow-visible">
              <Image
                className=" absolute rounded-lg inset-0 h-full w-full object-cover transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5]"
                src={urlForImage(post.mainImage).url()}
fill
                alt={post.title}
              />
            </div>
                          {/* <CardMedia
                            component="img"
                            src={post.mainImage}
                            alt={post.title}
                            sx={{
                              width: "100%",
                              height: "200px", // Adjust height as needed
                              objectFit: "cover",
                            }}
                          /> */}
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
                            <LocalOfferIcon fontSize="small" /> Tag
                          </span>
                        </Box>
                        <CardContent>
                          <h5 className="mb-2 line-clamp-2  text-base font-medium  leading-relaxed  tracking-wide text-black dark:text-white sm:text-lg sm:leading-tight">
                            {post.title} {post.title} {post.title} {post.title}{" "}
                            {post.title}
                          </h5  >
                          <div className="mb-3 mt-3 flex items-center justify-start gap-2">
  <div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
    <CalendarMonth className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">06/12/2024</p>
  </div>
  <div className="flex items-center">
    <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Read Time: 5 min</p>
  </div>
</div>

                          <Link
                    href={`/${schemaSlugMap[post._type]}/${post.slug.current}`} // Construct link dynamically based on the post's schema
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
              <Grid item xs={12} sm={12} md={3} lg={3} xl={3  }>
                <Grid container flex spacing={2} className="mb-2 flex ">
                  {trendRelatedData.slice(2, 4).map((post) => (
                    <Grid key={post._id} item xs={12}>
                <Card
                  
                  className="  cursor-pointer     overflow-visible transition duration-200 ease-in-out hover:scale-105 card rounded-lg bg-white text-black shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">

                    <Box position="relative">
                    <div className="relative aspect-[37/22] overflow-visible">
          <img
            className="absolute rounded-lg inset-0 h-full w-full object-cover transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.3]"
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
                            <LocalOfferIcon fontSize="small" /> Tag
                          </span>
                        </Box>
                        <CardContent>
                        <h5 className="mb-2 line-clamp-2  text-base font-medium  leading-relaxed  tracking-wide text-black dark:text-white sm:text-lg sm:leading-tight">
                            {post.title} {post.title} {post.title} {post.title}{" "}
                            {post.title}
                          </h5>
                          <div className="mb-3 mt-3 flex items-center justify-start gap-2">
  <div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
    <CalendarMonth className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">06/12/2024</p>
  </div>
  <div className="flex items-center">
    <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Read Time: 5 min</p>
  </div>
</div>

                          <Link
                    href={`/${schemaSlugMap[post._type]}/${post.slug.current}`} // Construct link dynamically based on the post's schema
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
      </div>
    </section>
  );
};

export default TrendingPage;
