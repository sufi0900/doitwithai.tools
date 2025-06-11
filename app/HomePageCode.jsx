// app/page.jsx (your Home component)
"use client";
import React, { useState, useEffect, Suspense } from 'react';
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/sanity/lib/client";
import Grid from "@mui/material/Grid";

// Import the new context and hook
import { GlobalOfflineStatusProvider } from "@/components/Blog/GlobalOfflineStatusContext";
import { GlobalRefreshProvider } from "@/components/Blog/GlobalRefreshContext";

// Dynamic imports for components
import Hero from "@/components/Hero";
const Trending = dynamic(() => import("@/components/Trending/page"), { ssr: true });
import HomepageCategories from "@/components/Blog/HomepageCategories";
import FreeResourcesPage from "@/components/FreeAIResources/page";

const FeaturePost = dynamic(() => import("@/components/FeaturePost"), { ssr: true });
const AISEO = dynamic(() => import("@/components/DigitalMarketing/page"), { ssr: true });
const AiTools = dynamic(() => import("@/components/AITools/page"), { ssr: true });
const AIEarn = dynamic(() => import("@/components/Online-Earning/page"), { ssr: true });
const CodeWithAI = dynamic(() => import("@/components/Trending/WebDev"), { ssr: true });
const RecentPost = dynamic(() => import("@/components/RecentPost/page"), { ssr: true });
const MainCategory = dynamic(() => import("@/components/MainCategories/page"), { ssr: false });
const MBrands = dynamic(() => import("@/components/Marquee-Brands"), { ssr: true });
const MixedCategoriesSection = dynamic(() => import("@/components/Blog/MixedCategoriesSection"), { ssr: true });
const Contact = dynamic(() => import("@/components/Contact"), { ssr: false });

// Dynamically import GlobalRefreshButton
// This ensures it's part of the client-side bundle and correctly rendered within the provider's scope.
const GlobalRefreshButton = dynamic(() => import("@/components/Blog/GlobalRefreshButton"), { ssr: false });


// Centralized data fetching with React Query (keep as is, for homepage's direct RQ queries)
const fetchSanityData = async (query) => {
  return await client.fetch(query);
};

// Custom hook for data fetching (keep as is, for homepage's direct RQ queries)
const useSanityData = (queryKey, query) => {
  return useQuery({
    queryKey: [queryKey],
    queryFn: () => fetchSanityData(query),
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });
};

export default function Home() {
  const queries = {
    recent: `*[_type in ["makemoney", "aitool", "coding", "freeairesources", "seo"]]|order(publishedAt desc)[0...5]`,
    featureBig: `*[_type in ["makemoney", "aitool", "coding", "digital", "seo"] && isHomePageFeatureBig == true]`,
    trendBig: `*[_type == "aitool" && isHomePageTrendBig == true]`,
    featureRelated: `*[_type in ["makemoney", "aitool", "coding", "digital", "seo"] && isHomePageFeatureRelated == true]`,
    trendRelated: `*[_type == "aitool" && isHomePageTrendRelated == true]`,
  };

  const { data: recentData } = useSanityData('recent', queries.recent);
  const { data: featurePostBig } = useSanityData('featureBig', queries.featureBig);
  const { data: featureRelatedData } = useSanityData('featureRelated', queries.featureRelated);

  const [mounted, setMounted] = useState(false);
  const [showGlobalHeader, setShowGlobalHeader] = useState(true);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 100;
      setShowGlobalHeader(currentScrollY <= scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <GlobalRefreshProvider>
      <GlobalOfflineStatusProvider>
        {/* Everything inside these providers will have access to their contexts */}
        <>
          <Hero />

          <section className="bg-gray-light py-16 dark:bg-bg-color-dark md:py-4 lg:py-4">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-end">
                {/* Ensure GlobalRefreshButton is rendered here */}
                <Suspense fallback={<div>Loading refresh button...</div>}>
                  <GlobalRefreshButton />
                </Suspense>
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
              featurePostBig={featurePostBig}
              featureRelatedData={featureRelatedData}
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
            <RecentPost data={recentData} />
          </Suspense>

          <Suspense fallback={<div>Loading footer content...</div>}>
            <>
              <MBrands />
              <Contact />
            </>
          </Suspense>
        </>
        {/* If you re-enable GlobalOfflineIndicator, make sure it also accesses context correctly.
        <GlobalOfflineIndicator /> */}
      </GlobalOfflineStatusProvider>
    </GlobalRefreshProvider>
  );
}