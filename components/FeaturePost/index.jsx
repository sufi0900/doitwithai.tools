/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent,  CardMedia, } from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

import { client } from "@/sanity/lib/client";
import {  CalendarMonthOutlined, } from "@mui/icons-material";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import { Skeleton } from "@mui/material"; // Import Skeleton component from Material-UI
import Box from "@mui/material/Box";
import { urlForImage } from "@/sanity/lib/image"; // Update path if needed
import AccessTimeIcon from "@mui/icons-material/AccessTime";
const FeaturePost = ({ posts }) => {
  const [isLoading, setIsLoading] = useState(true); 

  const [featurePostBig, setFeaturePostBig] = useState([]);
  const [featureRelatedData, setFeatureRelatedData] = useState([]);  useEffect(() => {
    const fetchData = async () => {
    
      const isHomePageFeatureBig = `*[_type in [ "makemoney", "freeairesources", "news", "coding", "aitool", "seo",] && isHomePageFeatureBig == true]`;
      const isHomePageFeatureRelated = `*[_type in [ "makemoney", "freeairesources", "news", "coding", "aitool", "seo"] && isHomePageFeatureRelated == true]`;
      // 
      const isHomePageFeatureBigData = await client.fetch(isHomePageFeatureBig);
  
      const isHomePageFeatureRelatedData = await client.fetch(isHomePageFeatureRelated);

      setFeaturePostBig(isHomePageFeatureBigData);
 
      setFeatureRelatedData(isHomePageFeatureRelatedData);
     
     
    };

    fetchData();
  }, []);

  const schemaSlugMap = {
    makemoney: "make-money-with-ai",
    aitool: "ai-tools",
    news: "ai-trending-news",
    coding: "code-with-ai",
    freeairesources: "free-ai-resources",
    seo: "seo-with-ai",
  };




  useEffect(() => {
    setIsLoading(posts); // Set loading to true if posts are empty
  }, [posts]);


  
  return (
    <section
    id="blog"
    className="bg-gray-light py-16 dark:bg-bg-color-dark md:py-4 lg:py-4"
  >
    <div className="container">
      <h1 className="mb-6 text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">
        <span className="group inline-block cursor-pointer">
          <span className="relative text-blue-500">
            Feature
            <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
          </span>
         
          <span className="relative mt-4 inline-block ">
 
          
            Posts
            <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
          </span>
        </span>
      </h1>
    
      <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
      {isLoading ? (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={400}
          animation="wave"
        />
      ) : (
        featurePostBig.slice(0, 1).map((post) => (
      
            <Card
              key={post._id}
              // className="cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              sx={{
                marginTop: "5px",
                display: "flex",
                height: { xs: "auto", lg: 650 },
                flexDirection: "column",
                // height: "100%", // Set fixed height for responsiveness
                width: "100%", // Ensure fixed width for all cards
                overflow: "hidden", // Hide overflow to prevent scroll bars
              
        
              }}
              className=" transition duration-200 ease-in-out hover:scale-[1.02] cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"

            >
              <Link 
                    href={`/${schemaSlugMap[post._type]}/${post.slug.current}`} 
                    
                   
                    >
              <Box position="relative" >
              <div className="overflow-hidden lg:aspect-[48/16]">
  <CardMedia
  component="img"
  src={urlForImage(post.mainImage).url()}
  alt={post.title}
  sx={{
    height: { xs: "auto", lg: "100%" }, // Auto height for small devices and fixed height for large devices
    width:"100%",
    objectFit: "cover",
  }}
  className="transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5]"

/>
</div>

                         {post.tags && post.tags.length > 0 && (
         <Link
         href={post.tags[0].link} className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold capitalize text-white transition duration-300 hover:bg-stone-50 hover:text-primary"
         >
           <LocalOfferIcon fontSize="small" />    {post.tags[0].name} 
         </Link>
        )}
                        </Box>
                <CardContent >
               
                

                  <h1 className="mb-8 mt-4 line-clamp-2 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight">
                  {post.title} 
                  </h1>
                  <p className="mb-4 line-clamp-4 dark-bg-green-50 rounded-bl-xl rounded-br-xl  text-base text-gray-800 dark:text-gray-400">

                  {post.overview}
                  </p>
                  <div className="mb-3 mt-3 flex items-center justify-start gap-2">
  <div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
    <CalendarMonthOutlined className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
    {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}

      </p>
  </div>
  <div className="flex items-center">
    <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
    Read Time: {post.readTime?.minutes} min
      </p>
  </div>
</div>
                  <Link
                                        href={`/${schemaSlugMap[post._type]}/${post.slug.current}`} // Construct link dynamically based on the post's schema

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
        
        )) )}
    </Grid>
     <Grid item xs={12} md={4} >
      <Grid
      className=" overflow-visible "
        sx={{
          marginTop: "5px",
          display: "flex",
       
        flexDirection: "column",
          // maxHeight: "calc(650px + 40px)", // Adjust this value based on your needs
          overflowY: "auto", // Enable vertical scrolling
          width: "100%", // Ensure fixed width for all cards
        }}
      >
      
        {isLoading ? ( 
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
       
          featureRelatedData.slice(0, 4).map((post) => (
            <Grid item key={post._id} xs={12} sm={6} md={12} padding={0} margin={0}>
            <CardContent
     key={post._id}
     sx={{
    
       display: "flex",
       marginBottom: "15px",
       flexDirection: { xs: "column", lg: "row" }, // Column layout for xs and row for lg
       alignItems: "center",
       justifyContent: "space-between",
       height: { xs: "auto", lg: "151px" }, // Auto height for xs and fixed for lg
       borderRadius:"10px",
       marginRight:"0px",
       paddingRight:"5px",
   
  
     }}
     className=" text-start transition duration-200 ease-in-out hover:scale-105 cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
   >

     <Box sx={{ flex: 1, padding:"0px", margin:"0px" }} >
       <h5 className="mb-2 mr-2 mt-2 line-clamp-2 text-base  lg:leading-6 font-medium text-start text-black dark:text-white sm:text-[16px] sm:leading-tight">
       {post.title}          
        
       </h5>  
       <div className="mb-1 mt-1 flex items-center justify-start gap-2">
       
<div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
<p className="text-xs font-medium text-body-color">
{new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}


</p>
</div>
<div className="flex items-center">
<p className="text-xs font-medium text-body-color">  5 Min Read</p>


</div>
</div>

<Link
     href={`/ai-tools/${post.slug.current}`}
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
     </Box>
   
     <Box
                     className=" inset-0  object-cover transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5]"

       component="img"
       src={urlForImage(post.mainImage).url()}
       alt="Related News"
       sx={{
         width: { xs: "100%", lg: 150 },
         height: { xs: "auto", lg: 140 },
         objectFit: "cover",
   
         marginTop:"10px",
         borderRadius:"10px"
       }}
     />
   </CardContent>
         </Grid>
          ))
        )}
      </Grid>
    </Grid>
      </Grid>
    </div>
    <br />
    <br />
  </section>
   
  );
};

export default FeaturePost;
