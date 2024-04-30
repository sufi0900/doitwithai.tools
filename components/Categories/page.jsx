

import Link from "next/link";
import React from "react";

const SubCategories = () => {
  const categoriesData = [
    {
      imageUrl:
        "https://t3.ftcdn.net/jpg/05/71/06/76/360_F_571067620_JS5T5TkDtu3gf8Wqm78KoJRF1vobPvo6.jpg",
      heading: "AI Image Generator",
      link: "ai-tools/ai-image-generator",
    },
    {
      imageUrl:
        "https://t3.ftcdn.net/jpg/05/29/29/82/360_F_529298244_DuxHOeHrixTHREpexOvLpAk6opmRXAP0.jpg",
      heading: "AI Video Generator",
      link: "ai-tools/ai-video-generator",
    },
    {
      imageUrl:
        "https://t3.ftcdn.net/jpg/05/29/29/82/360_F_529298244_DuxHOeHrixTHREpexOvLpAk6opmRXAP0.jpg",
      heading: "AI Extension",
      link: "ai-tools/ai-extension",
    },
    {
      imageUrl:
        "https://t3.ftcdn.net/jpg/05/29/29/82/360_F_529298244_DuxHOeHrixTHREpexOvLpAk6opmRXAP0.jpg",
      heading: "AI Website Builder",
      link: "ai-tools/ai-website-builder",
    },
    {
      imageUrl:
        "https://t3.ftcdn.net/jpg/05/29/29/82/360_F_529298244_DuxHOeHrixTHREpexOvLpAk6opmRXAP0.jpg",
      heading: "AI Article Writer",
      link: "ai-tools/ai-article-generator",
    },
    {
      imageUrl:
        "https://t3.ftcdn.net/jpg/05/29/29/82/360_F_529298244_DuxHOeHrixTHREpexOvLpAk6opmRXAP0.jpg",
      heading: "AI logo generator",
      link: "ai-tools/ai-logo-generator",
    },

    // Add more news items as needed
  ];

  return (
    <section id="categories" className="md:py-9 lg:py-17 py-10">
      <div className="container">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categoriesData.map((category, index) => (
            <div
              key={index}
              className="relative rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800"
            >
              <a href={category.link}>
                <img
                  className="h-auto w-full rounded-lg"
                  src={category.imageUrl}
                  alt={category.heading}
                />
              </a>
              <Link
                href={category.link}
                className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 transform items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                {category.heading}
                <svg
                  className="ms-2 h-3.5 w-3.5 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubCategories;
