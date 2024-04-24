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
import Link from "next/link";
import { Schedule, LocalOffer, AccessTime } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Breadcrumb from "../Common/Breadcrumb";
import EventNoteIcon from "@mui/icons-material/EventNote"; // Import MUI icon for date
import AccessTimeIcon from "@mui/icons-material/AccessTime";
const DigitalMarketing = () => {
  // Define the static SEO blogs
  const [seoTrendBigData, setSeoTrendBigData] = useState([]);
  const [seoTrendRelatedData, setSeoTrendRelatedData] = useState([]);
  // 

  useEffect(() => {
    const fetchData = async () => {
    
      const isHomePageSeoTrendBig = `*[_type == "seo" && isHomePageSeoTrendBig == true]`;
      const isHomePageSeoTrendRelated = `*[_type == "seo" && isHomePageSeoTrendRelated == true]`;
      // 
      const isHomePageSeoTrendBigData = await client.fetch(isHomePageSeoTrendBig);
      const isHomePageSeoTrendRelatedData = await client.fetch(isHomePageSeoTrendRelated);
      // 

      setSeoTrendBigData(isHomePageSeoTrendBigData);
      setSeoTrendRelatedData(isHomePageSeoTrendRelatedData);
      // 
     
    };

    fetchData();
  }, []);

  return (
    <section>
      <div className="container">
        <Breadcrumb
          pageName=" AI in SEO &"
          pageName2="Digital Marketing "
          description="Explore valuable insights, strategies, and tools to improve your digital marketing skills. From social media marketing to email campaigns, discover expert tips and resources to boost your online presence and drive results. Start optimizing your digital marketing efforts today!"
          // description="Explore the dynamic world of digital marketing and discover strategies, tips, and insights to elevate your online presence. From social media marketing and content creation to email campaigns and analytics, dive into actionable resources to enhance your digital marketing efforts."
          link="/digital-marketing" // Specify the link here
          firstlinktext="Home"
          firstlink="/"
        />

        <Grid container spacing={2}>
          {/* First Row: Two Blogs */}
          {seoTrendBigData.slice(0, 2).map((post) => (
            <Grid item key={post._id} xs={12} md={6}>
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
    <EventNoteIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">06/12/2024</p>
  </div>
  <div className="flex items-center">
    <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Read Time: 5 min</p>
  </div>
</div>
  <Link
              href={`/ai-seo/${post.slug.current}`}

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
          {/* Second Row: Four Blogs */}
          {seoTrendRelatedData.slice(2).map((post) => (
            <Grid item key={post._id} xs={12} sm={6} md={3}>
                 <Card
                  
                  className="  cursor-pointer     overflow-visible transition duration-200 ease-in-out hover:scale-105 card rounded-lg bg-white text-black shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">

                    <Box position="relative">
                    <div className="relative aspect-[27/22] overflow-visible">
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
<EventNoteIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
<p className="text-xs font-medium text-gray-600 dark:text-gray-400">06/12/2024</p>
</div>
<div className="flex items-center">
<AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
<p className="text-xs font-medium text-gray-600 dark:text-gray-400">Read Time: 5 min</p>
</div>
</div>

                      <Link
              href={`/ai-seo/${post.slug.current}`}
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
        <div className="mt-6 flex justify-center md:justify-end">
          <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
            Read more
          </button>
        </div>
      </div>
    </section>
  );
};

export default DigitalMarketing;
