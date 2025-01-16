/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";

const Marquee = () => {
  const [brands, setBrands] = useState([]); // State to store fetched brands data

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const query = `*[_type == "brands"]`; // Fetch all documents of type 'brands'
        const data = await client.fetch(query); // Fetch data from Sanity
        setBrands(data); // Set fetched data to state
      } catch (error) {
        console.error("Failed to fetch brands data:", error);
      }
    };

    fetchBrands(); // Fetch brands data on component mount
  }, []);

  return (
    <div className="border-b border-body-color/[.15] pb-6 dark:border-white/[.15] md:pb-5 lg:pb-6">
      <div className="flex overflow-x-hidden">
        <div className="animate-marquee hover:pause-marquee flex space-x-6 whitespace-nowrap pb-2 pt-8">
          {/* Render the fetched brands data */}
          {brands.map((brand, index) => (
            <div key={index} className="inline-flex min-w-max shadow-md">
              <div className="wow fadeInUp flex transform overflow-hidden rounded-lg border border-gray-200 p-2 shadow-lg transition duration-1000 hover:scale-105 dark:border-gray-700">
                <img
                  src={brand.image}
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
          ))}
        </div>
      </div>
      <div className="flex overflow-x-hidden">
        <div className="animate2-marquee2 hover:pause-marquee flex space-x-6 whitespace-nowrap py-8">
          {/* Render the same brands data again */}
          {brands.map((brand, index) => (
            <div key={index} className="inline-flex min-w-max shadow-md">
              <div className="wow fadeInUp flex transform overflow-hidden rounded-lg border border-gray-200 p-2 shadow-lg transition duration-500 hover:scale-105 dark:border-gray-700">
                <img
                  src={brand.image}
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marquee;
