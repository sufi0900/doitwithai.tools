import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { CardContent,  } from "@mui/material";
import { urlForImage } from "@/sanity/lib/image"; // Update path if needed
import { Skeleton } from "@mui/material"; // Import Skeleton component from Material-UI

import Link from "next/link";

const RelatedTrendingPosts = ({ posts }) => {
  const [isLoading, setIsLoading] = useState(true); // State to track loading status

  useEffect(() => {
    setIsLoading(posts.length === 0); // Set loading to true if posts are empty
  }, [posts]);

  const formatDate = (dateString) => {
    const formattedDate = new Date(dateString).toLocaleDateString();
    return formattedDate;
  };
  return (
    <Grid item xs={12} md={4} >
      <Grid
      className=" overflow-visible "
        // className=" rounded-lg  bg-white text-black dark:bg-gray-800 dark:text-white" // Adjust background and text color based on theme
        sx={{
          marginTop: "5px",
          display: "flex",
       
        flexDirection: "column",
          // maxHeight: "calc(650px + 40px)", // Adjust this value based on your needs
          overflowY: "auto", // Enable vertical scrolling
          width: "100%", // Ensure fixed width for all cards
        }}
      >
        {/* <h1 className="mb-5 p-4 text-xl font-bold tracking-wide text-black dark:text-white sm:text-2xl">
          <span className="relative mr-2 inline-block">
            Related
            <span className="absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
          </span>
          <span className="text-blue-500">Posts</span>
        </h1> */}
        {isLoading ? ( // Render skeleton UI if loading
          <>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={100}
              animation="wave"
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={100}
              animation="wave"
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={100}
              animation="wave"
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={100}
              animation="wave"
            />
          </>
        ) : (
          // Render actual post content if not loading
          posts.slice(0, 5).map((post) => (
            <CardContent
              key={post._id}
              sx={{
                marginBottom: "15px",
                display: "flex",
                alignItems: "center",
                padding:"10px",
              }}
              className="transition duration-200 ease-in-out hover:scale-105 cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <Box sx={{ flex: 1 }}>
                <h5 className="mb-2 mr-2 mt-2 line-clamp-2 text-base font-medium text-start text-black dark:text-white sm:text-[16px] sm:leading-tight">
                  {post.title}
                  .  best way to boost your
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
                                           href={`/ai-tool/${post.slug.current}`}

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
                  width: "120px",
                  borderRadius:"10px",
                  height: "100px",
                  objectFit: "cover",
                  marginRight: "5px",
                }}
              />
            </CardContent>
          ))
        )}
      </Grid>
    </Grid>
  );
};

export default RelatedTrendingPosts;
