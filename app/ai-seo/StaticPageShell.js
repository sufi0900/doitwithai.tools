// components/Common/StaticPageShell.jsx
"use client";
// import AISEOHeroSection from "./AISEOHeroSection";
import Breadcrumb from "@/components/Common/Breadcrumb"; // Your existing Breadcrumb component

import React from "react";
// import Breadcrumb from "@/components/Common/Breadcrumb"; // Your existing Breadcrumb component

export default function StaticPageShell({ breadcrumbProps, children, showBreadcrumb = true }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/30">
      {/* Breadcrumb Section - Always rendered immediately */}
{showBreadcrumb && <Breadcrumb {...breadcrumbProps} />}

      {/* Main Content Container - Children will be the BlogListingPageContent */}
      <div className="container mx-auto px-4 py-12">
        {children}
      </div>
    </div>
  );
}