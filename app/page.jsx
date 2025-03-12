"use client";


import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/sanity/lib/client";
import Grid from "@mui/material/Grid";

// Dynamic imports for components
const Hero = dynamic(() => import("@/components/Hero"), { ssr: true });
const Trending = dynamic(() => import("@/components/Trending/page"), { ssr: true });
const FeaturePost = dynamic(() => import("@/components/FeaturePost"), { ssr: true });
const AISEO = dynamic(() => import("@/components/DigitalMarketing/page"), { ssr: false });
const AiTools = dynamic(() => import("@/components/AITools/page"), { ssr: false });
const AIEarn = dynamic(() => import("@/components/Online-Earning/page"), { ssr: false });
const CodeWithAI = dynamic(() => import("@/components/Trending/WebDev"), { ssr: false });
const RecentPost = dynamic(() => import("@/components/RecentPost/page"), { ssr: true });
const MainCategory = dynamic(() => import("@/components/MainCategories/page"), { ssr: true });
const MBrands = dynamic(() => import("@/components/Marquee-Brands"), { ssr: false });
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
    aiToolTrendBig: `*[_type == "aitool" && isHomePageAIToolTrendBig == true]`,
    aiToolTrendRelated: `*[_type == "aitool" && isHomePageAIToolTrendRelated == true]`,
    aiEarnTrendBig: `*[_type == "aiearn" && isHomePageAiEarnTrendBig == true]`,
    aiEarnTrendRelated: `*[_type == "aiearn" && isHomePageAIEarnTrendRelated == true]`,
    newsTrendBig: `*[_type == "news" && isHomePageNewsTrendBig == true]`,
    newsTrendRelated: `*[_type == "news" && isHomePageNewsTrendRelated == true]`,
    digitalTrendBig: `*[_type == "digital" && isHomePageDigitalTrendBig == true]`,
    digitalTrendRelated: `*[_type == "digital" && isHomePageDigitalTrendRelated == true]`,
    seoTrendBig: `*[_type == "seo" && isHomePageSeoTrendBig == true]`,
    seoTrendRelated: `*[_type == "seo" && isHomePageSeoTrendRelated == true]`,
    coding: `*[_type == "coding" && isHomePageCoding == true]`
  };

  // Complete data fetching using React Query
  const { data: recentData } = useSanityData('recent', queries.recent);
  const { data: featurePostBig } = useSanityData('featureBig', queries.featureBig);
  const { data: trendBigData } = useSanityData('trendBig', queries.trendBig);
  const { data: featureRelatedData } = useSanityData('featureRelated', queries.featureRelated);
  const { data: trendRelatedData } = useSanityData('trendRelated', queries.trendRelated);
  const { data: aiToolTrendBigData } = useSanityData('aiToolTrendBig', queries.aiToolTrendBig);
  const { data: aiToolTrendRelatedData } = useSanityData('aiToolTrendRelated', queries.aiToolTrendRelated);
  const { data: aiEarnTrendBigData } = useSanityData('aiEarnTrendBig', queries.aiEarnTrendBig);
  const { data: aiEarnTrendRelatedData } = useSanityData('aiEarnTrendRelated', queries.aiEarnTrendRelated);
  const { data: newsTrendBigData } = useSanityData('newsTrendBig', queries.newsTrendBig);
  const { data: newsTrendRelatedData } = useSanityData('newsTrendRelated', queries.newsTrendRelated);
  const { data: digitalTrendBigData } = useSanityData('digitalTrendBig', queries.digitalTrendBig);
  const { data: digitalTrendRelatedData } = useSanityData('digitalTrendRelated', queries.digitalTrendRelated);
  const { data: seoTrendBigData } = useSanityData('seoTrendBig', queries.seoTrendBig);
  const { data: seoTrendRelatedData } = useSanityData('seoTrendRelated', queries.seoTrendRelated);
  const { data: codingData } = useSanityData('coding', queries.coding);

  return (
    <>
      <Suspense fallback={<div>Loading hero...</div>}>
        <Hero />
      </Suspense>
      
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
            seoTrendBigData={seoTrendBigData}
            seoTrendRelatedData={seoTrendRelatedData}
          />
          <AiTools 
            aiToolTrendBigData={aiToolTrendBigData}
            aiToolTrendRelatedData={aiToolTrendRelatedData}
          />
          <AIEarn 
            aiEarnTrendBigData={aiEarnTrendBigData}
            aiEarnTrendRelatedData={aiEarnTrendRelatedData}
          />
          <CodeWithAI codingData={codingData} />
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

