// components/RelatedPostsSection.jsx
import Card from "@/components/Card/Page";
import SkelCard from "@/components/Blog/Skeleton/Card";
import { urlForImage } from "@/sanity/lib/image";
import Link from "next/link";

function resolvePostImage(mainImage) {
  if (!mainImage) return "/images/blog/blog-01.jpg";
  if (mainImage.localUrl) return mainImage.localUrl;
  if (mainImage.asset) {
    try {
      return urlForImage(mainImage).url();
    } catch {
      return "/images/blog/blog-01.jpg";
    }
  }
  return "/images/blog/blog-01.jpg";
}

function resolveReadMinutes(post) {
  if (post?.readTime?.minutes) return post.readTime.minutes;
  if (post?.estimatedReadingTime) return post.estimatedReadingTime;
  if (Array.isArray(post?.content)) {
    const words = JSON.stringify(post.content).split(/\s+/).filter(Boolean).length;
    return Math.max(4, Math.min(25, Math.round(words / 240)));
  }
  return 9;
}

const RelatedPostsSection = ({
  relatedPosts,
  loading,
  schemaSlugMap,
  articleSchemaType,
}) => {
  const viewAllUrl = schemaSlugMap[articleSchemaType]
    ? `/${schemaSlugMap[articleSchemaType]}`
    : "/articles";

  return (
    <div className="container">
      <div className="mb-6 sm:mb-8 mt-6 sm:mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-0">
        <p className="m-0 text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide text-black dark:text-white leading-tight">
          <span className="relative mr-1 sm:mr-2 inline-block">
            Related
            <span className="absolute bottom-[-3px] xs:bottom-[-4px] sm:bottom-[-6px] md:bottom-[-8px] left-0 h-0.5 sm:h-1 w-full bg-blue-500"></span>
          </span>
          <span className="text-blue-500">Posts</span>
        </p>

        {relatedPosts.length > 0 && !loading && (
          <Link href={viewAllUrl} passHref>
            <span className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border-2 border-blue-500 bg-transparent px-4 sm:px-6 py-2 sm:py-2.5 text-center text-sm sm:text-base font-medium text-blue-500 transition-all duration-300 ease-in-out hover:bg-blue-500 hover:text-white min-h-[44px] sm:min-h-auto">
              <span className="truncate">View All Related Posts</span>
              <span className="ml-1 sm:ml-2 flex-shrink-0">➔</span>
            </span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="w-full">
                <SkelCard />
              </div>
            ))
          : relatedPosts.map((post) => (
              <div key={post._id || post.slug?.current} className="w-full">
                <Card
                  tags={post.tags}
                  ReadTime={resolveReadMinutes(post)}
                  overview={post.overview}
                  title={post.title}
                  mainImage={resolvePostImage(post.mainImage)}
                  slug={`/${schemaSlugMap[post._type] || "ai-seo"}/${post.slug?.current || ""}`}
                  publishedAt={
                    post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Nov 2026"
                  }
                />
              </div>
            ))}
      </div>
    </div>
  );
};

export default RelatedPostsSection;
