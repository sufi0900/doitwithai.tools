"use client";

import React, { useState } from "react";
import Image from "next/image";

/**
 * BlogCardImageOptimizer — Optimized by Apex-CWV (Phase 3)
 * Renders Next.js <Image> directly during SSR with priority/fetchPriority support
 * instead of hiding the featured card image behind client-only useInView + 500ms timers.
 */
const BlogCardImageOptimizer = ({
  src,
  alt,
  width,
  height,
  priority = true,
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return (
      <div className="relative w-full h-full min-h-[220px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {alt || "Article Featured Image"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[220px] overflow-hidden">
      <Image
        src={src}
        alt={alt || "Featured article image"}
        fill
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        quality={80}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 540px"
        style={{ objectFit: "cover" }}
        className={`${className} transition-transform duration-500 ease-out`}
        onError={() => setImageError(true)}
      />
    </div>
  );
};

export default BlogCardImageOptimizer;
