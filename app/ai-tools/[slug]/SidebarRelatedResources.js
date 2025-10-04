import Link from 'next/link';
import { urlForImage } from '@/sanity/lib/image';

const SidebarRelatedResources = ({ resources, isLoading, maxItems = 3 }) => {
  if (isLoading) {
    return (
      <ul className="p-6 space-y-4">
        {Array.from({ length: maxItems }).map((_, i) => (
          <li key={i} className="relative flex items-center space-x-3 animate-pulse overflow-hidden">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-4">
        No related resources found.
      </p>
    );
  }

  const displayResources = resources.slice(0, maxItems);

  return (
    <ul className="p-6 space-y-4">
      {displayResources.map((resource, index) => (
        <li key={resource._id} className="group/item relative">
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-green-500 to-teal-600 scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300 origin-top rounded-full"></div>
          <div className="pl-4 group-hover/item:pl-6 transition-all duration-300">
            <Link 
              href={`/free-ai-resources/${resource.slug?.current || '#'}`}
              className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors duration-200"
            >
              {resource.mainImage && (
                <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={urlForImage(resource.mainImage).width(48).height(48).url()}
                    alt={resource.mainImage.alt || resource.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-tight">
                  {resource.title}
                </h4>
                {resource.overview && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                    {resource.overview}
                  </p>
                )}
              </div>
            </Link>
          </div>
          {index < displayResources.length - 1 && (
            <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default SidebarRelatedResources;