import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/sanity/lib/image';
import StarIcon from '@mui/icons-material/Star';
import LaunchIcon from '@mui/icons-material/Launch';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';

const AIToolCard = ({ resource, viewMode = 'grid' }) => {
  const { 
    title, 
    // slug, 
    mainImage, 
    overview, 
    aiToolDetails, 
    publishedAt,
    tags 
  } = resource;

  const {
    toolUrl,
    toolCategory,
    pricingModel,
    rating,
    functionality,
    features
  } = aiToolDetails || {};

  // Format category for display
  const getCategoryLabel = (category) => {
    const categoryMap = {
      'content': 'Content Creation',
      'image-gen': 'Image Generation', 
      'seo': 'SEO Tools',
      'code': 'Code Assistant',
      'video': 'Video Editing',
      'writing': 'Writing Assistant',
      'research': 'Research & Analysis',
      'design': 'Design & Creative',
      'productivity': 'Productivity',
      'marketing': 'Marketing',
      'other': 'Other'
    };
    return categoryMap[category] || category;
  };

  // Get pricing color and icon
  const getPricingDisplay = (pricing) => {
    switch (pricing) {
      case 'free':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: <FreeBreakfastIcon fontSize="small" />, label: 'Free' };
      case 'freemium':
        return { color: 'text-blue-600', bg: 'bg-blue-100', icon: <AttachMoneyIcon fontSize="small" />, label: 'Freemium' };
      case 'paid':
        return { color: 'text-orange-600', bg: 'bg-orange-100', icon: <AttachMoneyIcon fontSize="small" />, label: 'Paid' };
      case 'subscription':
        return { color: 'text-purple-600', bg: 'bg-purple-100', icon: <AttachMoneyIcon fontSize="small" />, label: 'Subscription' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: <AttachMoneyIcon fontSize="small" />, label: 'N/A' };
    }
  };

  const pricingDisplay = getPricingDisplay(pricingModel);

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="relative h-48 md:h-full rounded-t-xl md:rounded-l-xl md:rounded-tr-none overflow-hidden">
              {mainImage && (
                <Image
                  src={urlFor(mainImage).width(400).height(300).url()}
                  alt={mainImage.alt || title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              )}
              {/* AI Tool Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                  🤖 AI TOOL
                </span>
              </div>
              {/* Rating Badge */}
              {rating && (
                <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-1 bg-black/70 text-white rounded-full text-xs">
                  <StarIcon fontSize="inherit" className="text-yellow-400" />
                  <span>{rating}</span>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="md:w-2/3 lg:w-3/4 p-6">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  {/* <Link href={`/free-ai-resources/${slug.current}`}>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white hover:text-blue-600 transition-colors line-clamp-2">
                      {title}
                    </h3>
                  </Link> */}
                  <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                    {overview}
                  </p>
                </div>
              </div>

              {/* Tags and Category */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {toolCategory && (
                  <span className="flex items-center space-x-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                    <CategoryIcon fontSize="small" />
                    <span>{getCategoryLabel(toolCategory)}</span>
                  </span>
                )}
                <span className={`flex items-center space-x-1 px-3 py-1 ${pricingDisplay.bg} ${pricingDisplay.color} rounded-full text-sm font-medium`}>
                  {pricingDisplay.icon}
                  <span>{pricingDisplay.label}</span>
                </span>
              </div>

              {/* Functionality */}
              {functionality && functionality.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Functions:</h4>
                  <div className="flex flex-wrap gap-1">
                    {functionality.slice(0, 3).map((func, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                        {func}
                      </span>
                    ))}
                    {functionality.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded text-xs">
                        +{functionality.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                {/* <Link href={`/free-ai-resources/${slug.current}`}>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                    Learn More
                  </button>
                </Link> */}
                {toolUrl && (
                  <a
                    href={toolUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium"
                  >
                    <LaunchIcon fontSize="small" />
                    <span>Try Tool</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden group">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        {mainImage && (
          <Image
            src={urlFor(mainImage).width(400).height(300).url()}
            alt={mainImage.alt || title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {/* AI Tool Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
            🤖 AI TOOL
          </span>
        </div>
        {/* Rating Badge */}
        {rating && (
          <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-1 bg-black/70 text-white rounded-full text-xs">
            <StarIcon fontSize="inherit" className="text-yellow-400" />
            <span>{rating}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          {/* <Link href={`/free-ai-resources/${slug.current}`}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white hover:text-blue-600 transition-colors line-clamp-2 mb-2">
              {title}
            </h3>
          </Link> */}
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
            {overview}
          </p>
        </div>

        {/* Category and Pricing */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {toolCategory && (
            <span className="flex items-center space-x-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
              <CategoryIcon fontSize="small" />
              <span>{getCategoryLabel(toolCategory)}</span>
            </span>
          )}
          <span className={`flex items-center space-x-1 px-2 py-1 ${pricingDisplay.bg} ${pricingDisplay.color} rounded-full text-xs font-medium`}>
            {pricingDisplay.icon}
            <span>{pricingDisplay.label}</span>
          </span>
        </div>

        {/* Functionality */}
        {functionality && functionality.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {functionality.slice(0, 2).map((func, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                  {func}
                </span>
              ))}
              {functionality.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded text-xs">
                  +{functionality.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* <Link href={`/free-ai-resources/${slug.current}`} className="flex-1">
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
              Learn More
            </button>
          </Link> */}
          {toolUrl && (
            <a
              href={toolUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium text-sm"
            >
              <LaunchIcon fontSize="small" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIToolCard;