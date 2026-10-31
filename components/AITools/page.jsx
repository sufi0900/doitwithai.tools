/* eslint-disable react/jsx-key */
"use client";
import { client } from "@/sanity/lib/client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image"; 

import {
  Grid
} from "@mui/material";

import Breadcrumb from "../Common/Breadcrumb";
import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard"
import MedSkeleton from "@/components/Blog/Skeleton/HomeMedCard"
import SmallCard from "@/components/Blog/HomeSmallCard"
import BigCard from "@/components/Blog/HomeBigCard"
import Link from "next/link";
const AiTools = () => {
  const [aiToolTrendBigData, setAiToolTrendBigData] = useState([]);
  const [aiToolTrendRelatedData, setAiToolTrendRelatedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {


    const fetchData = async () => {
      try {
        // Updated GROQ queries to include displaySettings and all necessary fields
        const isHomePageAIToolTrendBig = `*[_type == "aitool" && displaySettings.isHomePageAIToolTrendBig == true] {
          _id,
          title,
          overview,
          mainImage,
          slug,
          publishedAt,
          readTime,
          tags,
          "displaySettings": displaySettings
        }`;

        const isHomePageAIToolTrendRelated = `*[_type == "aitool" && displaySettings.isHomePageAIToolTrendRelated == true] {
          _id,
          title,
          overview,
          mainImage,
          slug,
          publishedAt,
          readTime,
          tags,
          "displaySettings": displaySettings
        }`;

        // Fetch data in parallel
        const [bigData, relatedData] = await Promise.all([
          client.fetch(isHomePageAIToolTrendBig),
          client.fetch(isHomePageAIToolTrendRelated)
        ]);

        console.log("Big Data:", bigData); // Debug log
        console.log("Related Data:", relatedData); // Debug log

        setAiToolTrendBigData(bigData);
        setAiToolTrendRelatedData(relatedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="">
    <div className="container">
    <Breadcrumb
        pageName="Best AI Tools"
        pageName2="for Productivity"
        description="Unlock the power of AI to enhance productivity and creativity like never before! This category explores the best AI tools designed to streamline tasks. These tools can supercharge your efficiency and elevate your creative projects. Whether you are a professional looking for smart solutions or just starting your journey with AI, our reviews and insights will help you find the right tools. These tools can transform the way you work. Discover how AI can simplify your workload. It can also unleash your full potential!"
        firstlinktext="Home"
        firstlink="/"
        link="/ai-tools" 
        linktext="aitools"     />
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
        {aiToolTrendBigData.slice(0, 1).map((post) => (

                <BigCard 
                key={post}
                title={post.title}
                overview={post.overview}
                mainImage={urlForImage(post.mainImage).url()}
                slug={`/ai-tools/${post.slug.current}`}
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
   
        aiToolTrendBigData.slice(1, 2).map((post) => (
           <BigCard 
           key={post}
           title={post.title}
           overview={post.overview}
           mainImage={urlForImage(post.mainImage).url()}
           slug={`/ai-tools/${post.slug.current}`}
           publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
           ReadTime={post.readTime?.minutes}
           tags={post.tags}
           /> 
              )   ))}
        </Grid>

        <Grid item xs={12} md={4}>
        {aiToolTrendBigData.slice(2, 3).map((post) => (
         <BigCard 
         key={post}
         title={post.title}
         overview={post.overview}
         mainImage={urlForImage(post.mainImage).url()}
         slug={`/ai-tools/${post.slug.current}`}
         publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
         ReadTime={post.readTime?.minutes}
         tags={post.tags}
         /> 
                ))}
        </Grid>

        {/* Small Blogs */}
        {aiToolTrendRelatedData.slice(0, 3).map((post) => (
          <Grid key={post._id} item xs={12} md={4}>
                         <SmallCard 
                key={post}
                title={post.title}
                overview={post.overview}
                mainImage={urlForImage(post.mainImage).url()}
                slug={`/ai-tools/${post.slug.current}`}
                publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                ReadTime={post.readTime?.minutes}
                tags={post.tags}
                /> 
          </Grid>
        ))}
      </Grid>
      <div className="mt-6 flex justify-center md:justify-end">
        <Link href="/ai-tools">
        <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
        Explore All Blogs
        </button>
        </Link>
      </div>
    </div>
  </section>
  );
};

export default AiTools;
