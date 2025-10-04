// ai-seo/categories/[category]/page.jsx

import SubCategoryContent from "./code";
import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import { notFound } from 'next/navigation';
import Script from "next/script"; // Import Script for JSON-LD

export const revalidate = 0;
export const dynamic = "force-dynamic";

function getBaseUrl() {
  // Your getBaseUrl function from the reference code
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

// ... (existing generateStaticParams function)

// FIXED: Better query to handle multiple categories per article
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

// Fetch subcategory information (now including new SEO fields)
async function fetchSubcategoryInfo(slug) {
  const query = `*[_type == "seoSubcategory" && slug.current == $slug][0] {
    _id,
    title,
    description,
    slug,
    metaTitle,      // NEW
    metaDescription,  // NEW
    keywords        // NEW
  }`;
  try {
    return await client.fetch(query, { slug });
  } catch (error) {
    console.error('Error fetching subcategory info:', error);
    return null;
  }
}

// NEW: Dynamically generate metadata
export async function generateMetadata({ params }) {
  const { category } = params;
  const subcategoryInfo = await fetchSubcategoryInfo(category);

  if (!subcategoryInfo) {
    return notFound();
  }

  const { title, metaTitle, metaDescription, keywords } = subcategoryInfo;
  const pageTitle = metaTitle || `${title} | SEO Articles`;
  const pageDescription = metaDescription || `Explore all articles related to ${title}, including the latest AI-powered SEO strategies and tools.`;
  const pageKeywords = keywords || `AI SEO, ${title}, digital marketing, AI for content`;
  const canonicalUrl = `${getBaseUrl()}/ai-seo/categories/${category}`;

  return {
    title: pageTitle,
    description: pageDescription,
    author: "Sufian Mustafa",
    keywords: pageKeywords,
   openGraph: {
      title: pageTitle,
      url: canonicalUrl,
      type: "website",
      images: [{
        url: generateOGImageURL({
          title: `AI SEO Subcategories: ${title}`,
          category: 'Keyword Focus',
          ctaText: 'Explore All SEO Insights',
        features: 'SEO Categories,Boost SEO,Content Strategy' // Relevant features
        }),
        width: 1200,
        height: 630,
        alt: `AI SEO Subcategories: ${title}`,
      }],
      siteName: "doitwithai.tools",
      locale: 'en_US',
    },
    twitter: {
      card: "summary_large_image",
      site: "@doitwithai",
      creator: "@doitwithai",
      domain: "doitwithai.tools",
      url: canonicalUrl,
      title: pageTitle,
      image: generateOGImageURL({
        title: `AI SEO Subcategories: ${title}`,
        category: 'Keyword Focus',
          ctaText: 'Explore All SEO Insights',
        features: 'SEO Categories,Boost SEO,Content Strategy' // Relevant features
      }),
    },

    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
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

  // Define breadcrumb data for JSON-LD and page content
  const breadcrumbData = [
    { name: "Home", item: `${getBaseUrl()}/` },
    { name: "AI-SEO", item: `${getBaseUrl()}/ai-seo` },
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

  const schemaMarkup = {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": subcategoryInfo.metaTitle || subcategoryInfo.title,
      "description": subcategoryInfo.metaDescription || subcategoryInfo.description,
      "url": `${getBaseUrl()}/ai-seo/categories/${category}`,
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbData.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.item
        }))
      }
    })
  };

  return (
    <>
      <Script
        id={`BreadcrumbListSchema-${category}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaMarkup}
        key={`jsonld-${category}`}
      />
      <SubCategoryContent 
        posts={transformedPosts}
        subcategoryInfo={subcategoryInfo}
        totalPosts={posts.length}
      />
    </>
  );
}