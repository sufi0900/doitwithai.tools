/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent,  CardMedia, } from "@mui/material";


import {  CalendarMonthOutlined, LocalOffer,} from "@mui/icons-material";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import { Skeleton } from "@mui/material"; // Import Skeleton component from Material-UI
import Box from "@mui/material/Box";
import { urlForImage } from "@/sanity/lib/image"; // Update path if needed
import AccessTimeIcon from "@mui/icons-material/AccessTime";
const FeaturePost = ({ posts }) => {
  const [isLoading, setIsLoading] = useState(true); // State to track loading status
  const firstPost = posts.length > 0 ? posts[0] : null;

  useEffect(() => {
    setIsLoading(posts.length === 0); // Set loading to true if posts are empty
  }, [posts]);


  
  return (
    <Grid item xs={12} md={8}>
      {isLoading ? (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={400}
          animation="wave"
        />
      ) : (
        firstPost && (
          <>
            <Card
              key={firstPost._id}
              className="cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              sx={{
                marginTop: "5px",
                display: "flex",

                flexDirection: "column",
                // height: "100%", // Set fixed height for responsiveness
                width: "100%", // Ensure fixed width for all cards
                overflow: "hidden", // Hide overflow to prevent scroll bars
              
        
              }}
            >
              <Link href={`/ai-tool/${firstPost.slug.current}`} passHref>
              <Box position="relative" >
                          <CardMedia
                            component="img"
                            src={urlForImage(firstPost.mainImage).url()}
                            alt={firstPost.title}
                            sx={{
                              width: "100%",
                              height: "397px", // Adjust height as needed
                              objectFit: "cover",
                              borderRadius:"6px",
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
                            <LocalOffer fontSize="small" /> Tag
                          </span>
                        </Box>
                <CardContent >
               
                  {/* <Link href="/blog-details" className="relative block  w-full">
                    <span className="absolute right-6 top-6 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold capitalize text-white">
                      tag
                    </span>
                    <img
                      src={urlForImage(firstPost.mainImage).url()}
                      style={{
                        width: "100%",
                        height: "400px",
                        objectFit: "cover",
                      }}
                    />
                    <p className="absolute bottom-0 left-0 mb-2 ml-2 rounded-md bg-primary px-2 py-1 text-sm font-medium text-white">
                      {formatDate(firstPost.publishedAt)}
                    </p>
                  </Link> */}

                  <h1 className="mb-8 mt-4 line-clamp-2 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight">
                    {firstPost.title}
                  </h1>
                  <p className="mb-4 line-clamp-4 text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg lg:text-base xl:text-lg">

                  {firstPost.overview}
                  </p>
                  <div className="mb-3 mt-3 flex items-center justify-start gap-2">
  <div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
    <CalendarMonthOutlined className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">06/12/2024</p>
  </div>
  <div className="flex items-center">
    <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Read Time: 5 min</p>
  </div>
</div>
                  <Link
                    href={`/ai-tool/${firstPost.slug.current}`}
                    className="inline-flex mb-1 mt-2 items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
              </Link>
            </Card>
          </>
        )
      )}
    </Grid>
  );
};

export default FeaturePost;
