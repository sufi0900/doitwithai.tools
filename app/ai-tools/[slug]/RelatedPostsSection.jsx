// components/RelatedPostsSection.js

import Card from "@/components/Card/Page";
import SkelCard from "@/components/Blog/Skeleton/Card";
import { urlForImage } from "@/sanity/lib/image";
import Link from "next/link";

const RelatedPostsSection = ({ 
  relatedPosts, 
  loading, 
  schemaSlugMap, 
  articleSchemaType,
}) => {
  const viewAllUrl = schemaSlugMap[articleSchemaType] 
    ? `/${schemaSlugMap[articleSchemaType]}` 
    : '/articles';

  return (
    <div className="container">
      {/* Updated: Responsive container for heading and button */}
      <div className="mb-6 sm:mb-8 mt-6 sm:mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-0">
        
        {/* Updated: Responsive heading with proper mobile typography */}
        <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide text-black dark:text-white leading-tight">
          <span className="relative mr-1 sm:mr-2 inline-block">
            Related
            {/* Updated: Responsive underline that scales with text size */}
            <span className="absolute bottom-[-3px] xs:bottom-[-4px] sm:bottom-[-6px] md:bottom-[-8px] left-0 h-0.5 sm:h-1 w-full bg-blue-500"></span>
          </span>
          <span className="text-blue-500">Posts</span>
        </h2>
        
        {/* Updated: Responsive "View All Posts" button */}
        {relatedPosts.length > 0 && !loading && (
          <Link href={viewAllUrl} passHref>
            <span className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border-2 border-blue-500 bg-transparent px-4 sm:px-6 py-2 sm:py-2.5 text-center text-sm sm:text-base font-medium text-blue-500 transition-all duration-300 ease-in-out hover:bg-blue-500 hover:text-white min-h-[44px] sm:min-h-auto">
              <span className="truncate">View All Related Posts</span>
              <span className="ml-1 sm:ml-2 flex-shrink-0">➔</span>
            </span>
          </Link>
        )}
      </div>
      
      {/* Responsive grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="w-full">
              <SkelCard />
            </div>
          ))
        ) : (
          relatedPosts.map((post) => (
            <div key={post._id} className="w-full">
              <Card
                tags={post.tags} 
                ReadTime={post.readTime?.minutes} 
                overview={post.overview}
                title={post.title}
                mainImage={urlForImage(post.mainImage).url()}
                slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
                publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RelatedPostsSection;