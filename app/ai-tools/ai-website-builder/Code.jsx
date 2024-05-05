"use client";
import { client } from "@/sanity/lib/client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image"; // Update path if needed
import {
  Grid,
} from "@mui/material";
import CardComponent from "@/components/Card/Page"
import FeaturePost from "@/components/Blog/featurePost"
import Breadcrumb from "../../../components/Common/Breadcrumb";

const Page = () => {
    const [isFeature, setIsFeature] = useState([]);
    const [isBlog, setIsBlog] = useState([]);
  
    useEffect(() => {
      const fetchData = async () => {
      
        const isFeature = `*[_type == "aitool" && isAiWebsiteBuilderBig == true]`;
        const isBlog = `*[_type == "aitool" && isAiWebsiteBuilder == true]`;
  
        const isFeatureData = await client.fetch(isFeature);
        const isBlogData = await client.fetch(isBlog);
    
        setIsFeature(isFeatureData);
        setIsBlog(isBlogData);
       
      };
  
      fetchData();
    }, []);

  return (
    <div className="container mt-8">
    <Breadcrumb
      pageName="Best AI Website"
      pageName2="Builder"
      description="No knowledge of coding is required! Explore the power of AI website builders to easily create the website of your dreams. Our blog offers comprehensive reviews to help you choose the perfect AI tool for creating eye-catching websites. Use artificial intelligence (AI) to complete your website goals, whether they are for personal blogs or e-commerce sites. Start now. Get started today."
      link="/digital-marketing" // Specify the link here
      firstlinktext="Home"
      firstlink="/"
    />
    <Grid container spacing={2}>
      {/* First Row: one Big Blogs */}
      {isFeature.slice(0, 1).map((post) => (
        <Grid item key={post._id} xs={12} md={12}>
          <FeaturePost
         key={post}
         title={post.title}
         overview={post.overview}
         mainImage={urlForImage(post.mainImage).url()}
         slug={`/ai-tools/${post.slug.current}`}
         date={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
         readTime={post.readTime?.minutes}
         tags={post.tags}

         />
        </Grid>
      ))}
    
    <br/>
    <br/>
    <Grid item  xs={12} md={12}>
      <div className="-mx-4  m-8  mt-8 flex flex-wrap justify-center">
   
            {isBlog.map((post) => (
              <CardComponent     key={post._id}
              tags={post.tags} 
              ReadTime={post.readTime?.minutes} 
              overview={post.overview}
             
              title={post.title}
              mainImage={urlForImage(post.mainImage).url()}
              slug={`/ai-tools/${post.slug.current}`}
              publishedAt= {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
               />
            ))}
       
          </div>
          </Grid>
   
    </Grid>
    <div className="mt-8 flex justify-center md:justify-end">
      <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
        Read more
      </button>
    </div>
  </div>
  )
}

export default Page