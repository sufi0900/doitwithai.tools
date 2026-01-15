// app/page.jsx (your Home component)
"use client";
import React, { useState, useEffect, Suspense } from 'react';
import dynamic from "next/dynamic";
// import { useQuery } from "@tanstack/react-query";
// import { client } from "@/sanity/lib/client";
// import Grid from "@mui/material/Grid";

// Import the new context and hook
// import { GlobalOfflineStatusProvider } from "@/components/Blog/GlobalOfflineStatusContext";
import Trending from  "@/components/Trending/page"
// Dynamic imports for components
// const Trending = dynamic(() => import("@/components/Trending/page"), { ssr: true });
// import HomepageCategories from "@/components/Blog/HomepageCategories";
import FreeResourcesPage from "@/components/FreeAIResources/page";

const FeaturePost = dynamic(() => import("@/components/FeaturePost"), { ssr: true });
const AISEO = dynamic(() => import("@/components/DigitalMarketing/page"), { ssr: true });
const RecentPost = dynamic(() => import("@/components/RecentPost/RecentHome"), { ssr: true });
const MBrands = dynamic(() => import("@/components/Marquee-Brands"), { ssr: true });
const MixedCategoriesSection = dynamic(() => import("@/components/Blog/MixedCategoriesSection"), { ssr: true });
const Contact = dynamic(() => import("@/components/Contact"), { ssr: false });

export default function HomePage({ initialServerData }) {

  const {
    trending = {},
    featurePost = {},
    aiSeo = {},
    mixedCategories = {},
    recentPosts = [],
    freeResourcesFeatured = [],
  } = initialServerData || {}


  return ( 
        <>
       
        
        
            {/* --- No Suspense needed here as data is prefetched --- */}
            <Trending initialData={trending} />
        

      {/* --- No Suspense needed here as data is prefetched --- */}
      <FeaturePost initialData={featurePost} />

   
        <AISEO initialData={aiSeo} />
        {/* --- No Suspense needed here as data is prefetched --- */}
        <MixedCategoriesSection initialData={mixedCategories} />
        {/* --- FreeResourcesPage here refers to the homepage's specific featured resources --- */}
        <FreeResourcesPage initialData={freeResourcesFeatured} />
      

      {/* <HomepageCategories />   */}
      <MBrands /> 
      <RecentPost initialData={recentPosts} />

          <Contact /> 
        
    </>
  ); 
}