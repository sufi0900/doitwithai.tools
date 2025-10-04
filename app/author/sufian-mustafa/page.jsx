/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import React from "react";
import { NextSeo } from "next-seo";
import Script from "next/script";
import Head from 'next/head';
import Link from "next/link";

function getBaseUrl() {
  
  if (process.env.NODE_ENV === 'production') {
    return 'https://doitwithai.tools';  // Remove trailing slash
  }
  
  // For development
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

export const metadata = {
  title: "Sufian Mustafa: Author, Developer, & SEO Lead for doitwithai.tools",
  description: "Meet Sufian Mustafa, founder of Do It With AI Tools, a modern AI hub built with human-AI collaboration to teach creators modern SEO and business growth.",
  
  author: "Sufian Mustafa",
  
  // Enhanced keywords for name variations and discovery
  keywords: "Sufian Mustafa, Sufyan Mustafa, Sufiyan Mustafa, Sufian AI, Sufian SEO, Sufian web developer, AI content creator, SEO specialist, doitwithai.tools founder, AI strategist, modern SEO expert, content creation AI, Next.js developer, prompt engineering expert",
  
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
  
  openGraph: {
    title: "Sufian Mustafa: Author, Developer, & SEO Lead for doitwithai.tools",
    description: "Meet Sufian Mustafa, founder of Do It With AI Tools, a modern AI hub built with human-AI collaboration to teach creators modern SEO and business growth.",
    images: [{
      url: generateOGImageURL({
        title: 'Meet Sufian Mustafa — AI SEO Strategist & Creator of Do It With AI Tools',
        category: 'Author Page',
        ctaText: 'Read My Story',
        features: 'AI Strategist,SEO Lead,Web Developer',
      }),
      width: 1200,
      height: 630,
      alt: 'Sufian Mustafa - Founder of Do It With AI Tools, AI Strategist & SEO Specialist'
    }],
    url: `${getBaseUrl()}/author/sufian-mustafa`,
    type: 'profile',
    siteName: 'Do It With AI Tools',
    profile: {
      firstName: 'Sufian',
      lastName: 'Mustafa',
      username: 'sufianmustafa',
    },
  },
  
  twitter: {
    card: 'summary_large_image',
    site: "@doitwithai",
    creator: "@doitwithai",
    title: "Meet Sufian Mustafa — AI SEO Strategist & Creator of Do It With AI Tools",
    description: "Meet Sufian Mustafa, founder of Do It With AI Tools, a modern AI hub built with human-AI collaboration to teach creators modern SEO and business growth.",
    image: generateOGImageURL({
      title: 'Sufian Mustafa: Founder of Do It With AI Tools - Modern AI Hub for Content & SEO',
      category: 'Author Page',
      ctaText: 'Read My Story',
      features: 'AI Strategist,SEO Lead,Web Developer',
    }),
  },
  
  alternates: {
    canonical: `${getBaseUrl()}/author/sufian-mustafa`,
  },
};

function authorSchema() {
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${getBaseUrl()}/author/sufian-mustafa#webpage`,
          "url": `${getBaseUrl()}/author/sufian-mustafa`,
          "name": "Sufian Mustafa: Author, Developer, & SEO Lead for doitwithai.tools",
          "description": "Meet Sufian Mustafa, founder of Do It With AI Tools, a modern AI hub built with human-AI collaboration to teach creators modern SEO and business growth.",
          "inLanguage": "en-US",
          "breadcrumb": {
            "@id": `${getBaseUrl()}/author/sufian-mustafa#breadcrumb`
          },
          "mainEntityOfPage": {
            "@id": `${getBaseUrl()}/author/sufian-mustafa#person`
          },
        },
        {
          "@type": "Person",
          "@id": `${getBaseUrl()}/author/sufian-mustafa#person`,
          "name": "Sufian Mustafa",
          "alternateName": ["Sufyan Mustafa", "Sufiyan Mustafa", "Sufian", "Sufi"],
          "url": `${getBaseUrl()}/author/sufian-mustafa`,
          "image": {
            "@type": "ImageObject",
            "@id": `${getBaseUrl()}/sufi.jpeg#image`,
            "url": `${getBaseUrl()}/sufi.jpeg`,
            "width": 500,
            "height": 500,
            "caption": "Sufian Mustafa - Founder of Do It With AI Tools"
          },
          "jobTitle": "Founder, AI Strategist & SEO Lead",
          "worksFor": {
            "@type": "Organization",
            "name": "Do It With AI Tools",
            "url": `${getBaseUrl()}`
          },
          "description": "Sufian Mustafa is the founder of Do It With AI Tools, a modern AI hub specializing in content creation, SEO optimization (including GEO and AEO), and business scaling strategies. Expert in AI-powered workflows, web development, and strategic human-AI collaboration.",
          "knowsAbout": [
            "AI Content Creation",
            "SEO Optimization",
            "Generative Engine Optimization (GEO)",
            "Answer Engine Optimization (AEO)",
            "Web Development",
            "Next.js",
            "Prompt Engineering",
            "AI Strategy",
            "Content Marketing",
            "Business Scaling with AI"
          ],
          "email": "sufianmustafa0900@gmail.com",
          "sameAs": [
            "https://www.linkedin.com/in/sufian-mustafa/",
            "https://x.com/SufianWebDev",
            "https://dev.to/sufian",
            "https://medium.com/@sufianmustafa0900",
            "https://github.com/sufi0900",
            "https://sufianmustafa.com/"
          ]
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${getBaseUrl()}/author/sufian-mustafa#breadcrumb`,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": `${getBaseUrl()}/`
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Authors",
              "item": `${getBaseUrl()}/author`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Sufian Mustafa",
              "item": `${getBaseUrl()}/author/sufian-mustafa`
            }
          ]
        }
      ]
    })
  };
}

