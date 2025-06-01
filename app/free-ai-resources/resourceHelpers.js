// utils/resourceHelpers.js
import { client } from "@/sanity/lib/client";

/**
 * Fetches resources that reference a specific article
 * @param {string} articleId - The ID of the article
 * @param {string} articleType - The type of the article (aitool, blog, seo, etc.)
 * @returns {Promise<Array>} - Array of resource objects
 */
export async function fetchRelatedResources(articleId) {
  if (!articleId) {
    console.error("Article ID is required to fetch related resources");
    return [];
  }

  try {
    // Query resources where relatedArticle._ref is the current article id
    const query = `*[_type == "freeResources" && references($articleId)] {
      _id, title, tags, mainImage, overview, resourceType, resourceFormat,
      resourceLink, resourceLinkType, previewSettings,
      "resourceFile": resourceFile.asset->,
      content, publishedAt, promptContent,
      "relatedArticle": relatedArticle->{title, slug, _id, _type},
      seoTitle, seoDescription, seoKeywords, altText, structuredData
    }`;
    
    const result = await client.fetch(query, { articleId });
    return result;
  } catch (error) {
    console.error("Error fetching related resources:", error);
    return [];
  }
}