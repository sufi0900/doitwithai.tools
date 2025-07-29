"use client";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, ExternalLink, Users, MessageCircle } from "lucide-react";

// Professional Trustpilot Rating Component
const TrustpilotInvite = () => {
  return (
    <div className="bg-gradient-to-r from-[#2563eb]/5 to-purple-500/5 dark:from-[#2563eb]/10 dark:to-purple-500/10
                    rounded-xl p-6 md:p-8 border border-[#2563eb]/20 dark:border-[#2563eb]/30
                    backdrop-blur-sm mb-8 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Header with star rating */}
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-5 h-5 text-[#00b67a] fill-current"
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            on Trustpilot
          </span>
        </div>

        {/* Main message */}
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Love our AI resources?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
            Help others discover quality AI content by sharing your experience.
            Your feedback helps us improve and grow our community.
          </p>
        </div>

        {/* CTA Button */}
        <Link
          href="https://www.trustpilot.com/review/doitwithai.tools"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-[#2563eb] hover:bg-[#1d4ed8]
                   text-white font-medium rounded-lg shadow-md hover:shadow-lg
                   transform hover:scale-105 transition-all duration-300 group"
        >
          <MessageCircle className="w-4 h-4 mr-2 group-hover:animate-pulse" />
          Share Your Experience
          <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>Join 1000+ reviewers</span>
          </div>
          <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></div> {/* Hide dot on small screens */}
          <div className="flex items-center space-x-1">
            <Heart className="w-3 h-3 text-red-500" />
            <span>Takes 2 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <>
      <footer
        className="relative z-10 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 
                   pt-16 md:pt-20 lg:pt-24 overflow-hidden"
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

        <div className="container relative z-10">
          <div className="-mx-4 flex flex-wrap">
            {/* Brand Section */} 
           <div className="w-full px-4 md:w-1/2 lg:w-4/12 xl:w-5/12">
              <div className="mb-12 lg:mb-16 flex items-start space-x-6">
                <Link href="/" className="mb-[-50px] inline-block group">
                  <Image
                    src="/26.png"
                    alt="DoItWithAI.tools Logo"
                    className="w-full dark:hidden transform group-hover:scale-105 transition-transform duration-300"
                    width={190}
                    height={190}
                  />
                  <Image
                    src="/26.png"
                    alt="DoItWithAI.tools Logo"
                    className="hidden w-full dark:block transform group-hover:scale-105 transition-transform duration-300"
                    width={190}
                    height={190}
                  />
                </Link>
                <div>
                <p className="dark:text-gray-300 mb-6 text-base leading-relaxed text-gray-600">
                  Learn how to leverage AI for SEO, productivity, and earning potential. 
                  Discover practical tips, tools, and strategies to enhance your digital journey with AI.
                </p>
                <p className="dark:text-gray-300 mb-9 text-base leading-relaxed text-gray-600">
                  Learn & grow with AI at{" "}
                  <Link 
                    className="font-medium text-[#2563eb] hover:text-[#1d4ed8] underline 
                             dark:text-blue-400 dark:hover:text-blue-300 hover:no-underline
                             transition-colors duration-300" 
                    href="https://www.doitwithai.tools/"
                  >
                    doitwithai.tools
                  </Link>
                </p>

                {/* Enhanced Social Links - TikTok and Pinterest added here */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Follow us:</span>
                  <div className="flex items-center space-x-3">
                    {[
                      { icon: "facebook", href: "/" },
                      { icon: "twitter", href: "/" },
                      { icon: "youtube", href: "/" },
                      { icon: "linkedin", href: "/" },
                      { icon: "tiktok", href: "https://www.tiktok.com/@yourprofile" }, // Added TikTok
                      { icon: "pinterest", href: "https://www.pinterest.com/yourprofile" } // Added Pinterest
                    ].map((social, index) => (
                      <Link
                        key={social.icon}
                        href={social.href}
                        aria-label={`${social.icon} social link`}
                        className="flex items-center justify-center w-10 h-10 rounded-lg
                                 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300
                                 hover:bg-[#2563eb] hover:text-white dark:hover:bg-[#2563eb]
                                 transform hover:scale-110 transition-all duration-300 group"
                      >
                        {social.icon === "facebook" && (
                          <svg width="18" height="18" viewBox="0 0 9 18" className="fill-current">
                            <path d="M8.10043 7H6.78036H6.29605V6.43548V4.68548V4.12097H6.78036H7.79741C8.06378 4.12097 8.28172 3.89516 8.28172 3.55645V0.564516C8.28172 0.254032 8.088 0 7.79741 0H6.02968C4.10065 0 2.78479 1.58064 2.78479 3.92339V6.37903V6.94355H2.30048H0.65382C0.314802 6.94355 0 7.25403 0 7.70564V9.7379C0 10.1331 0.266371 10.5 0.65382 10.5H2.25205H2.73636V11.0645V16.7379C2.73636 17.1331 3.00273 17.5 3.39018 17.5H5.66644C5.81174 17.5 5.93281 17.4153 6.02968 17.3024C6.12654 17.1895 6.19919 16.9919 6.19919 16.8226V11.0927V10.5282H6.70771H7.79741C8.11222 10.5282 8.35437 10.3024 8.4028 9.96371V9.93548V9.90726L8.74182 7.95968C8.76604 7.7621 8.74182 7.53629 8.59653 7.31048C8.54809 7.16935 8.33016 7.02823 8.10043 7Z" />
                          </svg>
                        )}
                        {social.icon === "twitter" && (
                          <svg width="18" height="14" viewBox="0 0 19 14" className="fill-current">
                            <path d="M16.3024 2.26027L17.375 1.0274C17.6855 0.693493 17.7702 0.436644 17.7984 0.308219C16.9516 0.770548 16.1613 0.924658 15.6532 0.924658H15.4556L15.3427 0.821918C14.6653 0.282534 13.8185 0 12.9153 0C10.9395 0 9.3871 1.48973 9.3871 3.21062C9.3871 3.31336 9.3871 3.46747 9.41532 3.57021L9.5 4.0839L8.90726 4.05822C5.29435 3.95548 2.33065 1.13014 1.85081 0.642123C1.06048 1.92637 1.5121 3.15925 1.99194 3.92979L2.95161 5.36815L1.42742 4.5976C1.45565 5.67637 1.90726 6.52397 2.78226 7.14041L3.54435 7.65411L2.78226 7.93665C3.2621 9.24658 4.33468 9.78596 5.125 9.99144L6.16935 10.2483L5.18145 10.8647C3.60081 11.8921 1.625 11.8151 0.75 11.738C2.52823 12.8682 4.64516 13.125 6.1129 13.125C7.21371 13.125 8.03226 13.0223 8.22984 12.9452C16.1331 11.25 16.5 4.82877 16.5 3.54452V3.36473L16.6694 3.26199C17.629 2.44007 18.0242 2.00342 18.25 1.74658C18.1653 1.77226 18.0524 1.82363 17.9395 1.84932L16.3024 2.26027Z" />
                          </svg>
                        )}
                        {social.icon === "youtube" && (
                          <svg width="18" height="14" viewBox="0 0 18 14" className="fill-current">
                            <path d="M17.5058 2.07119C17.3068 1.2488 16.7099 0.609173 15.9423 0.395963C14.5778 7.26191e-08 9.0627 0 9.0627 0C9.0627 0 3.54766 7.26191e-08 2.18311 0.395963C1.41555 0.609173 0.818561 1.2488 0.619565 2.07119C0.25 3.56366 0.25 6.60953 0.25 6.60953C0.25 6.60953 0.25 9.68585 0.619565 11.1479C0.818561 11.9703 1.41555 12.6099 2.18311 12.8231C3.54766 13.2191 9.0627 13.2191 9.0627 13.2191C9.0627 13.2191 14.5778 13.2191 15.9423 12.8231C16.7099 12.6099 17.3068 11.9703 17.5058 11.1479C17.8754 9.68585 17.8754 6.60953 17.8754 6.60953C17.8754 6.60953 17.8754 3.56366 17.5058 2.07119ZM7.30016 9.44218V3.77687L11.8771 6.60953L7.30016 9.44218Z" />
                          </svg>
                        )}
                        {social.icon === "linkedin" && (
                          <svg width="16" height="16" viewBox="0 0 17 16" className="fill-current">
                            <path d="M15.2196 0H1.99991C1.37516 0 0.875366 0.497491 0.875366 1.11936V14.3029C0.875366 14.8999 1.37516 15.4222 1.99991 15.4222H15.1696C15.7943 15.4222 16.2941 14.9247 16.2941 14.3029V1.09448C16.3441 0.497491 15.8443 0 15.2196 0ZM5.44852 13.1089H3.17444V5.7709H5.44852V13.1089ZM4.29899 4.75104C3.54929 4.75104 2.97452 4.15405 2.97452 3.43269C2.97452 2.71133 3.57428 2.11434 4.29899 2.11434C5.02369 2.11434 5.62345 2.71133 5.62345 3.43269C5.62345 4.15405 5.07367 4.75104 4.29899 4.75104ZM14.07 13.1089H11.796V9.55183C11.796 8.7061 11.771 7.58674 10.5964 7.58674C9.39693 7.58674 9.222 8.53198 9.222 9.47721V13.1089H6.94792V5.7709H9.17202V6.79076H9.19701C9.52188 6.19377 10.2466 5.59678 11.3711 5.59678C13.6952 5.59678 14.12 7.08925 14.12 9.12897V13.1089H14.07Z" />
                          </svg>
                        )}
                        {social.icon === "tiktok" && (
                          <svg width="18" height="18" viewBox="0 0 24 24" className="fill-current">
                            <path d="M12.067 1.011A9.761 9.761 0 001.218 10.706v2.19C1.218 18.258 5.672 23 12.067 23c6.395 0 10.85-4.742 10.85-10.101v-2.19c0-5.359-4.455-9.801-10.85-9.801zM10.975 18.995c-3.133 0-5.748-1.782-5.748-4.103 0-2.322 2.615-4.103 5.748-4.103s5.748 1.782 5.748 4.103c0 2.321-2.615 4.103-5.748 4.103zM10.975 7.42c-3.133 0-5.748-1.782-5.748-4.103 0-2.322 2.615-4.103 5.748-4.103s5.748 1.782 5.748 4.103c0 2.321-2.615 4.103-5.748 4.103zM10.975 2.912c-1.397 0-2.534-.794-2.534-1.782S9.578-.652 10.975-.652s2.534.794 2.534 1.782-1.137 1.782-2.534 1.782zM10.975 14.482c-1.397 0-2.534-.794-2.534-1.782s1.137-1.782 2.534-1.782 2.534.794 2.534 1.782-1.137 1.782-2.534 1.782zM10.975 1.011" />
                          </svg>
                        )}
                        {social.icon === "pinterest" && (
                          <svg width="18" height="18" viewBox="0 0 24 24" className="fill-current">
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 5.093 3.102 9.456 7.5 11.234l.75-.001c.414-.001.75-.337.75-.75s-.336-.75-.75-.75c-3.559-1.638-6-5.188-6-9.734 0-4.694 3.806-8.5 8.5-8.5S20.5 7.306 20.5 12c0 3.32-1.905 6.185-4.654 7.643-.298.158-.456.495-.456.812v3.13c0 .414.336.75.75.75s.75-.336.75-.75v-2.887C19.782 17.513 22 14.93 22 12c0-6.627-5.373-12-12-12zM12 21.5c-3.69 0-6.75-2.91-6.75-6.5S8.31 8.5 12 8.5s6.75 2.91 6.75 6.5-3.06 6.5-6.75 6.5z"/>
                          </svg>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
</div>
            {/* Navigation Links */}
            <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12">
              <div className="mb-12 lg:mb-16">
                <h2 className="mb-6 text-lg font-bold text-gray-800 dark:text-white 
                             border-b-2 border-[#2563eb]/20 pb-2 inline-block">
                  Useful Links
                </h2>
                <ul className="space-y-3">
                  {[
                    { href: "/blogs", text: "Blog" },
                    { href: "/author/sufian-mustafa", text: "About Author" },
                    { href: "/categories", text: "Categories" },
                    { href: "/free-ai-resources", text: "Free Resources" }
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-gray-600 dark:text-gray-300 hover:text-[#2563eb] 
                                 dark:hover:text-blue-400 transition-colors duration-300 
                                 text-sm flex items-center group"
                      >
                        <span className="w-2 h-2 bg-[#2563eb]/30 rounded-full mr-3 
                                       group-hover:bg-[#2563eb] transition-colors duration-300"></span>
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Terms */}
            <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12">
              <div className="mb-12 lg:mb-16">
                <h2 className="mb-6 text-lg font-bold text-gray-800 dark:text-white
                             border-b-2 border-[#2563eb]/20 pb-2 inline-block">
                  Legal
                </h2>
                <ul className="space-y-3">
                  {[
                    { href: "/terms-and-conditions", text: "Terms of Service" },
                    { href: "/privacy", text: "Privacy Policy" },
                    { href: "/privacy", text: "Refund Policy" }
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-gray-600 dark:text-gray-300 hover:text-[#2563eb] 
                                 dark:hover:text-blue-400 transition-colors duration-300 
                                 text-sm flex items-center group"
                      >
                        <span className="w-2 h-2 bg-[#2563eb]/30 rounded-full mr-3 
                                       group-hover:bg-[#2563eb] transition-colors duration-300"></span>
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Support & Trustpilot */}
            <div className="w-full px-4 md:w-1/2 lg:w-4/12 xl:w-3/12">
              <div className="mb-12 lg:mb-16">
                <h2 className="mb-6 text-lg font-bold text-gray-800 dark:text-white
                             border-b-2 border-[#2563eb]/20 pb-2 inline-block">
                  Support & Help
                </h2>
                <ul className="space-y-3 mb-8">
                  {[
                    { href: "/contact", text: "Open Support Ticket" },
                    { href: "/terms-and-conditions", text: "Terms of Use" },
                    { href: "/about", text: "About Us" }
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-gray-600 dark:text-gray-300 hover:text-[#2563eb] 
                                 dark:hover:text-blue-400 transition-colors duration-300 
                                 text-sm flex items-center group"
                      >
                        <span className="w-2 h-2 bg-[#2563eb]/30 rounded-full mr-3 
                                       group-hover:bg-[#2563eb] transition-colors duration-300"></span>
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Trustpilot Component */}
                {/* <TrustpilotInvite /> */}
              </div>
            </div>
          </div>
 <div className="px-4 mt-8 lg:mt-12"> {/* Added responsive padding and top margin */}
            <TrustpilotInvite />
          </div>
          {/* Enhanced Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#2563eb]/30 to-transparent 
                         dark:via-[#2563eb]/20 my-8"></div>
          
          {/* Footer Bottom */}
          <div className="py-8">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                © {new Date().getFullYear()} DoItWithAI.tools. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
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
              <div className="flex justify-center items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Secure & Trusted</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <Heart className="w-3 h-3 text-red-500" />
                  <span>Made with AI</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <Users className="w-3 h-3 text-[#2563eb]" />
                  <span>1000+ Happy Users</span>
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