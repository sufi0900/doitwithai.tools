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
        pageName="Boost SEO"
        pageName2="with AI"
        description="AI is revolutionizing how we approach SEO and digital marketing, making it smarter, faster, and more effective! In our blog, you'll find the knowledge and tools necessary to successfully integrate AI into your SEO and marketing strategies. By leveraging AI technologies, including ChatGPT, you can generate high-quality content, optimize your website effortlessly, and craft data-driven marketing campaigns. As you explore these innovative techniques, you'll unlock the potential of AI to improve rankings, attract the right audience, and remain competitive in an ever-evolving online landscape. Join us on this journey to elevate your SEO game with the power of AI and the capabilities of ChatGPT!"
        firstlinktext="Home"
        firstlink="/"
        link="/seo" 
        linktext="ai-trending-news"
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
        slug={`/seo/${post.slug.current}`}
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
        slug={`/seo/${post.slug.current}`}
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
        slug={`/seo/${post.slug.current}`}
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
        <Link href="/seo">
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
