"use client";
import { client } from "@/sanity/lib/client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image"; 
import { Card, CardContent, Grid, CardMedia } from "@mui/material";
import NewsLatterBox from "../Contact/NewsLatterBox";
import Breadcrumb from "../Common/Breadcrumb";
import { Schedule, LocalOffer, AccessTime } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Link from "next/link";
import EventNoteIcon from "@mui/icons-material/EventNote"; // Import MUI icon for date
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
          description="Explore valuable tips and tools to enhance your programming skills and boost your career. From coding techniques to software development tools, discover resources to help you excel in the world of programming. Start mastering programming today!"
          link="/digital-marketing" // Specify the link here
          firstlinktext="Home"
          firstlink="/"
        />
        <Grid container spacing={2}>
          {/* Blog Cards */}
          <Grid item lg={8} xl={8} md={8} sm={12} xs={12} sx={{zIndex:"5"}} className="overflow-visible">
            <Grid container spacing={2} className="overflow-visible">
              {codingData.map((post) => (
                <Grid key={post._id} item xs={12} className="overflow-visible">
                  <Card 
            className="transition  duration-200 ease-in-out hover:scale-[1.03] cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
            <Grid container>
                      <Grid item xs={12} sm={6}>
                        <Box position="relative"                             className=" inset-0  object-cover transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5]"
>
                          <CardMedia
                            component="img"
                            src={urlForImage(post.mainImage).url()}
                            alt={post.title}
                            sx={{
                              width: "100%",
                              height: "200px",
                              objectFit: "cover",
                              borderRadius:"10px  ",
                       
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
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <CardContent>
                        <h5 className="mb-2 line-clamp-2  text-base font-medium  leading-relaxed  tracking-wide text-black dark:text-white sm:text-lg sm:leading-tight">
                            {post.title}
                          </h5>
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
                          {/* <Typography variant="body2" color="text.secondary">
                        {post.overview}
                      </Typography> */}
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
            Read more
          </button>
        </div>
      </div>
    </section>
  );
};

export default WebDev;
