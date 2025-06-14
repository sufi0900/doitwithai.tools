import { useCachedSanityData } from '@/components/Blog/useSanityCache';
import { CACHE_KEYS } from '@/components/Blog/cacheKeys';

const CachedRelatedResources = ({ documentType, slug, className = "" }) => {
  const relatedResourcesQuery = `*[_type == "freeairesources"] | order(_createdAt desc)[0...4] {
    _id, _type, title, slug, mainImage, overview, publishedAt
  }`;

  const { data: resources, isLoading, error } = useCachedSanityData(
    CACHE_KEYS.ARTICLE_RELATED_RESOURCES(documentType, slug),
    relatedResourcesQuery,
    {
      componentName: `RelatedResources-${documentType}-${slug}`,
      usePageContext: true,
      enableOffline: true,
      forceRefresh: false
    }
  );

  if (isLoading && !resources) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error && !resources) {
    return <div className="text-red-500">Failed to load related resources</div>;
  }

  return (
    <div className={className}>
      {resources && resources.length > 0 ? (
        resources.map((resource) => (
          <div key={resource._id} className="mb-4">
            {/* Your existing resource item JSX */}
            <h3 className="font-semibold">{resource.title}</h3>
            <p className="text-sm text-gray-600">{resource.overview}</p>
          </div>
        ))
      ) : (
        <div>No related resources available</div>
      )}
    </div>
  );
};

export default CachedRelatedResources;