"use client";
import { client } from "@/sanity/lib/client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image"; 
import { Card, CardContent, Grid, CardMedia, Typography } from "@mui/material";
import NewsLatterBox from "../Contact/NewsLatterBox";
import Breadcrumb from "../Common/Breadcrumb";
import {  LocalOffer,  CalendarMonthOutlined } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Link from "next/link";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FeaturePost from "@/components/Blog/featurePost"

const WebDev = () => {
  const [aiEarnTrendBigData, setAiEarnTrendBigData] = useState([]);
    const [aiEarnTrendRelatedData, setAiEarnTrendRelatedData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); 

    useEffect(() => {
     const fetchData = async () => {
        try {
          // Updated GROQ queries to include displaySettings and all necessary fields
          const isHomePageAiEarnTrendBig = `*[_type == "coding" && displaySettings.isHomePageCoding == true] {
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
          ]);
  
          console.log("Big Data:", bigData); // Debug log
          console.log("Related Data:", relatedData); // Debug log
  
          setAiEarnTrendBigData(bigData);
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
          pageName="Code"
          pageName2="With AI"
          description="The future of coding is here! Explore how AI can become your powerful coding partner. Our blog teaches you to leverage tools like ChatGPT to generate website code (HTML, CSS, React, etc.) and build beautiful UI components.  Learn to optimize existing code (MERN Stack, Next.js), solve coding challenges, and streamline your development process.  We even offer free website templates built with AI!  Unlock the potential of AI and code like never before!"
          firstlinktext="Home"
          firstlink="/"
          link="/ai-code" 
          linktext="code-with-ai"
        />
        <Grid container spacing={2}>
          {/* Blog Cards */}
          <Grid item lg={12} xl={12} md={12} sm={12} xs={12} sx={{zIndex:"5"}} className="overflow-visible">
            <Grid container spacing={3} paddingRight={1} className="overflow-visible">
              {aiEarnTrendBigData.slice(0, 4).map((post) => (
                <Grid key={post._id} item xs={12} className="overflow-visible">
                    <FeaturePost 
                    key={post}
                    title={post.title}
                    overview={post.overview}
                    mainImage={urlForImage(post.mainImage).url()}
                    slug={`/coding/${post.slug.current}`}
                    date={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    readTime={post.readTime?.minutes}
                    tags={post.tags}
                        />    
                
                </Grid>
              ))}
            </Grid>
          </Grid>
          {/* Newsletter Box */}
         
        </Grid>
        
      </div>
    </section>
  );
};

export default WebDev;
