// ai-seo/categories/[category]/page.jsx

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
    
    openGraph: {
      title: pageTitle,
      url: canonicalUrl,
      type: "website",
      images: [{
        url: generateOGImageURL({
          title: title,
          ctaText: 'Explore Guides',
          features: 'AI SEO,Expert Guides,Free Resources',
        }),
        width: 1200,
        height: 630,
        alt: `${title} - AI SEO guides and strategies`,
      }],
      siteName: "Do It With AI Tools",
      locale: 'en_US',
      description: pageDescription,
    },
    
    twitter: {
      card: "summary_large_image",
      site: "@doitwithai",
      creator: "@doitwithai",
      domain: "doitwithai.tools",
      url: canonicalUrl,
      title: pageTitle,
      description: pageDescription,
      image: generateOGImageURL({
        title: title,
        ctaText: 'Explore Guides',
        features: 'AI SEO,Expert Guides,Free Resources',
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
  const schemaMarkup = {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        // CollectionPage schema
        {
          "@type": "CollectionPage",
          "@id": `${getBaseUrl()}/ai-seo/categories/${category}#webpage`,
          "url": `${getBaseUrl()}/ai-seo/categories/${category}`,
          "name": subcategoryInfo.metaTitle || subcategoryInfo.title,
          "description": subcategoryInfo.metaDescription || subcategoryInfo.description,
          "isPartOf": {
            "@id": `${getBaseUrl()}/ai-seo#webpage`
          },
          "breadcrumb": {
            "@id": `${getBaseUrl()}/ai-seo/categories/${category}#breadcrumb`
          },
          "inLanguage": "en-US"
        },
        
        // BreadcrumbList schema
        {
          "@type": "BreadcrumbList",
          "@id": `${getBaseUrl()}/ai-seo/categories/${category}#breadcrumb`,
          "itemListElement": breadcrumbData.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.item
          }))
        },
        
        // ItemList for articles (if posts exist)
        ...(posts.length > 0 ? [{
          "@type": "ItemList",
          "name": `${subcategoryInfo.title} Articles`,
          "description": `Collection of ${posts.length} articles about ${subcategoryInfo.title}`,
          "numberOfItems": posts.length,
          "itemListElement": transformedPosts.slice(0, 10).map((post, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `${getBaseUrl()}/ai-seo/${post.slug.current}`
          }))
        }] : [])
      ]
    })
  };

  return (
    <>
      <Script
        id={`SubcategorySchema-${category}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaMarkup}
        key={`jsonld-${category}`}
        strategy="afterInteractive"
      />
      
      <SubCategoryContent 
        posts={transformedPosts}
        subcategoryInfo={subcategoryInfo}
        totalPosts={posts.length}
        breadcrumbData={breadcrumbData}
      />
    </>
  );
}