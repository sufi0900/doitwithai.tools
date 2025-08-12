import Card from "@/components/Card/Page";
import SkelCard from "@/components/Blog/Skeleton/Card";
import { urlForImage } from "@/sanity/lib/image";

const RelatedPostsSection = ({ 
  relatedPosts, 
  loading, 
  schemaSlugMap, 
  title = "Related Posts" 
}) => {
  
  return (
    <div className="container ">
      <h2 className="mb-8 mt-8 text-3xl font-bold tracking-wide text-black dark:text-white sm:text-4xl">
        <span className="relative mr-2 inline-block">
          Related
          <span className="absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
        </span>
        <span className="text-blue-500">Posts</span>
      </h2>
      
      {/* Responsive grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading ? (
          // Display Skeleton components while loading
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