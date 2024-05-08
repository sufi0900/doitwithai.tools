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
  // Define the static web dev blogs
  const [codingData, setCodingData] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
    
      const isHomePageCoding = `*[_type == "coding" && isHomePageCoding == true]`;


      const isHomePageCodingData = await client.fetch(isHomePageCoding);



      setCodingData(isHomePageCodingData);

     
     
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
          link="/code-with-ai" 
          linktext="code-with-ai"
        />
        <Grid container spacing={2}>
          {/* Blog Cards */}
          <Grid item lg={8} xl={8} md={8} sm={12} xs={12} sx={{zIndex:"5"}} className="overflow-visible">
            <Grid container spacing={3} paddingRight={1} className="overflow-visible">
              {codingData.slice(0, 4).map((post) => (
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
          <Grid item lg={4} xl={4} md={4} sm={12} xs={12} sx={{zIndex:"2"}}>
            <NewsLatterBox />
          </Grid>
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

export default WebDev;
