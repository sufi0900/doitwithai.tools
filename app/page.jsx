


"use client";

import Grid from "@mui/material/Grid";
import { client } from "@/sanity/lib/client";

import { urlForImage } from "@/sanity/lib/image"; 

import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import AIEarn from "@/components/Online-Earning/page";
import AboutPage from "./about/page";
import MainCategory from "@/components/MainCategories/page";
import FeaturePost from "@/components/FeaturePost/index";
import RelatedFeaturePost from "@/components/FeaturePost/RelatedFeaturePost";
import MBrands from "@/components/Marquee-Brands/index";
import AiTools from "@/components/AITools/page";
import Trending from "@/components/Trending/page";

import AISEO from "@/components/DigitalMarketing/page";
import React, { useEffect, useState } from "react";
import RecentPost from "@/components/RecentPost/page";
import Categories from "@/components/Categories/page";
import Hero from "@/components/Hero";
import CodeWithAI from "@/components/Trending/WebDev";
import NewsLatterBox from "@/components/Contact/NewsLatterBox";
import AINews from "@/components/News/page";
import FreeAIResources from "@/components/FreeAIResources/page";


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
      const query = `*[_type in ["makemoney", "news", "coding", "freeairesources", "seo"]]|order(publishedAt desc)[0...5]`;

      const recentData = await client.fetch(query);
      setRecentData(recentData);
    };

    fetchData();
  }, []);
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
      // const isRecentData = await client.fetch(isRecent);
  

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
      // setRecentData(isRecentData);
     
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
     {/*  */}
     <FeaturePost/>
      <AiTools />
      <AIEarn />
      <AINews />
      <CodeWithAI /> 
 
      <FreeAIResources />
      <AISEO />
   
 
     
  

      <RecentPost  />
      <MainCategory />
      <MBrands />

      <Contact />
    </>
  );
}
