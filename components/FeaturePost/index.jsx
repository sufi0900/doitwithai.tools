/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useEffect, useState } from "react";


import { client } from "@/sanity/lib/client";

import Grid from "@mui/material/Grid";

import { Skeleton } from "@mui/material"; // Import Skeleton component from Material-UI

import { urlForImage } from "@/sanity/lib/image"; // Update path if needed

import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard"
import MedSkeleton from "@/components/Blog/Skeleton/HomeMedCard"
import SmallCard from "@/components/Blog/HomeSmallCard"
import BigCard from "@/components/Blog/HomeBigCard"
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
    setIsLoading(posts); 
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
    
      <Grid container spacing={2} padding={2}>
      <Grid item xs={12} lg={7}>
      {isLoading ? (
        <Grid item xs={12} lg={7}>
        <BigSkeleton/>
          </Grid>
      ) : (
        featurePostBig.slice(0, 1).map((post) => (
      
          <BigCard        
          key={post}
          title={post.title}
          overview={post.overview}
          mainImage={urlForImage(post.mainImage).url()}
          slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
          publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          ReadTime={post.readTime?.minutes}
          tags={post.tags}
/>    
        
        )) )}
    </Grid>
     <Grid item xs={12} lg={5} >
     
      
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
            <Grid item key={post._id} xs={12} sm={12} md={12}  marginBottom={2}>
                      <SmallCard 
                             key={post}
                           
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
    </div>
    <br />
    <br />
  </section>
   
  );
};

export default FeaturePost;
