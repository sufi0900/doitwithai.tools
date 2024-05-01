import React from "react";
import Link from "next/link";
import { urlForImage } from "@/sanity/lib/image"; // Update path if needed
import Image from "next/image";
const page = ({ posts }) => {
  const MAX_TITLE_LENGTH = 20; // Maximum characters for title
  const MAX_OVERVIEW_LENGTH = 100; // Maximum characters for overview
  const truncateText = (text, maxLength) => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };
  const recentPosts = posts.slice(0, 3);

  return (
    <section className="pb-[20px] pt-[20px]">
      <div className="container">
        <h1 className="mb-6 text-3xl font-bold tracking-wide text-black dark:text-white sm:text-4xl">
          <span className="relative mr-2 inline-block">
            Recent
            <span className="absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
          </span>
          <span className="text-blue-500">Post</span>
        </h1>
        <div className="-mx-4 flex flex-wrap justify-center">
          {recentPosts.map((post) => (
            <div key={post._id} className="mb-6 px-2 ">
              <div className="max-w-sm rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
                <Link href={`/blog/${post.slug.current}`}>
                  <img
                    className="rounded-t-lg"
                    src={urlForImage(post.mainImage).url()}
                    alt={post.title}
                    style={{
                      width: "100%",
                      height: "300px",
                      objectFit: "cover",
                    }}
                  />
                </Link>
                <div className="p-5">
                  <Link href={`/blog/${post.slug.current}`}>
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {truncateText(post.title, MAX_TITLE_LENGTH)}
                    </h5>
                  </Link>
                  <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                    {truncateText(post.overview, MAX_OVERVIEW_LENGTH)}
                  </p>
                  <div className="mb-3 mt-3 flex items-center">
                    <div className="mr-5 flex items-center border-r border-body-color border-opacity-10 pr-5 dark:border-white dark:border-opacity-10 xl:mr-3 xl:pr-3 2xl:mr-5 2xl:pr-5">
                      <div className="mr-4">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full">
                          <Image src="" alt="author" fill />
                        </div>
                      </div>
                      <div className="w-full">
                        <h4 className="mb-1 text-sm font-medium text-dark dark:text-white">
                          By author.name
                        </h4>
                        <p className="text-xs text-body-color">
                          author.designation
                        </p>
                      </div>
                    </div>
                    <div className="inline-block">
                      <h4 className="mb-1 text-sm font-medium text-dark dark:text-white">
                        Date
                      </h4>
                      <p className="text-xs text-body-color">publishDate</p>
                    </div>
                  </div>
                  <Link
                    href={`/blog/${post.slug.current}`}
                    className="inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Read more
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
                  </Link>
                </div>
              </div>
            </div>
          ))}
         
        </div>
        <div className="mt-6 flex justify-center md:justify-center">
            <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
              Read more
            </button>
          </div>
      </div>
    </section>
  );
};

export default page;
