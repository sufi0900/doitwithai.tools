/* eslint-disable react/jsx-key */
"use client";
import React, { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import Box from "@mui/material/Box";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { CalendarMonthOutlined, ArrowForward } from "@mui/icons-material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ImageOptimizer from "@/app/ai-seo/[slug]/OptimizedImage";

import { ShieldCheck } from "lucide-react"; 

export default function HomeBigCard({ 
    publishedAt,
    mainImage,
    title,
    overview,
    ReadTime,
    slug,
    tags,
}) {
 
  return (
    <Card 
      sx={{
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-8px) scale(1.02)",
          boxShadow: "0 25px 50px -12px rgba(37, 99, 235, 0.25)",
        },
        height: { xs: "auto", lg: "680px" }, 
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid #e2e8f0",
      }}
      className="group cursor-pointer shadow-lg hover:shadow-2xl dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      {/* Image Section with Enhanced Hover */}
      <Box 
        position="relative" 
        sx={{ 
          overflow: "hidden",
          background: "linear-gradient(135deg, #2563eb10, #8b5cf610)",
        }}
      >
        <CardMedia
          component="div"
          sx={{
            position: "relative",
            // Dynamic height to match image aspect ratio or container
            height: { xs: "auto", sm: "100%", md: 280, lg: 320 },
            aspectRatio: { xs: "3/2", sm: "3/2", md: "unset", lg: "unset" }, // Maintain aspect ratio on smaller screens
            overflow: "hidden",
            width: "100%",
          }}
          className="transition-all duration-500 ease-out group-hover:scale-110"
        >
          <ImageOptimizer
            src={mainImage}
            alt={title}
            width={500}
            height={320}
            quality={80}
            className="object-cover w-full h-full"
            blurDataURL={undefined}
            style={{ objectFit: "cover", width: "100%", height: "100%" }} // Ensure image fills container
            onClick={undefined} 
            enableModal={false}
          />
          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </CardMedia>
                       
        {/* Enhanced Tag */}
        {tags && tags.length > 0 && (
         <Link 
  href={tags[0].link} 
  className="absolute z-20 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 text-xs font-semibold capitalize text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:scale-105 hover:shadow-xl backdrop-blur-sm border border-white/20 sm:top-4 sm:right-4 xs:top-2 xs:right-2"
>
  <LocalOfferIcon style={{fontSize:"10px"}} /> 
  {tags[0].name}
</Link>
        )}

        {/* Reading Progress Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </Box>

      <CardContent 
        sx={{
          p: { xs: "16px !important", sm: "20px !important", md: "24px !important" },
        }}
        className="space-y-4"
      >
        {/* Enhanced Title */}
       <Link href={slug}>
    <h1 className="line-clamp-2 text-xl font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-2xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
      {title}     
    </h1>
  </Link>
        {/* Enhanced Overview */}
        <p className="line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
          {overview} 
        </p>

        {/* Enhanced Meta Information */}
        <div className="flex flex-wrap items-center justify-start gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-1.5 w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/50 transition-colors duration-300 flex items-center justify-center">
              <CalendarMonthOutlined 
                className="text-blue-600 dark:text-blue-400 transition-colors duration-300" 
                sx={{ fontSize: 16 }}
              />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {publishedAt}
            </p>
          </div>

          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />

          <div className="flex items-center gap-2">
            <div className="p-1.5 w-7 h-7 rounded-full bg-green-50 dark:bg-green-900/30 group-hover:bg-green-100 dark:group-hover:bg-green-800/50 transition-colors duration-300 flex items-center justify-center">
              <AccessTimeIcon 
                className="text-green-600 dark:text-green-400 transition-colors duration-300" 
                sx={{ fontSize: 16 }}
              />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {ReadTime} min read
            </p>
          </div>
        </div>

        {/* Enhanced Read More Button */}
        <div className="pt-4">
          <Link
            href={slug}
            className="group/button relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 sm:px-6 sm:py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 overflow-hidden"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-700 ease-out" />
            
            {/* Button Content */}
            <span className="relative z-10 text-xs sm:text-sm">Read Full Article</span>
            <ArrowForward 
              className="relative z-10 transition-all duration-300 group-hover/button:translate-x-1 group-hover/button:scale-110" 
              sx={{ fontSize: 18 }}
            />
            
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover/button:opacity-30 transition-opacity duration-300 blur-sm" />
          </Link>
        </div>

        {/* Article Stats (Optional Enhancement) */}
        <div className="flex items-center justify-between pt-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-50 dark:border-gray-800">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Recently Updated
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 bg-blue-100 rounded-full p-[1px]" />
            Verified Content
          </span>
        </div>
      </CardContent>

      {/* Corner Accent */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-3xl transform scale-0 group-hover:scale-100 transition-transform duration-500" />
    </Card>
  );
}