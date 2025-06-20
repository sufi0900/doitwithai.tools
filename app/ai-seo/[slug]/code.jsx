/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import BlogLayout from "@/app/ai-tools/[slug]/BlogLayout";
import CachedArticleComponent from './ReusableCachedArticle';

import { fetchRelatedResources } from "@/app/free-ai-resources/resourceHelpers"; // Assuming this is where it's defined
import { client } from "@/sanity/lib/client";
import "@/styles/customanchor.css";
import { usePageCache } from "@/app/ai-tools/[slug]/usePageCache";
import CacheStatusIndicator from "@/app/ai-tools/[slug]/CacheStatusIndicator";
import { PageRefreshProvider } from "@/components/Blog/PageScopedRefreshContext";
import { GlobalOfflineStatusProvider } from "@/components/Blog/GlobalOfflineStatusContext";
import PageRefreshButton from "@/components/Blog/PageSpecificRefreshButton";
export const revalidate = false;
export const dynamic = "force-dynamic";



export default function ChildComp({ data, params }) {
  return (
    <PageRefreshProvider pageType="seo-article">
      <GlobalOfflineStatusProvider>
       
        <div className="fixed bottom-6 right-6 z-50">
          <PageRefreshButton />
        </div>
      
        <CachedArticleComponent 
          slug={params.slug} 
          documentType="seo"
          // serverData={data} // Pass server data as fallback
        />
      </GlobalOfflineStatusProvider>
    </PageRefreshProvider>
  );
}