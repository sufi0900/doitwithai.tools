/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { useTheme } from "next-themes";

const NewsletterForm: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="wow fadeInUp relative z-10 rounded-xl bg-white p-8 shadow-three hover:shadow-lg transition-all duration-500 dark:bg-gray-dark sm:p-11 lg:p-8 xl:p-11 border border-transparent hover:border-primary/20 dark:hover:border-primary/30" data-wow-delay=".2s">
      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 dark:from-primary/10 dark:via-transparent dark:to-primary/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Content Container */}
      <div className="relative z-10">
        {/* Header Section with Icon */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="mb-4 text-2xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-gray-300 sm:text-3xl">
            Join Our Newsletter
          </h2>
          <p className="text-base font-medium text-body-color leading-relaxed">
            Stay ahead in the AI revolution! Get expert tips, tools, and resources delivered straight to your inbox.
          </p>
        </div>

        {/* Form */}
        <form
          action="https://ai-tools.us8.list-manage.com/subscribe/post?u=6b2d40e38465550ee4d7c03c1&amp;id=2fc05451cc&amp;f_id=003228e3f0"
          method="post"
          id="mc-embedded-subscribe-form"
          name="mc-embedded-subscribe-form"
          target="_blank"
          className="space-y-6"
        >
          {/* Email Address */}
          <div className="group">
            <label htmlFor="mce-EMAIL" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-primary transition-colors duration-200">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="EMAIL"
                id="mce-EMAIL"
                required
                className="w-full px-6 py-4 text-base text-body-color rounded-xl border-2 border-stroke bg-[#f8f8f8] outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:ring-primary/30 transition-all duration-300 hover:border-primary/50 dark:hover:border-primary/50"
                placeholder="Enter your email address (e.g., johndoe@example.com)"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* First Name */}
          <div className="group">
            <label htmlFor="mce-FNAME" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-primary transition-colors duration-200">
              First Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="FNAME"
                id="mce-FNAME"
                className="w-full px-6 py-4 text-base text-body-color rounded-xl border-2 border-stroke bg-[#f8f8f8] outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:ring-primary/30 transition-all duration-300 hover:border-primary/50 dark:hover:border-primary/50"
                placeholder="Enter your first name"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Hidden Bot Field */}
          <div className="hidden">
            <input
              type="text"
              name="b_6b2d40e38465550ee4d7c03c1_2fc05451cc"
              tabIndex={-1}
              defaultValue=""
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              name="subscribe"
              id="mc-embedded-subscribe"
              className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/90 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-primary/90 hover:to-primary hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary/30 active:scale-95"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Subscribe Now
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-stroke/30 dark:border-stroke/20">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-body-color dark:text-body-color-dark">
              No spam guaranteed, So please don't send any spam mail.
            </p>
          </div>
          <div className="text-center">
            <a
              href="http://eepurl.com/i6dXG6"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors duration-200 dark:text-gray-400 dark:hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 3.463-2.207 4.791-1.323 1.334-2.961 2.002-4.928 2.002-1.775 0-3.345-.476-4.71-1.426-.131-.091-.194-.24-.157-.39.036-.149.138-.267.267-.31.129-.043.267-.011.36.084 1.147.958 2.328 1.335 3.544 1.335 1.616 0 3.022-.595 4.218-1.785 1.205-1.199 1.807-2.562 1.807-4.09 0-1.341-.476-2.513-1.427-3.517-.95-1.004-2.104-1.506-3.462-1.506-1.555 0-2.87.674-3.947 2.022l1.053 1.053c.095.095.095.249 0 .344-.047.047-.11.071-.172.071s-.125-.024-.172-.071L5.636 6.221c-.095-.095-.095-.249 0-.344l2.828-2.828c.095-.095.249-.095.344 0s.095.249 0 .344l-1.2 1.2C8.616 3.726 10.181 3 11.912 3c1.653 0 3.104.65 4.354 1.951C17.514 6.253 18.14 7.853 17.568 8.16z"/>
              </svg>
              Powered by Mailchimp
            </a>
          </div>
        </div>
      </div>

      {/* Enhanced Background Decorations */}
      <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
        <span className="absolute left-2 top-7 animate-pulse">
          <svg
            width="57"
            height="65"
            viewBox="0 0 57 65"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.3"
              d="M0.407629 15.9573L39.1541 64.0714L56.4489 0.160793L0.407629 15.9573Z"
              fill="url(#paint0_linear_1028_600)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_1028_600"
                x1="-18.3187"
                y1="55.1044"
                x2="37.161"
                y2="15.3509"
                gradientUnits="userSpaceOnUse"
              >
                <stop
                  stopColor={theme === "light" ? "#4A6CF7" : "#fff"}
                  stopOpacity="0.4"
                />
                <stop
                  offset="1"
                  stopColor={theme === "light" ? "#4A6CF7" : "#fff"}
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
          </svg>
        </span>

        <span className="absolute bottom-24 left-1.5 animate-bounce" style={{ animationDelay: '0.5s' }}>
          <svg
            width="39"
            height="32"
            viewBox="0 0 39 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.3"
              d="M14.7137 31.4215L38.6431 4.24115L6.96581e-07 0.624124L14.7137 31.4215Z"
              fill="url(#paint0_linear_1028_601)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_1028_601"
                x1="39.1948"
                y1="38.335"
                x2="10.6982"
                y2="10.2511"
                gradientUnits="userSpaceOnUse"
              >
                <stop
                  stopColor={theme === "light" ? "#4A6CF7" : "#fff"}
                  stopOpacity="0.4"
                />
                <stop
                  offset="1"
                  stopColor={theme === "light" ? "#4A6CF7" : "#fff"}
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
          </svg>
        </span>

        <span className="absolute right-2 top-[140px] animate-spin" style={{ animationDuration: '20s' }}>
          <svg
            width="38"
            height="38"
            viewBox="0 0 38 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.2"
              d="M10.6763 35.3091C23.3976 41.6367 38.1681 31.7045 37.107 17.536C36.1205 4.3628 21.9407 -3.46901 10.2651 2.71063C-2.92254 9.69061 -2.68321 28.664 10.6763 35.3091Z"
              fill="url(#paint0_linear_1028_602)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_1028_602"
                x1="-0.571054"
                y1="-37.1717"
                x2="28.7937"
                y2="26.7564"
                gradientUnits="userSpaceOnUse"
              >
                <stop
                  stopColor={theme === "light" ? "#4A6CF7" : "#fff"}
                  stopOpacity="0.3"
                />
                <stop
                  offset="1"
                  stopColor={theme === "light" ? "#4A6CF7" : "#fff"}
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
          </svg>
        </span>

        <span className="absolute right-0 top-0 opacity-40">
          <svg
            width="162"
            height="91"
            viewBox="0 0 162 91"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.2">
              <path
                opacity="0.45"
                d="M1 89.9999C8 77.3332 27.7 50.7999 50.5 45.9999C79 39.9999 95 41.9999 106 30.4999C117 18.9999 126 -3.50014 149 -3.50014C172 -3.50014 187 4.99986 200.5 -8.50014C214 -22.0001 210.5 -46.0001 244 -37.5001C270.8 -30.7001 307.167 -45 322 -53"
                stroke="url(#paint0_linear_1028_603)"
              />
              <path
                opacity="0.45"
                d="M43 64.9999C50 52.3332 69.7 25.7999 92.5 20.9999C121 14.9999 137 16.9999 148 5.49986C159 -6.00014 168 -28.5001 191 -28.5001C214 -28.5001 229 -20.0001 242.5 -33.5001C256 -47.0001 252.5 -71.0001 286 -62.5001C312.8 -55.7001 349.167 -70 364 -78"
                stroke="url(#paint1_linear_1028_603)"
              />
              <path
                opacity="0.45"
                d="M4 73.9999C11 61.3332 30.7 34.7999 53.5 29.9999C82 23.9999 98 25.9999 109 14.4999C120 2.99986 129 -19.5001 152 -19.5001C175 -19.5001 190 -11.0001 203.5 -24.5001C217 -38.0001 213.5 -62.0001 247 -53.5001C273.8 -46.7001 310.167 -61 325 -69"
                stroke="url(#paint2_linear_1028_603)"
              />
              <path
                opacity="0.45"
                d="M41 40.9999C48 28.3332 67.7 1.79986 90.5 -3.00014C119 -9.00014 135 -7.00014 146 -18.5001C157 -30.0001 166 -52.5001 189 -52.5001C212 -52.5001 227 -44.0001 240.5 -57.5001C254 -71.0001 250.5 -95.0001 284 -86.5001C310.8 -79.7001 347.167 -94 362 -102"
                stroke="url(#paint3_linear_1028_603)"
              />
            </g>
            <defs>
              <linearGradient
                id="paint0_linear_1028_603"
                x1="291.35"
                y1="12.1032"
                x2="179.211"
                y2="237.617"
                gradientUnits="userSpaceOnUse"
              >
                <stop
                  offset="0.328125"
                  stopColor={theme === "light" ? "#4A6CF7" : "#fff"}
                />
                <stop
                  offset="1"
                  stopColor={theme === "light" ? "#4A6CF7" : "#fff"}
                  stopOpacity="0"
                />
              </linearGradient>
              <linearGradient
                id="paint1_linear_1028_603"
                x1="333.35"
                y1="-12.8968"
                x2="221.211"
                y2="212.617"
                gradientUnits="userSpaceOnUse"
              >
                <stop
                  offset="0.328125"
                  stopColor={theme === "light" ? "#4A6CF7" : "#fff"}
                />
                <stop
                  offset="1"
                  stopColor={theme === "light" ? "#4A6CF7" : "#fff"}
                  stopOpacity="0"
                />
              </linearGradient>
              <linearGradient
                id="paint2_linear_1028_603"
                x1="294.35"
                y1="-3.89678"
                x2="182.211"
                y2="221.617"
                gradientUnits="userSpaceOnUse"
              >
                <stop
                  offset="0.328125"
                  stopColor={theme === "light" ? "#4A6CF7" : "#fff"}
                />
                <stop
                  offset="1"
                  stopColor={theme === "light" ? "#4A6CF7" : "#fff"}
                  stopOpacity="0"
                />
              </linearGradient>
              <linearGradient
                id="paint3_linear_1028_603"
                x1="331.35"
                y1="-36.8968"
                x2="219.211"
                y2="188.617"
                gradientUnits="userSpaceOnUse"
              >
                <stop
                  offset="0.328125"
                  stopColor={theme === "light" ? "#4A6CF7" : "#fff"}
                />
                <stop
                  offset="1"
                  stopColor={theme === "light" ? "#4A6CF7" : "#fff"}
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
          </svg>
        </span>
      </div>
    </div>
  );
};

export default NewsletterForm;