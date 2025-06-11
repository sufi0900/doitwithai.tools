/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect  } from "react";
import BlogLayout from "./BlogLayout"
import { usePageCache } from "./usePageCache"; // Add this import
import CacheStatusIndicator from "./CacheStatusIndicator"; // Add this import
import { fetchRelatedResources } from "@/app/free-ai-resources/resourceHelpers";
import { client } from "@/sanity/lib/client";
import RelatedPost from "@/components/Blog/RelatedPost";

import { useCallback } from 'react';
import { debounce } from 'lodash';
import SharePost from "@/components/Blog/SharePost";
import TagButton from "@/components/Blog/TagButton";
import NewsLatterBox from "@/components/Contact/NewsLatterBox";
import Image from "next/image";
import { ExpandMore, ExpandLess, AccessTime, CalendarMonthOutlined } from "@mui/icons-material";
import RecentPost from "@/components/RecentPost/page";
import Card from "@/components/Card/Page";
import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard"
import SkelCard from "@/components/Blog/Skeleton/Card"
import classNames from 'classnames';
import SlugSkeleton from "@/components/Blog/Skeleton/SlugSkeleton"
import { ArrowRight } from "lucide-react";
import RelatedResources from "@/app/free-ai-resources/RelatedResources";
import SidebarRelatedResources from "@/app/free-ai-resources/SidebarRelatedResources";

import { PortableText } from "@portabletext/react";
import { urlForImage } from "@/sanity/lib/image";
import OptimizedVideo from "@/app/ai-seo/[slug]/OptimizedVideo";
import OptimizedGif from "@/app/ai-seo/[slug]/OptimizedGif";
import OptimizedImage from "@/app/ai-seo/[slug]/OptimizedImage";
import ReadingProgressCircle from "@/app/ai-seo/[slug]/ReadingProgressCircle";
import CongratsPopup from "./CongratsPopup"
import "@/styles/customanchor.css";
import Link from "next/link";
export const revalidate = false;
export const dynamic = "force-dynamic";

async function fetchAllBlogs(page = 1, limit = 5, categories = []) {
  const start = (page - 1) * limit;
  const query = `*[_type in $categories] | order(publishedAt desc) {formattedDate, readTime , _id, _type, title, slug, mainImage, overview, body, publishedAt }[${start}...${start + limit}]`;
  const result = await client.fetch(query, { categories });
  return result;
}

// MODIFIED: Add a parameter for the current post's ID to exclude it
async function fetchRelatedPostsData(currentPostId) {
  // Ensure currentPostId is provided and is a string, otherwise fall back to an empty string to avoid errors
  const excludeId = currentPostId ? currentPostId : '';

  // Sanity GROQ query to fetch "seo" type posts, ordered by creation date,
  // EXCLUDING the post with the given _id, and limiting to 3 results.
  const query = `*[_type == "aitool" && _id != $excludeId] | order(_createdAt desc) [0...3]`;
  return await client.fetch(query, { excludeId });
}

export default function BlogSidebarPage({ data }) {
  // `data` is the current blog post object
  const currentPostId = data?._id; // Get the ID of the current open article

  const {
    data: relatedPosts,
    loading: relatedPostsLoading,
    isFromCache: relatedPostsFromCache,
    refreshData: refreshRelatedPosts
  } = usePageCache(
    `related_posts_${data?._type}_${currentPostId}`, // Make cache key unique to the current post
    () => fetchRelatedPostsData(currentPostId), // Pass the current post's ID to the fetch function
    [data?._type, currentPostId] // Add currentPostId to dependencies for cache refresh
  );

  const imgdesc = {
    block: {
      normal: ({ children }) => (
        <p className="hover:text-gray-950 dark:hover:text-gray-50 mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-800 dark:text-gray-300 transition-all duration-300 ease-in-out">
          {children}
        </p>
      ),
      a: ({ children }) => (
        <a className="dark-bg-green-50 rounded-bl-xl rounded-br-xl text-center text-base text-blue-500 underline hover:text-blue-600 dark:text-gray-400 hover:underline">
          {children}
        </a>
      )
    },
  };

  const [loading, setLoading] = useState(!data);
  const [currentPage, setCurrentPage] = useState(1);
  const [allData, setAllData] = useState([]); // Initialize allData state

  // No separate loading state for related posts section needed if usePageCache handles it.
  // const [relatedPostsSectionLoading, setRelatedPostsSectionLoading] = useState(true);

  const {
    data: relatedResources,
    loading: resourcesLoading,
    isFromCache: resourcesFromCache,
    refreshData: refreshResources
  } = usePageCache(
    `related_resources_${data?._id}`,
    async () => {
      if (data && data._id) {
        // MODIFIED: Assuming fetchRelatedResources also needs to exclude the current post.
        // You'll need to modify fetchRelatedResources in resourceHelpers.js similarly.
        return await fetchRelatedResources(data._id, data._type, currentPostId);
      }
      return [];
    },
    [data?._id, data?._type, currentPostId] // Add currentPostId to dependencies
  );

  const schemaSlugMap = {
    makemoney: "ai-learn-earn",
    aitool: "ai-tools",
    news: "news",
    coding: "ai-code",
    freeairesources: "free-ai-resources",
    seo: "ai-seo",
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!data) {
        setLoading(true);
      }
      try {
        const newData = await fetchAllBlogs(currentPage, 5, [
          "makemoney",
          "aitool",
          "news",
          "coding",
          "freeairesources",
          "seo",
        ]);
        setAllData(newData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentPage > 1 || !data) {
      fetchData();
    }
  }, [currentPage, data]); // Ensure `data` is in dependency array if it changes

  const handleRefreshAll = () => {
    refreshRelatedPosts();
    refreshResources();
  };

  return (
    <>
      <CacheStatusIndicator
        isFromCache={relatedPostsFromCache || resourcesFromCache}
        onRefresh={handleRefreshAll}
      />
      <BlogLayout
        data={data}
        loading={loading}
        relatedPosts={relatedPosts || []}
        relatedPostsLoading={relatedPostsLoading}
        relatedResources={relatedResources || []}
        resourcesLoading={resourcesLoading}
        schemaSlugMap={schemaSlugMap}
        imgdesc={imgdesc}
      />
    </>
  );
}