function breadcrumbSchema() {
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `${getBaseUrl()}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Authors",
          "item": `${getBaseUrl()}/author`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Sufian Mustafa",
          "item": `${getBaseUrl()}/author/sufian-mustafa`
        }
      ]
    })
  };
}

const AuthorPage = () => {
    return (
      <>
        <Head>
          <NextSeo
            title={metadata.title}
            description={metadata.description}
            canonical={metadata.alternates.canonical}
            openGraph={{
              title: metadata.openGraph.title,
              description: metadata.openGraph.description,
              url: metadata.openGraph.url,
              type: metadata.openGraph.type,
              images: metadata.openGraph.images,
              siteName: metadata.openGraph.siteName,
              locale: metadata.openGraph.locale,
            }}
            twitter={{
              card: metadata.twitter.card,
              site: metadata.twitter.site,
              handle: metadata.twitter.creator,
              title: metadata.twitter.title,
              description: metadata.twitter.description,
              image: metadata.twitter.image,
            }}
            additionalMetaTags={[
              { name: 'author', content: metadata.author },
              { name: 'keywords', content: metadata.keywords },
              { name: 'robots', content: 'index, follow' },
            ]}
          />
        </Head>
       <Script
  id="AuthorSchema"
  type="application/ld+json"
  dangerouslySetInnerHTML={authorSchema()}
/>
        <Script
          id="BreadcrumbSchema"
          type="application/ld+json"
          dangerouslySetInnerHTML={breadcrumbSchema()}
        />

        <div className="container mx-auto mt-8 mb-4 px-4">
          <div className="flex flex-col space-y-8 md:flex-row md:space-x-8 md:space-y-0">
            <div className="flex-1 space-y-8">
              <h1 className="relative mb-8 text-3xl font-bold tracking-wide text-black transition-colors duration-300 after:absolute after:-bottom-2 after:left-0 after:h-1 after:w-24 after:bg-blue-600 dark:text-white md:text-4xl lg:text-5xl">
                About Sufian Mustafa
              </h1>
 <h2 className="text-2xl font-bold text-black dark:text-white">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Founder & AI Content Strategist of Do It With AI Tools</span>
                </h2>
              <section className="transform space-y-4 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
               
                <h2 className="text-2xl font-bold text-black dark:text-white">
Web developer, AI enthusiast, and content creator
               </h2>
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                  Based in Pakistan, I'm a 27-year-old web developer and digital strategist who specializes in leveraging AI technologies to create sophisticated web solutions. With over two years of hands-on experience in modern web development, I've built my expertise around the strategic integration of AI tools with traditional development practices to deliver exceptional digital experiences.
                </p>
              </section>

              <section className="transform space-y-4 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  Technical Foundation & AI Integration
                </h2>
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                  My technical foundation encompasses <span className="font-semibold text-blue-600 dark:text-blue-400">HTML, CSS, JavaScript, ReactJS, and NextJS</span>. What sets my approach apart is the strategic integration of <span className="font-semibold text-blue-600 dark:text-blue-400">AI assistance</span> to enhance development efficiency and creative problem-solving. Rather than relying solely on traditional coding methods, I've developed a systematic approach to <span className="font-semibold text-blue-600 dark:text-blue-400">AI-assisted development</span> that accelerates project delivery while maintaining <span className="font-semibold text-blue-600 dark:text-blue-400">code quality</span>.
                </p>
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 mt-4">
                  This methodology has enabled me to build complex, <span className="font-semibold text-blue-600 dark:text-blue-400">dynamic web applications</span> including this very platform. My expertise lies in bridging the gap between <span className="font-semibold text-blue-600 dark:text-blue-400">foundational programming knowledge</span> and <span className="font-semibold text-blue-600 dark:text-blue-400">AI-enhanced development workflows</span>.
                </p>
              </section>

              <section className="transform space-y-4 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-4">AI as a Strategic Development Tool</h2>
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                  My approach to <span className="font-semibold text-blue-600 dark:text-blue-400">AI integration</span> goes beyond simple automation. I view AI as a <span className="font-semibold text-blue-600 dark:text-blue-400">strategic development partner</span> that amplifies creative capabilities and accelerates problem-solving processes. Through <span className="font-semibold text-blue-600 dark:text-blue-400">advanced AI interaction techniques</span>, I've developed proficiency in crafting precise inputs that generate optimal development solutions.
                </p>
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 mt-4">
                  This expertise in <span className="font-semibold text-blue-600 dark:text-blue-400">advanced AI utilization</span> has become instrumental in overcoming complex coding challenges. It helps me design sophisticated user interfaces and implement innovative features. My ability to effectively communicate with <span className="font-semibold text-blue-600 dark:text-blue-400">AI systems</span> has become a core competency that drives both <span className="font-semibold text-blue-600 dark:text-blue-400">web development projects</span> and <span className="font-semibold text-blue-600 dark:text-blue-400">content strategy initiatives</span>.
                </p>
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 mt-4">
                  My expertise also extends to <span className="font-semibold text-blue-600 dark:text-blue-400">headless CMS architecture</span>, particularly with <span className="font-semibold text-blue-600 dark:text-blue-400">Sanity.io</span>, enabling the creation of scalable, content-driven web applications. This very platform exemplifies my approach: combining <span className="font-semibold text-blue-600 dark:text-blue-400">Next.js frontend technology</span> with Sanity's flexible content management, all enhanced through AI assistance to optimize both <span className="font-semibold text-blue-600 dark:text-blue-400">development speed</span> and <span className="font-semibold text-blue-600 dark:text-blue-400">user experience</span>.
                </p>
              </section>

              <section className="transform space-y-4 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  The Genesis of Do It With AI Tools
                </h2>
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                  My journey into <span className="font-semibold text-blue-600 dark:text-blue-400">AI began in 2023</span> when I first discovered the potential of platforms like <span className="font-semibold text-blue-600 dark:text-blue-400">ChatGPT</span> for web development and digital strategy. What started as curiosity quickly turned into practical expertise. These tools helped me solve problems that would normally take weeks to figure out manually.
                </p>
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 mt-4">
                  <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                    When platforms like <span className="font-semibold text-blue-600 dark:text-blue-400">Bard</span> expanded AI capabilities, I saw new opportunities in <span className="font-semibold text-blue-600 dark:text-blue-400">SEO, digital marketing, and content strategy</span>. As the AI ecosystem grew with tools for <span className="font-semibold text-blue-600 dark:text-blue-400">image generation, content optimization, and analytics</span>, I realized there was a need for a comprehensive resource platform.
                  </p>
                </div>
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 mt-4">
                  This led me to spend countless hours <span className="font-semibold text-blue-600 dark:text-blue-400">researching and testing different AI tools</span>. Through hands-on experimentation and practical testing, I developed the insights and proven methods that now form the foundation of this platform.
                </p>
              </section>

              <section className="transform space-y-4 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  Platform Development Philosophy
                </h2>
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                  Every project I work on, including this platform, combines <span className="font-semibold text-blue-600 dark:text-blue-400">human creativity with AI assistance</span>. This approach uses AI to speed up development while I maintain control over <span className="font-semibold text-blue-600 dark:text-blue-400">quality, relevance, and strategic direction</span>.
                </p>
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                    <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Development Enhancement</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      AI assistance accelerates coding challenges, enabling rapid implementation of advanced features and efficient issue resolution.
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                    <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Content Strategy</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Strategic AI utilization supports SEO optimization, content research, and digital marketing strategy development.
                    </p>
                  </div>
                </div>
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 mt-4">
                  This integrated approach demonstrates how modern technology can amplify human creativity and strategic thinking to deliver superior digital solutions.
                </p>
              </section>

              <section className="transform space-y-4 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  Professional Mission & Vision
                </h2>
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                  Through <span className="font-semibold text-blue-600 dark:text-blue-400">Do It With AI Tools</span>, my mission is to democratize access to AI-powered strategies and tools that drive measurable business results. This platform serves as a comprehensive resource hub where professionals can discover, learn, and implement cutting-edge AI solutions for SEO, productivity, and digital growth.
                </p>
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 mt-4">
                  Every resource, guide, and tool recommendation here is grounded in hands-on testing and real-world application. That emphasis on practicality ensures you get actionable steps that work — and that you can rely on to move projects forward. My vision remains clear: bridge the gap between AI innovation and everyday business use so professionals at every level can benefit.
                </p>
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 mt-4">
                  Thanks for being here with me. If you're ready to put AI to work for your projects, <Link href="/contact" className="font-semibold text-blue-600 dark:text-blue-400 underline hover:no-underline">let's build together</Link> — explore the latest guides, try the tools, or reach out and we’ll make something useful together.
                </p>
              </section>
            </div>

            <div className="md:w-1/2">
              <div className="sticky top-8">
                <figure className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
                  <a href="/sufi.jpeg" className="block">
                    <div className="overflow-hidden">
                      <Image 
                        src="/sufi.jpeg" 
                        alt="Sufian Mustafa - AI-Powered Web Developer & Founder of Do It With AI Tools" 
                        quality={100} 
                        width={500} 
                        height={500} 
                        className="transition-transform duration-200 ease-in-out hover:scale-[1.05] w-full rounded-lg shadow-lg object-cover" 
                      />
                    </div>
                  </a>
                  <figcaption className="bg-white p-4 text-center dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Sufian Mustafa
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Founder & AI Strategy Expert
                    </p>
                  </figcaption>
                </figure>

              {/* Social icons (replace the previous anchors) */}


                <div className="mt-6 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-6 dark:from-blue-900/20 dark:to-blue-800/30">
                  <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">
                    Professional Focus Areas
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                      AI-Enhanced Web Development
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
Modern Search Optimization (SEO, GEO, AEO)                   </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
Content Strategy & Business Scaling
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                      AI Tool Research & Testing
                    </li>
                  </ul>
                </div>

<div className="mt-6 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
    <h3 className="text-lg font-bold text-black dark:text-white mb-4">
        Connect With Me
    </h3>
    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        {/* LinkedIn */}
        <a 
            href="https://www.linkedin.com/in/sufian-mustafa/" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Connect on LinkedIn"
            className="group flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-300 hover:!bg-blue-600 hover:!text-white hover:scale-110 hover:shadow-lg active:scale-95"
        >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
        </a>

        {/* Twitter/X */}
        <a 
            href="https://x.com/SufianWebDev" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Follow on Twitter"
            className="group flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-300 hover:!bg-blue-600 hover:!text-white hover:scale-110 hover:shadow-lg active:scale-95"
        >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
        </a>

        {/* Dev.to - Correct logo with "dev" text in box */}
        <a
            href="https://dev.to/sufian"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow on Dev.to"
            className="group flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-300 hover:!bg-blue-600 hover:!text-white hover:scale-110 hover:shadow-lg active:scale-95"
        >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7.826 10.083a.784.784 0 0 0-.468-.175h-.701v4.198h.701a.786.786 0 0 0 .468-.175c.155-.117.233-.292.233-.525v-2.798c.001-.233-.078-.408-.233-.525zM19.236 3H4.764C3.791 3 3.002 3.787 3.002 4.76v14.48c0 .973.789 1.76 1.762 1.76h14.472c.973 0 1.762-.787 1.762-1.76V4.76C21 3.787 20.209 3 19.236 3zM9.195 13.414c0 .755-.466 1.901-1.942 1.898H5.389V8.665h1.903c1.424 0 1.902 1.144 1.903 1.899v2.85zm4.045-3.562H11.1v1.544h1.309v1.188H11.1v1.543h2.142v1.188h-2.498a.813.813 0 0 1-.833-.792V9.497a.813.813 0 0 1 .833-.792h2.496v1.147zm4.165 4.632c-.531 1.235-1.481.99-1.906 0l-1.548-5.818h1.309l1.193 4.569 1.188-4.569h1.31l-1.546 5.818z"/>
            </svg>
        </a>

        {/* Medium */}
        <a
            href="https://medium.com/@sufianmustafa0900"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow on Medium"
            className="group flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-300 hover:!bg-blue-600 hover:!text-white hover:scale-110 hover:shadow-lg active:scale-95"
        >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
            </svg>
        </a>

        {/* GitHub */}
        <a
            href="https://github.com/sufi0900"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View GitHub Profile"
            className="group flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-300 hover:!bg-blue-600 hover:!text-white hover:scale-110 hover:shadow-lg active:scale-95"
        >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
        </a>
<a
  href="https://sufianmustafa.com/"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Visit my personal website"
  className="group flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-300 hover:!bg-blue-600 hover:!text-white hover:scale-110 hover:shadow-lg active:scale-95"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.05 12h19.9M12 2.05c2.73 2.73 4.45 6.55 4.45 9.95S14.73 19.27 12 21c-2.73-1.73-4.45-5.55-4.45-9.95S9.27 4.78 12 2.05z"
    />
  </svg>
</a>

        {/* Email */}
        <a
  href="mailto:sufianmustafa0900@gmail.com"
                    target="_blank"
                    rel="noreferrer"
                                aria-label="Send Email"
            className="group flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-300 hover:!bg-blue-600 hover:!text-white hover:scale-110 hover:shadow-lg active:scale-95"
        >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
        </a>
    </div>
    
    {/* Optional: Add a subtle separator */}
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Let's connect and build something amazing together
        </p>
    </div>
</div>


              </div>
            </div>
          </div>
        </div>
      </>
    );
};

export default AuthorPage;