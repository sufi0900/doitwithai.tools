"use client";
import SkelCard from "@/components/Blog/Skeleton/Card"
import FeatureSkeleton from "@/components/Blog/Skeleton/FeatureCard"
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
        const isFeature = `*[_type == "aitool" && isAiVideoGenBig == true]`;
        const isBlog = `*[_type == "aitool" && isAiVideoGen == true]`;
  
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
      pageName="Best AI Video"
      pageName2="Generator"
      description="Step into the future of video production with our AI Video Generator section. Explore a carefully picked collection of the best video creation tools powered by artificial intelligence (AI) that make professional-quality video production accessible to everyone. With their visually appealing effects and automated editing options, these tools help you to produce videos that are eye-catching for your audience. Great for content producers, instructors, and marketers who want to improve their video marketing techniques without having to climb a high learning curve."
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
      ReadTime={post.readTime?.minutes} 
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