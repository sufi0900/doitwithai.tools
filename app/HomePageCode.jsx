"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/sanity/lib/client";
import Grid from "@mui/material/Grid";
// Dynamic imports for components
// const Hero = dynamic(() => import("@/components/Hero"), { ssr: true });
import Hero from "@/components/Hero";
const Trending = dynamic(() => import("@/components/Trending/page"), { ssr: true });
// import Trending from "@/components/Trending/page";
import FreeResourcesPage from "@/components/FreeAIResources/page";
const FeaturePost = dynamic(() => import("@/components/FeaturePost"), { ssr: true });
const AISEO = dynamic(() => import("@/components/DigitalMarketing/page"), { ssr: true });
const AiTools = dynamic(() => import("@/components/AITools/page"), { ssr: true });
const AIEarn = dynamic(() => import("@/components/Online-Earning/page"), { ssr: true });
const CodeWithAI = dynamic(() => import("@/components/Trending/WebDev"), { ssr: true });
const RecentPost = dynamic(() => import("@/components/RecentPost/page"), { ssr: true });
const MainCategory = dynamic(() => import("@/components/MainCategories/page"), { ssr: false });
const MBrands = dynamic(() => import("@/components/Marquee-Brands"), { ssr: true });
const Contact = dynamic(() => import("@/components/Contact"), { ssr: false });

// Centralized data fetching with React Query
const fetchSanityData = async (query) => {
  return await client.fetch(query);
};

// Custom hook for data fetching
const useSanityData = (queryKey, query) => {
  return useQuery({
    queryKey: [queryKey],
    queryFn: () => fetchSanityData(query),
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });
};
export default function Home() {
  // Complete list of queries
  const queries = {
    recent: `*[_type in ["makemoney", "aitool", "coding", "freeairesources", "seo"]]|order(publishedAt desc)[0...5]`,
    featureBig: `*[_type in ["makemoney", "aitool", "coding", "digital", "seo"] && isHomePageFeatureBig == true]`,
    trendBig: `*[_type == "aitool" && isHomePageTrendBig == true]`,
    featureRelated: `*[_type in ["makemoney", "aitool", "coding", "digital", "seo"] && isHomePageFeatureRelated == true]`,
    trendRelated: `*[_type == "aitool" && isHomePageTrendRelated == true]`,
   
  };

  // Complete data fetching using React Query
  const { data: recentData } = useSanityData('recent', queries.recent);
  const { data: featurePostBig } = useSanityData('featureBig', queries.featureBig);
 
  const { data: featureRelatedData } = useSanityData('featureRelated', queries.featureRelated);
 

  return (
    <>
        <Hero />
  
      <section className="bg-gray-light py-16 dark:bg-bg-color-dark md:py-4 lg:py-4">
        <div className="container">
          <Grid container spacing={2}>
            <Suspense fallback={<div>Loading trending...</div>}>
              <Trending 
               
              />
            </Suspense>
          </Grid>
        </div>
      </section>

      <Suspense fallback={<div>Loading features...</div>}>
        <FeaturePost 
          featurePostBig={featurePostBig}
          featureRelatedData={featureRelatedData}
        />
      </Suspense>

      <Suspense fallback={<div>Loading more content...</div>}>
        <>
      
          <AISEO 
            
          />
        
           <AiTools 
           
          />
          <FreeResourcesPage 
          />
         
          <AIEarn 
            
          />
          <CodeWithAI  />
        </>
      </Suspense>

      <Suspense fallback={<div>Loading recent posts...</div>}>
        <RecentPost data={recentData} />
      </Suspense>

      <Suspense fallback={<div>Loading categories...</div>}>
        <MainCategory />
      </Suspense>

      <Suspense fallback={<div>Loading footer content...</div>}>
        <>
          <MBrands />
          {/* <Contact /> */}
        </>
      </Suspense>
    </>
  );
}

