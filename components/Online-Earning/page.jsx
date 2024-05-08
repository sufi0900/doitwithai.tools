"use client";
import { client } from "@/sanity/lib/client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image"; // Update path if needed
import {

  Grid,


} from "@mui/material";


import Link from "next/link";
import FeaturePost from "@/components/Blog/featurePost"
import SmallCard from "@/components/Blog/HomeSmallCard"
import FeatureSkeleton from "@/components/Blog/Skeleton/FeatureCard"
import Breadcrumb from "../Common/Breadcrumb";

const OnlineEarningPage = () => {
  // Define the static SEO blogs
  const [aiEarnTrendBigData, setAiEarnTrendBigData] = useState([]);
  const [aiEarnTrendRelatedData, setAiEarnTrendRelatedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 



  useEffect(() => {
    const fetchData = async () => {
      try {
      const isHomePageAiEarnTrendBig = `*[_type == "makemoney" && isHomePageAiEarnTrendBig == true]`;
      const isHomePageAIEarnTrendRelated = `*[_type == "makemoney" && isHomePageAIEarnTrendRelated == true]`;
      
      const isHomePageAiEarnTrendBigData = await client.fetch(isHomePageAiEarnTrendBig);
      const isHomePageAIEarnTrendRelatedData = await client.fetch(isHomePageAIEarnTrendRelated);
   

      setAiEarnTrendBigData(isHomePageAiEarnTrendBigData);
      setAiEarnTrendRelatedData(isHomePageAIEarnTrendRelatedData);
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
          pageName="Make Money"
          pageName2="With AI"
          description="Discover useful tips and tools to help you earn money online. From freelancing to affiliate marketing, explore valuable resources to start and grow your online income streams. Start making money online today!"
          firstlinktext="Home"
          firstlink="/"
          link="/make-money-with-ai" 
      
          linktext="make-money-with-ai"
         
  
        />
        <Grid container spacing={2}>
       
        {isLoading ? (
                      <Grid item xs={12}  >
<FeatureSkeleton/>
</Grid>
 ) : (
          aiEarnTrendBigData.slice(0, 1).map((post) => (
            <Grid item key={post._id} xs={12} md={12}>
              <FeaturePost
         key={post}
         title={post.title}
         overview={post.overview}
         mainImage={urlForImage(post.mainImage).url()}
         slug={`/make-money-with-ai/${post.slug.current}`}
         date={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
         readTime={post.readTime?.minutes}
         tags={post.tags}

         />

            </Grid>
           )) )}  
          {/* Second Row: Blogs Displaying Below Big Blogs */}
          {/* First Column */}
          {aiEarnTrendRelatedData.slice(0, 2).map((post) => (
            <Grid item key={post._id} xs={12} md={6}>
            
            
            <SmallCard
         key={post}
         title={post.title}
         overview={post.overview}
         mainImage={urlForImage(post.mainImage).url()}
         slug={`/make-money-with-ai/${post.slug.current}`}
         date={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
         readTime={post.readTime?.minutes}
         tags={post.tags}

         />

            
            </Grid>
          ))}
          {/* Second Column */}
          {aiEarnTrendRelatedData.slice(2, 4).map((post) => (
            <Grid item key={post._id} xs={12} md={6}>
                 <SmallCard
         key={post}
         title={post.title}
         overview={post.overview}
         mainImage={urlForImage(post.mainImage).url()}
         slug={`/make-money-with-ai/${post.slug.current}`}
         date={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
         readTime={post.readTime?.minutes}
         tags={post.tags}

         />
            </Grid>
          ))}
        </Grid>
        <div className="mt-6 flex justify-center md:justify-end">
          <Link                          href="/make-money-with-ai"
>
          <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
          Explore All Blogs
          </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OnlineEarningPage;
