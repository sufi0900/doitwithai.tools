"use client";
import { client } from "@/sanity/lib/client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image"; 
import { Card, CardContent, Grid, CardMedia, Typography } from "@mui/material";
import NewsLatterBox from "../Contact/NewsLatterBox";
import Breadcrumb from "../Common/Breadcrumb";
import {  LocalOffer,  CalendarMonthOutlined } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Link from "next/link";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
const WebDev = () => {
  // Define the static web dev blogs
  const [codingData, setCodingData] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
    
      const isHomePageCoding = `*[_type == "coding" && isHomePageCoding == true]`;


      const isHomePageCodingData = await client.fetch(isHomePageCoding);



      setCodingData(isHomePageCodingData);

     
     
    };

    fetchData();
  }, []);

  return (
    <section>
      <div className="container">
        <Breadcrumb
          pageName="Code"
          pageName2="With AI"
          description="The future of coding is here! Explore how AI can become your powerful coding partner. Our blog teaches you to leverage tools like ChatGPT to generate website code (HTML, CSS, React, etc.) and build beautiful UI components.  Learn to optimize existing code (MERN Stack, Next.js), solve coding challenges, and streamline your development process.  We even offer free website templates built with AI!  Unlock the potential of AI and code like never before!"
          firstlinktext="Home"
          firstlink="/"
          link="/code-with-ai" 
          linktext="code-with-ai"
        />
        <Grid container spacing={2}>
          {/* Blog Cards */}
          <Grid item lg={8} xl={8} md={8} sm={12} xs={12} sx={{zIndex:"5"}} className="overflow-visible">
            <Grid container spacing={3} paddingRight={1} className="overflow-visible">
              {codingData.slice(0, 4).map((post) => (
                <Grid key={post._id} item xs={12} className="overflow-visible">
                  <Card 
            className="transition  duration-200 ease-in-out hover:scale-[1.03] cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
            <Grid container>
                      <Grid item xs={12} sm={6}>
                        <Box position="relative" className=" overflow-hidden inset-0  object-cover "
>
                          <CardMedia
                          className="transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5]"
                            component="img"
                            src={urlForImage(post.mainImage).url()}
                            alt={post.title}
                            sx={{
                              width: "100%",
                              height: { xs: "auto", lg: 252 }, 
                             
                              objectFit: "cover",
                              borderRadius:"10px  ",
                       
                            }}
                          />
                      {post.tags && post.tags.length > 0 && (
         <Link
         href={post.tags[0].link} className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold capitalize text-white transition duration-300 hover:bg-stone-50 hover:text-primary"
         >
           <LocalOffer fontSize="small" />      {post.tags[0].name} 
         </Link>
        )}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <CardContent>
                        <h1 className="mb-4 line-clamp-2 text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-3xl sm:leading-tight">
                            {post.title}
                          </h1>
                          <div className="mb-3 mt-3 flex items-center justify-start gap-2">
  <div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
    <CalendarMonthOutlined className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">        {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
</p>
  </div>
  <div className="flex items-center">
    <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400"> Read Time: {post.readTime?.minutes} min</p>
  </div>
</div>
<Typography className=" line-clamp-3 dark-bg-green-50 rounded-bl-xl rounded-br-xl text-start text-base text-gray-800 dark:text-gray-400">
                        {post.overview}
 </Typography>
                          <Link
                           href={`/coding/${post.slug.current}`}

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
            </Grid>
          </Grid>
          {/* Newsletter Box */}
          <Grid item lg={4} xl={4} md={4} sm={12} xs={12} sx={{zIndex:"2"}}>
            <NewsLatterBox />
          </Grid>
        </Grid>
        <div className="mt-6 flex justify-center md:justify-end">
          <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
          Explore All Blogs
          </button>
        </div>
      </div>
    </section>
  );
};

export default WebDev;
