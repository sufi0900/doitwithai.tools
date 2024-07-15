"use client";
import { client } from "@/sanity/lib/client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image"; // Update path if needed
import {
  Grid
} from "@mui/material";
import SkelCard from "@/components/Blog/Skeleton/Card"
import FeatureSkeleton from "@/components/Blog/Skeleton/FeatureCard"
import CardComponent from "@/components/Card/Page"
import FeaturePost from "@/components/Blog/featurePost"
import Breadcrumb from "../../../components/Common/Breadcrumb";

const Page = () => {

  const [isLoading, setIsLoading] = useState(true); 

    const [isFeature, setIsFeature] = useState([]);
    const [isBlog, setIsBlog] = useState([]);
  
    useEffect(() => {
      const fetchData = async () => {
         try {
        const isFeature = `*[_type == "aitool" && isAiLogoGenBig == true]`;
        const isBlog = `*[_type == "aitool" && isAiLogoGen == true]`;
  
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
      pageName="Best AI Logo"
      pageName2="Generator"
      description="Easily build your brand with an expert logo! Explore the ability of AI logo creation. Without any design experience, find the perfect logo for your company in just a couple of minutes. Discover how to select the most suitable AI-generated logo for your needs"
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
         slug={`/tools/${post.slug.current}`}
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
      readTime={post.readTime?.minutes} 
      overview={post.overview}
     
      title={post.title}
      mainImage={urlForImage(post.mainImage).url()}
      slug={`/tools/${post.slug.current}`}
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