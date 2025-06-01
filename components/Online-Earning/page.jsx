"use client";
import { client } from "@/sanity/lib/client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image"; // Update path if needed
import {

  Grid,


} from "@mui/material";
import SmallCard from "@/components/Blog/HomeSmallCard"


import Link from "next/link";
import FeaturePost from "@/components/Blog/featurePost"

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
        // Updated GROQ queries to include displaySettings and all necessary fields
        const isHomePageAiEarnTrendBig = `*[_type == "makemoney" && displaySettings.isHomePageAiEarnTrendBig == true] {
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

        const isHomePageAIEarnTrendRelated = `*[_type == "makemoney" && displaySettings.isHomePageAIEarnTrendRelated == true] {
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
          client.fetch(isHomePageAiEarnTrendBig),
          client.fetch(isHomePageAIEarnTrendRelated)
        ]);

        console.log("Big Data:", bigData); // Debug log
        console.log("Related Data:", relatedData); // Debug log

        setAiEarnTrendBigData(bigData);
        setAiEarnTrendRelatedData(relatedData);
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
          pageName="Make Money"
          pageName2="With AI"
          description="Tap into the endless possibilities of AI to generate income and transform your financial future! In this category, we share actionable tips, tools, and strategies. These will help you earn online, whether through freelancing, affiliate marketing, or creative ventures. Explore how AI-powered tools like ChatGPT can simplify tasks, enhance productivity, and open up new revenue streams. Start your journey today and turn AI into your ultimate earning partner!"
          firstlinktext="Home"
          firstlink="/"
          link="/ai-learn-earn" 
      
          linktext="earning"
         
  
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
         slug={`/ai-learn-earn/${post.slug.current}`}
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
         slug={`/ai-learn-earn/${post.slug.current}`}
         publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
         ReadTime={post.readTime?.minutes}
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
         slug={`/ai-learn-earn/${post.slug.current}`}
         date={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
         readTime={post.readTime?.minutes}
         tags={post.tags}

         />
            </Grid>
          ))}
        </Grid>
        <div className="mt-6 flex justify-center md:justify-end">
          <Link                          href="/ai-learn-earn"
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
