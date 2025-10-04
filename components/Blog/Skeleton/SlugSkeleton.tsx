import React from "react";

export default function SlugSkeleton() {
    return (
        <div role="status" className="w-full space-y-6 animate-skeleton-pulse p-4">
            {/* Article Header Skeleton */}
            <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded-full dark:bg-gray-700 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-1/2"></div>
            </div>
            
            {/* Author and Meta Info Skeleton */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="h-12 w-12 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-24"></div>
                    <div className="h-3 bg-gray-200 rounded dark:bg-gray-700 w-32"></div>
                </div>
            </div>

            {/* Table of Contents Skeleton */}
            <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded dark:bg-gray-700 w-48"></div>
                <div className="space-y-1 pl-4">
                    <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-64"></div>
                    <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-56"></div>
                    <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-60"></div>
                </div>
            </div>

            {/* Content Section Skeleton */}
            <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-full"></div>
                <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-4/5"></div>
                <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-full"></div>
                <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-3/4"></div>
            </div>

            {/* FAQ Section Skeleton */}
            <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 w-32"></div>
                <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded dark:bg-gray-700 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-full"></div>
                </div>
            </div>

            <span className="sr-only">Loading article content...</span>
        </div>
    );
}