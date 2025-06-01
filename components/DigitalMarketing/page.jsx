"use client";
import { client } from "@/sanity/lib/client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image";
import {Grid} from "@mui/material";
import HomeMediumCard from "@/components/Blog/HomeMediumCard"
import Breadcrumb from "../Common/Breadcrumb";
import SmallCard from "@/components/Blog/HomeSmallCard"
import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard"
import BigCard from "@/components/Blog/HomeBigCard"
import MedimCard from "@/components/Blog/HomeMediumCard"
import Link from "next/link";
const DigitalMarketing = () => {
  // Define the static SEO blogs
  const [seoTrendBigData, setSeoTrendBigData] = useState([]);
  const [seoTrendRelatedData, setSeoTrendRelatedData] = useState([]);
  // 
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
   
    const fetchData = async () => {
      try {
        // Updated GROQ queries to include displaySettings and all necessary fields
        const isHomePageSeoTrendBig = `*[_type == "seo" && displaySettings.isHomePageSeoTrendBig == true] {
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

        const isHomePageSeoTrendRelated = `*[_type == "seo" && displaySettings.isHomePageSeoTrendRelated == true] {
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
          client.fetch(isHomePageSeoTrendBig),
          client.fetch(isHomePageSeoTrendRelated)
        ]);

        console.log("Big Data:", bigData); // Debug log
        console.log("Related Data:", relatedData); // Debug log

        setSeoTrendBigData(bigData);
        setSeoTrendRelatedData(relatedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section>
    <div className="container">
      <Breadcrumb
        pageName="Boost SEO"
        pageName2="with AI"
        description="AI is revolutionizing how we approach SEO and digital marketing, making it smarter, faster, and more effective! In our blog, you'll find the knowledge and tools necessary to successfully integrate AI into your SEO and marketing strategies. Learn how ChatGPT and other AI tools can help generate quality content, conduct keyword research, and craft data-driven campaigns. Our practical guides help you improve rankings, target the right audience, and navigate the evolving digital landscape with confidence."
        firstlinktext="Home"
        firstlink="/"
        link="/ai-seo" 
        linktext="SEO with AI"
      /> 
      <Grid container spacing={2}>
       
        <Grid item xs={12} md={3}>
          <Grid container spacing={2} paddingX={1}>
            {seoTrendRelatedData.slice(0, 2).map((post) => (
              <Grid key={post._id} item xs={12}>

<HomeMediumCard        
        key={post}
        title={post.title}
        overview={post.overview}
        mainImage={urlForImage(post.mainImage).url()}
        slug={`/ai-seo/${post.slug.current}`}
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
            seoTrendRelatedData.slice(0, 1).map((post) => (
              <Grid key={post._id} item xs={12}>
             <BigCard        
        key={post}
        title={post.title}
        overview={post.overview}
        mainImage={urlForImage(post.mainImage).url()}
        slug={`/ai-seo/${post.slug.current}`}
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
            {seoTrendRelatedData.slice(2, 4).map((post) => (
              <Grid key={post._id} item xs={12}>
<HomeMediumCard        
        key={post}
        title={post.title}
        overview={post.overview}
        mainImage={urlForImage(post.mainImage).url()}
        slug={`/ai-seo/${post.slug.current}`}
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
        <Link href="/ai-seo">
        <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
                   Explore More Blogs         
        </button>
       </Link>
      </div>
    </div>
  </section>
   
  );
};

export default DigitalMarketing;
