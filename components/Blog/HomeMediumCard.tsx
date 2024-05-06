
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
import { Skeleton } from "@mui/material"; // Import Skeleton component from Material-UI

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
                      transform: "scale(1.03)",
                    },
                    height: { xs: "auto", lg: "318px" }, // Auto height for xs and fixed for lg
                  }}
                      className="  cursor-pointer     overflow-hidden  card rounded-lg bg-white text-black shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">

                        <Box position="relative">
                        <div className="relative aspect-[43/22] overflow-hidden">
              <Image
                className=" absolute rounded-lg inset-0 h-full w-full object-cover transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5]"
                src={mainImage}
                width={500} 
                height={500} 
                alt={title}
              />
            </div>
                         
            {tags && tags.length > 0 && (
            <Link href={tags[0].link} className="  absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold capitalize text-white transition duration-300 hover:bg-stone-50 hover:text-primary">
             <LocalOfferIcon  style={{fontSize:"14px"}} />   {tags[0].name}
            </Link>
          )}
                        </Box>
                        <CardContent>
                          <h5 className="mb-2 line-clamp-2  text-base font-medium  leading-relaxed  tracking-wide text-black dark:text-white sm:text-lg sm:leading-tight">
                          {title} 
                          </h5  >
                          <div className="mb-3 mt-3 flex items-center justify-start gap-2">
  <div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
    <CalendarMonth className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
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
  );
};


