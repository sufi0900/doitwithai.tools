import React from "react";
import Image from "next/image";
import { urlForImage } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";
import ReadingProgressCircle from "@/app/ai-seo/[slug]/ReadingProgressCircle";

const ArticleHeader = ({ data, imgdesc }) => {
  // If data is not available, return a minimal fallback
  if (!data || !data.title || !data.mainImage) {
    return (
      <div className="lg:-mx-5 w-full overflow-hidden rounded">
        <div className="lg:m-4">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-800 dark:text-gray-200 md:text-5xl lg:text-6xl">
              Loading Article...
            </h1>
            <div className="w-24 h-1 bg-blue-500 mx-auto lg:mx-0 rounded-full"></div>
          </div>
          <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center h-96">
            <p className="text-gray-500 dark:text-gray-400">Content loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:-mx-5 w-full overflow-hidden rounded">
      <div className="lg:m-4">
        
        {/* Clean Title Section */}
        <div className="mb-8 text-center lg:text-left">
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-blue-600 dark:text-blue-400 md:text-5xl lg:text-6xl">
            {data.title}
          </h1>
          <div className="w-24 h-1 bg-blue-500 mx-auto lg:mx-0 rounded-full"></div>
        </div>

        {/* Reading Progress Circle */}
        <ReadingProgressCircle />

        {/* Clean Image Card */}
        <div className="rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <figure className="relative">
            <div className="overflow-hidden lg:aspect-[28/16] relative">
              <Image
                className="h-full w-full object-cover"
                src={urlForImage(data.mainImage).url()}
                alt={data.mainImage.alt || `${data.title}`}
                width={1200}
                height={675}
                priority // Add priority for LCP optimization
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>

            {/* Image Description */}
            {data.mainImage.imageDescription && (
              <figcaption className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                <PortableText value={data.mainImage.imageDescription} components={imgdesc} />
              </figcaption>
            )}
          </figure>
        </div>
      </div>
    </div>
  );
};

export default ArticleHeader;