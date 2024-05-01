

import Link from "next/link";
import React from "react";

const SubCategories = () => {
  const categoriesData = [
    {
      imageUrl:
        "https://t3.ftcdn.net/jpg/05/71/06/76/360_F_571067620_JS5T5TkDtu3gf8Wqm78KoJRF1vobPvo6.jpg",
      heading: "AI Image Generator",
      link: "ai-tools/ai-image-generator",
      description:"Explore a comprehensive list of blogs on the top AI tools for generating images. Our detailed reviews help you find the perfect text-to-video creator for your projects.",
    },
    {
      imageUrl:
        "https://t3.ftcdn.net/jpg/05/29/29/82/360_F_529298244_DuxHOeHrixTHREpexOvLpAk6opmRXAP0.jpg",
      heading: "AI Video Generator",
      link: "ai-tools/ai-video-generator",
      description:"Explore a comprehensive list of blogs on the top AI tools for generating and Editing videos. Our detailed reviews help you find the perfect text-to-video creator for your projects.",
    },
    {
      imageUrl:
        "https://t3.ftcdn.net/jpg/05/29/29/82/360_F_529298244_DuxHOeHrixTHREpexOvLpAk6opmRXAP0.jpg",
      heading: "AI Extension",
      link: "ai-tools/ai-extension",
      description:"Get the best AI extensions for your needs by reading our comprehensive blogs! Boost your productivity with strong AI technologies that are all Chrome extensions",
    },
    {
      imageUrl:
        "https://t3.ftcdn.net/jpg/05/29/29/82/360_F_529298244_DuxHOeHrixTHREpexOvLpAk6opmRXAP0.jpg",
      heading: "AI Website Builder",
      link: "ai-tools/ai-website-builder",
      description:"Explore comprehensive list of blogs to find the best AI website builder! Launch your dream website quickly and easily with the power of artificial intelligence.",
    },
    {
      imageUrl:
        "https://t3.ftcdn.net/jpg/05/29/29/82/360_F_529298244_DuxHOeHrixTHREpexOvLpAk6opmRXAP0.jpg",
      heading: "AI Article Writer",
      link: "ai-tools/ai-article-generator",
      description:"Explore our huge blog collection to find the best AI writing tools for producing interesting blogs, articles, and more. This will help you produce more content.",
    },
    {
      imageUrl:
        "https://t3.ftcdn.net/jpg/05/29/29/82/360_F_529298244_DuxHOeHrixTHREpexOvLpAk6opmRXAP0.jpg",
      heading: "AI logo generator",
      link: "ai-tools/ai-logo-generator",
      description:"Discover powerful AI tools to design your brand's logo! Find the perfect logo maker with in-depth reviews on our blog and get started for free.",
    },

    // Add more news items as needed
  ];

  return (
    <section id="categories" className="md:py-9 lg:py-17 py-10">
      <div className="container px-20  mx-auto">
        {/* Responsive top heading */}
        <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-blue-500 from-primary">Sub Categories</span> of AI Tools</h1>
        </div>

        {/* Grid of cards */}
        <div className=" grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categoriesData.map((category, index) => (
            <div
              key={index}
              className="card hover:shadow-lg mt-4 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition duration-200 ease-in-out  hover:scale-[1.03] max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow "
            >
              <Link href={category.link}>
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{category.heading}</h5>
              </Link>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{category.description}</p>
              <Link href={category.link}>
                <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                  Read more
                  <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                  </svg>
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubCategories;
