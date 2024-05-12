/* eslint-disable react/no-unescaped-entities */
"use client";

import { client } from "@/sanity/lib/client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image"; 
import {
  Grid,
} from "@mui/material";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard"
import SmallCard from "@/components/Blog/HomeSmallCard"
import BigCard from "@/components/Blog/HomeBigCard"

const FreeAIResources = () => {
  const [isLoading, setIsLoading] = useState(true); 

  const [digitalTrendBigData, setDigitalTrendBigData] = useState([]);
  const [digitalTrendRelatedData, setDigitalTrendRelatedData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
    
      const isHomePageDigitalTrendBig = `*[_type == "freeairesources" && isHomePageDigitalTrendBig == true]`;
      const isHomePageDigitalTrendRelated = `*[_type == "freeairesources" && isHomePageDigitalTrendRelated == true]`;

      const isHomePageDigitalTrendBigData = await client.fetch(isHomePageDigitalTrendBig);
      const isHomePageDigitalTrendRelatedData = await client.fetch(isHomePageDigitalTrendRelated);
  


      setDigitalTrendBigData(isHomePageDigitalTrendBigData);
      setDigitalTrendRelatedData(isHomePageDigitalTrendRelatedData);
      setIsLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error("Failed to fetch data", error);
      setIsLoading(false); // Ensure loading is set to false in case of error too
    }
  };

  fetchData();
}, []); 
  return (
    <section className="">
      <div className="container">
      <Breadcrumb
          pageName="Free AI Resources"
          pageName2=" & Solution"
          description="Supercharge your creativity and problem-solving skills with free AI resources! Our blog provides an extensive collection of useful resources, including stunning, free, non-copyrighted AI-generated images and creative writing prompts for various tasks. Discover how AI can be applied to different fields to solve problems and enhance your work. Explore the potential of AI and see how it can empower you in any domain!"
          firstlinktext="Home"
          firstlink="/"
          link="/free-resources" 
          linktext="free-resources"     />
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
          {digitalTrendBigData.slice(0, 1).map((post) => (

                  <BigCard 
                  key={post}
                  title={post.title}
                  overview={post.overview}
                  mainImage={urlForImage(post.mainImage).url()}
                  slug={`/free-resources/${post.slug.current}`}
                  publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  ReadTime={post.readTime?.minutes}
                  tags={post.tags}
                  /> 
                            
               ))}
          </Grid>

          <Grid item xs={12} md={4}>
          {isLoading ? (
        <Grid item xs={12} >
        <BigSkeleton/>
          </Grid>
      ) : (
     
          digitalTrendBigData.slice(1, 2).map((post) => (
             <BigCard 
             key={post}
             title={post.title}
             overview={post.overview}
             mainImage={urlForImage(post.mainImage).url()}
             slug={`/free-resources/${post.slug.current}`}
             publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
             ReadTime={post.readTime?.minutes}
             tags={post.tags}
             /> 
                )   ))}
          </Grid>

          <Grid item xs={12} md={4}>
          {digitalTrendBigData.slice(2, 3).map((post) => (
           <BigCard 
           key={post}
           title={post.title}
           overview={post.overview}
           mainImage={urlForImage(post.mainImage).url()}
           slug={`/free-resources/${post.slug.current}`}
           publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
           ReadTime={post.readTime?.minutes}
           tags={post.tags}
           /> 
                  ))}
          </Grid>

          {/* Small Blogs */}
          {digitalTrendRelatedData.slice(0, 3).map((post) => (
            <Grid key={post._id} item xs={12} md={4}>
                           <SmallCard 
                  key={post}
                  title={post.title}
                  overview={post.overview}
                  mainImage={urlForImage(post.mainImage).url()}
                  slug={`/free-resources/${post.slug.current}`}
                  publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  ReadTime={post.readTime?.minutes}
                  tags={post.tags}
                  /> 
            </Grid>
          ))}
        </Grid>
        <div className="mt-6 flex justify-center md:justify-end">
          <Link href="/free-resources">
          <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
          Explore All Blogs
          </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FreeAIResources;
