
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
import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard"
import MedSkeleton from "@/components/Blog/Skeleton/HomeMedCard"
import MediumCard from "@/components/Blog/HomeMediumCard"
import BigCard from "@/components/Blog/HomeBigCard"
const TrendingPage = () => {
  const [isLoading, setIsLoading] = useState(true); 

  const [trendBigData, setTrendBigData] = useState([]);
  const [trendRelatedData, setTrendRelatedData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
      const isHomePageTrendBig = `*[_type in [ "makemoney", "freeairesources", "news", "coding", "aitool", "seo"] && isHomePageTrendBig == true]`;
      const isHomePageTrendRelated =`*[_type in [ "makemoney", "freeairesources",  "news", "coding", "aitool", "seo", ] && isHomePageTrendRelated == true]`;

      const isHomePageTrendBigData = await client.fetch(isHomePageTrendBig);
      const isHomePageTrendRelatedData = await client.fetch(isHomePageTrendRelated);
     
  


      setTrendBigData(isHomePageTrendBigData);

      setTrendRelatedData(isHomePageTrendRelatedData);
      setIsLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Failed to fetch data", error);
        setIsLoading(false); // Ensure loading is set to false in case of error too
      }
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

  return (
    <section className="pb-[20px] pt-[20px]">
      <div className="container ">
      <h1 className="mb-8 text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">
                  <span className="group inline-block cursor-pointer">
                    <span className="relative text-blue-500">
                   Whats
                      <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
                    </span>
                    {/* Add space between the texts */}{" "}
                    {/* Add space between the texts */}
                    <span className="relative  inline-block ">
                      {" "}
                      {/* Apply smaller font size */}
                   Trending
                      <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </span>
                </h1>
        <Grid container spacing={2}>
          {/* Trending Post */}

      
           
                {isLoading ? (
                   <Grid item xs={12} lg={6}>
      <BigSkeleton/>
        </Grid>
      ) : (
        trendBigData.slice(0, 1).map((post) => (
          <Grid  key={post} item xs={12} lg={6}>
          <BigCard          key={post}
          title={post.title}
          overview={post.overview}
          mainImage={urlForImage(post.mainImage).url()}
          slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
          publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          ReadTime={post.readTime?.minutes}
          tags={post.tags}
/>    
</Grid>
            )) )}  
              <Grid item xs={12} sm={12}  lg={3} xl={3}>
                <Grid container flex spacing={2} className="mb-2 flex ">
 {isLoading ? ( 
     <Grid container spacing={2} marginTop={"0px"} className="mb-2" sx={{  marginLeft: {lg:"80px"} , display: 'inline-block' }}>
     <Grid item xs={12}  sx={{ display: 'inline-block',}}>
       <MedSkeleton />
     </Grid>
     <Grid item xs={12} sx={{ display: 'inline-block' }}>
       <MedSkeleton />
     </Grid>
   </Grid>
   
    
     
        ) : (

          trendRelatedData.slice(0, 2).map((post) => (
            <Grid key={post}  item xs={12}>

                                 <MediumCard          key={post}
             title={post.title}
             overview={post.overview}
             mainImage={urlForImage(post.mainImage).url()}
             slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
             publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
             ReadTime={post.readTime?.minutes}
             tags={post.tags}
/> 
</Grid>
 ))
)}
               
       
                </Grid>
              </Grid>
              <Grid item xs={12} sm={12}  lg={3} xl={3}>
              <Grid container flex spacing={2} className="mb-2 flex ">
 {isLoading ? ( 
        <Grid container spacing={2} marginTop={"0px"} className="mb-2" sx={{   marginLeft:{lg:"15px"}, display: 'inline-block' }}>
        <Grid item xs={12}  sx={{ display: 'inline-block',}}>
          <MedSkeleton />
        </Grid>
        <Grid item xs={12} sx={{ display: 'inline-block' }}>
          <MedSkeleton />
        </Grid>
      </Grid>
        ) : (

          trendRelatedData.slice(2, 4).map((post) => (
            <Grid key={post}  item xs={12}>

                                 <MediumCard          key={post}
             title={post.title}
             overview={post.overview}
             mainImage={urlForImage(post.mainImage).url()}
             slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
             publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
             ReadTime={post.readTime?.minutes}
             tags={post.tags}
/> 
</Grid>
 ))
)}
               
       
                </Grid>
              </Grid>

             
      
         
        
        </Grid>
      </div>
    </section>
  );
};

export default TrendingPage;
