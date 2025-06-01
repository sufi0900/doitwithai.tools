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
import { data } from "autoprefixer";


export default function SingleBlog({ publishedAt,
    mainImage,
    title,
    overview,
    ReadTime,
    slug,
    tags,
  
  }) {
 
  return (
    <section>
      <Link      href={slug}     className=" lg:h-[151px] transition duration-200 ease-in-out hover:scale-[1.03] flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row  hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                     <div className="rounded-md overflow-hidden ">

                     <Image     
    width={500} 
    height={500} 
    className="  transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5] lg:aspect-[21/16] object-cover w-full rounded-t-lg sm:h-auto  md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"  src={mainImage} alt="" />
    
        </div>
        <div className="flex flex-col justify-between m-4 leading-normal">
        <h5 className=" lg:leading-6 line-clamp-2  lg:text-lg font-medium text-start text-black dark:text-white sm:text-[16px] sm:leading-tight">
          {title} 
          </h5>            <div className="mb-1 mt-1 flex items-center justify-start gap-2">
          
<div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
<p className="text-sm font-medium text-body-color">
{publishedAt}
</p>
</div>
<div className="flex items-center">
<p className="text-sm font-medium text-body-color"> 
Read Time: {ReadTime} min

</p>


</div>


</div>  
<div>    
<Link
        href={slug}
            className="my-2  inline-flex items-center rounded-lg bg-blue-700 px-3 py-1 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
                    </div>
  </div>

      </Link>
    </section>
  );
};


