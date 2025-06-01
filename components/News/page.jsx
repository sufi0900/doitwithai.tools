/* eslint-disable react/no-unescaped-entities */
"use client";
import { client } from "@/sanity/lib/client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image"; // Update path if needed
import {
  Grid
} from "@mui/material";
import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard"

import HomeMediumCard from "@/components/Blog/HomeMediumCard"

import BigCard from "@/components/Blog/HomeBigCard"


import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
const News = () => {

  const [isLoading, setIsLoading] = useState(true); 

  const [newsTrendBigData, setNewsTrendBigData] = useState([]);
  const [newsTrendRelatedData, setNewsTrendRelatedData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
    try {
      const isHomePageNewsTrendBig = `*[_type == "news" && isHomePageNewsTrendBig == true]`;
      const isHomePageNewsTrendRelated = `*[_type == "news" && isHomePageNewsTrendRelated == true]`;

      const isHomePageNewsTrendBigData = await client.fetch(isHomePageNewsTrendBig);
      const isHomePageNewsTrendRelatedData = await client.fetch(isHomePageNewsTrendRelated);
 


      setNewsTrendBigData(isHomePageNewsTrendBigData);
      setNewsTrendRelatedData(isHomePageNewsTrendRelatedData);
     
      setIsLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error("Failed to fetch data", error);
      setIsLoading(false); // Ensure loading is set to false in case of error too
    }
  };

  fetchData();
}, []); 
  return (
    <section>
      <div className="container">
        <Breadcrumb
          pageName="AI News"
          pageName2="& Trends"
          description="Are you curious about the latest breakthroughs in artificial intelligence? Look no further! Our blog keeps you at the forefront of AI news and trends.  We deliver in-depth analysis of cutting-edge AI developments, from OpenAI's advancements to the impact of AI on various industries. Explore the exciting possibilities of AI and its potential to reshape our world!"
          firstlinktext="Home"
          firstlink="/"
          link="/news" 
          linktext="ai-trending-news"
        />
        <Grid container spacing={2}>
         
          <Grid item xs={12} md={3}>
            <Grid container spacing={3} paddingX={1}>
              {newsTrendRelatedData.slice(0, 2).map((post) => (
                <Grid key={post._id} item xs={12}>

<HomeMediumCard        
          key={post}
          title={post.title}
          overview={post.overview}
          mainImage={urlForImage(post.mainImage).url()}
          slug={`/news/${post.slug.current}`}
          publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          ReadTime={post.readTime?.minutes}
          tags={post.tags}
/>            
                </Grid>
              ))}
            </Grid>
          </Grid>
     
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
            {isLoading ? (
        <Grid item xs={12} >
        <BigSkeleton/>
          </Grid>
      ) : (
              newsTrendBigData.slice(0, 1).map((post) => (
                <Grid key={post._id} item xs={12}>
               <BigCard        
          key={post}
          title={post.title}
          overview={post.overview}
          mainImage={urlForImage(post.mainImage).url()}
          slug={`/news/${post.slug.current}`}
          publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          ReadTime={post.readTime?.minutes}
          tags={post.tags}
/>  
                </Grid>
                 )) )}
            </Grid>
          </Grid>
          <Grid item xs={12} md={3}>
            <Grid container spacing={2} paddingX={1}>
              {newsTrendRelatedData.slice(2, 4).map((post) => (
                <Grid key={post._id} item xs={12}>
<HomeMediumCard        
          key={post}
          title={post.title}
          overview={post.overview}
          mainImage={urlForImage(post.mainImage).url()}
          slug={`/news/${post.slug.current}`}
          publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          ReadTime={post.readTime?.minutes}
          tags={post.tags}
/> 
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
        <div className="mt-6 flex justify-center md:justify-end">
          <Link href="/news">
          <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
                     Explore More Blogs         
          </button>
         </Link>
        </div>
      </div>
    </section>
  );
};

export default News;
