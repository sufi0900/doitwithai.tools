/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useEffect, useState } from "react";


import { client } from "@/sanity/lib/client";

import Grid from "@mui/material/Grid";


import { urlForImage } from "@/sanity/lib/image"; // Update path if needed

import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard"
import MedSkeleton from "@/components/Blog/Skeleton/HomeMedCard"
import SmallCard from "@/components/Blog/HomeSmallCard"
import BigCard from "@/components/Blog/HomeBigCard"
const FeaturePost = () => {
  const [isLoading, setIsLoading] = useState(true); 

  const [featurePostBig, setFeaturePostBig] = useState([]);
  const [featureRelatedData, setFeatureRelatedData] = useState([]);  useEffect(() => {
    const fetchData = async () => {
      try {
        // Updated GROQ queries to properly access displaySettings
        const isHomePageFeatureBig = `*[_type in ["makemoney", "freeairesources", "news", "coding", "aitool", "seo"] && displaySettings.isHomePageFeatureBig == true] {
          _id,
          _type,
          title,
          overview,
          mainImage,
          slug,
          publishedAt,
          readTime,
          tags,
          "displaySettings": displaySettings
        }`;

        const isHomePageFeatureRelated = `*[_type in ["makemoney", "freeairesources", "news", "coding", "aitool", "seo"] && displaySettings.isHomePageFeatureRelated == true] {
          _id,
          _type,
          title,
          overview,
          mainImage,
          slug,
          publishedAt,
          readTime,
          tags,
          "displaySettings": displaySettings
        }`;

        // Fetch data
        const [featureBigData, featureRelatedData] = await Promise.all([
          client.fetch(isHomePageFeatureBig),
          client.fetch(isHomePageFeatureRelated)
        ]);

        console.log("Feature Big Data:", featureBigData); // Debug log
        console.log("Feature Related Data:", featureRelatedData); // Debug log

        setFeaturePostBig(featureBigData);
        setFeatureRelatedData(featureRelatedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const schemaSlugMap = {
    makemoney: "earning",
    aitool: "aitool",
    news: "news",
    coding: "coding",
    freeairesources: "free-resources",
    seo: "seo",
  };

 
  return (
    <section
    id="blog"
    className="bg-gray-light py-16 dark:bg-bg-color-dark md:py-4 lg:py-4"
  >
    <div className="container">
    <h1 className="mb-8 text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">
                  <span className="group inline-block cursor-pointer">
                    <span className="relative text-blue-500">
                    Feature

                      <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
                    </span>
                    {/* Add space between the texts */}{" "}
                    {/* Add space between the texts */}
                    <span className="relative  inline-block ">
                      {" "}
                      {/* Apply smaller font size */}
                   Posts
                      <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </span>
                </h1>
    
      <Grid container spacing={2} >
      <Grid item xs={12} lg={5} >
     
      
     {isLoading ? ( 
       <>
       <Grid container spacing={2} marginTop={"0px"} className="mb-2" sx={{  marginRight: {lg:"20px"} , display: 'inline-block', justifyContent:"center", alignItems:"center", textAlign:"center" }}>
     <Grid item xs={12}  sx={{ display: 'inline-block', justifyContent:"center", alignItems:"center", textAlign:"center" }}>
       <MedSkeleton />
     </Grid>
     <Grid item xs={12} sx={{ display: 'inline-block' }}>
       <MedSkeleton />
     </Grid>
   </Grid>
       <Grid container spacing={2} marginTop={"0px"} className="mb-2" sx={{  marginRight: {lg:"20px"} , display: 'inline-block', justifyContent:"center", alignItems:"center", textAlign:"center" }}>
     <Grid item xs={12}  sx={{ display: 'inline-block', justifyContent:"center", alignItems:"center", textAlign:"center" }}>
       <MedSkeleton />
     </Grid>
     <Grid item xs={12} sx={{ display: 'inline-block' }}>
       <MedSkeleton />
     </Grid>
   </Grid>
  

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
      <Grid item xs={12} lg={7}>
      {isLoading ? (
        <Grid item xs={12} >
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
 
      </Grid>
    </div>
    <br />
    <br />
  </section>
   
  );
};

export default FeaturePost;
