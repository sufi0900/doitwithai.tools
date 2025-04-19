import React from "react";

export default function SlugSkeleton() {
  return (
    <div
      role="status"
      className="max-w-4xl mx-auto p-4 space-y-4 animate-skeletonPulse"
    >
      {/* Header Section */}
      <div className="h-8 bg-gray-200 rounded-full dark:bg-gray-700 w-3/4 mb-4"></div>
      <div className="h-6 bg-gray-200 rounded-full dark:bg-gray-700 w-1/2"></div>

      {/* Image Section */}
      <div className="w-full h-60 bg-gray-300 rounded dark:bg-gray-700"></div>

      {/* Content Section */}
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-full"></div>
        <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-3/4"></div>
      </div>

      {/* Interactive Section (Buttons or Links) */}
      <div className="flex space-x-4 mt-6">
        <div className="h-10 w-32 bg-gray-200 rounded dark:bg-gray-700"></div>
        <div className="h-10 w-32 bg-gray-200 rounded dark:bg-gray-700"></div>
      </div>

      <span className="sr-only">Loading...</span>
    </div>
  );
}
