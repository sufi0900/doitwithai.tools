// utils/resourceHelpers.js
import { client } from "@/sanity/lib/client";

/**
 * Fetches resources that reference a specific article
 * @param {string} articleId - The ID of the article
 * @returns {Promise<Array>}- Array of resource objects
 */
export async function fetchRelatedResources(articleId) {
    if (!articleId) {
        console.warn("Article ID is required to fetch related resources.");
        // Always return empty array instead of throwing error - allows cache fallback
        return [];
    }

    try {
        // Query resources where relatedArticle._ref is the current article id
 const query = `*[_type == "freeResources" && references($articleId)]{
      _id,
      title,
      tags,
      mainImage,
      overview,
      resourceType,
      resourceFormat,
      resourceLink,
      resourceLinkType,
      previewSettings,
      "resourceFile": resourceFile.asset->,
      content,
      publishedAt,
      promptContent,
      "relatedArticle": relatedArticle->{
        title,
        slug,
        _id,
        _type
      },
      seoTitle,
      seoDescription,
      seoKeywords,
      altText,
      structuredData
    }`;       
     const result = await client.fetch(query, { articleId });
        return result || []; // Ensure we always return an array
    } catch (error) {
        console.error("Error fetching related resources:", error);
        // CRITICAL FIX: Always return an empty array on *any* error
        // when fetching resources. This allows useAdvancedPageCache to
        // confidently fall back to its cache without dealing with a thrown error.
        // The console.error above will still log the issue for debugging.
        return [];
    }
}