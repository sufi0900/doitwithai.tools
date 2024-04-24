import React from "react";

const marquee = () => {
  const brands = [
    {
      imgSrc: "/images/1.jpg",
      title: "Brand One",
      subtitle: "Subtitle One",
    },
    {
      imgSrc:
        "https://w.forfun.com/fetch/07/07ac8d4a4dde1d894295ef7a928a4025.jpeg?download=3d-brizgi-litso-voda-art-devushka-86979.jpeg",
      title: "Brand One",
      subtitle: "Subtitle One",
    },
    {
      imgSrc: "/images/1.jpg",
      title: "Brand One",
      subtitle: "Subtitle One",
    },
    {
      imgSrc: "/images/1.jpg",
      title: "Brand One",
      subtitle: "Subtitle One",
    },
    {
      imgSrc: "/path-to-image-2.jpg",
      title: "Brand Two",
      subtitle: "Subtitle Two",
    },
    // Add more brands as needed
  ];

  return (
    <div className="border-b border-body-color/[.15] pb-6 dark:border-white/[.15] md:pb-5 lg:pb-6">
      <div className="flex overflow-x-hidden ">
        <div className="animate-marquee hover:pause-marquee flex space-x-6 whitespace-nowrap pb-2 pt-8">
          {/* Render the first set of cards */}
          {brands.concat(brands).map(
            (
              brand,
              index, // Use concat to duplicate your brands array
            ) => (
              <div key={index} className="inline-flex min-w-max shadow-md">
                <div className="wow fadeInUp flex transform overflow-hidden rounded-lg border border-gray-200 p-2 shadow-lg transition duration-200 hover:scale-105 dark:border-gray-700">
                  <img
                    src={brand.imgSrc}
                    alt={`${brand.title} logo`}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className="ml-4 flex flex-col justify-center">
                    <h3 className="mb-2 text-xl font-bold text-black dark:text-white">
                      {brand.title}
                    </h3>
                    <p className="text-base font-medium leading-relaxed text-body-color">
                      {brand.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
      <div className="flex overflow-x-hidden">
        <div className="animate2-marquee2 hover:pause-marquee flex space-x-6 whitespace-nowrap py-8">
          {/* Render the first set of cards */}
          {brands.concat(brands).map(
            (
              brand,
              index, // Use concat to duplicate your brands array
            ) => (
              <div key={index} className="inline-flex min-w-max shadow-md">
                <div className="wow fadeInUp flex transform overflow-hidden rounded-lg border border-gray-200 p-2 shadow-lg transition duration-300 hover:scale-105 dark:border-gray-700">
                  <img
                    src={brand.imgSrc}
                    alt={`${brand.title} logo`}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className="ml-4 flex flex-col justify-center">
                    <h3 className="mb-2 text-xl font-bold text-black dark:text-white">
                      {brand.title}
                    </h3>
                    <p className="text-base font-medium leading-relaxed text-body-color">
                      {brand.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default marquee;
