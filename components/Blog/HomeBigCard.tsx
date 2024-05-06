/* eslint-disable react/jsx-key */
"use client";
import { client } from "@/sanity/lib/client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image"; 
import Image from "next/image";
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
import {  CalendarMonthOutlined } from "@mui/icons-material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SmallCard from "@/components/Blog/HomeSmallCard"
export default function SingleBlog({ 
    publishedAt,
    mainImage,
    title,
    overview,
    ReadTime,
    slug,
    tags,
  
  }) {
 
  return (
 
        <Card 
               sx={{
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "scale(1.03)"},
         
                height: { xs: "auto", lg: "652px" }, // Auto height for xs and fixed for lg

               }}
            className="cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                {/* <div className="overflow-hidden lg:aspect-[35/16]"> */}
                <Box position="relative" sx={{overflow:"hidden"}}>
                <CardMedia
  component="div" // Use 'div' instead of 'img' to allow nesting of Next.js  tag
  sx={{
    position: "relative", // Required for positioning Next.js  within CardMedia
    height: { xs: "auto", lg: 312 }, // Auto height for small devices and fixed height for large devices
    overflow: "hidden", // Ensure content doesn't overflow
  }}
  className="transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5]"
>
  <Image
    src={mainImage}
    alt={title}
    layout="responsive"
    width={500} 
    height={500}
  />
</CardMedia>
                       
{tags && tags.length > 0 && (
            <Link href={tags[0].link} className="  absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold capitalize text-white transition duration-300 hover:bg-stone-50 hover:text-primary">
             <LocalOfferIcon  style={{fontSize:"14px"}} />   {tags[0].name}
            </Link>
          )}
                        </Box>

               <CardContent>
               <h1 className="mb-4 line-clamp-2 text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-3xl sm:leading-tight" >
               {title}     
                  
</h1>

<p className="mb-4 line-clamp-4 dark-bg-green-50 rounded-bl-xl rounded-br-xl  text-base text-gray-800 dark:text-gray-400" >
{overview} 
</p>

 <div className="mb-3 mt-3 flex items-center justify-start gap-2">
 <div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
   <CalendarMonthOutlined className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
   <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
{publishedAt}
    </p>
 </div>
 <div className="flex items-center">
   <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
   <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
   Read Time: {ReadTime} min
    </p>
 </div>
</div>
 <Link
      href={slug}

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

             </Card>
    
  );
};


