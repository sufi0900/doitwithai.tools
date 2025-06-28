// app/page.jsx (your Home component)
"use client";
import React, { useState, useEffect, Suspense } from 'react';
import dynamic from "next/dynamic";
// import { useQuery } from "@tanstack/react-query";
// import { client } from "@/sanity/lib/client";
import Grid from "@mui/material/Grid";

// Import the new context and hook
// import { GlobalOfflineStatusProvider } from "@/components/Blog/GlobalOfflineStatusContext";
import Trending from  "@/components/Trending/page"
// Dynamic imports for components
import Hero from "@/components/Hero";
// const Trending = dynamic(() => import("@/components/Trending/page"), { ssr: true });
import HomepageCategories from "@/components/Blog/HomepageCategories";
import FreeResourcesPage from "@/components/FreeAIResources/page";

const FeaturePost = dynamic(() => import("@/components/FeaturePost"), { ssr: true });
const AISEO = dynamic(() => import("@/components/DigitalMarketing/page"), { ssr: true });
const RecentPost = dynamic(() => import("@/components/RecentPost/RecentHome"), { ssr: true });
const MBrands = dynamic(() => import("@/components/Marquee-Brands"), { ssr: true });
const MixedCategoriesSection = dynamic(() => import("@/components/Blog/MixedCategoriesSection"), { ssr: true });
const Contact = dynamic(() => import("@/components/Contact"), { ssr: false });
// import CacheTestComponent from '@/React_Query_Caching/CacheTestComponent'
import { queryClient } from "@/React_Query_Caching/queryClient";
import { PageCacheProvider } from '@/React_Query_Caching/CacheProvider';
import PageCacheStatusButton from "@/React_Query_Caching/PageCacheStatusButton"


export default function HomePage({  }) {

 useEffect(() => {
    if (typeof window !== 'undefined') {
      window.queryClient = queryClient
    }
  }, [])

  return (
   
<>      
 <PageCacheProvider pageType="homepage" pageId="main">
            <PageCacheStatusButton />
         

      
          <Hero />

        
             <section className="bg-gray-light py-16 dark:bg-bg-color-dark md:py-4 lg:py-4">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-end">
                {/* Ensure GlobalRefreshButton is rendered here */}
               
              </div>
            </div>
            <div className="container">
              <Grid container spacing={2}>
                <Suspense fallback={<div>Loading trending...</div>}>
                  <Trending />
                </Suspense>
              </Grid>
            </div>
          </section>

          <Suspense fallback={<div>Loading features...</div>}>
            <FeaturePost
            />
          </Suspense>

          <Suspense fallback={<div>Loading more content...</div>}>
            <>
              <AISEO />
              <Suspense fallback={<div>Loading mixed content...</div>}>
                <MixedCategoriesSection />
              </Suspense>
              <FreeResourcesPage />
            </>
</Suspense>
 <Suspense fallback={<div>Loading categories...</div>}>
            <HomepageCategories />
          </Suspense>

   <Suspense fallback={<div>Loading recent posts...</div>}>
            <RecentPost  />
          </Suspense> 
      
            <>
              <MBrands />
              <Contact />
            </>
          
   
     </PageCacheProvider>
</>
  );
}