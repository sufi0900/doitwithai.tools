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
import SingleBlog from "./Card"

import Link from "next/link";
import Breadcrumb from "../../../components/Common/Breadcrumb";
import EventNoteIcon from "@mui/icons-material/EventNote"; // Import MUI icon for date
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { CalendarMonth } from "@mui/icons-material";

const Page = () => {
    const [isFeature, setIsFeature] = useState([]);
    const [isBlog, setIsBlog] = useState([]);
  
    useEffect(() => {
      const fetchData = async () => {
      
        const isFeature = `*[_type == "aitool" && isAiArticleGenBig == true]`;
        const isBlog = `*[_type == "aitool" && isAiArticleGen == true]`;
  
        const isFeatureData = await client.fetch(isFeature);
        const isBlogData = await client.fetch(isBlog);
    
        setIsFeature(isFeatureData);
        setIsBlog(isBlogData);
       
      };
  
      fetchData();
    }, []);

  return (
    <div className="container">
    <Breadcrumb
      pageName="Make Money Online"
      pageName2="Using AI"
      description="Power up your content creation process with the revolutionary AI Article Writers featured in our reviews. Tailored for marketers, bloggers, and businesses, these AI writers are capable of generating high-quality, engaging, and SEO-optimized content in minutes. Whether you're looking to scale content production or overcome writer's block, our expert insights will guide you to the best AI writing tools to elevate your content strategy and keep your audience engaged"
      link="/digital-marketing" // Specify the link here
      firstlinktext="Home"
      firstlink="/"
    />
    <Grid container spacing={2}>
      {/* First Row: one Big Blogs */}
      {isFeature.slice(0, 1).map((post) => (
        <Grid item key={post._id} xs={12} md={12}>
          <Card
            // key={firstPost._id}
            className="card cursor-pointer  items-center  rounded-lg         border border-gray-200 bg-white text-black shadow hover:bg-gray-100  dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700
        " // Adjust background and text color based on theme
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
                  <CardMedia
                    component="img"
                    src={urlForImage(post.mainImage).url()}
                    // src={urlForImage(firstPost.mainImage).url()}
                    alt="Blog thumbnail"
                    sx={{
                      width: "100%",
                      height: "340px",
                      objectFit: "cover",
                
                      borderRadius:"10px"
                    }}
                    className="m-0 "
                  />
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
                {/* Person Avatar with Name and Date */}

                {/* Content */}
                <CardContent sx={{ flexGrow: 1 }}>
                  <h1 className="mb-2 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight">
                    {post.title}
                  </h1>
                  <p className="line-clamp-4 text-base font-medium text-dark dark:text-white sm:text-lg lg:text-base xl:text-lg">
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
                     href={`/ai-earn/${post.slug.current}`}
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
    <br/>
    <br/>
    <Grid item  xs={12} md={12}>
      <div className="-mx-4  m-8  mt-8 flex flex-wrap justify-center">
   
            {/* Conditionally render search results within the loop */}
            {isBlog.map((blog) => (
              <SingleBlog key={blog.id} {...blog} />
            ))}
       
          </div>
          </Grid>
      {/* Second Column */}
   
    </Grid>
    <div className="mt-8 flex justify-center md:justify-end">
      <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
        Read more
      </button>
    </div>
  </div>
  )
}

export default Page