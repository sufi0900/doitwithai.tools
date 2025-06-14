import { useCachedSanityData } from '@/components/Blog/useSanityCache';
import { CACHE_KEYS } from '@/components/Blog/cacheKeys';

const CachedRelatedPosts = ({ documentType, slug, className = "" }) => {
  const relatedPostsQuery = `*[_type in ["aitool", "makemoney", "news", "coding", "freeairesources", "seo"] && slug.current != "${slug}"] | order(_createdAt desc)[0...3] {
    _id, _type, title, slug, mainImage, overview, publishedAt, readTime, tags
  }`;

  const { data: relatedPosts, isLoading, error } = useCachedSanityData(
    CACHE_KEYS.ARTICLE_RELATED_POSTS(documentType, slug),
    relatedPostsQuery,
    {
      componentName: `RelatedPosts-${documentType}-${slug}`,
      usePageContext: true,
      enableOffline: true,
      forceRefresh: false
    }
  );

  if (isLoading && !relatedPosts) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error && !relatedPosts) {
    return <div className="text-red-500">Failed to load related posts</div>;
  }

  return (
    <div className={className}>
      {relatedPosts && relatedPosts.length > 0 ? (
        relatedPosts.map((post) => (
          <div key={post._id} className="mb-4">
            {/* Your existing related post item JSX */}
            <h3 className="font-semibold">{post.title}</h3>
            <p className="text-sm text-gray-600">{post.overview}</p>
          </div>
        ))
      ) : (
        <div>No related posts available</div>
      )}
    </div>
  );
};

export default CachedRelatedPosts;