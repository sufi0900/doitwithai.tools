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
     <div className="container border-b-2 border-black border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
           <h2 className="mb-6 mt-6 text-3xl font-bold tracking-wide text-black dark:text-white sm:text-4xl">
             <span className="relative  mr-2 inline-block">
              Related
               <span className="absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
             </span>
             <span className="text-blue-500">Posts</span>
           </h2>
           <div className="flex flex-wrap justify-start">
           {loading ? (
             // Display Skeleton components while loading
             Array.from({ length: 4 }).map((_, index) => (
               <div key={index} className="mx-2 mb-4  flex  flex-wrap justify-start">
                 
                 <SkelCard />
               </div>
             ))
           ) : (
           relatedPosts.map((post) =>         
                  <Card
                   key={post._id}
                   tags={post.tags} 
                   ReadTime={post.readTime?.minutes} 
                   overview={post.overview}
                   title={post.title}
                   mainImage={urlForImage(post.mainImage).url()}
                   slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
                   publishedAt= {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                   
                 />
   ))}
                       </div>
                       </div>
  );
};

export default RelatedPostsSection;