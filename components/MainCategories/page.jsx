/* eslint-disable @next/next/no-img-element */
import React from "react";

const Categories = () => {
  const categoriesData = [
    {
      imageUrl:
        "https://res.cloudinary.com/dtvtphhsc/image/upload/v1714586054/Blue_and_Pink_Modern_Tech_Electronics_and_Technology_Retractable_Exhibition_Banner_alrq5i.png",
      heading: "AI Tools",
      link: "/digital-resources",
    },
    {
      imageUrl:
        "https://res.cloudinary.com/dtvtphhsc/image/upload/v1714587424/Blue_and_Pink_Modern_Tech_Electronics_and_Technology_Retractable_Exhibition_Banner_1_ju8jda.png",
      heading: "Make Money Online Using AI",
      link: "/make-money-with-ai",
    },
    {
      imageUrl:
        "https://res.cloudinary.com/dtvtphhsc/image/upload/v1714587675/Blue_and_Pink_Modern_Tech_Electronics_and_Technology_Retractable_Exhibition_Banner_2_aytyui.png",
      heading: "AI News & Trends",
      link: "/ai-trending-news",
    },
    {
      imageUrl:
        "https://res.cloudinary.com/dtvtphhsc/image/upload/v1714587424/Blue_and_Pink_Modern_Tech_Electronics_and_Technology_Retractable_Exhibition_Banner_3_ixrqom.png",
        heading: "Code With AI",
        link: "/code-with-ai",
    },
    {
      imageUrl:
        "https://res.cloudinary.com/dtvtphhsc/image/upload/v1714587423/Blue_and_Pink_Modern_Tech_Electronics_and_Technology_Retractable_Exhibition_Banner_4_h249te.png",
        heading: "Free AI Resources",
        link: "/free-ai-resources",
    },
   
    {
      imageUrl:
        "https://res.cloudinary.com/dtvtphhsc/image/upload/v1714587424/Blue_and_Pink_Modern_Tech_Electronics_and_Technology_Retractable_Exhibition_Banner_5_z9bjvg.png",

      heading: "SEO with AI",
      link: "/seo-with-ai",
    },
  
  ];

  return (
    <section id="categories" className="py-16 md:py-4 lg:py-8">
      <div className="container">
        <h1 className="mb-6 text-3xl font-bold tracking-wide text-black dark:text-white sm:text-4xl">
          <span className="group inline-block cursor-pointer">
            <span className="relative mr-2 inline-block">
              Popular
              <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </span>
            <span className="relative text-blue-500">
              Categories
              <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
            </span>
          </span>
        </h1>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 ">
          {categoriesData.map((category, index) => (
            <div
              key={index}
              className={`  p-4 relative rounded-lg border border-gray-200 bg-white  shadow dark:border-gray-700 dark:bg-gray-800 md:col-span-1`}
            >
              <a href={category.link} className="relative block">
                <img
                  className="h-auto w-full rounded-lg "
                  src={category.imageUrl}
                  alt={category.heading}
                />
                <div className="absolute inset-0 bg-black opacity-50 transition-opacity hover:opacity-30"></div>
              </a>
              <a
                href={category.link}
                className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 transform items-center rounded-lg bg-blue-700 px-6 py-3 text-center text-lg font-bold tracking-[2px] text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
              {/* <p>
                {" "}
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Obcaecati quos, facilis reiciendis cupiditate voluptatum et
              </p> */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
