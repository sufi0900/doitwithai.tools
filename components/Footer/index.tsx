"use client";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, Users } from "lucide-react";

// Simple and Compact Trustpilot Rating Component
const TrustpilotInvite = () => {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Trustpilot Card */}
      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-700/15 dark:to-indigo-700/15 border border-blue-500/20 dark:border-blue-700/30 rounded-xl shadow-sm hover:shadow-md backdrop-blur-sm transition-all duration-300 px-4 py-4 sm:px-6 sm:py-5 md:px-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center sm:text-left">
        {/* Rating Section */}
        <Link
          href="https://www.trustpilot.com/review/doitwithai.tools"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 flex-shrink-0"
        >
          {/* Trustpilot Logo Text */}
          <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            Trustpilot
          </div>

          {/* Green Rating Box with White Stars */}
          <div className="bg-[#00b67a] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded flex items-center gap-0.5 sm:gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-3 h-3 sm:w-4 sm:h-4 text-white fill-white"
              />
            ))}
          </div>
        </Link>
        
        {/* Divider */}
        <div className="hidden sm:block w-px h-4 sm:h-5 bg-gray-300 dark:bg-gray-600 flex-shrink-0" />

        {/* Message to invite reviews */}
        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          Love our content?{" "}
          <Link
            href="https://www.trustpilot.com/review/doitwithai.tools"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#00b67a] hover:underline"
          >
            Write a review on Trustpilot
          </Link>
          . <br className="hidden sm:inline" />
          It only takes a minute!
        </p>
      </div>

      {/* Connected Small Note */}
      <p className="mt-2 sm:mt-3 text-xs text-center text-gray-500 dark:text-gray-400 px-4">
        Your honest feedback helps us improve and grow our AI community.
      </p>
    </div>
  );
};

