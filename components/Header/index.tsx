"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData"; // Assuming menuData is correctly defined
import Avatar from '@mui/material/Avatar';

const Header = () => {
  // Navbar toggle state and handler
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

  // Sticky Navbar state and handler
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleStickyNavbar);
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  // Submenu handler
  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };

  const usePathName = usePathname();

  return (
    <>
      <header
        className={`header left-0 top-0 z-40 flex w-full items-center transition-all duration-500 ease-in-out ${
          sticky
            ? "fixed z-[9999] bg-white/95 !bg-opacity-95 shadow-2xl backdrop-blur-xl border-b border-gray-200/50 dark:bg-gray-900/95 dark:shadow-2xl dark:border-gray-700/50"
            : "absolute bg-gradient-to-r from-white/80 via-white/60 to-white/80 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/80 backdrop-blur-sm"
        }`}
      >
        <div className="container">
          <div className="relative -mx-4 flex items-center justify-between">
            {/* Logo - Enhanced with hover effects */}
            <div className="w-30 mt-2 max-w-full px-4 xl:mr-12">
              <div className="relative group cursor-pointer">
                <Avatar
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  sx={{
                    width: 66,
                    height: 66,
                    background: "transparent",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  className="group-hover:scale-110 transition-all duration-300 ring-2 ring-transparent group-hover:ring-blue-500/40 group-hover:ring-offset-2 group-hover:ring-offset-white dark:group-hover:ring-offset-gray-900 shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/20"
                >
                  <Image
                    src="/logoForHeader.png"
                    alt="Logo"
                    width={500}
                    height={500}
                    className="w-full dark:hidden transition-all duration-300"
                  />
                  <Image
                    src="/logoForHeader.png"
                    alt="Logo"
                    width={500}
                    height={500}
                    className="hidden w-full dark:block transition-all duration-300"
                  />
                </Avatar>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#5271FF]/0 via-[#5271FF]/10 to-[#5271FF]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
            </div>

            {/* Navigation - Enhanced with modern styling */}
            <div className="hidden lg:flex lg:flex-1 lg:justify-center">
              <nav id="navbarCollapse" className="navbar">
                <ul className="flex justify-center space-x-2">
                  {menuData.map((menuItem, index) => (
                    <li key={index} className="group relative font-semibold">
                      {menuItem.path ? (
                        <Link
                          href={menuItem.path}
                          className={`
                            relative flex mt-6 mb-6 px-4 py-3 transition-all duration-300 ease-in-out items-center justify-center lg:mr-0 lg:inline-flex rounded-xl border border-transparent backdrop-blur-sm
                            ${usePathName === menuItem.path // If current path matches this menu item's path (ACTIVE)
                              ? "text-white bg-gradient-to-r from-[#5271FF] to-[#4361EE] shadow-lg shadow-[#5271FF]/30 transform scale-105"
                              : `text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-[#5271FF] hover:to-[#4361EE] ${
                                  menuItem.title === "SEO with AI" // If it's "SEO with AI" AND NOT active
                                    ? "bg-gradient-to-r from-[#5271FF]/10 to-[#4361EE]/10 border-[#5271FF]/20"
                                    : "hover:shadow-lg hover:shadow-[#5271FF]/20 transform hover:scale-105 hover:-translate-y-1"
                                }`
                            }
                          `}
                        >
                          {menuItem.title === "SEO with AI" && (
                            <>
                              {/* Stars with updated colors for active state in light mode */}
                              <span className={`absolute -top-1 -left-1 animate-ping-star ${usePathName === menuItem.path ? 'text-black  dark:text-white  drop-shadow-lg' : 'text-yellow-400'}`}>&#10022;</span>
                              <span className={`absolute -bottom-1 -right-1 animate-ping-star ${usePathName === menuItem.path ? ' text-yellow     dark:text-white  drop-shadow-lg' : 'text-blue-400'}`}>&#10022;</span>
                            </>
                          )}
                          <span className="relative z-10">{menuItem.title}</span>
                          {/* Animated underline */}
                          <div className="absolute bottom-1 left-1/2 w-0 h-0.5 bg-white group-hover:w-3/4 group-hover:left-1/8 transition-all duration-300 rounded-full"></div>
                        </Link>
                      ) : (
                        <>
                          <p
                            onClick={() => handleSubmenu(index)}
                            className="mt-6 px-4 py-3 flex cursor-pointer items-center justify-between text-base text-gray-700 group-hover:text-[#5271FF] dark:text-gray-300 dark:group-hover:text-[#5271FF] lg:inline-flex transition-all duration-300 ease-in-out rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:transform hover:scale-105"
                          >
                            <span className="relative z-10">{menuItem.title}</span>
                            <span className="pl-3 transform group-hover:rotate-180 transition-transform duration-300">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 25 24"
                                className="text-current"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </span>
                          </p>
                          <div
                            className={`submenu relative left-0 top-full rounded-xl bg-white/95 backdrop-blur-xl transition-all duration-300 border border-gray-200/50 shadow-xl group-hover:opacity-100 dark:bg-gray-900/95 dark:border-gray-700/50 lg:invisible lg:absolute lg:top-[110%] lg:block lg:w-[280px] lg:p-6 lg:opacity-0 lg:shadow-2xl lg:group-hover:visible lg:group-hover:top-full transform lg:group-hover:scale-100 lg:scale-95 ${
                              openIndex === index ? "block opacity-100 scale-100" : "hidden opacity-0 scale-95"
                            }`}
                          >
                            {menuItem.submenu.map((submenuItem, submenuIndex) => (
                              <Link
                                href={submenuItem.path}
                                key={submenuIndex}
                                className="block rounded-lg py-3 px-4 text-sm text-gray-700 hover:text-[#5271FF] hover:bg-gradient-to-r hover:from-[#5271FF]/5 hover:to-[#4361EE]/5 dark:text-gray-300 dark:hover:text-[#5271FF] lg:px-4 transition-all duration-200 ease-in-out transform hover:translate-x-2 hover:scale-105 border-l-2 border-transparent hover:border-[#5271FF]/50"
                              >
                                <span className="flex items-center">
                                  <span className="w-2 h-2 bg-gradient-to-r from-[#5271FF] to-[#4361EE] rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                                  {submenuItem.title}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Right side container - Enhanced */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggler with enhanced styling */}
              <div className="flex-1 lg:flex-none transform hover:scale-110 transition-transform duration-200">
                <ThemeToggler />
              </div>

              {/* Enhanced Mobile Menu Button */}
              <button
                onClick={navbarToggleHandler}
                id="navbarToggler"
                aria-label="Mobile Menu"
                className="block lg:hidden rounded-xl px-3 py-2 ring-[#5271FF]/50 focus:ring-2 transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800 transform hover:scale-110 group"
              >
                <div className="relative w-6 h-6 flex flex-col justify-center items-center">
                  <span
                    className={`absolute h-0.5 w-6 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ease-in-out ${
                      navbarOpen
                        ? "rotate-45 bg-[#5271FF]"
                        : "-translate-y-1.5 group-hover:bg-[#5271FF]"
                    }`}
                  />
                  <span
                    className={`absolute h-0.5 w-6 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ease-in-out ${
                      navbarOpen
                        ? "opacity-0"
                        : "opacity-100 group-hover:bg-[#5271FF]"
                    }`}
                  />
                  <span
                    className={`absolute h-0.5 w-6 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ease-in-out ${
                      navbarOpen
                        ? "-rotate-45 bg-[#5271FF]"
                        : "translate-y-1.5 group-hover:bg-[#5271FF]"
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Enhanced Mobile Navigation Menu */}
            <div
              className={`lg:hidden absolute right-0 top-full z-30 w-[280px] rounded-xl border border-gray-200/50 bg-white/95 backdrop-blur-xl px-6 py-6 duration-300 shadow-2xl dark:border-gray-700/50 dark:bg-gray-900/95 transform origin-top-right ${
                navbarOpen
                  ? "visible opacity-100 scale-100 translate-y-2"
                  : "invisible opacity-0 scale-95 -translate-y-2"
              }`}
            >
              <nav>
                <ul className="block space-y-2">
                  {menuData.map((menuItem, index) => (
                    <li key={index} className="group relative font-semibold">
                      {menuItem.path ? (
                        <Link
                          href={menuItem.path}
                          className={`
                            relative flex p-3 transition-all duration-300 ease-in-out items-center justify-center rounded-xl border border-transparent
                            ${usePathName === menuItem.path // If current path matches this menu item's path (ACTIVE)
                              ? "text-white bg-gradient-to-r from-[#5271FF] to-[#4361EE] shadow-lg shadow-[#5271FF]/30"
                              : `text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-[#5271FF] hover:to-[#4361EE] ${
                                  menuItem.title === "SEO with AI"
                                    ? "bg-gradient-to-r from-[#5271FF]/10 to-[#4361EE]/10 border-[#5271FF]/20"
                                    : "hover:shadow-lg hover:shadow-[#5271FF]/20 transform hover:scale-105"
                                }`
                            }
                          `}
                        >
                          {menuItem.title === "SEO with AI" && (
                            <>
                              {/* Stars with updated colors for active state in light mode */}
                                                         <>
                              {/* Stars with updated colors for active state in light mode */}
                              <span className={`absolute -top-1 -left-1 animate-ping-star ${usePathName === menuItem.path ? 'text-black  dark:text-white  drop-shadow-lg' : 'text-yellow-400'}`}>&#10022;</span>
                              <span className={`absolute -bottom-1 -right-1 animate-ping-star ${usePathName === menuItem.path ? ' text-yellow     dark:text-white  drop-shadow-lg' : 'text-blue-400'}`}>&#10022;</span>
                            </>
                            </>
                          )}
                          <span className="relative z-10">{menuItem.title}</span>
                        </Link>
                      ) : (
                        <>
                          <p
                            onClick={() => handleSubmenu(index)}
                            className="flex cursor-pointer items-center justify-between py-3 px-3 text-base text-gray-700 hover:text-[#5271FF] dark:text-gray-300 dark:hover:text-[#5271FF] rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 transform hover:scale-105"
                          >
                            <span>{menuItem.title}</span>
                            <span className={`pl-3 transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                              <svg width="20" height="20" viewBox="0 0 25 24">
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </span>
                          </p>
                          <div
                            className={`submenu relative rounded-xl bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-300 mt-2 border-l-2 border-[#5271FF]/20 ${
                              openIndex === index ? "block opacity-100 max-h-96" : "hidden opacity-0 max-h-0"
                            }`}
                          >
                            {menuItem.submenu.map((submenuItem, submenuIndex) => (
                              <Link
                                href={submenuItem.path}
                                key={submenuIndex}
                                className="block py-3 pl-6 pr-4 text-sm text-gray-700 hover:text-[#5271FF] dark:text-gray-300 dark:hover:text-[#5271FF] transition-all duration-200 ease-in-out transform hover:translate-x-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50"
                              >
                                <span className="flex items-center">
                                  <span className="w-1.5 h-1.5 bg-gradient-to-r from-[#5271FF] to-[#4361EE] rounded-full mr-3"></span>
                                  {submenuItem.title}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes ping-star {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
        }
        
        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
        
        /* Backdrop blur fallback */
        @supports not (backdrop-filter: blur(12px)) {
          .backdrop-blur-xl {
            background-color: rgba(255, 255, 255, 0.95);
          }
          .dark .backdrop-blur-xl {
            background-color: rgba(17, 24, 39, 0.95);
          }
        }
      `}</style>
    </>
  );
};

export default Header;
