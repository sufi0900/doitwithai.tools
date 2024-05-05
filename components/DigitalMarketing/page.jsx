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
import {  LocalOffer,  CalendarMonthOutlined } from "@mui/icons-material";
import Box from "@mui/material/Box";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

import Breadcrumb from "../Common/Breadcrumb";
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
          pageName="AI in SEO &"
          pageName2="Digital Marketing "
          description="The digital marketing landscape is changing rapidly, and AI is leading the way!  Our blog equips you with the knowledge and tools to leverage AI for SEO and marketing success. Discover how AI can help you generate high-quality content, optimize your website, and craft data-driven marketing campaigns.  Explore expert tips on using AI tools like SEO AI and ChatGPT to write SEO-friendly blog posts, improve rankings, and  drive massive traffic.  Embrace the power of AI and take your digital marketing to the next level! "
          firstlinktext="Home"
          firstlink="/"
          link="/seo-with-ai" 
          linktext="seo-with-ai" 
        />

        <Grid container spacing={2} >
          {/* First Row: Two Blogs */}
          {seoTrendBigData.slice(0, 2).map((post) => (
            <Grid item key={post._id} xs={12} md={6} >
                 <Card 

                 sx={{
                  height: { xs: "auto", lg: 652 }
                 }}
                 className="transition duration-200 ease-in-out hover:scale-[1.03] cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                 <Box position="relative" sx={{overflow:"hidden"}}>
                 <div className=" overflow-hidden">
                <CardMedia
                  component="img"
                  src={urlForImage(post.mainImage).url()}
                  alt={post.title}
                  sx={{ height: 350, objectFit: "cover" }}
                  className="transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5]"

                />
                </div>
                   {post.tags && post.tags.length > 0 && (
          <Link href={post.tags[0].link} className="  absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold capitalize text-white transition duration-300 hover:bg-stone-50 hover:text-primary">
           <LocalOfferIcon  style={{fontSize:"14px"}} />   {post.tags[0].name}
          </Link>
        )}
                        </Box>
                <CardContent>
                <h1 className="mb-4 line-clamp-2 text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-3xl sm:leading-tight">
    {post.title}   
  </h1>
  <p className="mb-4 line-clamp-4 dark-bg-green-50 rounded-bl-xl rounded-br-xl  text-base text-gray-800 dark:text-gray-400">

    {post.overview}
  </p>
  <div className="mb-3 mt-3 flex items-center justify-start gap-2">
  <div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
    <CalendarMonthOutlined className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">        {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
</p>
  </div>
  <div className="flex items-center">
    <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">        Read Time: {post.readTime?.minutes} min
</p>
  </div>
</div>
  <Link
              href={`/seo-with-ai/${post.slug.current}`}

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
          {seoTrendRelatedData.slice(0, 4).map((post) => (
            <Grid item key={post._id} xs={12} sm={6} md={3} marginTop={1}>
                  <Card
                  
                  className="  cursor-pointer     overflow-visible transition duration-200 ease-in-out hover:scale-105 card rounded-lg bg-white text-black shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">

                    <Box position="relative">
                    <div className="relative aspect-[37/22] overflow-hidden">
          <img
            className="absolute rounded-lg inset-0 h-full w-full object-cover transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5]"
            src={urlForImage(post.mainImage).url()}
            alt={post.title}
          />
        </div>
                    
        {post.tags && post.tags.length > 0 && (
         <Link
         href={post.tags[0].link} className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold capitalize text-white transition duration-300 hover:bg-stone-50 hover:text-primary"
         >
           <LocalOfferIcon fontSize="small" />      {post.tags[0].name} 
         </Link>
        )}
                    </Box>
                    <CardContent>
                      <h5 className="mb-2 line-clamp-2  text-base font-medium  leading-relaxed  tracking-wide text-black dark:text-white sm:text-lg sm:leading-tight">
                        {post.title} 
                      </h5  >
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

                      <Link
                         href={`/seo-with-ai/${post.slug.current}`}
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
          Explore All Blogs
          </button>
        </div>
      </div>
    </section>
  );
};

export default DigitalMarketing;
