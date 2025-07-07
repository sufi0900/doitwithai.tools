/*eslint-disable @next/next/no-img-element*/
/*eslint-disable react/no-unescaped-entities*/
//app/ai-tools/[slug]/page.jsx
import { client } from "@/sanity/lib/client";
import { PageCacheProvider } from '@/React_Query_Caching/CacheProvider';
import PageCacheStatusButton from "@/React_Query_Caching/PageCacheStatusButton";
import ArticleChildComp from "@/app/ai-code/[slug]/code"; // Ensure this path is correct for your setup
import { urlForImage } from "@/sanity/lib/image";
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";
import { redisHelpers } from '@/app/lib/redis'; // Corrected import to match usage
import RedisServerMonitor from '@/app/lib/RedisServerMonitor'; // Assuming you might use this for debugging
import UnifiedCacheMonitor from "@/React_Query_Caching/UnifiedCacheMonitor"; // Assuming you use this

// Enable Incremental Static Regeneration (ISR)
export const revalidate = 3600; // Revalidate every 1 hour

async function getData(slug) {
  const cacheKey = `article:aitool:${slug}`;
  const startTime = Date.now();
  let data = null;

  try {
    const cachedData = await redisHelpers.get(cacheKey);
    if (cachedData) {
      console.log(`[Redis Cache Hit] for ${cacheKey} in ${Date.now() - startTime}ms`);
      return { ...cachedData, __source: 'server-redis' };
    }
  } catch (redisError) {
    console.error(`Redis error for ${cacheKey}:`, redisError.message);
  }

  console.log(`[Sanity Fetch] for ${cacheKey} starting...`);
  const query = `*[_type=="aitool"&&slug.current=="${slug}"][0]{_id,title,slug,mainImage{asset->{_id,url},alt},publishedAt,_updatedAt,_createdAt,_type,metatitle,metadesc,schematitle,schemadesc,overview,//Fetch content as a whole array. Portable Text will parse its internal structure.
    content[]{...,//Fetch all fields for each block/type
    _type=="image"=>{//Explicitly fetch image details if needed
      asset->{_id,url},alt,caption,//Assuming you have a caption field for images
      imageDescription[]{...}//If imageDescription is Portable Text itself
    },
    _type=="gif"=>{//Explicitly fetch gif details
      asset->{_id,url},alt,caption
    },
    _type=="video"=>{//Explicitly fetch video details
      asset->{_id,url},alt,caption
    },
    //Add other custom types (like 'table', 'button') if they have specific nested fields
    //that are not covered by '...'
  },"wordCount":length(pt::text(content)),"estimatedReadingTime":round(length(pt::text(content))/250),"headings":content[_type=="block"&&stylein["h1","h2","h3","h4","h5","h6"]]{"text":pt::text(@),"level":style,"anchor":lower(pt::text(@))},faqs[]{question,answer},articleType,displaySettings}`;

  try {
    data = await client.fetch(query, {}, { next: { tags: ['aitool', slug] } }); // Changed 'coding' tag to 'aitool' for accuracy
    console.log(`[Sanity Fetch] for ${cacheKey} completed in ${Date.now() - startTime}ms`);

    if (data) {
      try {
        await redisHelpers.set(cacheKey, data, { ex: 3600 });
        console.log(`[Redis Cache Set] for ${cacheKey}`);
      } catch (redisSetError) {
        console.error(`Redis set error for ${cacheKey}:`, redisSetError.message);
      }
      return { ...data, __source: 'server-network' };
    }
    return null;
  } catch (error) {
    console.error(`Server-side fetch for slug ${slug} failed:`, error.message);
    return null;
  }
}

