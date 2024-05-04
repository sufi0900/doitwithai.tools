/* eslint-disable react/jsx-key */
"use client";
import { client } from "@/sanity/lib/client";
import React, { useEffect, useState } from "react";
import { urlForImage } from "@/sanity/lib/image"; 
import {
  Card,
  CardContent,
  Grid,
  CardMedia,
} from "@mui/material";
import Box from "@mui/material/Box";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {  CalendarMonthOutlined } from "@mui/icons-material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

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
          {/* First Row: Big Blog and Small Blog List */}
          {/* First Column: Big Blog */}
          <Grid item xs={12} md={12} lg={6} xl={6} >
            {/* Big Blog Card */}
            {aiToolTrendBigData.slice(0, 1).map((post) => (
               <Card key={post._id} className="cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                {/* <div className="overflow-hidden lg:aspect-[35/16]"> */}
                <Box position="relative">
                <CardMedia
  component="img"
  src={urlForImage(post.mainImage).url()}
  alt={post.title}
  sx={{
    height: { xs: "auto", lg: 312 }, // Auto height for small devices and fixed height for large devices
    objectFit: "cover",
  }}
/>
                       
                        {/* </div> */}
                        {post.tags && post.tags.length > 0 && (
          <Link href={post.tags[0].link} className="  absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold capitalize text-white transition duration-300 hover:bg-stone-50 hover:text-primary">
           <LocalOfferIcon  style={{fontSize:"14px"}} />   {post.tags[0].name}
          </Link>
        )}
                        </Box>

               <CardContent>
               <h1 className="mb-4 line-clamp-2 text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-3xl sm:leading-tight" style={{ minHeight: "4.5rem" }}>
               {post.title}      
</h1>

<p className="mb-4 line-clamp-4 text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg lg:text-base xl:text-lg" style={{ minHeight: "7rem" }}>
{post.overview} 
</p>

 <div className="mb-3 mt-3 flex items-center justify-start gap-2">
 <div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
   <CalendarMonthOutlined className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
   <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
   {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}

    </p>
 </div>
 <div className="flex items-center">
   <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
   <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
   Read Time: {post.readTime?.minutes} min
    </p>
 </div>
</div>
 <Link
      href={`/ai-tools/${post.slug.current}`}

   className="mt-4 inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
 >
   Read more
   <svg
     className="ms-2 h-3.5 w-3.5 rtl:rotate-180"
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
             
</CardContent>

             </Card>
            ))}
          </Grid>

          {/* Second Column: Small Blog List for First Row */}
          <Grid item xs={12} md={6}>
            {/* Small Blog List for First Row */}
            <Grid container spacing={2}>
              {aiToolTrendRelatedData.slice(1, 5).map((post) => (
                <Grid item key={post._id} xs={12} sm={6} md={12} >
                   <CardContent
            key={post._id}
            sx={{
              // marginBottom: "5px",
              display: "flex",
             
              flexDirection: { xs: "column", lg: "row" }, // Column layout for xs and row for lg
              alignItems: "center",
              justifyContent: "space-between",
              height: { xs: "auto", lg: "151px" }, // Auto height for xs and fixed for lg
              borderRadius:"10px",
              marginRight:"0px",
              paddingRight:"5px",
          
         
            }}
            className="transition duration-200 ease-in-out hover:scale-105 cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
   
            <Box sx={{ flex: 1, padding:"0px", margin:"0px" }} >
              <h5 className="mb-2 mr-2 mt-2 lg:leading-6 line-clamp-2 text-base font-medium text-start text-black dark:text-white sm:text-[16px] sm:leading-tight">
              {post.title} 
              </h5>  
              <div className="mb-1 mt-1 flex items-center justify-start gap-2">
              
<div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
<p className="text-xs font-medium text-body-color">
{new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}

    </p>
</div>
<div className="flex items-center">
<p className="text-xs font-medium text-body-color"> 
Read Time: {post.readTime?.minutes} min

</p>

  
</div>
</div>

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
            </Box>
          
            <Box
                            className=" inset-0  object-cover transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5]"

              component="img"
              src={urlForImage(post.mainImage).url()}
              alt="Related News"
              sx={{
                width: { xs: "100%", lg: 150 },
                height: { xs: "auto", lg: 140 },
                objectFit: "cover",
          
                marginTop:"10px",
                borderRadius:"10px"
              }}
            />
          </CardContent>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* First Column of Second Row: List of Blogs */}

          <Grid item xs={12} md={6}>
            {/* List of Blogs for Second Row 1st column */}
            <Grid container spacing={2}>
              {aiToolTrendRelatedData.slice(5, 8).map((post) => (
              <Grid item key={post._id} xs={12} sm={6} md={12} >
              <CardContent
       key={post._id}
       sx={{
         // marginBottom: "5px",
         display: "flex",
        
         flexDirection: { xs: "column", lg: "row" }, // Column layout for xs and row for lg
         alignItems: "center",
         justifyContent: "space-between",
         height: { xs: "auto", lg: "151px" }, // Auto height for xs and fixed for lg
         borderRadius:"10px",
         marginRight:"0px",
         paddingRight:"5px",
     
    
       }}
       className="transition duration-200 ease-in-out hover:scale-105 cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
     >

       <Box sx={{ flex: 1, padding:"0px", margin:"0px" }} >
         <h5 className="mb-2 mr-2 mt-2 lg:leading-6 line-clamp-2 text-base font-medium text-start text-black dark:text-white sm:text-[16px] sm:leading-tight">
         {post.title}  
         </h5>  
         <div className="mb-1 mt-1 flex items-center justify-start gap-2">
         
<div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
<p className="text-xs font-medium text-body-color">
{new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}

</p>
</div>
<div className="flex items-center">
<p className="text-xs font-medium text-body-color"> 
Read Time: {post.readTime?.minutes} min
</p>


</div>
</div>

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
       </Box>
     
       <Box
                       className=" inset-0  object-cover transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5]"

         component="img"
         src={urlForImage(post.mainImage).url()}
         alt="Related News"
         sx={{
           width: { xs: "100%", lg: 150 },
           height: { xs: "auto", lg: 140 },
           objectFit: "cover",
     
           marginTop:"10px",
           borderRadius:"10px"
         }}
       />
     </CardContent>
           </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item  xs={12} md={12} lg={6} xl={6}>
            {/* Big Blog Card for the 2nd row 2nd column*/}
            {aiToolTrendBigData.slice(1, 2).map((post) => (
                 <Card key={post._id} className="cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                 {/* <div className="overflow-hidden lg:aspect-[35/16]"> */}
                 <Box position="relative">
                 <CardMedia
   component="img"
   src={urlForImage(post.mainImage).url()}
   alt={post.title}
   sx={{
     height: { xs: "auto", lg: 312 }, // Auto height for small devices and fixed height for large devices
     objectFit: "cover",
   }}
 />
                        
                         {/* </div> */}
                         {post.tags && post.tags.length > 0 && (
           <Link href={post.tags[0].link} className="  absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold capitalize text-white transition duration-300 hover:bg-stone-50 hover:text-primary">
            <LocalOfferIcon  style={{fontSize:"14px"}} />   {post.tags[0].name}
           </Link>
         )}
                         </Box>
 
                <CardContent>
                <h1 className="mb-4 line-clamp-2 text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-3xl sm:leading-tight" style={{ minHeight: "4.5rem" }}>
                {post.title}      
 </h1>
 
 <p className="mb-4 line-clamp-4 text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg lg:text-base xl:text-lg" style={{ minHeight: "7rem" }}>
 {post.overview} 
 </p>
 
  <div className="mb-3 mt-3 flex items-center justify-start gap-2">
  <div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
    <CalendarMonthOutlined className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
    {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
 
     </p>
  </div>
  <div className="flex items-center">
    <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
    Read Time: {post.readTime?.minutes} min
     </p>
  </div>
 </div>
  <Link
       href={`/ai-tools/${post.slug.current}`}
 
    className="mt-4 inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
  >
    Read more
    <svg
      className="ms-2 h-3.5 w-3.5 rtl:rotate-180"
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
              
 </CardContent>
 
              </Card>
            ))}
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

export default AiTools;
