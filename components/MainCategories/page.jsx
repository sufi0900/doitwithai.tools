"use client"
import React, { useState } from "react";

const Categories = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const categoriesData = [
    {
      imageUrl:
        "https://res.cloudinary.com/dtvtphhsc/image/upload/v1714586054/Blue_and_Pink_Modern_Tech_Electronics_and_Technology_Retractable_Exhibition_Banner_alrq5i.png",
      heading: "AI Tools 🛠️",
      link: "/digital-resources",
      gradientClass: "from-purple-600 to-blue-500",
      hoverGradientClass: "from-blue-500 to-purple-600", // Define hover gradient class

    },
    {
      imageUrl:
        "https://res.cloudinary.com/dtvtphhsc/image/upload/v1714587424/Blue_and_Pink_Modern_Tech_Electronics_and_Technology_Retractable_Exhibition_Banner_1_ju8jda.png",
      heading: "Make Money with AI 💸",
      link: "/make-money-with-ai",
      gradientClass: "from-red to-green",
      hoverGradientClass: "from-green to-red ", // Define hover gradient class
      // hoverGradientClass: "from-blue-500 to-cyan-500 ", 

    },
    {
      imageUrl:
        "https://res.cloudinary.com/dtvtphhsc/image/upload/v1714587675/Blue_and_Pink_Modern_Tech_Electronics_and_Technology_Retractable_Exhibition_Banner_2_aytyui.png",
      heading: "AI News & Trends 📰",
      link: "/ai-trending-news",
      gradientClass: "from-green to-blue",
      hoverGradientClass: "from-blue-600 to-green-400", // Define hover gradient class

    },
    {
      imageUrl:
        "https://res.cloudinary.com/dtvtphhsc/image/upload/v1714587424/Blue_and_Pink_Modern_Tech_Electronics_and_Technology_Retractable_Exhibition_Banner_3_ixrqom.png",
      heading: "Code With AI 💻",
      link: "/code-with-ai",
      gradientClass: "from-black to-brown ",
      hoverGradientClass: "from-brown to-purple-500", // Define hover gradient class

    },
    {
      imageUrl:
        "https://res.cloudinary.com/dtvtphhsc/image/upload/v1714587423/Blue_and_Pink_Modern_Tech_Electronics_and_Technology_Retractable_Exhibition_Banner_4_h249te.png",
      heading: "Free AI Resources 🆓",
      link: "/free-ai-resources",
 
      gradientClass: "from-brown to-blue",

      hoverGradientClass: "from-blue to-brown", // Define hover gradient class

    },
    {
      imageUrl:
        "https://res.cloudinary.com/dtvtphhsc/image/upload/v1714587424/Blue_and_Pink_Modern_Tech_Electronics_and_Technology_Retractable_Exhibition_Banner_5_z9bjvg.png",
      heading: "SEO with AI 📊",
      link: "/seo-with-ai",
      gradientClass: "from-black to-blue-200",
      
      hoverGradientClass: "from-blue to-black", // Define hover gradient class

    },
  ];
  const getGradientColors = (gradientClass) => {
    // Extract gradient colors from the provided class
    const [fromColor, toColor] = gradientClass.split(" ").filter((c) => c.startsWith("from") || c.startsWith("to"));
    const fromColorValue = fromColor ? fromColor.split("-")[1] : "";
    const toColorValue = toColor ? toColor.split("-")[1] : "";

    // Return the gradient colors in the correct format for inline style
    return `${fromColorValue}, ${toColorValue}`;
  };


  return (
    <section id="categories" className="py-16 md:py-4 lg:py-8">
      <div className="container">
        <h1 className="mb-6 text-3xl font-bold tracking-wide text-black dark:text-white sm:text-4xl">
          <span className="group inline-block cursor-pointer">
            <span className="  relative mr-2 inline-block">
              Popular
              <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </span>
            <span className="relative text-blue-500">
              Categories
              <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
            </span>
          </span>
        </h1>
        <div className=" grid grid-cols-1 gap-4 md:grid-cols-2 ">
          {categoriesData.map((category, index) => (
            <div
              key={index}
              className={`card4  p-4 relative rounded-lg border border-gray-200 bg-white  shadow dark:border-gray-700 dark:bg-gray-800 md:col-span-1`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="relative block">
                <a href={category.link}>
                  <img
                    className="h-auto w-full rounded-lg "
                    src={category.imageUrl}
                    alt={category.heading}
                  />
                  <div
                    className="absolute  inset-0 bg-gray-800 opacity-60 transition-opacity  duration-300 hover:opacity-20"
                    style={{
                      backgroundImage: `linear-gradient(to bottom right, ${hoveredIndex === index ? getGradientColors(category.hoverGradientClass) : getGradientColors(category.gradientClass)})`,
                    }}
                  ></div>
                </a>
              </div>
              <a
                href={category.link}
                className={`card4  transition duration-300 border border-white absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 transform items-center rounded-lg px-6 py-3 text-center text-lg font-bold tracking-[2px] text-white  focus:outline-none focus:ring-4 dark:focus:ring-blue-800 ${category.gradientClass}`}
                style={{
                  backgroundImage: `linear-gradient(to bottom right, ${
                    hoveredIndex === index
                      ? getGradientColors(category.hoverGradientClass)
                      : getGradientColors(category.gradientClass)
                  })`,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
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
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