const Footer = () => {
  return (
    <>
      <footer
        className="relative z-10 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800
                   overflow-hidden 
                   pt-8 sm:pt-12 md:pt-16 lg:pt-20 xl:pt-24"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
                                 radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`,
            }}
          ></div>
        </div>

        <div className="container relative z-10 px-4">
          <div className="flex flex-wrap -mx-2 sm:-mx-3 md:-mx-4">
            {/* Brand Section - Fixed responsive layout */}
            <div className="w-full px-2 sm:px-3 md:px-4 lg:w-5/12 xl:w-5/12">
              <div className="mb-8 sm:mb-10 lg:mb-12">
                {/* Logo and Content Container */}
                <div className="flex flex-col items-center space-y-4 sm:space-y-5 lg:flex-row lg:items-start lg:space-y-0 lg:space-x-4 xl:space-x-6">
                  {/* Logo */}
                  <Link href="/" className="inline-block group flex-shrink-0">
                    <Image
                      src="/logoForHeader.png"
                      alt="DoItWithAI.tools Logo"
                      className="transform group-hover:scale-105 transition-transform duration-300
                                 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-20 lg:h-20 xl:w-24 xl:h-24"
                      width={96}
                      height={96}
                      sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 80px"
                    />
                  </Link>

                  {/* Content */}
                  <div className="text-center lg:text-left flex-1 max-w-md lg:max-w-none">
                    <p className="dark:text-gray-300 mb-3 sm:mb-4 lg:mb-5 text-sm sm:text-base leading-relaxed text-gray-600">
                      Learn how to leverage AI for SEO, productivity, and earning potential.
                      Discover practical tips, tools, and strategies to enhance your digital journey with AI.
                    </p>
                    <p className="dark:text-gray-300 mb-4 sm:mb-5 lg:mb-6 text-sm sm:text-base leading-relaxed text-gray-600">
                      Learn & grow with AI at{" "}
                      <Link
                        className="font-medium text-[#2563eb] hover:text-[#1d4ed8] underline
                                   dark:text-blue-400 dark:hover:text-blue-300 hover:no-underline
                                   transition-colors duration-300 break-words"
                        href="https://www.doitwithai.tools/"
                      >
                        doitwithai.tools
                      </Link>
                    </p>

                    {/* Social Links - Fixed alignment */}
                    <div className="flex flex-col items-center space-y-3 sm:space-y-4 lg:items-start">
                      {/* Follow Us Label - Fixed positioning */}
                      <div className="text-center lg:text-left">
                        <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wide leading-tight relative group inline-block">
                          Follow Us:
                          {/* Underline effect on hover */}
                          <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-[#2563eb] group-hover:w-full transition-all duration-300"></span>
                        </span>
                      </div>
                     
                      {/* Social Icons - Fixed grid layout */}
                     <div className="w-full max-w-xs sm:max-w-sm lg:max-w-none">
                      {/*
                         BEFORE: grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6
                         PROBLEM: On small devices, this forces a column wrap, creating bad vertical spacing.
                         SOLUTION: Use flexbox with small gaps for mobile and sm devices, then revert to grid for larger screens.
                      */}
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:grid lg:grid-cols-3 xl:grid-cols-6 lg:gap-2 xl:gap-3">
                         {[
    
                            { icon: "facebook", href: "https://www.facebook.com/profile.php?id=61579751720695&mibextid=ZbWKwL" },
                            { icon: "x", href: "https://x.com/doitwithaitools" },
                            { icon: "youtube", href: "https://www.youtube.com/@doitwithaitools" },
                            { icon: "linkedin", href: "https://www.linkedin.com/company/do-it-with-ai-tools" },
                            { icon: "tiktok", href: "https://www.tiktok.com/@doitwithai.tools" },
                            { icon: "pinterest", href: "https://www.pinterest.com/doitwithai/" }
                          ].map((social) => (
                            <Link
                              key={social.icon}
                              href={social.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${social.icon} social link`}
                              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-8 lg:h-8 xl:w-10 xl:h-10 rounded-lg
                                         bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300
                                         hover:bg-[#2563eb] hover:text-white dark:hover:bg-[#2563eb]
                                         transform hover:scale-110 transition-all duration-300 group"
                            >
                              {/* SVG Icons */}
                              {social.icon === "facebook" && (
                                <svg width="16" height="16" viewBox="0 0 9 18" className="fill-current">
                                  <path d="M8.10043 7H6.78036H6.29605V6.43548V4.68548V4.12097H6.78036H7.79741C8.06378 4.12097 8.28172 3.89516 8.28172 3.55645V0.564516C8.28172 0.254032 8.088 0 7.79741 0H6.02968C4.10065 0 2.78479 1.58064 2.78479 3.92339V6.37903V6.94355H2.30048H0.65382C0.314802 6.94355 0 7.25403 0 7.70564V9.7379C0 10.1331 0.266371 10.5 0.65382 10.5H2.25205H2.73636V11.0645V16.7379C2.73636 17.1331 3.00273 17.5 3.39018 17.5H5.66644C5.81174 17.5 5.93281 17.4153 6.02968 17.3024C6.12654 17.1895 6.19919 16.9919 6.19919 16.8226V11.0927V10.5282H6.70771H7.79741C8.11222 10.5282 8.35437 10.3024 8.4028 9.96371V9.93548V9.90726L8.74182 7.95968C8.76604 7.7621 8.74182 7.53629 8.59653 7.31048C8.54809 7.16935 8.33016 7.02823 8.10043 7Z" />
                                </svg>
                              )}
                              {social.icon === "x" && (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 1200 1227"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="fill-current"
                                >
                                  <path d="M714.163 519.284L1160.89 0H1050.25L668.898 441.35L356.51 0H0L468.906 681.821L0 1226.55H110.636L512.154 762.19L843.49 1226.55H1200L714.163 519.284ZM562.82 699.363L518.069 636.986L150.797 79.4655H304.046L600.102 504.272L644.853 566.649L1026.71 1147.98H873.459L562.82 699.363Z"/>
                                </svg>
                              )}
                              {social.icon === "youtube" && (
                                <svg width="16" height="12" viewBox="0 0 18 14" className="fill-current">
                                  <path d="M17.5058 2.07119C17.3068 1.2488 16.7099 0.609173 15.9423 0.395963C14.5778 7.26191e-08 9.0627 0 9.0627 0C9.0627 0 3.54766 7.26191e-08 2.18311 0.395963C1.41555 0.609173 0.818561 1.2488 0.619565 2.07119C0.25 3.56366 0.25 6.60953 0.25 6.60953C0.25 6.60953 0.25 9.68585 0.619565 11.1479C0.818561 11.9703 1.41555 12.6099 2.18311 12.8231C3.54766 13.2191 9.0627 13.2191 9.0627 13.2191C9.0627 13.2191 14.5778 13.2191 15.9423 12.8231C16.7099 12.6099 17.3068 11.9703 17.5058 11.1479C17.8754 9.68585 17.8754 6.60953 17.8754 6.60953C17.8754 6.60953 17.8754 3.56366 17.5058 2.07119ZM7.30016 9.44218V3.77687L11.8771 6.60953L7.30016 9.44218Z" />
                                </svg>
                              )}
                              {social.icon === "linkedin" && (
                                <svg width="14" height="14" viewBox="0 0 17 16" className="fill-current">
                                  <path d="M15.2196 0H1.99991C1.37516 0 0.875366 0.497491 0.875366 1.11936V14.3029C0.875366 14.8999 1.37516 15.4222 1.99991 15.4222H15.1696C15.7943 15.4222 16.2941 14.9247 16.2941 14.3029V1.09448C16.3441 0.497491 15.8443 0 15.2196 0ZM5.44852 13.1089H3.17444V5.7709H5.44852V13.1089ZM4.29899 4.75104C3.54929 4.75104 2.97452 4.15405 2.97452 3.43269C2.97452 2.71133 3.57428 2.11434 4.29899 2.11434C5.02369 2.11434 5.62345 2.71133 5.62345 3.43269C5.62345 4.15405 5.07367 4.75104 4.29899 4.75104ZM14.07 13.1089H11.796V9.55183C11.796 8.7061 11.771 7.58674 10.5964 7.58674C9.39693 7.58674 9.222 8.53198 9.222 9.47721V13.1089H6.94792V5.7709H9.17202V6.79076H9.19701C9.52188 6.19377 10.2466 5.59678 11.3711 5.59678C13.6952 5.59678 14.12 7.08925 14.12 9.12897V13.1089H14.07Z" />
                                </svg>
                              )}
                              {social.icon === "tiktok" && (
                                <svg width="14" height="16" viewBox="0 0 24 24" className="fill-current">
                                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                                </svg>
                              )}
                              {social.icon === "pinterest" && (
                                <svg width="14" height="16" viewBox="0 0 24 24" className="fill-current">
                                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.749.097.118.112.219.083.402-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z.017 0z"/>
                                </svg>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="w-full px-2 sm:px-3 md:px-4 sm:w-1/2 lg:w-2/12 xl:w-2/12">
              <div className="mb-8 sm:mb-10 lg:mb-12 flex flex-col items-center sm:items-start">
                <h2 className="mb-4 sm:mb-5 lg:mb-6 text-base sm:text-lg font-bold text-gray-800 dark:text-white
                                 border-b-2 border-[#2563eb]/20 pb-2 inline-block">
                  Useful Links
                </h2>
                <ul className="space-y-2 sm:space-y-3 w-full">
                  {[
                    { href: "/blogs", text: "Blog" },
                    { href: "/author/sufian-mustafa", text: "About Author" },
                    { href: "/categories", text: "Categories" },
                    { href: "/free-ai-resources", text: "Free Resources" }
                  ].map((link) => (
                    <li key={link.href} className="text-center sm:text-left">
                      <Link
                        href={link.href}
                        className="text-gray-600 dark:text-gray-300 hover:text-[#2563eb]
                                   dark:hover:text-blue-400 transition-colors duration-300
                                   text-sm flex items-center justify-center sm:justify-start group"
                      >
                        <span className="w-2 h-2 bg-[#2563eb]/30 rounded-full mr-3
                                         group-hover:bg-[#2563eb] transition-colors duration-300 flex-shrink-0"></span>
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Legal */}
            <div className="w-full px-2 sm:px-3 md:px-4 sm:w-1/2 lg:w-2/12 xl:w-2/12">
              <div className="mb-8 sm:mb-10 lg:mb-12 flex flex-col items-center sm:items-start">
                <h2 className="mb-4 sm:mb-5 lg:mb-6 text-base sm:text-lg font-bold text-gray-800 dark:text-white
                                 border-b-2 border-[#2563eb]/20 pb-2 inline-block">
                  Legal
                </h2>
                <ul className="space-y-2 sm:space-y-3 w-full">
                  {[
                    { href: "/terms-and-conditions", text: "Terms of Service" },
                    { href: "/privacy", text: "Privacy Policy" },
                    { href: "/privacy", text: "Refund Policy" }
                  ].map((link) => (
                    <li key={link.href} className="text-center sm:text-left">
                      <Link
                        href={link.href}
                        className="text-gray-600 dark:text-gray-300 hover:text-[#2563eb]
                                   dark:hover:text-blue-400 transition-colors duration-300
                                   text-sm flex items-center justify-center sm:justify-start group"
                      >
                        <span className="w-2 h-2 bg-[#2563eb]/30 rounded-full mr-3
                                         group-hover:bg-[#2563eb] transition-colors duration-300 flex-shrink-0"></span>
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Support */}
            <div className="w-full px-2 sm:px-3 md:px-4 sm:w-full md:w-1/2 lg:w-3/12 xl:w-3/12">
              <div className="mb-8 sm:mb-10 lg:mb-12 flex flex-col items-center sm:items-start">
                <h2 className="mb-4 sm:mb-5 lg:mb-6 text-base sm:text-lg font-bold text-gray-800 dark:text-white
                                 border-b-2 border-[#2563eb]/20 pb-2 inline-block">
                  Support & Help
                </h2>
                <ul className="space-y-2 sm:space-y-3 w-full">
                  {[
                    { href: "/contact", text: "Open Support Ticket" },
                    { href: "/terms-and-conditions", text: "Terms of Use" },
                    { href: "/about", text: "About Us" }
                  ].map((link) => (
                    <li key={link.href} className="text-center sm:text-left">
                      <Link
                        href={link.href}
                        className="text-gray-600 dark:text-gray-300 hover:text-[#2563eb]
                                   dark:hover:text-blue-400 transition-colors duration-300
                                   text-sm flex items-center justify-center sm:justify-start group"
                      >
                        <span className="w-2 h-2 bg-[#2563eb]/30 rounded-full mr-3
                                         group-hover:bg-[#2563eb] transition-colors duration-300 flex-shrink-0"></span>
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="px-2 sm:px-3 md:px-4">
            <TrustpilotInvite />
          </div>

          {/* Enhanced Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#2563eb]/30 to-transparent
                          dark:via-[#2563eb]/20 my-6 sm:my-8 mx-2 sm:mx-3 md:mx-4"></div>

          {/* Footer Bottom */}
          <div className="pb-6 sm:pb-8 px-2 sm:px-3 md:px-4">
            <div className="text-center space-y-3 sm:space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                © {new Date().getFullYear()} DoItWithAI.tools. All rights reserved.
              </p>
              <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Template by{" "}
                <Link
                  className="font-medium text-[#2563eb] hover:text-[#1d4ed8] underline
                             dark:text-blue-400 dark:hover:text-blue-300 hover:no-underline
                             transition-colors duration-300"
                  href="https://nextjstemplates.com"
                  rel="nofollow noopener"
                >
                  Next.js Templates
                </Link>
                {" "} • Redesigned by{" "}
                <Link
                  className="font-medium text-[#2563eb] hover:text-[#1d4ed8] underline
                             dark:text-blue-400 dark:hover:text-blue-300 hover:no-underline
                             transition-colors duration-300"
                  href="https://sufianmustafa.com/"
                  rel="nofollow noopener"
                >
                  Sufian
                </Link>
              </p>

              {/* Trust badges */}
              <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row justify-center items-center sm:space-x-4 md:space-x-6 pt-2 sm:pt-4">
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                  <span>Secure & Trusted</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <Heart className="w-3 h-3 text-red-500 flex-shrink-0" />
                  <span>Made with AI</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <Users className="w-3 h-3 text-[#2563eb] flex-shrink-0" />
                  <span>Join a Growing Community</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </footer>
    </>
  );
};

export default Footer;