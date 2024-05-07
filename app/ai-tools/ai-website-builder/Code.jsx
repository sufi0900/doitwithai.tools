"use client";
import { client } from "@/sanity/lib/client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image"; // Update path if needed
import {
  Grid,
} from "@mui/material";

import Breadcrumb from "../../../components/Common/Breadcrumb";
import CardComponent from "@/components/Card/Page"
import FeaturePost from "@/components/Blog/featurePost"
const Page = () => {

  const [isLoading, setIsLoading] = useState(true); 
    const [isFeature, setIsFeature] = useState([]);
    const [isBlog, setIsBlog] = useState([]);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
        const isFeature = `*[_type == "aitool" && isAiWebsiteBuilderBig == true]`;
        const isBlog = `*[_type == "aitool" && isAiWebsiteBuilder == true]`;
  
        const isFeatureData = await client.fetch(isFeature);
        const isBlogData = await client.fetch(isBlog);
    
        setIsFeature(isFeatureData);
        setIsBlog(isBlogData);
        setIsLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Failed to fetch data", error);
        setIsLoading(false); // Ensure loading is set to false in case of error too
      }
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

{isLoading ? (
                      <Grid item xs={12}  >
<FeatureSkeleton/>
</Grid>
 ) : (
  
        isFeature.map((post) => (
          <Grid        key={post} item xs={12}  >
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
          )) )} 

   
    <br/>
    <br/>


    
    <div className="flex flex-wrap justify-center">

{isLoading ? (
    // Display Skeleton components while loading
    Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="mt-8 mx-2 mb-4  flex flex-wrap justify-center">
        <SkelCard />
      </div>
    ))
  ) : (
    isBlog.map((post) => 
      <CardComponent     key={post._id}
      tags={post.tags} 
      ReadTime={post.readTime?.minutes} 
      overview={post.overview}
     
      title={post.title}
      mainImage={urlForImage(post.mainImage).url()}
      slug={`/ai-tools/${post.slug.current}`}
      publishedAt= {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
       />
   
  )
)}
</div>

   
   
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