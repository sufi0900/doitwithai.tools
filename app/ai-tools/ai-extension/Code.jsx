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
    const [isAiExtensionBig, setIsAiExtensionBig] = useState([]);
    const [isAiExtension, setIsAiExtension] = useState([]);
  
    useEffect(() => {
      const fetchData = async () => {
      
        const isAiExtensionBig = `*[_type == "aitool" && isAiExtensionBig == true]`;
        const isAiExtension = `*[_type == "aitool" && isAiExtension == true]`;
  
        const isAiExtensionBigData = await client.fetch(isAiExtensionBig);
        const isAiExtensionData = await client.fetch(isAiExtension);
    
        setIsAiExtensionBig(isAiExtensionBigData);
        setIsAiExtension(isAiExtensionData);
       
      };
  
      fetchData();
    }, []);

  return (
    <div className="container mt-8">
    <Breadcrumb
      pageName="Best AI Chrome"
      pageName2="Extension"
      description="Enhance your digital experience with our selection of the best AI Extensions. With the help of these powerful tools, which can easily connect to Google Chrome and Microsoft Edge, you have access to intelligent functionality anywhere you need it.  AI Extensions simplify complicated tasks and increase productivity. They can be used for everything from language translation to productivity enhancements. Explore our comprehensive reviews to select the best AI extension for your requirements and start transforming your workflow instantly."
      link="/digital-marketing" // Specify the link here
      firstlinktext="Home"
      firstlink="/"
    />
       <Grid container spacing={2}>
      {/* First Row: one Big Blogs */}
      {isAiExtensionBig.slice(0, 1).map((post) => (
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
   
            {isAiExtension.map((post) => (
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