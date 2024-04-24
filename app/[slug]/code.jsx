/* eslint-disable @next/next/no-img-element */
"use client";
import RelatedPost from "@/components/Blog/RelatedPost";
import SharePost from "@/components/Blog/SharePost";
import TagButton from "@/components/Blog/TagButton";
import NewsLatterBox from "@/components/Contact/NewsLatterBox";
import Image from "next/image";
import React, { useState } from "react";



import { urlForImage } from "@/sanity/lib/image";
import Link from "next/link";

export const revalidate = false;
export const dynamic = "force-dynamic";

// Define a custom table component

// Update the portableTextComponents object to include the custom table component
import "@/styles/customanchor.css";
const portableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-4 text-base font-medium text-body-color sm:text-lg lg:text-base xl:text-lg">
        {children}
      </p>
    ),

    h1: ({ children }) => (
      <h1 className="mb-8 text-3xl font-bold leading-tight text-black transition-colors duration-300 hover:text-blue-600  dark:text-white dark:hover:text-blue-400 sm:text-4xl sm:leading-tight">
        {children}
      </h1>
    ),

    h2: ({ children }) => (
      <h2 className="font-xl mb-10 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight">
        {children}
      </h2>
    ),
    h4: ({ children }) => (
      <div className="relative z-10 mb-10 overflow-hidden rounded-md bg-primary bg-opacity-10 p-8 md:p-9 lg:p-8 xl:p-9">
        <h4 className="text-center text-base font-medium italic text-body-color">
          {children}
        </h4>
      </div>
    ),
  },

  list: {
    bullet: ({ children }) => (
      <ul className="mb-10 list-inside list-disc text-body-color">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-inside list-decimal">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="mb-2 text-base font-medium text-body-color sm:text-lg lg:text-base xl:text-lg">
        {children}
      </li>
    ),
    number: ({ children }) => <li className="...">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="text-primary dark:text-white">{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
  },

  types: {
    image: ({ value }) => {
      const imageUrl = urlForImage(value.asset).url();
      const altText = value.alt || "";
      return (
        <div className="card3 m-2 rounded-xl xs:m-1 sm:m-2">
          <figure className=" relative mb-10  mt-4 ">
            <div className=" w-full overflow-hidden  rounded-tl-xl rounded-tr-xl ">
              <a href={imageUrl}>
                <img
                  className=" h-full w-full object-cover transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5]"
                  src={imageUrl}
                  alt={altText}
                />
              </a>
            </div>
            <figcaption className="dark-bg-green-50 rounded-bl-xl rounded-br-xl bg-green-50 text-center text-sm text-gray-800 dark:text-gray-800">
              {altText}
            </figcaption>
          </figure>
        </div>
      );
    },
    table: ({ value }) => (
      <div className="card2 m-2 mb-4 mt-4 rounded-bl-xl rounded-br-xl rounded-tl-xl rounded-tr-xl shadow-md">
        <div className="relative overflow-x-auto rounded-xl">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <tbody>
              {value.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`${
                    rowIndex % 2 === 0
                      ? "bg-green-100 dark:bg-gray-800"
                      : "bg-white dark:bg-gray-900"
                  } ${
                    rowIndex % 4 === 0 ? "bg-green-100 dark:bg-gray-800" : ""
                  } border-b hover:bg-gray-200 dark:hover:bg-gray-700`}
                  style={{ borderRadius: "0.5rem" }} // Adjust border radius here
                >
                  {row.cells.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 font-medium dark:text-white"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  button: ({ value }) => {
    const { text, link } = value;
    return (
      <div className="btn1 mb-4 mt-4">
        <a
          href={link}
          className="inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          {text}
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
              strokeWidth={2}
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </a>
      </div>
    );
  },
};
portableTextComponents.types.button = portableTextComponents.button;

export default function BlogSidebarPage({ data }) {
  const [isTableOfContentsOpen, setIsTableOfContentsOpen] = useState(false);

  // Function to toggle the state of the table of contents box
  const toggleTableOfContents = () => {
    setIsTableOfContentsOpen(!isTableOfContentsOpen);
  };

  // Function to render the table of contents
  const renderTableOfContents = () => {
    if (!data.tableOfContents || data.tableOfContents.length === 0) {
      return null; // Return null if table of contents is empty
    }

    return (
      <div
        className={`transition-max-height mb-8 overflow-hidden ${
          isTableOfContentsOpen ? "max-h-full" : "max-h-0"
        }`}
      >
        <div className="card rounded border border-gray-300 p-4">
          <h3 className="mb-2 text-lg font-semibold">Table of Contents</h3>
          <ul className="list-disc pl-4">
            {data.tableOfContents.map((heading, index) => (
              <li key={index}>
                <a href={`#heading${index + 1}`}>{heading}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <>
      <section className=" overflow-hidden pb-[120px] pt-[50px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4  lg:w-8/12">
              <div>
                <h1 className="mb-8 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight">
             
                </h1>
              
              </div>
            </div>
            <div className="w-full px-4 lg:w-4/12">
              <div className="mb-10 mt-12 rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark dark:shadow-none lg:mt-0">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="Search here..."
                    className="mr-4 w-full rounded-sm border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                  />
                  <button
                    aria-label="search button"
                    className="flex h-[50px] w-full max-w-[50px] items-center justify-center rounded-sm bg-primary text-white"
                  >
                    <svg
                      width="20"
                      height="18"
                      viewBox="0 0 20 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.4062 16.8125L13.9375 12.375C14.9375 11.0625 15.5 9.46875 15.5 7.78125C15.5 5.75 14.7188 3.875 13.2812 2.4375C10.3438 -0.5 5.5625 -0.5 2.59375 2.4375C1.1875 3.84375 0.40625 5.75 0.40625 7.75C0.40625 9.78125 1.1875 11.6562 2.625 13.0937C4.09375 14.5625 6.03125 15.3125 7.96875 15.3125C9.875 15.3125 11.75 14.5938 13.2188 13.1875L18.75 17.6562C18.8438 17.75 18.9688 17.7812 19.0938 17.7812C19.25 17.7812 19.4062 17.7188 19.5312 17.5938C19.6875 17.3438 19.6562 17 19.4062 16.8125ZM3.375 12.3438C2.15625 11.125 1.5 9.5 1.5 7.75C1.5 6 2.15625 4.40625 3.40625 3.1875C4.65625 1.9375 6.3125 1.3125 7.96875 1.3125C9.625 1.3125 11.2812 1.9375 12.5312 3.1875C13.75 4.40625 14.4375 6.03125 14.4375 7.75C14.4375 9.46875 13.7188 11.125 12.5 12.3438C10 14.8438 5.90625 14.8438 3.375 12.3438Z"
                        fill="white"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mb-10 rounded-sm bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                <h3 className="border-b border-body-color border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
                  Related Posts
                </h3>
                <ul className="p-8">
                  <li className="mb-6 border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10">
                    <RelatedPost
                      title="Best way to boost your online sales."
                      image="/images/blog/post-01.jpg"
                      slug="#"
                      date="12 Feb 2025"
                    />
                  </li>
                  <li className="mb-6 border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10">
                    <RelatedPost
                      title="50 Best web design tips & tricks that will help you."
                      image="/images/blog/post-02.jpg"
                      slug="#"
                      date="15 Feb, 2024"
                    />
                  </li>
                  <li>
                    <RelatedPost
                      title="The 8 best landing page builders, reviewed"
                      image="/images/blog/post-03.jpg"
                      slug="#"
                      date="05 Jun, 2024"
                    />
                  </li>
                </ul>
              </div>
              <div className="mb-10 rounded-sm bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                <h3 className="border-b border-body-color border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
                  Popular Category
                </h3>
                <ul className="px-8 py-6">
                  <li>
                    <a
                      href="#0"
                      className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                    >
                      Tailwind Templates
                    </a>
                  </li>
                  <li>
                    <a
                      href="#0"
                      className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                    >
                      Landing page
                    </a>
                  </li>
                  <li>
                    <a
                      href="#0"
                      className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                    >
                      Startup
                    </a>
                  </li>
                  <li>
                    <a
                      href="#0"
                      className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                    >
                      Business
                    </a>
                  </li>
                  <li>
                    <a
                      href="#0"
                      className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                    >
                      Multipurpose
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mb-10 rounded-sm bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                <h3 className="border-b border-body-color border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
                  Popular Tags
                </h3>
                <div className="flex flex-wrap px-8 py-6">
                  <TagButton text="Themes" />
                  <TagButton text="UI Kit" />
                  <TagButton text="Tailwind" />
                  <TagButton text="Startup" />
                  <TagButton text="Business" />
                </div>
              </div>

              <NewsLatterBox />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
