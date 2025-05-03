// components/FeaturedResourcesHorizontal.js
import React, { useState, useEffect } from 'react';
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { urlForImage } from "@/sanity/lib/image";
import { getFileUrl, renderPreviewContent, getResourceAlt } from "@/app/free-resources/resourceUtils";
import ResourceModal from '@/app/free-resources/ResourceModal';
import Link from 'next/link';

const FeaturedResourcesHorizontal = () => {
  const [featuredResources, setFeaturedResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openModalId, setOpenModalId] = useState(null);
  
  // Fetch featured resources on component mount
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const query = groq`*[_type == "freeResources" && isHomePageFeature == true] | order(publishedAt desc)[0...3] {
          _id, title, slug, tags, mainImage, overview, resourceType, resourceFormat,
          resourceLink, resourceLinkType, content, publishedAt,
          "resourceFile": resourceFile.asset->,
          promptContent, previewSettings
        }`;
        const featuredData = await client.fetch(query);
        setFeaturedResources(featuredData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch featured resources", error);
        setIsLoading(false);
      }
    };
  
    fetchFeatured();
  }, []);

  const handleResourceAccess = (resource) => {
    // For prompt resources, open the modal
    if (resource.resourceFormat === 'text' && resource.promptContent) {
      setOpenModalId(resource._id);
      return;
    }
    
    // Handle downloads and external links (same as your existing code)
    if (resource.resourceLinkType === 'direct' && resource.resourceFile) {
      const fileUrl = getFileUrl(resource.resourceFile);
      const fileName = resource.resourceFile.originalFilename || 
        `${resource.title.replace(/\s+/g, '-').toLowerCase()}`;
      
      if (!fileUrl) {
        console.error('Could not determine file URL for', resource.title);
        return;
      }
      
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (resource.resourceLink) {
      window.open(resource.resourceLink, '_blank');
    }
  };

  // Custom prompt preview rendering
  const renderPromptCard = (resource) => {
    if (!resource.promptContent || !Array.isArray(resource.promptContent) || resource.promptContent.length === 0) {
      return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900 dark:to-purple-900 p-4 h-full rounded-lg flex flex-col">
          <div className="font-mono text-sm text-gray-700 dark:text-gray-300">
            No prompt content available
          </div>
        </div>
      );
    }

    // Get the first prompt to display
    const firstPrompt = resource.promptContent[0];

    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900 dark:to-purple-900 p-4 h-full rounded-lg flex flex-col">
        {/* Terminal-style header */}
        <div className="h-8 bg-gray-800 dark:bg-black flex items-center px-3 border-b border-white/10 mb-3 rounded-t-lg">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-xs text-gray-400 ml-auto">
            {firstPrompt.promptTitle || 'prompt.txt'}
          </div>
        </div>

        <div className="font-mono text-xs text-gray-700 dark:text-gray-300 mb-2">
          <span className="text-teal-600 dark:text-teal-400">$</span> cat prompt.txt
        </div>

        <div className="font-mono text-xs text-gray-700 dark:text-gray-300 flex-1 overflow-y-auto">
          <div className="relative">
            <span className="text-purple-500">➤</span>{" "}
            {firstPrompt.promptText?.substring(0, 120) || "No prompt text"}
            {firstPrompt.promptText?.length > 120 ? "..." : ""}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {resource.promptContent.length} prompt{resource.promptContent.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setOpenModalId(resource._id)}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            View Full Prompt
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Featured Resources</h2>
          <div className="w-16 h-1 bg-primary rounded mb-4"></div>
        </div>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (featuredResources.length === 0) {
    return null;
  }

  // Special case for a single featured resource
  if (featuredResources.length === 1) {
    const resource = featuredResources[0];
    return (
      <section className="py-16 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-10 text-center">
            <h2 className="text-3xl font-bold mb-2">Featured Resource</h2>
            <div className="w-20 h-1 bg-primary rounded mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
              Enhance your projects with our premium AI resources
            </p>
          </div>

          <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Resource Preview */}
              <div className="md:w-1/2 relative h-64 md:h-auto">
                {resource.resourceFormat === 'text' ? (
                  renderPromptCard(resource)
                ) : (
                  <div className="absolute inset-0 bg-gray-800">
                    {renderPreviewContent(resource)}
                    <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-xs font-bold uppercase bg-primary text-white">
                      {resource.resourceFormat}
                    </div>
                  </div>
                )}
              </div>

              {/* Resource Content */}
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  {resource.title}
                </h3>

                {resource.overview && (
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {resource.overview}
                  </p>
                )}

                <div className="mt-auto flex flex-col space-y-3">
                  <button
                    onClick={() => setOpenModalId(resource._id)}
                    className="w-full py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors font-medium"
                  >
                    Quick View
                  </button>
                  
                  <button
                    onClick={() => handleResourceAccess(resource)}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors font-medium"
                  >
                    {resource.resourceFormat === 'text' ? 'View Prompt' : 
                      resource.resourceLinkType === 'external' ? 'Access Resource' : 'Download Resource'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/free-resources" className="inline-flex items-center text-primary hover:text-primary-dark">
              View all resources
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </Link>
          </div>

          {/* Resource Modal */}
          {openModalId === resource._id && (
            <ResourceModal
              resource={resource}
              isOpen={true}
              onClose={() => setOpenModalId(null)}
            />
          )}
        </div>
      </section>
    );
  }

  // Display for multiple featured resources
  return (
    <section className="py-16 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-10 text-center">
          <h2 className="text-3xl font-bold mb-2">Featured Resources</h2>
          <div className="w-20 h-1 bg-primary rounded mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
            Discover our curated collection of premium AI resources, templates, and tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredResources.map((resource) => (
            <div key={resource._id} className="group">
              <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 flex flex-col">
                {/* Resource Preview */}
                <div className="relative h-56">
                  {resource.resourceFormat === 'text' ? (
                    <div className="h-full">
                      {renderPromptCard(resource)}
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 z-10"></div>
                      <div className="absolute inset-0 bg-gray-800">
                        {renderPreviewContent(resource)}
                      </div>
                      <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-xs font-bold uppercase bg-primary text-white">
                        {resource.resourceFormat}
                      </div>
                    </>
                  )}
                </div>

                {/* Resource Details */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-1">
                    {resource.title}
                  </h3>
                  
                  {resource.overview && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
                      {resource.overview}
                    </p>
                  )}
                  
                  <div className="mt-auto flex flex-col space-y-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      {new Date(resource.publishedAt).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setOpenModalId(resource._id)}
                        className="py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors text-sm"
                      >
                        Quick View
                      </button>
                      
                      <button
                        onClick={() => handleResourceAccess(resource)}
                        className="py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors text-sm"
                      >
                        {resource.resourceFormat === 'text' ? 'View Prompt' : 
                          resource.resourceLinkType === 'external' ? 'Access' : 'Download'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Modal */}
              {openModalId === resource._id && (
                <ResourceModal
                  resource={resource}
                  isOpen={true}
                  onClose={() => setOpenModalId(null)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/free-resources" className="inline-flex items-center bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-md transition-colors">
            View All Resources
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedResourcesHorizontal;

// Add this somewhere in your component for development
{process.env.NODE_ENV === 'development' && (
  <button 
    onClick={() => console.log(validateSchema(resource))}
    style={{
      position: 'absolute',
      bottom: '5px',
      right: '5px',
      zIndex: 9999,
      fontSize: '10px',
      padding: '2px 5px',
      background: '#ff4444',
      color: 'white',
      borderRadius: '3px',
      opacity: 0.7
    }}
  >
    Test Schema
  </button>
)}