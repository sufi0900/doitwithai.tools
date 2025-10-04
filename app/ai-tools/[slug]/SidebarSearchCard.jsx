/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import { urlForImage } from '@/sanity/lib/image';

const SidebarSearchCard = ({
  publishedAt,
  mainImage,
  title,
  slug,
}) => {
  const imageUrl = mainImage ? urlForImage(mainImage).url() : "https://placehold.co/100x100/374151/d1d5db?text=No+Image";

  return (
    <Link href={slug} passHref>
      <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm transition-transform transform hover:scale-[1.02] hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600">
        <div className="flex-shrink-0">
          <img
            src={imageUrl}
            alt={title}
            className="w-12 h-12 rounded-lg object-cover"
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {title}
          </h5>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {publishedAt}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default SidebarSearchCard;