import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import Box from "@mui/material/Box";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Link from "next/link";
import Image from "next/image";

// Import any necessary util functions
// For example, this helps with file extension detection
const getFileExtension = (url) => {
  if (!url) return '';
  const match = url.match(/\.([^.]+)$/);
  return match ? match[0] : '';
};

export default function VerticalFeaturePost({
  date,
  resource,
  mainImage,
  title,
  overview,
  slug,
  readTime,
  tags,
  resourceFormat,
  resourceFile,
  resourceType,
  getFileUrl,
  urlForImage
}) {
  // Function to determine what content to display based on resource type
  const renderResourcePreview = () => {
    // If we have a valid mainImage, use that
    if (mainImage) {
      return (
        <Image
          src={mainImage}
          alt={title || "Featured resource"}
          layout="responsive"
          width={1200}
          height={630}
          className="transition-transform duration-500 ease-in-out hover:scale-105"
        />
      );
    }
    
    // If we're working with a resource object directly
    if (resource) {
      // Check resource format and handle accordingly
      switch (resource.resourceFormat) {
        case 'image':
          if (resource.mainImage && urlForImage) {
            return (
              <Image
                src={urlForImage(resource.mainImage).url()}
                alt={resource.title || "Featured resource"}
                layout="responsive"
                width={1200}
                height={630}
                className="transition-transform duration-500 ease-in-out hover:scale-105"
              />
            );
          } else if (resource.resourceFile && getFileUrl) {
            return (
              <Image
                src={getFileUrl(resource.resourceFile)}
                alt={resource.title || "Featured resource"}
                layout="responsive"
                width={1200}
                height={630}
                className="transition-transform duration-500 ease-in-out hover:scale-105"
              />
            );
          }
          break;
          
        case 'video':
          // Video preview with thumbnail or placeholder
          return (
            <div className="relative w-full h-full">
              {resource.mainImage && urlForImage ? (
                <Image
                  src={urlForImage(resource.mainImage).url()}
                  alt={resource.title || "Video resource"}
                  layout="responsive"
                  width={1200}
                  height={630}
                  className="transition-transform duration-500 ease-in-out hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-white/20 p-6">
                      <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.5 17.5l8.25-5.5L6.5 6.5z" fillRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              {/* Video indicator badge */}
              <div className="absolute bottom-4 right-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center">
                <span className="mr-1">●</span> VIDEO
              </div>
            </div>
          );
          
        case 'document':
          // Document preview
          return (
            <div className="relative w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800">
              {resource.mainImage && urlForImage ? (
                <Image
                  src={urlForImage(resource.mainImage).url()}
                  alt={resource.title || "Document resource"}
                  layout="responsive"
                  width={1200}
                  height={630}
                  className="transition-transform duration-500 ease-in-out hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <svg className="w-20 h-20 text-amber-700 dark:text-amber-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 18h12V6h-4V2H4v16zm8-13v3h3l-3-3zM3 0h10l5 5v14a1 1 0 01-1 1H3a1 1 0 01-1-1V1a1 1 0 011-1z" fillRule="evenodd" />
                  </svg>
                  <span className="text-amber-800 dark:text-amber-400 font-medium">
                    {resource.resourceFile && getFileUrl 
                      ? getFileExtension(getFileUrl(resource.resourceFile)).toUpperCase().replace('.', '') 
                      : "DOCUMENT"}
                  </span>
                </div>
              )}
              {/* Document indicator badge */}
              <div className="absolute bottom-4 right-4 bg-amber-600 text-white px-2 py-1 rounded text-xs font-bold">
                DOCUMENT
              </div>
            </div>
          );
          
        case 'text':
          // Text/prompt preview
          return (
            <div className="relative w-full h-full bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900 dark:to-indigo-900">
              {resource.mainImage && urlForImage ? (
                <Image
                  src={urlForImage(resource.mainImage).url()}
                  alt={resource.title || "Text resource"}
                  layout="responsive"
                  width={1200}
                  height={630}
                  className="transition-transform duration-500 ease-in-out hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 rounded-lg p-4 shadow-lg">
                    <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              )}
              {/* Text indicator badge */}
              <div className="absolute bottom-4 right-4 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">
                TEXT
              </div>
            </div>
          );
          
        default:
          // Default fallback for unknown resource types
          return (
            <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
              <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10a9.5 9.5 0 1119.084 0 9.5 9.5 0 01-19.084 0z" clipRule="evenodd" />
              </svg>
            </div>
          );
      }
    }
    
    // Default fallback
    return (
      <div className="w-full h-80 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
        <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10a9.5 9.5 0 1119.084 0 9.5 9.5 0 01-19.084 0z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };

  return (
    <Card 
      className="feature-card overflow-hidden rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%", 
        background: "transparent",
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-8px)",
        },
        "&.dark": {
          backgroundColor: "rgba(30, 30, 30, 0.9)",
        }
      }}
    >
      {/* Resource Preview Section */}
      <Box sx={{ position: "relative", height: 350, overflow: "hidden" }}>
        <CardMedia
          component="div"
          sx={{
            position: "relative",
            height: "100%",
            overflow: "hidden",
          }}
        >
          {renderResourcePreview()}
          
          {/* Tag Overlay */}
          {tags && tags.length > 0 && (
            <Link href={tags[0].link} className="absolute left-4 top-4 z-20 inline-flex items-center justify-center rounded-full bg-primary px-3 py-1.5 text-xs font-semibold capitalize text-white transition duration-300 hover:bg-stone-50 hover:text-primary">
              <LocalOfferIcon style={{fontSize:"14px", marginRight: "4px"}} /> {tags[0].name}
            </Link>
          )}
        </CardMedia>
      </Box>

      {/* Content Section */}
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <h2 className="mb-3 text-2xl font-bold leading-tight text-gray-900 dark:text-white">
          {title}
        </h2>
        
        <p className="mb-4 text-base text-gray-700 dark:text-gray-300 line-clamp-3">
          {overview}
        </p>
        
        {/* Metadata Row */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <EventNoteIcon sx={{ fontSize: 16, marginRight: 0.5 }} />
            <span>{date}</span>
          </div>
          
          {readTime && (
            <div className="flex items-center">
              <AccessTimeIcon sx={{ fontSize: 16, marginRight: 0.5 }} />
              <span>{readTime} min read</span>
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <Link
          href={slug}
          className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-300"
        >
          View Resource
          <svg
            className="ms-2 h-3.5 w-3.5 rtl:rotate-180"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </Link>
      </CardContent>
    </Card>
  );
}