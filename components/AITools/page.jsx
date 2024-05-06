/* eslint-disable react/jsx-key */
"use client";
import { client } from "@/sanity/lib/client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image"; 

import {
  Grid
} from "@mui/material";

import Breadcrumb from "../Common/Breadcrumb";

import SmallCard from "@/components/Blog/HomeSmallCard"
import BigCard from "@/components/Blog/HomeBigCard"
const AiTools = () => {
  const [aiToolTrendBigData, setAiToolTrendBigData] = useState([]);
  const [aiToolTrendRelatedData, setAiToolTrendRelatedData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
    
      const isHomePageAIToolTrendBig = `*[_type == "aitool" && isHomePageAIToolTrendBig == true]`;
      const isHomePageAIToolTrendRelated = `*[_type == "aitool" && isHomePageAIToolTrendRelated == true]`;

      const isHomePageAIToolTrendBigData = await client.fetch(isHomePageAIToolTrendBig);
      const isHomePageAIToolTrendRelatedData = await client.fetch(isHomePageAIToolTrendRelated);
  


      setAiToolTrendBigData(isHomePageAIToolTrendBigData);
      setAiToolTrendRelatedData(isHomePageAIToolTrendRelatedData);
     
     
    };

    fetchData();
  }, []);
  return (
    <section>
      <div className="container">
        <Breadcrumb
          pageName="Best"
          pageName2="AI Tools"
          description="Ready to take your work and creativity to the next level? The AI revolution is here, and it's changing the way we work!  Whether you're a seasoned pro or just curious to learn more Our blog explores Best AI Tools for Productivity. These tools free you from booring  tasks, boost  your skills, and supercharge  your creativity."
          // description="Stop struggling, start creating something new! Explore awesome AI tools designed to make your work easier, improve your skills, and get more done in a shorter amount of time."
          link="/ai-tools" // Specify the link here
          linktext="ai-tools"
          firstlinktext="Home"
          firstlink="/"
        />
        <Grid container spacing={2}>
     
          <Grid item xs={12} md={12} lg={6} xl={6} >
            {/* Big Blog Card */}
            {aiToolTrendBigData.slice(0, 1).map((post) => (
             <BigCard          key={post}
             title={post.title}
             overview={post.overview}
             mainImage={urlForImage(post.mainImage).url()}
             slug={`/ai-tools/${post.slug.current}`}
             publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
             ReadTime={post.readTime?.minutes}
             tags={post.tags}
/>    
            ))}
          </Grid>

          {/* Second Column: Small Blog List for First Row */}
          <Grid item xs={12} md={6}>
            {/* Small Blog List for First Row */}
            <Grid container spacing={2} >
              {aiToolTrendRelatedData.slice(1, 5).map((post) => (
                <Grid item key={post._id} xs={12} sm={6} md={12} >

                  <SmallCard      key={post}
         title={post.title}
         overview={post.overview}
         mainImage={urlForImage(post.mainImage).url()}
         slug={`/ai-tools/${post.slug.current}`}
         publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
         ReadTime={post.readTime?.minutes}
         tags={post.tags} />
  {/* <Link      href={`/ai-tools/${post.slug.current}`}    key={post._id} className=" lg:h-[151px] transition duration-200 ease-in-out hover:scale-[1.03] flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row  hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                     <div className="rounded-md overflow-hidden ">

                     <Image     
    width={500} 
    height={500} className="  transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5] lg:aspect-[18/16] object-cover w-full rounded-t-lg sm:h-auto  md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"  src={urlForImage(post.mainImage).url()} alt="" />
    
        </div>
        <div className="flex flex-col justify-between m-4 leading-normal">
        <h5 className=" lg:leading-6 line-clamp-2  lg:text-lg font-medium text-start text-black dark:text-white sm:text-[16px] sm:leading-tight">
          {post.title} tems-center pr-3 border-r border-gray-300 dark:bor
          </h5>            <div className="mb-1 mt-1 flex items-center justify-start gap-2">
          
<div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
<p className="text-sm font-medium text-body-color">
{new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}

</p>
</div>
<div className="flex items-center">
<p className="text-sm font-medium text-body-color"> 
Read Time: {post.readTime?.minutes} min

</p>


</div>


</div>  
<div>    
<Link
        href={`/ai-tools/${post.slug.current}`}
            className="my-2  inline-flex items-center rounded-lg bg-blue-700 px-3 py-1 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Read more
                      <svg
                        className="ms-2 h-3 w-3 rtl:rotate-180"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 10"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M1 5h12m0 0L9 1m4 4L9 9"
                        />
                      </svg>
                    </Link>
                    </div>
  </div>

      </Link> */}
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* First Column of Second Row: List of Blogs */}

          <Grid item xs={12} md={6}>
            {/* List of Blogs for Second Row 1st column */}
            <Grid container spacing={2} >
              {aiToolTrendRelatedData.slice(0, 4).map((post) => (
               <Grid item key={post._id} xs={12} sm={6} md={12} >
  
  <SmallCard      key={post}
         title={post.title}
         overview={post.overview}
         mainImage={urlForImage(post.mainImage).url()}
         slug={`/ai-tools/${post.slug.current}`}
         publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
         ReadTime={post.readTime?.minutes}
         tags={post.tags} />
            </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item  xs={12} md={12} lg={6} xl={6} >
            {/* Big Blog Card for the 2nd row 2nd column*/}
            {aiToolTrendBigData.slice(1, 2).map((post) => (
                <BigCard          key={post}
                title={post.title}
                overview={post.overview}
                mainImage={urlForImage(post.mainImage).url()}
                slug={`/ai-tools/${post.slug.current}`}
                publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                ReadTime={post.readTime?.minutes}
                tags={post.tags}
   />    
               ))}
            
          </Grid>
        </Grid>
        <div className="mt-6 flex justify-center md:justify-end">
          <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
          Explore More Blogs
          </button>
        </div>
      </div>
    </section>
  );
};

export default AiTools;
