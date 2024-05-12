"use client";
import { client } from "@/sanity/lib/client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image";
import {


  Grid,

 
} from "@mui/material";


import Breadcrumb from "../Common/Breadcrumb";

import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard"

import BigCard from "@/components/Blog/HomeBigCard"
import MedimCard from "@/components/Blog/HomeMediumCard"
const DigitalMarketing = () => {
  // Define the static SEO blogs
  const [seoTrendBigData, setSeoTrendBigData] = useState([]);
  const [seoTrendRelatedData, setSeoTrendRelatedData] = useState([]);
  // 
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const fetchData = async () => {
    try {
      const isHomePageSeoTrendBig = `*[_type == "seo" && isHomePageSeoTrendBig == true]`;
      const isHomePageSeoTrendRelated = `*[_type == "seo" && isHomePageSeoTrendRelated == true]`;
      // 
      const isHomePageSeoTrendBigData = await client.fetch(isHomePageSeoTrendBig);
      const isHomePageSeoTrendRelatedData = await client.fetch(isHomePageSeoTrendRelated);
      // 

      setSeoTrendBigData(isHomePageSeoTrendBigData);
      setSeoTrendRelatedData(isHomePageSeoTrendRelatedData);
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
          pageName="AI in SEO &"
          pageName2="Digital Marketing "
          description="The digital marketing landscape is changing rapidly, and AI is leading the way!  Our blog equips you with the knowledge and tools to leverage AI for SEO and marketing success. Discover how AI can help you generate high-quality content, optimize your website, and craft data-driven marketing campaigns.  Explore expert tips on using AI tools like SEO AI and ChatGPT to write SEO-friendly blog posts, improve rankings, and  drive massive traffic.  Embrace the power of AI and take your digital marketing to the next level! "
          firstlinktext="Home"
          firstlink="/"
          link="/seo" 
          linktext="seo-with-ai" 
        />

        <Grid container spacing={2} >
        {isLoading ? (
        <Grid item xs={12}   >
        <BigSkeleton/>
      
          </Grid>
      ) : (
          seoTrendBigData.slice(0, 2).map((post) => (
            <Grid item key={post._id} xs={12} md={6} >
              <BigCard 
                  key={post}
                  title={post.title}
                  overview={post.overview}
                  mainImage={urlForImage(post.mainImage).url()}
                  slug={`/seo/${post.slug.current}`}
                  publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  ReadTime={post.readTime?.minutes}
                  tags={post.tags}
                  /> 
                            
                
            </Grid>
          )))}
 
          {seoTrendRelatedData.slice(0, 4).map((post) => (
            <Grid item key={post._id} xs={12} sm={6} md={3} marginTop={1}>
               <MedimCard
                  key={post}
                  title={post.title}
                  overview={post.overview}
                  mainImage={urlForImage(post.mainImage).url()}
                  slug={`/seo/${post.slug.current}`}
                  publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  ReadTime={post.readTime?.minutes}
                  tags={post.tags}
                  /> 
                            
                
            </Grid>
          ))}
        </Grid>
        <div className="mt-6 flex justify-center md:justify-end">
          <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
          Explore All Blogs
          </button>
        </div>
      </div>
    </section>
  );
};

export default DigitalMarketing;
