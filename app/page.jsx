


"use client";

import Grid from "@mui/material/Grid";
import { client } from "@/sanity/lib/client";

import { urlForImage } from "@/sanity/lib/image"; 

import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import OnlineEarn from "@/components/Online-Earning/page";
import AboutPage from "./about/page";
import MainCategory from "@/components/MainCategories/page";
import FeaturePost from "@/components/FeaturePost/index";
import RelatedFeaturePost from "@/components/FeaturePost/RelatedFeaturePost";
import MBrands from "@/components/Marquee-Brands/index";
import AiTools from "@/components/AITools/page";
import Trending from "@/components/Trending/page";

import DigitalMarketing from "@/components/DigitalMarketing/page";
import React, { useEffect, useState } from "react";
import RecentPost from "@/components/RecentPost/page";
import Categories from "@/components/Categories/page";
import Hero from "@/components/Hero";
import Programming from "@/components/Trending/WebDev";
import NewsLatterBox from "@/components/Contact/NewsLatterBox";
import DigiResources from "@/components/DigiResources/page";
import News from "@/components/News/page";
import DigiSolution from "@/components/DigiSolution/page";


export default  function Home() {
  const [featurePostBig, setFeaturePostBig] = useState([]);

  const [trendBigData, setTrendBigData] = useState([]);
  const [featureRelatedData, setFeatureRelatedData] = useState([]);
  const [trendRelatedData, setTrendRelatedData] = useState([]);
  const [aiToolTrendBigData, setAiToolTrendBigData] = useState([]);
  const [aiToolTrendRelatedData, setAiToolTrendRelatedData] = useState([]);
  const [aiEarnTrendBigData, setAiEarnTrendBigData] = useState([]);
  const [aiEarnTrendRelatedData, setAiEarnTrendRelatedData] = useState([]);
  // 
  const [newsTrendBigData, setNewsTrendBigData] = useState([]);
  const [newsTrendRelatedData, setNewsTrendRelatedData] = useState([]);
  // 
  const [digitalTrendBigData, setDigitalTrendBigData] = useState([]);
  const [digitalTrendRelatedData, setDigitalTrendRelatedData] = useState([]);
  // 
  const [seoTrendBigData, setSeoTrendBigData] = useState([]);
  const [seoTrendRelatedData, setSeoTrendRelatedData] = useState([]);
  // 
  const [codingData, setCodingData] = useState([]);
  // 
  const [recentData, setRecentData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
    
      const isHomePageFeatureBig = `*[_type in [ "makemoney", "news", "coding", "digital", "seo",] && isHomePageFeatureBig == true]`;
      const isHomePageTrendBig = `*[_type == "aitool" && isHomePageTrendBig == true]`;
      const isHomePageFeatureRelated = `*[_type in [ "makemoney", "news", "coding", "digital", "seo",] && isHomePageFeatureRelated == true]`;
      const isHomePageTrendRelated = `*[_type == "aitool" && isHomePageTrendRelated == true]`;
      const isHomePageAIToolTrendBig = `*[_type == "aitool" && isHomePageAIToolTrendBig == true]`;
      const isHomePageAIToolTrendRelated = `*[_type == "aitool" && isHomePageAIToolTrendRelated == true]`;
      // 
      const isHomePageAiEarnTrendBig = `*[_type == "aiearn" && isHomePageAiEarnTrendBig == true]`;
      const isHomePageAIEarnTrendRelated = `*[_type == "aiearn" && isHomePageAIEarnTrendRelated == true]`;
      // 
      const isHomePageNewsTrendBig = `*[_type == "news" && isHomePageNewsTrendBig == true]`;
      const isHomePageNewsTrendRelated = `*[_type == "news" && isHomePageNewsTrendRelated == true]`;
      // 
      const isHomePageDigitalTrendBig = `*[_type == "digital" && isHomePageDigitalTrendBig == true]`;
      const isHomePageDigitalTrendRelated = `*[_type == "digital" && isHomePageDigitalTrendRelated == true]`;
      // 
      const isHomePageSeoTrendBig = `*[_type == "seo" && isHomePageSeoTrendBig == true]`;
      const isHomePageSeoTrendRelated = `*[_type == "seo" && isHomePageSeoTrendRelated == true]`;
      // 
      const isHomePageCoding = `*[_type == "coding" && isHomePageCoding == true]`;
      // 
      const isRecent = `*[_type == "blog" && isRecent == true]`;


      const isHomePageFeatureBigData = await client.fetch(isHomePageFeatureBig);
      const isHomePageTrendBigData = await client.fetch(isHomePageTrendBig);
      const isHomePageTrendRelatedData = await client.fetch(isHomePageTrendRelated);
      const isHomePageFeatureRelatedData = await client.fetch(isHomePageFeatureRelated);
      const isHomePageAIToolTrendBigData = await client.fetch(isHomePageAIToolTrendBig);
      const isHomePageAIToolTrendRelatedData = await client.fetch(isHomePageAIToolTrendRelated);
      // 
      const isHomePageAiEarnTrendBigData = await client.fetch(isHomePageAiEarnTrendBig);
      const isHomePageAIEarnTrendRelatedData = await client.fetch(isHomePageAIEarnTrendRelated);
      // 
      const isHomePageNewsTrendBigData = await client.fetch(isHomePageNewsTrendBig);
      const isHomePageNewsTrendRelatedData = await client.fetch(isHomePageNewsTrendRelated);
      // 
      const isHomePageDigitalTrendBigData = await client.fetch(isHomePageDigitalTrendBig);
      const isHomePageDigitalTrendRelatedData = await client.fetch(isHomePageDigitalTrendRelated);
      // 
      const isHomePageSeoTrendBigData = await client.fetch(isHomePageSeoTrendBig);
      const isHomePageSeoTrendRelatedData = await client.fetch(isHomePageSeoTrendRelated);
      // 
      const isHomePageCodingData = await client.fetch(isHomePageCoding);
      // 
      const isRecentData = await client.fetch(isRecent);
  

      setFeaturePostBig(isHomePageFeatureBigData);
      setTrendBigData(isHomePageTrendBigData);
      setFeatureRelatedData(isHomePageFeatureRelatedData);
      setTrendRelatedData(isHomePageTrendRelatedData);
      setAiToolTrendBigData(isHomePageAIToolTrendBigData);
      setAiToolTrendRelatedData(isHomePageAIToolTrendRelatedData);
      // 
      setAiEarnTrendBigData(isHomePageAiEarnTrendBigData);
      setAiEarnTrendRelatedData(isHomePageAIEarnTrendRelatedData);
      // 
      setNewsTrendBigData(isHomePageNewsTrendBigData);
      setNewsTrendRelatedData(isHomePageNewsTrendRelatedData);
      // 
      setDigitalTrendBigData(isHomePageDigitalTrendBigData);
      setDigitalTrendRelatedData(isHomePageDigitalTrendRelatedData);
      // 
      setSeoTrendBigData(isHomePageSeoTrendBigData);
      setSeoTrendRelatedData(isHomePageSeoTrendRelatedData);
      // 
      setCodingData(isHomePageCodingData);
      // 
      setRecentData(isRecentData);
     
    };

    fetchData();
  }, []);
  return (
    <>
      <ScrollUp />
      <Hero />
      <section
        id="blog"
        className="bg-gray-light py-16 dark:bg-bg-color-dark md:py-4 lg:py-4"
      >
        <div className="container">
          <Grid container spacing={2}>
             <Trending /> 
          </Grid>
        </div>
      </section>
      <section
        id="blog"
        className="bg-gray-light py-16 dark:bg-bg-color-dark md:py-4 lg:py-4"
      >
        <div className="container">
          <h1 className="mb-6 text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">
            <span className="group inline-block cursor-pointer">
              <span className="relative text-blue-500">
                Feature
                <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
              </span>
              {/* Add space between the texts */}{" "}
              {/* Add space between the texts */}
              <span className="relative mt-4 inline-block ">
                {" "}
                {/* Apply smaller font size */}
                Posts
                <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </span>
          </h1>
          {/* <AboutPage /> */}
          <Grid container spacing={2}>
            <FeaturePost posts={featurePostBig} />
            <RelatedFeaturePost posts={featureRelatedData} /> 
          </Grid>
        </div>
        <br />
        <br />
      </section>
      <AiTools />
      <OnlineEarn />
      <News />
      <Programming /> 
 
      <DigiSolution />
      <DigitalMarketing />
   
 
     
  

      <RecentPost posts={recentData} />
      <MainCategory />
      <MBrands />

      <Contact />
    </>
  );
}