// Next.js `generateMetadata` function for SEO
export async function generateMetadata({ params }) {
  // This will now also benefit from Redis caching via the getData call
  const data = await getData(params.slug);

  if (!data) {
    return {
      title: 'Loading Content / Offline | DoItWithAI.tools',
      description: 'The content for this AI tool page is currently loading or you are offline. Attempting to retrieve cached data.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const imageUrl = data.mainImage ? urlForImage(data.mainImage).url() : null;
  const canonicalUrl = `https://www.doitwithai.tools/ai-tools/${params.slug}`;

  return {
    title: `${data.metatitle || data.title || 'DoItWithAI.tools'}`,
    description: data.metadesc || data.overview || 'AI tools and resources',
    keywords: data.tags?.map(tag=>tag.name).join(',')||'',
    authors:[{name:"Sufian Mustafa",url:"https://www.doitwithai.tools/author/sufian-mustafa"}],
    creator:"Sufian Mustafa",
    publisher:"DoItWithAI.tools",
    category:'AI Tools',
    classification:'Technology',
    robots:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1,},
    alternates:{canonical:canonicalUrl,},
    openGraph:{type:'article',title:data.metatitle,description:data.metadesc,url:canonicalUrl,siteName:'DoItWithAI.tools',locale:'en_US',images:imageUrl?[{url:imageUrl,width:1200,height:630,alt:data.mainImage?.alt||data.metatitle,type:'image/jpeg',}]:[],publishedTime:data.publishedAt,modifiedTime:data._updatedAt,section:'AI Tools',tags:data.tags?.map(tag=>tag.name)||[],},
    twitter:{card:'summary_large_image',site:'@doitwithai',creator:'@sufianmustafa',title:data.metatitle,description:data.metadesc,images:imageUrl?[imageUrl]:[],},
    verification:{google:'your-google-verification-code',yandex:'your-yandex-verification-code',yahoo:'your-yahoo-verification-code',},
  };
}

export default async function ParentPage({ params }) {
  const data = await getData(params.slug);
  const canonicalUrl = `https://www.doitwithai.tools/ai-tools/${params.slug}`;
  const imageUrl = data?.mainImage ? urlForImage(data.mainImage).url() : null;
  const readingTime = data ? Math.ceil((data.wordCount || 1000) / 250) : null;

  // --- Schema Markup Functions (now defined within the component for data access) ---
  function generateArticleSchema() {
    if (!data) return null; // No schema if no data from server
    const headingStructure = data.headings?.map((heading, index) => ({
      "@type": "WebPageElement",
      "@id": `${canonicalUrl}#heading-${index + 1}`,
      "name": heading.text,
      "cssSelector": heading.level
    })) || [];

    const articleContentText = data.content ?
      data.content.map(block =>
        block._type === 'block' ? block.children?.map(child => child.text).join(' ') : ''
      ).join(' ') : '';
    const truncatedArticleBody = articleContentText.length > 750 ?
      articleContentText.substring(0, 750) + '...' :
      articleContentText;

    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": ["Article", "TechArticle"],
        "@id": `${canonicalUrl}#article`,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl,
          "url": canonicalUrl
        },
        "headline": data.metatitle,
        "name": data.schematitle || data.metatitle,
        "description": data.schemadesc || data.metadesc,
        "abstract": data.overview,
        "articleSection": "AI Tools",
        "articleBody": truncatedArticleBody,
        "wordCount": data.wordCount || Math.round((data.estimatedReadingTime || 0) * 250),
        "datePublished": data.publishedAt,
        "dateModified": data._updatedAt || data.publishedAt,
        "dateCreated": data._createdAt || data.publishedAt,
        "author": {
          "@type": "Person",
          "@id": "https://www.doitwithai.tools/author/sufian-mustafa#person",
          "name": "Sufian Mustafa",
          "url": "https://www.doitwithai.tools/author/sufian-mustafa",
          "jobTitle": "AI Technology Expert",
          "knowsAbout": ["Artificial Intelligence", "AI Tools", "SEO", "Content Marketing", "Digital Marketing"],
          "sameAs": [
            "https://twitter.com/sufianmustafa",
            "https://linkedin.com/in/sufianmustafa"
          ]
        },
        "publisher": {
          "@type": "Organization",
          "@id": "https://www.doitwithai.tools#organization",
          "name": "DoItWithAI.tools",
          "url": "https://www.doitwithai.tools",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.doitwithai.tools/logoForHeader.png",
            "width": 512,
            "height": 512
          },
          "foundingDate": "2024",
          "founder": {
            "@type": "Person",
            "name": "Sufian Mustafa"
          }
        },
        "image": imageUrl ? {
          "@type": "ImageObject",
          "url": imageUrl,
          "width": 1200,
          "height": 630,
          "caption": data.mainImage?.alt || data.metatitle,
          "contentUrl": imageUrl,
          "thumbnailUrl": imageUrl
        } : undefined,
        "url": canonicalUrl,
        "mainEntity": {
          "@type": "Thing",
          "name": data.title,
          "description": data.overview
        },
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://www.doitwithai.tools#website"
        },
        "hasPart": headingStructure,
        "keywords": data.tags?.map(tag=>tag.name).join(",")||"",
        "about": {
          "@type": "Thing",
          "name": "Artificial Intelligence Tools",
          "sameAs": "https://en.wikipedia.org/wiki/Artificial_intelligence"
        },
        "mentions": data.tags?.map(tag=>({"@type":"Thing","name":tag.name}))||[],
        "inLanguage": "en-US",
        "copyrightYear": new Date().getFullYear(),
        "copyrightHolder": {
          "@type": "Organization",
          "@id": "https://www.doitwithai.tools#organization"
        },
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "accessibilityFeature": [
          "alternativeText",
          "readingOrder",
          "structuralNavigation",
          "tableOfContents"
        ],
        "accessibilityHazard": "none",
        "accessibilityControl": [
          "fullKeyboardControl",
          "fullMouseControl"
        ],
        "educationalLevel": "beginner",
        "learningResourceType": "article",
        "potentialAction": [
          {
            "@type": "ReadAction",
            "target": [canonicalUrl]
          },
          {
            "@type": "ShareAction",
            "target": [canonicalUrl]
          }
        ]
      })
    };
  }

  function generateCorrectTableOfContentsSchema(){
    if (!data) return null; // No schema if no data from server
    if(!data.tableOfContents||data.tableOfContents.length===0){return null;}
    const tocItems=[];
    let position=1;
    data.tableOfContents.forEach((item)=>{
      tocItems.push({
        "@type":"ListItem",
        "position":position++,
        "name":item.heading,
        "url":`${canonicalUrl}#${item.heading.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}`,
        "item":{
          "@type":"WebPageElement",
          "name":item.heading,
          "url":`${canonicalUrl}#${item.heading.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}`
        }
      });
      if(item.subheadings&&item.subheadings.length>0){
        item.subheadings.forEach((sub)=>{
          tocItems.push({
            "@type":"ListItem",
            "position":position++,
            "name":sub.subheading,
            "url":`${canonicalUrl}#${sub.subheading.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}`,
            "item":{
              "@type":"WebPageElement",
              "name":sub.subheading,
              "url":`${canonicalUrl}#${sub.subheading.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}`
            }
          });
        });
      }
    });
    return {
      __html:JSON.stringify({
        "@context":"https://schema.org",
        "@type":"ItemList",
        "@id":`${canonicalUrl}#table-of-contents`,
        "name":"Table of Contents",
        "description":`Table of contents for ${data.metatitle}`,
        "numberOfItems":tocItems.length,
        "itemListOrder":"https://schema.org/ItemListOrderAscending",
        "itemListElement":tocItems
      })
    };
  }

  function generateBreadcrumbSchema(){
    if (!data) return null; // No schema if no data from server
    return {
      __html:JSON.stringify({
        "@context":"https://schema.org",
        "@type":"BreadcrumbList",
        "@id":`${canonicalUrl}#breadcrumb`,
        "itemListElement":[
          {
            "@type":"ListItem",
            "position":1,
            "name":"Home",
            "item":{
              "@type":"WebPage",
              "@id":"https://www.doitwithai.tools/",
              "url":"https://www.doitwithai.tools/"
            }
          },
          {
            "@type":"ListItem",
            "position":2,
            "name":"AI Tools",
            "item":{
              "@type":"WebPage",
              "@id":"https://www.doitwithai.tools/ai-tools",
              "url":"https://www.doitwithai.tools/ai-tools"
            }
          },
          {
            "@type":"ListItem",
            "position":3,
            "name":data.schematitle||data.metatitle,
            "item":{
              "@type":"WebPage",
              "@id":canonicalUrl,
              "url":canonicalUrl
            }
          }
        ]
      })
    };
  }

  function generateFAQSchema(){
    if (!data) return null; // No schema if no data from server
    if(!data.faqs||data.faqs.length===0){return null;}
    return {
      __html:JSON.stringify({
        "@context":"https://schema.org",
        "@type":"FAQPage",
        "@id":`${canonicalUrl}#faq`,
        "mainEntity":data.faqs.map((faq,index)=>({
          "@type":"Question",
          "@id":`${canonicalUrl}#faq-${index+1}`,
          "name":faq.question,
          "text":faq.question,
          "answerCount":1,
          "acceptedAnswer":{
            "@type":"Answer",
            "@id":`${canonicalUrl}#faq-answer-${index+1}`,
            "text":faq.answer,
            "dateCreated":data.publishedAt,
            "upvoteCount":0,
            "url":`${canonicalUrl}#faq-${index+1}`,
            "author":{
              "@type":"Person",
              "name":"Sufian Mustafa"
            }
          }
        }))
      })
    };
  }

  function generateWebPageSchema(){
    if (!data) return null; // No schema if no data from server
    return {
      __html:JSON.stringify({
        "@context":"https://schema.org",
        "@type":"WebPage",
        "@id":canonicalUrl,
        "url":canonicalUrl,
        "name":data.metatitle,
        "description":data.metadesc,
        "inLanguage":"en-US",
        "isPartOf":{
          "@type":"WebSite",
          "@id":"https://www.doitwithai.tools#website"
        },
        "primaryImageOfPage":imageUrl?{
          "@type":"ImageObject",
          "url":imageUrl
        }:undefined,
        "datePublished":data.publishedAt,
        "dateModified":data._updatedAt||data.publishedAt,
        "author":{
          "@type":"Person",
          "name":"Sufian Mustafa"
        },
        "publisher":{
          "@type":"Organization",
          "@id":"https://www.doitwithai.tools#organization"
        },
        "mainContentOfPage":{
          "@type":"WebPageElement",
          "cssSelector":"main"
        },
        "breadcrumb":{
          "@type":"BreadcrumbList",
          "@id":`${canonicalUrl}#breadcrumb`
        },
        "speakable":{
          "@type":"SpeakableSpecification",
          "cssSelector":["h1","h2",".overview"]
        }
      })
    };
  }

  function generateWebSiteSchema(){
    // This one does not depend on 'data', so no 'if (!data) return null;' needed
    return {
      __html:JSON.stringify({
        "@context":"https://schema.org",
        "@type":"WebSite",
        "@id":"https://www.doitwithai.tools#website",
        "url":"https://www.doitwithai.tools",
        "name":"DoItWithAITools",
        "alternateName":["DoItWithAI.tools","DIWAITools"],
        "description":"DoItWithAIToolsisanAI-focusedcontenthubempoweringcreators,developers,marketers,andentrepreneurswithaccessible,actionableAIknowledgeandresourcestoboostproductivityandSEO.",
        "inLanguage":"en-US",
        "isPartOf":{
          "@type":"WebSite",
          "@id":"https://www.doitwithai.tools#website"
        },
        "about":{
          "@type":"Thing",
          "name":"Artificial Intelligence",
          "description":"AI tools, resources, and educational content"
        },
        "audience":{
          "@type":"Audience",
          "audienceType":"AI enthusiasts, developers, marketers, entrepreneurs"
        },
        "publisher":{
          "@type":"Organization",
          "@id":"https://www.doitwithai.tools#organization"
        },
        "potentialAction":[
          {
            "@type":"SearchAction",
            "target":{
              "@type":"EntryPoint",
              "urlTemplate":"https://www.doitwithai.tools/search?q={search_term_string}"
            },
            "query-input":"requiredname=search_term_string"
          }
        ],
        "sameAs":[
          "https://twitter.com/doitwithai",
          "https://facebook.com/doitwithai",
          "https://linkedin.com/company/doitwithai"
        ]
      })
    };
  }

  function generateOrganizationSchema(){
    // This one does not depend on 'data', so no 'if (!data) return null;' needed
    return {
      __html:JSON.stringify({
        "@context":"https://schema.org",
        "@type":"Organization",
        "@id":"https://www.doitwithai.tools#organization",
        "name":"DoItWithAITools",
        "legalName":"DoItWithAITools",
        "alternateName":["DoItWithAI.tools","DIWAITools"],
        "url":"https://www.doitwithai.tools",
        "logo":{
          "@type":"ImageObject",
          "url":"https://www.doitwithai.tools/logoForHeader.png",
          "width":512,
          "height":512,
          "caption":"DoItWithAITools Logo"
        },
        "image":{
          "@type":"ImageObject",
          "url":"https://www.doitwithai.tools/logoForHeader.png"
        },
        "description":"DoitwithAIToolsisyourcentralplatformtomasterSEOusingcutting-edgeAIinsightsanddiscoverhowartificialintelligencecanrevolutionizeyourdailytasks.Weempowerbusinesses,creators,andmarketersdoubleSEOperformanceandboostoverallproductivitybystrategicallyautomatingrepetitivetasksusingourfreeAIresources.Exploreourin-depthstrategiesandtools,designedforanyonelookingtounlockthefullpotentialofAIinreal-worldworkflows.",
        "foundingDate":"2024",
        "founder":{
          "@type":"Person",
          "@id":"https://www.doitwithai.tools/author/sufian-mustafa#person",
          "name":"Sufian Mustafa"
        },
        "address":{
          "@type":"PostalAddress",
          "addressCountry":"PK",
          "addressRegion":"Khyber Pakhtunkhwa"
        },
        "contactPoint":[
          {
            "@type":"ContactPoint",
            "contactType":"customer service",
            "email":"contact@doitwithai.tools",
            "availableLanguage":"English"
          }
        ],
        "sameAs":[
          "https://twitter.com/doitwithai",
          "https://facebook.com/doitwithai",
          "https://linkedin.com/company/doitwithai"
        ],
        "knowsAbout":[
          "Artificial Intelligence",
          "AI Tools",
          "Machine Learning",
          "Productivity Software",
          "SEO Optimization",
          "Content Creation",
          "Automation"
        ]
      })
    };
  }

  function generateHowToSchema(){
    if (!data) return null; // No schema if no data from server
    if(!data.articleType||!['howto','tutorial'].includes(data.articleType)){return null;}
    if(!data.tableOfContents||data.tableOfContents.length===0){return null;}
    return {
      __html:JSON.stringify({
        "@context":"https://schema.org",
        "@type":"HowTo",
        "@id":`${canonicalUrl}#howto`,
        "name":`How to use ${data.title}`,
        "description":data.metadesc,
        "image":imageUrl?{
          "@type":"ImageObject",
          "url":imageUrl
        }:undefined,
        "estimatedCost":{
          "@type":"MonetaryAmount",
          "currency":"USD",
          "value":"0"
        },
        "supply":[
          {
            "@type":"HowToSupply",
            "name":"Computer or mobile device"
          },
          {
            "@type":"HowToSupply",
            "name":"Internet connection"
          }
        ],
        "tool":[
          {
            "@type":"HowToTool",
            "name":data.title
          }
        ],
        "step":data.tableOfContents.map((item,index)=>({
          "@type":"HowToStep",
          "name":item.heading,
          "text":item.heading,
          "position":index+1,
          "url":`${canonicalUrl}#${item.heading.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`
        })),
        "totalTime":`PT${readingTime}M`,
        "author":{
          "@type":"Person",
          "@id":"https://www.doitwithai.tools/author/sufian-mustafa#person"
        }
      })
    };
  }

  function generateSoftwareApplicationSchema(){
    if (!data) return null; // No schema if no data from server
    if(!data.displaySettings?.isSoftwareReview){return null;}
    return {
      __html:JSON.stringify({
        "@context":"https://schema.org",
        "@type":"SoftwareApplication",
        "@id":`${canonicalUrl}#software`,
        "name":data.title,
        "description":data.metadesc,
        "url":canonicalUrl,
        "applicationCategory":"AITool",
        "applicationSubCategory":"ProductivitySoftware",
        "operatingSystem":"WebBrowser",
        "browserRequirements":"Requires JavaScript. Requires HTML5.",
        "countriesSupported":"Worldwide",
        "inLanguage":"en-US",
        "isAccessibleForFree":true,
        "creator":{
          "@type":"Organization",
          "@id":"https://www.doitwithai.tools#organization"
        },
        "datePublished":data.publishedAt,
        "dateModified":data._updatedAt||data.publishedAt,
        "screenshot":imageUrl?{
          "@type":"ImageObject",
          "url":imageUrl
        }:undefined,
        "featureList":data.tags?.map(tag=>tag.name)||["AI Tools","Productivity","Automation"],
        "softwareRequirements":"WebBrowser",
        "memoryRequirements":"1GB RAM",
        "processorRequirements":"Any modern processor",
        "storageRequirements":"No local storage required"
      })
    };
  }
  // ---End Schema Markup Functions---

  const articleSchema = generateArticleSchema();
  const tocSchema = generateCorrectTableOfContentsSchema();
  const breadcrumbSchema = generateBreadcrumbSchema();
  const faqSchema = generateFAQSchema();
  const webPageSchema = generateWebPageSchema();
  const webSiteSchema = generateWebSiteSchema(); // Independent of `data`
  const organizationSchema = generateOrganizationSchema(); // Independent of `data`
  const howToSchema = generateHowToSchema();
  const softwareApplicationSchema = generateSoftwareApplicationSchema();

  return (
    <>
      <Head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
        {/* ALWAYS provide a fallback title */}
        <title>{data?.metatitle || 'Loading Content / Offline'} | DoItWithAI.tools</title>
        <meta name="description" content={data?.metadesc || 'The content for this AI tool page is currently loading or you are offline.'}/>
        <meta name="keywords" content={data?.tags?.map(tag=>tag.name).join(',')||''}/>
        <meta name="author" content="Sufian Mustafa"/>
        <meta name="creator" content="Sufian Mustafa"/>
        <meta name="publisher" content="DoItWithAI.tools"/>
        <meta name="robots" content={data ? "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" : "noindex,nofollow"}/>
        <meta name="googlebot" content={data ? "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" : "noindex,nofollow"}/>
        <meta name="bingbot" content={data ? "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" : "noindex,nofollow"}/>

        {/* Use a conditional block for ALL data-dependent metatags */}
        {data && (
          <>
            <meta name="article:published_time" content={data.publishedAt}/>
            <meta name="article:modified_time" content={data._updatedAt || data.publishedAt}/>
            <meta name="article:author" content="Sufian Mustafa"/>
            <meta name="article:section" content="AI Tools"/>
            <meta name="article:tag" content={data.tags?.map(tag=>tag.name).join(',')||''}/>
            <meta name="classification" content="Technology"/>
            <meta name="category" content="AI Tools"/>
            <meta name="coverage" content="Worldwide"/>
            <meta name="distribution" content="Global"/>
            <meta name="rating" content="General"/>
            <meta name="subject" content="Artificial Intelligence Tools"/>
            <meta name="topic" content="AI Technology"/>
            <meta name="reading-time" content={`${readingTime} minutes`}/>
            <meta name="word-count" content={data.wordCount||Math.round((data.estimatedReadingTime||0)*250)}/>

            <meta property="og:type" content="article"/>
            <meta property="og:site_name" content="DoItWithAI.tools"/>
            <meta property="og:locale" content="en_US"/>
            <meta property="og:title" content={data.metatitle}/>
            <meta property="og:description" content={data.metadesc}/>
            <meta property="og:url" content={canonicalUrl}/>
            {imageUrl && (
              <>
                <meta property="og:image" content={imageUrl}/>
                <meta property="og:image:secure_url" content={imageUrl}/>
                <meta property="og:image:width" content="1200"/>
                <meta property="og:image:height" content="630"/>
                <meta property="og:image:alt" content={data.mainImage?.alt||data.metatitle}/>
                <meta property="og:image:type" content="image/jpeg"/>
              </>
            )}
            <meta property="article:published_time" content={data.publishedAt}/>
            <meta property="article:modified_time" content={data._updatedAt||data.publishedAt}/>
            <meta property="article:author" content="Sufian Mustafa"/>
            <meta property="article:section" content="AI Tools"/>
            {data.tags?.map((tag,index)=>(
              <meta key={`og-tag-${index}`} property="article:tag" content={tag.name}/>
            ))}

            <meta name="twitter:card" content="summary_large_image"/>
            <meta name="twitter:site" content="@doitwithai"/>
            <meta name="twitter:creator" content="@sufianmustafa"/>
            <meta name="twitter:title" content={data.metatitle}/>
            <meta name="twitter:description" content={data.metadesc}/>
            {imageUrl && <meta name="twitter:image" content={imageUrl}/>}
            <meta property="twitter:domain" content="doitwithai.tools"/>
            <meta property="twitter:url" content={canonicalUrl}/>
            <meta name="twitter:label1" content="Reading time"/>
            <meta name="twitter:data1" content={`${readingTime} minutes`}/>
            <meta name="twitter:label2" content="Written by"/>
            <meta name="twitter:data2" content="Sufian Mustafa"/>
            <link rel="canonical" href={canonicalUrl}/>
            <link rel="alternate" type="application/rss+xml" title="DoItWithAI.tools RSS Feed" href="https://www.doitwithai.tools/rss.xml"/>
          </>
        )}

        {/* Theme and Performance - always present */}
        <meta name="theme-color" content="#3b82f6"/>
        <meta name="color-scheme" content="light dark"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true"/>
        <link rel="dns-prefetch" href="//www.google-analytics.com"/>
        <link rel="icon" href="/favicon.ico"/>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
        <meta name="format-detection" content="telephone=no"/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-app-status-bar-style" content="default"/>
        <meta httpEquiv="cache-control" content="public,max-age=31536000,immutable"/>
        <meta name="referrer" content="strict-origin-when-cross-origin"/>

        <NextSeo
          title={`${data?.metatitle || 'Loading Content / Offline'} | DoItWithAI.tools`}
          description={data?.metadesc || 'The content for this AI tool page is currently loading or you are offline.'}
          canonical={canonicalUrl}
          openGraph={{
            type:'article',
            title:data?.metatitle||'Loading Content / Offline',
            description:data?.metadesc||'The content for this AI tool page is currently loading or you are offline.',
            url:canonicalUrl,
            siteName:'DoItWithAI.tools',
            locale:'en_US',
            images:imageUrl?[{url:imageUrl,width:1200,height:630,alt:data?.mainImage?.alt||data?.metatitle||'AI Tool Image',type:'image/jpeg',}]:[],
            publishedTime:data?.publishedAt,
            modifiedTime:data?._updatedAt||data?.publishedAt,
            section:'AI Tools',
            tags:data?.tags?.map(tag=>tag.name)||[],
          }}
          twitter={{
            card:'summary_large_image',
            site:'@doitwithai',
            creator:'@sufianmustafa',
            title:data?.metatitle||'Loading Content / Offline',
            description:data?.metadesc||'The content for this AI tool page is currently loading or you are offline.',
            images:imageUrl?[imageUrl]:[],
          }}
          additionalMetaTags={[{name:'keywords',content:data?.tags?.map(tag=>tag.name).join(',')||''},{name:'author',content:'Sufian Mustafa'}]}
        />
      </Head>

      {/* Enhanced Schema Markup Scripts - Prioritizing Article Elements */}
      {webSiteSchema && <Script id="WebSiteSchema" type="application/ld+json" dangerouslySetInnerHTML={webSiteSchema} strategy="beforeInteractive"/>}
      {organizationSchema && <Script id="OrganizationSchema" type="application/ld+json" dangerouslySetInnerHTML={organizationSchema} strategy="beforeInteractive"/>}
      {webPageSchema && <Script id="WebPageSchema" type="application/ld+json" dangerouslySetInnerHTML={webPageSchema} strategy="beforeInteractive"/>}
      {articleSchema && <Script id="ArticleSchema" type="application/ld+json" dangerouslySetInnerHTML={articleSchema} strategy="afterInteractive"/>}
      {breadcrumbSchema && <Script id="BreadcrumbListSchema" type="application/ld+json" dangerouslySetInnerHTML={breadcrumbSchema} strategy="afterInteractive"/>}
      {tocSchema && (<Script id="TableOfContentsSchema" type="application/ld+json" dangerouslySetInnerHTML={tocSchema} strategy="afterInteractive"/>)}
      {howToSchema && (<Script id="HowToSchema" type="application/ld+json" dangerouslySetInnerHTML={howToSchema} strategy="afterInteractive"/>)}
      {softwareApplicationSchema && (<Script id="SoftwareApplicationSchema" type="application/ld+json" dangerouslySetInnerHTML={softwareApplicationSchema} strategy="afterInteractive"/>)}
      {faqSchema && (<Script id="FAQSchema" type="application/ld+json" dangerouslySetInnerHTML={faqSchema} strategy="afterInteractive"/>)}

      {/* Render a loading/offline state if no data is available - This block should be in the component's return */}
    
        <PageCacheProvider pageType={data?._type||'aitool'} pageId={params.slug}>
       

          <main role="main" itemScope itemType="https://schema.org/Article">
            <meta itemProp="headline" content={data?.metatitle || ''}/>
            <meta itemProp="description" content={data?.metadesc || ''}/>
            <meta itemProp="datePublished" content={data?.publishedAt || ''}/>
            <meta itemProp="dateModified" content={data?._updatedAt || data?.publishedAt || ''}/>
            <div itemProp="author" itemScope itemType="https://schema.org/Person">
              <meta itemProp="name" content="Sufian Mustafa"/>
            </div>
            <div itemProp="publisher" itemScope itemType="https://schema.org/Organization">
              <meta itemProp="name" content="DoItWithAI.tools"/>
              <meta itemProp="url" content="https://www.doitwithai.tools"/>
            </div>
            {imageUrl && (
              <div itemProp="image" itemScope itemType="https://schema.org/ImageObject">
                <meta itemProp="url" content={imageUrl}/>
                <meta itemProp="width" content="1200"/>
                <meta itemProp="height" content="630"/>
              </div>
            )}
            <ArticleChildComp serverData={data} params={params} schemaType="aitool"/>
          </main>
        </PageCacheProvider>
      
    </>
  );
}