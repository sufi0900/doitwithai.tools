// components/Common/StaticPageShell.jsx
"use client";

import React from "react";
import Breadcrumb from "@/components/Common/Breadcrumb"; // Your existing Breadcrumb component

export default function StaticPageShell({ breadcrumbProps, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/30">
      {/* Breadcrumb Section - Always rendered immediately */}
      <section className="pt-8">
        <Breadcrumb {...breadcrumbProps} />
      </section>

      {/* Main Content Container - Children will be the BlogListingPageContent */}
      <div className="container mx-auto px-4 py-12">
        {children}
      </div>
    </div>
  );
}