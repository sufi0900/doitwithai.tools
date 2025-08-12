/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import React from "react";
import { NextSeo } from "next-seo";
import Script from "next/script";
import Head from 'next/head';

// Enhanced utility functions
function getBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://doitwithai.tools';
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
  description: "Meet the creator behind doitwithai.tools. Sufian Mustafa developed this platform & all its content using a unique, strategic blend of AI and web development",
  author: "Sufian Mustafa",
  keywords: "Sufian Mustafa, AI web developer, AI content creator, author page, doitwithai.tools, prompt engineering, Sanity.io, Next.js developer",
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
  description: "Meet the creator behind doitwithai.tools. Sufian Mustafa developed this platform & all its content using a unique, strategic blend of AI and web development",
   images: [{
      url: generateOGImageURL({
        title: 'Meet the Creator',
        description: ' Sufian Mustafa, the founder of doitwithai.tools, shares his story of building an entire platform with AI and passion.',
        category: 'Author Page',
        ctaText: 'Read My Story',
        features: 'Web Developer,AI Enthusiast,Content Creator',
      }),
      width: 1200,
      height: 630,
      alt: 'Sufian Mustafa - AI-Assisted Web Creator and Author'
    }],
    url: `${getBaseUrl()}/author/sufian-mustafa`,
    type: 'profile',
    siteName: 'doitwithai.tools',
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
   title: "Sufian Mustafa: Author, Developer, & SEO Lead for doitwithai.tools",
  description: "Meet the creator behind doitwithai.tools. Sufian Mustafa developed this platform & all its content using a unique, strategic blend of AI and web development",
   image: generateOGImageURL({
      title: 'Meet the Creator',
      description: ' Sufian Mustafa, the founder of doitwithai.tools, shares his story of building an entire platform with AI and passion.',
      category: 'Author Page',
      ctaText: 'Read My Story',
      features: 'Web Developer,AI Enthusiast,Content Creator',
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
      "@type": "Person",
      "name": "Sufian Mustafa",
      "url": `${getBaseUrl()}/author/sufian-mustafa`,
      "image": `${getBaseUrl()}/sufi.jpeg`,
      "jobTitle": "AI-Assisted Web Creator and Content Creator",
      "description": "Sufian Mustafa is a passionate web developer and AI enthusiast who creates and curates content for doitwithai.tools, combining modern web technologies with the power of artificial intelligence.",
      "sameAs": [
        "https://www.linkedin.com/in/sufianmustafa",
        "https://twitter.com/doitwithai", // Example, please update with a real Twitter for Sufian
      ],
      "brand": {
        "@type": "Organization",
        "name": "doitwithai.tools",
        "url": `${getBaseUrl()}`,
      }
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
          key="author-jsonld"
          strategy="beforeInteractive"
        />
        <Script
          id="BreadcrumbSchema"
          type="application/ld+json"
          dangerouslySetInnerHTML={breadcrumbSchema()}
          key="breadcrumb-jsonld"
          strategy="beforeInteractive"
        />



<div className="container mx-auto mt-8 mb-4 px-4">
  <div className="flex flex-col space-y-8 md:flex-row md:space-x-8 md:space-y-0">
    <div className="flex-1 space-y-8">
      <h1 className="relative mb-8 text-3xl font-bold tracking-wide text-black transition-colors duration-300 after:absolute after:-bottom-2 after:left-0 after:h-1 after:w-24 after:bg-blue-600 dark:text-white md:text-4xl lg:text-5xl">
        About Sufian Mustafa
      </h1>

      <section className="transform space-y-4 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">AI-Powered Web Developer & Digital Strategist</span>
        </h2>
        <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
          Founder of Do It With AI Tools
        </p>
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
          Every resource, guide, and tool recommendation is thoroughly tested and validated through real-world application. This commitment to quality and practical value ensures that visitors can confidently implement these strategies to achieve their professional objectives. My vision is to bridge the gap between AI innovation and practical business application, making advanced technology accessible to professionals at every level.
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
        
        {/* Professional Contact Card */}
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
              SEO Strategy & Implementation
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              Digital Marketing Optimization
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              AI Tool Research & Testing
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>


      </>
    );

};

export default AuthorPage;