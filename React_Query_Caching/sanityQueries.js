// 11. utils/sanityQueries.js - Centralized Sanity Query Definitions


// Homepage queries
export const homepageQueries = {
  
  // FIX: Added the projection to trendBig
  trendBig: `*[_type in ["makemoney", "freeairesources", "news", "coding", "aitool", "seo"] && displaySettings.isHomePageTrendBig == true] {
      _id,
      _type,
      title,
      overview,
      mainImage,
      slug,
      publishedAt,
      readTime,
      tags,
      _updatedAt,
      "displaySettings": displaySettings
    }`,
 trendRelated: `*[_type in ["makemoney", "freeairesources", "news", "coding", "aitool", "seo"] && displaySettings.isHomePageTrendRelated == true] {
    _id,
    _type,
    title,
    overview,
    mainImage,
    slug,
    publishedAt,
    readTime,
    tags,
    _updatedAt,
    "displaySettings": displaySettings
  }`,

     recent: `*[_type in ["makemoney", "aitool", "coding", "freeairesources", "seo"]] | order(publishedAt desc)[0...5] {
    _id,
    _type,
    title,
    overview,
    mainImage,
    slug,
    publishedAt,
    readTime,
    tags,
    _updatedAt,
    "displaySettings": displaySettings 
  }`,
  featureBig: `*[_type in ["makemoney", "aitool", "coding", "digital", "seo"] && isHomePageFeatureBig == true] {
    _id,
    _type,
    title,
    overview,
    mainImage,
    slug,
    publishedAt,
    readTime,
    tags,
    _updatedAt,
    "displaySettings": displaySettings
  }`,
  featureRelated: `*[_type in ["makemoney", "aitool", "coding", "digital", "seo"] && isHomePageFeatureRelated == true] {
    _id,
    _type,
    title,
    overview,
    mainImage,
    slug,
    publishedAt,
    readTime,
    tags,
    _updatedAt,
    "displaySettings": displaySettings
  }`,
  // FIX: Added the projection to trendRelated
 
}


// Schema-specific list queries
export const listQueries = {
  aitools: (page = 1, limit = 10) => {
    const start = (page - 1) * limit
    return `*[_type == "aitool"] | order(publishedAt desc)[${start}...${start + limit}]`
  },
  coding: (page = 1, limit = 10) => {
    const start = (page - 1) * limit
    return `*[_type == "coding"] | order(publishedAt desc)[${start}...${start + limit}]`
  },
  makemoney: (page = 1, limit = 10) => {
    const start = (page - 1) * limit
    return `*[_type == "makemoney"] | order(publishedAt desc)[${start}...${start + limit}]`
  },
  seo: (page = 1, limit = 10) => {
    const start = (page - 1) * limit
    return `*[_type == "seo"] | order(publishedAt desc)[${start}...${start + limit}]`
  },
  freeResources: (page = 1, limit = 10) => {
    const start = (page - 1) * limit
    return `*[_type == "freeResources"] | order(publishedAt desc)[${start}...${start + limit}]`
  }
}

// Feature post queries
export const featureQueries = {
  aitools: `*[_type == "aitool" && isFeature == true][0]`,
  coding: `*[_type == "coding" && isFeature == true][0]`,
  makemoney: `*[_type == "makemoney" && isFeature == true][0]`,
  seo: `*[_type == "seo" && isFeature == true][0]`
}

// Article queries
export const articleQueries = {
  single: (schemaType, slug) => `*[_type == "${schemaType}" && slug.current == "${slug}"][0]`,
  relatedPosts: (schemaType, excludeId, limit = 3) => 
    `*[_type == "${schemaType}" && _id != "${excludeId}"] | order(_createdAt desc)[0...${limit}]`,
  relatedResources: (articleId, excludeId) => 
    `*[_type == "freeResources" && _id != "${excludeId}" && references("${articleId}")]{
      _id, title, tags, mainImage, overview, resourceType, resourceFormat, 
      resourceLink, resourceLinkType, previewSettings,
      "resourceFile": resourceFile.asset->,
      content, publishedAt, promptContent,
      "relatedArticle": relatedArticle->{title, slug, _id, _type},
      seoTitle, seoDescription, seoKeywords, altText, structuredData
    }`
}

// Global blog queries
export const globalQueries = {
  allBlogs: (page = 1, limit = 10, category = null, sort = 'desc') => {
    const start = (page - 1) * limit
    const categoryFilter = category ? `_type == "${category}"` : `_type in ["makemoney", "aitool", "coding", "seo"]`
    const sortOrder = sort === 'asc' ? 'asc' : 'desc'
    return `*[${categoryFilter}] | order(publishedAt ${sortOrder})[${start}...${start + limit}]`
  },
  search: (searchText) => 
    `*[_type in ["makemoney", "aitool", "coding", "seo"] && (title match $searchText || overview match $searchText || body match $searchText)]`
}
