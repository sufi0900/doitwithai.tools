// ai-seo and /blogs/categories/[category]/page.jsx of doitwithai.tools and sufianportfolio.com

import SubCategoryContent from "./code";
import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import { notFound } from 'next/navigation';
import Script from "next/script";

export const revalidate = 0;
export const dynamic = "force-dynamic";

function getBaseUrl() {
  if (process.env.NODE_ENV === 'production') {
    return 'https://doitwithai.tools';
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

function generateOGImageURL(params) {
  const baseURL = `${getBaseUrl()}/api/og`;
  const searchParams = new URLSearchParams(params);
  return `${baseURL}?${searchParams.toString()}`;
}

// Fetch subcategory posts
async function fetchSubcategoryPosts(slug) {
  const query = `*[_type == "seo" && $slug in subcategories[]->slug.current] | order(publishedAt desc) {
    _id,
    title,
    slug,
    mainImage,
    overview,
    publishedAt,
    readTime,
    tags,
    subcategories[]-> {
      title,
      slug
    }
  }`;
  try {
    return await client.fetch(query, { slug });
  } catch (error) {
    console.error('Error fetching subcategory posts:', error);
    return [];
  }
}

// Fetch subcategory information
async function fetchSubcategoryInfo(slug) {
  const query = `*[_type == "seoSubcategory" && slug.current == $slug][0] {
    _id,
    title,
    description,
    slug,
    metaTitle,
    metaDescription,
    keywords
  }`;
  try {
    return await client.fetch(query, { slug });
  } catch (error) {
    console.error('Error fetching subcategory info:', error);
    return null;
  }
}

// Generate metadata dynamically
export async function generateMetadata({ params }) {
  const { category } = params;
  const subcategoryInfo = await fetchSubcategoryInfo(category);

  if (!subcategoryInfo) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.'
    };
  }

  const { title, metaTitle, metaDescription, keywords } = subcategoryInfo;
  
  // Use custom meta or fallback to defaults
  const pageTitle = metaTitle || `${title} - AI SEO Guides & Strategies`;
  const pageDescription = metaDescription || `Explore comprehensive ${title} guides, strategies, and expert insights for AI-powered search optimization.`;
  const pageKeywords = keywords || `AI SEO, ${title}, search optimization, SEO strategies, AI tools`;
  const canonicalUrl = `${getBaseUrl()}/ai-seo/categories/${category}`;

  return {
    title: pageTitle,
    description: pageDescription,
    author: "Sufian Mustafa",
    keywords: pageKeywords,
    




  };
}

export default async function CategoryPage({ params }) {
  const { category } = params;

  const [posts, subcategoryInfo] = await Promise.all([
    fetchSubcategoryPosts(category),
    fetchSubcategoryInfo(category)
  ]);

  if (!subcategoryInfo) {
    notFound();
  }

  // Enhanced breadcrumb data
  const breadcrumbData = [
    { name: "Home", item: `${getBaseUrl()}/` },
    { name: "AI SEO", item: `${getBaseUrl()}/ai-seo` },
    { name: subcategoryInfo.title, item: `${getBaseUrl()}/ai-seo/categories/${category}` }
  ];

  const transformedPosts = posts.map(post => ({
    ...post,
    mainImage: post.mainImage ? urlForImage(post.mainImage).url() : null,
    publishedAt: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) : 'No date',
    subcategories: post.subcategories || []
  }));

  // Enhanced schema markup

  return (
    <>
   
      <SubCategoryContent 
        posts={transformedPosts}
        subcategoryInfo={subcategoryInfo}
        totalPosts={posts.length}
        breadcrumbData={breadcrumbData}
      />
    </>
  );
}